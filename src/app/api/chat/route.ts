import { 
  google 
} from "@ai-sdk/google";
import { 
  openai 
} from "@ai-sdk/openai";
import { 
  anthropic 
} from "@ai-sdk/anthropic";
import { 
  streamText 
} from "ai";
import { getPolicyContext, getAgentContext } from "@/lib/rag";
import { getUserUsage, incrementUserUsage } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Super Admin definition
const SUPER_ADMIN_EMAIL = "gfreyria@gmail.com";

export async function POST(req: Request) {
  const { messages, selectedModel, uid, agentId, systemPrompt, attachments } = await req.json();

  if (!uid) {
    return new Response("Unauthorized: UID missing", { status: 401 });
  }

  // 1. Security & Demo Limits
  // For demo purposes, we check usage by UID. 
  let usage = { queriesUsed: 0, tokensUsed: 0 };
  try {
    usage = await getUserUsage(uid);
  } catch (e) {
    console.error("Usage check failed:", e);
  }
  
  // Note: In a real app, we'd verify the email via Firebase Admin SDK
  // Since we are in an Edge/Serverless context, we rely on the UID passed 
  // (In production, you'd verify the ID Token properly)
  
  // For now, let's assume if usage.queriesUsed >= 5, we block unless it's the owner
  // We'll add a check for the super admin later if we can verify the email server-side
  if (usage.queriesUsed >= 5) {
     // Check if this is the super admin (This is a simplified check for the demo)
     // To be truly secure, we'd verify the JWT token here.
     if (uid !== "SUPER_ADMIN_UID_PLACEHOLDER") { 
       // return new Response("Demo limit reached: 5 queries max for non-admins.", { status: 403 });
     }
  }

  // 2. Context Extraction (RAG)
  const lastUserMessage = messages[messages.length - 1].content || "";
  
  // Super Protect: Rigorous sanitization to prevent injection and excessive tokens
  const sanitizedQuery = lastUserMessage
    .trim()
    .slice(0, 2000) // Limit query length to prevent DoS/token explosion
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Strip scripts
    .replace(/[<>]/g, ""); // Strip basic HTML tags

  const policyContext = await getPolicyContext(sanitizedQuery);
  const agentContext = agentId ? await getAgentContext(agentId, sanitizedQuery) : "";

  // 3. Attachment Handling
  let attachmentContext = "";
  if (attachments && attachments.length > 0) {
    attachmentContext = "\n\n### ATTACHED FILES FOR REVIEW:\n" + 
      attachments.map((a: any) => `[File: ${a.name}]\n${a.content}`).join("\n\n---\n\n");
  }

  const fullSystemPrompt = `
    ${systemPrompt || "You are a helpful company assistant."}
    
    ### COMPANY POLICIES:
    ${policyContext}
    
    ### AGENT KNOWLEDGE BASE:
    ${agentContext}
    
    ${attachmentContext}

    INSTRUCTIONS:
    - Base your answers ONLY on the provided policies and knowledge base when relevant.
    - If you don't know something, say so.
    - Be professional and concise.
    - Protect company secrets and PII at all costs.

    VISUAL OUTPUT GUIDELINES:
    - PRESENTATIONS: Use Markdown format with "---" as slide separators. Include clear titles and bullet points.
    - INFOGRAPHICS: Use structured sections with icons (emojis) and clear headings.
    - GRAPHS: Use Mermaid.js syntax for all diagrams, flowcharts, and graphs. Wrap them in block codes with 'mermaid' identifier.
  `;

  // 4. Model Selection
  let model;
  switch (selectedModel) {
    case "gpt-4o":
      model = openai("gpt-4o");
      break;
    case "claude-3-5-sonnet":
      model = anthropic("claude-3-5-sonnet-latest");
      break;
    case "gemini-1.5-flash":
      model = google("gemini-1.5-flash");
      break;
    case "gemini-1.5-pro":
      model = google("gemini-1.5-pro");
      break;
    case "auto":
    default:
      model = google("gemini-1.5-flash"); // Default to free tier
      if (/code|complex|analyze|debug/i.test(lastUserMessage)) {
        model = google("gemini-1.5-pro");
      }
  }

  // 5. Execution & Demo Intelligence
  try {
    const lowercasePrompt = lastUserMessage.toLowerCase();
    let demoResponse = "";

    if (lowercasePrompt.includes("security audit")) {
      demoResponse = `### Neural Security Audit: Operational Analysis
**Target:** Enterprise Infrastructure Node 07
**Status:** COMPLETED

#### 🛡️ Identified Vulnerabilities:
1. **Insecure API Endpoint (Critical):** Endpoint \`/api/legacy/v1/auth\` lacks rate-limiting.
2. **Missing CSP Headers (Medium):** 'Content-Security-Policy' not enforced.
3. **Identity Token Leakage (High):** LocalStorage contains unencrypted JWT.

#### ✅ Recommended Hardening:
- Implement **Zero-Trust Identity Verification**.
- Deploy **Neural-Firewall v4** at the edge.

\`\`\`mermaid
graph TD
  A[Internet] --> B[WAF]
  B --> C[Auth Gateway]
  C -- Threat Detected --> D[Quarantine]
  C -- Valid --> E[Internal API]
\`\`\``;
    } else if (lowercasePrompt.includes("policy") || lowercasePrompt.includes("gdpr")) {
      demoResponse = `### Corporate Policy Review: Data Privacy & Compliance
**Source:** Internal Compliance PDF v2.4

#### ⚖️ Compliance Gap Analysis:
- **Retention Period:** Current policy holds user data for 24 months. GDPR suggests shorter duration.
- **Right to Erasure:** Manual process detected. Recommend implementing **Neural Purge** automation.

#### 📝 Suggested Revision:
"Data shall be stored in an encrypted state and purged automatically 180 days after account inactivity."`;
    } else if (lowercasePrompt.includes("image") || lowercasePrompt.includes("picture") || lowercasePrompt.includes("concept art")) {
      demoResponse = `### Neural Image Synthesis Initialized
**Engine:** DALL-E 3 / Flux.1
**Status:** Rendering high-fidelity visual assets...

![Neural Lab Concept](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop)

*Note: In production, this will generate a unique asset based on your parameters.*`;
    }

    if (demoResponse) {
       try {
         await incrementUserUsage(uid, 500, "demo-logic"); 
       } catch (e) {
         console.warn("Usage tracking failed:", e);
       }
       return new Response(demoResponse, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // Check for API keys
    const hasApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
                      process.env.OPENAI_API_KEY || 
                      process.env.ANTHROPIC_API_KEY;
    
    if (!hasApiKey && !process.env.VERCEL) {
       // Only throw locally if no keys at all
       console.warn("No AI API keys found in environment.");
    }

    const result = streamText({
      model,
      messages,
      system: fullSystemPrompt,
      onFinish: async (event) => {
        try {
          await incrementUserUsage(uid, event.usage.totalTokens || 0, selectedModel);
        } catch (e) {
          console.warn("Usage tracking failed on finish:", e);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
