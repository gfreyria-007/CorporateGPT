import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserQuota, consumeServerQuota } from './quota';
import { checkRateLimit, getIdentifier } from './rateLimit';

const MAX_MESSAGE_SIZE = 50 * 1024; // 50KB max
const MAX_TOKENS = 8000;

const MODELS = {
  elite: {
    reasoning: 'google/gemini-2.0-flash-001',
    creative: 'google/gemini-2.0-flash-001',
    general: 'google/gemini-2.0-flash-001',
    vision: 'google/gemini-2.0-flash-001',
  },
  standard: {
    reasoning: 'google/gemini-2.0-flash-001',
    creative: 'google/gemini-2.0-flash-001',
    general: 'google/gemini-2.0-flash-001',
    vision: 'google/gemini-2.0-flash-001',
  },
  eco: {
    reasoning: 'google/gemini-1.5-flash',
    creative: 'google/gemini-1.5-flash',
    general: 'google/gemini-1.5-flash',
    vision: 'google/gemini-1.5-flash',
  },
  free: {
    reasoning: 'google/gemini-1.5-flash',
    creative: 'google/gemini-1.5-flash',
    general: 'google/gemini-1.5-flash',
    vision: 'google/gemini-1.5-flash',
  },
};

const TIER_LABELS = {
  elite: 'Elite',
  standard: 'Standard',
  eco: 'Eco',
  free: 'Free',
  fairuse: 'Basic (Fair Use)',
};

type Tier = 'elite' | 'standard' | 'eco' | 'free';
type QueryClass = 'reasoning' | 'creative' | 'general';

// ─── Classify query ───────────────────────────────────────────────────────────

function classifyQuery(text: string): QueryClass {
  const code = /\b(code|programa|script|sql|python|javascript|analyze|debug|algorithm|api)\b/i;
  const creative = /\b(write|escribe|legal|narrativa|poema|creative|story|brand|marketing)\b/i;
  if (code.test(text)) return 'reasoning';
  if (creative.test(text)) return 'creative';
  return 'general';
}

// ─── Resolve tier from quota data ─────────────────────────────────────────────

