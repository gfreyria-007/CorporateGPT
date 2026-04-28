import { NextResponse } from "next/server";
import { getResolvedApiKey } from "@/lib/config";

export async function GET() {
  const apiKey = await getResolvedApiKey("openrouter");
  const hasKey = !!apiKey;
  const keySnippet = hasKey ? `${apiKey?.slice(0, 6)}...${apiKey?.slice(-4)}` : "none";
  
  let keyValid = false;
  let errorDetail = null;
  let credits = null;

  if (hasKey) {
    try {
      // Live ping to verify key validity and fetch credits
      const verify = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { 
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });
      
      if (verify.ok) {
        const data = await verify.json();
        if (data.data) {
          keyValid = true;
          credits = data.data.usage !== undefined ? data.data.usage : "check limits";
        } else {
          errorDetail = "Key check returned no data payload";
        }
      } else {
        const errData = await verify.json().catch(() => ({}));
        errorDetail = errData.error?.message || `HTTP ${verify.status}: ${verify.statusText}`;
      }
    } catch (e: any) {
      errorDetail = `Network Failure: ${e.message}`;
    }
  } else {
    errorDetail = "OPENROUTER_API_KEY is missing in environment variables";
  }
  
  return NextResponse.json({
    status: keyValid ? "active" : hasKey ? "fault" : "offline",
    details: errorDetail,
    diagnostics: {
      keyDetected: hasKey,
      keyVerified: keyValid,
      keyPreview: keySnippet,
      credits: credits,
      env: process.env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  });
}
