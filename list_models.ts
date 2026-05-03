import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

async function listModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  
  const models = data.data || [];
  
  console.log('\n=== Available Vision/Image Models ===\n');
  const vision = models.filter((m: any) => 
    m.id.includes('vision') || m.id.includes('vl-') || m.id.includes(' multimodal') || m.architectures?.includes('multimodal')
  );
  vision.forEach((m: any) => console.log(`  ${m.id}`));
  
  console.log('\n=== Available Claude Models ===\n');
  const claude = models.filter((m: any) => m.id.includes('claude'));
  claude.forEach((m: any) => console.log(`  ${m.id}`));
  
  console.log('\n=== Available GPT-4o ===\n');
  const gpt4o = models.filter((m: any) => m.id.includes('gpt-4o'));
  gpt4o.forEach((m: any) => console.log(`  ${m.id}`));
}

listModels();