import dotenv from 'dotenv';
dotenv.config();

const GEMINI = process.env.GEMINI_API_KEY!;

async function testImageModel(model: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Create a simple logo: a blue circle' }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        temperature: 0.7
      }
    })
  });
  const d = await res.json();
  if (d.error) return { ok: false, err: d.error.message };
  const hasImage = d.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
  return { ok: !!hasImage, hasImage };
}

async function main() {
  console.log('\n=== IMAGE GENERATION MODELS TEST ===\n');
  
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.5-flash'];
  
  for (const m of models) {
    console.log(`Testing ${m}...`);
    const result = await testImageModel(m);
    console.log(`  ${result.ok ? '✅' : '❌'} ${m}: ${result.err || (result.hasImage ? 'Image OK' : 'No image')}`);
    await new Promise(r => setTimeout(r, 500));
  }
}

main();