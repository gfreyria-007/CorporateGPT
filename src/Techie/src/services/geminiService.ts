
import { Type } from "@google/genai";
import { Grade, ChatMode, ExamQuestion, QuizOption, AspectRatio, ImageSize, Flashcard, ImageStyle, LightingStyle } from '../types';
import { fileToGenerativePart } from '../utils/audio';
import { STUDIO_STYLES, LIGHTING_PRESETS } from '../constants';
import { logger } from '../logger';

export const GRADE_GUARDRAILS: Record<string, { maxAge: number; sensitiveTopics: string[]; contentLevel: 'basic' | 'intermediate' | 'advanced'; imageComplexity: 'simple' | 'medium' | 'detailed' }> = {
  'primaria1': { maxAge: 6, sensitiveTopics: ['sexo', 'sexual', 'embarazo', 'drogas', 'violencia', 'muerte', 'enfermedad'], contentLevel: 'basic', imageComplexity: 'simple' },
  'primaria2': { maxAge: 7, sensitiveTopics: ['sexo', 'sexual', 'embarazo', 'drogas', 'violencia', 'muerte', 'enfermedad'], contentLevel: 'basic', imageComplexity: 'simple' },
  'primaria3': { maxAge: 8, sensitiveTopics: ['sexo', 'sexual', 'embarazo', 'drogas', 'violencia', 'muerte'], contentLevel: 'basic', imageComplexity: 'simple' },
  'primaria4': { maxAge: 9, sensitiveTopics: ['sexo', 'sexual', 'embarazo', 'drogas', 'violencia', 'muerte'], contentLevel: 'basic', imageComplexity: 'simple' },
  'primaria5': { maxAge: 10, sensitiveTopics: ['sexo', 'sexual', 'embarazo', 'drogas'], contentLevel: 'intermediate', imageComplexity: 'medium' },
  'primaria6': { maxAge: 11, sensitiveTopics: ['sexo', 'sexual', 'embarazo', 'drogas'], contentLevel: 'intermediate', imageComplexity: 'medium' },
  'secundaria1': { maxAge: 12, sensitiveTopics: ['sexo', 'drogas'], contentLevel: 'intermediate', imageComplexity: 'medium' },
  'secundaria2': { maxAge: 13, sensitiveTopics: ['drogas'], contentLevel: 'advanced', imageComplexity: 'detailed' },
  'secundaria3': { maxAge: 14, sensitiveTopics: ['drogas'], contentLevel: 'advanced', imageComplexity: 'detailed' },
};

export const applyContentGuardrails = (gradeId: string, prompt: string, content: string): { safe: boolean; filteredContent?: string; reason?: string } => {
  const guardrail = GRADE_GUARDRAILS[gradeId];
  if (!guardrail) return { safe: true };
  
  const lowerPrompt = prompt.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  for (const topic of guardrail.sensitiveTopics) {
    if (lowerPrompt.includes(topic) || lowerContent.includes(topic)) {
      if (gradeId.startsWith('primaria')) {
        return { safe: false, reason: `Contenido no apropiado para ${gradeId}. Redirige a un tema educativo.` };
      }
    }
  }
  
  return { safe: true };
};

export const applyImageGuardrails = (gradeId: string, prompt: string): { safe: boolean; filteredPrompt?: string; reason?: string } => {
  const guardrail = GRADE_GUARDRAILS[gradeId];
  if (!guardrail) return { safe: true };
  
  const lowerPrompt = prompt.toLowerCase();
  
  for (const topic of guardrail.sensitiveTopics) {
    if (lowerPrompt.includes(topic)) {
      return { safe: false, reason: `No puedo generar imágenes sobre ese tema para ${gradeId}. ¿Qué tal algo más educativo?` };
    }
  }
  
  let filteredPrompt = prompt;
  
  if (guardrail.imageComplexity === 'simple') {
    filteredPrompt += ', estilo infantil, colores vivos,很简单, cartoon para niños';
  } else if (guardrail.imageComplexity === 'medium') {
    filteredPrompt += ', estilo educativo, colores brillantes, ilustración para estudiantes';
  } else {
    filteredPrompt += ', estilo educativo detallado, diagrama científico, ilustración escolar';
  }
  
  return { safe: true, filteredPrompt };
};

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

