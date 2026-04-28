const fetch = require('node-fetch');

async function testChat() {
  console.log("Sending request to chat API...");
  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Say the word ALIVE if you are working." }],
        uid: "GUEST_DEMO_UID",
        email: "test@example.com"
      })
    });

    console.log("Status:", res.status, res.statusText);
    
    if (!res.ok) {
        const text = await res.text();
        console.error("Error body:", text);
        return;
    }

    const body = await res.text();
    console.log("Response Body:", body);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

testChat();
