import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserQuota, consumeServerQuota } from './quota';
import { checkRateLimit, getIdentifier } from './rateLimit';

const MAX_MESSAGE_SIZE = 50 * 1024;
const MAX_TOKENS = 8000;

// ─── EFFICIENT CHAINS (Cheap + Reliable + No Token Waste) ───────────────────────
// Pricing May 2026 - Focus on value models, avoid expensive ones

// Data Protection: ZDR models only
const PROTECTED_CHAIN = [
  { model: 'minimax/minimax-m2.7', provider: 'openrouter', speed: 1 },
  { model: 'deepseek/deepseek-v3-2', provider: 'openrouter', speed: 2 },
  { model: 'google/gemini-2.0-flash-lite', provider: 'openrouter', speed: 3 },
  { model: 'gemini-2.0-flash', provider: 'gemini-direct', speed: 4 },
];

// Default chain
const DEFAULT_CHAIN = [
  { model: 'minimax/minimax-m2.7', provider: 'openrouter', speed: 1 },
  { model: 'xiaomi/mimo-v2-pro', provider: 'openrouter', speed: 2 },
  { model: 'deepseek/deepseek-v3-2', provider: 'openrouter', speed: 3 },
  { model: 'stepfun/step-3.5-flash', provider: 'openrouter', speed: 4 },
];

const DEFAULT_CHAIN = [
  { model: 'minimax/minimax-m2.5-free', provider: 'openrouter', speed: 1 },
  { model: 'qwen/qwen2.5-7b-instruct', provider: 'openrouter', speed: 2 },
  { model: 'google/gemini-2.0-flash-lite', provider: 'openrouter', speed: 3 },
  { model: 'gemini-2.0-flash', provider: 'gemini-direct', speed: 4 },
];

const TIER_LABELS = {
  elite: 'Elite',
  standard: 'Standard', 
  eco: 'Eco',
  free: 'Free',
  fairuse: 'Basic (Fair Use)',
};

type Tier = 'elite' | 'standard' | 'eco' | 'free';

function classifyQuery(text: string): 'reasoning' | 'creative' | 'general' {
  const code = /\b(code|programa|script|sql|python|javascript|analyze|debug)\b/i;
  const creative = /\b(write|escribe|legal|narrativa|poema|creative|story)\b/i;
  if (code.test(text)) return 'reasoning';
  if (creative.test(text)) return 'creative';
  return 'general';
}

function resolveTier(remaining: number, ecoMode: boolean, fairUseLimit?: boolean): { tier: Tier | 'fairuse'; label: string } {
  if (fairUseLimit) return { tier: 'fairuse', label: TIER_LABELS.fairuse };
  if (ecoMode && remaining <= 0) return { tier: 'free', label: TIER_LABELS.free };
  if (ecoMode || remaining < 2000) return { tier: 'eco', label: TIER_LABELS.eco };
  if (remaining < 8000) return { tier: 'standard', label: TIER_LABELS.standard };
  return { tier: 'elite', label: TIER_LABELS.elite };
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { model: userModel, messages, userId, instructions, temperature, maxTokens } = req.body;
    if (!messages?.length) {
      return res.status(400).json({ error: 'No messages' });
    }

    const msgSize = JSON.stringify(messages).length;
    if (msgSize > MAX_MESSAGE_SIZE) {
      return res.status(400).json({ error: 'Message too large' });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(getIdentifier(req));
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Rate limited', resetIn: rateLimit.resetIn });
    }

    // Quota
    let remainingTokens = 5000, ecoMode = false;
    try {
      if (userId) {
        const q = await validateUserQuota(userId);
        remainingTokens = q.remainingTokens;
        ecoMode = q.ecoMode;
      }
    } catch (e) {
      console.log('[Quota] Offline - allowing access');
    }

    if (remainingTokens <= 0) ecoMode = true;

    const type = classifyQuery(messages[messages.length - 1]?.content || '');
    const { tier, label } = resolveTier(remainingTokens, ecoMode);
    
    const systemContent = instructions
      ? `${instructions} You are Catalizia CorporateGPT. Respond in the same language as the user.`
      : 'You are Catalizia CorporateGPT, a premium corporate AI assistant. Always respond in the same language the user uses.';

    let notification: string | null = null;
    if (tier === 'fairuse') notification = 'Tokens have run out - using backup model.';
    else if (tier === 'eco') notification = 'Modo Eco activado.';
    else if (tier === 'free') notification = 'Modo gratuito activado.';

    const realMaxTokens = Math.min(maxTokens ?? 4000, MAX_TOKENS);
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const dataProtected = req.body.dataProtected === true;

    // Select chain based on Data Protection setting
    const activeChain = dataProtected ? PROTECTED_CHAIN : DEFAULT_CHAIN;
    if (dataProtected) {
      notification = 'Data Protection: Your data is protected from training.';
    }

    let resultText = '';
    let usedModel = '';
    let success = false;

    // ─── IMMORTAL CHAIN: Try each model until one works ───
    for (const attempt of activeChain) {
      try {
        if (attempt.provider === 'openrouter' && OPENROUTER_KEY) {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://corporategpt.catalizia.com',
              'X-Title': 'CorporateGPT'
            },
            body: JSON.stringify({
              model: attempt.model,
              messages: messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content
              })),
              temperature: temperature ?? 0.7,
              max_tokens: realMaxTokens
            })
          });

          if (orRes.ok) {
            const data = await orRes.json();
            resultText = data.choices?.[0]?.message?.content || '';
            if (resultText) {
              usedModel = `openrouter/${attempt.model}`;
              success = true;
              break;
            }
          }
        } 
        else if (attempt.provider === 'gemini-direct' && GEMINI_KEY) {
          const gemRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${attempt.model}:generateContent?key=${GEMINI_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: messages.map((m: any) => ({
                  role: m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.content || '' }]
                })),
                system_instruction: { parts: [{ text: systemContent }] },
                generationConfig: { temperature: temperature ?? 0.7, maxOutputTokens: realMaxTokens }
              })
            }
          );

          if (gemRes.ok) {
            const data = await gemRes.json();
            resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (resultText) {
              usedModel = attempt.model;
              success = true;
              break;
            }
          }
        }
      } catch (e) {
        console.log(`[Chain] ${attempt.provider}/${attempt.model} failed, trying next...`);
        continue;
      }
    }

    if (!success) {
      return res.status(503).json({ error: 'All models unavailable. Please try again.' });
    }

    // Consume quota
    const estimatedTokens = Math.ceil((resultText.length + systemContent.length) / 4);
    if (userId) {
      try {
        consumeServerQuota(userId, estimatedTokens);
      } catch (e) {}
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
