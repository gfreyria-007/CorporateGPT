import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend' });

    const ai = new GoogleGenAI({ apiKey });
    const { action, payload } = req.body;

    if (action === 'generateContent') {
      const result = await ai.models.generateContent(payload);
      const rawText = typeof result.text === 'function' ? await (result.text as any)() : result.text;
      
      // Clean markdown fences if model returned them
      const cleanJson = (rawText || '').replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Parse and spread ALL top-level keys so any response shape works
      // (slides, questions, preview, suggestedMood, finalMood, etc.)
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

