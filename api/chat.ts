import type { VercelRequest, VercelResponse } from '@vercel/node';

const REASONING_PATTERNS = [
  /\bcode\b/i, /\bprograma/i, /\bscript\b/i, /\bsql\b/i, /\bpython\b/i,
  /\bjavascript\b/i, /\banalyze\b/i, /\banaliza\b/i, /\bcalculate\b/i,
  /\bcalcula\b/i, /\bmath\b/i, /\bmatem/i, /\bstrateg/i, /\bestrategia\b/i,
  /\boptimize\b/i, /\boptimiza\b/i, /\bfinancial\b/i, /\bfinanciero\b/i,
  /\bforecast\b/i, /\bproyecci/i, /\balgorithm\b/i, /\balgoritmo\b/i,
  /\bdebug\b/i, /\bcompare\b/i, /\bcompar/i, /\bdatos\b/i, /\bdata\b/i,
];

const CREATIVE_PATTERNS = [
  /\bescribe\b/i, /\bwrite a\b/i, /\blegal\b/i, /\bcompliance\b/i,
  /\bcontrato\b/i, /\bcontract\b/i, /\bnarrativa\b/i, /\bpoema\b/i,
  /\bcreative\b/i, /\bcreativi/i,
];

type QueryClass = 'reasoning' | 'creative' | 'general';

function classifyQuery(text: string): QueryClass {
  if (REASONING_PATTERNS.some(p => p.test(text))) return 'reasoning';
  if (CREATIVE_PATTERNS.some(p => p.test(text))) return 'creative';
  return 'general';
}

function resolveEliteModel(requestedModel: string, queryClass: QueryClass, ecoMode = false, isLongContext = false, forceDeepThink = false, hasImage = false): {
  modelId: string;
  tier: string;
} {
  const autoModels = ['openrouter/auto', 'auto', '', null, undefined];
  const isAutoRoute = autoModels.includes(requestedModel as any);

  if (forceDeepThink) {
    return { modelId: 'deepseek/deepseek-r1', tier: 'elite-reasoning-forced' };
  }

  if (ecoMode || isLongContext) {
    if (isLongContext) {
      return { modelId: 'google/gemini-flash-1.5', tier: 'elite-eco-long-context' };
    }
    const ecoModel = queryClass === 'reasoning'
      ? 'deepseek/deepseek-r1'
      : 'deepseek/deepseek-chat';
    return { modelId: ecoModel, tier: 'elite-eco-forced' };
  }

  if (!isAutoRoute) {
    return { modelId: requestedModel, tier: 'user-selected' };
  }

  const MODELS = {
    reasoning: [
      'deepseek/deepseek-r1',
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct',
      'mistralai/mistral-nemo'
    ],
    creative: [
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct',
      'mistralai/mistral-nemo',
      'google/gemini-2.0-flash-001'
    ],
    vision: [
      'google/gemini-2.0-flash-001',
      'mistralai/mistral-nemo',
      'anthropic/claude-3.5-sonnet'
    ],
    general: [
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct',
      'google/gemini-2.0-flash-001',
      'mistralai/mistral-nemo'
    ]
  };

  const getModel = (type: QueryClass | 'vision') => {
    if (hasImage) return MODELS.vision[0];
    const list = MODELS[type] || MODELS.general;
    return list[Math.floor(Date.now() / 60000) % list.length];
  };

  switch (queryClass) {
    case 'reasoning':
      return { modelId: getModel('reasoning'), tier: 'multi-model-reasoning' };
    case 'creative':
      return { modelId: getModel('creative'), tier: 'multi-model-creative' };
    case 'general':
    default:
      if (hasImage) return { modelId: getModel('vision'), tier: 'gemini-vision' };
      return { modelId: getModel('general'), tier: 'multi-model-general' };
  }
}

const USA_BACKUP_MODEL = 'anthropic/claude-3.5-sonnet';

