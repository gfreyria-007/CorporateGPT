
import { failsafeChat } from './failsafeRouter';

export async function optimizePromptForImage(
  prompt: string, 
  userId: string, 
  idToken: string,
  lang: 'en' | 'es' = 'es'
): Promise<string> {
  const systemInstruction = `
    You are a professional AI Prompt Engineer and Researcher.
    Your goal is to take a simple image request and transform it into a highly detailed, professional, and visually stunning prompt for high-fidelity image models like Imagen 4 or DALL-E 3.
    
    CRITICAL REQUIREMENT: 
    If the user mentions a specific character, style, or real-world entity (e.g., "Spiderman Noir", "Wes Anderson", "Tesla Cybertruck"), you MUST use your internal knowledge and WEB SEARCH findings to include exact factual details about that subject (color palettes, costume details, lighting characteristics, specific textures).
    
    STRICT RULES:
    1. Do NOT just repeat the user's prompt. 
    2. Include details about: Lighting (e.g. volumetric, cinematic), Texture (e.g. high-fidelity, 8k), Composition (e.g. wide angle, macro), and Atmosphere.
    3. Ensure factual accuracy for known entities.
    4. Keep the final prompt under 400 words.
    5. Output ONLY the final optimized prompt text, no explanations.
    
    User Language: ${lang === 'es' ? 'Spanish' : 'English'}. Output the final prompt in English as image models perform better with it.
  `;

  try {
    const result = await failsafeChat({
      model: 'google/gemini-2.0-flash',
      messages: [
        { role: 'user', content: `Research and optimize this image prompt: "${prompt}". Go find exact details if it's a specific character or style.` }
      ],
      userId,
      idToken,
      instructions: systemInstruction,
      webSearch: true, // ENABLE WEB SEARCH FOR EXACT FINDINGS
      temperature: 0.9,
    });

    return result.content || prompt;
  } catch (error) {
    console.error('Prompt optimization failed:', error);
    return prompt; // Fallback to original
  }
}
