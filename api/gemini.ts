import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[GEMINI] CRITICAL: GEMINI_API_KEY is missing from environment variables.");
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend' });
    }

    const { action, payload } = req.body;

    if (!action || !payload) {
      return res.status(400).json({ error: 'Missing action or payload' });
    }

    console.log(`[GEMINI] Action: ${action}, Model: ${payload.model}`);

    if (action === 'generateContent') {
      try {
        const generationConfig = payload.config || payload.generationConfig || {};
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${payload.model || "gemini-3.1-pro-preview"}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: payload.contents,
            generationConfig: {
              ...generationConfig,
              responseMimeType: generationConfig.responseMimeType || "application/json"
            },
            systemInstruction: payload.systemInstruction || undefined
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'Gemini API Error');
        }

        const result = await response.json();
        
        let rawText = '';
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawText = result.candidates[0].content.parts[0].text;
        }
        
        const cleanJson = (rawText || '').replace(/```json/g, '').replace(/```/g, '').trim();
        
        let parsedFields: Record<string, any> = {};
        try {
          if (cleanJson) {
            const parsed = JSON.parse(cleanJson);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              parsedFields = parsed;
            }
          }
        } catch (e) {
          console.warn("[GEMINI] JSON Parse warning (may be plain text):", e);
        }

        return res.status(200).json({ text: rawText, ...parsedFields });
      } catch (genError: any) {
        console.error('--- GEMINI SDK ERROR ---', genError);
        return res.status(500).json({ 
          error: genError.message || 'Gemini SDK Execution Failure', 
          details: genError.message,
          code: genError.code || 'UNKNOWN'
        });
      }

    } else if (action === 'chat') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${payload.model || "gemini-3.1-pro-preview"}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: payload.message }] }],
            systemInstruction: payload.config?.systemInstruction ? {
              parts: [{ text: payload.config.systemInstruction }]
            } : undefined
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'Chat API Error');
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return res.status(200).json({ text });
      } catch (chatError: any) {
        console.error('--- GEMINI CHAT ERROR ---', chatError);
        return res.status(500).json({ error: 'Chat failure', details: chatError.message });
      }
    }
    
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error: any) {
    console.error('--- GEMINI PROXY ERROR ---', error.message);
    return res.status(500).json({ 
      error: 'Gemini Execution Error', 
      details: error.message 
    });
  }
}

