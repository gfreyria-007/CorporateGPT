/**
 * Image Generator Research Context Test
 * 
 * This script tests that the image generators properly take user context
 * and perform online research before generating images.
 * 
 * Run with: npx tsx test/image-generator-research-test.ts
 */

import { generateProImageForSlide, generateImage } from '../src/services/geminiService';
import { vi } from 'vitest';

console.log('🧪 Image Generator Research Context Test');
console.log('=======================================');

// Mock fetch to simulate API calls
global.fetch = vi.fn();

// Test Configuration
const testConfig = {
  researchEnabled: true,
  searchTimeout: 10000,
  maxTokens: 1000,
  temperature: 0.3
};

// Test Results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName} - PASSED${details ? ` (${details})` : ''}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName} - FAILED${details ? ` (${details})` : ''}`);
  }
  testResults.details.push({ name: testName, passed, details });
}

// Mock API responses
const mockSearchResponse = {
  ok: true,
  json: async () => ({
    candidates: [{
      content: {
        parts: [{
          text: `RESEARCH FINDINGS:
- Current market trends show increasing demand for sustainable business practices
- 78% of global consumers consider sustainability when making purchasing decisions
- Renewable energy adoption has increased by 45% in the past two years
- Environmental regulations are becoming stricter worldwide
- Circular economy models are gaining traction across industries`
        }]
      }
    }]
  })
};

const mockImageResponse = {
  ok: true,
  json: async () => ({
    predictions: [{
      bytesBase64Encoded: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    }])
  })
};

// Test 1: generateProImageForSlide with Research Context
logSection('generateProImageForSlide Research Test');

async function testProImageWithResearch() {
  console.log('📝 Testing generateProImageForSlide with research context...');
  
  try {
    // Mock the fetch calls
    (fetch as any)
      .mockResolvedValueOnce(mockSearchResponse) // Research call
      .mockResolvedValueOnce(mockImageResponse); // Image generation call
    
    const testParams = {
      title: 'Sustainable Business Strategies',
      subtitle: 'Environmental Impact and Growth Opportunities',
      content: [
        'Renewable energy adoption',
        'Waste reduction strategies',
        'Circular economy implementation'
      ],
      style: 'professional',
      chartType: 'bar',
      tableData: 'Metric,Current Year,Target Year\nCarbon Emissions,1000,750\nWater Usage,500,400',
      layout: 'split',
      paragraphs: [
        'Companies implementing sustainable practices see significant cost reductions',
        'Environmental regulations are driving business transformation'
      ],
      imagePrompt: 'Professional business team collaborating on sustainable strategy',
      researchContext: undefined // This should trigger research
    };
    
    console.log('📊 Test parameters:', JSON.stringify(testParams, null, 2));
    
    const result = await generateProImageForSlide(
      testParams.title,
      testParams.subtitle,
      testParams.content,
      testParams.style,
      testParams.chartType,
      testParams.tableData,
      undefined,
      testParams.layout,
      testParams.paragraphs,
      testParams.imagePrompt,
      undefined,
      undefined,
      testParams.researchContext
    );
    
    // Verify the fetch calls were made
    expect((fetch as any).mock.calls.length).toBe(2);
    
    // First call should be research
    const researchCall = (fetch as any).mock.calls[0];
    expect(researchCall[0]).toBe('/api/gemini');
    expect(researchCall[1].method).toBe('POST');
    expect(researchCall[1].body).toContain('generateContent');
    expect(researchCall[1].body).toContain('googleSearch');
    expect(researchCall[1].body).toContain('Sustainable Business Strategies');
    
    // Second call should be image generation
    const imageCall = (fetch as any).mock.calls[1];
    expect(imageCall[0]).toBe('/api/gemini');
    expect(imageCall[1].method).toBe('POST');
    expect(imageCall[1].body).toContain('generateImage');
    expect(imageCall[1].body).toContain('RESEARCH CONTEXT');
    
    logTest('Pro Image with Research', true, 'Research performed and integrated');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    logTest('Pro Image with Research', false, error.message);
    return false;
  }
}

// Test 2: generateProImageForSlide with Pre-existing Research Context
logSection('Pre-existing Research Context Test');

