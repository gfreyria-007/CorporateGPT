import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_TOKENS = 8000;

function safeEnv(key: string): string | undefined {
  try {
    return process.env[key];
  } catch {
    return undefined;
  }
}

export default async function chat(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages, userId, instructions, temperature, maxTokens } = req.body;
    if (!messages?.length) {
      return res.status(400).json({ error: 'No messages' });
    }

    const maxOutput = Math.min(maxTokens ?? 4000, MAX_TOKENS);
    const GEMINI_KEY = safeEnv('GEMINI_API_KEY');
    
    const systemContent = instructions
      ? `${instructions} You are Catalizia CorporateGPT.`
      : 'You are Catalizia CorporateGPT.';

    let resultText = '';
    let modelUsed = '';

    // Try Gemini direct
    if (GEMINI_KEY) {
      try {
        console.log('[Chat] Using Gemini 1.5 Flash...');
        const gemRes = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content || '' }]
              })),
              system_instruction: { parts: [{ text: systemContent }] },
              generationConfig: { temperature: temperature ?? 0.7, maxOutputTokens: maxOutput }
            })
          }
        );

        if (gemRes.ok) {
          const data = await gemRes.json();
          resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (resultText) {
            modelUsed = 'gemini-1.5-flash';
            console.log('[Chat] Got response, length:', resultText.length);
          }
        } else {
          const errText = await gemRes.text();
          console.log('[Chat] Gemini error:', gemRes.status, errText.substring(0, 150));
        }
      } catch (e: any) {
        console.log('[Chat] Gemini exception:', e?.message);
      }
    } else {
      console.log('[Chat] No GEMINI_API_KEY');
    }

    if (!resultText) {
      return res.status(503).json({ error: 'Service unavailable', reason: !GEMINI_KEY ? 'No API key' : 'Model failed' });
    }

    return res.status(200).json({
      choices: [{ message: { role: 'assistant', content: resultText } }],
      _model: modelUsed,
    });

  } catch (err: any) {
    console.error('[ChatHandler] Fatal:', err?.message || err);
    return res.status(500).json({ error: 'Error: ' + (err?.message || 'Unknown').substring(0, 100) });
  }
}