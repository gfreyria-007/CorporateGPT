import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_TOKENS = 8000;

export default async function chat(req: VercelRequest, res: VercelResponse) {
  const MAX_OUTPUT = Math.min(req.body?.maxTokens ?? 4000, MAX_TOKENS);
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const systemContent = req.body.instructions 
    ? `${req.body.instructions} You are Catalizia CorporateGPT.`
    : 'You are Catalizia CorporateGPT.';

  let resultText = '';

  if (!GEMINI_KEY) {
    console.log('[Chat] No GEMINI_API_KEY env');
    return res.status(503).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: req.body.messages?.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }]
          })) || [],
          system_instruction: { parts: [{ text: systemContent }] },
          generationConfig: { temperature: req.body.temperature ?? 0.7, maxOutputTokens: MAX_OUTPUT }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  } catch (e) {
    console.log('[Chat] Error:', e);
  }

  if (!resultText) {
    return res.status(503).json({ error: 'No response from model' });
  }

  return res.status(200).json({
    choices: [{ message: { role: 'assistant', content: resultText } }],
    _model: 'gemini-1.5-flash'
  });
}