import type { VercelRequest, VercelResponse } from '@vercel/node';

const FALLBACK_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const AVAILABLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-latest',
  'gemini-1.5-pro'
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('[Fallback] API key not configured');
      return res.status(503).json({ error: 'Service unavailable' });
    }

    const { messages, instructions, temperature, model, userId } = req.body;
    const currentTime = new Date().toISOString();
    let targetModel = model || FALLBACK_MODEL;

    // Try multiple models - fallback chain
    let lastError = '';
    let success = false;
    let resultText = '';

    for (const tryModel of AVAILABLE_MODELS) {
      if (targetModel && !AVAILABLE_MODELS.includes(targetModel)) continue;
      
      const modelToTry = tryModel === 'gemini-1.5-flash' ? 'gemini-1.5-flash-8b' : tryModel;
      
      try {
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
          generationConfig: { temperature: temperature ?? 0.7, maxOutputTokens: 4096 },
        };

        const geminiRes = await fetch(
          `${GEMINI_BASE}/${modelToTry}:generateContent?key=${apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiPayload) }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (resultText) {
            targetModel = modelToTry;
            success = true;
            break;
          }
        }
        
        const errText = await geminiRes.text();
        lastError = errText.substring(0, 200);
      } catch (e: any) {
        lastError = e?.message || 'Model failed';
        continue;
      }
    }

    if (!success) {
      console.error('[Fallback] All models failed - check server logs');
      return res.status(503).json({ error: 'Service unavailable. Please try again.' });
    }

    return res.status(200).json({
      text: resultText,
      model: targetModel,
      fallback: true,
    });

  } catch (err: any) {
    console.error('[Fallback] Error:', err?.message);
    return res.status(500).json({ error: 'Service error. Please try again.' });
  }
}