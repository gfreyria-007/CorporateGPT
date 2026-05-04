import dotenv from 'dotenv';
dotenv.config();

async function testImage() {
  const url = 'http://localhost:3000/api/gemini';
  const payload = {
    action: 'generateImage',
    payload: {
      prompt: 'a small red ball',
      aspectRatio: '1:1'
    }
  };

  try {
    console.log('Sending request to local server...');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Server error:', err);
      return;
    }

    const data = await res.json();
    const hasImage = data.imageBase64 || data.predictions?.[0]?.bytesBase64Encoded || data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    
    if (hasImage) {
      console.log('SUCCESS: Image generated successfully');
      // Print first 50 chars of base64
      const b64 = data.imageBase64 || data.predictions?.[0]?.bytesBase64Encoded || data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
      console.log('Base64 sample:', b64?.substring(0, 50) + '...');
    } else {
      console.error('FAILURE: Response received but no image data found', JSON.stringify(data, null, 2));
    }
  } catch (e: any) {
    console.error('Fetch failed:', e.message);
  }
}

testImage();
