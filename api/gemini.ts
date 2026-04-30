import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[GEMINI] CRITICAL: GEMINI_API_KEY is missing from environment variables.");
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { action, payload } = req.body;

    if (!action || !payload) {
      return res.status(400).json({ error: 'Missing action or payload' });
    }

    console.log(`[GEMINI] Action: ${action}, Model: ${payload.model}`);

    if (action === 'generateContent') {
      try {
        // Map 'config' to 'generationConfig' for SDK compatibility
        const generationConfig = payload.config || payload.generationConfig || {};
        
        const result = await ai.models.generateContent({
          model: payload.model || "gemini-1.5-flash",
          contents: payload.contents,
          generationConfig: {
            ...generationConfig,
            // Ensure responseMimeType is respected if provided
            responseMimeType: generationConfig.responseMimeType || "application/json"
          },
          systemInstruction: payload.systemInstruction || undefined
        });
        
        let rawText = '';
        // Extract text safely from the result
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawText = result.candidates[0].content.parts[0].text;
        } else if (typeof result.text === 'function') {
          rawText = await (result.text as any)();
        } else if (typeof result.text === 'string') {
          rawText = result.text;
        }
        
        // Robust JSON extraction
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
          error: 'Gemini SDK Execution Failure', 
          details: genError.message,
          code: genError.code || 'UNKNOWN'
        });
      }

    } else if (action === 'chat') {
      try {
        const chat = ai.chats.create({ 
          model: payload.model || "gemini-1.5-flash",
          config: payload.config || {}
        });
        const result = await chat.sendMessage({ message: payload.message });
        return res.status(200).json({ text: result.text });
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

