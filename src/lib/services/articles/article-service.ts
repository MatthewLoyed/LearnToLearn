/**
 * Article Service for Tavily Search API Integration
 * 
 * This service handles educational article search and content curation
 * with focus on high-quality, authoritative sources for learning.
 * Enhanced with universal quality assessment engine.
 * 
 * QUALITY CONTROL SETTINGS:
 * Set ENABLE_QUALITY_FILTERING to false to disable all quality filtering
 * This will return all articles found without any quality scoring or filtering
 * 
 * @author Skill Forge Team
 * @version 1.0.0
 */

// ============================================================================
// QUALITY CONTROL CONFIGURATION
// ============================================================================

// Set to false to disable all quality filtering and return all articles
// TODO: Set to false to test without quality filtering
const ENABLE_QUALITY_FILTERING = true;

// Quality thresholds (only used if ENABLE_QUALITY_FILTERING is true)
// OPTIMIZED: Lowered thresholds to ensure content availability
const QUALITY_CONFIG = {
  minQualityScore: 15,        // Lowered from 30 to 15 for broader content access
  minAuthorityScore: 10,      // Lowered from 20 to 10 for more domain access
  maxAgeInDays: 365 * 5,      // Increased from 3 to 5 years for more content
  maxResults: 10,             // Maximum results to return
  requireAuthor: false        // Whether to require author information
};

import { 
  ContentItem as QualityContentItem, 
  LearningContext, 
  assessContentQuality, 
  rankContent as qualityRankContent 
} from '../../utils/quality/quality-engine';
import { DEFAULT_ARTICLE_SEARCH_LIMIT } from '../../config/content-config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  domain: string;
  publishedAt?: string;
  readingTime?: string;
  tags: string[];
  qualityScore: number;
  educationalValue: number;
  authorityScore: number;
  freshnessScore: number;
  contentDepth: 'basic' | 'intermediate' | 'advanced';
  contentType: 'tutorial' | 'documentation' | 'guide' | 'article' | 'research';
  hasCodeExamples: boolean;
  authorCredibility?: number;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
  author?: string;
  language?: string;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
  query: string;
  total_results: number;
}

export interface ArticleSearchOptions {
  maxResults?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  contentType?: 'tutorial' | 'documentation' | 'guide' | 'article' | 'research';
  minQualityScore?: number;
  includeCodeExamples?: boolean;
  maxAgeInDays?: number;
  domains?: string[];
  prioritizeDomainCategories?: Array<'official' | 'academic' | 'tutorial' | 'documentation' | 'community'>;
  minAuthorityScore?: number;
  preferredLanguages?: string[];
  requireAuthor?: boolean;
  topic?: string; // For topic-specific domain filtering
}

