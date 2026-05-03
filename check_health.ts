import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

const CRITICAL_MODELS: { id: string; provider: 'google' | 'openrouter'; type: 'text' | 'vision' }[] = [
  { id: 'gemini-2.5-flash', provider: 'google', type: 'text' },
  { id: 'deepseek/deepseek-r1', provider: 'openrouter', type: 'text' },
  { id: 'qwen/qwen-2.5-72b-instruct', provider: 'openrouter', type: 'text' },
  { id: 'openai/gpt-4o', provider: 'openrouter', type: 'text' },
];

async function testModel(m: typeof CRITICAL_MODELS[0]) {
  if (m.provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: m.id, messages: [{ role: 'user', content: 'OK' }] })
    });
    const d = await res.json();
    return { ok: !d.error, error: d.error?.message };
  } else if (m.provider === 'google') {
    const geminiKey = process.env.GEMINI_API_KEY!;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m.id}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'OK' }] }] })
      });
      const d = await res.json().catch(() => ({}));
      return { ok: res.ok && !d.error, error: d.error?.message };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }
}

async function main() {
  console.log('=== CRITICAL MODELS HEALTH CHECK ===\n');
  let failures = 0;
  
  for (const m of CRITICAL_MODELS) {
    const result = await testModel(m);
    console.log(`${result.ok ? '✅' : '❌'} ${m.id} (${m.type}): ${result.ok ? 'OK' : result.error}`);
    if (!result.ok) failures++;
  }
  
  console.log(`\n=== STATUS: ${CRITICAL_MODELS.length - failures}/${CRITICAL_MODELS.length} working ===`);
  if (failures > 0) {
    console.log('\n⚠️ WARNING: Some critical models are down!');
    console.log('Action needed: Update api/chat.ts with working alternatives');
  }
}

main();