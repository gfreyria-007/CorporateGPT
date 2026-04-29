import { Type } from "@google/genai";

export interface InfographicData {
  title: string;
  subtitle: string;
  sections: {
    title: string;
    description: string;
    value?: number;
    iconHint?: string;
  }[];
  conclusions: string[];
  themeColor?: string;
}

export interface StudioSlideData {
  id: string;
  type: 'hero' | 'infographic' | 'diagram' | 'metric_focus' | 'process_flow';
  title: string;
  subtitle: string;
  content: {
    label?: string;
    value?: string;
    description?: string;
    iconHint?: string;
  }[];
  badge?: string;
  imagePrompt?: string;
  visualStrategy: string;
}

export async function generateStudioSlides(prompt: string, mood: string, lang: 'en' | 'es'): Promise<StudioSlideData[]> {
  const model = "gemini-1.5-pro"; // Nano Banana 2 (High Intelligence)
  
  const systemInstruction = `You are the Neural Studio Engine 4.0. Your goal is to synthesize a set of 5-7 high-fidelity presentation slides.
  Topic: "${prompt}"
  Mood: "${mood}"
  Language: "${lang}"

  Instructions for High-Fidelity Results:
  1. DO NOT return generic text. Provide deep, professional insights.
  2. Map each slide to a specific 'type':
     - 'hero': High-impact title with a dramatic badge and subtitle.
     - 'infographic': 3-4 data points with specific metrics and labels.
     - 'diagram': 3 interconnected concepts with a central visual theme.
     - 'metric_focus': One large, dominating statistic with a detailed analysis paragraph.
     - 'process_flow': A 4-step professional transition.
  3. Visual Strategy: Describe how to integrate the data (e.g. "Use a vertical offset grid", "Floating glassmorphism labels").
  4. Badge: Add an executive status like "STRATEGIC DEPLOYMENT" or "SYSTEM ARCHITECTURE".
  
  Return a JSON array of slides.`;

  const payload = {
    model,
    contents: `Generate 5 slides for: "${prompt}".`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["hero", "infographic", "diagram", "metric_focus", "process_flow"] },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            badge: { type: Type.STRING },
            content: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  description: { type: Type.STRING },
                  iconHint: { type: Type.STRING }
                }
              }
            },
            visualStrategy: { type: Type.STRING },
            imagePrompt: { type: Type.STRING, description: "Detailed prompt for DALL-E/Midjourney style background" }
          },
          required: ["id", "type", "title", "subtitle", "content"]
        }
      }
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  const response = await res.json();
  const text = response.text || "[]";
  return JSON.parse(text);
}

export async function suggestBetterPrompt(currentPrompt: string): Promise<string> {
  const payload = {
    model: "gemini-3.1-pro-preview",
    contents: `The user wants to generate an AMAZING infographic or visual asset with this prompt: "${currentPrompt}".
    Improve this prompt to be high-density, professional, and visually stunning.
    Instructions:
    - Add specific artistic directions (e.g. "detailed hand-drawn pencil sketches with color accents", "clean minimalist Bauhaus style", "vibrant 3D clay illustrations").
    - Specify composition (e.g. "centered focal point", "balanced multi-step flow").
    - If it's about a life cycle (like an apple tree), ensure it mentions stages like seed, sprout, sapling, blossom, and fruit.
    - Return ONLY the improved prompt text. No quotes.`,
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  const response = await res.json();
  return response.text?.trim() || currentPrompt;
}

export async function salesAgentChat(message: string, lang: 'en' | 'es'): Promise<string> {
  const model = "gemini-3-flash-preview"; 
  
  const systemInstruction = lang === 'es' ? 
    `ERES EL ASESOR CORPORATIVO DE CORPORATEGPT. 
    REGLA DE ORO: Solo hablas de CorporateGPT, seguridad, privacidad, costos por tokens vs suscripciones y beneficios para PyMEs.
    OBJETIVO: Convertir al usuario en cliente pago.
    Puntos Clave:
    - Privacidad: Los datos NO se usan para entrenamiento (a diferencia de ChatGPT gratis).
    - Costo: Los tokens son 60% más baratos por volumen que pagar licencias individuales.
    - Casos de Uso: Agentes de RR.HH. con LFT (Ley Federal del Trabajo), asistentes legales, análisis de datos privados.
    - Control: El empresario pone las reglas.
    Si te preguntan algo ajeno a ventas o al producto, responde amablemente que tu especialidad es asesorar en la implementación de IA Privada para empresas.` : 
    `YOU ARE THE CORPORATE ADVISOR FOR CORPORATEGPT.
    GOLDEN RULE: Only talk about CorporateGPT, security, privacy, token costs vs subscriptions, and benefits for SMEs.
    OBJECTIVE: Convert the user into a paying client.
    Key Points:
    - Privacy: Data is NOT used for training (unlike free ChatGPT).
    - Cost: Tokens are 60% cheaper in volume than paying for individual licenses.
    - Use Cases: HR agents with local laws, legal assistants, private data analysis.
    - Control: The business owner sets the rules.
    If asked about anything outside sales or the product, politely state that your specialty is advising on Private AI implementation for businesses.`;

  const payload = {
    model,
    config: { systemInstruction },
    message
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'chat', payload })
  });
  const result = await res.json();
  return result.text || "";
}

