/**
 * Quick Server Test
 * 
 * This script quickly tests if the server is responding and
 * the new research handlers are working.
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';

async function testServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server Health - OK');
      console.log(`   Status: ${data.status}`);
      console.log(`   Version: ${data.version}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Server Health - FAILED:', error.message);
    return false;
  }
}

async function testResearchHandlers() {
  console.log('\n🧪 Testing Research Handlers...');
  
  // Test Pro Image Handler
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateProImageForSlide',
        payload: {
          title: "Test",
          subtitle: "Research Test",
          content: ["Testing"],
          style: "professional"
        }
      })
    });
    
    console.log(`   Pro Image Handler: ${response.status}`);
  } catch (error) {
    console.log(`   Pro Image Handler: Error - ${error.message}`);
  }
  
  // Test Techie Image Handler
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateImage',
        payload: {
          prompt: "Test educational image",
          aspectRatio: "1:1",
          grade: { name: "primaria1", age: 6 }
        }
      })
    });
    
    console.log(`   Techie Image Handler: ${response.status}`);
  } catch (error) {
    console.log(`   Techie Image Handler: Error - ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Quick Server Test...\n');
  
  const serverOk = await testServerHealth();
  if (serverOk) {
    await testResearchHandlers();
    console.log('\n🎯 Test completed. Check responses above.');
  } else {
    console.log('\n❌ Server is not responding correctly.');
  }
}

main();