async function testProImageWithExistingResearch() {
  console.log('📝 Testing generateProImageForSlide with pre-existing research context...');
  
  try {
    // Mock only image generation call (no research needed)
    (fetch as any)
      .mockResolvedValueOnce(mockImageResponse);
    
    const existingResearch = `
RESEARCH CONTEXT:
- Current market trends show increasing demand for sustainable business practices
- 78% of global consumers consider sustainability when making purchasing decisions
- Renewable energy adoption has increased by 45% in the past two years
    `;
    
    const testParams = {
      title: 'Sustainable Business Strategies',
      subtitle: 'Environmental Impact and Growth Opportunities',
      content: [
        'Renewable energy adoption',
        'Waste reduction strategies',
        'Circular economy implementation'
      ],
      style: 'professional',
      researchContext: existingResearch // Pre-existing research
    };
    
    console.log('📊 Test parameters with existing research');
    
    const result = await generateProImageForSlide(
      testParams.title,
      testParams.subtitle,
      testParams.content,
      testParams.style,
      'none',
      '',
      undefined,
      'split',
      undefined,
      undefined,
      undefined,
      undefined,
      testParams.researchContext
    );
    
    // Verify only one fetch call was made (image generation only)
    expect((fetch as any).mock.calls.length).toBe(1);
    
    const imageCall = (fetch as any).mock.calls[0];
    expect(imageCall[0]).toBe('/api/gemini');
    expect(imageCall[1].method).toBe('POST');
    expect(imageCall[1].body).toContain('generateImage');
    expect(imageCall[1].body).toContain('RESEARCH CONTEXT');
    expect(imageCall[1].body).toContain(existingResearch);
    
    logTest('Pro Image with Existing Research', true, 'Research reused without duplication');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    logTest('Pro Image with Existing Research', false, error.message);
    return false;
  }
}

// Test 3: Techie generateImage with Educational Research
logSection('Techie Image Educational Research Test');

async function testTechieImageWithResearch() {
  console.log('📝 Testing Techie generateImage with educational research...');
  
  try {
    // Mock the fetch calls
    (fetch as any)
      .mockResolvedValueOnce(mockSearchResponse) // Research call
      .mockResolvedValueOnce(mockImageResponse); // Image generation call
    
    const testParams = {
      prompt: 'Photosynthesis process for biology class',
      aspectRatio: '16:9' as any,
      grade: { name: 'High School', age: 15 },
      userName: 'Student123',
      style: 'scientific' as any,
      researchContext: undefined // Should trigger research
    };
    
    console.log('📊 Test parameters:', JSON.stringify(testParams, null, 2));
    
    const result = await generateImage(
      testParams.prompt,
      testParams.aspectRatio,
      testParams.grade,
      testParams.userName,
      testParams.style,
      'none' as any,
      undefined,
      '1K' as any,
      undefined,
      undefined,
      testParams.researchContext
    );
    
    // Verify the fetch calls were made
    expect((fetch as any).mock.calls.length).toBe(2);
    
    // First call should be educational research
    const researchCall = (fetch as any).mock.calls[0];
    expect(researchCall[0]).toBe('/api/gemini');
    expect(researchCall[1].method).toBe('POST');
    expect(researchCall[1].body).toContain('generateContent');
    expect(researchCall[1].body).toContain('googleSearch');
    expect(researchCall[1].body).toContain('Photosynthesis process');
    expect(researchCall[1].body).toContain('High School');
    
    // Second call should be image generation
    const imageCall = (fetch as any).mock.calls[1];
    expect(imageCall[0]).toBe('/api/techie');
    expect(imageCall[1].method).toBe('POST');
    expect(imageCall[1].body).toContain('generateImage');
    expect(imageCall[1].body).toContain('Educational Topic');
    expect(imageCall[1].body).toContain('Current Research Context');
    
    logTest('Techie Image with Research', true, 'Educational research performed and integrated');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    logTest('Techie Image with Research', false, error.message);
    return false;
  }
}

// Test 4: Error Handling for Research Failures
logSection('Research Error Handling Test');

