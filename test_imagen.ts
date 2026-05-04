import dotenv from 'dotenv';
dotenv.config();

const GEMINI = process.env.GEMINI_API_KEY!;

async function testImagen(model: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${GEMINI}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'A simple blue circle logo'
    })
  });
  const d = await res.json();
  if (d.error) return { ok: false, err: d.error.message };
  return { ok: true };
}

async function main() {
  console.log('\n=== IMAGE GENERATION MODELS ===\n');
  const models = ['imagen-4.0-generate-001', 'imagen-4.0-ultra-generate-001', 'imagen-4.0-fast-generate-001'];
  
  for (const m of models) {
    const result = await testImagen(m);
    console.log(`${result.ok ? '✅' : '❌'} ${m}: ${result.err || 'OK'}`);
  }
}

main();