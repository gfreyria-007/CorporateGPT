const fs = require('fs');
const fetch = require('node-fetch');

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello' }],
        uid: 'test',
        email: 'test@test.com',
        attachments: [{
          name: 'test.pdf',
          type: 'application/pdf',
          base64: 'JVBERi0xLjQKJcOkw7zDts...'
        }]
      })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) { console.error(e); }
}
run();
