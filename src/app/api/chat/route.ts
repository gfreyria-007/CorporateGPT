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
    const maskedKey = apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : "MISSING";
    console.log(`[API Handshake] Model: ${model || "auto"}, Key: ${maskedKey}`);

    if (!apiKey) return new Response("Configuration Required: OPENROUTER_API_KEY missing in Vercel.", { status: 500 });

    const { messages, model } = await req.json();
    const modelId = model || "openrouter/auto";

    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role,
      content: Array.isArray(m.content) 
        ? m.content.map((c: any) => c.text || "").join("\n")
        : String(m.content)
    }));

    const openrouter = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const result = await streamText({
      model: openrouter(modelId),
      messages: sanitizedMessages,
      system: "You are Corporate GPT. Provide high-fidelity technical intelligence.",
      headers: {
        "HTTP-Referer": "https://v0-corporategpt.vercel.app",
        "X-Title": "Corporate GPT",
      },
    });

    return new Response(result.textStream);
  } catch (error: any) {
    console.error("[CRITICAL]:", error);
    return new Response(`Neural Error: ${error.message}`, { status: 500 });
  }
}
