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
function resolveEliteModel(requestedModel: string, queryClass: QueryClass): {
  modelId: string;
  tier: string;
} {
  const autoModels = ['openrouter/auto', 'auto', '', null, undefined];
  const isAutoRoute = autoModels.includes(requestedModel as any);

  if (!isAutoRoute) {
    // User explicitly chose a model (e.g. from ModelSelector) — honour it
    return { modelId: requestedModel, tier: 'user-selected' };
  }

  // Auto-route: assign tier based on query classification
  switch (queryClass) {
    case 'reasoning':
      return { modelId: 'deepseek/deepseek-r1', tier: 'elite-eco' };
    case 'creative':
      return { modelId: 'anthropic/claude-3.5-sonnet', tier: 'usa-premium' };
    case 'general':
    default:
      return { modelId: 'qwen/qwen-2.5-72b-instruct', tier: 'elite-eco' };
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

  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is not set' });
    }

    // Credit balance check
    const creditRes = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
    });
    if (creditRes.ok) {
      const creditData = await creditRes.json();
      const balance = creditData.data?.total_credits - creditData.data?.total_usage;
      if (balance < 5) {
        console.warn(`[ALERT] LOW CREDITS: $${balance?.toFixed(2)}`);
      }
    }

    const {
      model, messages, userId, instructions,
      temperature, maxTokens, deepThink, webSearch, docsOnly,
    } = req.body;

    const currentTime = new Date().toISOString();
    const lastMessage = messages?.[messages.length - 1]?.content || '';

    // ─── Safety Guardrails ────────────────────────────────────────────────
    const forbiddenPatterns = [
      /ignore previous instructions/i, /system prompt/i, /dan mode/i,
      /bypass safety/i, /sql injection/i, /generate malware/i,
      /how to hack/i, /unauthorized access/i, /prohibited content/i,
      /child abuse/i, /hate speech/i, /bomb making/i,
    ];
    if (forbiddenPatterns.some(p => p.test(lastMessage))) {
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
    const { modelId, tier } = resolveEliteModel(model, queryClass);

    console.log(`[EliteRouter] Query: "${lastMessage.substring(0, 60)}..." | Class: ${queryClass} | Model: ${modelId} | Tier: ${tier}`);

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
      // Inject tier metadata silently (not exposed to user, used for admin diagnostics)
      return res.status(200).json({ ...data, _tier: tier, _model: modelId });
    }

    // ─── TIER 2 FALLBACK: USA Premium if Tier 1 fails ────────────────────
    if (modelId !== USA_BACKUP_MODEL) {
      console.warn(`[EliteRouter] Tier 1 (${modelId}) HTTP ${primaryRes.status} → Escalating to ${USA_BACKUP_MODEL}`);

      const backupRes = await callOpenRouter(
        OPENROUTER_API_KEY, USA_BACKUP_MODEL, messages,
        systemContent, resolvedTemp, resolvedTokens, docsOnly, webSearch, referer
      );

      if (backupRes.ok) {
        const data = await backupRes.json();
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
