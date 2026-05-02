
import dotenv from 'dotenv';
dotenv.config();

async function testServerLogic() {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const messages = [{ role: 'user', content: 'Hello' }];
  const systemContent = 'You are Catalizia CorporateGPT.';
  
  console.log('Testing OpenRouter fetch...');
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://corporategpt.catalizia.com',
        'X-Title': 'Catalizia CorporateGPT',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'system', content: systemContent }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Fetch failed:', err.message);
  }
}

testServerLogic();
