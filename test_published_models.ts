import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

const POPULAR_MODELS = [
  'deepseek/deepseek-r1',
  'qwen/qwen-2.5-72b-instruct',
  'anthropic/claude-3.7-sonnet',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'google/gemini-2.0-flash-001',
  'google/gemini-2.0-flash',
  'google/gemini-1.5-flash',
  'meta-llama/llama-3.1-8b-instruct',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.2-11b-vision-instruct',
  'mistralai/mistral-7b-instruct',
  'mistralai/mixtral-8x7b-instruct',
  'qwen/qwen3-vl-32b-instruct',
  'qwen/qwen3-vl-8b-instruct',
];

async function testModel(modelId: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      model: modelId, 
      messages: [{ role: 'user', content: 'Say OK' }]
    })
  });
  const data = await res.json();
  
  if (data.error) return { status: '❌', msg: data.error.message };
  return { status: '✅', msg: data.choices?.[0]?.message?.content?.substring(0,30) || 'OK' };
}

async function main() {
  console.log('\n=== TESTING ALL PUBLISHED MODELS ===\n');
  let passed = 0, failed = 0;
  
  for (const model of POPULAR_MODELS) {
    const result = await testModel(model);
    console.log(`${result.status} ${model}: ${result.msg}`);
    if (result.status === '✅') passed++; else failed++;
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);
}

main();