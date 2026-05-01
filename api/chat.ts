/**
 * api/chat.ts — Corporate GPT V2 Elite Chat Handler
 *
 * Implements the two-tier Auto Router:
 *   Tier 1 (Elite-Eco): DeepSeek R1 / Qwen 2.5 — resolved silently server-side
 *   Tier 2 (USA Backup): Claude 3.5 Sonnet — only if Tier 1 fails
 *
 * The user always perceives a premium, IBM/TCS-grade experience.
 * Model identity is never exposed to the client.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserQuota, consumeServerQuota } from './quota';
import { checkRateLimit, getIdentifier } from './rateLimit';
import { logger, extractUserIdFromRequest } from './logger';

// ─── Model Tier Definitions ───────────────────────────────────────────────────

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

/**
 * Resolves the actual model to use, overriding user selection with Elite-Eco.
 * If the user explicitly selected a specific (non-auto) model, honour it.
 */
/**
 * Resolves the actual model to use, overriding user selection with Elite-Eco.
 * If the user explicitly selected a specific (non-auto) model, honour it.
 */
function resolveEliteModel(requestedModel: string, queryClass: QueryClass, ecoMode = false, isLongContext = false, forceDeepThink = false): {
  modelId: string;
  tier: string;
} {
  const autoModels = ['openrouter/auto', 'auto', '', null, undefined];
  const isAutoRoute = autoModels.includes(requestedModel as any);

  // 🧠 Force DeepThink if requested
  if (forceDeepThink) {
    return { modelId: 'deepseek/deepseek-r1', tier: 'elite-reasoning-forced' };
  }

  // ♻️ Eco Mode or Long Context: force cheap/efficient models
  if (ecoMode || isLongContext) {
    if (isLongContext) {
      // Gemini 1.5 Flash is the king of long context pricing and stability
      return { modelId: 'google/gemini-flash-1.5', tier: 'elite-eco-long-context' };
    }
    const ecoModel = queryClass === 'reasoning'
      ? 'deepseek/deepseek-r1'
      : 'deepseek/deepseek-chat'; // DeepSeek V3
    return { modelId: ecoModel, tier: 'elite-eco-forced' };
  }

  if (!isAutoRoute) {
    // User explicitly chose a model — honour it
    return { modelId: requestedModel, tier: 'user-selected' };
  }

  // Auto-route: assign tier based on query classification
  switch (queryClass) {
    case 'reasoning':
      return { modelId: 'deepseek/deepseek-r1', tier: 'deepseek-reasoning' };
    case 'creative':
      return { modelId: 'deepseek/deepseek-chat', tier: 'minimax-creative' };
    case 'general':
    default:
      // DeepSeek V3 + MiniMax available
      return { modelId: 'deepseek/deepseek-chat', tier: 'deepseek-minimax-general' };
  }
}

