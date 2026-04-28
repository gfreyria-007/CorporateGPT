import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { scanAttachments } from "@/lib/scanner";
import { 
  logSecurityViolation, 
  getUserUsage, 
  incrementUserUsage, 
  getGlobalGems, 
  getActiveUserGems, 
  saveGem, 
  SUPER_ADMIN_EMAIL,
  getTotalUsageCount
} from "@/lib/firestore";
import { getResolvedApiKey } from "@/lib/config";

import { extractText } from "unpdf";
import mammoth from "mammoth";
import * as xlsx from "xlsx";

export const maxDuration = 30;

const FREE_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "meta-llama/llama-3.1-70b-instruct:free",
  "meta-llama/llama-3-8b-instruct:free",
  "google/gemini-flash-1.5-exp",
  "google/gemini-pro-1.5-exp",
  "google/gemini-2.0-flash-exp:free",
  "mistralai/pixtral-12b:free",
  "mistralai/mistral-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "microsoft/phi-3-medium-128k-instruct:free",
  "qwen/qwen-2-7b-instruct:free",
  "google/gemma-2-9b-it:free",
  "openrouter/auto",
  "cognitivecomputations/dolphin-mixtral-8x7b:free",
  "nousresearch/hermes-2-theta-llama-3-8b:free",
];

const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";

export async function POST(req: Request) {
  try {
    const apiKey = await getResolvedApiKey("openrouter");
    if (!apiKey) return new Response("Missing Configuration", { status: 500 });

    const { messages, uid, email, attachments, model } = await req.json();
    const modelId = model || "meta-llama/llama-3.1-8b-instruct:free";

    // Sanitize messages: ensure content is always a string (fixes "expected string, received array" errors)
    const sanitizedMessages = messages.map((m: any) => ({
      ...m,
      content: Array.isArray(m.content) 
        ? m.content.map((c: any) => c.text || "").join("\n")
        : String(m.content)
    }));

    // 1. Direct Google Routing (Fallback/Stability)
    if (modelId.includes("google/")) {
      const googleKey = await getResolvedApiKey("google");
      if (googleKey) {
        try {
          const google = createGoogleGenerativeAI({ apiKey: googleKey });
          const result = await streamText({
            model: google("gemini-1.5-flash"),
            messages: sanitizedMessages,
            system: "You are a Corporate AI. Thinking blocks <think>...</think> are active."
          });
          return new Response(result.textStream);
        } catch (e) {
          console.warn("[FALLBACK] Google direct failed, trying OpenRouter...", e);
        }
      }
    }

    // 2. OpenRouter Logic (Full Features)
    const openrouter = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    // Security & Scanning
    const allContent = sanitizedMessages.map((m: any) => m.content).join("\n");
    const scanResult = scanAttachments([{ name: "Neural Stream", content: allContent }]);
    if (!scanResult.safe) {
      return new Response(JSON.stringify({ error: "Security Violation" }), { status: 403 });
    }

    const result = await streamText({
      model: openrouter(modelId),
      messages: sanitizedMessages,
      system: `You are Corporate GPT. ALWAYS wrap your reasoning in <think>...</think> tags.`,
      headers: {
        "HTTP-Referer": "https://v0-corporategpt.vercel.app",
        "X-Title": "Corporate GPT",
      },
    });

    return new Response(result.textStream);
  } catch (error: any) {
    console.error("[CRITICAL API ERROR]:", error);
    return new Response(`Neural Error: ${error.message}`, { status: 500 });
  }
}
