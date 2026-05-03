import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

const MODELS = [
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash 001', vision: false },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', vision: true },
  { id: 'google/gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', vision: true },
  { id: 'google/gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image', vision: true },
  { id: 'mistralai/mistral-7b-instruct-v0.1', name: 'Mistral 7B v0.1', vision: false },
  { id: 'mistralai/pixtral-large-2411', name: 'Pixtral Large (Vision)', vision: true },
];

async function test(m: typeof MODELS[0]) {
  const msgs = m.vision ? [
    { role: 'user', content: [
      { type: 'text', text: 'What?' },
      { type: 'image_url', image_url: { url: 'https://placehold.co/100x100.png' } }
    ]}
  ] : [{ role: 'user', content: 'OK' }];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: m.id, messages: msgs })
  });
  const data = await res.json();
  const ok = !data.error;
  console.log(`${ok ? '✅' : '❌'} ${m.name} (${m.id}): ${data.error?.message || data.choices?.[0]?.message?.content?.slice(0,20) || 'OK'}`);
  return ok;
}

async function main() {
  console.log('\n=== CORRECTED & VISION MODELS ===\n');
  for (const m of MODELS) {
    await test(m);
    await new Promise(r => setTimeout(r, 400));
  }
}

main();