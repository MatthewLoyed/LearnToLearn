/**
 * OpenAI Service Unit Tests
 * Tests for AI-powered roadmap generation and customization
 */

import { 
  generateCustomization, 
  generateRoadmap, 
  generateCompleteRoadmap,
  estimateRoadmapCost,
  logCostUsage,
  type OpenAIGenerationRequest,
  type TopicCustomization,
  type RoadmapData
} from './openai-service';

// Mock environment variables
const originalEnv = process.env;

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateCustomization', () => {
    const mockOpenAIResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            category: 'tech',
            font: 'Inter',
            icon: 'Code',
            accentColor: 'blue-600',
            background: 'none'
          })
        }
      }],
      usage: {
        prompt_tokens: 150,
        completion_tokens: 50,
        total_tokens: 200
      }
    };

    it('should generate customization successfully', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      });

      // Act
      const result = await generateCustomization('React');

      // Assert
      expect(result).toEqual({
        category: 'tech',
        font: 'Inter',
        icon: 'Code',
        accentColor: 'blue-600',
        background: 'none'
      });
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          }),
          body: expect.stringContaining('React')
        })
      );
    });

    it('should return default customization when API key is missing', async () => {
      // Arrange
      delete process.env.OPENAI_API_KEY;

      // Act
      const result = await generateCustomization('React');

      // Assert
      expect(result).toEqual({
        category: 'general',
        font: 'Inter',
        icon: 'Target',
        accentColor: 'blue-600',
        background: 'none'
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return default customization when API call fails', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      // Act
      const result = await generateCustomization('React');

      // Assert
      expect(result).toEqual({
        category: 'general',
        font: 'Inter',
        icon: 'Target',
        accentColor: 'blue-600',
        background: 'none'
      });
    });

    it('should handle invalid JSON response', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'invalid json'
            }
          }]
        })
      });

      // Act
      const result = await generateCustomization('React');

      // Assert
      expect(result).toEqual({
        category: 'general',
        font: 'Inter',
        icon: 'Target',
        accentColor: 'blue-600',
        background: 'none'
      });
    });

    it('should handle missing response structure', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      // Act
      const result = await generateCustomization('React');

      // Assert
      expect(result).toEqual({
        category: 'general',
        font: 'Inter',
        icon: 'Target',
        accentColor: 'blue-600',
        background: 'none'
      });
    });
  });

  describe('generateRoadmap', () => {
    const mockRoadmapResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            topic: 'React',
            queryType: 'career-focused',
            overview: 'Learn React for career development',
            totalEstimatedTime: '8-12 weeks',
            prerequisites: ['HTML', 'CSS', 'JavaScript'],
            tips: ['Practice regularly', 'Build projects'],
            milestones: [
              {
                id: 'react-basics',
                title: 'React Fundamentals',
                description: 'Learn React basics',
                estimatedTime: '2-3 weeks',
                difficulty: 'beginner',
                resources: [
                  {
                    type: 'video',
                    searchTerms: ['React tutorial beginners'],
                    description: 'React basics video'
                  }
                ]
              }
            ]
          })
        }
      }],
      usage: {
        prompt_tokens: 500,
        completion_tokens: 300,
        total_tokens: 800
      }
    };

    const mockRequest: OpenAIGenerationRequest = {
      topic: 'React',
      skillLevel: 'beginner',
      timeCommitment: 'flexible',
      aiEnabled: true
    };

    it('should generate roadmap successfully', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoadmapResponse
      });

      // Act
      const result = await generateRoadmap(mockRequest);

      // Assert
      expect(result).toEqual({
        topic: 'React',
        queryType: 'career-focused',
        overview: 'Learn React for career development',
        totalEstimatedTime: '8-12 weeks',
        prerequisites: ['HTML', 'CSS', 'JavaScript'],
        tips: ['Practice regularly', 'Build projects'],
        milestones: [
          {
            id: 'react-basics',
            title: 'React Fundamentals',
            description: 'Learn React basics',
            estimatedTime: '2-3 weeks',
            difficulty: 'beginner',
            resources: [
              {
                type: 'video',
                searchTerms: ['React tutorial beginners'],
                description: 'React basics video'
              }
            ]
          }
        ]
      });
    });

    it('should throw error when API key is missing', async () => {
      // Arrange
      delete process.env.OPENAI_API_KEY;

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('OpenAI API key not configured');
    });

    it('should handle API errors', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => 'Rate limit exceeded'
      });

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('OpenAI API rate limit exceeded');
    });

    it('should handle invalid JSON response', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'invalid json'
            }
          }]
        })
      });

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('Unexpected token');
    });

    it('should validate and clean roadmap data', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                topic: 'React',
                queryType: 'invalid-type',
                overview: '',
                totalEstimatedTime: '',
                prerequisites: null,
                tips: null,
                milestones: [
                  {
                    id: '',
                    title: '',
                    description: '',
                    estimatedTime: '',
                    difficulty: 'invalid',
                    resources: null
                  }
                ]
              })
            }
          }],
          usage: { total_tokens: 100 }
        })
      });

      // Act
      const result = await generateRoadmap(mockRequest);

      // Assert
      expect(result).toEqual({
        topic: 'React',
        queryType: 'comprehensive-learning',
        overview: 'Learn React step by step',
        totalEstimatedTime: '8-12 weeks',
        prerequisites: [],
        tips: [],
        milestones: [
          {
            id: 'milestone-0',
            title: 'Milestone 1',
            description: 'Learn this topic',
            estimatedTime: '2-3 weeks',
            difficulty: 'beginner',
            resources: []
          }
        ]
      });
    });

    it('should extract JSON from response with extra text', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'Here is your roadmap:\n\n' + JSON.stringify({
                topic: 'React',
                queryType: 'career-focused',
                overview: 'Learn React',
                totalEstimatedTime: '8-12 weeks',
                prerequisites: [],
                tips: [],
                milestones: []
              }) + '\n\nHope this helps!'
            }
          }],
          usage: { total_tokens: 100 }
        })
      });

      // Act
      const result = await generateRoadmap(mockRequest);

      // Assert
      expect(result.topic).toBe('React');
      expect(result.queryType).toBe('career-focused');
    });
  });

  describe('generateCompleteRoadmap', () => {
    const mockRequest: OpenAIGenerationRequest = {
      topic: 'React',
      skillLevel: 'beginner',
      timeCommitment: 'flexible',
      aiEnabled: true
    };

    it('should generate complete roadmap with customization', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      
      // Mock customization response
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: {
                content: JSON.stringify({
                  category: 'tech',
                  font: 'Inter',
                  icon: 'Code',
                  accentColor: 'blue-600',
                  background: 'none'
                })
              }
            }],
            usage: { total_tokens: 100 }
          })
        })
        // Mock roadmap response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{
              message: {
                content: JSON.stringify({
                  topic: 'React',
                  queryType: 'career-focused',
                  overview: 'Learn React',
                  totalEstimatedTime: '8-12 weeks',
                  prerequisites: [],
                  tips: [],
                  milestones: []
                })
              }
            }],
            usage: { total_tokens: 200 }
          })
        });

      // Act
      const result = await generateCompleteRoadmap(mockRequest);

      // Assert
      expect(result).toEqual({
        roadmap: {
          topic: 'React',
          queryType: 'comprehensive-learning',
          overview: 'Learn React step by step',
          totalEstimatedTime: '8-12 weeks',
          prerequisites: [],
          tips: [],
          milestones: []
        },
        customization: {
          category: 'general',
          font: 'Inter',
          icon: 'Target',
          accentColor: 'blue-600',
          background: 'none'
        },
        metadata: {
          generationTime: expect.any(Number),
          tokensUsed: 0,
          estimatedCost: 0,
          model: 'gpt-4o-mini',
          fallbackUsed: false
        }
      });
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      delete process.env.OPENAI_API_KEY;

      // Act & Assert
      await expect(generateCompleteRoadmap(mockRequest)).rejects.toThrow('OpenAI API key not configured');
    });
  });

  describe('estimateRoadmapCost', () => {
    it('should return estimated cost', () => {
      // Act
      const cost = estimateRoadmapCost();

      // Assert
      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });
  });

  describe('logCostUsage', () => {
    it('should log cost usage', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      logCostUsage('React', 500, 300);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('💰 OpenAI API Cost:', {
        topic: 'React',
        inputTokens: 500,
        outputTokens: 300,
        totalTokens: 800,
        cost: expect.stringMatching(/^\$[\d.]+$/)
      });

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    const mockRequest: OpenAIGenerationRequest = {
      topic: 'React',
      skillLevel: 'beginner',
      timeCommitment: 'flexible',
      aiEnabled: true
    };

    it('should handle 401 unauthorized error', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'invalid-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid API key'
      });

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('Invalid OpenAI API key');
    });

    it('should handle 429 rate limit error', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => 'Rate limit exceeded'
      });

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('OpenAI API rate limit exceeded');
    });

    it('should handle 402 quota exceeded error', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
        text: async () => 'Quota exceeded'
      });

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('OpenAI API quota exceeded');
    });

    it('should handle 500 server error', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('OpenAI service temporarily unavailable');
    });

    it('should handle network errors', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(generateRoadmap(mockRequest)).rejects.toThrow('Network error');
    });
  });

  describe('Data Validation', () => {
    it('should validate roadmap data structure', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                topic: 'React',
                queryType: 'career-focused',
                overview: 'Learn React',
                totalEstimatedTime: '8-12 weeks',
                prerequisites: ['HTML', 'CSS'],
                tips: ['Practice regularly'],
                milestones: [
                  {
                    id: 'milestone-1',
                    title: 'React Basics',
                    description: 'Learn React fundamentals',
                    estimatedTime: '2-3 weeks',
                    difficulty: 'beginner',
                    resources: [
                      {
                        type: 'video',
                        searchTerms: ['React tutorial'],
                        description: 'React basics video'
                      }
                    ]
                  }
                ]
              })
            }
          }],
          usage: { total_tokens: 100 }
        })
      });

      const request: OpenAIGenerationRequest = {
        topic: 'React',
        skillLevel: 'beginner',
        timeCommitment: 'flexible',
        aiEnabled: true
      };

      // Act
      const result = await generateRoadmap(request);

      // Assert
      expect(result).toMatchObject({
        topic: 'React',
        queryType: 'career-focused',
        overview: 'Learn React',
        totalEstimatedTime: '8-12 weeks',
        prerequisites: ['HTML', 'CSS'],
        tips: ['Practice regularly'],
        milestones: [
          {
            id: 'milestone-1',
            title: 'React Basics',
            description: 'Learn React fundamentals',
            estimatedTime: '2-3 weeks',
            difficulty: 'beginner',
            resources: [
              {
                type: 'video',
                searchTerms: ['React tutorial'],
                description: 'React basics video'
              }
            ]
          }
        ]
      });
    });

    it('should handle missing optional fields', async () => {
      // Arrange
      process.env.OPENAI_API_KEY = 'test-key';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                topic: 'React',
                queryType: 'career-focused',
                overview: 'Learn React',
                totalEstimatedTime: '8-12 weeks',
                prerequisites: [],
                tips: [],
                milestones: []
              })
            }
          }],
          usage: { total_tokens: 100 }
        })
      });

      const request: OpenAIGenerationRequest = {
        topic: 'React',
        skillLevel: 'beginner',
        timeCommitment: 'flexible',
        aiEnabled: true
      };

      // Act
      const result = await generateRoadmap(request);

      // Assert
      expect(result).toMatchObject({
        topic: 'React',
        queryType: 'career-focused',
        overview: 'Learn React',
        totalEstimatedTime: '8-12 weeks',
        prerequisites: [],
        tips: [],
        milestones: []
      });
    });
  });
});
