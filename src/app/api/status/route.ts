import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.OPENROUTER_API_KEY;
  const keyPrefix = process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) : "none";
  
  return NextResponse.json({
    status: hasKey ? "active" : "offline",
    diagnostics: {
      keyDetected: hasKey,
      keyPrefix: keyPrefix,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    }
  });
}
