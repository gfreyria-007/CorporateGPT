import { createOpenAI } from "@ai-sdk/openai";
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

import { extractText } from "unpdf";
import mammoth from "mammoth";
import * as xlsx from "xlsx";

export const maxDuration = 30;

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});

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
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ 
        error: "Configuration Error", 
        details: "OPENROUTER_API_KEY is not set in Vercel. Please add your new key to Environment Variables and redeploy." 
      }), { status: 500 });
    }

    const { messages, uid, email, attachments, model } = await req.json();

    const isSuperAdmin = email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const selectedModel = model || DEFAULT_MODEL;

    // Security: Non-admins can ONLY use free models
    if (!isSuperAdmin && !FREE_MODELS.includes(selectedModel)) {
      return new Response(JSON.stringify({ 
        error: "Access Denied", 
        details: "Selected model is reserved for Super Admin tier. Please select a FREE model from the Neural Core menu." 
      }), { status: 403 });
    }

    console.log(`[DEBUG] Request from ${email} using model ${selectedModel}`);

    // 0. USAGE CHECK (Skip for Super Admin)
    if (!isSuperAdmin) {
      const totalQueries = await getTotalUsageCount(uid);
      if (totalQueries >= 5) {
        return new Response(JSON.stringify({ 
          error: "Demo Limit Reached", 
          details: "You have reached the 5-query lifetime limit for this demo. Please contact administration for permanent access." 
        }), { status: 403 });
      }
    }

    // 1. SECURITY SCANNING
    const allContentToScan = [
      ...(attachments || []).map((a: any) => a.content),
      ...messages.map((m: any) => m.content)
    ].join("\n");

    const scanResult = scanAttachments([{ name: "Neural Stream", content: allContentToScan }]);
    
    if (!scanResult.safe) {
      console.warn(`[SECURITY ALERT] Malicious content detected from ${email}:`, scanResult.threats);
      await logSecurityViolation(uid, email, `Malicious patterns detected in stream: ${scanResult.threats.join(", ")}`);

      return new Response(JSON.stringify({ 
        error: "Security Protocol Violation", 
        details: "Neural link severed due to malicious activity." 
      }), { status: 403 });
    }

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    // 2. PARSE ATTACHMENTS FOR CONTEXT & SAVE AS GEMS
    let parsedTextContext = "";
    const finalMessages = [];

    // Fetch existing Knowledge Gems (Global + User's daily)
    const [globalGems, userGems] = await Promise.all([
      getGlobalGems(),
      isSuperAdmin ? Promise.resolve([]) : getActiveUserGems(uid)
    ]);

    let gemContext = "\n--- KNOWLEDGE GEMS (CORPORATE BRAIN) ---\n";
    [...globalGems, ...userGems].forEach(gem => {
      gemContext += `\n[ASSET: ${gem.fileName} (${gem.isPermanent ? 'Permanent' : 'Temporary'})]\n${gem.content}\n`;
    });

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "user" && i === messages.length - 1 && attachments && attachments.length > 0) {
        const parts: any[] = [{ type: "text", text: m.content }];
        
        for (const file of attachments) {
          if (!file.base64) continue;
          const buffer = Buffer.from(file.base64, "base64");
          let fileText = "";
          
          if (file.type.startsWith("image/")) {
            parts.push({ type: "image", image: buffer });
            fileText = "[Image Data Uploaded]";
          } 
          else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            try {
              const pdfData = new Uint8Array(buffer);
              const { text: pages } = await extractText(pdfData);
              fileText = pages.join("\n");
              parsedTextContext += `\n--- FILE: ${file.name} ---\n${fileText}\n`;
            } catch (e) {
              console.error("PDF parse error", e);
              fileText = "[PDF could not be parsed]";
            }
          } 
          else if (file.type.includes("wordprocessingml") || file.name.endsWith(".docx")) {
            try {
              const result = await mammoth.extractRawText({ buffer });
              fileText = result.value;
              parsedTextContext += `\n--- FILE: ${file.name} ---\n${fileText}\n`;
            } catch (e) {
              console.error("Docx parse error", e);
            }
          } 
          else if (file.type.includes("spreadsheetml") || file.name.endsWith(".xlsx") || file.name.endsWith(".csv")) {
            try {
              const workbook = xlsx.read(buffer, { type: "buffer" });
              workbook.SheetNames.forEach(sheet => {
                const sheetText = xlsx.utils.sheet_to_csv(workbook.Sheets[sheet]);
                fileText += `\n[Sheet: ${sheet}]\n${sheetText}\n`;
              });
              parsedTextContext += `\n--- FILE: ${file.name} ---\n${fileText}\n`;
            } catch (e) {
              console.error("Excel parse error", e);
            }
          } 
          else {
            fileText = file.content || "";
            parsedTextContext += `\n--- FILE: ${file.name} ---\n${fileText}\n`;
          }

          // Save as Knowledge Gem
          if (fileText && fileText !== "[Image Data Uploaded]") {
            await saveGem(uid, email, file.name, fileText, file.type);
          }
        }
        finalMessages.push({ role: m.role, content: parts });
      } else {
        finalMessages.push({ role: m.role, content: m.content });
      }
    }

    let finalSystemPrompt = `You are a Secure Enterprise Assistant (Corporate GPT). Respond helpfully and professionally.
ALWAYS wrap your internal thought process, reasoning, and analysis inside <think>...</think> XML tags at the very beginning of your response. After you finish thinking, provide your final response to the user outside the tags.

${gemContext}

If the user attached any documents, start your final response (after the think block) with a brief markdown note confirming: "> [!NOTE]\n> **Security Audit:** Attached documents have been scanned by the Enterprise Firewall and verified as clean and safe for processing."`;

    if (parsedTextContext) {
      finalSystemPrompt += `\n\n--- CURRENT UPLOAD CONTEXT ---\n${parsedTextContext}\n--------------------------------------------\n`;
    }

    console.log(`[NEURAL REQUEST]: User=${email} | Admin=${isSuperAdmin} | Model=${selectedModel}`);

    try {
      const result = await streamText({
        model: openrouter(selectedModel),
        messages: finalMessages,
        system: finalSystemPrompt,
        headers: {
          "HTTP-Referer": req.headers.get("origin") || "https://v0-corporategpt.vercel.app",
          "X-Title": "Corporate GPT",
        },
        onFinish: async () => {
          // Increment Usage (Persistent)
          await incrementUserUsage(uid, 0, selectedModel);
        }
      });

      return result.toTextStreamResponse();
    } catch (aiError: any) {
      console.error("[NEURAL PROVIDER ERROR]:", {
        message: aiError.message,
        user: email,
        isAdmin: isSuperAdmin,
        model: selectedModel
      });
      return new Response(JSON.stringify({ 
        error: "Neural Node Error", 
        details: aiError.message,
        diagnostics: { user: email, model: selectedModel, isAdmin: isSuperAdmin }
      }), { 
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error: any) {
    console.error("[CRITICAL API ERROR]:", error);
    return new Response(`Neural Error: ${error.message || "Unknown Failure"}`, { 
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
