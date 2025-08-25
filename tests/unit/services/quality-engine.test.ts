/**
 * Unit Tests for Content Quality Engine
 * 
 * Tests quality assessment across all domains and skills
 * 
 * @author Skill Forge Team
 * @version 1.0.0
 */

import { describe, it, expect } from '@jest/globals';
import {
  ContentItem,
  LearningContext,
  QualityMetrics,
  UNIVERSAL_SKILL_CATEGORIES,
  UNIVERSAL_LEARNING_INDICATORS,
  DEFAULT_QUALITY_WEIGHTS,
  calculateRelevanceScore,
  calculateAuthorityScore,
  calculateFreshnessScore,
  calculateEngagementScore,
  calculateEducationalValue,
  calculateOverallQuality,
  assessContentQuality,
  rankContent,
  filterByLearningObjectives,
  getQualityInsights
} from './quality-engine';

// Mock content items for testing across different domains
const mockCookingContent: ContentItem[] = [
  {
    id: '1',
    title: 'How to Cook Perfect Pasta - Step by Step Guide',
    description: 'Learn professional pasta cooking techniques from an Italian chef. Complete tutorial with tips and tricks.',
    url: 'https://cookingacademy.com/pasta-guide',
    source: 'Cooking Academy',
    domain: 'cookingacademy.com',
    publishedAt: '2024-01-15',
    contentType: 'tutorial',
    skillLevel: 'beginner',
    learningObjectives: ['master pasta cooking', 'learn timing techniques', 'understand water ratios'],
    duration: '15 min',
    language: 'en',
    tags: ['cooking', 'pasta', 'italian', 'beginner', 'tutorial']
  },
  {
    id: '2',
    title: 'Advanced Molecular Gastronomy Course',
    description: 'Professional molecular gastronomy techniques for experienced chefs. Laboratory-style cooking methods.',
    url: 'https://culinaryinstitute.edu/molecular',
    source: 'Culinary Institute',
    domain: 'culinaryinstitute.edu',
    publishedAt: '2023-06-10',
    contentType: 'course',
    skillLevel: 'advanced',
    learningObjectives: ['molecular techniques', 'scientific cooking', 'presentation skills'],
    duration: '8 hours',
    language: 'en',
    tags: ['molecular gastronomy', 'advanced', 'science', 'professional']
  }
];

const mockMusicContent: ContentItem[] = [
  {
    id: '3',
    title: 'Piano Fundamentals for Complete Beginners',
    description: 'Start your piano journey with basic chords, scales, and simple songs. No experience required.',
    url: 'https://musiclessons.com/piano-basics',
    source: 'Music Lessons Online',
    domain: 'musiclessons.com',
    publishedAt: '2024-02-01',
    contentType: 'video',
    skillLevel: 'beginner',
    learningObjectives: ['basic chords', 'reading music', 'hand positioning'],
    duration: '45 min',
    language: 'en',
    tags: ['piano', 'music', 'beginner', 'fundamentals']
  },
  {
    id: '4',
    title: 'Jazz Improvisation Masterclass',
    description: 'Advanced jazz improvisation techniques with Grammy-winning musician. Complex harmony and rhythm.',
    url: 'https://jazzacademy.org/improvisation',
    source: 'Jazz Academy',
    domain: 'jazzacademy.org',
    publishedAt: '2023-11-20',
    contentType: 'course',
    skillLevel: 'advanced',
    learningObjectives: ['jazz theory', 'improvisation skills', 'advanced harmony'],
    duration: '3 hours',
    language: 'en',
    tags: ['jazz', 'improvisation', 'advanced', 'music theory']
  }
];

const mockFitnessContent: ContentItem[] = [
  {
    id: '5',
    title: '30-Day Yoga Challenge for Beginners',
    description: 'Daily yoga routines to build flexibility and strength. Guided by certified instructor.',
    url: 'https://yogastudio.com/30-day-challenge',
    source: 'Yoga Studio',
    domain: 'yogastudio.com',
    publishedAt: '2024-01-01',
    contentType: 'course',
    skillLevel: 'beginner',
    learningObjectives: ['basic poses', 'flexibility', 'breathing techniques'],
    duration: '30 days',
    language: 'en',
    tags: ['yoga', 'fitness', 'beginner', 'challenge']
  }
];

