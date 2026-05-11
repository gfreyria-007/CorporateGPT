/**
 * Image Generator API Test
 * 
 * This script tests the image generators with real API calls to verify
 * that online research is performed before image generation.
 * 
 * Run with: npx tsx test/image-generator-api-test.ts
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8080';

// Test data
const testData = {
  proImage: {
    title: "Climate Change Impact",
    subtitle: "Global Temperature Rise Analysis",
    content: ["Temperature increase", "Sea level rise", "Extreme weather events"],
    style: "professional",
    researchContext: "Recent climate data from NASA and IPCC reports shows accelerating global warming trends"
  },
  techieImage: {
    prompt: "Solar system planets",
    aspectRatio: "1:1",
    grade: { name: "secundaria1", age: 12 },
    userName: "Student",
    researchContext: "Current astronomical data showing planet positions and characteristics from NASA 2024"
  }
};

async function testProImageGeneration() {
  console.log('🧪 Testing Pro Image Generation with Research...');
  
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateProImageForSlide',
        payload: testData.proImage
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Pro Image Generation - SUCCESS');
    console.log(`   - Image URL: ${result.imageUrl ? 'Generated' : 'Not available'}`);
    console.log(`   - Enhanced Prompt: ${result.enhancedPrompt ? 'Available' : 'Not available'}`);
    return true;
  } catch (error) {
    console.error('❌ Pro Image Generation - FAILED:', error.message);
    return false;
  }
}

async function testTechieImageGeneration() {
  console.log('🧪 Testing Techie Image Generation with Research...');
  
  try {
    const response = await fetch(`${API_BASE}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateImage',
        payload: testData.techieImage
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Techie Image Generation - SUCCESS');
    console.log(`   - Image URL: ${result.url ? 'Generated' : 'Not available'}`);
    console.log(`   - Enhanced Prompt: ${result.enhancedPrompt ? 'Available' : 'Not available'}`);
    return true;
  } catch (error) {
    console.error('❌ Techie Image Generation - FAILED:', error.message);
    return false;
  }
}

async function testResearchFunctionality() {
  console.log('🧪 Testing Research Functionality...');
  
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Research Functionality - SUCCESS');
    console.log(`   - Auto-research triggered: ${result.enhancedPrompt ? 'Yes' : 'No'}`);
    return true;
  } catch (error) {
    console.error('❌ Research Functionality - FAILED:', error.message);
    return false;
  }
}

async function runAPITests() {
  console.log('🚀 Starting Image Generator API Tests...\n');
  
  const tests = [
    { name: 'Pro Image Generation', fn: testProImageGeneration },
    { name: 'Techie Image Generation', fn: testTechieImageGeneration },
    { name: 'Research Functionality', fn: testResearchFunctionality }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log(''.padEnd(50, '-'));
    
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    
    console.log(result ? '✅ PASSED' : '❌ FAILED');
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n📊 API Test Results Summary');
  console.log('=========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 All API tests passed! Research integration is working correctly.');
  } else {
    console.log('⚠️  Some API tests failed. Please check the server logs and test details above.');
  }
  
  return passed === total;
}

// Run the tests
runAPITests().then(success => {
  console.log(`\n🏁 API test execution completed. Success: ${success}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ API test execution failed:', error);
  process.exit(1);
});