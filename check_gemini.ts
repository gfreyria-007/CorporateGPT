import dotenv from 'dotenv';
dotenv.config();

async function checkGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('GEMINI_API_KEY is missing');
    return;
  }

  const model = "gemini-1.5-flash"; 
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
      })
    });
    const data = await res.json();
    console.log('Gemini Check (v1):', JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error('Gemini check failed:', e.message);
  }
}

checkGemini();
