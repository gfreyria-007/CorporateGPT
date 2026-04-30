import dotenv from 'dotenv';
dotenv.config();

async function checkOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error('OPENROUTER_API_KEY is missing');
    return;
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    const data = await res.json();
    console.log('OpenRouter Key Check:', JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error('OpenRouter check failed:', e.message);
  }
}

checkOpenRouter();
