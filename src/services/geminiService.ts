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
  type: 'hero' | 'infographic' | 'diagram' | 'metric_focus' | 'process_flow' | 'data_breakdown' | 'comparative_analysis';
  narrativePhase: string; // Intro, Problem, Data, Solution, etc.
  title: string;
  subtitle: string;
  content: {
    label?: string;
    value?: string;
    description?: string;
    iconHint?: string;
    tableData?: { [key: string]: string }[];
  }[];
  badge?: string;
  imagePrompt?: string;
  visualStrategy: string;
  visualLayout: 'split' | 'grid' | 'focal' | 'dense_table' | 'technical_drawing';
  aiSuggestedMood?: string;
}

export async function generateStudioSlides(prompt: string, mood: string, lang: 'en' | 'es'): Promise<{ slides: StudioSlideData[], finalMood: string }> {
  const model = "gemini-1.5-pro"; 
  
  const systemInstruction = `You are the Neural Studio Engine 5.0 (Cinematic Storyteller). 
  Goal: Synthesize a NON-EDITABLE 10-slide professional infographic narrative.
  Reference Style: High-density, professional astrophysical data visuals (Solar System style).
  
  Instructions:
  1. NARRATIVE: Create a 10-slide arc: 
     Slide 1: Executive Opening
     Slide 2-3: Context & Challenges
     Slide 4-6: Deep Data Breakdown (High Density)
     Slide 7-8: Strategic Architecture & Comparative Analysis
     Slide 9: Growth Projection
     Slide 10: Final Authority Conclusion
  
  2. DATA DENSITY: Every slide must be "Dense". Use tables, metric grids, and detailed labels. NO wall of text.
  
  3. VISUAL LAYOUT:
     - 'dense_table': Technical comparison with columns and rows.
     - 'technical_drawing': Central masked image with floating annotations.
     - 'grid': 4-6 distinct cards with icons and data.
  
  4. MOOD SELECTION: If "ai_orchestrator", choose the absolute best style for this topic.
  
  Return JSON: { "slides": [...], "finalMood": "style" }`;

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

export async function generateInfographicContent(prompt: string, style: string): Promise<InfographicData> {
  const payload = {
    model: "gemini-1.5-flash",
    contents: `Generate a structured infographic about: "${prompt}". Style: ${style}. 
    Return JSON format only.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          themeColor: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                value: { type: Type.NUMBER }
              }
            }
          },
          conclusions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "subtitle", "sections", "conclusions"]
      }
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  const response = await res.json();
  return JSON.parse(response.text || '{}');
}

