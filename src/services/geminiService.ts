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
  aiSuggestedMood?: string; // AI decides the style
}

export async function generateStudioSlides(prompt: string, mood: string, lang: 'en' | 'es'): Promise<{ slides: StudioSlideData[], finalMood: string }> {
  const model = "gemini-1.5-pro"; 
  
  const systemInstruction = `You are the Neural Studio Engine 4.2. Your goal is to synthesize a set of 5-7 high-fidelity presentation slides.
  Topic: "${prompt}"
  Requested Mood: "${mood}"
  Language: "${lang}"

  Instructions for High-Fidelity Results:
  1. If Mood is "ai_orchestrator", ANALYZE the context of the data and SELECT the best visual language from these styles: [corporativo, lego, boceto, laboratorio, brutalista, arcilla_3d, pizarron_blanco, pizarron_verde, pizarron_negro, plano_tecnico, cuantico, manuscrito, retro_80s, minimal_jp, ciberpunk].
  2. DO NOT return generic text. Provide deep, professional insights.
  3. Map each slide to a specific 'type':
     - 'hero': High-impact title.
     - 'infographic': 3-4 data points.
     - 'diagram': 3 concepts with central visual.
     - 'metric_focus': One large statistic.
     - 'process_flow': 4-step transition.
  
  Return a JSON object: { "slides": [...], "finalMood": "selected_style_name" }`;

  const payload = {
    model,
    contents: `Generate 5 slides for: "${prompt}".`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          finalMood: { type: Type.STRING },
          slides: {
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
                imagePrompt: { type: Type.STRING }
              },
              required: ["id", "type", "title", "subtitle", "content"]
            }
          }
        },
        required: ["slides", "finalMood"]
      }
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  const response = await res.json();
  const text = response.text || '{"slides":[], "finalMood": "corporativo"}';
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

