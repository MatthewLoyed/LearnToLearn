/**
 * Unit tests for API Key Error Handling
 * Tests that the system gracefully handles missing API keys
 */

describe('API Key Error Handling', () => {
  // Store original environment
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('OpenAI Service with Missing API Key', () => {
    it('should return fallback roadmap when API key is missing', async () => {
      // Remove API key
      delete process.env.OPENAI_API_KEY;

      // Import after removing API key
      const { generateRoadmap } = await import('../../src/lib/services/openai/openai-service');

      const request = {
        topic: 'JavaScript',
        skillLevel: 'beginner' as const,
        timeCommitment: 'flexible' as const,
        aiEnabled: true
      };

      const result = await generateRoadmap(request);

      expect(result).toBeDefined();
      expect(result.topic).toBe('JavaScript');
      expect(result.milestones).toHaveLength(3); // Using default TOTAL_MILESTONES from config
      expect(result.milestones[0].title).toBe('JavaScript Fundamentals');
      expect(result.overview).toContain('structured learning path');
    });

    it('should return default customization when API key is missing', async () => {
      // Remove API key
      delete process.env.OPENAI_API_KEY;

      // Import after removing API key
      const { generateCustomization } = await import('../../src/lib/services/openai/openai-service');

      const result = await generateCustomization('programming');

      expect(result).toBeDefined();
      expect(result.category).toBe('programming');
      expect(result.accentColor).toBe('green-600');
      expect(result.font).toBe('font-mono');
      expect(result.icon).toBe('💻');
    });

    it('should return fallback search queries when API key is missing', async () => {
      // Remove API key
      delete process.env.OPENAI_API_KEY;

      // Import after removing API key
      const { generateSearchQueries } = await import('../../src/lib/services/openai/openai-service');

      const result = await generateSearchQueries('React', 'beginner');

      expect(result).toBeDefined();
      expect(result.youtubeQueries).toContain('React tutorial');
      expect(result.articleQueries).toContain('React guide');
      expect(result.imageQueries).toContain('React diagram');
      expect(result.reasoning).toContain('Fallback queries generated');
      expect(result.classification.domain).toBe('general');
    });

    it('should return fallback image queries when API key is missing', async () => {
      // Remove API key
      delete process.env.OPENAI_API_KEY;

      // Import after removing API key
      const { generateIntelligentImageQueries } = await import('../../src/lib/services/openai/openai-service');

      const result = await generateIntelligentImageQueries('React', 'beginner', 'programming');

      expect(result).toBeDefined();
      expect(result.shouldSearch).toBe(true);
      expect(result.queries).toContain('React diagram');
      expect(result.queries).toContain('React infographic');
      expect(result.visualType).toBe('general');
      expect(result.reasoning).toContain('API key not configured');
    });
  });

  describe('System Behavior with Missing API Keys', () => {
    it('should handle missing API key without throwing errors in service layer', async () => {
      // Remove API key
      delete process.env.OPENAI_API_KEY;

      // Test that all OpenAI service functions handle missing keys gracefully
      const openaiService = await import('../../src/lib/services/openai/openai-service');
      
      // These should all complete without throwing errors
      await expect(openaiService.generateRoadmap({
        topic: 'JavaScript',
        skillLevel: 'beginner',
        timeCommitment: 'flexible',
        aiEnabled: true
      })).resolves.toBeDefined();

      await expect(openaiService.generateCustomization('JavaScript')).resolves.toBeDefined();
      
      await expect(openaiService.generateSearchQueries('JavaScript', 'beginner')).resolves.toBeDefined();
      
      await expect(openaiService.generateIntelligentImageQueries(
        'JavaScript', 'beginner', 'programming'
      )).resolves.toBeDefined();
    });

    it('should log appropriate warnings when API key is missing', async () => {
      // Remove API key
      delete process.env.OPENAI_API_KEY;

      // Mock console.warn to capture warnings
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Import and call functions
      const { generateRoadmap, generateCustomization } = await import('../../src/lib/services/openai/openai-service');

      await generateRoadmap({
        topic: 'JavaScript',
        skillLevel: 'beginner',
        timeCommitment: 'flexible',
        aiEnabled: true
      });

      await generateCustomization('programming');

      // Check that warnings were logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI API key not configured')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Topic Categorization in Fallback Mode', () => {
    it('should correctly categorize programming topics', async () => {
      delete process.env.OPENAI_API_KEY;
      const { generateCustomization } = await import('../../src/lib/services/openai/openai-service');

      const programmingResult = await generateCustomization('JavaScript programming');
      expect(programmingResult.category).toBe('programming');
      expect(programmingResult.icon).toBe('💻');

      const codingResult = await generateCustomization('coding basics');
      expect(codingResult.category).toBe('programming');
      expect(codingResult.font).toBe('font-mono');
    });

    it('should correctly categorize design topics', async () => {
      delete process.env.OPENAI_API_KEY;
      const { generateCustomization } = await import('../../src/lib/services/openai/openai-service');

      const result = await generateCustomization('graphic design');
      expect(result.category).toBe('design');
      expect(result.accentColor).toBe('purple-600');
      expect(result.icon).toBe('🎨');
    });

    it('should correctly categorize business topics', async () => {
      delete process.env.OPENAI_API_KEY;
      const { generateCustomization } = await import('../../src/lib/services/openai/openai-service');

      const result = await generateCustomization('business management');
      expect(result.category).toBe('business');
      expect(result.accentColor).toBe('blue-800');
      expect(result.icon).toBe('💼');
    });

    it('should handle general topics with default categorization', async () => {
      delete process.env.OPENAI_API_KEY;
      const { generateCustomization } = await import('../../src/lib/services/openai/openai-service');

      const result = await generateCustomization('random topic');
      expect(result.category).toBe('general');
      expect(result.accentColor).toBe('blue-600');
      expect(result.icon).toBe('🎓');
    });
  });
});
