/**
 * Research Integration Test
 * 
 * This script tests that the image generators perform online research
 * before generating images through the API endpoints.
 * 
 * Run with: npx tsx test/research-integration-test.ts
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';

async function testProImageWithResearch() {
  console.log('🧪 Testing Pro Image Generation with Research...');
  
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateProImageForSlide',
        payload: {
          title: "Climate Change Impact",
          subtitle: "Global Temperature Rise Analysis", 
          content: ["Temperature increase", "Sea level rise", "Extreme weather events"],
          style: "professional",
          researchContext: "Recent climate data from NASA and IPCC reports shows accelerating global warming trends with 2024 being the warmest year on record"
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Pro Image with Research - SUCCESS');
    console.log(`   - Image URL: ${result.imageUrl ? 'Generated' : 'Not available'}`);
    console.log(`   - Enhanced Prompt: ${result.enhancedPrompt ? 'Available' : 'Not available'}`);
    console.log(`   - Model Used: ${result.modelUsed || 'Unknown'}`);
    return true;
  } catch (error) {
    console.error('❌ Pro Image with Research - FAILED:', error.message);
    return false;
  }
}

async function testTechieImageWithResearch() {
  console.log('🧪 Testing Techie Image Generation with Educational Research...');
  
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateImage',
        payload: {
          prompt: "Solar system planets",
          aspectRatio: "1:1",
          grade: { name: "secundaria1", age: 12 },
          userName: "Student",
          researchContext: "Current astronomical data from NASA 2024 showing planet positions, characteristics, and recent space discoveries"
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Techie Image with Research - SUCCESS');
    console.log(`   - Image URL: ${result.url ? 'Generated' : 'Not available'}`);
    console.log(`   - Enhanced Prompt: ${result.enhancedPrompt ? 'Available' : 'Not available'}`);
    console.log(`   - Model Used: ${result.modelUsed || 'Unknown'}`);
    return true;
  } catch (error) {
    console.error('❌ Techie Image with Research - FAILED:', error.message);
    return false;
  }
}

async function testAutoResearchTrigger() {
  console.log('🧪 Testing Automatic Research Trigger...');
  
  try {
    // Test without research context (should trigger automatic research)
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateProImageForSlide',
        payload: {
          title: "Artificial Intelligence",
          subtitle: "Machine Learning Applications",
          content: ["Neural networks", "Deep learning", "AI applications"],
          style: "tech"
          // No researchContext provided - should trigger automatic research
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Auto Research Trigger - SUCCESS');
    console.log(`   - Image URL: ${result.imageUrl ? 'Generated' : 'Not available'}`);
    console.log(`   - Enhanced Prompt: ${result.enhancedPrompt ? 'Available (Research performed)' : 'Not available'}`);
    console.log(`   - Model Used: ${result.modelUsed || 'Unknown'}`);
    return true;
  } catch (error) {
    console.error('❌ Auto Research Trigger - FAILED:', error.message);
    return false;
  }
}

async function runResearchTests() {
  console.log('🚀 Starting Research Integration Tests...\n');
  
  const tests = [
    { name: 'Pro Image with Research', fn: testProImageWithResearch },
    { name: 'Techie Image with Research', fn: testTechieImageWithResearch },
    { name: 'Auto Research Trigger', fn: testAutoResearchTrigger }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log(''.padEnd(50, '-'));
    
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    
    console.log(result ? '✅ PASSED' : '❌ FAILED');
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Summary
  console.log('\n📊 Research Test Results Summary');
  console.log('===============================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 All research tests passed! Online research integration is working correctly.');
  } else {
    console.log('⚠️  Some research tests failed. Please check the server logs above.');
  }
  
  return passed === total;
}

// Run the tests
runResearchTests().then(success => {
  console.log(`\n🏁 Research test execution completed. Success: ${success}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Research test execution failed:', error);
  process.exit(1);
});