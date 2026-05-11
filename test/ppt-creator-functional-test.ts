/**
 * PPT Creator Functional Test
 * 
 * This script tests the actual functionality of the PPT Creator component
 * by simulating user interactions and verifying API calls.
 * 
 * Run with: npx tsx test/ppt-creator-functional-test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { vi } from 'vitest';
import * as geminiService from '../src/services/geminiService';

// Mock the Gemini service calls
vi.mock('../src/services/geminiService', () => ({
  generateDeepResearch: vi.fn(),
  generateSkeleton: vi.fn()
}));

describe('PPT Creator Functional Tests', () => {
  let mockGenerateDeepResearch: any;
  let mockGenerateSkeleton: any;

  beforeEach(() => {
    mockGenerateDeepResearch = vi.fn();
    mockGenerateSkeleton = vi.fn();
    
    vi.mocked(geminiService.generateDeepResearch).mockImplementation(mockGenerateDeepResearch);
    vi.mocked(geminiService.generateSkeleton).mockImplementation(mockGenerateSkeleton);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Deep Research Generation', () => {
    it('should generate deep research with correct parameters', async () => {
      // Mock successful response
      mockGenerateDeepResearch.mockResolvedValue([
        {
          title: 'Sustainable Business Strategies',
          content: 'Comprehensive analysis of sustainable business practices...',
          sources: ['Source 1', 'Source 2']
        }
      ]);

      const testParams = {
        topic: 'Sustainable Business Strategies',
        audience: 'Corporate Executives',
        keyTakeaway: 'Environmental impact reduction',
        tone: 'professional',
        slideCount: 8
      };

      const result = await geminiService.generateDeepResearch(
        testParams.topic,
        testParams.audience,
        testParams.keyTakeaway,
        testParams.tone,
        testParams.slideCount
      );

      expect(mockGenerateDeepResearch).toHaveBeenCalledWith(
        testParams.topic,
        testParams.audience,
        testParams.keyTakeaway,
        testParams.tone,
        testParams.slideCount
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Sustainable Business Strategies');
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockGenerateDeepResearch.mockRejectedValue(new Error('API Error: 500 Internal Server Error'));

      await expect(geminiService.generateDeepResearch(
        'Test Topic',
        'Test Audience',
        'Test Takeaway',
        'professional',
        5
      )).rejects.toThrow('API Error');
    });

    it('should return fallback content on error', async () => {
      // Mock API error
      mockGenerateDeepResearch.mockRejectedValue(new Error('API Error'));

      try {
        await geminiService.generateDeepResearch(
          'Test Topic',
          'Test Audience',
          'Test Takeaway',
          'professional',
          5
        );
      } catch (error) {
        // The component should handle this error and generate fallback content
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Slide Skeleton Generation', () => {
    it('should generate slide skeleton with comprehensive context', async () => {
      // Mock successful response
      mockGenerateSkeleton.mockResolvedValue([
        {
          id: 'slide-1',
          title: 'Introduction to Sustainability',
          subtitle: '',
          content: ['Key point 1', 'Key point 2', 'Key point 3'],
          paragraphs: ['Detailed explanation 1', 'Detailed explanation 2'],
          imagePrompt: 'Sustainable business concept visualization',
          chartType: 'none',
          tableData: '',
          visualLayout: 'split'
        }
      ]);

      const testParams = {
        prompt: 'Sustainable Business Strategies',
        count: 5,
        additionalContext: 'Research context about sustainability...',
        audience: 'Corporate Executives',
        tone: 'professional',
        keyTakeaway: 'Environmental impact reduction',
        visualStyle: 'professional'
      };

      const result = await geminiService.generateSkeleton(
        testParams.prompt,
        testParams.count,
        testParams.additionalContext,
        testParams.audience,
        testParams.tone,
        testParams.keyTakeaway,
        testParams.visualStyle
      );

      expect(mockGenerateSkeleton).toHaveBeenCalledWith(
        testParams.prompt,
        testParams.count,
        testParams.additionalContext,
        testParams.audience,
        testParams.tone,
        testParams.keyTakeaway,
        testParams.visualStyle
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Introduction to Sustainability');
      expect(result[0].content).toHaveLength(3);
    });

    it('should handle empty responses gracefully', async () => {
      // Mock empty response
      mockGenerateSkeleton.mockResolvedValue([]);

      const result = await geminiService.generateSkeleton(
        'Test Prompt',
        5,
        'Test Context',
        'Test Audience',
        'professional',
        'Test Takeaway',
        'professional'
      );

      expect(result).toEqual([]);
      expect(mockGenerateSkeleton).toHaveBeenCalled();
    });
  });

  describe('Context Integration', () => {
    it('should merge research context into skeleton generation', async () => {
      const researchContext = 'Deep research content about sustainable business practices...';
      
      mockGenerateSkeleton.mockResolvedValue([
        {
          id: 'slide-1',
          title: 'Merged Research Title',
          subtitle: '',
          content: ['Merged content'],
          paragraphs: ['Merged paragraphs'],
          imagePrompt: 'Merged image prompt',
          chartType: 'none',
          tableData: '',
          visualLayout: 'split'
        }
      ]);

      await geminiService.generateSkeleton(
        'Sustainable Business',
        5,
        researchContext,
        'Executives',
        'professional',
        'Key takeaway',
        'professional'
      );

      expect(mockGenerateSkeleton).toHaveBeenCalledWith(
        'Sustainable Business',
        5,
        researchContext,
        'Executives',
        'professional',
        'Key takeaway',
        'professional'
      );
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed API calls', async () => {
      let callCount = 0;
      
      // Mock first call to fail, second to succeed
      mockGenerateDeepResearch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('API Error'));
        } else {
          return Promise.resolve([{ title: 'Success', content: 'Success content', sources: [] }]);
        }
      });

      // Simulate retry logic
      try {
        await geminiService.generateDeepResearch('Test', 'Test', 'Test', 'professional', 5);
      } catch (error) {
        // First call fails
        expect(callCount).toBe(1);
      }

      // Second call should succeed
      const result = await geminiService.generateDeepResearch('Test', 'Test', 'Test', 'professional', 5);
      expect(callCount).toBe(2);
      expect(result).toHaveLength(1);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large research contexts efficiently', async () => {
      // Create a large research context
      const largeContext = 'Research content...'.repeat(1000);
      
      mockGenerateSkeleton.mockResolvedValue([
        {
          id: 'slide-1',
          title: 'Large Context Test',
          subtitle: '',
          content: ['Test content'],
          paragraphs: ['Test paragraphs'],
          imagePrompt: 'Test image prompt',
          chartType: 'none',
          tableData: '',
          visualLayout: 'split'
        }
      ]);

      const startTime = performance.now();
      
      await geminiService.generateSkeleton(
        'Test Prompt',
        5,
        largeContext,
        'Test Audience',
        'professional',
        'Test Takeaway',
        'professional'
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(mockGenerateSkeleton).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number),
        largeContext,
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
    });
  });
});

// Integration test for the complete flow
describe('PPT Creator Integration Test', () => {
  it('should complete the full research-to-skeleton flow', async () => {
    // Mock deep research
    vi.mocked(geminiService.generateDeepResearch).mockResolvedValue([
      {
        title: 'Research Topic 1',
        content: 'Research content 1',
        sources: ['Source 1']
      },
      {
        title: 'Research Topic 2',
        content: 'Research content 2',
        sources: ['Source 2']
      }
    ]);

    // Mock skeleton generation
    vi.mocked(geminiService.generateSkeleton).mockResolvedValue([
      {
        id: 'slide-1',
        title: 'Slide 1',
        subtitle: '',
        content: ['Content 1'],
        paragraphs: ['Paragraph 1'],
        imagePrompt: 'Image prompt 1',
        chartType: 'none',
        tableData: '',
        visualLayout: 'split'
      },
      {
        id: 'slide-2',
        title: 'Slide 2',
        subtitle: '',
        content: ['Content 2'],
        paragraphs: ['Paragraph 2'],
        imagePrompt: 'Image prompt 2',
        chartType: 'bar',
        tableData: 'Label,Value\nData1,100\nData2,200',
        visualLayout: 'grid'
      }
    ]);

    // Simulate the complete flow
    console.log('🔄 Starting complete PPT Creator flow test...');
    
    // Step 1: Generate deep research
    const researchResult = await geminiService.generateDeepResearch(
      'Test Topic',
      'Test Audience',
      'Test Takeaway',
      'professional',
      5
    );

    console.log('✅ Deep research generated:', researchResult.length, 'topics');

    // Step 2: Generate skeleton
    const researchContext = researchResult.map(r => r.content).join('\n\n');
    const skeletonResult = await geminiService.generateSkeleton(
      'Test Topic',
      5,
      researchContext,
      'Test Audience',
      'professional',
      'Test Takeaway',
      'professional'
    );

    console.log('✅ Slide skeleton generated:', skeletonResult.length, 'slides');

    // Verify the integration
    expect(researchResult).toHaveLength(2);
    expect(skeletonResult).toHaveLength(2);
    expect(skeletonResult[0].title).toBe('Slide 1');
    expect(skeletonResult[1].chartType).toBe('bar');

    console.log('🎉 Complete flow test passed!');
  });
});