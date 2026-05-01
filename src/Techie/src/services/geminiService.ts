
import { GoogleGenAI, Type } from "@google/genai";
import { Grade, ChatMode, ExamQuestion, QuizOption, AspectRatio, ImageSize, Flashcard, ImageStyle, LightingStyle } from '../types';
import { fileToGenerativePart } from '../utils/audio';
import { STUDIO_STYLES, LIGHTING_PRESETS } from '../constants';
import { logger } from '../logger';

export const cleanJsonString = (str: string): string => {
  if (!str) return '';
  let clean = str.replace(/```json\n?|```/g, '').trim();
  return clean;
};

export const getResponseText = (response: any): string => {
    if (!response) return '';
    if (typeof response.text === 'string') return response.text;
    if (typeof response.text === 'function') {
        try { return response.text(); } catch (e) { console.error("Error calling response.text():", e); }
    }
    // Deep extraction for @google/genai SDK candidates
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
        return candidate.content.parts[0].text;
    }
    // Fallback for simple message responses
    if (response.message?.content?.parts?.[0]?.text) {
        return response.message.content.parts[0].text;
    }
    return '';
};

const moderatePrompt = (prompt: string): boolean => {
    if (!prompt) return false;
    
    const forbidden = [
        // Sexual / Nudity
        /vagina/i, /pene/i, /sex/i, /porn/i, /nude/i, /naked/i, /desnudo/i, /encuerar/i, /quitar.*ropa/i, /sin.*ropa/i, /culo/i, /tetas/i, /boobs/i, /ass/i,
        // Violence / Gore
        /gore/i, /violenc/i, /sangre/i, /blood/i, /matar/i, /asesin/i, /kill/i, /suicid/i, /mutila/i, /tortura/i,
        // Profanity / Hate / Racism
        /explicit/i, /vulgar/i, /hate/i, /racist/i, /bitch/i, /fuck/i, /put[oa]/i, /mierda/i, /pendej/i, /cabron/i, /idiota/i, /imbecil/i,
        // Prompt Injection / Jailbreak
        /ignora.*instruccion/i, /ignore.*instruction/i, /olvida.*anterior/i, /forget.*previous/i, /system.*prompt/i, /eres.*ahora/i, /you.*are.*now/i, /desactiva.*filtro/i, /disable.*filter/i, /dan/i, /jailbreak/i,
        // Drugs & Harmful substances
        /droga/i, /drug/i, /cocaina/i, /heroina/i, /metanfe/i, /weed/i, /marihuana/i, /alcohol/i, /cigarro/i, /vape/i,
        // Weapons & Illegal acts
        /arma/i, /weapon/i, /pistola/i, /gun/i, /bomba/i, /bomb/i, /explosivo/i, /robar/i, /steal/i, /hackear/i, /hack/i,
        // Bullying & Harassment
        /feo/i, /tonto/i, /fat/i, /gordo/i, /loser/i, /fracasado/i, /cortarme/i, /lastimar/i, /hurt/i
    ];
    
    return forbidden.some(regex => regex.test(prompt));
};

const SAFETY_MANDATE = `
    POLÍTICA DE SEGURIDAD CRÍTICA: 
    - Eres una IA educativa para menores de edad. 
    - NUNCA generes contenido sexual, violento, de odio o que promueva actos ilegales o sustancias nocivas (drogas, alcohol). 
    - Si un usuario pide algo inapropiado, recházalo amablemente con el mensaje estándar y sugiere una alternativa educativa positiva.
    - Mantén siempre el tono de un tutor protector, ético y alentador.
`;

const SAFETY_SETTINGS: any[] = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
];

const GUARDRAIL_ERROR = "Lo siento, como IA educativa de Catalizia no puedo procesar o responder a esa solicitud porque va en contra de nuestras políticas de seguridad para menores.";

