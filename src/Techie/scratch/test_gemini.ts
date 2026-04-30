import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const apiKey = process.env.VITE_GEMINI_API_KEY;
console.log("Using API Key:", apiKey ? "FOUND" : "NOT FOUND");

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

async function test() {
  try {
    console.log("Starting test...");
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hola, responde con un JSON simple: {\"test\": true}" }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    console.log("Full Result keys:", Object.keys(result));
    console.log("Text property type:", typeof result.text);
    console.log("Text value:", result.text);
    if (result.candidates) {
        console.log("Candidates[0] content parts:", JSON.stringify(result.candidates[0].content.parts));
    }
  } catch (e) {
    console.error("Test failed:", e);
  }
}

test();
