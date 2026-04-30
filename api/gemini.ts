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
      const response = await ai.models.generateContent(payload);
      return res.status(200).json({ text: response.text, candidates: response.candidates });
    } else if (action === 'chat') {
      const chat = ai.chats.create({ model: payload.model, config: payload.config });
      const result = await chat.sendMessage({ message: payload.message });
      return res.status(200).json({ text: result.text });
    }
    
    return res.status(400).json({ error: 'Unknown action' });
  } catch (error: any) {
    console.error('--- GEMINI PROXY ERROR ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
    return res.status(500).json({ 
      error: 'Gemini Execution Error', 
      details: error.message,
      checkVercelLogs: true 
    });
  }
}
