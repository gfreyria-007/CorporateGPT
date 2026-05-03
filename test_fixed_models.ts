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
  console.log('\n=== Testing FIXED models ===\n');
  console.log('--- Gemini ---');
  console.log(`gemini-2.5-flash: ${(await testGemini('gemini-2.5-flash')).ok ? '✅' : '❌'}`);
  console.log(`gemini-2.0-flash-001: ${(await testGemini('gemini-2.0-flash-001')).ok ? '✅' : '❌'}`);
  console.log(`gemini-2.0-flash-lite-001: ${(await testGemini('gemini-2.0-flash-lite-001')).ok ? '✅' : '❌'}`);
  console.log(`gemini-1.5-flash-8b: ${(await testGemini('gemini-1.5-flash-8b')).ok ? '✅' : '❌'}`);
  
  console.log('\n--- OpenRouter ---');
  console.log(`deepseek/deepseek-r1: ${(await testOpenRouter('deepseek/deepseek-r1')).ok ? '✅' : '❌'}`);
}

main();