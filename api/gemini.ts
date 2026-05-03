import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractUserId, validateUserQuota, consumeServerQuota } from './quota';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[GEMINI] CRITICAL: GEMINI_API_KEY is missing from environment variables.");
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in backend' });
    }

    const { action, payload, userId: providedUserId } = req.body;
    
    // Auth & Quota check
    let fairUseLimit = false;
    let finalModel = payload.model;
    const userId = providedUserId || extractUserId(req);

    if (userId) {
      const q = await validateUserQuota(userId);
      fairUseLimit = q.fairUseLimit;
      
      // STEERING: If Fair Use reached, downgrade Pro models to Flash
      if (fairUseLimit && payload.model?.includes('pro')) {
        console.log(`[GEMINI] FAIR USE ACTIVE: Steering ${payload.model} -> gemini-2.0-flash`);
        finalModel = 'gemini-2.0-flash';
      }
    }

    console.log(`[GEMINI] Action: ${action}, Model: ${payload.model}`);

    if (action === 'generateContent') {
      try {
        const generationConfig = payload.config || payload.generationConfig || {};
        const { systemInstruction, ...restConfig } = generationConfig;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${finalModel || "gemini-2.0-flash"}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: payload.contents,
            generationConfig: {
              ...restConfig,
              // Only default to application/json if we are NOT asking for images
              responseMimeType: restConfig.responseMimeType || (restConfig.responseModalities?.includes('IMAGE') ? undefined : "application/json")
            },
            systemInstruction: payload.systemInstruction || systemInstruction ? { parts: [{ text: payload.systemInstruction || systemInstruction }] } : undefined,
            tools: payload.tools || [{ googleSearch: {} }]
          })
        });

        let result;
        const responseText = await response.text();
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.error("[GEMINI PROXY] Failed to parse response as JSON:", responseText.substring(0, 500));
          throw new Error(`Gemini returned invalid response: ${responseText.substring(0, 100)}...`);
        }

        if (!response.ok) {
          throw new Error(result.error?.message || `Gemini API Error (Status ${response.status})`);
        }
        
        // Handle Image Generation responses (binary/inlineData)
        const hasImage = result.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
        if (hasImage) {
          return res.status(200).json(result);
        }

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

        // Tracking: Increment multimedia counter for images/slides
        if (userId && (hasImage || action === 'generateContent')) {
          try {
            const admin = await import('firebase-admin');
            const db = admin.apps.length > 0 ? admin.apps[0].firestore() : admin.firestore();
            const quotaRef = db.collection('users').doc(userId).collection('quota').doc('daily');
            await quotaRef.set({
              multimediaUsed: admin.firestore.FieldValue.increment(1)
            }, { merge: true });
          } catch (e) { console.error("[GEMINI] Counter increment failed:", e); }
        }

        return res.status(200).json({ 
          text: rawText, 
          ...parsedFields, 
          candidates: result.candidates,
          _fairUseActive: fairUseLimit 
        });
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${payload.model || "gemini-2.0-flash"}:generateContent?key=${apiKey}`, {
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

