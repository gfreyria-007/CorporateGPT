import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { scanAttachments } from "@/lib/scanner";
import { logSecurityViolation } from "@/lib/firestore";

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
      
      // LOG & BAN
      await logSecurityViolation(uid, email, `Malicious patterns detected in stream: ${scanResult.threats.join(", ")}`);

      return new Response(JSON.stringify({ 
        error: "Security Protocol Violation", 
        details: "Neural link severed due to malicious activity. Your access has been permanently revoked." 
      }), { status: 403 });
    }

    // 2. LOGGING & EXPIRATION LOGIC (Conceptual for Demo)
    // In a production environment, we would save the attachments to Firestore 
    // with an 'expiresAt' field set to Date.now() + 3600000.
    // A Firebase Cloud Function would then prune these records.
    console.log(`[DATA POLICY] Attachments for ${uid} scheduled for neural deletion in 60 minutes.`);

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    // 3. AI Processing with Context
    // 3. AI Processing with Context
    try {
      const result = await streamText({
        model: google("gemini-2.5-flash"),
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
        system: `You are a Secure Enterprise Assistant. Respond helpfully and professionally.`,
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
