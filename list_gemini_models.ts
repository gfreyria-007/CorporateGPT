import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('GEMINI_API_KEY is missing');
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log('Available Models:', JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error('List models failed:', e.message);
  }
}

listModels();
