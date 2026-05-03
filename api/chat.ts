import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_TOKENS = 8000;

// ─── IMMORTAL CHAIN ───────────────────────────────────────────────────────────────
// Multiple fallbacks: if one fails, try next. Never leave user stranded.

const CHAINS = [
  // 1. PRIMARY: Gemini 2.5 Flash (fastest, most reliable)
  { 
    id: 'gemini-2.5-flash', 
    provider: 'gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
  },
  // 2. FALLBACK: OpenRouter - DeepSeek R1 (cheap & reliable)
  { 
    id: 'deepseek/deepseek-r1', 
    provider: 'openrouter',
    url: 'https://openrouter.ai/api/v1/chat/completions'
  },
  // 3. LAST RESORT: Gemini 2.5 Flash (duplicate for redundancy)
  { 
    id: 'gemini-2.5-flash', 
    provider: 'gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
  },
];

export default async function chat(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, userId, instructions, temperature, maxTokens, idToken } = req.body || {};
  
  if (!messages?.length) {
    return res.status(400).json({ error: 'No messages' });
  }

  const MAX_OUTPUT = Math.min(maxTokens ?? 4000, MAX_TOKENS);
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
  
  const systemContent = instructions 
    ? `${instructions} You are Catalizia CorporateGPT.`
    : 'You are Catalizia CorporateGPT.';

  let resultText = '';
  let modelUsed = '';
  let errorLog: string[] = [];

  // Try each chain until one works
  for (const chain of CHAINS) {
    try {
      // Skip if no API key
      if (chain.provider === 'gemini' && !GEMINI_KEY) continue;
      if (chain.provider === 'openrouter' && !OPENROUTER_KEY) continue;

      console.log(`[Chain] Trying ${chain.id}...`);

      let response: Response;
      
      if (chain.provider === 'gemini') {
        response = await fetch(chain.url + '?key=' + GEMINI_KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content || '' }]
            })),
            system_instruction: { parts: [{ text: systemContent }] },
            generationConfig: { temperature: temperature ?? 0.7, maxOutputTokens: MAX_OUTPUT }
          })
        });
      } 
      else if (chain.provider === 'openrouter') {
        // Skip model if key missing
        if (!OPENROUTER_KEY) continue;
        
        response = await fetch(chain.url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://corporategpt.catalizia.com',
            'X-Title': 'CorporateGPT'
          },
          body: JSON.stringify({
            model: chain.id,
            messages: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            })),
            temperature: temperature ?? 0.7,
            max_tokens: MAX_OUTPUT
          })
        });
      }

      if (response?.ok) {
        const data = await response.json();
        
        if (chain.provider === 'gemini') {
          resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          resultText = data.choices?.[0]?.message?.content || '';
        }
        
        if (resultText) {
          modelUsed = chain.id;
          console.log(`[Chain] SUCCESS: ${chain.id}, response length: ${resultText.length}`);
          break; // Got response! Stop here.
        }
      } else {
        const errText = await response?.text() || '';
        errorLog.push(`${chain.id}: HTTP ${response?.status}`);
        console.log(`[Chain] ${chain.id} failed: ${response?.status}`);
      }
    } catch (e: any) {
      errorLog.push(`${chain.id}: ${e?.message || e}`);
      console.log(`[Chain] ${chain.id} exception: ${e?.message}`);
      continue;
    }
  }

  // All chains failed
  if (!resultText) {
    console.log('[Chain] All models failed - check server logs');
    // NEVER expose API key status in response
    return res.status(503).json({ 
      error: 'Service temporarily unavailable. Please try again later.'
    });
  }

  return res.status(200).json({
    choices: [{ message: { role: 'assistant', content: resultText } }],
    _model: modelUsed
  });
}