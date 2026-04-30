import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend' });

    const ai = new GoogleGenAI({ apiKey });
    const { action, payload } = req.body;

    if (!action || !payload) {
      return res.status(400).json({ error: 'Missing action or payload' });
    }

    if (action === 'generateContent') {
      // Ensure the payload structure is what the SDK expects
      // The new unified SDK expects: { model, contents, config }
      try {
        const result = await ai.models.generateContent(payload);
        
        // Handle different response formats (SDK versions)
        let rawText = '';
        if (typeof result.text === 'function') {
          rawText = await (result.text as any)();
        } else if (typeof result.text === 'string') {
          rawText = result.text;
        } else if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawText = result.candidates[0].content.parts[0].text;
        }
        
        // Clean markdown fences
        const cleanJson = (rawText || '').replace(/```json/g, '').replace(/```/g, '').trim();
        
        let parsedFields: Record<string, any> = {};
        try {
          const parsed = JSON.parse(cleanJson || '{}');
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            parsedFields = parsed;
          }
        } catch (e) {
          console.error("JSON Parse Error in gemini proxy:", e);
        }

        return res.status(200).json({ text: rawText, ...parsedFields });
      } catch (genError: any) {
        console.error('--- GEMINI SDK ERROR ---', genError);
        return res.status(500).json({ 
          error: 'Gemini SDK Execution Failure', 
          details: genError.message,
          payloadSent: payload 
        });
      }

    } else if (action === 'chat') {
      const chat = ai.chats.create({ model: payload.model, config: payload.config });
      const result = await chat.sendMessage({ message: payload.message });
      return res.status(200).json({ text: result.text });
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