export interface EducationalDomain {
  domain: string;
  authorityScore: number;
  category: 'official' | 'academic' | 'tutorial' | 'documentation' | 'community';
  specialties: string[];
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * High-authority educational domains with their authority scores
 * These domains are prioritized in search results
 */
const EDUCATIONAL_DOMAINS: EducationalDomain[] = [
  // Official Documentation
  { domain: 'developer.mozilla.org', authorityScore: 95, category: 'official', specialties: ['web-development', 'javascript', 'css', 'html'] },
  { domain: 'docs.python.org', authorityScore: 95, category: 'official', specialties: ['python', 'programming'] },
  { domain: 'nodejs.org', authorityScore: 90, category: 'official', specialties: ['nodejs', 'javascript', 'backend'] },
  { domain: 'react.dev', authorityScore: 90, category: 'official', specialties: ['react', 'frontend', 'javascript'] },
  { domain: 'vuejs.org', authorityScore: 90, category: 'official', specialties: ['vue', 'frontend', 'javascript'] },
  { domain: 'angular.io', authorityScore: 90, category: 'official', specialties: ['angular', 'frontend', 'typescript'] },
  
  // Academic & Research
  { domain: 'arxiv.org', authorityScore: 85, category: 'academic', specialties: ['research', 'computer-science', 'ai'] },
  { domain: 'ieee.org', authorityScore: 85, category: 'academic', specialties: ['research', 'engineering', 'technology'] },
  { domain: 'acm.org', authorityScore: 85, category: 'academic', specialties: ['research', 'computer-science'] },
  
  // High-Quality Tutorial Sites
  { domain: 'freecodecamp.org', authorityScore: 80, category: 'tutorial', specialties: ['programming', 'web-development', 'beginner'] },
  { domain: 'css-tricks.com', authorityScore: 80, category: 'tutorial', specialties: ['css', 'frontend', 'web-development'] },
  { domain: 'smashingmagazine.com', authorityScore: 80, category: 'tutorial', specialties: ['web-design', 'frontend', 'ux'] },
  { domain: 'alistapart.com', authorityScore: 80, category: 'tutorial', specialties: ['web-design', 'accessibility', 'standards'] },
  
  // Documentation & Reference
  { domain: 'devdocs.io', authorityScore: 75, category: 'documentation', specialties: ['documentation', 'reference', 'programming'] },
  { domain: 'w3schools.com', authorityScore: 70, category: 'tutorial', specialties: ['web-development', 'beginner', 'reference'] },
  { domain: 'stackoverflow.com', authorityScore: 75, category: 'community', specialties: ['programming', 'qa', 'community'] },
  { domain: 'github.com', authorityScore: 70, category: 'community', specialties: ['programming', 'open-source', 'code'] },
  
  // Additional High-Quality Educational Domains
  { domain: 'docs.microsoft.com', authorityScore: 90, category: 'official', specialties: ['microsoft', 'azure', 'dotnet', 'typescript'] },
  { domain: 'cloud.google.com', authorityScore: 90, category: 'official', specialties: ['google-cloud', 'machine-learning', 'kubernetes'] },
  { domain: 'aws.amazon.com', authorityScore: 90, category: 'official', specialties: ['aws', 'cloud', 'devops'] },
  { domain: 'kubernetes.io', authorityScore: 85, category: 'official', specialties: ['kubernetes', 'containers', 'devops'] },
  { domain: 'docker.com', authorityScore: 85, category: 'official', specialties: ['docker', 'containers', 'devops'] },
  
  // Educational Platforms
  { domain: 'codecademy.com', authorityScore: 75, category: 'tutorial', specialties: ['programming', 'interactive', 'beginner'] },
  { domain: 'khan-academy.org', authorityScore: 80, category: 'tutorial', specialties: ['computer-science', 'mathematics', 'beginner'] },
  { domain: 'coursera.org', authorityScore: 80, category: 'academic', specialties: ['university-courses', 'certificates', 'comprehensive'] },
  { domain: 'edx.org', authorityScore: 80, category: 'academic', specialties: ['university-courses', 'mit', 'harvard'] },
  { domain: 'udacity.com', authorityScore: 75, category: 'tutorial', specialties: ['nanodegrees', 'tech-skills', 'career'] },
  
  // Technical Blogs & Publications
  { domain: 'medium.com', authorityScore: 60, category: 'community', specialties: ['diverse-topics', 'personal-experience', 'variable-quality'] },
  { domain: 'dev.to', authorityScore: 65, category: 'community', specialties: ['developer-community', 'tutorials', 'discussions'] },
  { domain: 'hackernoon.com', authorityScore: 65, category: 'community', specialties: ['tech-news', 'startups', 'programming'] },
  { domain: 'towards-data-science.medium.com', authorityScore: 75, category: 'community', specialties: ['data-science', 'machine-learning', 'analytics'] },
  
  // Language-Specific Official Documentation
  { domain: 'docs.oracle.com', authorityScore: 90, category: 'official', specialties: ['java', 'database', 'enterprise'] },
  { domain: 'go.dev', authorityScore: 90, category: 'official', specialties: ['golang', 'programming', 'google'] },
  { domain: 'rust-lang.org', authorityScore: 90, category: 'official', specialties: ['rust', 'systems-programming', 'memory-safety'] },
  { domain: 'swift.org', authorityScore: 90, category: 'official', specialties: ['swift', 'ios', 'apple'] },
  { domain: 'kotlinlang.org', authorityScore: 85, category: 'official', specialties: ['kotlin', 'android', 'jvm'] },
  
  // Framework Documentation
  { domain: 'nextjs.org', authorityScore: 85, category: 'official', specialties: ['nextjs', 'react', 'frontend'] },
  { domain: 'svelte.dev', authorityScore: 85, category: 'official', specialties: ['svelte', 'frontend', 'compiler'] },
  { domain: 'laravel.com', authorityScore: 85, category: 'official', specialties: ['laravel', 'php', 'backend'] },
  { domain: 'flask.palletsprojects.com', authorityScore: 85, category: 'official', specialties: ['flask', 'python', 'microframework'] },
  { domain: 'djangoproject.com', authorityScore: 85, category: 'official', specialties: ['django', 'python', 'web-framework'] },
];

/**
 * Content type keywords for search optimization
 */
const CONTENT_TYPE_KEYWORDS = {
  tutorial: ['tutorial', 'step by step', 'how to', 'learn', 'guide', 'course', 'workshop'],
  documentation: ['documentation', 'reference', 'api', 'docs', 'manual', 'specification'],
  guide: ['guide', 'complete guide', 'comprehensive', 'overview', 'walkthrough', 'handbook'],
  article: ['article', 'blog post', 'explanation', 'analysis', 'insights', 'tips'],
  research: ['research', 'study', 'analysis', 'paper', 'academic', 'thesis', 'dissertation']
};

/**
 * Topic-specific search patterns for enhanced query generation
 */
const TOPIC_SEARCH_PATTERNS = {
  programming: {
    languages: ['python', 'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby'],
    frameworks: ['react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'laravel', 'spring'],
    concepts: ['oop', 'functional programming', 'async', 'promises', 'closures', 'recursion'],
    patterns: ['design patterns', 'mvc', 'mvvm', 'repository pattern', 'observer pattern'],
    tools: ['git', 'webpack', 'babel']
  },
  web_development: {
    frontend: ['html', 'css', 'javascript', 'responsive design', 'accessibility', 'seo'],
    backend: ['api', 'rest', 'graphql', 'authentication', 'authorization', 'database'],
    fullstack: ['mern stack', 'mean stack', 'jamstack', 'serverless', 'microservices']
  },
  data_science: {
    ml: ['machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch'],
    analytics: ['data analysis', 'statistics', 'pandas', 'numpy', 'matplotlib', 'seaborn'],
    ai: ['artificial intelligence', 'nlp', 'computer vision', 'reinforcement learning']
  },
  devops: {
    tools: ['docker', 'kubernetes', 'jenkins', 'gitlab', 'aws', 'azure', 'gcp'],
    practices: ['ci/cd', 'ci cd', 'infrastructure as code', 'monitoring', 'logging', 'security', 'deployment']
  }
};

/**
 * Skill level keywords for content filtering
 */
const SKILL_LEVEL_KEYWORDS = {
  beginner: [
    'beginner', 'getting started', 'introduction', 'basics', 'fundamentals', 'first time',
    'hello world', 'quick start', 'primer', 'essentials', 'foundation', 'starter',
    'zero to hero', 'from scratch', 'no experience', 'newbie', 'novice'
  ],
  intermediate: [
    'intermediate', 'deep dive', 'optimization', 'best practices', 'patterns',
    'advanced concepts', 'real-world', 'production', 'scaling', 'performance',
    'architecture', 'design patterns', 'testing', 'debugging', 'refactoring'
  ],
  advanced: [
    'advanced', 'expert', 'mastery', 'optimization', 'performance', 'architecture',
    'enterprise', 'scalable', 'distributed', 'microservices', 'system design',
    'algorithm', 'data structures', 'complex', 'sophisticated', 'cutting-edge'
  ]
};

/**
 * Skill level adaptation patterns for different topics
 */
const SKILL_ADAPTATION_PATTERNS = {
  beginner: {
    programming: ['basics', 'syntax', 'variables', 'functions', 'loops', 'conditionals'],
    web_development: ['html basics', 'css fundamentals', 'javascript intro', 'first website'],
    data_science: ['data types', 'basic statistics', 'pandas intro', 'simple charts'],
    devops: ['version control', 'basic deployment', 'simple automation', 'cloud basics']
  },
  intermediate: {
    programming: ['design patterns', 'testing', 'debugging', 'performance', 'libraries'],
    web_development: ['frameworks', 'apis', 'databases', 'authentication', 'responsive design'],
    data_science: ['machine learning', 'statistical analysis', 'data visualization', 'feature engineering'],
    devops: ['ci/cd', 'containerization', 'monitoring', 'infrastructure as code', 'security']
  },
  advanced: {
    programming: ['system design', 'distributed systems', 'algorithms', 'optimization', 'architecture'],
    web_development: ['microservices', 'scalable architecture', 'performance optimization', 'security'],
    data_science: ['deep learning', 'mlops', 'advanced algorithms', 'research', 'production ml'],
    devops: ['kubernetes', 'distributed systems', 'advanced security', 'performance tuning', 'disaster recovery']
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Calculate reading time based on content length with enhanced accuracy
 */
function calculateReadingTime(content: string): string {
  // Different reading speeds for different content types
  const readingSpeeds = {
    technical: 150, // Slower for technical content with code
    tutorial: 180,  // Moderate for tutorials
    documentation: 160, // Slower for documentation
    article: 200,   // Standard for articles
    research: 120   // Slowest for research papers
  };
  
  // Estimate content type based on content characteristics
  const hasCode = /```|`|function|class|import|const|let|var/.test(content);
  const hasTechnicalTerms = /algorithm|architecture|optimization|performance|scalable/.test(content);
  const hasAcademicTerms = /research|study|analysis|methodology|hypothesis/.test(content);
  
  let wordsPerMinute = readingSpeeds.article; // Default
  
  if (hasCode || hasTechnicalTerms) {
    wordsPerMinute = readingSpeeds.technical;
  } else if (hasAcademicTerms) {
    wordsPerMinute = readingSpeeds.research;
  } else if (content.includes('tutorial') || content.includes('step by step')) {
    wordsPerMinute = readingSpeeds.tutorial;
  } else if (content.includes('documentation') || content.includes('api')) {
    wordsPerMinute = readingSpeeds.documentation;
  }
  
  // Calculate word count (more accurate than simple split)
  const wordCount = content
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
  
  // Adjust for code blocks (code takes longer to read)
  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  const codeAdjustment = codeBlockCount * 50; // 50 extra words per code block
  
  const adjustedWordCount = wordCount + codeAdjustment;
  const minutes = Math.ceil(adjustedWordCount / wordsPerMinute);
  
  // Format output
  if (minutes < 1) return '1 min read';
  if (minutes < 60) return `${minutes} min read`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''} read`;
  return `${hours}h ${remainingMinutes}m read`;
}

/**
 * Detect content type from title and description
 */
function detectContentType(title: string, description: string): Article['contentType'] {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('tutorial') || text.includes('step by step') || text.includes('how to')) {
    return 'tutorial';
  }
  
  if (text.includes('documentation') || text.includes('api') || text.includes('reference')) {
    return 'documentation';
  }
  
  if (text.includes('guide') || text.includes('complete') || text.includes('comprehensive')) {
    return 'guide';
  }
  
  if (text.includes('research') || text.includes('study') || text.includes('analysis')) {
    return 'research';
  }
  
  return 'article';
}

/**
 * Detect content depth based on keywords and complexity
 */
function detectContentDepth(title: string, description: string): Article['contentDepth'] {
  const text = `${title} ${description}`.toLowerCase();
  
  const beginnerKeywords = SKILL_LEVEL_KEYWORDS.beginner;
  const advancedKeywords = SKILL_LEVEL_KEYWORDS.advanced;
  
  const beginnerScore = beginnerKeywords.filter(keyword => text.includes(keyword)).length;
  const advancedScore = advancedKeywords.filter(keyword => text.includes(keyword)).length;
  
  if (advancedScore > beginnerScore) return 'advanced';
  if (beginnerScore > 0) return 'basic';
  return 'intermediate';
}

/**
 * Check if content has code examples
 */
function detectCodeExamples(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  const codeKeywords = ['code', 'example', 'snippet', 'implementation', 'function', 'class', 'method'];
  return codeKeywords.some(keyword => text.includes(keyword));
}

/**
 * Calculate domain authority score
 */
function calculateDomainAuthority(domain: string): number {
  const educationalDomain = EDUCATIONAL_DOMAINS.find(d => d.domain === domain);
  return educationalDomain?.authorityScore || 30; // Default low score for unknown domains
}

/**
 * Calculate content freshness score
 */
function calculateFreshnessScore(publishedDate?: string): number {
  if (!publishedDate) return 50; // Neutral score for unknown dates
  
  try {
    const published = new Date(publishedDate);
    const now = new Date();
    const daysDiff = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 30) return 100; // Very fresh
    if (daysDiff < 90) return 80;  // Fresh
    if (daysDiff < 365) return 60; // Recent
    if (daysDiff < 730) return 40; // Older
    return 20; // Very old
  } catch {
    return 50; // Neutral score for invalid dates
  }
}

/**
 * Calculate educational value score
 */
function calculateEducationalValue(
  title: string,
  description: string,
  contentType: Article['contentType'],
  hasCodeExamples: boolean
): number {
  let score = 50; // Base score
  
  // Content type bonus
  switch (contentType) {
    case 'tutorial': score += 20; break;
    case 'documentation': score += 15; break;
    case 'guide': score += 15; break;
    case 'research': score += 10; break;
    case 'article': score += 5; break;
  }
  
  // Code examples bonus
  if (hasCodeExamples) score += 15;
  
  // Educational keywords bonus
  const educationalKeywords = ['learn', 'understand', 'explain', 'demonstrate', 'example', 'practice'];
  const text = `${title} ${description}`.toLowerCase();
  const keywordCount = educationalKeywords.filter(keyword => text.includes(keyword)).length;
  score += Math.min(keywordCount * 5, 20);
  
  return Math.min(score, 100);
}

/**
 * Calculate comprehensive quality score
 */
function calculateQualityScore(article: Omit<Article, 'id' | 'qualityScore'>): number {
  const weights = {
    authority: 0.3,
    educationalValue: 0.25,
    freshness: 0.2,
    contentDepth: 0.15,
    codeExamples: 0.1
  };
  
  const authorityScore = article.authorityScore;
  const educationalValue = article.educationalValue;
  const freshnessScore = article.freshnessScore;
  
  // Content depth score
  const depthScore = article.contentDepth === 'advanced' ? 100 : 
                    article.contentDepth === 'intermediate' ? 70 : 40;
  
  // Code examples bonus
  const codeScore = article.hasCodeExamples ? 100 : 0;
  
  const weightedScore = 
    (authorityScore * weights.authority) +
    (educationalValue * weights.educationalValue) +
    (freshnessScore * weights.freshness) +
    (depthScore * weights.contentDepth) +
    (codeScore * weights.codeExamples);
  
  return Math.round(weightedScore);
}

/**
 * Get adaptive quality thresholds based on content availability
 */
function getAdaptiveThresholds(
  articles: Article[],
  options: {
    minQualityScore: number;
    minAuthorityScore: number;
    maxAgeInDays: number;
    targetResults: number;
  }
) {
  const { minQualityScore, minAuthorityScore, maxAgeInDays, targetResults } = options;
  
  // If we have enough articles, use original thresholds
  if (articles.length >= targetResults * 2) {
    return { minQualityScore, minAuthorityScore, maxAgeInDays };
  }
  
  // If we have some articles but not enough, relax thresholds moderately
  if (articles.length >= targetResults) {
    return {
      minQualityScore: Math.max(5, minQualityScore * 0.7),    // Reduce by 30%
      minAuthorityScore: Math.max(5, minAuthorityScore * 0.7), // Reduce by 30%
      maxAgeInDays: maxAgeInDays * 1.5                         // Increase by 50%
    };
  }
  
  // If we have very few articles, use very relaxed thresholds
  return {
    minQualityScore: Math.max(5, minQualityScore * 0.5),     // Reduce by 50%
    minAuthorityScore: Math.max(5, minAuthorityScore * 0.5),  // Reduce by 50%
    maxAgeInDays: maxAgeInDays * 2                            // Double the age limit
  };
}

/**
 * Filter articles by quality and relevance with enhanced educational domain filtering
 */
function filterArticlesByQuality(
  articles: Article[],
  options: ArticleSearchOptions = {}
): Article[] {
  // If quality filtering is disabled, return all articles without filtering
  if (!ENABLE_QUALITY_FILTERING) {
    console.warn('Article Service: Quality filtering disabled - returning all articles without filtering');
    return articles.slice(0, options.maxResults || QUALITY_CONFIG.maxResults);
  }

  const {
    minQualityScore = QUALITY_CONFIG.minQualityScore,
    skillLevel,
    contentType,
    includeCodeExamples,
    maxAgeInDays = QUALITY_CONFIG.maxAgeInDays,
    domains,
    prioritizeDomainCategories,
    minAuthorityScore = QUALITY_CONFIG.minAuthorityScore,
    preferredLanguages,
    requireAuthor = QUALITY_CONFIG.requireAuthor,
    topic
  } = options;

  // Apply adaptive quality filtering
  const adaptiveThresholds = getAdaptiveThresholds(articles, {
    minQualityScore,
    minAuthorityScore,
    maxAgeInDays,
    targetResults: options.maxResults || QUALITY_CONFIG.maxResults
  });

  console.log('Article Service: Adaptive thresholds applied', {
    originalQualityScore: minQualityScore,
    adaptiveQualityScore: adaptiveThresholds.minQualityScore,
    originalAuthorityScore: minAuthorityScore,
    adaptiveAuthorityScore: adaptiveThresholds.minAuthorityScore,
    articlesAvailable: articles.length,
    targetResults: options.maxResults || QUALITY_CONFIG.maxResults
  });
  
  return articles.filter(article => {
    // Quality score filter
    if (article.qualityScore < adaptiveThresholds.minQualityScore) return false;
    
    // Authority score filter
    if (adaptiveThresholds.minAuthorityScore && article.authorityScore < adaptiveThresholds.minAuthorityScore) return false;
    
    // Author requirement filter
    if (requireAuthor && !article.authorCredibility) return false;
    
    // Domain category filter
    if (prioritizeDomainCategories && prioritizeDomainCategories.length > 0) {
      const articleDomain = EDUCATIONAL_DOMAINS.find(d => d.domain === article.domain);
      if (!articleDomain || !prioritizeDomainCategories.includes(articleDomain.category)) {
        return false;
      }
    }
    
    // Specific domains filter
    if (domains && domains.length > 0) {
      if (!domains.includes(article.domain)) return false;
    }
    
    // Topic-specific domain filtering
    if (topic) {
      const articleDomain = EDUCATIONAL_DOMAINS.find(d => d.domain === article.domain);
      if (articleDomain && articleDomain.specialties) {
        const topicKeywords = topic.toLowerCase().split(' ');
        const hasTopicMatch = articleDomain.specialties.some(specialty => 
          topicKeywords.some(keyword => specialty.includes(keyword))
        );
        // Boost priority for topic-specific domains, but don't exclude others
        if (hasTopicMatch) {
          // This is handled in the sorting phase
        }
      }
    }
    
    // Skill level filter with enhanced logic
    if (skillLevel && article.contentDepth !== skillLevel) {
      // Allow some flexibility for skill level matching
      if (skillLevel === 'beginner' && article.contentDepth === 'intermediate') return true;
      if (skillLevel === 'advanced' && article.contentDepth === 'intermediate') return true;
      if (skillLevel === 'intermediate' && article.contentDepth === 'basic') return false;
      if (skillLevel === 'intermediate' && article.contentDepth === 'advanced') return false;
    }
    
    // Content type filter
    if (contentType && article.contentType !== contentType) return false;
    
    // Code examples filter
    if (includeCodeExamples && !article.hasCodeExamples) return false;
    
    // Age filter with enhanced date validation
    if (maxAgeInDays && article.publishedAt) {
      try {
        const published = new Date(article.publishedAt);
        const now = new Date();
        
        // Validate date is reasonable (not in future, not too old)
        if (published > now) return false; // Future dates are suspicious
        if (published.getFullYear() < 2000) return false; // Very old content
        
        const daysDiff = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > maxAgeInDays) return false;
      } catch {
        // If date parsing fails, include the article but with lower priority
        // This is handled in the sorting phase
      }
    }
    
    return true;
  });
}

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Search articles using Tavily Search API
 */
export async function searchArticles(
  query: string,
  options: ArticleSearchOptions = {}
): Promise<{ articles: Article[]; totalResults: number; query: string }> {
  try {
    console.log(`[Article Service] Searching for: "${query}" with options:`, options);
    
    const {
      maxResults = QUALITY_CONFIG.maxResults,
      skillLevel,
      contentType,
      minQualityScore = QUALITY_CONFIG.minQualityScore,
      includeCodeExamples,
      maxAgeInDays = QUALITY_CONFIG.maxAgeInDays,
      domains
    } = options;
    
    // Build search query with educational focus and topic-specific enhancement
    const enhancedQuery = enhanceSearchQuery(query, skillLevel, contentType, options.topic);
    
    // Call Tavily Search API
    const tavilyResponse = await callTavilySearchAPI(enhancedQuery, (maxResults || DEFAULT_ARTICLE_SEARCH_LIMIT) * 2); // Get more results for filtering
    
    // Transform Tavily results to Article format with URL validation
    const articles: Article[] = tavilyResponse.results
      .filter(result => {
        // Validate URL format
        try {
          new URL(result.url);
          return true;
        } catch {
          console.warn(`[Article Service] Invalid URL found: ${result.url}`);
          return false;
        }
      })
      .map((result, index) => {
        const domain = extractDomain(result.url);
        const contentType = detectContentType(result.title, result.content);
        const contentDepth = detectContentDepth(result.title, result.content);
        const hasCodeExamples = detectCodeExamples(result.title, result.content);
        
        const article: Omit<Article, 'id' | 'qualityScore'> = {
          title: result.title,
          description: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
          url: result.url,
          source: domain,
          domain,
          publishedAt: result.published_date,
          readingTime: calculateReadingTime(result.content),
          tags: generateTags(result.title, result.content, contentType, contentDepth),
          educationalValue: calculateEducationalValue(result.title, result.content, contentType, hasCodeExamples),
          authorityScore: calculateDomainAuthority(domain),
          freshnessScore: calculateFreshnessScore(result.published_date),
          contentDepth,
          contentType,
          hasCodeExamples,
          authorCredibility: result.author ? 70 : undefined // Basic credibility for articles with authors
        };
        
        return {
          ...article,
          id: `article_${index}_${Date.now()}`,
          qualityScore: calculateQualityScore(article)
        };
      });
    
    // Filter articles by quality and options
    const filteredArticles = filterArticlesByQuality(articles, {
      minQualityScore,
      skillLevel,
      contentType,
      includeCodeExamples,
      maxAgeInDays
    });
    
    // Enhanced sorting with educational domain prioritization
    const sortedArticles = filteredArticles
      .sort((a, b) => {
        // Primary sort: Topic relevance boost
        if (options.topic) {
          const aTopicRelevance = calculateTopicRelevance(a, options.topic);
          const bTopicRelevance = calculateTopicRelevance(b, options.topic);
          if (aTopicRelevance !== bTopicRelevance) {
            return bTopicRelevance - aTopicRelevance;
          }
        }
        
        // Secondary sort: Domain category priority
        if (options.prioritizeDomainCategories && options.prioritizeDomainCategories.length > 0) {
          const aDomainPriority = getDomainCategoryPriority(a.domain, options.prioritizeDomainCategories);
          const bDomainPriority = getDomainCategoryPriority(b.domain, options.prioritizeDomainCategories);
          if (aDomainPriority !== bDomainPriority) {
            return bDomainPriority - aDomainPriority;
          }
        }
        
        // Tertiary sort: Quality score
        return b.qualityScore - a.qualityScore;
      })
      .slice(0, maxResults);
    
    console.log(`[Article Service] Found ${sortedArticles.length} articles from ${articles.length} total results`);
    
    return {
      articles: sortedArticles,
      totalResults: sortedArticles.length,
      query: enhancedQuery
    };
    
  } catch (error) {
    console.error('[Article Service] Error searching articles:', error);
    throw new Error(`Failed to search articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Enhance search query for educational content with topic-specific and skill-adaptive capabilities
 */
function enhanceSearchQuery(
  query: string,
  skillLevel?: 'beginner' | 'intermediate' | 'advanced',
  contentType?: Article['contentType'],
  topic?: string
): string {
  let enhancedQuery = query.trim();
  
  if (!enhancedQuery) {
    return 'tutorial learn guide';
  }
  
  const queryLower = enhancedQuery.toLowerCase();
  let addedKeywords: string[] = [];
  
  // Detect topic category and add topic-specific keywords
  const detectedTopic = detectTopicCategory(query);
  if (detectedTopic && skillLevel && SKILL_ADAPTATION_PATTERNS[skillLevel]?.[detectedTopic]) {
    const topicKeywords = SKILL_ADAPTATION_PATTERNS[skillLevel][detectedTopic];
    const relevantTopicKeywords = topicKeywords.filter(
      keyword => !queryLower.includes(keyword)
    );
    if (relevantTopicKeywords.length > 0) {
      const keyword = relevantTopicKeywords[0];
      enhancedQuery += ` ${keyword}`;
      addedKeywords.push(keyword);
    }
  }
  
  // Add content type keywords with topic-specific variations
  if (contentType && CONTENT_TYPE_KEYWORDS[contentType]) {
    const relevantKeywords = CONTENT_TYPE_KEYWORDS[contentType].filter(
      keyword => !queryLower.includes(keyword)
    );
    if (relevantKeywords.length > 0) {
      const keyword = relevantKeywords[0];
      enhancedQuery += ` ${keyword}`;
      addedKeywords.push(keyword);
    }
  }
  
  // Add skill level keywords with topic adaptation
  if (skillLevel && SKILL_LEVEL_KEYWORDS[skillLevel]) {
    const relevantKeywords = SKILL_LEVEL_KEYWORDS[skillLevel].filter(
      keyword => !queryLower.includes(keyword)
    );
    if (relevantKeywords.length > 0) {
      const keyword = relevantKeywords[0];
      enhancedQuery += ` ${keyword}`;
      addedKeywords.push(keyword);
    }
  }
  
  // Add topic-specific search patterns
  if (detectedTopic && TOPIC_SEARCH_PATTERNS[detectedTopic]) {
    const topicPatterns = TOPIC_SEARCH_PATTERNS[detectedTopic];
    const allTopicKeywords = Object.values(topicPatterns).flat();
    const matchingKeywords = allTopicKeywords.filter(keyword => 
      queryLower.includes(keyword) && !addedKeywords.includes(keyword)
    );
    
    if (matchingKeywords.length > 0) {
      // Add related topic keywords to improve search relevance
      const relatedKeywords = matchingKeywords.slice(0, 2);
      relatedKeywords.forEach(keyword => {
        if (!enhancedQuery.includes(keyword)) {
          enhancedQuery += ` ${keyword}`;
        }
      });
    }
  }
  
  // Ensure basic educational context
  if (addedKeywords.length === 0) {
    const basicEducational = ['tutorial', 'learn', 'guide'];
    const missingBasic = basicEducational.filter(keyword => !queryLower.includes(keyword));
    
    if (missingBasic.length > 0) {
      const keyword = missingBasic[0];
      enhancedQuery += ` ${keyword}`;
    }
  }
  
  return enhancedQuery.trim();
}

/**
 * Detect topic category from query
 */
function detectTopicCategory(query: string): keyof typeof TOPIC_SEARCH_PATTERNS | null {
  const queryLower = query.toLowerCase();
  
  // Check for devops first (to avoid conflicts with programming tools)
  const devopsKeywords = [
    ...TOPIC_SEARCH_PATTERNS.devops.tools,
    ...TOPIC_SEARCH_PATTERNS.devops.practices
  ];
  
  if (devopsKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'devops';
  }
  
  // Check for data science
  const dataScienceKeywords = [
    ...TOPIC_SEARCH_PATTERNS.data_science.ml,
    ...TOPIC_SEARCH_PATTERNS.data_science.analytics,
    ...TOPIC_SEARCH_PATTERNS.data_science.ai
  ];
  
  if (dataScienceKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'data_science';
  }
  
  // Check for web development (but handle javascript specially)
  const webDevKeywords = [
    ...TOPIC_SEARCH_PATTERNS.web_development.frontend.filter(k => k !== 'javascript'),
    ...TOPIC_SEARCH_PATTERNS.web_development.backend,
    ...TOPIC_SEARCH_PATTERNS.web_development.fullstack
  ];
  
  if (webDevKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'web_development';
  }
  
  // Special handling for javascript - check if it's web development context
  if (queryLower.includes('javascript')) {
    const webContext = ['html', 'css', 'frontend', 'website', 'web', 'browser', 'dom'];
    if (webContext.some(context => queryLower.includes(context))) {
      return 'web_development';
    } else {
      return 'programming';
    }
  }
  
  // Check for programming languages and concepts
  const programmingKeywords = [
    ...TOPIC_SEARCH_PATTERNS.programming.languages,
    ...TOPIC_SEARCH_PATTERNS.programming.frameworks,
    ...TOPIC_SEARCH_PATTERNS.programming.concepts,
    ...TOPIC_SEARCH_PATTERNS.programming.patterns,
    ...TOPIC_SEARCH_PATTERNS.programming.tools
  ];
  
  if (programmingKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'programming';
  }
  
  return null;
}

/**
 * Generate tags for articles based on content analysis
 */
function generateTags(
  title: string,
  content: string,
  contentType: Article['contentType'],
  contentDepth: Article['contentDepth']
): string[] {
  const tags: string[] = [];
  const text = `${title} ${content}`.toLowerCase();
  
  // Content type tags
  tags.push(contentType);
  
  // Skill level tags
  tags.push(contentDepth);
  
  // Topic-specific tags (basic detection)
  const topics = ['javascript', 'python', 'react', 'nodejs', 'css', 'html', 'api', 'database'];
  topics.forEach(topic => {
    if (text.includes(topic)) {
      tags.push(topic);
    }
  });
  
  // Educational tags
  if (text.includes('tutorial') || text.includes('learn')) tags.push('educational');
  if (text.includes('example') || text.includes('code')) tags.push('practical');
  if (text.includes('best practice') || text.includes('optimization')) tags.push('best-practices');
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Calculate topic relevance score for domain prioritization
 */
function calculateTopicRelevance(article: Article, topic: string): number {
  const topicLower = topic.toLowerCase();
  const topicKeywords = topicLower.split(/\s+/);
  
  let relevanceScore = 0;
  
  // Check domain specialties
  const articleDomain = EDUCATIONAL_DOMAINS.find(d => d.domain === article.domain);
  if (articleDomain && articleDomain.specialties) {
    const specialtyMatches = articleDomain.specialties.filter(specialty =>
      topicKeywords.some(keyword => specialty.includes(keyword) || keyword.includes(specialty))
    );
    relevanceScore += specialtyMatches.length * 20; // 20 points per specialty match
  }
  
  // Check article title and description
  const articleText = `${article.title} ${article.description}`.toLowerCase();
  const titleMatches = topicKeywords.filter(keyword => articleText.includes(keyword));
  relevanceScore += titleMatches.length * 10; // 10 points per keyword match
  
  // Boost for exact topic match
  if (articleText.includes(topicLower)) {
    relevanceScore += 30;
  }
  
  return relevanceScore;
}

/**
 * Get domain category priority score
 */
function getDomainCategoryPriority(
  domain: string,
  prioritizedCategories: Array<'official' | 'academic' | 'tutorial' | 'documentation' | 'community'>
): number {
  const articleDomain = EDUCATIONAL_DOMAINS.find(d => d.domain === domain);
  if (!articleDomain) return 0;
  
  const categoryIndex = prioritizedCategories.indexOf(articleDomain.category);
  if (categoryIndex === -1) return 0;
  
  // Higher score for higher priority (lower index)
  return (prioritizedCategories.length - categoryIndex) * 10;
}

/**
 * Call Tavily Search API
 */
async function callTavilySearchAPI(query: string, maxResults: number): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    console.warn('[Article Service] TAVILY_API_KEY not found, using mock data');
    return generateMockTavilyResponse(query, maxResults);
  }
  
  try {
    console.log(`💰 Tavily API call: ${query} (maxResults: ${maxResults})`);
    console.log(`💰 Estimated cost: ~$0.01 per search`);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: 'basic',
        include_domains: EDUCATIONAL_DOMAINS.map(d => d.domain),
        include_answer: true, // Include AI-generated answer for educational content
        include_raw_content: true, // Include raw content for better analysis
        include_images: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Tavily API call successful - Cost: ~$0.01`);
    return data as TavilySearchResponse;
    
  } catch (error) {
    console.error('[Article Service] Tavily API call failed:', error);
    console.log('[Article Service] Falling back to mock data');
    return generateMockTavilyResponse(query, maxResults);
  }
}

/**
 * Generate mock Tavily response for development/testing
 */
function generateMockTavilyResponse(query: string, maxResults: number): TavilySearchResponse {
  const mockResults: TavilySearchResult[] = [
    {
      title: `Complete Guide to Learning ${query}`,
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      content: `A comprehensive tutorial covering all aspects of ${query}. This guide includes practical examples, best practices, and real-world applications. Perfect for developers looking to master ${query} from basics to advanced concepts.`,
      score: 0.95,
      published_date: '2024-01-15',
      author: 'MDN Web Docs',
      language: 'en'
    },
    {
      title: `${query} Best Practices and Advanced Techniques`,
      url: 'https://css-tricks.com/advanced-techniques',
      content: `Learn advanced techniques and best practices for working with ${query}. This article covers optimization strategies, common pitfalls, and professional development approaches.`,
      score: 0.88,
      published_date: '2024-01-10',
      author: 'CSS-Tricks Team',
      language: 'en'
    },
    {
      title: `Getting Started with ${query}: A Beginner's Tutorial`,
      url: 'https://freecodecamp.org/tutorial',
      content: `Step-by-step tutorial for absolute beginners. Learn ${query} fundamentals through hands-on examples and interactive exercises. Perfect for those starting their programming journey.`,
      score: 0.82,
      published_date: '2024-01-08',
      author: 'freeCodeCamp',
      language: 'en'
    },
    {
      title: `${query} vs Other Technologies: A Comprehensive Comparison`,
      url: 'https://smashingmagazine.com/comparison',
      content: `Detailed comparison of ${query} with similar technologies. Understand the pros and cons, use cases, and when to choose ${query} over alternatives.`,
      score: 0.78,
      published_date: '2024-01-05',
      author: 'Smashing Magazine',
      language: 'en'
    },
    {
      title: `Advanced ${query} Patterns and Optimization`,
      url: 'https://alistapart.com/advanced-patterns',
      content: `Explore advanced patterns, optimization techniques, and architectural considerations for ${query}. This article is aimed at experienced developers looking to optimize their ${query} implementations.`,
      score: 0.75,
      published_date: '2024-01-01',
      author: 'A List Apart',
      language: 'en'
    }
  ];
  
  return {
    results: mockResults.slice(0, maxResults),
    query,
    total_results: mockResults.length
  };
}

/**
 * Enhanced search with universal quality assessment
 */
export async function searchArticlesWithQualityAssessment(
  query: string,
  options: ArticleSearchOptions & { useQualityEngine?: boolean } = {}
): Promise<{
  articles: Article[];
  totalResults: number;
  query: string;
  qualityInsights?: any;
}> {
  // Get articles using standard search
  const searchResult = await searchArticles(query, options);
  
  // If quality engine is disabled, return standard results
  if (!options.useQualityEngine) {
    return searchResult;
  }
  
  console.log(`[Article Service] Applying quality assessment to ${searchResult.articles.length} articles`);
  
  try {
    // Convert articles to quality engine format
    const qualityContentItems: QualityContentItem[] = searchResult.articles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source,
      domain: article.domain,
      publishedAt: article.publishedAt,
      contentType: article.contentType as any, // Map to quality engine types
      skillLevel: article.contentDepth === 'basic' ? 'beginner' : 
                  article.contentDepth === 'intermediate' ? 'intermediate' : 'advanced',
      learningObjectives: [], // Could be enhanced with AI extraction
      duration: article.readingTime,
      language: 'en', // Default to English
      tags: article.tags
    }));
    
