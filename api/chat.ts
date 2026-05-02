import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Model definitions with cost awareness ────────────────────────────────────

const MODELS = {
  elite: {
    reasoning: 'deepseek/deepseek-r1',
    creative: 'qwen/qwen-2.5-72b-instruct',
    general: 'google/gemini-2.5-flash',
    vision: 'google/gemini-2.5-flash',
  },
  standard: {
    reasoning: 'qwen/qwen-2.5-72b-instruct',
    creative: 'google/gemini-2.5-flash',
    general: 'google/gemini-2.5-flash',
    vision: 'google/gemini-2.5-flash',
  },
  eco: {
    reasoning: 'google/gemini-2.5-flash-lite',
    creative: 'google/gemini-2.5-flash-lite',
    general: 'google/gemini-2.5-flash-lite',
    vision: 'google/gemini-2.5-flash-lite',
  },
  free: {
    reasoning: 'google/gemini-2.5-flash-lite',
    creative: 'google/gemini-2.5-flash-lite',
    general: 'google/gemini-2.5-flash-lite',
    vision: 'google/gemini-2.5-flash-lite',
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

// ─── OpenRouter call ──────────────────────────────────────────────────────────

async function callOpenRouter(
  apiKey: string, modelId: string, messages: any[], system: string,
  temp: number, maxTokens: number, referer: string
) {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': referer, 'X-Title': 'Catalizia CorporateGPT' },
    body: JSON.stringify({ model: modelId, messages: [{ role: 'system', content: system }, ...messages], temperature: temp, max_tokens: maxTokens }),
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { model: userModel, messages, userId, instructions, temperature, maxTokens } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'No messages' });

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'API key missing' });

    // Lazy load quota
    let remainingTokens = 5000, ecoMode = false, fairUseLimit = false;
    try {
      const { validateUserQuota } = await import('./quota');
      if (userId) {
        const q = await validateUserQuota(userId);
        remainingTokens = q.remainingTokens;
        ecoMode = q.ecoMode;
        fairUseLimit = q.fairUseLimit;
      }
    } catch { /* quota offline — allow access */ }

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
      notification = 'Elite tokens have run out for the day as per fair use policy. You are now on the Basic Engine. Add $50 MXN credits or upgrade to stay Elite!';
    } else if (tier === 'eco') {
      notification = 'Modo Eco activado — usando modelos eficientes para ahorrar créditos.';
    } else if (tier === 'free') {
      notification = 'Créditos agotados — modo gratuito activado sin interrupción del servicio.';
    }

    console.log(`[Router] tier=${tier} model=${modelId} remaining=${remainingTokens}`);

    // First try primary
    let response: Response, data: any;
    let usedModel = modelId;

    response = await callOpenRouter(OPENROUTER_API_KEY, modelId, messages, systemContent, temperature ?? 0.7, maxTokens ?? 4000, process.env.APP_URL || 'http://localhost:3000');

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Router] Primary failed (${response.status}): ${errText.substring(0, 200)}`);

      // Fallback to free model
      const fallbackModel = MODELS.free[type];
      if (fallbackModel !== modelId) {
        response = await callOpenRouter(OPENROUTER_API_KEY, fallbackModel, messages, systemContent, temperature ?? 0.7, maxTokens ?? 4000, process.env.APP_URL || 'http://localhost:3000');
        usedModel = fallbackModel;
      }

      if (!response.ok) {
        const fallbackErr = await response.text();
        return res.status(502).json({ error: `Models unavailable: ${fallbackErr.substring(0, 200)}` });
      }
    }

    data = await response.json();

    // Consume quota
    const estimatedTokens = data.usage?.total_tokens || 100;
    if (userId) {
      try {
        const { consumeServerQuota } = await import('./quota');
        consumeServerQuota(userId, estimatedTokens).catch(() => {});
      } catch { /* ok */ }
    }

    return res.status(200).json({
      ...data,
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