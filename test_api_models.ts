import dotenv from 'dotenv';
dotenv.config();

const GEMINI = process.env.GEMINI_API_KEY!;
const OPENROUTER = process.env.OPENROUTER_API_KEY!;

async function testGemini(model: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Say OK' }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
    })
  });
  const d = await res.json();
  if (d.error) return { ok: false, err: d.error.message };
  return { ok: true, text: d.candidates?.[0]?.content?.parts?.[0]?.text };
}

async function testOpenRouter(model: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENROUTER}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Say OK' }] })
  });
  const d = await res.json();
  if (d.error) return { ok: false, err: d.error.message };
  return { ok: true, text: d.choices?.[0]?.message?.content };
}

async function main() {
  console.log('\n=== Testing /api/chat.ts models (Gemini) ===\n');
  const g1 = await testGemini('gemini-1.5-flash');
  console.log(`gemini-1.5-flash: ${g1.ok ? '✅' : '❌'} ${g1.err || g1.text}`);
  
  const g2 = await testGemini('gemini-2.0-flash');
  console.log(`gemini-2.0-flash: ${g2.ok ? '✅' : '❌'} ${g2.err || g2.text}`);

  console.log('\n=== Testing /api/chat.ts models (OpenRouter) ===\n');
  const o1 = await testOpenRouter('minimax/m2.5-free');
  console.log(`minimax/m2.5-free: ${o1.ok ? '✅' : '❌'} ${o1.err || o1.text}`);
}

main();