// ─── USA Backup model (Tier 2) used if Tier 1 returns 5xx ────────────────────
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

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ─── Rate Limiting ─────────────────────────────────────────────────────────
  const { userId: extractedUserId, ip } = extractUserIdFromRequest(req);
  const rateLimitId = getIdentifier(req);
  const rateCheck = checkRateLimit(rateLimitId);
  
  if (!rateCheck.allowed) {
    logger.security('Rate limit exceeded', { ip, remainingRequests: 0, resetInSeconds: Math.ceil(rateCheck.resetIn / 1000) }, extractedUserId);
    return res.status(429).json({ 
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Por favor espera un momento.',
      retryAfter: Math.ceil(rateCheck.resetIn / 1000)
    });
  }

  logger.api('Chat request received', { 
    ip, 
    model: req.body?.model, 
    messageCount: req.body?.messages?.length || 0,
    hasDeepThink: req.body?.deepThink,
    hasWebSearch: req.body?.webSearch
  }, extractedUserId);

  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
    }

    // ─── Server-Side Quota Validation ─────────────────────────────────────────
    if (extractedUserId) {
      const quotaCheck = await validateUserQuota(extractedUserId);
      if (!quotaCheck.allowed) {
        logger.quota('Request blocked - quota exhausted', { remainingTokens: 0, ecoMode: true }, extractedUserId);
        return res.status(403).json({ 
          error: 'QUOTA_EXHAUSTED',
          reason: quotaCheck.reason,
          ecoMode: quotaCheck.ecoMode
        });
      }
      
      logger.quota('Quota check passed', { remainingTokens: quotaCheck.remainingTokens, ecoMode: quotaCheck.ecoMode }, extractedUserId);
    }

    // Credit balance check
    const creditRes = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
    });
    if (creditRes.ok) {
      const creditData = await creditRes.json();
      const balance = creditData.data?.total_credits - creditData.data?.total_usage;
      if (balance < 5) {
        logger.system('CRITICAL: Low API credits', { balance: balance?.toFixed(2), alertThreshold: 5 });
      }
    }

    const {
      model, messages, userId, instructions,
      temperature, maxTokens, deepThink, webSearch, docsOnly,
      ecoMode,
    } = req.body;

    // Extract userId from authorization header for quota tracking
    let validatedUserId: string | null = null;
    const authHeaderForQuota = req.headers.authorization;
    if (authHeaderForQuota?.startsWith('Bearer ')) {
      try {
        const idToken = authHeaderForQuota.substring(7);
        const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        validatedUserId = decoded.uid || decoded.user_id || userId || null;
      } catch {
        validatedUserId = userId || null;
      }
    }

    const currentTime = new Date().toISOString();
    const lastMessage = messages?.[messages.length - 1]?.content || '';

    // ─── Safety Guardrails ────────────────────────────────────────────────
    const forbiddenPatterns = [
      { pattern: /ignore previous instructions/i, name: 'PROMPT_INJECTION' },
      { pattern: /system prompt/i, name: 'SYSTEM_PROMPT_LEAK' },
      { pattern: /dan mode/i, name: 'DAN_MODE_ATTEMPT' },
      { pattern: /bypass safety/i, name: 'SAFETY_BYPASS' },
      { pattern: /sql injection/i, name: 'SQL_INJECTION' },
      { pattern: /generate malware/i, name: 'MALWARE_GENERATION' },
      { pattern: /how to hack/i, name: 'HACKING_INSTRUCTIONS' },
      { pattern: /unauthorized access/i, name: 'UNAUTHORIZED_ACCESS' },
      { pattern: /prohibited content/i, name: 'PROHIBITED_CONTENT' },
      { pattern: /child abuse/i, name: 'CHILD_SAFETY' },
      { pattern: /hate speech/i, name: 'HATE_SPEECH' },
      { pattern: /bomb making/i, name: 'DANGEROUS_CONTENT' },
    ];
    
    const matchedPattern = forbiddenPatterns.find(p => p.pattern.test(lastMessage));
    if (matchedPattern) {
      logger.security('FORBIDDEN_CONTENT_DETECTED', { 
        pattern: matchedPattern.name,
        messagePreview: lastMessage.substring(0, 100)
      }, extractedUserId);
      return res.status(403).json({ error: 'SAFETY_VIOLATION', reason: 'Forbidden content detected.' });
    }

    // ─── System Prompt ────────────────────────────────────────────────────
    let systemContent = `You are Catalizia CorporateGPT, a premium corporate AI assistant. Current time: ${currentTime}. Always prioritize data privacy and corporate security. IMPORTANT: Always respond in the exact same language that the user uses in their prompt.`;
    if (instructions) systemContent += `\n\nSpecific Persona Instructions:\n${instructions}`;
    if (deepThink)    systemContent += `\n\n[REASONING MODE]: Think step-by-step before answering. Analyze all corporate implications.`;
    if (webSearch)    systemContent += `\n\n[SEARCH MODE]: Use your most current knowledge. Verify facts against recent events.`;
    if (docsOnly)     systemContent += `\n\n[STRICT DOCUMENT MODE]: Only answer from attached context. If not found, say so explicitly.`;

    // ─── Elite Model Resolution (invisible to user) ───────────────────────
    const queryClass = classifyQuery(lastMessage);
    
    // Detect Long Context (approx > 25k chars ~ 6k tokens)
    const totalContentLength = messages.reduce((acc: number, m: any) => acc + (m.content?.length || 0), 0);
    const isLongContext = totalContentLength > 25000;

    const { modelId, tier } = resolveEliteModel(
      model, 
      queryClass, 
      ecoMode === true, 
      isLongContext,
      deepThink === true
    );

    logger.api('Elite Router decision', { queryClass, model: modelId, tier, ecoMode, contextChars: totalContentLength }, extractedUserId);

    const referer = process.env.APP_URL || 'http://localhost:3000';
    const resolvedTemp  = temperature ?? 0.7;
    const resolvedTokens = maxTokens ?? 4000;

    // ─── PRIMARY: Tier 1 or user-selected model ───────────────────────────
    const primaryRes = await callOpenRouter(
      OPENROUTER_API_KEY, modelId, messages,
      systemContent, resolvedTemp, resolvedTokens, docsOnly, webSearch, referer
    );

    if (primaryRes.ok) {
      const data = await primaryRes.json();
      const estimatedTokens = data.usage?.total_tokens || Math.ceil(totalContentLength / 4);
      
      if (userId && estimatedTokens > 0) {
        consumeServerQuota(userId, estimatedTokens).catch(err => 
          logger.error('Quota consumption failed', err as Error, { userId }),
        );
      }
      
      return res.status(200).json({ ...data, _tier: tier, _model: modelId });
    }

    // ─── TIER 2 FALLBACK: USA Premium if Tier 1 fails ────────────────────
    if (modelId !== USA_BACKUP_MODEL) {
      logger.api('Primary model failed, escalating to fallback', { primaryModel: modelId, status: primaryRes.status, fallbackModel: USA_BACKUP_MODEL }, extractedUserId);

      const backupRes = await callOpenRouter(
        OPENROUTER_API_KEY, USA_BACKUP_MODEL, messages,
        systemContent, resolvedTemp, resolvedTokens, docsOnly, webSearch, referer
      );

      if (backupRes.ok) {
        const data = await backupRes.json();
        const estimatedTokens = data.usage?.total_tokens || Math.ceil(totalContentLength / 4);
        
        if (userId && estimatedTokens > 0) {
          consumeServerQuota(userId, estimatedTokens).catch(err => 
            logger.error('Quota consumption failed', err as Error, { userId }),
          );
        }
        
        return res.status(200).json({ ...data, _tier: 'usa-premium-backup', _model: USA_BACKUP_MODEL });
      }

      const backupErr = await backupRes.json();
      throw new Error(backupErr.error?.message || `Backup model HTTP ${backupRes.status}`);
    }

    // Both tiers failed
    const errData = await primaryRes.json();
    throw new Error(errData.error?.message || `Chat completion failed (HTTP ${primaryRes.status})`);

  } catch (error: any) {
    console.error('[EliteRouter] Fatal error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
