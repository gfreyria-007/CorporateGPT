import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY!;

async function main() {
  // Get available models
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  
  console.log('\n=== MODELS WITH IMAGE SUPPORT ===\n');
  const models = data.models || [];
  const imageModels = models.filter((m: any) => 
    m.supports?.responseModalities?.includes('IMAGE') || 
    m.supports?.methods?.includes('generateImage') ||
    m.name.includes('imagen')
  );
  
  imageModels.forEach((m: any) => console.log(`${m.name} | ${m.supports?.responseModalities?.join(', ') || 'N/A'}`));
  
  if (imageModels.length === 0) {
    console.log('No models explicitly support IMAGE modality');
    console.log('\nChecking all available models...');
    models.slice(0, 20).forEach((m: any) => console.log(`${m.name}`));
  }
}

main();