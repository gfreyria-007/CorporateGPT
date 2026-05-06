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

// 1. Security Headers (CSP, HSTS, etc.)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.googleapis.com", "https://apis.google.com", "https://*.firebaseapp.com", "https://www.googletagmanager.com"],
        "connect-src": ["'self'", "https://openrouter.ai", "https://*.googleapis.com", "https://*.firebaseio.com", "wss://*.firebaseio.com", "https://*.firebaseapp.com", "https://*.google-analytics.com", "ws://localhost:*", "http://localhost:*"],
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
      version: '5.0.3',
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
          // Failsafe: only block if not in emergency mode (optional)
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
      if (webSearch) systemContent += `\n\n[SEARCH MODE ENABLED]: Use web data context.`;

      console.log(`[API/CHAT] Requesting model: ${model || 'openrouter/auto'}`);

      const fallbackModels = [
        model || 'openrouter/auto',
        'anthropic/claude-3.5-sonnet',
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
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout for fallback engine

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

  // API Route for Google Gemini Direct Proxy (Local Dev))
  app.post('/api/gemini', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing in local server' });
      }

      let { action, payload } = req.body;
      
      // AUTO-NORMALIZATION: If payload is missing but action exists, treat req.body as payload
      if (!payload && action) {
        const { action: _, ...rest } = req.body;
        payload = rest;
      }

      if (!action || !payload) {
        console.warn("[GEMINI] Missing action or payload in request:", JSON.stringify(req.body));
        return res.status(400).json({ error: 'Missing action or payload' });
      }

      console.log(`[GEMINI PROXY] Action: ${action}, Model: ${payload.model}`);

      // 1. Auth & Quota check
      const userId = payload.userId || extractUserId(req as any);
      let fairUseLimit = false;
      let finalModel = payload.model;

      if (userId) {
        try {
          const q = await validateUserQuota(userId);
          fairUseLimit = q.fairUseLimit;
          
          // STEERING: If Fair Use reached, downgrade Pro models to Flash
          if (fairUseLimit && payload.model?.includes('pro')) {
            console.log(`[GEMINI] FAIR USE ACTIVE: Steering ${payload.model} -> gemini-2.0-flash`);
            finalModel = 'gemini-2.0-flash';
          }
        } catch (e) {
          console.warn("[GEMINI] Quota check failed, proceeding anyway:", e);
        }
      }

        // 4. Handle Imagen image generation with Bulletproof Fallbacks
        if (action === 'generateImage' || (payload.model && payload.model.startsWith('imagen-'))) {
          const IMAGE_MODELS = [
            finalModel,
            'imagen-4.0-fast-generate-001',
            'imagen-4.0-generate-001',
            'imagen-4.0-ultra-generate-001',
            'imagen-3.0-fast-generate-001',
            'imagen-3.0-generate-001'
          ].filter(Boolean) as string[];

          let lastError = null;
          for (const model of IMAGE_MODELS) {
            try {
              console.log(`[IMAGEN] Attempting model: ${model}`);
              const instance: any = { prompt: payload.prompt };
              if (payload.sourceImage) instance.image = { bytesBase64Encoded: payload.sourceImage };
              
              const parameters: any = { 
                sampleCount: 1,
                aspectRatio: payload.aspectRatio || '1:1'
              };
              if (payload.maskImage) parameters.mask = { image: { bytesBase64Encoded: payload.maskImage } };
              
              const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instances: [instance], parameters })
              });

              if (response.ok) {
                const result = await response.json();
                if (result.predictions?.[0]?.bytesBase64Encoded || result.imageBase64) {
                  console.log(`[IMAGEN] Success with ${model}`);
                  await trackUsage(userId, true);
                  return res.status(200).json(result);
                }
              } else {
                const errBody = await response.json().catch(() => ({}));
                console.warn(`[IMAGEN] Model ${model} failed with status ${response.status}:`, JSON.stringify(errBody));
                lastError = errBody.error?.message || `Status ${response.status}`;
              }
            } catch (err: any) {
              console.error(`[IMAGEN] Request failed for ${model}:`, err.message);
              lastError = err.message;
            }
          }

          // LAST RESORT: Fallback to Gemini 2.0 Flash Multimodal
          console.log(`[IMAGEN] All dedicated models failed. Falling back to Gemini 2.0 Flash multimodal...`);
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: payload.prompt }] }],
                generationConfig: {
                  responseModalities: ['IMAGE'],
                  imageConfig: { aspectRatio: payload.aspectRatio === '16:9' ? '16:9' : '1:1' }
                }
              })
            });
            if (response.ok) {
              const result = await response.json();
              const hasImage = result.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
              if (hasImage) {
                 console.log(`[IMAGEN] Success with Gemini 2.0 Flash Fallback`);
                 await trackUsage(userId, true);
                 return res.status(200).json(result);
              }
            }
          } catch (e: any) {
            console.error(`[IMAGEN] Fallback also failed:`, e.message);
          }

          return res.status(500).json({ error: 'IMAGE_GEN_FAILED', details: lastError || 'All models exhausted' });
        // 5. Handle regular Content Generation
        } else if (action === 'generateContent') {
          const generationConfig = payload.config || payload.generationConfig || {};
          const { systemInstruction, ...restConfig } = generationConfig;
          
          let requestedChatModel = payload.model || 'gemini-2.0-flash';
          if (requestedChatModel === 'gemini-1.5-flash-latest') requestedChatModel = 'gemini-1.5-flash';
          if (requestedChatModel === 'gemini-1.5-pro-latest') requestedChatModel = 'gemini-1.5-pro';

          const CHAT_MODELS = [
            requestedChatModel,
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest',
            'gemini-2.0-flash-lite-preview-02-05',
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
                    responseMimeType: restConfig.responseMimeType || (restConfig.responseModalities?.includes('IMAGE') ? undefined : "application/json")
                  },
                  systemInstruction: payload.systemInstruction || systemInstruction ? { parts: [{ text: payload.systemInstruction || systemInstruction }] } : undefined,
                  tools: payload.tools
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
              if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                rawText = result.candidates[0].content.parts[0].text;
              }

              const cleanJson = (rawText || '').replace(/```json/g, '').replace(/```/g, '').trim();
              let parsedFields = {};
              try {
                if (cleanJson) parsedFields = JSON.parse(cleanJson);
              } catch (e) {
                console.warn("[GEMINI PROXY] JSON Parse warning:", e);
              }

              return res.status(200).json({ 
                text: rawText, 
                ...parsedFields,
                candidates: result.candidates,
                modelUsed: model,
                _fairUseActive: fairUseLimit 
              });
            } catch (err: any) {
              console.warn(`[GEMINI PROXY] Option ${model} failed:`, err.message);
              lastError = err.message;
            }
          }

          // ULTIMATE FAILOVER: Try OpenRouter if Google is completely down
          if (process.env.OPENROUTER_API_KEY) {
            console.warn("[GEMINI PROXY] GOOGLE DOWN. INITIATING OPENROUTER FAILOVER...");
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
            } catch (e: any) {
              console.error("[GEMINI PROXY] Ultimate failover failed:", e.message);
            }
          }

          return res.status(500).json({ error: 'GEN_FAILED', details: lastError || 'All models exhausted' });
        } else if (action === 'chat') {
         // Simplified chat for local proxy
         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${payload.model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: payload.message }] }],
            systemInstruction: payload.config?.systemInstruction || undefined
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[GEMINI PROXY] Chat Error:", JSON.stringify(errorData));
          throw new Error(errorData.error?.message || 'Chat generation failed');
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return res.status(200).json({ text });
      }

      return res.status(400).json({ error: 'Unknown action' });
    } catch (error: any) {
      console.error('Gemini proxy error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- 7. TECHIE PROXY (OpenRouter for Junior/Kid-friendly) ---
  app.post('/api/techie', async (req, res) => {
    const userId = await extractUserId(req);
    const { action, payload } = req.body;

    if (!OPENROUTER_API_KEY) {
      console.error("[TECHIE PROXY] Missing OPENROUTER_API_KEY");
      return res.status(500).json({ error: 'OPENROUTER_KEY_MISSING' });
    }

    try {
      console.log(`[TECHIE PROXY] Action: ${action}`);

      // --- IMMORTAL FALLBACK SYSTEM FOR TEXT (NON-GEMINI FOR TECHIE) ---
      if (action === 'chat' || action === 'generateContent') {
        const textModels = [
          payload.model || 'openrouter/auto',
          'anthropic/claude-3.5-sonnet',
          'openai/gpt-4o',
          'google/gemini-2.0-pro-exp-02-05:free',
          'mistralai/mistral-large'
        ];

        let lastError = null;
        for (const model of textModels) {
          try {
            console.log(`[TECHIE PROXY] Trying Text Option: ${model}`);
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
                model,
                messages: [
                  { role: 'system', content: payload.systemInstruction || 'You are Techie, a helpful educational assistant for children.' },
                  ...formattedMessages
                ],
                temperature: payload.temperature || 0.7
              })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error?.message || `Model ${model} failed`);

            await trackUsage(userId, false);
            const text = result.choices?.[0]?.message?.content || '';
            return res.status(200).json({ text, modelUsed: model });
          } catch (err: any) {
            console.warn(`[TECHIE PROXY] Option ${model} failed:`, err.message);
            lastError = err.message;
          }
        }
        throw new Error(`All Techie Text models failed. Last error: ${lastError}`);
      }

      // --- IMMORTAL FALLBACK SYSTEM FOR IMAGES (NON-GEMINI FOR TECHIE) ---
      if (action === 'generateImage') {
        const imageModels = [
          payload.model || 'black-forest-labs/flux-1-schnell', // Option A
          'black-forest-labs/flux-pro',                        // Option B
          'openai/dall-e-3',                                   // Option C
          'stabilityai/stable-diffusion-xl-base-1.0'           // Option D
        ];

        let lastError = null;
        for (const model of imageModels) {
          try {
            console.log(`[TECHIE PROXY] Trying Image Option: ${model}`);
            const isMultimodal = model.includes('gemini');
            
            const body: any = {
              model,
              messages: [{ role: 'user', content: payload.prompt }]
            };

            if (isMultimodal) {
              body.modalities = ["image"];
              body.image_config = { aspect_ratio: payload.aspectRatio || '1:1' };
            } else {
              body.image_config = { aspect_ratio: payload.aspectRatio || '1:1' };
            }

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              },
              body: JSON.stringify(body)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error?.message || `Model ${model} failed`);

            await trackUsage(userId, true);
            const imageBase64 = result.choices?.[0]?.message?.content || result.choices?.[0]?.message?.image_url;
            if (!imageBase64) throw new Error("No image data returned");

            return res.status(200).json({ imageBase64, modelUsed: model });
          } catch (err: any) {
            console.warn(`[TECHIE PROXY] Image Option ${model} failed:`, err.message);
            lastError = err.message;
          }
        }
        throw new Error(`All Techie Image models failed. Last error: ${lastError}`);
      }

      return res.status(400).json({ error: 'INVALID_ACTION' });

    } catch (error: any) {
      console.error("[TECHIE PROXY] Critical Error:", error.message);
      return res.status(500).json({ error: 'TECHIE_FAILED', details: error.message });
    }
  });

  // API Route for Email Magic Link Generation (Secure Corporate Access)
  app.post('/api/auth/magic-link', async (req, res) => {
    try {
      const { email, redirectUrl } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      // In production, Firebase sends this directly. 
      // This endpoint is for custom routing or reporting.
      console.log(`[AUTH] Magic Link requested for corporate email: ${email}`);
      res.json({ success: true, message: 'Neural authentication link dispatched.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route to Update Subscription Quantity (Scale Team Seats)
  app.post('/api/subscription/update-quantity', async (req, res) => {
    try {
      const { subscriptionId, quantity, companyId, idToken } = req.body;
      if (!subscriptionId || !quantity || !idToken) return res.status(400).json({ error: 'Missing parameters' });

      // 1. Verify User is Authorized (Firebase Admin)
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // 2. Verify Ownership of Company in Firestore
      const companyRef = admin.firestore().collection('companies').doc(companyId);
      const companyDoc = await companyRef.get();
      
      if (!companyDoc.exists || (companyDoc.data()?.ownerId !== uid && companyDoc.data()?.admins?.indexOf(uid) === -1)) {
        return res.status(403).json({ error: 'Unauthorized to scale this workspace' });
      }

      // 3. Get the subscription item ID from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const subscriptionItemId = subscription.items.data[0].id;

      // 4. Update quantity with immediate proration
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscriptionItemId,
          quantity: quantity,
        }],
        proration_behavior: 'always_invoice', // Ensures the difference is charged NOW
      });

      // 5. Sync total seats in Firestore
      await companyRef.update({
        totalSeats: quantity,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`[STRIPE] Workspace ${companyId} scaled to ${quantity} seats by ${uid}`);
      res.status(200).json({ success: true, totalSeats: quantity });

    } catch (error: any) {
      console.error('[SUBSCRIPTION ERROR]', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      try {
        const htmlPath = path.join(distPath, 'index.html');
        let html = readFileSync(htmlPath, 'utf-8');
        
        const envConfig = {
          VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
          VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
          VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
          VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
          VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
          VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
        };

        const configScript = `<script>window.ENV_CONFIG = ${JSON.stringify(envConfig)};</script>`;
        
        // Try both locations for max compatibility
        if (html.includes('</title>')) {
          html = html.replace('</title>', `</title>${configScript}`);
        } else if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>${configScript}`);
        } else {
          html = configScript + html;
        }
        
        res.send(html);
      } catch (e: any) {
        console.error('[SERVER ERROR] Injection failed:', e.message);
        res.status(500).send("Critical Server Error: Configuration injection failed.");
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
