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
  userImageUrl?: string;
  generatedImageUrl?: string;
  rendered?: boolean;
  visualLayout?: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  hint: string;
  type: 'open' | 'choice';
  choices?: string[];
}

export async function generateClarifyingQuestions(prompt: string): Promise<ClarifyingQuestion[]> {
  const payload = {
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: 
`You are a premium corporate presentation architect. The user wants to generate a high-impact presentation about: "${prompt}"

To create an exceptional deck, you must first clarify the vision. 
Generate 2-3 strategic, high-value questions that help define the audience, objective, and desired outcome.

CRITICAL: 
- One question should be about the TARGET AUDIENCE or STAKEHOLDERS (choice).
- One question should be about the DESIRED EMOTION or KEY TAKEAWAY (choice).
- One question (optional) should be about specific technical data or context (open).

Respond in the SAME language as the user's prompt.

Return ONLY this JSON structure, nothing else:
{
  "questions": [
    {
      "id": "q1",
      "question": "Smart strategic question?",
      "hint": "Brief explanation of why this matters for the slides",
      "questionType": "choice",
      "choices": ["Option 1", "Option 2", "Option 3"]
    },
    {
      "id": "q2", 
      "question": "Another strategic question?", 
      "hint": "Context for the user",
      "questionType": "open",
      "choices": []
    }
  ]
}`
    }] }],
    config: { responseMimeType: "application/json" }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("[GEMINI SERVICE] Clarify Error:", res.status, errorData);
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  const response = await res.json();
  
  const raw = response.questions || (response.text ? (() => {
    try {
      const t = response.text.replace(/```json/g,'').replace(/```/g,'').trim();
      return JSON.parse(t).questions;
    } catch { return null; }
  })() : null);

  if (!raw || !Array.isArray(raw)) return [];

  // Normalize: map questionType → type for the interface
  return raw.map((q: any, i: number) => ({
    id: q.id || `q${i+1}`,
    question: q.question || '',
    hint: q.hint || '',
    type: (q.questionType === 'choice' || q.type === 'choice') ? 'choice' : 'open',
    choices: Array.isArray(q.choices) && q.choices.length > 0 ? q.choices : undefined
  }));
}


