import fetch from 'node-fetch';

async function testOpenRouter() {
  const apiKey = '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';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'Test'
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: 'Say hello' }]
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testOpenRouter();
