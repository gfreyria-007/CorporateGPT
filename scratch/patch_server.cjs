const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'server.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update /api/gemini generateImage handler with OpenRouter + Imagen support
const searchStart = "if (action === 'generateImage' || (payload.model && payload.model.startsWith('imagen-')))";
const searchEnd = "return res.status(500).json({ error: 'IMAGE_GEN_FAILED', details: lastError || 'All models exhausted' });";

const newGenerateImageLogic = `        if (action === 'generateImage' || (payload.model && (payload.model.startsWith('imagen-') || payload.model.includes('/')))) {
          // --- SMARTER PROMPT ENHANCEMENT (Subject-Preserving) ---
          let optimizedPrompt = payload.prompt;
          try {
            console.log(\`[IMAGEN] Enhancing prompt with Subject-Preservation...\`);
            const enhanceResponse = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${apiKey}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: \`Expand the following image prompt into a highly detailed, professional description for an AI image generator (Imagen 3 / DALL-E 3). 

                CRITICAL INSTRUCTION: You MUST preserve the IDENTITY and ESSENCE of the SUBJECT. 
                If the subject is a known character (like Spider-Man), do NOT replace them with a generic model. 
                Apply any styles or contexts TO the subject, rather than letting the style override the subject's identity.
                
                Input Prompt: \${payload.prompt}
                
                Generate a single paragraph of roughly 100-150 words that combines these elements into a cohesive, high-fidelity, and cinematic scene description. Focus on textures, lighting, and keeping the subject recognizable.\` }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
              })
            });
            if (enhanceResponse.ok) {
              const enhanceResult = await enhanceResponse.json();
              const enhancedText = enhanceResult.candidates?.[0]?.content?.parts?.[0]?.text;
              if (enhancedText) {
                optimizedPrompt = enhancedText;
                console.log(\`[IMAGEN] Optimized Prompt: \${optimizedPrompt.substring(0, 100)}...\`);
              }
            }
          } catch (e) {
            console.warn("[IMAGEN] Prompt enhancement failed, using original:", e);
          }

          // --- 1. TRY OPENROUTER IF SPECIFIED ---
          if (finalModel.includes('/') || finalModel.startsWith('openai')) {
            try {
              console.log(\`[OPENROUTER IMAGE] Generating with \${finalModel}...\`);
              const orResponse = await fetch('https://openrouter.ai/api/v1/images/generations', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
                  'HTTP-Referer': 'https://catalizia.com',
                  'X-Title': 'Catalizia CorporateGPT'
                },
                body: JSON.stringify({
                  model: finalModel,
                  prompt: optimizedPrompt,
                  aspect_ratio: payload.aspectRatio || '16:9'
                })
              });

              if (orResponse.ok) {
                const result = await orResponse.json();
                const imageUrl = result.data?.[0]?.url;
                if (imageUrl) {
                  console.log(\`[OPENROUTER IMAGE] Success with \${finalModel}\`);
                  await trackUsage(userId, true);
                  return res.status(200).json({ imageBase64: imageUrl, modelUsed: finalModel });
                }
              } else {
                const errData = await orResponse.json().catch(() => ({}));
                console.warn(\`[OPENROUTER IMAGE] Failed: \${errData.error?.message || orResponse.status}\`);
              }
            } catch (e) {
              console.error(\`[OPENROUTER IMAGE] Exception:\`, e.message);
            }
          }

          // --- 2. TRY IMAGEN MODELS ---
          const IMAGE_MODELS = [
            finalModel.startsWith('imagen') ? finalModel : null,
            'imagen-3.0-generate-001',
            'imagen-3.0-fast-generate-001',
            'imagen-4.0-fast-generate-001'
          ].filter(Boolean) as string[];

          let lastError = null;
          for (const model of IMAGE_MODELS) {
            try {
              console.log(\`[IMAGEN] Attempting model: \${model}\`);
              const instance = { prompt: optimizedPrompt };
              if (payload.sourceImage) instance.image = { bytesBase64Encoded: payload.sourceImage };
              
              const parameters = { 
                sampleCount: 1,
                aspectRatio: payload.aspectRatio || '1:1'
              };
              if (payload.maskImage) parameters.mask = { image: { bytesBase64Encoded: payload.maskImage } };
              
              const apiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/\${model}:predict?key=\${apiKey}\`;
              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instances: [instance], parameters })
              });

              if (response.ok) {
                const result = await response.json();
                if (result.predictions?.[0]?.bytesBase64Encoded || result.imageBase64) {
                  console.log(\`[IMAGEN] Success with \${model}\`);
                  await trackUsage(userId, true);
                  return res.status(200).json(result);
                }
              } else {
                const errBody = await response.json().catch(() => ({}));
                console.warn(\`[IMAGEN] Model \${model} failed with status \${response.status}:\`, JSON.stringify(errBody));
                lastError = errBody.error?.message || \`Status \${response.status}\`;
              }
            } catch (err) {
              console.error(\`[IMAGEN] Request failed for \${model}:\`, err.message);
              lastError = err.message;
            }
          }

          // --- 3. LAST RESORT: FALLBACK TO GEMINI 2.0 FLASH ---
          console.log(\`[IMAGEN] Falling back to Gemini 2.0 Flash multimodal...\`);
          try {
            const parts = [{ text: optimizedPrompt }];
            if (payload.sourceImage) parts.push({ inlineData: { mimeType: 'image/png', data: payload.sourceImage } });
            if (payload.maskImage) parts.push({ inlineData: { mimeType: 'image/png', data: payload.maskImage }, text: "Use this mask for inpainting. Only change the area covered by the mask." });

            const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${apiKey}\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: {
                  responseModalities: ['IMAGE'],
                  imageConfig: { aspectRatio: payload.aspectRatio === '16:9' ? '16:9' : '1:1' }
                }
              })
            });
            if (response.ok) {
              const result = await response.json();
              const hasImage = result.candidates?.[0]?.content?.parts?.some(p => p.inlineData);
              if (hasImage) {
                 console.log(\`[IMAGEN] Success with Gemini 2.0 Flash Fallback\`);
                 await trackUsage(userId, true);
                 return res.status(200).json(result);
              }
            }
          } catch (e) {
            console.error(\`[IMAGEN] Fallback also failed:\`, e.message);
          }

          return res.status(500).json({ error: 'IMAGE_GEN_FAILED', details: lastError || 'All models exhausted' });
        }`;

// Replace the block
const startIndex = content.indexOf(searchStart);
const endIndex = content.indexOf(searchEnd) + searchEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + newGenerateImageLogic + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched server.ts with OpenRouter + Imagen support');
} else {
    console.error('Could not find generation block in server.ts');
    process.exit(1);
}
