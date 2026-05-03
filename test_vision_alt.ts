import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

const alternatives = [
  'qwen/qwen3-vl-8b-instruct',
  'qwen/qwen-vl-plus',
  'qwen/qwen2.5-vl-72b-instruct',
];

async function test(m: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: m, messages: [{ role: 'user', content: [
      { type: 'text', text: 'What is in this image?' },
      { type: 'image_url', image_url: { url: 'https://placehold.co/100x100.png' } }
    ]}]})
  });
  const d = await res.json();
  console.log(`${d.error ? '❌' : '✅'} ${m}: ${d.error?.message || 'OK'}`);
  return !d.error;
}

async function main() {
  for (const m of alternatives) {
    await test(m);
    await new Promise(r => setTimeout(r, 300));
  }
}

main();