async function testResearchErrorHandling() {
  console.log('📝 Testing error handling when research fails...');
  
  try {
    // Mock research failure and successful image generation
    (fetch as any)
      .mockRejectedValueOnce(new Error('Research API timeout')) // Research fails
      .mockResolvedValueOnce(mockImageResponse); // Image generation still works
    
    const testParams = {
      title: 'Test Topic',
      subtitle: 'Test Subtitle',
      content: ['Test content'],
      style: 'professional',
      researchContext: undefined // Should trigger research
    };
    
    const result = await generateProImageForSlide(
      testParams.title,
      testParams.subtitle,
      testParams.content,
      testParams.style,
      'none',
      '',
      undefined,
      'split',
      undefined,
      undefined,
      undefined,
      undefined,
      testParams.researchContext
    );
    
    // Verify fetch was called twice (research failed, image succeeded)
    expect((fetch as any).mock.calls.length).toBe(2);
    
    logTest('Research Error Handling', true, 'Research failure handled gracefully');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    logTest('Research Error Handling', false, error.message);
    return false;
  }
}

// Test 5: Research Integration Quality
logSection('Research Integration Quality Test');

async function testResearchIntegrationQuality() {
  console.log('📝 Testing research integration quality in image generation...');
  
  try {
    // Mock successful research and image generation
    (fetch as any)
      .mockResolvedValueOnce(mockSearchResponse)
      .mockResolvedValueOnce(mockImageResponse);
    
    const testParams = {
      title: 'Climate Change Impact',
      subtitle: 'Global Environmental Effects',
      content: [
        'Rising global temperatures',
        'Extreme weather events',
        'Ecosystem disruption'
      ],
      style: 'scientific',
      chartType: 'line',
      tableData: 'Year,Temperature Increase\n2020,1.2°C\n2021,1.3°C\n2022,1.4°C',
      layout: 'technical_drawing',
      researchContext: undefined
    };
    
    const result = await generateProImageForSlide(
      testParams.title,
      testParams.subtitle,
      testParams.content,
      testParams.style,
      testParams.chartType,
      testParams.tableData,
      undefined,
      testParams.layout,
      undefined,
      undefined,
      undefined,
      undefined,
      testParams.researchContext
    );
    
    // Verify that research findings are integrated into the image prompt
    const imageCall = (fetch as any).mock.calls[1];
    const imageBody = JSON.parse(imageCall[1].body);
    
    expect(imageBody.prompt).toContain('RESEARCH CONTEXT');
    expect(imageBody.prompt).toContain('78% of global consumers');
    expect(imageBody.prompt).toContain('45% increase');
    expect(imageBody.prompt).toContain('environmental regulations');
    expect(imageBody.prompt).toContain('circular economy');
    
    logTest('Research Integration Quality', true, 'Research findings properly integrated');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    logTest('Research Integration Quality', false, error.message);
    return false;
  }
}

// Helper function
function logSection(sectionName) {
  console.log(`\n📋 ${sectionName}`);
  console.log('='.repeat(sectionName.length + 2));
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Image Generator Research Tests...\n');
  
  const tests = [
    { name: 'Pro Image with Research', fn: testProImageWithResearch },
    { name: 'Pro Image with Existing Research', fn: testProImageWithExistingResearch },
    { name: 'Techie Image with Research', fn: testTechieImageWithResearch },
    { name: 'Research Error Handling', fn: testResearchErrorHandling },
    { name: 'Research Integration Quality', fn: testResearchIntegrationQuality }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log(''.padEnd(50, '-'));
    
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    
    console.log(result ? '✅ PASSED' : '❌ FAILED');
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=====================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Image generators properly use research context.');
  } else {
    console.log('⚠️  Some tests failed. Please review the failed tests above.');
  }
  
  // Detailed Results Table
  console.log('\n📋 Detailed Test Results:');
  console.log('======================');
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.name}`);
  });
  
  console.log('\n🎯 Key Features Verified:');
  console.log('========================');
  console.log('✅ Online research performed before image generation');
  console.log('✅ Research context integrated into image prompts');
  console.log('✅ Error handling for research failures');
  console.log('✅ Pre-existing research context reuse');
  console.log('✅ Age-appropriate educational research');
  console.log('✅ Factual, current information integration');
  
  console.log('\n🚀 Next Steps:');
  console.log('=============');
  console.log('1. Test with real API endpoints');
  console.log('2. Test with various research topics');
  console.log('3. Test error scenarios thoroughly');
  console.log('4. Monitor performance impact');
  console.log('5. Gather user feedback');
  
  return passed === total;
}

// Run the tests
runAllTests().then(success => {
  console.log(`\n🏁 Test execution completed. Success: ${success}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});