describe('Quality Engine - Universal Learning Support', () => {
  
  describe('Universal Skill Categories', () => {
    it('should cover all major learning domains', () => {
      expect(UNIVERSAL_SKILL_CATEGORIES).toBeDefined();
      expect(UNIVERSAL_SKILL_CATEGORIES.cooking).toContain('cooking');
      expect(UNIVERSAL_SKILL_CATEGORIES.visual_arts).toContain('painting');
      expect(UNIVERSAL_SKILL_CATEGORIES.fitness).toContain('yoga');
      expect(UNIVERSAL_SKILL_CATEGORIES.business).toContain('marketing');
      expect(UNIVERSAL_SKILL_CATEGORIES.languages).toContain('spanish');
    });

    it('should include creative arts categories', () => {
      expect(UNIVERSAL_SKILL_CATEGORIES.visual_arts).toBeDefined();
      expect(UNIVERSAL_SKILL_CATEGORIES.performing_arts).toBeDefined();
      expect(UNIVERSAL_SKILL_CATEGORIES.creative_writing).toBeDefined();
    });

    it('should include practical life skills', () => {
      expect(UNIVERSAL_SKILL_CATEGORIES.cooking).toBeDefined();
      expect(UNIVERSAL_SKILL_CATEGORIES.crafts).toBeDefined();
      expect(UNIVERSAL_SKILL_CATEGORIES.home_improvement).toBeDefined();
    });

    it('should include professional development', () => {
      expect(UNIVERSAL_SKILL_CATEGORIES.business).toBeDefined();
      expect(UNIVERSAL_SKILL_CATEGORIES.finance).toBeDefined();
      expect(UNIVERSAL_SKILL_CATEGORIES.career).toBeDefined();
    });
  });

  describe('Universal Learning Indicators', () => {
    it('should have educational quality indicators', () => {
      expect(UNIVERSAL_LEARNING_INDICATORS.educational_quality).toContain('tutorial');
      expect(UNIVERSAL_LEARNING_INDICATORS.educational_quality).toContain('step by step');
      expect(UNIVERSAL_LEARNING_INDICATORS.educational_quality).toContain('guide');
    });

    it('should have practical value indicators', () => {
      expect(UNIVERSAL_LEARNING_INDICATORS.practical_value).toContain('hands-on');
      expect(UNIVERSAL_LEARNING_INDICATORS.practical_value).toContain('example');
      expect(UNIVERSAL_LEARNING_INDICATORS.practical_value).toContain('tips');
    });

    it('should have authority indicators', () => {
      expect(UNIVERSAL_LEARNING_INDICATORS.authority_indicators).toContain('expert');
      expect(UNIVERSAL_LEARNING_INDICATORS.authority_indicators).toContain('professional');
      expect(UNIVERSAL_LEARNING_INDICATORS.authority_indicators).toContain('certified');
    });
  });

  describe('Relevance Score Calculation', () => {
    it('should score cooking content highly for cooking queries', () => {
      const context: LearningContext = {
        topic: 'pasta cooking',
        skillLevel: 'beginner'
      };
      
      const score = calculateRelevanceScore(mockCookingContent[0], context);
      expect(score).toBeGreaterThan(70);
    });

    it('should score music content highly for piano queries', () => {
      const context: LearningContext = {
        topic: 'piano lessons',
        skillLevel: 'beginner'
      };
      
      const score = calculateRelevanceScore(mockMusicContent[0], context);
      expect(score).toBeGreaterThan(60);
    });

    it('should prefer skill level match', () => {
      const beginnerContext: LearningContext = {
        topic: 'cooking',
        skillLevel: 'beginner'
      };
      
      const advancedContext: LearningContext = {
        topic: 'cooking',
        skillLevel: 'advanced'
      };
      
      const beginnerScore = calculateRelevanceScore(mockCookingContent[0], beginnerContext);
      const advancedScore = calculateRelevanceScore(mockCookingContent[0], advancedContext);
      
      expect(beginnerScore).toBeGreaterThan(advancedScore);
    });

    it('should handle learning objectives matching', () => {
      const context: LearningContext = {
        topic: 'cooking',
        learningGoals: ['master pasta cooking', 'learn timing']
      };
      
      const score = calculateRelevanceScore(mockCookingContent[0], context);
      expect(score).toBeGreaterThan(60);
    });
  });

  describe('Authority Score Calculation', () => {
    it('should give higher scores to educational domains', () => {
      const eduContent = mockCookingContent[1]; // culinaryinstitute.edu
      const comContent = mockCookingContent[0]; // cookingacademy.com
      
      const eduScore = calculateAuthorityScore(eduContent);
      const comScore = calculateAuthorityScore(comContent);
      
      expect(eduScore).toBeGreaterThan(comScore);
    });

    it('should recognize professional indicators', () => {
      const content: ContentItem = {
        id: 'test',
        title: 'Professional Chef Training Course',
        description: 'Expert-level course by certified master chef',
        url: 'https://test.com',
        source: 'Test',
        domain: 'test.com',
        contentType: 'course',
        skillLevel: 'intermediate',
        language: 'en',
        tags: []
      };
      
      const score = calculateAuthorityScore(content);
      expect(score).toBeGreaterThan(70);
    });

    it('should work across different domains', () => {
      const fitnessScore = calculateAuthorityScore(mockFitnessContent[0]);
      const musicScore = calculateAuthorityScore(mockMusicContent[0]);
      
      expect(fitnessScore).toBeGreaterThan(40);
      expect(musicScore).toBeGreaterThan(40);
    });
  });

  describe('Freshness Score Calculation', () => {
    it('should give higher scores to recent content', () => {
      const recentContent: ContentItem = {
        ...mockCookingContent[0],
        publishedAt: new Date().toISOString().split('T')[0] // Today
      };
      
      const oldContent: ContentItem = {
        ...mockCookingContent[0],
        publishedAt: '2020-01-01'
      };
      
      const recentScore = calculateFreshnessScore(recentContent);
      const oldScore = calculateFreshnessScore(oldContent);
      
      expect(recentScore).toBeGreaterThan(oldScore);
    });

    it('should handle different content types appropriately', () => {
      const article: ContentItem = {
        ...mockCookingContent[0],
        contentType: 'article',
        publishedAt: '2023-01-01'
      };
      
      const book: ContentItem = {
        ...mockCookingContent[0],
        contentType: 'book',
        publishedAt: '2023-01-01'
      };
      
      const articleScore = calculateFreshnessScore(article);
      const bookScore = calculateFreshnessScore(book);
      
      // Books should have longer relevance than articles
      expect(bookScore).toBeGreaterThanOrEqual(articleScore);
    });

    it('should handle missing dates gracefully', () => {
      const content: ContentItem = {
        ...mockCookingContent[0],
        publishedAt: undefined
      };
      
      const score = calculateFreshnessScore(content);
      expect(score).toBe(50); // Neutral score
    });
  });

  describe('Engagement Score Calculation', () => {
    it('should recognize engagement indicators', () => {
      const engagingContent: ContentItem = {
        ...mockCookingContent[0],
        title: 'Interactive Cooking Tutorial - Fun and Easy',
        description: 'Engaging video tutorial with clear visual demonstrations'
      };
      
      const score = calculateEngagementScore(engagingContent);
      expect(score).toBeGreaterThan(60);
    });

    it('should favor video content', () => {
      const videoContent: ContentItem = {
        ...mockMusicContent[0],
        contentType: 'video'
      };
      
      const articleContent: ContentItem = {
        ...mockMusicContent[0],
        contentType: 'article'
      };
      
      const videoScore = calculateEngagementScore(videoContent);
      const articleScore = calculateEngagementScore(articleContent);
      
      expect(videoScore).toBeGreaterThan(articleScore);
    });

    it('should recognize course structure', () => {
      const courseScore = calculateEngagementScore(mockCookingContent[1]);
      expect(courseScore).toBeGreaterThan(50);
    });
  });

  describe('Educational Value Calculation', () => {
    it('should recognize educational keywords', () => {
      const educationalContent: ContentItem = {
        ...mockCookingContent[0],
        title: 'Complete Step-by-Step Tutorial Guide',
        description: 'Comprehensive course with practical examples and hands-on exercises'
      };
      
      const score = calculateEducationalValue(educationalContent);
      expect(score).toBeGreaterThan(70);
    });

    it('should value structured content', () => {
      const structuredContent: ContentItem = {
        ...mockMusicContent[1],
        title: 'Piano Course - Lesson by Lesson Curriculum',
        description: 'Structured course with modules and progressive learning'
      };
      
      const score = calculateEducationalValue(structuredContent);
      expect(score).toBeGreaterThan(65);
    });

    it('should bonus learning objectives', () => {
      const withObjectives = mockCookingContent[0];
      const withoutObjectives: ContentItem = {
        ...mockCookingContent[0],
        learningObjectives: undefined
      };
      
      const withScore = calculateEducationalValue(withObjectives);
      const withoutScore = calculateEducationalValue(withoutObjectives);
      
      expect(withScore).toBeGreaterThan(withoutScore);
    });
  });

  describe('Overall Quality Calculation', () => {
    it('should combine metrics with proper weighting', () => {
      const metrics = {
        relevanceScore: 80,
        authorityScore: 70,
        freshnessScore: 90,
        engagementScore: 60,
        educationalValue: 85
      };
      
      const overall = calculateOverallQuality(metrics, DEFAULT_QUALITY_WEIGHTS);
      expect(overall).toBeGreaterThan(70);
      expect(overall).toBeLessThanOrEqual(100);
    });

    it('should use custom weights', () => {
      const metrics = {
        relevanceScore: 90,
        authorityScore: 50,
        freshnessScore: 30,
        engagementScore: 60,
        educationalValue: 80
      };
      
      const relevanceFocused = calculateOverallQuality(metrics, {
        relevance: 0.7,
        authority: 0.1,
        freshness: 0.05,
        engagement: 0.05,
        educational: 0.1
      });
      
      const authorityFocused = calculateOverallQuality(metrics, {
        relevance: 0.1,
        authority: 0.7,
        freshness: 0.05,
        engagement: 0.05,
        educational: 0.1
      });
      
      expect(relevanceFocused).toBeGreaterThan(authorityFocused);
    });
  });

  describe('Content Assessment', () => {
    it('should assess cooking content quality', () => {
      const context: LearningContext = {
        topic: 'pasta cooking',
        skillLevel: 'beginner'
      };
      
      const quality = assessContentQuality(mockCookingContent[0], context);
      
      expect(quality.relevanceScore).toBeGreaterThan(0);
      expect(quality.authorityScore).toBeGreaterThan(0);
      expect(quality.freshnessScore).toBeGreaterThan(0);
      expect(quality.engagementScore).toBeGreaterThan(0);
      expect(quality.educationalValue).toBeGreaterThan(0);
      expect(quality.overallQuality).toBeGreaterThan(0);
    });

    it('should assess music content quality', () => {
      const context: LearningContext = {
        topic: 'piano learning',
        skillLevel: 'beginner'
      };
      
      const quality = assessContentQuality(mockMusicContent[0], context);
      expect(quality.overallQuality).toBeGreaterThan(40);
    });

    it('should assess fitness content quality', () => {
      const context: LearningContext = {
        topic: 'yoga',
        skillLevel: 'beginner'
      };
      
      const quality = assessContentQuality(mockFitnessContent[0], context);
      expect(quality.overallQuality).toBeGreaterThan(40);
    });
  });

  describe('Content Ranking', () => {
    it('should rank content by quality', () => {
      const allContent = [...mockCookingContent, ...mockMusicContent];
      const context: LearningContext = {
        topic: 'cooking',
        skillLevel: 'beginner'
      };
      
      const ranked = rankContent(allContent, context);
      
      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked[0].metrics).toBeDefined();
      
      // First item should have highest quality
      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[0].metrics!.overallQuality).toBeGreaterThanOrEqual(
          ranked[i].metrics!.overallQuality
        );
      }
    });

    it('should filter by minimum quality threshold', () => {
      const allContent = [...mockCookingContent, ...mockMusicContent];
      const context: LearningContext = {
        topic: 'cooking'
      };
      
      const ranked = rankContent(allContent, context, {
        minQualityThreshold: 70
      });
      
      ranked.forEach(item => {
        expect(item.metrics!.overallQuality).toBeGreaterThanOrEqual(70);
      });
    });

    it('should work across different domains', () => {
      const fitnessContext: LearningContext = {
        topic: 'yoga',
        skillLevel: 'beginner'
      };
      
      const ranked = rankContent(mockFitnessContent, fitnessContext);
      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked[0].metrics).toBeDefined();
    });
  });

  describe('Learning Objectives Filtering', () => {
    it('should filter content by learning objectives', () => {
      const learningGoals = ['pasta cooking', 'timing techniques'];
      const filtered = filterByLearningObjectives(mockCookingContent, learningGoals);
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].learningObjectives).toBeDefined();
    });

    it('should include content without objectives', () => {
      const contentWithoutObjectives: ContentItem[] = [
        {
          ...mockCookingContent[0],
          learningObjectives: undefined
        }
      ];
      
      const filtered = filterByLearningObjectives(contentWithoutObjectives, ['anything']);
      expect(filtered.length).toBe(1);
    });
  });

  describe('Quality Insights', () => {
    it('should provide quality analytics', () => {
      const contentWithMetrics = mockCookingContent.map(item => ({
        ...item,
        metrics: {
          relevanceScore: 80,
          authorityScore: 70,
          freshnessScore: 60,
          engagementScore: 75,
          educationalValue: 85,
          overallQuality: 75
        }
      }));
      
      const insights = getQualityInsights(contentWithMetrics);
      
      expect(insights.averageQuality).toBeGreaterThan(0);
      expect(insights.qualityDistribution).toBeDefined();
      expect(insights.contentTypeBreakdown).toBeDefined();
      expect(insights.authorityDistribution).toBeDefined();
    });

    it('should handle empty content gracefully', () => {
      const insights = getQualityInsights([]);
      
      expect(insights.averageQuality).toBe(0);
      expect(insights.qualityDistribution).toEqual([]);
      expect(insights.contentTypeBreakdown).toEqual([]);
      expect(insights.authorityDistribution).toEqual([]);
    });

    it('should calculate content type breakdown', () => {
      const mixedContent = [
        { ...mockCookingContent[0], metrics: { overallQuality: 80 } as QualityMetrics },
        { ...mockMusicContent[0], metrics: { overallQuality: 70 } as QualityMetrics }
      ];
      
      const insights = getQualityInsights(mixedContent);
      expect(insights.contentTypeBreakdown.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Domain Quality Assessment', () => {
    it('should work consistently across cooking, music, and fitness', () => {
      const cookingContext: LearningContext = { topic: 'cooking' };
      const musicContext: LearningContext = { topic: 'music' };
      const fitnessContext: LearningContext = { topic: 'fitness' };
      
      const cookingQuality = assessContentQuality(mockCookingContent[0], cookingContext);
      const musicQuality = assessContentQuality(mockMusicContent[0], musicContext);
      const fitnessQuality = assessContentQuality(mockFitnessContent[0], fitnessContext);
      
      expect(cookingQuality.overallQuality).toBeGreaterThan(40);
      expect(musicQuality.overallQuality).toBeGreaterThan(40);
      expect(fitnessQuality.overallQuality).toBeGreaterThan(40);
    });

    it('should handle diverse content types uniformly', () => {
      const allContent = [...mockCookingContent, ...mockMusicContent, ...mockFitnessContent];
      
      allContent.forEach(content => {
        const score = calculateAuthorityScore(content);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });
});