// Removed function











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
    customKey?: string, // Keeping for signature compatibility if needed, but unused
    researchContext?: string // NEW: Add research context for educational accuracy

): Promise<{ url: string, enhancedPrompt: string } | null> => {

    
    if (moderatePrompt(prompt)) {
        throw new Error(GUARDRAIL_ERROR);
    }

    // Perform educational research to enhance prompt accuracy
    let enhancedPrompt = prompt;
    if (!researchContext && prompt) {
        try {
            console.log('[TECHIE IMAGE] Performing educational research for prompt enhancement...');
            
            const researchResponse = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generateContent',
                    payload: {
                        model: 'gemini-2.0-flash',
                        contents: [{ role: 'user', parts: [{ text: `
You are an Educational Content Research Specialist. 

Research and provide current, accurate educational information about:
Topic: ${prompt}
Student Level: ${grade.name} (approximately ${grade.age} years old)
Focus: Educational content accuracy and age-appropriate details
Style: ${style !== 'none' ? STUDIO_STYLES[style]?.prompt || style : 'Standard educational'}

RESEARCH REQUIREMENTS:
1. Use search tools to find current, factual information about the topic
2. Ensure content is age-appropriate for ${grade.name} students
3. Identify key educational concepts that should be represented visually
4. Consider the specified style and educational context
5. Return factual information that would enhance educational image generation

Return only the relevant educational research findings.
                        ` }] }],
                        tools: [{ googleSearch: {} }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
                    }
                })
            });
            
            if (researchResponse.ok) {
                const researchResult = await researchResponse.json();
                const researchInfo = researchResult.candidates?.[0]?.content?.parts?.[0]?.text;
                if (researchInfo) {
                    enhancedPrompt = `Educational Topic: ${prompt}. Current Research Context: ${researchInfo}.`;
                    console.log('[TECHIE IMAGE] Educational research context added successfully');
                }
            } else {
                console.warn('[TECHIE IMAGE] Educational research failed:', await researchResponse.text());
            }
        } catch (error) {
            console.warn('[TECHIE IMAGE] Educational research error:', error);
        }
    } else if (researchContext) {
        enhancedPrompt = `Educational Topic: ${prompt}. Research Context: ${researchContext}.`;
    }



    
    const strictConstraints = `
        STRICT MANDATE: 
        - ABSOLUTELY NO TEXT, NO LABELS, NO LETTERS, NO NUMBERS IN THE IMAGE.
        - FOCUS EXCLUSIVELY ON THE TOPIC: "${prompt}".
        - CONTEXT: This is for a student in ${grade.name} (approx ${grade.age} years old).
        - STYLE: Educational, clear, professionally rendered.
        - PURE VISUAL REPRESENTATION ONLY.
    `;
    
    let finalPrompt = `Subject: ${enhancedPrompt}. ${strictConstraints}`;
    if (style !== 'none' && STUDIO_STYLES[style]) {
        finalPrompt += ` Style: ${STUDIO_STYLES[style].prompt}.`;
    }

    const contents: any = [{ parts: [{ text: finalPrompt }] }];
    
    if (sourceImage) {
        const mimeType = sourceImage.split(';')[0].split(':')[1];
        const base64Data = sourceImage.split(',')[1];
        contents[0].parts.unshift({ inlineData: { data: base64Data, mimeType: mimeType } });
        finalPrompt = `Based on the provided sketch/image, generate a final professional version of: ${prompt}. ${strictConstraints}`;
    }

    try {
        const res = await fetch('/api/techie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateImage',
                payload: {
                    model: 'black-forest-labs/flux-1-schnell',
                    prompt: finalPrompt,
                    aspectRatio: aspectRatio === '1:1' ? '1:1' : '16:9',
                    sourceImage: sourceImage ? sourceImage.split(',')[1] : undefined
                }
            })
        });
        
        const imgRes = await res.json();
        if (imgRes.error) {
            console.error("[TECHIE] Image Error:", imgRes.error);
            return null;
        }

        const imageBase64 = imgRes.imageBase64;
        if (imageBase64) {
            let finalUrl: string;
            if (imageBase64.startsWith('data:')) {
                finalUrl = imageBase64;
            } else if (imageBase64.startsWith('http')) {
                finalUrl = imageBase64;
            } else {
                finalUrl = `data:image/png;base64,${imageBase64}`;
            }
            return { url: finalUrl, enhancedPrompt: `Enhanced with educational research: ${enhancedPrompt}` };
        }
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
    customKey?: string // Unused

): Promise<string | null> => {

    if (moderatePrompt(prompt)) {
        throw new Error(GUARDRAIL_ERROR);
    }



    
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
        // For image-to-image editing, we need to send to API endpoint
        // Get base64 of source image
        let sourceBase64 = '';
        if (typeof source === 'string') {
            sourceBase64 = source.split(',')[1];
        } else {
            // File - convert to base64
            sourceBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(source);
            });
        }

        const res = await fetch('/api/techie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateImage',
                payload: {
                    model: 'black-forest-labs/flux-1-schnell',
                    prompt: finalInstruction,
                    sourceImage: sourceBase64,
                    maskImage: maskBase64 ? maskBase64.split(',')[1] : undefined
                }
            })
        });
        
        const imgRes = await res.json();
        if (imgRes.error) {
            console.error("[TECHIE] Edit Error:", imgRes.error);
            throw new Error("Lo siento, no pude procesar la edición. ¿Podemos intentar con otra descripción?");
        }

        const imageBase64 = imgRes.imageBase64;
        if (imageBase64) {
            return imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
        }
    } catch (e: any) {
        console.error("Image editing failed", e);
        throw e;
    }
    return null;
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
    customKey?: string, // Unused

    selectedModel?: string,
    useGenZ: boolean = true
) => {
    // Verificar si el último mensaje del usuario viola las reglas de seguridad
    const lastUserMessage = [...history].reverse().find((msg: any) => msg.role === 'user');
    if (lastUserMessage && lastUserMessage.parts && lastUserMessage.parts[0] && moderatePrompt(lastUserMessage.parts[0].text)) {
        return { text: JSON.stringify({ type: 'selection', text: GUARDRAIL_ERROR, question: "¿Podemos hablar de otra cosa?", options: [] }) };
    }



    
    let systemInstruction = "";
    let useJson = true;

    if (mode === 'explorer') {
        useJson = true;
        
        const lastUserMsg = [...history].reverse().find((msg: any) => msg.role === 'user');
        const userText = lastUserMsg?.parts?.[0]?.text?.toLowerCase() || '';
        
        const imageTriggers = ['dibuja', 'imagen', 'foto', 'ilustración', 'dibujo de', 'haz un', 'genera', 'créame', 'visualiza', 'muestra cómo', '画出', 'dessin', 'picture'];
        const wantsImage = imageTriggers.some(trigger => userText.includes(trigger));
        
        if (wantsImage) {
          const guardrail = applyImageGuardrails(grade.id, lastUserMsg.parts[0].text);
          if (!guardrail.safe) {
            return { text: JSON.stringify({ type: 'selection', text: guardrail.reason, question: "¿Qué otro tema te gustaría explorar?", options: [] }) };
          }
          
          return { text: JSON.stringify({ 
            type: 'image-request', 
            prompt: guardrail.filteredPrompt || lastUserMsg.parts[0].text,
            gradeId: grade.id,
            aspectRatio: '16:9'
          }) };
        }
        
        const personaStyle = useGenZ ? `Habla como un joven Gen-Z brillante y amigable (usa palabras como "bro", "literal", "mind-blowing", "top", pero mantén el respeto y la seguridad). No suenes como un profesor aburrido.` : `Mantén un tono profesional, formal, paciente y muy educativo, propio de una enciclopedia o tutor académico serio.`;
        systemInstruction = `Eres Techie Explorador, el BUSCADOR DE INTERNET MÁS SEGURO Y DIVERTIDO de Catalizia. ${personaStyle}
        Tu objetivo es investigar y explicar cualquier tema del universo de forma segura y adaptada para un joven de ${age} años en ${grade.name}.
        
        REGLAS DE EXPLORACIÓN Y SEGURIDAD:
        1. ERES UN GUÍA UNIVERSAL: Puedes hablar de TODO lo que sea seguro (ej. cómo hornear un pastel de chocolate, cómo se formaron los dinosaurios, cómo programar un juego).
        2. BARRERA DE SEGURIDAD ESTRICTA: NUNCA ayudes a construir armas, bombas, realizar hackeos, hacer daño, o hablar de contenido adulto. Si te piden algo inseguro, diles: "¡Wow! Eso suena a película de acción, pero mejor te enseño cómo programar un videojuego de espías en lugar de hackear cosas reales."
        3. PARA PRIMARIA (6-11): Todo muy visual, cero cosas oscuras.
        4. PARA SECUNDARIA (12-14): Retador, interesante, pero siempre dentro de límites seguros.
        
        FORMATO OBLIGATORIO JSON:
        {
          "type": "search",
          "topic": "[Tema buscado - resumido de forma cool]",
          "layers": {
            "level1": "Explicación súper básica y divertida. Como si se lo explicaras a su hermano menor.",
            "level2": "Explicación principal detallada y con lenguaje moderno. ¡Hazlo interesante!",
            "level3": "El 'Deep Dive' técnico para un estudiante de ${grade.name}. Datos curiosos o ciencia detrás del tema."
          },
          "sources": [
            { "title": "Nombre del sitio (ej. NatGeo Kids)", "url": "https://..." },
            { "title": "Nombre del sitio", "url": "https://..." }
          ],
          "funFact": "Un dato increíblemente curioso, de esos que te explotan la cabeza (mind-blowing)."
        }`;
        
        if (persona) systemInstruction += `\nPERSONALIDAD ADICIONAL: ${persona}`;
        if (customInstruction) systemInstruction += `\nINSTRUCCIONES DEL SISTEMA: ${customInstruction}`;
        
} else if (mode === 'math-viva') {
        useJson = true;
        const personaStyle = useGenZ ? `Eres un genio matemático relajado, hablas como un joven brillante. Usa analogías de videojuegos o cosas modernas. Nada de formalismos aburridos.` : `Eres un tutor de matemáticas formal y estructurado. Explica cada paso con precisión académica y lenguaje respetuoso.`;
        systemInstruction = `Eres el TUTOR MATEMÁTICO SOCRÁTICO de Catalizia. ${personaStyle} No eres una calculadora, eres un guía para ${userName} (${age} años).
        
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
    } else if (mode === 'socratic') {
        // TUTOR SOCRÁTICO - Nueva experiencia de aprendizaje
        useJson = true;
        const personaStyle = useGenZ ? `Eres un genio relajado, hablas como un joven brillante (usa palabras como "cool", "bro", "literal", "obvio no", pero mantén el respeto y la pedagogía). No suenes como un profesor aburrido o como sus papás.` : `Tienes un tono muy respetuoso, paciente, profesional y formal, propio de un tutor académico serio. No uses jerga de internet.`;
        systemInstruction = `Eres Techie, el TUTOR SOCRÁTICO DEFINITIVO de Catalizia. ${personaStyle}
        
        ESTUDIANTE: ${userName} (${age} años, grado ${grade?.name}).
        
        MÉTODO DE ANDAMIAJE (SCAFFOLDING) OBLIGATORIO:
        1. CERO RESPUESTAS FÁCILES: NUNCA, bajo NINGUNA circunstancia, des la respuesta numérica o el resultado final de inmediato. Eres un gimnasio para el cerebro, no un solucionario.
        2. DESCOMPÓN EL PROBLEMA: Si preguntan algo complejo, divídelo. "¿Qué pasaría si en lugar de 3x tuviéramos solo x?".
        3. MULTIMODALIDAD PROACTIVA: Si el tema es de matemáticas, física o abstracto, invítalos a usar herramientas. Diles: "Oye, en lugar de teclear todo eso, tómale una foto a tu libreta y súbela, yo reviso en qué paso te atoraste usando mi visión artificial."
        4. CELEBRA COMO GAMER: Cuando acierten, dales un "¡Level up!" o "¡Esa es la actitud!". Si fallan, diles: "Casi, pero checa esto..."
        
        FORMATO JSON OBLIGATORIO - Pregunta Socrática con 3 opciones:
        {
          "type": "socratic",
          "topic": "[TEMA DEL MOMENTO]",
          "question": "[PREGUNTA QUE HACE PENSAR - No es la respuesta, es el siguiente escalón mental]",
          "options": [
            { 
              "text": "[Opción correcta como pregunta o siguiente paso]", 
              "isCorrect": true, 
              "hint": "[Pista pequeña si el usuario duda]",
              "explanation": "[Por qué esta pregunta lleva a la verdad - explicación profunda pero con estilo]"
            },
            { 
              "text": "[Opción incorrecta 1 - Error común]", 
              "isCorrect": false, 
              "hint": "[Pista que te hace notar el error]",
              "explanation": "[Por qué muchos caen en esta trampa]"
            },
            { 
              "text": "[Opción incorrecta 2]", 
              "isCorrect": false, 
              "hint": "[Otra perspectiva del error]",
              "explanation": "[Explicación del error conceptual]"
            }
          ]
        }
        
        IMPORTANTE: Tu 'question' debe forzarlos a razonar el siguiente paso, NO darles el final del problema.`;
    } else {
        const personaStyleDef = useGenZ ? `Hablas su idioma, eres dinámico, usas analogías de videojuegos, redes sociales o cosas modernas. Nada de hablar como un profesor anticuado.` : `Tienes un tono educado, formal y estructurado, propio de un tutor clásico y paciente.`;
        systemInstruction = `Eres Techie, el Tutor AI de nueva generación de Catalizia. Tu misión es ser el mejor instructor del mundo para ${userName} (${age} años). ${personaStyleDef}
        
        REGLAS DE ORO:
        1. ANDAMIAJE MENTAL: NO des solo respuestas. Haz que el joven RAZONE. Si te piden resolver "2x = 10", tú respondes: "Imagina que 2 cajas mágicas pesan 10 kilos. ¿Cuánto pesa una sola caja?".
        2. VISIÓN E IMÁGENES: Siempre recuérdales que tienes "ojos biónicos". "Si te da flojera escribir el problema, tómale una foto a tu cuaderno y súbela. Yo te digo dónde te equivocaste con el signo negativo."
        3. RETO CONSTANTE: Cada respuesta debe incluir un test rápido para validar que no solo te están leyendo, sino entendiendo.
        
        FORMATO OBLIGATORIO JSON:
        {
          "type": "selection",
          "text": "[EXPLICACIÓN GUIADA, ALENTADORA Y CON ESTILO COOL]",
          "question": "¿Entonces, qué sigue...? [PREGUNTA SOCRÁTICA PARA EL SIGUIENTE PASO]",
          "options": [
            { "text": "[Opción Verdadera]", "isCorrect": true, "feedback": "¡GG! Excelente razonamiento. [EXPLICACIÓN DE POR QUÉ SÍ]" },
            { "text": "[Opción Falsa 1]", "isCorrect": false, "feedback": "Mmm, no exactamente. [EXPLICACIÓN DEL ERROR]" },
            { "text": "[Opción Falsa 2]", "isCorrect": false, "feedback": "Piensa fuera de la caja... [PISTA ADICIONAL]" }
          ]
        }
        
        Tu objetivo es que el estudiante desbloquee el conocimiento por sí mismo, sintiéndose invencible al lograrlo.`;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 40000);
        
        // Use /api/techie endpoint (optimized with timeout)
        const res = await fetch('/api/techie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                action: 'chat',
                payload: {
                    model: selectedModel || 'openrouter/auto',
                    history,
                    temperature: (mode === 'explorer' || mode === 'math-viva') ? temperature : 0.3,
                    systemInstruction: (SAFETY_MANDATE + "\n" + systemInstruction).trim(),
                    useJson: true,
                    customKey
                }
            })
        });
        
        clearTimeout(timeout);
        
        // Check if response is error
        if (!res.ok) {
            const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errData.error || `HTTP ${res.status}`);
        }
        
        const result = await res.json();
        return { text: result.text || '' };
    } catch (e: any) {
        console.error("[TECHIE] Chat failed:", e);
        const isTimeout = e.name === 'AbortError' || e.message?.includes('timeout') || e.message === 'timeout';
        
        if (isTimeout) {
            return { text: JSON.stringify({ 
                type: 'selection', 
                text: "⚠️ La conexión está tardando más de lo normal. El tráfico está pesado en la red de CatalizIA.", 
                question: "¿Qué te gustaría hacer?", 
                options: [
                    { text: "Intentar de nuevo 🔄", isCorrect: true, feedback: "Vamos a intentarlo de nuevo con más fuerza." }
                ] 
            }) };
        }

        // Total failure - friendly message matching CorporateGPT style
        return { text: JSON.stringify({ 
            type: 'selection', 
            text: "⚠️ El servicio está temporalmente ocupado o experimentando mucha demanda. Techie está tomando un breve respiro.", 
            question: "¿Quieres intentar de nuevo en unos segundos?", 
            options: [
                { text: "Intentar de nuevo 🚀", isCorrect: true, feedback: "¡Esa es la actitud! Reintentando..." }
            ] 
        }) };
    }
};

export const reviewHomework = async (imagePart: any, text: string, grade: Grade, userName: string | null, age: number | null, customKey?: string, useGenZ: boolean = true) => {
  const personaStyle = useGenZ ? `Eres un tutor Gen-Z cool y brillante.` : `Eres un tutor académico formal y serio.`;
  const prompt = `Revisa esta tarea para nivel ${grade.name}. ${personaStyle} Usa INTERNET para verificar si la información es correcta. Lenguaje adecuado para ${age} años. JSON format only.`;
    try {
        console.log('[TECHIE IMAGE] Generating image with enhanced prompt...');
        
        const res = await fetch('/api/techie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'generateContent',
            payload: {
                model: 'openrouter/auto',
                contents: [{ parts: [imagePart, { text: prompt }] }],
                useJson: true,
                    customKey
            }
        })
    });
    return await res.json();
  } catch (e) {
    console.error("Homework review failed", e);
    return null;
  }
};

export const analyzeImage = async (imagePart: any, text: string, grade: Grade, userName: string | null, age: number | null, history: any[], mode: ChatMode, customKey?: string, useGenZ: boolean = true) => {
    const personaStyle = useGenZ ? `Eres un experto Gen-Z que analiza imágenes.` : `Eres un analista académico formal de imágenes.`;
    let systemInstruction = `Analiza la imagen educativamente para nivel ${grade.name}. ${personaStyle} Usa ACCESO A INTERNET para identificar hitos o datos reales.`;
    try {
        const res = await fetch('/api/techie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContent',
                payload: {
                    model: 'openrouter/auto',
                    contents: [{ parts: [imagePart, { text: text || "Analiza" }] }],
                    systemInstruction,
                    useJson: true,
                    customKey
                }
            })
        });
        return await res.json();
    } catch (e) {
        console.error("Image analysis failed", e);
        return null;
    }
};

export const getDeepResearchResponse = async (topic: string, grade: Grade, userName: string | null, age: number | null, customKey?: string, useGenZ: boolean = true) => {
    let tokenTarget = "2000 a 3000";
    if (grade.id.startsWith('primaria') && parseInt(grade.id.replace('primaria', '')) >= 4) {
        tokenTarget = "4000 a 5000";
    } else if (grade.id.includes('secundaria') || grade.id.includes('prepa')) {
        tokenTarget = "6000";
    }
    
    const lowerTopic = topic.toLowerCase();
    const imageTriggers = ['dibuja', 'imagen', 'foto', 'ilustración', 'dibujo de', 'haz un', 'genera', 'créame', 'visualiza', 'muestra cómo', 'diagrama', 'gráfico'];
    const wantsImage = imageTriggers.some(trigger => lowerTopic.includes(trigger));
    
    if (wantsImage) {
        const guardrail = applyImageGuardrails(grade.id, topic);
        if (!guardrail.safe) {
            return { text: JSON.stringify({ type: 'selection', text: guardrail.reason, question: "¿Qué otro tema te gustaría investigar?", options: [] }) };
        }
        
        return { text: JSON.stringify({ 
            type: 'image-request', 
            prompt: guardrail.filteredPrompt || topic,
            gradeId: grade.id,
            aspectRatio: '16:9'
        }) };
    }
    
    const systemPrompt = `Eres el INVESTIGADOR JEFE (Investigación Académica Nivel Avanzado) de Catalizia. 
    Tu tarea es redactar un "Super Reporte" (Mini Paper de Investigación PhD Juvenil) sobre "${topic}" para ${userName} (${age} años).
    ... (rest of the prompt) ...`;

    try {
        const res = await fetch('/api/techie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContent',
                payload: {
                    model: 'openrouter/auto',
                    contents: [{ parts: [{ text: topic }] }],
                    systemInstruction: systemPrompt,
                    temperature: 0.4
                }
            })
        });
        return await res.json();
    } catch (e) {
        console.error("Deep research failed", e);
        return null;
    }
};

export const generateTopicQuiz = async (topic: string, grade: Grade, count: number = 10, customKey?: string): Promise<ExamQuestion[]> => {
    const prompt = `Usa INTERNET para generar un examen de ${count} preguntas REALES y actualizadas sobre: ${topic} para nivel escolar ${grade.name}. JSON format.`;
    try {
        const res = await fetch('/api/techie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContent',
                payload: {
                    model: 'openrouter/auto',
                    contents: [{ parts: [{ text: prompt }] }],
                    useJson: true,
                    customKey
                }
            })
        });
        const data = await res.json();
        return JSON.parse(cleanJsonString(data.text || '[]'));
    } catch (e) {
        console.error("Quiz generation failed", e);
        return [];
    }
};

export const generateFlashcards = async (text: string): Promise<Flashcard[]> => {
    const prompt = `Genera 5 flashcards educativas basadas en el texto. JSON: [{ "question": "", "answer": "" }]`;
    try {
        const res = await fetch('/api/techie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateContent',
                payload: {
                    model: 'openrouter/auto',
                    contents: [{ parts: [{ text: prompt }] }],
                    useJson: true,
                    customKey
                }
            })
        });
        const data = await res.json();
        return JSON.parse(cleanJsonString(data.text || '[]'));
    } catch (e) {
        console.error("Flashcards generation failed", e);
        return [];
    }
};