async function callOpenRouter(
  apiKey: string,
  modelId: string,
  messages: any[],
  systemContent: string,
  temperature: number,
  maxTokens: number,
  docsOnly: boolean,
  webSearch: boolean,
  referer: string
): Promise<Response> {
  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': referer,
      'X-Title': 'Catalizia CorporateGPT',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'system', content: systemContent }, ...messages],
      temperature,
      max_tokens: maxTokens,
      ...((webSearch && !docsOnly) && { plugins: [{ id: 'web', max_results: 5 }] }),
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Lazy load all dependencies to prevent boot crashes
    let validateUserQuota: any, consumeServerQuota: any, checkRateLimit: any, getIdentifier: any, logger: any, extractUserIdFromRequest: any;
    try { ({ validateUserQuota, consumeServerQuota } = await import('./quota')); } catch { }
    try { ({ checkRateLimit, getIdentifier } = await import('./rateLimit')); } catch { }
    try { ({ logger, extractUserIdFromRequest } = await import('./logger')); } catch { }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId: extractedUserId, ip } = extractUserIdFromRequest ? extractUserIdFromRequest(req) : { userId: null, ip: 'unknown' };
    const rateLimitId = getIdentifier ? getIdentifier(req) : 'unknown';
    const rateCheck = checkRateLimit ? checkRateLimit(rateLimitId) : { allowed: true };

    if (!rateCheck.allowed) {
      if (logger) logger.security('Rate limit exceeded', { ip }, extractedUserId);
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes. Por favor espera un momento.',
        retryAfter: Math.ceil(rateCheck.resetIn / 1000)
      });
    }

    if (logger) logger.api('Chat request received', { ip, model: req.body?.model, messageCount: req.body?.messages?.length || 0 }, extractedUserId);

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
    }

    if (extractedUserId && validateUserQuota) {
      const quotaCheck = await validateUserQuota(extractedUserId);
      if (!quotaCheck.allowed) {
        if (logger) logger.quota('Request blocked - quota exhausted', { remainingTokens: 0, ecoMode: true }, extractedUserId);
        return res.status(403).json({ error: 'QUOTA_EXHAUSTED', reason: quotaCheck.reason, ecoMode: quotaCheck.ecoMode });
      }
      if (logger) logger.quota('Quota check passed', { remainingTokens: quotaCheck.remainingTokens, ecoMode: quotaCheck.ecoMode }, extractedUserId);
    }

    const creditRes = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
    });
    if (creditRes.ok) {
      const creditData = await creditRes.json();
      const balance = creditData.data?.total_credits - creditData.data?.total_usage;
      if (balance < 5 && logger) logger.system('CRITICAL: Low API credits', { balance });
    }

    const { model, messages, userId, instructions, temperature, maxTokens, deepThink, webSearch, docsOnly, ecoMode } = req.body;
    const lastMessage = messages?.[messages.length - 1]?.content || '';
    const queryClass = classifyQuery(lastMessage);
    const totalContentLength = messages?.reduce((acc: number, m: any) => acc + (m.content?.length || 0), 0) || 0;
    const isLongContext = totalContentLength > 25000;
    const hasImage = messages?.some((m: any) => m.image_url?.url || m.content?.includes('data:image'));

    const { modelId, tier } = resolveEliteModel(model, queryClass, ecoMode === true, isLongContext, deepThink === true, hasImage);

    if (logger) logger.api('Elite Router decision', { queryClass, model: modelId, tier, ecoMode, contextChars: totalContentLength }, extractedUserId);

    const referer = process.env.APP_URL || 'http://localhost:3000';
    const resolvedTemp = temperature ?? 0.7;
    const resolvedTokens = maxTokens ?? 4000;

    const systemContent = instructions
      ? `${instructions} You are Catalizia CorporateGPT. Respond in the same language as the user.`
      : `You are Catalizia CorporateGPT, a premium corporate AI assistant. Always respond in the same language the user uses.`;

    const primaryRes = await callOpenRouter(OPENROUTER_API_KEY, modelId, messages || [], systemContent, resolvedTemp, resolvedTokens, docsOnly || false, webSearch || false, referer);

    if (primaryRes.ok) {
      const data = await primaryRes.json();
      const estimatedTokens = data.usage?.total_tokens || Math.ceil(totalContentLength / 4);

      if (userId && estimatedTokens > 0 && consumeServerQuota) {
        consumeServerQuota(userId, estimatedTokens).catch(() => { });
      }

      return res.status(200).json({ ...data, _tier: tier, _model: modelId });
    }

    const errorText = await primaryRes.text();
    console.error(`[DIAGNOSTIC] OpenRouter Error (${primaryRes.status}):`, errorText);

    // Tier 2 backup
    const backupRes = await callOpenRouter(OPENROUTER_API_KEY, USA_BACKUP_MODEL, messages || [], systemContent, resolvedTemp, resolvedTokens, docsOnly || false, webSearch || false, referer);

    if (backupRes.ok) {
      const data = await backupRes.json();
      const estimatedTokens = data.usage?.total_tokens || Math.ceil(totalContentLength / 4);
      if (userId && estimatedTokens > 0 && consumeServerQuota) {
        consumeServerQuota(userId, estimatedTokens).catch(() => { });
      }
      return res.status(200).json({ ...data, _tier: 'usa-backup', _model: USA_BACKUP_MODEL });
    }

    const backupError = await backupRes.text();
    console.error(`[DIAGNOSTIC] Backup OpenRouter Error (${backupRes.status}):`, backupError);

    return res.status(502).json({ error: `OpenRouter error: ${errorText.substring(0, 200)}` });

  } catch (err: any) {
    console.error('[ChatHandler] Fatal error:', err?.message || err);
    return res.status(500).json({ error: `Server error: ${(err?.message || 'Unknown').substring(0, 100)}` });
  }
}
