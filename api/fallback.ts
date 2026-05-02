import type { VercelRequest, VercelResponse } from '@vercel/node';

const FALLBACK_MODEL = 'gemini-2.0-flash-001';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Fallback engine offline — API key missing' });
    }

    const { messages, instructions, temperature, model, userId } = req.body;
    const currentTime = new Date().toISOString();
    const targetModel = model || FALLBACK_MODEL;

    const contents = (messages || [])
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No valid messages for fallback' });
    }

    const systemText = instructions
      ? `${instructions}\n\nCurrent time: ${currentTime}. You are Catalizia CorporateGPT. Respond in the same language as the user.`
      : `You are Catalizia CorporateGPT, a premium corporate AI assistant. Current time: ${currentTime}. Always respond in the same language the user uses.`;

    const geminiPayload = {
      contents,
      system_instruction: { parts: [{ text: systemText }] },
      generationConfig: { temperature: temperature ?? 0.7, maxOutputTokens: 2048 },
    };

    const geminiRes = await fetch(
      `${GEMINI_BASE}/${targetModel}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiPayload) }
    );

    if (!geminiRes.ok) {
      let errorMessage = `Gemini HTTP ${geminiRes.status}`;
      try {
        const errText = await geminiRes.text();
        try { const errData = JSON.parse(errText); errorMessage = errData.error?.message || errorMessage; }
        catch { errorMessage = errText.substring(0, 200); }
      } catch { }
      console.error('[Fallback] Gemini error:', errorMessage);
      return res.status(502).json({ error: errorMessage });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      text,
      choices: [{ message: { role: 'assistant', content: text } }],
      model: targetModel,
      fallback: true,
    });

  } catch (err: any) {
    console.error('[Fallback] Fatal error:', err?.message || err);
    return res.status(500).json({ error: `Fallback error: ${(err?.message || 'Unknown').substring(0, 100)}` });
  }
}