export async function generateStylePreview(prompt: string, mood: string, lang: 'en' | 'es'): Promise<{ preview: StudioSlideData, suggestedMood: string }> {
  const systemInstruction = `You are the Creative Director for Neural Studio 5.0. 
  Current Date context: ${new Date().toISOString().split('T')[0]}. The current year is 2026.
  Generate ONE preview slide that establishes the visual language for: "${prompt}".
  Choose the best mood for the data.
  Layouts: 'dense_table', 'technical_drawing', 'grid'.`;

  const payload = {
    model: "gemini-3.1-pro-preview",
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
  // Proxy spreads all JSON fields at top level — use them directly with fallback
  if (response.preview) return { preview: response.preview, suggestedMood: response.suggestedMood || mood };
  try { return JSON.parse((response.text || '{}').replace(/```json/g,'').replace(/```/g,'').trim()); }
  catch { return { preview: null, suggestedMood: mood }; }
}

export async function generateStudioSlides(prompt: string, mood: string, lang: 'en' | 'es'): Promise<{ slides: StudioSlideData[], finalMood: string }> {
  const model = "gemini-3.1-pro-preview"; 
  
  const systemInstruction = `You are the Neural Studio Engine 5.0 (Cinematic Storyteller). 
  Current Date context: ${new Date().toISOString().split('T')[0]}. The current year is 2026.
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("[GEMINI SERVICE] Studio Gen Error:", res.status, errorData);
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

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
  const model = "gemini-3.1-pro-preview"; 
  
  const systemInstruction = lang === 'es' ? 
    `ERES EL ASESOR CORPORATIVO DE CORPORATEGPT. 
    Contexto de fecha actual: ${new Date().toISOString().split('T')[0]}. El año actual es 2026.
    REGLA DE ORO: Solo hablas de CorporateGPT, seguridad, privacidad, costos por tokens vs suscripciones y beneficios para PyMEs.
    OBJETIVO: Convertir al usuario en cliente pago.
    Puntos Clave:
    - Privacidad: Los datos NO se usan para entrenamiento (a diferencia de ChatGPT gratis).
    - Costo: Los tokens son 60% más baratos por volumen que pagar licencias individuales.
    - Casos de Uso: Agentes de RR.HH. con LFT (Ley Federal del Trabajo), asistentes legales, análisis de datos privados.
    - Control: El empresario pone las reglas.
    Si te preguntan algo ajeno a ventas o al producto, responde amablemente que tu especialidad es asesorar en la implementación de IA Privada para empresas.` : 
    `YOU ARE THE CORPORATE ADVISOR FOR CORPORATEGPT.
    Current Date context: ${new Date().toISOString().split('T')[0]}. The current year is 2026.
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
    model: "gemini-3.1-pro-preview",
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
  // Proxy spreads all JSON fields — use them directly
  if (response.title) return response as InfographicData;
  try { return JSON.parse((response.text || '{}').replace(/```json/g,'').replace(/```/g,'').trim()); }
  catch { return { title: '', subtitle: '', sections: [], conclusions: [] }; }
}

export async function generateSkeleton(prompt: string, count: number = 10): Promise<SlideSkeleton[]> {
  const systemInstruction = `You are a high-level Presentation Architect at Catalizia. 
  Current Date context: ${new Date().toISOString().split('T')[0]}. The current year is 2026.
  The user is creating a presentation on: "${prompt}".
  
  CONTEXTUAL INTELLIGENCE:
  - If additional context from a "Neural Interview" is provided, you MUST synthesize and prioritize it.
  - Generate EXACTLY ${count} slides that form a cohesive, strategic narrative.
  - content array: 3-5 high-density, professional bullet points. Use specific data, names, and industry-standard insights.
  - Each slide MUST have a distinct, high-impact title and a context-setting subtitle.
  
  STYLE & TONE:
  - Corporate, sophisticated, and data-driven.
  - Respond in the SAME language as the prompt.
  - Return ONLY the JSON object, nothing else.`;

  const payload = {
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: `Generate EXACTLY ${count} content-rich slides for this topic: "${prompt}".
    IMPORTANT: Fill each slide with REAL, SPECIFIC information. No placeholder text.
    For at least 3-4 slides, choose an appropriate chartType (bar, line, pie, etc.) and provide the corresponding REAL DATA in 'tableData' (format: Label,Value\nLabel,Value).
    Return as JSON: { "slides": [{ "id": "1", "title": "Specific Title", "subtitle": "Descriptive subtitle", "content": ["Concrete fact 1", "Specific data point 2", "Real insight 3"], "chartType": "bar", "tableData": "Q1,450\nQ2,620\nQ3,580\nQ4,910" }] }` }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                chartType: { type: Type.STRING, enum: ["none", "bar", "line", "pie", "donut", "radar", "scatter", "bubble"] },
                tableData: { type: Type.STRING }
              },
              required: ["id", "title", "subtitle", "content", "chartType"]
            }
          }
        },
        required: ["slides"]
      }
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("[GEMINI SERVICE] Skeleton Gen Error:", res.status, errorData);
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  const response = await res.json();

  // Multi-path parsing for maximum reliability
  if (response.slides && response.slides.length > 0) return response.slides;
  if (response.text) {
    try {
      const parsed = JSON.parse(response.text);
      if (parsed.slides && parsed.slides.length > 0) return parsed.slides;
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Try to extract JSON from text
      const match = response.text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const extracted = JSON.parse(match[0]);
          if (extracted.slides) return extracted.slides;
        } catch { /* ignore */ }
      }
    }
  }
  return [];
}

