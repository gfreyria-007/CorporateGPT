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

const FALLBACK_MODEL = 'gemini-1.5-flash-latest';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[FALLBACK] CRITICAL: GEMINI_API_KEY missing — fallback engine offline');
    return res.status(503).json({ error: 'Fallback engine offline — API key missing' });
  }

  try {
    const { messages, instructions, temperature, model } = req.body;
    const currentTime = new Date().toISOString();
    const targetModel = model || FALLBACK_MODEL;

    console.log(`[FALLBACK] ⚡ Emergency engine activated → ${targetModel} at ${currentTime}`);

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
      console.error(`[FALLBACK] Gemini error: ${errMsg}`);
      return res.status(502).json({ error: errMsg });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log(`[FALLBACK] ✅ Emergency response delivered (${text.length} chars)`);

    // Return in OpenRouter-compatible format so the frontend parsing is identical
    return res.status(200).json({
      text,
      choices: [{ message: { role: 'assistant', content: text } }],
      model: targetModel,
      fallback: true,
    });

  } catch (error: any) {
    console.error('[FALLBACK] Critical failure:', error.message);
    return res.status(500).json({ error: `Fallback engine error: ${error.message}` });
  }
}
