import { getCompanyConfig } from "./firestore";

/**
 * Resolves an API key by checking Firestore (Admin UI) first,
 * then falling back to Environment Variables (Vercel).
 */
export async function getResolvedApiKey(provider: "openrouter" | "openai" | "anthropic" | "google" | "deepseek" | "perplexity"): Promise<string | undefined> {
  // 1. Check Env Vars first (Master Source for Security)
  const envMap: Record<string, string | undefined> = {
    openrouter: process.env.OPENROUTER_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
  };

  const envKey = envMap[provider];
  if (envKey && envKey.trim() !== "") {
    return envKey.trim();
  }

  // 2. Fallback to Firestore (UI) for dynamic overrides
  try {
    const config = await getCompanyConfig();
    const uiKey = config.apiKeys?.[provider];
    if (uiKey && uiKey.trim() !== "") {
      return uiKey.trim();
    }
  } catch (e) {
    // Silence Firestore errors on server-side to prevent crashes
  }

  return undefined;
}
