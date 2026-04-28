import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const hasKey = !!apiKey;
  let keyValid = false;
  let errorDetail = null;

  if (hasKey) {
    try {
      // Live ping to verify key validity
      const verify = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      const data = await verify.json();
      if (verify.ok && data.data) {
        keyValid = true;
      } else {
        errorDetail = data.error?.message || "Invalid Key or No Credits";
      }
    } catch (e) {
      errorDetail = "Connection Timeout";
    }
  }
  
  return NextResponse.json({
    status: keyValid ? "active" : hasKey ? "fault" : "offline",
    details: errorDetail,
    diagnostics: {
      keyDetected: hasKey,
      keyVerified: keyValid,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  });
}
