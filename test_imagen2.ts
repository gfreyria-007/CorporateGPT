import dotenv from 'dotenv';
dotenv.config();

const GEMINI = process.env.GEMINI_API_KEY!;

async function testImagen(model: string) {
  // Imagen uses different API - need to use the right endpoint
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${GEMINI}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: 'A simple blue circle logo' }],
      parameters: { sampleCount: 1 }
    })
  });
  const d = await res.json();
  if (d.error) return { ok: false, err: d.error?.error?.message || d.error.message };
  const hasImage = d.predictions?.[0]?.bytesBase64Encoded;
  return { ok: !!hasImage, hasImage };
}

async function main() {
  console.log('\n=== IMAGE GENERATION MODELS (Correct Format) ===\n');
  const models = ['imagen-4.0-fast-generate-001', 'imagen-4.0-generate-001', 'imagen-4.0-ultra-generate-001'];
  
  for (const m of models) {
    const result = await testImagen(m);
    console.log(`${result.ok ? '✅' : '❌'} ${m}: ${result.err || (result.hasImage ? 'Image OK' : 'No image')}`);
  }
}

main();