function resolveTier(remaining: number, ecoMode: boolean, fairUseLimit?: boolean): { tier: Tier | 'fairuse'; label: string } {
  if (fairUseLimit) return { tier: 'fairuse', label: TIER_LABELS.fairuse };
  if (ecoMode && remaining <= 0) return { tier: 'free', label: TIER_LABELS.free };
  if (ecoMode || remaining < 2000) return { tier: 'eco', label: TIER_LABELS.eco };
  if (remaining < 8000) return { tier: 'standard', label: TIER_LABELS.standard };
  return { tier: 'elite', label: TIER_LABELS.elite };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { model: userModel, messages, userId, instructions, temperature, maxTokens } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'No messages' });

    const msgSize = JSON.stringify(messages).length;
    if (msgSize > MAX_MESSAGE_SIZE) return res.status(400).json({ error: 'Message too large', maxSize: MAX_MESSAGE_SIZE });

    const realMaxTokens = Math.min(maxTokens ?? 4000, MAX_TOKENS);

    const validModel = typeof userModel === 'string' && userModel.length > 0 && userModel.length <= 100;
    if (userModel && !validModel) return res.status(400).json({ error: 'Invalid model parameter' });
    if (maxTokens && (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 32000)) return res.status(400).json({ error: 'Invalid maxTokens' });
    if (temperature && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) return res.status(400).json({ error: 'Invalid temperature' });

    // Rate limiting
    const rateLimit = await checkRateLimit(getIdentifier(req));
    if (!rateLimit.allowed) return res.status(429).json({ error: 'Rate limited', resetIn: rateLimit.resetIn });

    // Lazy load quota
    let remainingTokens = 5000, ecoMode = false, fairUseLimit = false;
    try {
      if (userId) {
        const q = await validateUserQuota(userId);
        remainingTokens = q.remainingTokens;
        ecoMode = q.ecoMode;
        fairUseLimit = q.fairUseLimit;
      }
    } catch (e) {
      console.log('[Quota] Offline - allowing access with defaults');
    }

    if (remainingTokens <= 0) ecoMode = true;

    // Resolve model
    const hasImage = messages.some((m: any) => m.image_url?.url || m.content?.includes('data:image'));
    const queryClass: QueryClass = classifyQuery(messages[messages.length - 1]?.content || '');
    const type = hasImage ? 'vision' : queryClass === 'reasoning' ? 'reasoning' : queryClass === 'creative' ? 'creative' : 'general';

    const { tier, label } = resolveTier(remainingTokens, ecoMode, fairUseLimit);

    const modelId =
      userModel && !['openrouter/auto', 'auto', ''].includes(userModel as string) && tier !== 'fairuse'
        ? userModel
        : (MODELS[tier === 'fairuse' ? 'eco' : tier] as Record<string, string>)[type] || MODELS.free[type];

    const systemContent = instructions
      ? `${instructions} You are Catalizia CorporateGPT. Respond in the same language as the user.`
      : `You are Catalizia CorporateGPT, a premium corporate AI assistant. Always respond in the same language the user uses.`;

    // Notify user on downgrade
    let notification: string | null = null;
    if (tier === 'fairuse') {
      notification = 'Tokens have run out - using backup model.';
    } else if (tier === 'eco') {
      notification = 'Modo Eco activado — usando modelos eficientes.';
    } else if (tier === 'free') {
      notification = 'Modo gratuito activado sin interrupción.';
    }

    console.log(`[Router] tier=${tier} model=${modelId} remaining=${remainingTokens}`);

    // Try multiple GEMINI models - fallback chain
    let lastError = '';
    let success = false;
    let resultText = '';
    let usedModel = modelId;
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const modelsToTry = [
      modelId,
      'gemini-2.0-flash-001',
      'gemini-2.0-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash'
    ];
    const uniqueModelsToTry = [...new Set(modelsToTry)];

    const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

    for (const tryModel of uniqueModelsToTry) {
      try {
        const contents = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }]
        }));

        const payload = {
          contents,
          system_instruction: { parts: [{ text: systemContent }] },
          generationConfig: { temperature: temperature ?? 0.7, maxOutputTokens: realMaxTokens }
        };

        const response = await fetch(
          `${GEMINI_BASE}/${tryModel}:generateContent?key=${GEMINI_API_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
        );

        if (response.ok) {
          const data = await response.json();
          resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (resultText) {
            usedModel = tryModel;
            success = true;
            break;
          }
        }
        
        const errText = await response.text();
        lastError = errText.substring(0, 200);
      } catch (e: any) {
        lastError = e?.message || 'Model failed';
        continue;
      }
    }

    if (!success) {
      // Last resort: call via /api/fallback
      console.error('[Chat] All Gemini models failed:', lastError);
      const fallbackRes = await fetch('/api/fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, instructions, temperature, model: modelId })
      });
      
      if (!fallbackRes.ok) {
        return res.status(502).json({ error: 'All AI models unavailable. Please try again.' });
      }
      
      const fallbackData = await fallbackRes.json();
      resultText = fallbackData.text || fallbackData.choices?.[0]?.message?.content || '';
      usedModel = fallbackData.model || 'fallback';
    }

    // Consume quota
    const estimatedTokens = Math.ceil((resultText.length + systemContent.length) / 4);
    if (userId) {
      try {
        consumeServerQuota(userId, estimatedTokens).then(() => {
          console.log(`[Quota] Consumed ${estimatedTokens} for ${userId}`);
        }).catch((e) => console.log('[Quota] Consumption async error:', e.message));
      } catch (e: any) { 
        console.log('[Quota] Sync consumption error:', e?.message);
      }
    }

    return res.status(200).json({
      choices: [{ message: { role: 'assistant', content: resultText } }],
      _tier: tier,
      _model: usedModel,
      _tierLabel: label,
      _notification: notification,
    });

  } catch (err: any) {
    console.error('[ChatHandler] Fatal:', err?.message || err);
    return res.status(500).json({ error: `Error: ${(err?.message || 'Unknown').substring(0, 100)}` });
  }
}
      _notification: notification,
    });

  } catch (err: any) {
    console.error('[ChatHandler] Fatal:', err?.message || err);
    return res.status(500).json({ error: `Error: ${(err?.message || 'Unknown').substring(0, 100)}` });
  }
}