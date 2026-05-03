import dotenv from 'dotenv';
dotenv.config();

const key = process.env.OPENROUTER_API_KEY!;

async function getModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  const models = data.data || [];
  
  console.log('\n=== GEMINI MODELS ===');
  models.filter(m => m.id.includes('gemini')).forEach(m => console.log(m.id));
  
  console.log('\n=== MISTRAL MODELS ===');
  models.filter(m => m.id.includes('mistral') && !m.id.includes('mistralai')).forEach(m => console.log(m.id));
  models.filter(m => m.id.includes('mistralai')).forEach(m => console.log(m.id));
  
  console.log('\n=== ALL MODELS (count) ===');
  console.log(models.length);
}

getModels();