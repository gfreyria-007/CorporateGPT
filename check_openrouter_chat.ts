import dotenv from 'dotenv';
dotenv.config();

async function checkOpenRouterChat() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error('OPENROUTER_API_KEY is missing');
    return;
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: 'hello' }]
      })
    });
    const data = await res.json();
    console.log('OpenRouter Chat Check:', JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error('OpenRouter check failed:', e.message);
  }
}

checkOpenRouterChat();
