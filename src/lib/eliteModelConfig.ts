/**
 * eliteModelConfig.ts — Corporate GPT V2 Elite Model Orchestration
 *
 * Defines the two-tier model hierarchy for maximum margin protection:
 *
 *   TIER 1 — Elite-Eco (Chinese Models):
 *     DeepSeek-R1 / Qwen 2.5 72B
 *     Cost: ~$0.14–$0.55 per 1M tokens
 *     Best for: reasoning, code, data analysis, long-form tasks
 *
 *   TIER 2 — USA Premium Backup:
 *     Claude 3.5 Sonnet / GPT-4o
 *     Cost: ~$3–$15 per 1M tokens
 *     Triggered only if Tier 1 is unavailable or user selects explicitly
 *
 * This config is shared between frontend (for labeling/diagnostics)
 * and backend (for actual routing decisions).
 */

export type ModelTier = 'elite-eco' | 'usa-premium' | 'fallback';

export interface EliteModel {
  id: string;               // OpenRouter model ID
  displayName: string;      // Internal diagnostic label
  tier: ModelTier;
  bestFor: string[];        // query type tags this model excels at
  inputCostPer1M: number;   // USD (for margin tracking)
  outputCostPer1M: number;  // USD
  maxContextK: number;      // context window in K tokens
}

// ─── TIER 1: Elite-Eco Chinese Models ────────────────────────────────────────
export const ELITE_ECO_MODELS: EliteModel[] = [
  {
    id: 'deepseek/deepseek-r1',
    displayName: 'DeepSeek R1',
    tier: 'elite-eco',
    bestFor: ['reasoning', 'code', 'math', 'analysis', 'strategy', 'data'],
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    maxContextK: 64,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    displayName: 'Qwen 2.5 72B',
    tier: 'elite-eco',
    bestFor: ['general', 'multilingual', 'writing', 'summarization', 'business'],
    inputCostPer1M: 0.35,
    outputCostPer1M: 0.40,
    maxContextK: 128,
  },
];

// ─── TIER 2: USA Premium Backup ───────────────────────────────────────────────
export const USA_PREMIUM_MODELS: EliteModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    tier: 'usa-premium',
    bestFor: ['creative', 'legal', 'nuanced', 'long-form', 'compliance'],
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    maxContextK: 200,
  },
  {
    id: 'openai/gpt-4o',
    displayName: 'GPT-4o',
    tier: 'usa-premium',
    bestFor: ['general', 'vision', 'structured', 'tools'],
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    maxContextK: 128,
  },
];

// ─── Query Classification Keywords ───────────────────────────────────────────
// Used server-side to route to Tier 1 vs Tier 2

export const REASONING_PATTERNS = [
  /\bcode\b/i, /\bprograma/i, /\bscript\b/i, /\bsql\b/i, /\bpython\b/i,
  /\bjavascript\b/i, /\banalyze\b/i, /\banaliza\b/i, /\bcalculate\b/i,
  /\bcalcula\b/i, /\bmath\b/i, /\bmatem/i, /\bstrateg/i, /\bestrategia/i,
  /\boptimize\b/i, /\boptimiza\b/i, /\bfinancial\b/i, /\bfinanciero\b/i,
  /\bforecast\b/i, /\bproyecci/i, /\balgorithm\b/i, /\balgoritmo\b/i,
  /\bdebug\b/i, /\berror\b/i, /\bcompare\b/i, /\bcompar/i,
];

export const CREATIVE_PATTERNS = [
  /\bwrite\b/i, /\bescribe\b/i, /\bcreate content\b/i, /\bcrea contenido\b/i,
  /\bnarrative\b/i, /\bnarrativa\b/i, /\blegal\b/i, /\bcompliance\b/i,
  /\bcontract\b/i, /\bcontrato\b/i, /\bpoem\b/i, /\bpoema\b/i,
];

/**
 * Classify a query to decide which model tier to use.
 * Returns 'reasoning' for Tier 1, 'creative' for Tier 2, 'general' for Tier 1 default.
 */
export function classifyQuery(text: string): 'reasoning' | 'creative' | 'general' {
  if (REASONING_PATTERNS.some(p => p.test(text))) return 'reasoning';
  if (CREATIVE_PATTERNS.some(p => p.test(text))) return 'creative';
  return 'general';
}

/**
 * Select the best model for the query type.
 * Returns the OpenRouter model ID string.
 *
 * Logic:
 *   reasoning → DeepSeek R1 (best in class, dirt cheap)
 *   creative  → Claude 3.5 Sonnet (nuance + compliance)
 *   general   → Qwen 2.5 72B (fast, multilingual, low cost)
 */
export function selectEliteModel(queryType: ReturnType<typeof classifyQuery>): {
  modelId: string;
  tier: ModelTier;
  displayName: string;
} {
  switch (queryType) {
    case 'reasoning':
      return {
        modelId: ELITE_ECO_MODELS[0].id,      // deepseek-r1
        tier: 'elite-eco',
        displayName: ELITE_ECO_MODELS[0].displayName,
      };
    case 'creative':
      return {
        modelId: USA_PREMIUM_MODELS[0].id,    // claude-3.5-sonnet
        tier: 'usa-premium',
        displayName: USA_PREMIUM_MODELS[0].displayName,
      };
    case 'general':
    default:
      return {
        modelId: ELITE_ECO_MODELS[1].id,      // qwen-2.5-72b
        tier: 'elite-eco',
        displayName: ELITE_ECO_MODELS[1].displayName,
      };
  }
}

/**
 * USA Backup model to use when Tier 1 fails.
 */
export const USA_BACKUP_MODEL = USA_PREMIUM_MODELS[0]; // claude-3.5-sonnet

/**
 * Estimate cost for a response (for margin tracking in Admin Panel).
 * Rough estimate: 1 message ≈ 500 input + 800 output tokens.
 */
export function estimateCost(model: EliteModel, inputTokens = 500, outputTokens = 800): number {
  return (model.inputCostPer1M / 1_000_000) * inputTokens +
         (model.outputCostPer1M / 1_000_000) * outputTokens;
}
