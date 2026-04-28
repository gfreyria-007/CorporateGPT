import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { scanAttachments } from "@/lib/scanner";
import { logSecurityViolation } from "@/lib/firestore";

import mammoth from "mammoth";
import * as xlsx from "xlsx";

export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { messages, uid, email, attachments } = await req.json();

    console.log(`[DEBUG] Received request from ${email} (${uid})`);

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

    // 2. PARSE ATTACHMENTS FOR CONTEXT
    let parsedTextContext = "";
    const finalMessages = [];

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "user" && i === messages.length - 1 && attachments && attachments.length > 0) {
        const parts: any[] = [{ type: "text", text: m.content }];
        
        for (const file of attachments) {
          if (!file.base64) continue;
          const buffer = Buffer.from(file.base64, "base64");
          
          // Image natively supported by Gemini
          if (file.type.startsWith("image/")) {
            parts.push({ type: "image", image: buffer });
          } 
          // PDF natively supported by Gemini 2.5 Flash via base64 inline data
          else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            parts.push({ type: "file", data: file.base64, mimeType: "application/pdf" });
          } 
          // Word Document Parsing
          else if (file.type.includes("wordprocessingml") || file.name.endsWith(".docx")) {
            try {
              const result = await mammoth.extractRawText({ buffer });
              parsedTextContext += `\n--- FILE: ${file.name} ---\n${result.value}\n`;
            } catch (e) {
              console.error("Docx parse error", e);
            }
          } 
          // Excel Parsing
          else if (file.type.includes("spreadsheetml") || file.name.endsWith(".xlsx") || file.name.endsWith(".csv")) {
            try {
              const workbook = xlsx.read(buffer, { type: "buffer" });
              workbook.SheetNames.forEach(sheet => {
                parsedTextContext += `\n--- FILE: ${file.name} | Sheet: ${sheet} ---\n`;
                parsedTextContext += xlsx.utils.sheet_to_csv(workbook.Sheets[sheet]);
              });
            } catch (e) {
              console.error("Excel parse error", e);
            }
          } 
          // Raw Text
          else {
            parsedTextContext += `\n--- FILE: ${file.name} ---\n${file.content}\n`;
          }
        }
        finalMessages.push({ role: m.role, content: parts });
      } else {
        finalMessages.push({ role: m.role, content: m.content });
      }
    }

    let finalSystemPrompt = `You are a Secure Enterprise Assistant. Respond helpfully and professionally.
ALWAYS wrap your internal thought process, reasoning, and analysis inside <think>...</think> XML tags at the very beginning of your response. After you finish thinking, provide your final response to the user outside the tags.
If the user attached any documents, start your final response (after the think block) with a brief markdown note confirming: "> [!NOTE]\n> **Security Audit:** Attached documents have been scanned by the Enterprise Firewall and verified as clean and safe for processing."`;

    if (parsedTextContext) {
      finalSystemPrompt += `\n\n--- EXTRACTED DOCUMENT TEXT FOR REFERENCE ---\n${parsedTextContext}\n--------------------------------------------\n`;
    }

    try {
      const result = await streamText({
        model: google("gemini-2.5-flash"),
        messages: finalMessages,
        system: finalSystemPrompt,
      });

      return result.toTextStreamResponse();
    } catch (aiError: any) {
      console.error("[AI ERROR]:", aiError);
      return new Response(`AI Node Error: ${aiError.message}`, { status: 500 });
    }

  } catch (error: any) {
    console.error("[CRITICAL API ERROR]:", error);
    return new Response(`Neural Error: ${error.message || "Unknown Failure"}`, { 
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
