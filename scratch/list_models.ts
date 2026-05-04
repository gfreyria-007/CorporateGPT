import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Available Models:');
    data.models?.forEach((m: any) => {
      if (m.name.includes('imagen')) {
        console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods})`);
      }
    });
    // Also log if no imagen models found
    if (!data.models?.some((m: any) => m.name.includes('imagen'))) {
      console.log('No Imagen models found in the list.');
      // Log some regular models to verify API key works
      console.log('Regular models:', data.models?.slice(0, 5).map((m: any) => m.name));
    }
  } catch (e: any) {
    console.error('List failed:', e.message);
  }
}

listModels();
