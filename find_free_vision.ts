import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

async function getFreeVisionModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  const models = data.data || [];
  
  const freeVision = models.filter((m: any) => {
    const id = m.id.toLowerCase();
    const price = parseFloat(m.pricing?.prompt || '0');
    return (id.includes('vision') || id.includes('vl-') || id.includes('image') || id.includes('pixtral') || id.includes('multimodal')) && price === 0;
  });
  
  console.log('\n=== FREE VISION MODELS ===\n');
  freeVision.forEach((m: any) => console.log(`${m.id} | ctx: ${m.context_length} | pricing: ${m.pricing?.prompt || '?'}`));
}

getFreeVisionModels();