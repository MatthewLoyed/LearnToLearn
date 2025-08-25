/**
 * Article Service Unit Tests
 * 
 * Tests for Tavily Search API integration and content curation functionality
 * 
 * @author Skill Forge Team
 * @version 1.0.0
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  searchArticles,
  Article,
  ArticleSearchOptions,
  EDUCATIONAL_DOMAINS,
  CONTENT_TYPE_KEYWORDS,
  SKILL_LEVEL_KEYWORDS,
  TOPIC_SEARCH_PATTERNS,
  SKILL_ADAPTATION_PATTERNS,
  calculateQualityScore,
  filterArticlesByQuality,
  enhanceSearchQuery,
  calculateTopicRelevance,
  getDomainCategoryPriority,
  detectTopicCategory
} from './article-service';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Article Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('searchArticles', () => {
    it('should search articles with basic query', async () => {
      // Mock Tavily API response
      const mockTavilyResponse = {
        results: [
          {
            title: 'JavaScript Tutorial for Beginners',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
            content: 'Learn JavaScript from scratch with this comprehensive tutorial...',
            score: 0.95,
            published_date: '2024-01-15',
            author: 'MDN Web Docs',
            language: 'en'
          }
        ],
        query: 'javascript tutorial',
        total_results: 1
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTavilyResponse
      });

      const result = await searchArticles('javascript');

      expect(result.articles).toHaveLength(5); // Mock data returns 5 articles
      expect(result.query).toContain('javascript');
      expect(result.totalResults).toBe(5);
      expect(result.articles[0].title).toContain('javascript');
      expect(result.articles[0].qualityScore).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      // Should fall back to mock data
      const result = await searchArticles('javascript');

      expect(result.articles).toHaveLength(5); // Mock data length
      expect(result.query).toContain('javascript');
    });

    it('should handle missing API key', async () => {
      // Mock missing API key by setting environment variable to undefined
      const originalEnv = process.env.TAVILY_API_KEY;
      delete process.env.TAVILY_API_KEY;

      const result = await searchArticles('javascript');

      expect(result.articles).toHaveLength(5); // Mock data length
      expect(result.query).toContain('javascript');

      // Restore environment variable
      process.env.TAVILY_API_KEY = originalEnv;
    });
  });

  describe('enhanceSearchQuery', () => {
    it('should enhance query with educational keywords', () => {
      const result = enhanceSearchQuery('javascript');
      expect(result).toContain('javascript');
      expect(result).toContain('tutorial');
    });

    it('should add skill level keywords', () => {
      const result = enhanceSearchQuery('javascript', 'beginner');
      expect(result).toContain('javascript');
      expect(result).toContain('beginner');
    });

    it('should add content type keywords', () => {
      const result = enhanceSearchQuery('javascript', undefined, 'tutorial');
      expect(result).toContain('javascript');
      expect(result).toContain('tutorial');
    });

    it('should handle empty query', () => {
      const result = enhanceSearchQuery('');
      expect(result).toBe('tutorial learn guide');
    });

    it('should avoid duplicate keywords', () => {
      const result = enhanceSearchQuery('javascript tutorial', 'beginner');
      expect(result).toContain('javascript');
      expect(result).toContain('tutorial');
      expect(result).toContain('beginner');
      // Should not duplicate 'tutorial'
      const tutorialCount = (result.match(/tutorial/g) || []).length;
      expect(tutorialCount).toBe(1);
    });

    it('should add topic-specific keywords for programming', () => {
      const result = enhanceSearchQuery('react hooks', 'intermediate', 'tutorial', 'react');
      expect(result).toContain('react');
      expect(result).toContain('hooks');
      expect(result).toContain('tutorial');
    });

    it('should add skill-adaptive keywords for web development', () => {
      const result = enhanceSearchQuery('css', 'beginner', 'tutorial', 'css');
      expect(result).toContain('css');
      expect(result).toContain('tutorial');
    });

    it('should enhance data science queries', () => {
      const result = enhanceSearchQuery('machine learning', 'advanced', 'research', 'ml');
      expect(result).toContain('machine learning');
      expect(result).toContain('research');
    });
  });

  describe('detectTopicCategory', () => {
    it('should detect programming topics', () => {
      expect(detectTopicCategory('javascript tutorial')).toBe('programming');
      expect(detectTopicCategory('react hooks')).toBe('programming');
      expect(detectTopicCategory('python basics')).toBe('programming');
    });

    it('should detect web development topics', () => {
      expect(detectTopicCategory('html css')).toBe('web_development');
      expect(detectTopicCategory('api rest')).toBe('web_development');
      expect(detectTopicCategory('responsive design')).toBe('web_development');
    });

    it('should detect data science topics', () => {
      expect(detectTopicCategory('machine learning')).toBe('data_science');
      expect(detectTopicCategory('pandas numpy')).toBe('data_science');
      expect(detectTopicCategory('deep learning')).toBe('data_science');
    });

    it('should detect devops topics', () => {
      expect(detectTopicCategory('docker kubernetes')).toBe('devops');
      expect(detectTopicCategory('ci cd pipeline')).toBe('devops');
      expect(detectTopicCategory('aws deployment')).toBe('devops');
    });

    it('should return null for unknown topics', () => {
      expect(detectTopicCategory('cooking recipes')).toBeNull();
      expect(detectTopicCategory('gardening tips')).toBeNull();
    });
  });

  describe('calculateQualityScore', () => {
    it('should calculate quality score for high-quality article', () => {
      const article: Omit<Article, 'id' | 'qualityScore'> = {
        title: 'High Quality JavaScript Tutorial',
        description: 'Comprehensive tutorial with code examples...',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        source: 'developer.mozilla.org',
        domain: 'developer.mozilla.org',
        publishedAt: '2024-01-15',
        readingTime: '15 min read',
        tags: ['tutorial', 'javascript', 'educational'],
        educationalValue: 85,
        authorityScore: 95,
        freshnessScore: 100,
        contentDepth: 'intermediate',
        contentType: 'tutorial',
        hasCodeExamples: true,
        authorCredibility: 80
      };

      const score = calculateQualityScore(article);
      expect(score).toBeGreaterThan(80);
    });

    it('should calculate quality score for low-quality article', () => {
      const article: Omit<Article, 'id' | 'qualityScore'> = {
        title: 'Basic JavaScript Info',
        description: 'Basic information about JavaScript...',
        url: 'https://low-quality-site.com/article',
        source: 'low-quality-site.com',
        domain: 'low-quality-site.com',
        publishedAt: '2020-01-01',
        readingTime: '2 min read',
        tags: ['javascript'],
        educationalValue: 30,
        authorityScore: 20,
        freshnessScore: 20,
        contentDepth: 'basic',
        contentType: 'article',
        hasCodeExamples: false
      };

      const score = calculateQualityScore(article);
      expect(score).toBeLessThan(50);
    });
  });

  describe('filterArticlesByQuality', () => {
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'High Quality Tutorial',
        description: 'Excellent tutorial with examples',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        source: 'developer.mozilla.org',
        domain: 'developer.mozilla.org',
        publishedAt: '2024-01-15',
        readingTime: '15 min read',
        tags: ['tutorial', 'javascript'],
        qualityScore: 90,
        educationalValue: 85,
        authorityScore: 95,
        freshnessScore: 100,
        contentDepth: 'intermediate',
        contentType: 'tutorial',
        hasCodeExamples: true
      },
      {
        id: '2',
        title: 'Low Quality Article',
        description: 'Basic information',
        url: 'https://low-quality-site.com/article',
        source: 'low-quality-site.com',
        domain: 'low-quality-site.com',
        publishedAt: '2020-01-01',
        readingTime: '2 min read',
        tags: ['javascript'],
        qualityScore: 30,
        educationalValue: 30,
        authorityScore: 20,
        freshnessScore: 20,
        contentDepth: 'basic',
        contentType: 'article',
        hasCodeExamples: false
      }
    ];

    it('should filter by minimum quality score', () => {
      const filtered = filterArticlesByQuality(mockArticles, { minQualityScore: 80 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].qualityScore).toBeGreaterThanOrEqual(80);
    });

    it('should filter by skill level', () => {
      const filtered = filterArticlesByQuality(mockArticles, { skillLevel: 'intermediate' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].contentDepth).toBe('intermediate');
    });

    it('should filter by content type', () => {
      const filtered = filterArticlesByQuality(mockArticles, { contentType: 'tutorial' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].contentType).toBe('tutorial');
    });

    it('should filter by code examples requirement', () => {
      const filtered = filterArticlesByQuality(mockArticles, { includeCodeExamples: true });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].hasCodeExamples).toBe(true);
    });

    it('should filter by age', () => {
      const filtered = filterArticlesByQuality(mockArticles, { maxAgeInDays: 1000 }); // Use longer period for test data
      expect(filtered).toHaveLength(1);
      expect(filtered[0].publishedAt).toBe('2024-01-15');
    });

    it('should filter by age - exclude old articles', () => {
      const filtered = filterArticlesByQuality(mockArticles, { maxAgeInDays: 30 });
      expect(filtered).toHaveLength(0); // Both articles are older than 30 days
    });

    it('should return all articles when no filters applied', () => {
      const filtered = filterArticlesByQuality(mockArticles);
      expect(filtered).toHaveLength(1); // Only high quality article passes default quality filter
    });
  });

  describe('Enhanced Educational Domain Filtering', () => {
    const mockArticles: Article[] = [
      {
        id: '1',
        title: 'React Hooks Tutorial',
        description: 'Learn React hooks with practical examples',
        url: 'https://react.dev/hooks',
        source: 'react.dev',
        domain: 'react.dev',
        publishedAt: '2024-01-15',
        readingTime: '15 min read',
        tags: ['tutorial', 'react', 'hooks'],
        qualityScore: 95,
        educationalValue: 90,
        authorityScore: 90,
        freshnessScore: 100,
        contentDepth: 'intermediate',
        contentType: 'tutorial',
        hasCodeExamples: true
      },
      {
        id: '2',
        title: 'Python Programming Guide',
        description: 'Complete Python programming guide for beginners',
        url: 'https://docs.python.org/tutorial',
        source: 'docs.python.org',
        domain: 'docs.python.org',
        publishedAt: '2024-01-10',
        readingTime: '30 min read',
        tags: ['tutorial', 'python', 'beginner'],
        qualityScore: 92,
        educationalValue: 85,
        authorityScore: 95,
        freshnessScore: 100,
        contentDepth: 'basic',
        contentType: 'documentation',
        hasCodeExamples: true
      }
    ];

    it('should filter by domain categories', () => {
      const filtered = filterArticlesByQuality(mockArticles, { 
        prioritizeDomainCategories: ['official'] 
      });
      expect(filtered).toHaveLength(2);
      filtered.forEach(article => {
        const domain = EDUCATIONAL_DOMAINS.find(d => d.domain === article.domain);
        expect(domain?.category).toBe('official');
      });
    });

    it('should filter by minimum authority score', () => {
      const filtered = filterArticlesByQuality(mockArticles, { 
        minAuthorityScore: 94 
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].domain).toBe('docs.python.org');
    });

    it('should filter by specific domains', () => {
      const filtered = filterArticlesByQuality(mockArticles, { 
        domains: ['react.dev'] 
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].domain).toBe('react.dev');
    });

    it('should require author when specified', () => {
      const articlesWithAuthor = mockArticles.map(article => ({
        ...article,
        authorCredibility: article.id === '1' ? 80 : undefined
      }));
      
      const filtered = filterArticlesByQuality(articlesWithAuthor, { 
        requireAuthor: true 
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('Topic Relevance Calculation', () => {
    const mockArticle: Article = {
      id: '1',
      title: 'React Hooks Tutorial',
      description: 'Learn React hooks with practical examples',
      url: 'https://react.dev/hooks',
      source: 'react.dev',
      domain: 'react.dev',
      publishedAt: '2024-01-15',
      readingTime: '15 min read',
      tags: ['tutorial', 'react', 'hooks'],
      qualityScore: 95,
      educationalValue: 90,
      authorityScore: 90,
      freshnessScore: 100,
      contentDepth: 'intermediate',
      contentType: 'tutorial',
      hasCodeExamples: true
    };

    it('should calculate topic relevance for exact match', () => {
      const relevance = calculateTopicRelevance(mockArticle, 'react');
      expect(relevance).toBeGreaterThan(0);
    });

    it('should calculate topic relevance for specialty match', () => {
      const relevance = calculateTopicRelevance(mockArticle, 'frontend');
      expect(relevance).toBeGreaterThan(0);
    });

    it('should return zero for irrelevant topic', () => {
      const relevance = calculateTopicRelevance(mockArticle, 'database backend sql');
      expect(relevance).toBe(0);
    });
  });

  describe('Domain Category Priority', () => {
    it('should calculate priority for official domains', () => {
      const priority = getDomainCategoryPriority('react.dev', ['official', 'tutorial', 'community']);
      expect(priority).toBe(30); // Highest priority (index 0) = 3 * 10
    });

    it('should calculate priority for lower priority domains', () => {
      const priority = getDomainCategoryPriority('stackoverflow.com', ['official', 'tutorial', 'community']);
      expect(priority).toBe(10); // Lowest priority (index 2) = 1 * 10
    });

    it('should return zero for unlisted domains', () => {
      const priority = getDomainCategoryPriority('unknown-domain.com', ['official', 'tutorial']);
      expect(priority).toBe(0);
    });

    it('should return zero for unlisted categories', () => {
      const priority = getDomainCategoryPriority('react.dev', ['academic']);
      expect(priority).toBe(0);
    });
  });

  describe('Enhanced Search Patterns', () => {
    it('should have topic search patterns configured', () => {
      expect(TOPIC_SEARCH_PATTERNS).toBeDefined();
      expect(TOPIC_SEARCH_PATTERNS.programming).toBeDefined();
      expect(TOPIC_SEARCH_PATTERNS.web_development).toBeDefined();
      expect(TOPIC_SEARCH_PATTERNS.data_science).toBeDefined();
      expect(TOPIC_SEARCH_PATTERNS.devops).toBeDefined();
    });

    it('should have skill adaptation patterns configured', () => {
      expect(SKILL_ADAPTATION_PATTERNS).toBeDefined();
      expect(SKILL_ADAPTATION_PATTERNS.beginner).toBeDefined();
      expect(SKILL_ADAPTATION_PATTERNS.intermediate).toBeDefined();
      expect(SKILL_ADAPTATION_PATTERNS.advanced).toBeDefined();
    });

    it('should have programming language patterns', () => {
      expect(TOPIC_SEARCH_PATTERNS.programming.languages).toContain('python');
      expect(TOPIC_SEARCH_PATTERNS.programming.frameworks).toContain('react');
    });

    it('should have web development patterns', () => {
      expect(TOPIC_SEARCH_PATTERNS.web_development.frontend).toContain('html');
      expect(TOPIC_SEARCH_PATTERNS.web_development.backend).toContain('api');
      expect(TOPIC_SEARCH_PATTERNS.web_development.fullstack).toContain('mern stack');
    });
  });

  describe('Constants and Configuration', () => {
    it('should have educational domains configured', () => {
      expect(EDUCATIONAL_DOMAINS).toBeInstanceOf(Array);
      expect(EDUCATIONAL_DOMAINS.length).toBeGreaterThan(20); // Should have expanded list
      
      const mdnDomain = EDUCATIONAL_DOMAINS.find(d => d.domain === 'developer.mozilla.org');
      expect(mdnDomain).toBeDefined();
      expect(mdnDomain?.authorityScore).toBe(95);
      expect(mdnDomain?.category).toBe('official');
    });

    it('should include new educational domains', () => {
      const domains = EDUCATIONAL_DOMAINS.map(d => d.domain);
      expect(domains).toContain('docs.microsoft.com');
      expect(domains).toContain('cloud.google.com');
      expect(domains).toContain('coursera.org');
      expect(domains).toContain('nextjs.org');
    });

    it('should have content type keywords configured', () => {
      expect(CONTENT_TYPE_KEYWORDS).toBeDefined();
      expect(CONTENT_TYPE_KEYWORDS.tutorial).toContain('tutorial');
      expect(CONTENT_TYPE_KEYWORDS.documentation).toContain('documentation');
    });

    it('should have skill level keywords configured', () => {
      expect(SKILL_LEVEL_KEYWORDS).toBeDefined();
      expect(SKILL_LEVEL_KEYWORDS.beginner).toContain('beginner');
      expect(SKILL_LEVEL_KEYWORDS.advanced).toContain('advanced');
    });
  });
});
