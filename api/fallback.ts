/**
 * api/fallback.ts — Emergency Fallback Engine
 * Corporate GPT V2 — Gateway of Immortality
 *
 * This endpoint is the "always-on" safety net.
 * It routes directly to Gemini 1.5 Flash, which is Google's
 * fastest and most available model, bypassing OpenRouter entirely.
 *
 * Called automatically by failsafeRouter.ts when:
 *   - Primary /api/chat returns HTTP 5xx
 *   - Primary /api/chat exceeds 6-second timeout
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserQuota, consumeServerQuota } from './quota';
import { checkRateLimit, getIdentifier } from './rateLimit';
import { logger, extractUserIdFromRequest } from './logger';

const FALLBACK_MODEL = 'gemini-1.5-flash-latest';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // ─── Rate Limiting ─────────────────────────────────────────────────────────
  const rateLimitId = getIdentifier(req);
  const rateCheck = checkRateLimit(rateLimitId);
  
  if (!rateCheck.allowed) {
    const { userId: fallbackUserId } = extractUserIdFromRequest(req);
logger.security('Rate limit exceeded on fallback', { rateLimitId }, fallbackUserId);
    return res.status(429).json({ 
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Por favor espera un momento.',
      retryAfter: Math.ceil(rateCheck.resetIn / 1000)
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.system('CRITICAL: GEMINI_API_KEY missing - fallback offline');
    return res.status(503).json({ error: 'Fallback engine offline — API key missing' });
  }
  console.log(`[DIAGNOSTIC] Gemini Key Length: ${apiKey.length}`);

  // Extract userId for logging (declared outside try for catch block access)
  let validatedUserId: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const idToken = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      validatedUserId = decoded.uid || decoded.user_id || req.body?.userId || null;
    } catch {
      validatedUserId = req.body?.userId || null;
    }
  }

  try {
    const { messages, instructions, temperature, model } = req.body;
    const currentTime = new Date().toISOString();
    const targetModel = model || FALLBACK_MODEL;

    // ─── Server-Side Quota Validation ─────────────────────────────────────────
    if (validatedUserId) {
      const quotaCheck = await validateUserQuota(validatedUserId);
      if (!quotaCheck.allowed) {
        logger.quota('Request blocked - quota exhausted in fallback', { reason: quotaCheck.reason }, validatedUserId);
        return res.status(403).json({ 
          error: 'QUOTA_EXHAUSTED',
          reason: quotaCheck.reason,
          ecoMode: quotaCheck.ecoMode
        });
      }
    }

    logger.api('Fallback engine activated', { model: targetModel, timestamp: currentTime }, validatedUserId);

    // Build contents from OpenRouter-style messages array
    const contents = (messages || [])
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

    // If no valid messages, create a minimal prompt
    if (contents.length === 0) {
      return res.status(400).json({ error: 'No valid messages for fallback' });
    }

    const systemText = instructions
      ? `${instructions}\n\nCurrent time: ${currentTime}. You are Catalizia CorporateGPT. Respond in the same language as the user.`
      : `You are Catalizia CorporateGPT, a premium corporate AI assistant. Current time: ${currentTime}. Always respond in the same language the user uses.`;

    const geminiPayload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemText }],
      },
      generationConfig: {
        temperature: temperature ?? 0.7,
        maxOutputTokens: 2048,
      },
    };

    const geminiRes = await fetch(
      `${GEMINI_BASE}/${targetModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json();
      const errMsg = errData.error?.message || `Gemini HTTP ${geminiRes.status}`;
      logger.error('Gemini API error in fallback', new Error(errMsg), { model: targetModel });
      return res.status(502).json({ error: errMsg });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const estimatedTokens = Math.ceil(text.length / 4);

    if (validatedUserId && estimatedTokens > 0) {
      consumeServerQuota(validatedUserId, estimatedTokens).catch(err => 
        logger.error('Quota consumption failed in fallback', err as Error, { userId: validatedUserId }),
      );
    }

    logger.api('Fallback response delivered', { responseLength: text.length }, validatedUserId);

    // Return in OpenRouter-compatible format so the frontend parsing is identical
    return res.status(200).json({
      text,
      choices: [{ message: { role: 'assistant', content: text } }],
      model: targetModel,
      fallback: true,
    });

  } catch (error: any) {
    logger.error('Fallback engine total failure', error as Error, { userId: validatedUserId });
    return res.status(500).json({ error: `Fallback engine error: ${error.message}` });
  }
}
