import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { getCompanyConfig } from "@/lib/firestore";
import { getPolicyContext, getAgentContext } from "@/lib/rag";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, selectedModel, systemPrompt, uid, agentId } = await req.json();

  // 1️⃣  Load company config (API keys + budget)
  const config = await getCompanyConfig();
  const apiKeys = config.apiKeys ?? {};

  // 2️⃣  Build RAG‑enriched system prompt
  const lastUserMessage = messages[messages.length - 1]?.content?.toString() ?? "";
  let enrichedPrompt = systemPrompt || config.systemPrompt;

  // Always inject company policy context into the main chatbot
  const policyCtx = await getPolicyContext(lastUserMessage);
  if (policyCtx) {
    enrichedPrompt = `COMPANY POLICIES (use as reference):\n${policyCtx}\n\n---\n\n${enrichedPrompt}`;
  }

  // If chatting with a specific agent, also inject agent‑level docs
  if (agentId) {
    const agentCtx = await getAgentContext(agentId, lastUserMessage);
    if (agentCtx) {
      enrichedPrompt = `AGENT REFERENCE DOCUMENTS:\n${agentCtx}\n\n---\n\n${enrichedPrompt}`;
    }
  }

  // 3️⃣  Initialise providers (DB key → ENV fallback)
  const openai = createOpenAI({ apiKey: apiKeys.openai || process.env.OPENAI_API_KEY });
  const anthropic = createAnthropic({ apiKey: apiKeys.anthropic || process.env.ANTHROPIC_API_KEY });
  const google = createGoogleGenerativeAI({ apiKey: apiKeys.google || process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  const deepseek = createOpenAI({ baseURL: "https://api.deepseek.com/v1", apiKey: apiKeys.deepseek || process.env.DEEPSEEK_API_KEY });
  const perplexity = createOpenAI({ baseURL: "https://api.perplexity.ai", apiKey: apiKeys.perplexity || process.env.PERPLEXITY_API_KEY });

  // 4️⃣  Model selection (manual or auto‑routing)
  let model;
  switch (selectedModel) {
    case "gpt-4o":
      model = openai("gpt-4o");
      break;
    case "claude-3-5-sonnet":
      model = anthropic("claude-3-5-sonnet-latest");
      break;
    case "gemini-1.5-pro":
      model = google("gemini-1.5-pro");
      break;
    case "deepseek-coder":
      model = deepseek("deepseek-coder");
      break;
    case "deepseek-chat":
      model = deepseek("deepseek-chat");
      break;
    case "llama-3.1-sonar-large-128k-online":
      model = perplexity("llama-3.1-sonar-large-128k-online");
      break;
    case "auto":
    default:
      if (/code|complex|analyze|debug/i.test(lastUserMessage)) {
        model = anthropic("claude-3-5-sonnet-latest");
      } else if (/search|latest news|today|current/i.test(lastUserMessage)) {
        model = perplexity("llama-3.1-sonar-large-128k-online");
      } else if (lastUserMessage.length < 50) {
        model = openai("gpt-4o-mini");
      } else {
        model = openai("gpt-4o");
      }
  }

  // 5️⃣  Stream the response
  const result = streamText({
    model,
    messages,
    system: enrichedPrompt,
  });

  return result.toTextStreamResponse();
}
