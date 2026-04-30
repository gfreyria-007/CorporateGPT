import { Type } from "@google/genai";

// Use VITE_ prefix for client-side (if needed) and non-prefix for server-side/backend compatibility
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";

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
  visualLayout: 'split' | 'grid' | 'dense_table' | 'technical_drawing' | 'focal' | 'hero';
  aiSuggestedMood?: string;
}

export interface SlideSkeleton {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  tableData?: string;
  chartType?: string;
}

export async function generateStylePreview(prompt: string, mood: string, lang: 'en' | 'es'): Promise<{ preview: StudioSlideData, suggestedMood: string }> {
  const systemInstruction = `You are the Creative Director for Neural Studio 5.0. 
  Generate ONE preview slide that establishes the visual language for: "${prompt}".
  Choose the best mood for the data.
  Layouts: 'dense_table', 'technical_drawing', 'grid'.`;

  const payload = {
    model: "gemini-1.5-flash",
    contents: [{ role: "user", parts: [{ text: `Establish the visual concept for: "${prompt}".` }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedMood: { type: Type.STRING },
          preview: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              visualLayout: { type: Type.STRING, enum: ["split", "grid", "focal", "dense_table", "technical_drawing"] },
              content: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["id", "type", "title", "visualLayout", "content"]
          }
        },
        required: ["preview", "suggestedMood"]
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

export async function generateStudioSlides(prompt: string, mood: string, lang: 'en' | 'es'): Promise<{ slides: StudioSlideData[], finalMood: string }> {
  const model = "gemini-1.5-flash"; 
  
  const systemInstruction = `You are the Neural Studio Engine 5.0 (Cinematic Storyteller). 
  Goal: Synthesize a NON-EDITABLE 10-slide professional infographic narrative.
  Reference Style: High-density astrophysical data visuals.
  
  MANDATORY: 
  - Every slide MUST have a 'visualLayout' set to one of: 'dense_table', 'technical_drawing', 'grid', 'split', 'focal'.
  - Narrative Arc: Intro -> Conflict -> 3 Data Deep-Dives -> Technical Solution -> Roadmap -> Conclusion.
  
  Return JSON: { "slides": [...], "finalMood": "style" }`;

  const payload = {
    model,
    contents: [{ role: "user", parts: [{ text: `Synthesize the full 10-slide narrative for: "${prompt}". Ensure visualLayout is always present.` }] }],
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
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                visualLayout: { type: Type.STRING, enum: ["split", "grid", "focal", "dense_table", "technical_drawing"] },
                narrativePhase: { type: Type.STRING },
                content: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      description: { type: Type.STRING }
                    }
                  }
                }
              },
              required: ["id", "type", "title", "visualLayout", "content"]
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
  
  // High-reliability parsing: find slides in either 'slides' or 'text'
  if (response.slides && response.slides.length > 0) return response;
  
  const text = response.text || '{"slides":[], "finalMood": "corporativo"}';
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse error in full gen:", e);
    return { slides: [], finalMood: mood };
  }
}

export async function suggestBetterPrompt(currentPrompt: string): Promise<string> {
  const payload = {
    model: "gemini-1.5-pro",
    contents: [{ role: "user", parts: [{ text: `The user wants to generate an AMAZING infographic or visual asset with this prompt: "${currentPrompt}".
    Improve this prompt to be high-density, professional, and visually stunning.
    Instructions:
    - Add specific artistic directions (e.g. "detailed hand-drawn pencil sketches with color accents", "clean minimalist Bauhaus style", "vibrant 3D clay illustrations").
    - Specify composition (e.g. "centered focal point", "balanced multi-step flow").
    - If it's about a life cycle (like an apple tree), ensure it mentions stages like seed, sprout, sapling, blossom, and fruit.
    - Return ONLY the improved prompt text. No quotes.` }] }],
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
  const model = "gemini-1.5-flash"; 
  
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
    contents: [{ role: "user", parts: [{ text: `Generate a structured infographic about: "${prompt}". Style: ${style}. Return JSON format only.` }] }],
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

export async function generateSkeleton(prompt: string, count: number = 10): Promise<SlideSkeleton[]> {
  const systemInstruction = `You are a Narrative Architect. 
  Create a ${count}-slide presentation skeleton for: "${prompt}".
  Focus ONLY on the story and data points. 
  Return a JSON array of slides.`;

  const payload = {
    model: "gemini-1.5-flash",
    contents: [{ role: "user", parts: [{ text: `Generate ${count} slides for: "${prompt}". 
    Format: { "slides": [{ "id": "1", "title": "...", "subtitle": "...", "content": ["point 1", "point 2"] }] }` }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  
  const response = await res.json();
  return response.slides || [];
}

export async function regenerateSlideSkeleton(slideIndex: number, fullContext: string): Promise<SlideSkeleton> {
  const payload = {
    model: "gemini-1.5-flash",
    contents: [{ role: "user", parts: [{ text: `Regenerate ONLY slide number ${slideIndex + 1} for this presentation: "${fullContext}". 
    Return ONE slide object.` }] }],
    config: {
      responseMimeType: "application/json"
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  
  const response = await res.json();
  return (response.slides && response.slides[0]) || response;
}

export async function renderSlideVisual(title: string, subtitle: string, content: string[], style: string): Promise<{ visualLayout: string, badge: string, narrativePhase: string }> {
  const systemInstruction = `You are a Visual Architect using the NANOBANANA 2 ENGINE. 
  Generate a high-fidelity visual configuration for this slide.
  NANOBANANA 2 RULES:
  - Maximize visual density and data clarity.
  - Layouts: 'hero', 'split', 'grid', 'focal', 'technical_drawing', 'dense_table'.
  - Style: ${style}.`;

  const payload = {
    model: "gemini-1.5-flash",
    contents: [{ role: "user", parts: [{ text: `Title: ${title}. Content: ${content.join(' | ')}. Style: ${style}. 
    Return JSON: { "visualLayout": "...", "badge": "...", "narrativePhase": "..." }` }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  
  const response = await res.json();
  const slides = response.slides || [];
  return slides[0] || response;
}
