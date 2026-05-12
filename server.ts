import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
// @ts-ignore
import { getAuth } from 'firebase-admin/auth';
// @ts-ignore
import admin from 'firebase-admin';
import { extractUserId, validateUserQuota } from './api/quota';

// Initialize Firebase Admin for Secure Verification
let isAdminInitialized = false;
try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        })
      });
      isAdminInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️ Firebase Admin credentials missing. Security will run in permissive mode.');
    }
  } else {
    isAdminInitialized = true;
  }
} catch (error: any) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
}

// Atomic Usage Tracking (Server-Side Source of Truth)
const trackUsage = async (userId: string | null | undefined, isImage: boolean) => {
  if (!userId || !isAdminInitialized) return;
  try {
    const db = admin.firestore();
    const batch = db.batch();
    
    // Update Daily Quota (V2)
    const quotaRef = db.collection('users').doc(userId).collection('quota').doc('daily');
    if (isImage) {
      batch.set(quotaRef, { multimediaUsed: admin.firestore.FieldValue.increment(1) }, { merge: true });
    } else {
      batch.set(quotaRef, { tokensUsed: admin.firestore.FieldValue.increment(1000) }, { merge: true }); // Default increment for chat if not specified
    }
    
    // Update Global Legacy Counter (V1)
    const userRef = db.collection('users').doc(userId);
    batch.set(userRef, { 
      [isImage ? 'imagesUsed' : 'queriesUsed']: admin.firestore.FieldValue.increment(1),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    await batch.commit();
    console.log(`[QUOTA] Successfully tracked ${isImage ? 'multimedia' : 'query'} for user ${userId}`);
  } catch (e) {
    console.error("[GEMINI PROXY] Usage tracking failed:", e);
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Single source of truth — reads version from package.json at runtime
const VERSION: string = JSON.parse(readFileSync('./package.json', 'utf-8')).version;


// Production Health Check
if (process.env.NODE_ENV === 'production') {
  const requiredEnv = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'OPENROUTER_API_KEY', 'FIREBASE_PRIVATE_KEY'];
  requiredEnv.forEach(v => {
    if (!process.env[v]) console.warn(`[SECURITY WARNING] Missing required ENV variable: ${v}`);
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 8080;
  
  // Startup health endpoint (before full init for Cloud Run)
  app.get('/_ready', (req, res) => {
    res.status(200).send('OK');
  });

// 1. Security Headers (CSP, HSTS, etc.)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.googleapis.com", "https://apis.google.com", "https://*.firebaseapp.com", "https://www.googletagmanager.com"],
        "connect-src": ["'self'", "https://*.catalizia.com", "https://openrouter.ai", "https://*.googleapis.com", "https://*.firebaseio.com", "wss://*.firebaseio.com", "https://*.firebaseapp.com", "https://*.google-analytics.com", "ws://localhost:*", "http://localhost:*"],
        "frame-src": ["'self'", "https://*.firebaseapp.com", "https://*.googleapis.com", "https://*.google.com", "https://*.google.com/accounts", "https://accounts.google.com"],
        "img-src": ["'self'", "data:", "https:", "blob:", "https://*.googleusercontent.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }));

  // 1b. Additional headers for Firebase popup auth
  app.use((req, res, next) => {
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');
    next();
  });

  // 2. CORS - Restrict to your domain in production
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://corporategpt.catalizia.com', 'https://www.catalizia.com', 'https://catalizia.com', 'https://corporate-gpt-prod-282195596392.northamerica-south1.run.app']
      : true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // 3. Rate Limiting - Prevent abuse
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // STRIPE WEBHOOK - Needs raw body for signature verification
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!sig || !endpointSecret) throw new Error('Missing signature or endpoint secret');
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`[WEBHOOK ERROR] ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan;
          const qty = session.metadata?.qty;

          if (userId) {
            console.log(`[PROVISIONING] Success for user ${userId} on plan ${plan}`);
            
            const userRef = admin.firestore().collection('users').doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data();

            // 3. Provisioning Logic per Plan
            const updateData: any = {
              subscriptionStatus: 'active',
              plan: plan,
              role: plan === 'Professional' ? 'admin' : 'user',
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            if (plan === 'Top-Up') {
              // Top-Up: Grant 25,000 purchased credits ($25 MXN worth of tokens)
              console.log(`[TOP-UP] Provisioning 25,000 credits for user ${userId}`);
              const quotaRef = userRef.collection('quota').doc('daily');
              await quotaRef.set({
                purchased_credits: admin.firestore.FieldValue.increment(25000),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
            } else if (plan === 'Family Mega') {
              console.log(`[BONUS] Provisioning Family Mega benefits for user ${userId}`);
              updateData.permissions = { corporate: true, junior: true };
              updateData.multimediaLimit = 50; // High limit for mega plan
            } else if (plan?.startsWith('Family')) {
              updateData.permissions = { corporate: true, junior: true };
            }

            await userRef.update(updateData);

            // 5. Send Confirmation Email (Simulation)
            console.log(`[EMAIL DISPATCH] Sending confirmation to ${session.customer_details?.email || userId}`);
            // In a real scenario, use Nodemailer, SendGrid, or AgentMail here.
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const users = await admin.firestore().collection('users').where('stripeSubscriptionId', '==', subscription.id).get();
          
          for (const doc of users.docs) {
            await doc.ref.update({
              subscriptionStatus: 'inactive',
              plan: 'Starter', // Downgrade to starter
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          console.log(`[SUBSCRIPTION] Cancelled for ${subscription.id}`);
          break;
        }
      }
      res.json({ received: true });
    } catch (error: any) {
      console.error(`[PROVISIONING ERROR]`, error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.use(express.json({ limit: '10mb' })); // Protect against large payloads

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('[STRIPE ERROR] STRIPE_SECRET_KEY is missing from environment variables!');
  }
  const stripe = new Stripe(stripeKey || '', {
    apiVersion: '2025-02-24-preview' as any,
  });

  // API Route to fetch models
  app.get('/api/models', async (req, res) => {
    try {
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'OpenRouter Chat Explorer',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check & Security Diagnostics
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      version: VERSION,
      security: {
        helmet: 'active',
        rateLimit: 'active',
        tls: 'enabled',
        csp: 'enforced'
      },
      timestamp: new Date().toISOString()
    });
  });

  // API Route to fetch credits
  app.get('/api/admin/credits', async (req, res) => {
    try {
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
      }

      const response = await fetch('https://openrouter.ai/api/v1/credits', {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch credits: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching credits:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Checkout Session Route
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { plan, qty, priceId, userId } = req.body;
      const planPrices: Record<string, string> = {
        'Starter': process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
        'Professional': process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional_placeholder',
        'Top-Up': process.env.STRIPE_PRICE_TOPUP || 'price_topup_placeholder',
        'Family Starter': process.env.STRIPE_PRICE_FAMILY_STARTER || 'price_family_starter_placeholder',
        'Family Mega': process.env.STRIPE_PRICE_FAMILY_MEGA || 'price_family_mega_placeholder',
        'Junior Solo': process.env.STRIPE_PRICE_JUNIOR_SOLO || 'price_junior_solo_placeholder'
      };

      const selectedPrice = planPrices[plan] || priceId;
      console.log(`[STRIPE] Creating session for plan: ${plan}, priceId: ${selectedPrice}, userId: ${userId}`);

      if (!selectedPrice || selectedPrice.includes('placeholder')) {
        console.error(`[STRIPE ERROR] Invalid price ID for plan ${plan}: ${selectedPrice}`);
        return res.status(400).json({ error: `Configuración incompleta para el plan ${plan}. Por favor contacta soporte.` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: selectedPrice,
            quantity: plan === 'Professional' ? Math.max(10, parseInt(qty || '10')) : 1,
          },
        ],
        mode: plan === 'Top-Up' ? 'payment' : 'subscription',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing`,
        metadata: {
          plan: plan,
          qty: qty?.toString() || '1',
          userId: userId || 'anonymous',
          role: plan === 'Professional' ? 'admin' : 'user'
        }
      });

      console.log(`[STRIPE] Session created: ${session.id}`);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('[STRIPE ERROR]:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for chat completions
  app.post('/api/chat', async (req, res) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout for primary engine

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      
      if (isAdminInitialized) {
        try {
          await admin.auth().verifyIdToken(idToken); 
        } catch (authError: any) {
          console.warn('[AUTH WARNING] Token verification failed:', authError.message);
        }
      }

      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'OPENROUTER_API_KEY is missing on the server' });
      }

      const { model, messages, userId, instructions, temperature, maxTokens, deepThink, webSearch, docsOnly } = req.body;
      const currentTime = new Date().toISOString();

      // Basic Safety Guardrails
      const lastMessage = messages[messages.length - 1]?.content || '';
      const forbiddenPatterns = [/ignore previous instructions/i, /system prompt/i, /dan mode/i, /bypass safety/i, /sql injection/i, /generate malware/i];
      if (forbiddenPatterns.some(pattern => pattern.test(lastMessage))) {
        return res.status(403).json({ error: "SAFETY_VIOLATION", reason: "Forbidden keywords detected." });
      }

      let systemContent = `You are Catalizia CorporateGPT, a premium corporate AI assistant. Current time: ${currentTime}. Always prioritize data privacy and corporate security.`;
      if (instructions) systemContent += `\n\nSpecific Persona Instructions:\n${instructions}`;
      if (deepThink) systemContent += `\n\n[REASONING MODE ENABLED]: Think step-by-step in extreme detail.`;
      
      const tools = webSearch ? [{ google_search: {} }] : undefined;
      if (webSearch) systemContent += `\n\n[SEARCH MODE ENABLED]: Use the google_search tool to find real-world data and verified facts.`;

      console.log(`[API/CHAT] Requesting model: ${model || 'google/gemini-2.0-flash-001'}`);

      const fallbackModels = [
        model || 'google/gemini-2.0-flash-001',
        'anthropic/claude-3.5-sonnet:beta',
        'openai/gpt-4o',
        'google/gemini-2.0-pro-exp-02-05:free',
        'mistralai/mistral-large'
      ];

      let lastError = null;
      for (const currentModel of fallbackModels) {
        try {
          console.log(`[API/CHAT] Trying Option: ${currentModel}`);
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': process.env.APP_URL || 'https://corporategpt.catalizia.com',
              'X-Title': 'Catalizia CorporateGPT',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: currentModel,
              messages: [{ role: 'system', content: systemContent }, ...messages],
              temperature: temperature ?? 0.7,
              max_tokens: maxTokens ?? 4000,
              tools: currentModel.includes('gemini') ? tools : undefined
            }),
            signal: controller.signal
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Model ${currentModel} failed`);
          }

          const data = await response.json();
          if (userId) await trackUsage(userId, false);
          
          clearTimeout(timeout);
          return res.json({ ...data, modelUsed: currentModel });

        } catch (err: any) {
          console.warn(`[API/CHAT] Option ${currentModel} failed:`, err.message);
          lastError = err.message;
        }
      }

      throw new Error(`All Chat models failed. Last error: ${lastError}`);

    } catch (error: any) {
      clearTimeout(timeout);
      const isTimeout = error.name === 'AbortError';
      console.error(`Chat error [API/CHAT]: ${isTimeout ? 'TIMEOUT' : error.message}`);
      res.status(isTimeout ? 504 : 500).json({ 
        error: isTimeout ? 'Request timed out' : error.message,
        isTimeout 
      });
    }
  });

  // API Route for emergency fallback
  app.post('/api/fallback', async (req, res) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      console.log('[FALLBACK] Emergency failover triggered.');
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      if (isAdminInitialized) {
        try { await admin.auth().verifyIdToken(idToken); } catch (e: any) {
          console.warn('[FALLBACK AUTH WARNING]:', e.message);
        }
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('[FALLBACK ERROR]: GEMINI_API_KEY missing');
        return res.status(500).json({ error: 'Fallback engine key missing' });
      }

      const { model, messages, instructions, temperature } = req.body;
      let requestedModel = model || 'gemini-2.0-flash';
      if (requestedModel === 'gemini-1.5-flash') requestedModel = 'gemini-1.5-flash-latest';
      if (requestedModel === 'gemini-1.5-pro') requestedModel = 'gemini-1.5-pro-latest';
      
      const fallbackModels = [
        requestedModel,
        'gemini-2.0-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest'
      ];

      let lastError = null;
      for (const targetModel of fallbackModels) {
        try {
          console.log(`[FALLBACK] Attempting Engine: ${targetModel}`);
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
              })),
              generationConfig: { temperature: temperature ?? 0.7 },
              systemInstruction: instructions ? { parts: [{ text: instructions }] } : undefined
            }),
            signal: controller.signal
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `Fallback ${targetModel} failed`);
          }

          const result = await response.json();
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          if (!text) throw new Error(`Empty response from ${targetModel}`);

          console.log(`[FALLBACK] SUCCESS via ${targetModel}`);
          clearTimeout(timeout);
          
          const { userId } = req.body;
          if (userId) await trackUsage(userId, false);
          
          return res.json({ text, modelUsed: targetModel });

        } catch (err: any) {
          console.warn(`[FALLBACK] Engine ${targetModel} failed:`, err.message);
          lastError = err.message;
        }
      }

      throw new Error(`All emergency fallback engines failed. Last error: ${lastError}`);

    } catch (error: any) {
      clearTimeout(timeout);
      const isTimeout = error.name === 'AbortError';
      console.error('[FALLBACK CRITICAL]:', isTimeout ? 'TIMEOUT' : error.message);
      res.status(isTimeout ? 504 : 500).json({ 
        error: isTimeout ? 'Fallback timeout' : error.message,
        isTimeout
      });
    }
  });

  // API Route for Google Gemini Direct Proxy (Local Dev)
  app.post('/api/gemini', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing in local server' });
      }

      let { action, payload } = req.body;
      
      if (!payload && action) {
        const { action: _, ...rest } = req.body;
        payload = rest;
      }

      if (!action || !payload) {
        return res.status(400).json({ error: 'Missing action or payload' });
      }

      const userId = payload.userId || extractUserId(req as any);
      let fairUseLimit = false;
      let finalModel = payload.model;

      if (userId) {
        try {
          const q = await validateUserQuota(userId);
          fairUseLimit = q.fairUseLimit;
          if (fairUseLimit && payload.model?.includes('pro')) {
            finalModel = 'gemini-2.0-flash';
          }
        } catch (e) {
          console.warn("[GEMINI] Quota check failed:", e);
        }
      }

      // 4. Handle Imagen image generation
      if (action === 'generateImage' || (payload.model && (payload.model.startsWith('imagen-') || payload.model.includes('/')))) {
          let optimizedPrompt = payload.prompt;
          try {
            const enhanceResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: `Research and expand the following image prompt into a highly detailed, professional description for an AI image generator. 
                CRITICAL REQUIREMENT: Use your SEARCH TOOL to find EXACT factual details about any specific characters, entities, or styles mentioned (e.g. Spider-Man Noir costume details, specific color palettes, historical textures).
                Prompt: ${payload.prompt}` }] }],
                tools: [{ google_search: {} }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
              })
            });
            if (enhanceResponse.ok) {
              const enhanceResult = await enhanceResponse.json();
              const enhancedText = enhanceResult.candidates?.[0]?.content?.parts?.[0]?.text;
              if (enhancedText) optimizedPrompt = enhancedText;
              console.log("[IMAGEN] Prompt enhanced with search successfully.");
            } else {
              const errTxt = await enhanceResponse.text();
              console.warn("[IMAGEN] Prompt enhancement API error:", errTxt);
            }
          } catch (e) {
            console.warn("[IMAGEN] Prompt enhancement failed:", e);
          }

          const IMAGE_MODELS = [
            finalModel && finalModel.startsWith('imagen') ? finalModel : null,
            'imagen-3.0-generate-001',
            'imagen-4.0-fast-generate-001'
          ].filter(Boolean) as string[];

          let lastError = null;
          for (const model of IMAGE_MODELS) {
            try {
              console.log(`[IMAGEN] Attempting Model: ${model}`);
              const instance: any = { prompt: optimizedPrompt };
              if (payload.sourceImage) instance.image = { bytesBase64Encoded: payload.sourceImage };
              
              const parameters: any = { 
                sampleCount: 1, 
                aspectRatio: payload.aspectRatio || '1:1' 
              };

              if (payload.maskImage) {
                // Modern structure
                parameters.maskConfig = {
                  mask: { image: { bytesBase64Encoded: payload.maskImage } }
                };
                parameters.editConfig = {
                  editMode: 'inpainting-insert'
                };
                // Compatibility structure
                parameters.mask = { image: { bytesBase64Encoded: payload.maskImage } };
                parameters.editMode = 'inpainting-insert';
              }
              
              const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instances: [instance], parameters })
              });

              if (response.ok) {
                const result = await response.json();
                if (result.predictions?.[0]?.bytesBase64Encoded || result.imageBase64) {
                  await trackUsage(userId, true);
                  return res.status(200).json(result);
                }
                console.warn(`[IMAGEN] ${model} returned empty prediction`);
              } else {
                const errBody = await response.json().catch(() => ({}));
                lastError = errBody.error?.message || `Status ${response.status}`;
                console.error(`[IMAGEN] ${model} API Error:`, lastError);
              }
            } catch (err: any) {
              lastError = err.message;
              console.error(`[IMAGEN] ${model} Request Error:`, err.message);
            }
          }
          return res.status(500).json({ error: 'IMAGE_GEN_FAILED', details: lastError || 'All models exhausted' });
      }

      // 5. Handle Content Generation (Chat & Research)
      if (action === 'generateContent') {
          const generationConfig = payload.config || payload.generationConfig || {};
          const { systemInstruction, ...restConfig } = generationConfig;
          
          let requestedChatModel = payload.model || 'gemini-2.0-flash';
          if (requestedChatModel === 'gemini-1.5-flash') requestedChatModel = 'gemini-1.5-flash-latest';
          if (requestedChatModel === 'gemini-1.5-pro') requestedChatModel = 'gemini-1.5-pro-latest';

          const CHAT_MODELS = [
            requestedChatModel,
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash'
          ];

          let lastError = null;
          for (const model of CHAT_MODELS) {
            try {
              console.log(`[GEMINI PROXY] Trying Corporate Option: ${model}`);
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: payload.contents,
                  generationConfig: {
                    ...restConfig,
                    responseMimeType: restConfig.responseMimeType || "application/json"
                  },
                  systemInstruction: payload.systemInstruction || systemInstruction ? { parts: [{ text: payload.systemInstruction || systemInstruction }] } : undefined,
                  tools: (payload.tools || (payload.webSearch ? [{ google_search: {} }] : undefined))?.map((t: any) => t.googleSearch ? { google_search: t.googleSearch } : t)
                })
              });

              if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Model ${model} failed`);
              }

              const result = await response.json();
              const hasImage = result.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
              await trackUsage(userId, !!hasImage);

              let rawText = '';
              if (result.candidates?.[0]?.content?.parts) {
                rawText = result.candidates[0].content.parts.map((p: any) => p.text || '').join('').trim();
              }

              const cleanJson = (rawText || '').replace(/```json/g, '').replace(/```/g, '').trim();
              let parsedFields = {};
              try { if (cleanJson) parsedFields = JSON.parse(cleanJson); } catch (e) {}

              return res.status(200).json({ 
                text: rawText, 
                ...parsedFields,
                candidates: result.candidates,
                modelUsed: model
              });
            } catch (err: any) {
              lastError = err.message;
              console.warn(`[GEMINI PROXY] Option ${model} failed:`, err.message);
              continue;
            }
          }

          // OpenRouter Failover
          if (process.env.OPENROUTER_API_KEY) {
            try {
              const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.0-flash',
                  messages: payload.contents.map((m: any) => ({
                    role: m.role === 'model' ? 'assistant' : m.role,
                    content: m.parts[0].text
                  })),
                  temperature: restConfig.temperature || 0.7
                })
              });
              const orResult = await orResponse.json();
              if (orResponse.ok) {
                const text = orResult.choices?.[0]?.message?.content || '';
                return res.status(200).json({ text, modelUsed: 'openrouter/failover' });
              }
            } catch (e) {}
          }
          return res.status(500).json({ error: 'GEN_FAILED', details: lastError });
      }

      return res.status(400).json({ error: 'Unknown action' });
    } catch (error: any) {
      console.error('Gemini proxy error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 7. TECHIE PROXY (Simplified) ---
  app.post('/api/techie', async (req, res) => {
    const userId = await extractUserId(req);
    const { action, payload } = req.body;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'OPENROUTER_KEY_MISSING' });

    try {
      if (action === 'chat' || action === 'generateContent') {
        const model = payload.model || 'google/gemini-2.0-flash-001';
        const messages = payload.contents || payload.history || [];
        const formattedMessages = messages.map((m: any) => ({
          role: m.role === 'model' ? 'assistant' : m.role,
          content: typeof m.parts?.[0]?.text === 'string' ? m.parts[0].text : m.content
        }));

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://catalizia.com',
            'X-Title': 'Catalizia Techie'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: payload.systemInstruction || 'You are Techie, a helpful assistant.' },
              ...formattedMessages
            ],
            temperature: payload.temperature || 0.7
          }),
          signal: controller.signal
        });

        if (response.ok) {
          const result = await response.json();
          await trackUsage(userId, false);
          const text = result.choices?.[0]?.message?.content || '';
          clearTimeout(timeout);
          return res.status(200).json({ text, modelUsed: model });
        }
      }

      // Handle Pro Image for Slide generation with research capability
      if (action === 'generateProImageForSlide') {
        const { 
          title, 
          subtitle, 
          content, 
          style, 
          chartType = 'none', 
          tableData = '', 
          userImage, 
          layout = 'split', 
          paragraphs, 
          imagePrompt, 
          excelData, 
          additionalImages, 
          researchContext 
        } = payload;

        let optimizedPrompt = imagePrompt || `${title}: ${subtitle}. Content: ${content.join(', ')}. Style: ${style}`;
        
        // Perform research if context provided or if no image prompt exists
        if (researchContext || (!imagePrompt && content.length > 0)) {
          try {
            console.log('[PRO-IMAGE] Performing research for prompt enhancement...');
            const researchPrompt = researchContext || 
              `Research and provide current, accurate information about: ${title} ${subtitle}. Focus on visual design elements, color schemes, and layout best practices for ${style} style presentations.`;
            
            const enhanceResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ 
                  role: 'user', 
                  parts: [{ 
                    text: `You are a professional presentation designer and visual content researcher. 
CRITICAL REQUIREMENT: Use your SEARCH TOOL to find current, accurate information about:
Topic: ${researchPrompt}
Style: ${style}
Focus: Visual design elements, color schemes, layout best practices, current trends, and accurate factual details

Enhance this image prompt with research-backed, detailed visual descriptions:` 
                  }] 
                }],
                tools: [{ google_search: {} }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
              })
            });

            if (enhanceResponse.ok) {
              const enhanceResult = await enhanceResponse.json();
              const enhancedText = enhanceResult.candidates?.[0]?.content?.parts?.[0]?.text;
              if (enhancedText) {
                optimizedPrompt = enhancedText;
                console.log('[PRO-IMAGE] Prompt enhanced with research successfully.');
              }
            } else {
              console.warn('[PRO-IMAGE] Prompt enhancement API error:', await enhanceResponse.text());
            }
          } catch (e) {
            console.warn('[PRO-IMAGE] Prompt enhancement failed:', e);
          }
        }

        try {
          // Use Imagen model for professional image generation
          const IMAGE_MODELS = [
            'imagen-3.0-generate-001',
            'imagen-4.0-fast-generate-001'
          ];

          let lastError = null;
          for (const model of IMAGE_MODELS) {
            try {
              const instance: any = { prompt: optimizedPrompt };
              if (userImage) instance.image = { bytesBase64Encoded: userImage };
              
              const parameters: any = { 
                sampleCount: 1, 
                aspectRatio: layout === 'split' ? '16:9' : '1:1'
              };

              const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  instances: [instance], 
                  parameters 
                })
              });

              if (response.ok) {
                const result = await response.json();
                if (result.predictions?.[0]?.bytesBase64Encoded || result.imageBase64) {
                  await trackUsage(userId, true);
                  clearTimeout(timeout);
                  return res.status(200).json({ 
                    imageUrl: result.predictions?.[0]?.bytesBase64Encoded,
                    enhancedPrompt: optimizedPrompt,
                    modelUsed: model
                  });
                }
              } else {
                const errBody = await response.json().catch(() => ({}));
                lastError = errBody.error?.message || `Status ${response.status}`;
              }
            } catch (err: any) {
              lastError = err.message;
            }
          }

          throw new Error(`All image models exhausted. Last error: ${lastError}`);
        } catch (err: any) {
          clearTimeout(timeout);
          return res.status(500).json({ error: err.message });
        }
      }

      // Handle Techie Image generation with educational research capability
      if (action === 'generateImage') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return res.status(500).json({ error: 'GEMINI_API_KEY is missing in local server' });
        }

        const { 
          prompt, 
          aspectRatio, 
          grade, 
          userName,
          style = 'none', 
          lighting = 'none',
          embeddedText,
          imageSize = '1K',
          sourceImage,
          customKey,
          researchContext 
        } = payload;

        if (!prompt) {
          return res.status(400).json({ error: 'Prompt is required for image generation' });
        }

        let optimizedPrompt = prompt;

        // Perform educational research to enhance prompt accuracy
        if (!researchContext && prompt) {
          try {
            console.log('[TECHIE IMAGE] Performing educational research for prompt enhancement...');
            
            const researchPrompt = `Educational content about: ${prompt}. Student Level: ${grade?.name || 'unknown'}. Focus: Age-appropriate, accurate, and engaging educational content.`;
            
            const enhanceResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ 
                  role: 'user', 
                  parts: [{ 
                    text: `You are an Educational Content Research Specialist. 

Research and provide current, accurate educational information about:
Topic: ${researchPrompt}
Style: ${style !== 'none' ? style : 'Standard educational'}
Focus: Educational content accuracy and age-appropriate details

Enhance the image prompt with educational research and age-appropriate details:` 
                  }] 
                }],
                tools: [{ google_search: {} }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
              })
            });

            if (enhanceResponse.ok) {
              const enhanceResult = await enhanceResponse.json();
              const enhancedText = enhanceResult.candidates?.[0]?.content?.parts?.[0]?.text;
              if (enhancedText) {
                optimizedPrompt = enhancedText;
                console.log('[TECHIE IMAGE] Prompt enhanced with educational research successfully.');
              }
            } else {
              console.warn('[TECHIE IMAGE] Educational research API error:', await enhanceResponse.text());
            }
          } catch (e) {
            console.warn('[TECHIE IMAGE] Educational research failed:', e);
          }
        }

        // Use OpenRouter for actual image generation after research
        try {
          const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'black-forest-labs/flux-1-schnell',
              prompt: optimizedPrompt,
              aspect_ratio: aspectRatio || '16:9'
            })
          });

          if (response.ok) {
            const result = await response.json();
            const imageUrl = result.data?.[0]?.url;
            clearTimeout(timeout);
            await trackUsage(userId, true);
            return res.status(200).json({ 
              url: imageUrl, 
              enhancedPrompt: optimizedPrompt,
              modelUsed: 'flux-1-schnell' 
            });
          } else {
            throw new Error('Image generation failed');
          }
        } catch (err: any) {
          clearTimeout(timeout);
          return res.status(500).json({ error: err.message });
        }
      }

      clearTimeout(timeout);
      return res.status(400).json({ error: 'Unknown action or model failed' });
    } catch (err: any) {
      clearTimeout(timeout);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for Image Editing
  app.post('/api/image/edit', async (req, res) => {
    try {
      const { originalImage, maskImage, prompt, template } = req.body;
      const fullPrompt = template ? `${prompt}. ${template}` : prompt;
      const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'black-forest-labs/flux-1-schnell',
          prompt: `Edit: ${fullPrompt}. Keep unmasked parts same.`,
          aspect_ratio: '16:9'
        })
      });

      if (!response.ok) throw new Error('Image editing failed');
      const result = await response.json();
      return res.status(200).json({ editedImage: result.data?.[0]?.url, modelUsed: 'flux-1-schnell' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/image/generate', async (req, res) => {
    try {
      const { prompt, model, aspectRatio } = req.body;
      const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: model || 'black-forest-labs/flux-1-schnell',
          prompt: prompt,
          aspect_ratio: aspectRatio || '1:1'
        })
      });
      if (!response.ok) throw new Error('Image generation failed');
      const result = await response.json();
      return res.status(200).json({ imageUrl: result.data?.[0]?.url, modelUsed: model });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite/Static middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const htmlPath = path.join(distPath, 'index.html');
      let html = readFileSync(htmlPath, 'utf-8');
      
      // Inject runtime environment variables for the frontend
      const envConfig = {
        VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
        VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID
      };
      
      const scriptInjection = `<script>window.ENV_CONFIG = ${JSON.stringify(envConfig)};</script>`;
      html = html.replace('</head>', `${scriptInjection}</head>`);
      
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
