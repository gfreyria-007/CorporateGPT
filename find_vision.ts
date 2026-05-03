import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

async function main() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  const models = data.data || [];
  
  console.log('\n=== FREE (or cheap) VISION MODELS ===\n');
  const vision = models.filter((m: any) => {
    const id = m.id.toLowerCase();
    return id.includes('vision') || id.includes('vl-') || id.includes('pixtral');
  }).slice(0, 20);
  
  vision.forEach((m: any) => console.log(`${m.id} | $${m.pricing?.prompt || '?'}/M`));
  
  console.log('\n=== TOP RATED (by popularity) ===\n');
  const top = models.sort((a: any, b: any) => (b.top_provider?.speed || 0) - (a.top_provider?.speed || 0)).slice(0, 10);
  top.forEach((m: any) => console.log(`${m.id} | speed: ${m.top_provider?.speed}`));
}

main();