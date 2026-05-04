import dotenv from 'dotenv';
dotenv.config();

async function checkImagen() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'imagen-3.0-generate-001';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    console.log(`Testing ${model} with generateContent...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'a red apple' }] }]
      })
    });

    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error('Test failed:', e.message);
  }
}

checkImagen();
