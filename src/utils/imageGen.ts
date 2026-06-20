import fetch from 'node-fetch';

export const DEFAULT_IMAGE_MODELS = [
  'imagen-3.0-generate-001',
  'imagen-4.0-fast-generate-001',
  'flux-1-schnell'
] as const;

type ImageModel = typeof DEFAULT_IMAGE_MODELS[number];

export interface ImageGenPayload {
  prompt: string;
  aspectRatio?: string;
  model?: ImageModel;
}

export interface ImageGenResult {
  imageUrl: string | null;
  enhancedPrompt: string;
  modelUsed: ImageModel;
}

/**
 * Generate an image using OpenRouter. If the chosen model fails, it recursively
 * falls back to the next model in the whitelist.
 */
export async function generateImage(payload: ImageGenPayload): Promise<ImageGenResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing');
  }

  // Resolve whitelist – can be overridden by env var IMAGE_MODELS at runtime
  const whitelist = (process.env.IMAGE_MODELS?.split(',') as ImageModel[]) ?? DEFAULT_IMAGE_MODELS;

  // Choose model: explicit request must be in the whitelist, otherwise use first entry
  const chosenModel = payload.model && whitelist.includes(payload.model as ImageModel)
    ? payload.model as ImageModel
    : whitelist[0];

  const body = {
    model: chosenModel,
    prompt: payload.prompt,
    ...(payload.aspectRatio && { aspect_ratio: payload.aspectRatio })
  };

  const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    // Attempt fallback to next model if any remain
    const nextIdx = whitelist.indexOf(chosenModel) + 1;
    if (nextIdx < whitelist.length) {
      return generateImage({ ...payload, model: whitelist[nextIdx] as ImageModel });
    }
    const err = await response.text();
    throw new Error(`Image generation failed (model ${chosenModel}): ${err}`);
  }

  const result = await response.json();
  const imageUrl = result.data?.[0]?.url ?? null;
  return { imageUrl, enhancedPrompt: payload.prompt, modelUsed: chosenModel };
}