    // Create learning context
    const learningContext: LearningContext = {
      topic: query,
      skillLevel: options.skillLevel,
      learningGoals: [], // Could be enhanced
      timeAvailable: undefined,
      preferredFormats: ['article'],
      currentKnowledge: []
    };
    
    // Apply quality assessment and ranking
    const rankedContent = qualityRankContent(qualityContentItems, learningContext, {
      minQualityThreshold: options.minQualityScore || 50,
      weights: {
        relevance: 0.35,
        authority: 0.25,
        freshness: 0.15,
        engagement: 0.15,
        educational: 0.10
      }
    });
    
    // Convert back to article format with enhanced quality data
    const enhancedArticles: Article[] = rankedContent.map(item => {
      const originalArticle = searchResult.articles.find(a => a.id === item.id)!;
      return {
        ...originalArticle,
        qualityScore: item.metrics?.overallQuality || originalArticle.qualityScore,
        // Add quality metrics as additional fields
        relevanceScore: item.metrics?.relevanceScore,
        authorityScore: item.metrics?.authorityScore,
        educationalValue: item.metrics?.educationalValue
      };
    });
    
    console.log(`[Article Service] Quality assessment complete, ${enhancedArticles.length} articles ranked`);
    
    return {
      articles: enhancedArticles,
      totalResults: searchResult.totalResults,
      query: searchResult.query,
      qualityInsights: {
        averageQuality: rankedContent.reduce((sum, item) => sum + (item.metrics?.overallQuality || 0), 0) / rankedContent.length,
        totalAssessed: rankedContent.length,
        qualityEngineUsed: true
      }
    };
    
  } catch (error) {
    console.warn('[Article Service] Quality assessment failed, falling back to standard results:', error);
    return searchResult;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
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
};
