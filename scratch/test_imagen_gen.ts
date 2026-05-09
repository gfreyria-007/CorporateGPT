import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function test() {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [
                { prompt: "a flower" }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: "1:1"
            }
        })
    });
    console.log(res.status);
    const data = await res.json();
    console.log(data.predictions ? "SUCCESS" : JSON.stringify(data));
}
test();
