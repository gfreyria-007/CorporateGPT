import dotenv from 'dotenv';
dotenv.config();

const MODELS = [
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (Vision)' },
  { id: 'qwen/qwen2-vl-72b-instruct', name: 'Qwen2-VL 72B (Vision)' },
];

async function testModel(modelId: string, name: string, imageTest = false) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error('❌ OPENROUTER_API_KEY missing');
    return;
  }

  const messages = imageTest ? [
    { role: 'user', content: [
      { type: 'text', text: 'What do you see in this image?' },
      { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png' } }
    ]}
  ] : [
    { role: 'user', content: `Hello from ${name}, respond with just "OK"` }
  ];

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
      console.log(`✅ ${name}: ${content.substring(0, 50)}`);
    }
  } catch (e: any) {
    console.log(`❌ ${name}: ${e.message}`);
  }
}

async function main() {
  console.log('\n=== TEXT MODELS ===\n');
  for (const m of MODELS.slice(0, 4)) {
    await testModel(m.id, m.name);
  }
  
  console.log('\n=== IMAGE/VISION MODELS ===\n');
  for (const m of MODELS.slice(4)) {
    await testModel(m.id, m.name, true);
  }
}

main();