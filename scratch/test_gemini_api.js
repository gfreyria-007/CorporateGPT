fetch('https://v0-corporategpt.vercel.app/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'generateContent', payload: { model: 'gemini-3.1-pro-preview', contents: 'test' } })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