const getAI = (customKey?: string) => {
    // Check multiple places for the API key to ensure it works locally and on Vercel
    const metaEnv = (import.meta as any).env || {};
    const apiKey = customKey || metaEnv.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
    if (!apiKey) {
        logger.system('GEMINI_API_KEY not found in environment variables');
    }
    return new GoogleGenAI({ apiKey: apiKey || "" });
};


export const generateImage = async (
    prompt: string, 
    aspectRatio: AspectRatio, 
    grade: Grade, 
    userName: string,
    style: ImageStyle = 'none', 
    lighting: LightingStyle = 'none',
    embeddedText?: string,
    imageSize: ImageSize = '1K',
    sourceImage?: string, // Opcional para Image-to-Image
    customKey?: string
): Promise<{ url: string, enhancedPrompt: string } | null> => {

    
    if (moderatePrompt(prompt)) {
        throw new Error(GUARDRAIL_ERROR);
    }

    const ai = getAI(customKey);

    
    const strictConstraints = `
        STRICT MANDATE: 
        - ABSOLUTELY NO TEXT, NO LABELS, NO LETTERS, NO NUMBERS IN THE IMAGE.
        - FOCUS EXCLUSIVELY ON THE TOPIC: "${prompt}".
        - CONTEXT: This is for a student in ${grade.name} (approx ${grade.age} years old).
        - STYLE: Educational, clear, professionally rendered.
        - PURE VISUAL REPRESENTATION ONLY.
    `;

    let finalPrompt = `Subject: ${prompt}. ${strictConstraints}`;
    if (style !== 'none' && STUDIO_STYLES[style]) {
        finalPrompt += ` Style: ${STUDIO_STYLES[style].prompt}.`;
    }

    const contents: any = { parts: [{ text: finalPrompt }] };
    
    if (sourceImage) {
        const mimeType = sourceImage.split(';')[0].split(':')[1];
        const base64Data = sourceImage.split(',')[1];
        contents.parts.unshift({ inlineData: { data: base64Data, mimeType: mimeType } });
        finalPrompt = `Based on the provided sketch/image, generate a final professional version of: ${prompt}. ${strictConstraints}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents,
            config: { 
                systemInstruction: "You are the Visual Architect of the NANOBANANA 2 ENGINE (Kids Edition). Generate high-fidelity, professional, and educational artwork. No text allowed in images.",
                imageConfig: { aspectRatio },
                safetySettings: SAFETY_SETTINGS
            }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part) return { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, enhancedPrompt: 'Generación de Imagen' };
    } catch (e: any) {
        console.error("Image generation failed", e);
    }
    return null;
};

export const editImage = async (
    source: File | string, 
    prompt: string, 
    grade: Grade, 
    maskBase64?: string,
    style: ImageStyle = 'none',
    systemInstructions?: string,
    customKey?: string
): Promise<string | null> => {

    if (moderatePrompt(prompt)) {
        throw new Error(GUARDRAIL_ERROR);
    }

    const ai = getAI(customKey);

    
    let imagePart;
    if (typeof source === 'string') {
        const mimeType = source.split(';')[0].split(':')[1];
        const base64Data = source.split(',')[1];
        imagePart = { inlineData: { data: base64Data, mimeType: mimeType } };
    } else {
        imagePart = await fileToGenerativePart(source);
    }

    const parts: any[] = [imagePart];
    
    let editModePrompt = "";
    if (maskBase64) {
        parts.push({ 
            inlineData: { 
                mimeType: 'image/png', 
                data: maskBase64.split(',')[1] 
            } 
        });
        editModePrompt = `
            TASK: LOCAL IMAGE EDITING (IN-PAINTING).
            MASK INFO: The second image provided is a binary mask.
            - WHITE AREAS (#FFFFFF) in the mask: COMPLETELY RE-RENDER this area.
            - BLACK AREAS (#000000) in the mask: KEEP UNTOUCHED.
            INSTRUCTION: Replace the masked area with "${prompt}". 
            IMPORTANT: If there are drawings or annotations in the masked area, convert them into realistic/stylized objects as requested.
        `;
    } else {
        editModePrompt = `
            TASK: GLOBAL IMAGE TRANSFORMATION.
            INSTRUCTION: Redraw the image incorporating the prompt: "${prompt}".
            CRITICAL: Respect and incorporate any sketches, drawings or annotations visible on the current image. They are your blueprint.
        `;
    }
    
    let styleConstraint = "";
    if (style !== 'none' && STUDIO_STYLES[style]) {
        styleConstraint = `MANDATORY STYLE: Apply "${STUDIO_STYLES[style].label}" style: ${STUDIO_STYLES[style].prompt}.`;
    }

    const finalInstruction = `
        ${editModePrompt}
        ${styleConstraint}
        ${systemInstructions ? `ADDITIONAL GUIDELINE: ${systemInstructions}` : ''}
        
        CRITICAL RULES:
        1. REFLECT DRAWINGS: Any manual strokes or annotations in the source are visual instructions. Render them professionally.
        2. NO TEXT: Do not add letters or numbers.
        3. HIGH FIDELITY: Ensure the final output is a high-quality realization of the user's intent.
    `;

    parts.push({ text: finalInstruction });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: { parts },
            config: { 
                systemInstruction: "You are an expert digital artist for kids using the NANOBANANA 2 ENGINE. You interpret source images and user sketches with high precision. Your goal is to turn manual annotations into polished, professional artwork while strictly following the prompt and the provided mask logic. Always ensure the output is safe and educational.",
                safetySettings: SAFETY_SETTINGS
            }
        });

        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : null;
    } catch (e: any) {
        console.error("Image editing failed", e);
        throw e;
    }
};

export const getChatResponse = async (
    history: any[], 
    grade: Grade, 
    userName: string | null, 
    age: number | null, 
    mode: ChatMode, 
    temperature: number, 
    persona: string | null, 
    customInstruction: string,
    customKey?: string
) => {
    // Verificar si el último mensaje del usuario viola las reglas de seguridad
    const lastUserMessage = [...history].reverse().find((msg: any) => msg.role === 'user');
    if (lastUserMessage && lastUserMessage.parts && lastUserMessage.parts[0] && moderatePrompt(lastUserMessage.parts[0].text)) {
        return { text: JSON.stringify({ type: 'selection', text: GUARDRAIL_ERROR, question: "¿Podemos hablar de otra cosa?", options: [] }) };
    }

    const ai = getAI(customKey);

    
    let systemInstruction = "";
    let useJson = true;

    if (mode === 'explorer') {
        useJson = true;
        systemInstruction = `Eres el EXPLORADOR SOCRÁTICO de Catalizia con ACCESO A INTERNET. 
        Tu objetivo es guiar a ${userName} (${age} años) a descubrir conocimientos por sí mismo.
        
        REGLAS DEL TUTOR SOCRÁTICO:
        1. NUNCA des la respuesta final de inmediato.
        2. Usa el método socrático: responde con una pregunta que invite a la reflexión.
        3. Proporciona explicaciones en 3 CAPAS DE PROFUNDIDAD, pero siempre termina con un desafío o pregunta.
        
        FORMATO OBLIGATORIO JSON:
        {
          "type": "search",
          "layers": {
            "level1": "Analogía simple para un niño. Termina con: '¿Sabías que...?'",
            "level2": "Explicación técnica accesible. Termina con: '¿Qué pasaría si...?'",
            "level3": "Profundidad experta. Termina con: '¿Cómo aplicarías esto a...?'"
          },
          "socraticChallenge": {
            "question": "Un desafío para que el estudiante razone.",
            "options": [
                { "text": "Opción A", "isCorrect": true, "explanation": "..." },
                { "text": "Opción B", "isCorrect": false, "explanation": "..." },
                { "text": "Opción C", "isCorrect": false, "explanation": "..." }
            ]
          }
        }`;
        
        if (persona) systemInstruction += `\nPERSONALIDAD ADICIONAL: ${persona}`;
        if (customInstruction) systemInstruction += `\nINSTRUCCIONES DEL SISTEMA: ${customInstruction}`;
        
    } else if (mode === 'math-viva') {
        useJson = true;
        systemInstruction = `Eres el TUTOR MATEMÁTICO SOCRÁTICO de Catalizia. No eres una calculadora, eres un guía para ${userName} (${age} años).
        
        FILOSOFÍA:
        - Ayuda al estudiante a 'ver' las matemáticas.
        - Si pregunta una operación, explícale el 'por qué' con analogías visuales antes del resultado.
        - Desafía su razonamiento en cada paso.
        
        FORMATO OBLIGATORIO JSON:
        {
          "type": "math",
          "operation": "Ej: 15 / 3",
          "result": "5",
          "socraticReasoning": "¿Si tienes 15 manzanas y 3 amigos, cuántas le tocan a cada uno para que sea justo?",
          "steps": [
            { "step": 1, "title": "Paso 1", "explanation": "Analogía visual...", "formula": "..." }
          ],
          "challenge": {
            "question": "¿Qué pasaría si llegara un amigo más?",
            "options": [
                { "text": "Les tocaría más", "isCorrect": false, "why": "Al haber más personas, la misma cantidad se reparte en trozos más pequeños." },
                { "text": "Les tocaría menos", "isCorrect": true, "why": "¡Exacto! Dividir entre un número más grande da un resultado menor." },
                { "text": "Se quedaría igual", "isCorrect": false, "why": "La cantidad total no cambia, pero el reparto sí." }
            ]
          },
          "visualization": { "type": "blocks | pizza | grid | comparison", "data": { ... } }
        }`;
    } else {
        systemInstruction = `Eres Techie, el Tutor AI Socrático de Catalizia. Tu misión es ser el mejor instructor de esta generación para ${userName} (${age} años).
        
        REGLAS DE ORO:
        1. NO SEAS UN BUSCADOR: No des solo respuestas. Haz que el joven RAZONE.
        2. ACOMPAÑAMIENTO: Guía al estudiante paso a paso.
        3. RETO CONSTANTE: Cada respuesta debe incluir una pregunta o un pequeño test de 3 opciones para validar la comprensión.
        
        FORMATO OBLIGATORIO JSON:
        {
          "type": "selection",
          "text": "[EXPLICACIÓN GUIADA Y ALENTADORA]",
          "question": "¿Ya consideraste esto...? [PREGUNTA SOCRÁTICA]",
          "options": [
            { "text": "[Opción Verdadera]", "isCorrect": true, "feedback": "¡Excelente razonamiento! [EXPLICACIÓN DE POR QUÉ SÍ]" },
            { "text": "[Opción Falsa 1]", "isCorrect": false, "feedback": "Interesante, pero... [EXPLICACIÓN DE POR QUÉ NO]" },
            { "text": "[Opción Falsa 2]", "isCorrect": false, "feedback": "Piénsalo así... [PISTA ADICIONAL]" }
          ]
        }
        
        Tu objetivo es que el estudiante llegue a la respuesta por sí mismo.`;
    }

    const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: history,
        config: {
            temperature: (mode === 'explorer' || mode === 'math-viva') ? temperature : 0.3, 
            tools: [{ googleSearch: {} }],
            systemInstruction: (SAFETY_MANDATE + "\n" + systemInstruction).trim(),
            responseMimeType: useJson ? "application/json" : "text/plain",
            safetySettings: SAFETY_SETTINGS
        }
    });
    console.log('Gemini Response:', result);
    return result;
};

export const reviewHomework = async (imagePart: any, text: string, grade: Grade, userName: string | null, age: number | null, customKey?: string) => {
  const ai = getAI(customKey);

  const prompt = `Revisa esta tarea para nivel ${grade.name}. Usa INTERNET para verificar si la información es correcta. Lenguaje adecuado para ${age} años. JSON format only.`;
  return await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json' 
    }
  });
};

export const analyzeImage = async (imagePart: any, text: string, grade: Grade, userName: string | null, age: number | null, history: any[], mode: ChatMode, customKey?: string) => {
    const ai = getAI(customKey);

    let systemInstruction = `Analiza la imagen educativamente para nivel ${grade.name}. Usa ACCESO A INTERNET para identificar hitos o datos reales.`;
    return await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: { parts: [imagePart, { text: text || "Analiza" }] },
        config: { 
            systemInstruction, 
            tools: [{ googleSearch: {} }], 
            responseMimeType: "application/json" 
        }
    });
};

export const getDeepResearchResponse = async (topic: string, grade: Grade, userName: string | null, age: number | null, customKey?: string) => {
    const ai = getAI(customKey);

    // Ajustamos la profundidad académica según el nivel
    let tokenTarget = "2000 a 3000";
    if (grade.id.startsWith('primaria') && parseInt(grade.id.replace('primaria', '')) >= 4) {
        tokenTarget = "4000 a 5000";
    } else if (grade.id.includes('secundaria') || grade.id.includes('prepa')) {
        tokenTarget = "6000";
    }

    const systemPrompt = `Eres el INVESTIGADOR JEFE (Investigación Académica Nivel Avanzado) de Catalizia. 
    Tu tarea es redactar un "Super Reporte" (Mini Paper de Investigación PhD Juvenil) sobre "${topic}" para ${userName} (${age} años).
    
    CRITERIOS DE CALIDAD (NO SOCRÁTICOS):
    1. ESTILO ACADÉMICO: Redacción directa, profunda y técnica pero adecuada a la edad. No hagas preguntas socráticas aquí; este es un documento de consulta avanzada.
    2. EXTENSIÓN: El reporte debe ser extenso (objetivo: ${tokenTarget} tokens de contenido puro).
    3. RIGOR TÉCNICO: Usa datos históricos, científicos y bibliográficos precisos.
    4. CITAS BIBLIOGRÁFICAS: Incluye URLs reales y activas obtenidas de internet en formato de cita APA o similar al final de cada sección clave.
    5. GENERACIÓN DE IMÁGENES: En puntos estratégicos del reporte, inserta un bloque de texto como: [IMAGE_PROMPT: Una descripción detallada y cinematográfica para generar una imagen ilustrativa sobre este subtema].
    
    ESTRUCTURA DEL MINI PAPER:
    # TÍTULO DE LA INVESTIGACIÓN
    ## Resumen Ejecutivo
    ## Contexto Histórico / Marco Teórico
    ## Desarrollo Profundo (Mínimo 5 subtemas detallados)
    ## Conclusiones Críticas
    ## Bibliografía y Fuentes (URLs en formato de lista)
    
    ESTÉTICA: Usa Markdown rico. Este reporte debe ser el mejor documento que el estudiante haya leído sobre el tema.`;

    return await ai.models.generateContent({
        model: 'gemini-2.0-pro-exp-02-05',
        contents: topic,
        config: { 
            tools: [{ googleSearch: {} }], 
            systemInstruction: systemPrompt,
            maxOutputTokens: 8192,
            temperature: 0.4
        }
    });
};

export const generateTopicQuiz = async (topic: string, grade: Grade, count: number = 10, customKey?: string): Promise<ExamQuestion[]> => {
    const ai = getAI(customKey);
    const prompt = `Usa INTERNET para generar un examen de ${count} preguntas REALES y actualizadas sobre: ${topic} para nivel escolar ${grade.name}. JSON format.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { 
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json' 
        }
    });
    return JSON.parse(cleanJsonString(getResponseText(response) || '[]'));
};

export const generateFlashcards = async (text: string, customKey?: string): Promise<Flashcard[]> => {
    const ai = getAI(customKey);
 
    const prompt = `Genera 5 flashcards educativas basadas en el texto. JSON: [{ "question": "", "answer": "" }]`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJsonString(getResponseText(response) || '[]'));
};