export async function regenerateSlideSkeleton(slideIndex: number, fullContext: string): Promise<SlideSkeleton> {
  const payload = {
    model: "gemini-3.1-pro-preview",
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

export async function renderSlideVisual(
  title: string, 
  subtitle: string, 
  content: string[], 
  style: string,
  chartType: string = 'none',
  tableData: string = '',
  hasLogo: boolean = false
): Promise<{ visualLayout: string, badge: string, narrativePhase: string, visualInstruction?: string, chartType?: string, tableData?: string }> {
  const systemInstruction = `You are a Visual Architect using the NANOBANANA 2 ENGINE. 
  Current Date context: ${new Date().toISOString().split('T')[0]}. The current year is 2026.
  Generate a high-fidelity visual configuration for this slide.
  
  NANOBANANA 2 STYLE DICTIONARY:
  - scientific: High-density astrophysical visuals, schematics with labels, technical cross-sections, data-rich infographics.
  - bricks: Modular LEGO-style aesthetic, vibrant primary colors, brick-built charts and structures, playful yet professional data.
  - sketch: Hand-drawn artistic style, charcoal/ink strokes, rough textures, creative whiteboard feel.
  - kawaii: Pastel colors, rounded shapes, adorable characters/mascots, soft gradients, friendly UI.
  - anime: High-energy shonen aesthetic, speed lines, vibrant glowing effects, dramatic perspective.
  - clay: 3D stop-motion clay style, soft shadows, fingerprint textures, handcrafted organic feel.
  - editorial: High-end magazine layout, bold typography, monochromatic with accent colors, white-space focus.
  - bento: Modular grid layout (Bento Grid), glassmorphism, depth layers, clean functional sections.
  - professional: Executive corporate style, dark blue/slate tones, clean lines, minimalist yet powerful.
  
  NANOBANANA 2 RULES:
  - Maximize visual density and data clarity.
  - Layouts: 'hero', 'split', 'grid', 'focal', 'technical_drawing', 'dense_table', 'chart_focused'.
  - Style: ${style === 'auto' ? 'SURPRISE ME: Analyze the content and choose the most impactful visual metaphor, layout, and style from the dictionary or invent a superior one.' : style}.
  - Logo: ${hasLogo ? 'A company logo is available. Suggest a placeholder or coordinate for it.' : 'No logo.'}
  - If a chartType is specified (not 'none'), prioritize the 'chart_focused' layout and provide specific drawing instructions.`;

  const chartContext = chartType !== 'none' 
    ? `\nCHART REQUESTED: ${chartType}\nDATA: ${tableData}`
    : '';

  const payload = {
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts: [{ text: `Title: ${title}. Content: ${content.join(' | ')}. Style: ${style}. ${chartContext}
    Return JSON: { 
      "visualLayout": "...", 
      "badge": "...", 
      "narrativePhase": "...", 
      "visualInstruction": "detailed instructions for the UI to render the visual or chart",
      "chartType": "${chartType !== 'none' ? chartType : 'suggest a type if data exists'}",
      "tableData": "suggest real data if missing or chartType is set"
    }` }] }],
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
  
  // Robust parsing
  let result = response;
  if (response.text) {
    try {
      result = JSON.parse(response.text.replace(/```json/g,'').replace(/```/g,'').trim());
    } catch { /* fallback */ }
  }

  return {
    visualLayout: result.visualLayout || 'split',
    badge: result.badge || 'PHASE',
    narrativePhase: result.narrativePhase || 'ANALYSIS',
    visualInstruction: result.visualInstruction || '',
    chartType: result.chartType || chartType,
    tableData: result.tableData || tableData
  };
}

export async function generateProImageForSlide(
  title: string,
  subtitle: string,
  content: string[],
  style: string,
  chartType: string = 'none',
  tableData: string = '',
  userImage?: string
): Promise<string> {
  const prompt = `NANOBANANA INFOGRAPHIC ENGINE: Create a world-class, premium corporate presentation slide.
Title: "${title}"
Subtitle: "${subtitle}"
Visual Concept: Integrated infographic combining data and text.
Key Points to Include: ${content.join(' | ')}
Data Context (if any): ${chartType !== 'none' ? `Detailed ${chartType} visualization: ${tableData}` : 'None'}

Style Requirement: ${style}. 

MANDATORY DESIGN RULES:
1. PRECISE INTEGRATION: All elements (text, data, icons) must be part of a single cohesive visual architecture.
2. PREMIUM AESTHETIC: Use breathtaking gradients, shadows, and spacing typical of elite design studios.
3. DATA DENSITY: Ensure high visual complexity and professional technical fidelity.
4. COHESION: The slide must look like a complete, finished infographic, not just a picture.
5. NO ARTIFACTS: Do not include placeholder text. Render actual titles and points in a cinematic 16:9 layout.`;

  const payload = {
    model: 'gemini-2.0-pro-exp-02-05',
    contents: { 
      parts: [
        { text: prompt },
        ...(userImage ? [{ inlineData: { mimeType: 'image/jpeg', data: userImage.includes('base64,') ? userImage.split('base64,')[1] : userImage } }] : [])
      ]
    },
    config: {
      temperature: 1,
      responseModalities: ['IMAGE'],
      imageConfig: { 
        aspectRatio: '16:9'
      }
    }
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generateContent', payload })
  });
  
  const imgRes = await res.json();
  if (imgRes.error) {
    throw new Error(imgRes.error);
  }

  const imgPart = imgRes.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!imgPart) {
    throw new Error('No image was generated. The model returned text only.');
  }

  return `data:${imgPart.inlineData.mimeType || 'image/png'};base64,${imgPart.inlineData.data}`;
}

