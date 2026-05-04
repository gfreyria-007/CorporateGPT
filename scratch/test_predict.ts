import dotenv from 'dotenv';
dotenv.config();

async function testPredict() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'imagen-4.0-fast-generate-001';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

  try {
    console.log(`Testing ${model} with aspectRatio: '1:1'...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: 'a small red ball' }],
        parameters: { 
            sampleCount: 1,
            aspectRatio: '1:1'
        }
      })
    });

    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (e: any) {
    console.error('Test failed:', e.message);
  }
}

testPredict();
