
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Testing with API Key:", apiKey ? "FOUND" : "NOT FOUND");
  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log("AI Instance created");
    // Try to list models or something
    console.log("AI object keys:", Object.keys(ai));
  } catch (e) {
    console.error("Test failed:", e);
  }
}

test();
