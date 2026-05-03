import dotenv from 'dotenv';
dotenv.config();

const MODELS = [
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Text)' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B (Text)' },
  { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet (Text)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Text)' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (Vision)' },
  { id: 'qwen/qwen3-vl-32b-instruct', name: 'Qwen3-VL 32B (Vision)' },
  { id: 'meta-llama/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision' },
];

async function testModel(modelId: string, name: string, isVision: boolean) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error('❌ Missing API key');
    return;
  }

  const messages = isVision ? [
    { role: 'user', content: [
      { type: 'text', text: 'What do you see? Reply OK.' },
      { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/200px-Python-logo-notext.svg.png' } }
    ]}
  ] : [{ role: 'user', content: 'Reply OK.' }];

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: modelId, messages })
    });
    const data = await res.json();
    
    if (data.error) {
      console.log(`❌ ${name}: ${data.error.message || data.error}`);
    } else {
      const content = data.choices?.[0]?.message?.content || '';
      console.log(`✅ ${name}: ${content.substring(0, 60)}`);
    }
  } catch (e: any) {
    console.log(`❌ ${name}: ${e.message}`);
  }
}

async function main() {
  console.log('\n=== TEXT MODELS ===\n');
  for (const m of MODELS.slice(0, 4)) {
    await testModel(m.id, m.name, false);
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n=== VISION/IMAGE MODELS ===\n');
  for (const m of MODELS.slice(4)) {
    await testModel(m.id, m.name, true);
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n=== SUMMARY ===\n');
  console.log('All configured models tested.');
}

main();