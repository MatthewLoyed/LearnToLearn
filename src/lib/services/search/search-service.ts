/**
 * Search Service for Skill Forge
 * Handles all search operations for videos, articles, and images
 * 
 * Features:
 * - OpenAI-powered search query generation
 * - Multi-query search with deduplication
 * - Content distribution across milestones
 * - Cost tracking and optimization
 */

import { generateSearchQueries } from '../openai/openai-service';
import { searchYouTubeVideos } from '../youtube/youtube-service';
import { searchArticles } from '../articles/article-service';


// ============================================================================
// CONFIGURATION - Import from centralized config
// ============================================================================

import {
  VIDEOS_PER_MILESTONE,
  ARTICLES_PER_MILESTONE,
  TOTAL_MILESTONES,
  TOTAL_IMAGES,
  TOTAL_VIDEOS,
  TOTAL_ARTICLES,
  DEFAULT_ARTICLE_SEARCH_LIMIT,
  DEFAULT_IMAGE_SEARCH_LIMIT
} from '../../config/content-config';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SearchResults {
  videos: any[];
  articles: any[];
  metadata: {
    searchQueries: {
      youtube: string[];
      articles: string[];
      detectedTopic: string;
      reasoning: string;
    };
    contentOptimization: {
      learningStyle: string;
      difficultyAdjustment: string;
      contentTypes: string[];
      searchStrategy: string;
    };
    classification: {
      domain: string;
      complexity: string;
      prerequisites: string[];
      estimatedTime: string;
    };
    apiResults: {
      videos: number;
      articles: number;
    };
  };
}

export interface SearchOptions {
  maxVideos?: number;
  maxArticles?: number;
  maxImages?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

// ============================================================================
// CORE SEARCH FUNCTIONS
// ============================================================================

/**
 * Enhanced search with OpenAI-generated queries
 * This is the main entry point for all content searches
 */
export async function searchAllContent(
  topic: string,
  options: SearchOptions = {}
): Promise<SearchResults> {
  return searchAllContentWithContext(topic, options);
}

/**
 * Enhanced search with milestone context for better content targeting
 * This allows for more specific queries when milestone information is available
 */
export async function searchAllContentWithContext(
  topic: string,
  options: SearchOptions = {},
  milestoneContext?: {
    title: string;
    description: string;
    difficulty: string;
  }
): Promise<SearchResults> {
  const {
    maxVideos = TOTAL_VIDEOS,
    maxArticles = TOTAL_ARTICLES,
    skillLevel = 'beginner'
  } = options;

  console.log(`🔍 [Search Service] Starting comprehensive search for: "${topic}" (${skillLevel})`);
  
  try {
    // Step 1: Generate search queries using OpenAI with optional milestone context
    console.log(`[Search Service] Step 1: Generating search queries with OpenAI${milestoneContext ? ` (with milestone context: "${milestoneContext.title}")` : ''}`);
    const searchQueries = await generateSearchQueries(topic, skillLevel, {
      maxQueries: 3,
      includeVisuals: true
    }, milestoneContext);
    
    console.log(`[Search Service] OpenAI generated queries:`, {
      youtube: searchQueries.youtubeQueries,
      articles: searchQueries.articleQueries,
      topic: searchQueries.detectedTopic,
      reasoning: searchQueries.reasoning,
      domain: searchQueries.classification.domain,
      complexity: searchQueries.classification.complexity,
      learningStyle: searchQueries.contentOptimization.learningStyle,
      estimatedTime: searchQueries.classification.estimatedTime
    });
    
    // Step 2: Make parallel API calls with generated queries
    console.log(`[Search Service] Step 2: Making parallel API calls with generated queries`);
    
    const [youtubeResults, articleResults] = await Promise.all([
      // YouTube: Use all available queries for better video coverage
      searchYouTubeWithMultipleQueries(searchQueries.youtubeQueries, skillLevel, maxVideos),
      
      // Articles: Use first 2 queries for better coverage
      searchArticlesWithMultipleQueries(searchQueries.articleQueries.slice(0, 2), skillLevel, maxArticles)
    ]);
    
    console.log(`[Search Service] API results:`, {
      videos: youtubeResults.videos?.length || 0,
      articles: articleResults.articles?.length || 0
    });
    
    return {
      videos: youtubeResults.videos || [],
      articles: articleResults.articles || [],
      metadata: {
        searchQueries: {
          youtube: searchQueries.youtubeQueries,
          articles: searchQueries.articleQueries,
          detectedTopic: searchQueries.detectedTopic,
          reasoning: searchQueries.reasoning
        },
        contentOptimization: searchQueries.contentOptimization,
        classification: searchQueries.classification,
        apiResults: {
          videos: youtubeResults.videos?.length || 0,
          articles: articleResults.articles?.length || 0
        }
      }
    };
    
  } catch (error) {
    console.error('[Search Service] Content search failed:', error);
    throw error;
  }
}

/**
 * Search YouTube with multiple queries and aggregate results
 */
async function searchYouTubeWithMultipleQueries(
  queries: string[],
  skillLevel: 'beginner' | 'intermediate' | 'advanced',
  maxVideos: number = TOTAL_VIDEOS
): Promise<{ videos: any[] }> {
  const allVideos: any[] = [];
  
  console.log(`🔍 YouTube: Using ${queries.length} query for ${maxVideos} videos total`);
  
  // Use only the first query to avoid multiple API calls
  const query = queries[0];
  
  try {
    console.log(`  📺 Searching: "${query}" (need ${maxVideos} videos)`);
    
    const result = await searchYouTubeVideos({
      query,
      maxResults: maxVideos,
      skillLevel
    });
    
    if (result.videos && result.videos.length > 0) {
      // Add all videos found
      for (const video of result.videos) {
        allVideos.push(video);
      }
      
      console.log(`  ✅ Found ${result.videos.length} videos from "${query}"`);
    }
    
  } catch (error) {
    console.warn(`  ⚠️ Query failed: ${error}`);
  }
  
  console.log(`💰 Total YouTube videos found: ${allVideos.length}`);
  
  return {
    videos: allVideos
  };
}

/**
 * Search articles with multiple queries
 */
async function searchArticlesWithMultipleQueries(
  queries: string[],
  skillLevel: 'beginner' | 'intermediate' | 'advanced',
  maxArticles: number = DEFAULT_ARTICLE_SEARCH_LIMIT
): Promise<{ articles: any[] }> {
  const allArticles: any[] = [];
  
  console.log(`🔍 Articles: Using ${queries.length} OpenAI-generated queries for ${maxArticles} articles total`);
  
  for (const query of queries) {
    if (allArticles.length >= maxArticles) break;
    
    try {
      console.log(`  📄 Searching: "${query}"`);
      
      const result = await searchArticles(query, {
        maxResults: Math.ceil(maxArticles / queries.length),
        skillLevel,
        contentType: 'tutorial'
      });
      
      if (result.articles && result.articles.length > 0) {
        // Add unique articles (avoid duplicates)
        for (const article of result.articles) {
          if (!allArticles.find(a => a.url === article.url) && allArticles.length < maxArticles) {
            allArticles.push(article);
          }
        }
        
        console.log(`  ✅ Found ${result.articles.length} articles from "${query}"`);
      }
      
    } catch (error) {
      console.warn(`  ⚠️ Query failed: ${error}`);
      continue;
    }
  }
  
  console.log(`💰 Total articles found: ${allArticles.length}`);
  
  return {
    articles: allArticles
  };
}

/**
 * Search images with AI-generated intelligent queries for Universal Learning Visuals
 * AI decides whether images are useful for the topic and what type to search for
 */
async function searchImagesWithIntelligentQueries(
  topic: string,
  skillLevel: 'beginner' | 'intermediate' | 'advanced',
  domain: string,
  maxImages: number = DEFAULT_IMAGE_SEARCH_LIMIT
): Promise<{ images: any[] }> {
  console.log(`🔍 Images: AI-powered intelligent search for "${topic}" (${domain})`);
  
  // Image search has been deprecated
  console.log(`  🚫 Image search deprecated for "${topic}" - returning empty results`);
  return { images: [] };
}

/**
 * Search images with multiple queries (legacy - kept for reference)
 */
async function searchImagesWithMultipleQueries(
  queries: string[],
  skillLevel: 'beginner' | 'intermediate' | 'advanced',
  maxImages: number = DEFAULT_IMAGE_SEARCH_LIMIT
): Promise<{ images: any[] }> {
  const allImages: any[] = [];
  
  console.log(`🔍 Images: Using ${queries.length} OpenAI-generated queries for ${maxImages} images total`);
  
  for (const query of queries) {
    if (allImages.length >= maxImages) break;
    
    try {
      console.log(`  🖼️ Searching: "${query}"`);
      
      // Image search has been deprecated
      console.log(`  ⚠️ Image search deprecated - skipping "${query}"`);
      
    } catch (error) {
      console.warn(`  ⚠️ Query failed: ${error}`);
      continue;
    }
  }
  
  console.log(`💰 Total images found: ${allImages.length}`);
  
  return {
    images: allImages
  };
}

// ============================================================================
// CONTENT DISTRIBUTION
// ============================================================================

/**
 * Enhanced content distribution with milestone-aware matching
 * Uses milestone context to better match content to specific milestones
 */
export function distributeContentWithMilestoneContext<T>(
  content: T[],
  milestones: any[],
  contentType: 'video' | 'article' | 'image'
): { [milestoneIndex: number]: T[] } {
  console.log(`[Search Service] Distributing ${content.length} ${contentType}s across ${milestones.length} milestones with context-aware matching`);
  
  const distribution: { [milestoneIndex: number]: T[] } = {};
  
  // Initialize distribution arrays
  for (let i = 0; i < milestones.length; i++) {
    distribution[i] = [];
  }
  
  // If no content, return empty distribution
  if (content.length === 0) {
    console.log(`[Search Service] No ${contentType}s available for distribution`);
    return distribution;
  }
  
  // Score each content item against each milestone
  const contentScores: Array<{ content: T; scores: number[] }> = content.map(item => {
    const scores = milestones.map(milestone => {
      return calculateContentMilestoneRelevance(item, milestone, contentType);
    });
    return { content: item, scores };
  });
  
  // Distribute content based on scores
  const itemsPerMilestone = Math.ceil(content.length / milestones.length);
  
  for (let milestoneIndex = 0; milestoneIndex < milestones.length; milestoneIndex++) {
    const milestone = milestones[milestoneIndex];
    const targetCount = contentType === 'video' ? VIDEOS_PER_MILESTONE : ARTICLES_PER_MILESTONE;
    
    console.log(`[Search Service] Distributing ${targetCount} ${contentType}s for milestone ${milestoneIndex + 1}: "${milestone.title}"`);
    
    // Find best content for this milestone
    const bestContent = findBestContentForMilestone(contentScores, milestoneIndex, targetCount);
    
    distribution[milestoneIndex] = bestContent;
    
    // Remove used content from consideration
    bestContent.forEach(usedContent => {
      const index = contentScores.findIndex(item => item.content === usedContent);
      if (index !== -1) {
        contentScores.splice(index, 1);
      }
    });
    
    console.log(`[Search Service] Assigned ${distribution[milestoneIndex].length} ${contentType}s to milestone ${milestoneIndex + 1}`);
  }
  
  return distribution;
}

/**
 * Calculate relevance score between content and milestone
 * Higher score = better match
 */
function calculateContentMilestoneRelevance(
  content: any,
  milestone: any,
  contentType: 'video' | 'article' | 'image'
): number {
  let score = 0;
  
  // Extract key terms from milestone
  const milestoneTerms = extractKeyTerms(`${milestone.title} ${milestone.description}`);
  const contentTerms = extractKeyTerms(`${content.title || ''} ${content.description || ''}`);
  
  // Calculate term overlap
  const commonTerms = milestoneTerms.filter(term => contentTerms.includes(term));
  score += commonTerms.length * 10; // 10 points per common term
  
  // Difficulty matching
  const milestoneDifficulty = milestone.difficulty?.toLowerCase() || 'beginner';
  const contentDifficulty = extractDifficultyFromContent(content);
  
  if (milestoneDifficulty === contentDifficulty) {
    score += 20; // Perfect difficulty match
  } else if (isDifficultyCompatible(milestoneDifficulty, contentDifficulty)) {
    score += 10; // Compatible difficulty
  }
  
  // Content type relevance
  if (contentType === 'video' && content.duration) {
    // Prefer videos with appropriate duration for milestone
    const duration = parseDuration(content.duration);
    if (duration > 0) {
      if (milestone.difficulty === 'beginner' && duration <= 600) { // ≤10 min for beginners
        score += 15;
      } else if (milestone.difficulty === 'intermediate' && duration <= 1200) { // ≤20 min for intermediate
        score += 15;
      } else if (milestone.difficulty === 'advanced' && duration <= 1800) { // ≤30 min for advanced
        score += 15;
      }
    }
  }
  
  // Quality score bonus
  if (content.qualityScore) {
    score += Math.min(content.qualityScore / 10, 10); // Up to 10 points for quality
  }
  
  // Source authority bonus
  if (content.source && isAuthoritativeSource(content.source)) {
    score += 5;
  }
  
  return Math.max(0, score);
}

/**
 * Extract key terms from text for matching
 */
function extractKeyTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'will', 'learn', 'about', 'how', 'what', 'when', 'where', 'why'].includes(word)
    )
    .slice(0, 10); // Limit to top 10 terms
}

/**
 * Extract difficulty from content metadata
 */
function extractDifficultyFromContent(content: any): string {
  const title = (content.title || '').toLowerCase();
  const description = (content.description || '').toLowerCase();
  
  if (title.includes('advanced') || description.includes('advanced')) return 'advanced';
  if (title.includes('intermediate') || description.includes('intermediate')) return 'intermediate';
  if (title.includes('beginner') || description.includes('beginner')) return 'beginner';
  
  return 'beginner'; // Default
}

/**
 * Check if difficulties are compatible
 */
function isDifficultyCompatible(milestoneDifficulty: string, contentDifficulty: string): boolean {
  const difficultyOrder = ['beginner', 'intermediate', 'advanced'];
  const milestoneIndex = difficultyOrder.indexOf(milestoneDifficulty);
  const contentIndex = difficultyOrder.indexOf(contentDifficulty);
  
  // Allow content within one level of milestone difficulty
  return Math.abs(milestoneIndex - contentIndex) <= 1;
}

/**
 * Parse duration string to seconds
 */
function parseDuration(duration: string): number {
  if (typeof duration === 'number') return duration;
  
  const match = duration.match(/(\d+):(\d+)/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes * 60 + seconds;
  }
  
  return 0;
}

/**
 * Check if source is authoritative
 */
function isAuthoritativeSource(source: string): boolean {
  const authoritativeSources = [
    'youtube', 'khan academy', 'coursera', 'edx', 'udemy', 'freecodecamp',
    'mdn', 'w3schools', 'stack overflow', 'github', 'medium', 'dev.to'
  ];
  
  return authoritativeSources.some(authSource => 
    source.toLowerCase().includes(authSource)
  );
}

/**
 * Find best content for a specific milestone
 */
function findBestContentForMilestone<T>(
  contentScores: Array<{ content: T; scores: number[] }>,
  milestoneIndex: number,
  targetCount: number
): T[] {
  // Sort content by score for this milestone (highest first)
  const sortedContent = contentScores
    .map(item => ({
      content: item.content,
      score: item.scores[milestoneIndex]
    }))
    .sort((a, b) => b.score - a.score);
  
  // Return top N content items
  return sortedContent.slice(0, targetCount).map(item => item.content);
}

/**
 * Distribute content across milestones with fallback content
 */
export function distributeContent<T>(
  content: T[],
  startIndex: number,
  totalItemsNeeded: number,
  totalMilestones: number
): T[] {
  const distributed: T[] = [];
  
  // Distribute real content first
  for (let i = 0; i < totalItemsNeeded; i++) {
    const contentIndex = startIndex + i;
    if (contentIndex < content.length) {
      distributed.push(content[contentIndex]);
    } else {
      // Create fallback content when we run out of real content
      const fallbackIndex = distributed.length;
      const milestoneIndex = Math.floor(fallbackIndex / Math.ceil(totalItemsNeeded / totalMilestones));
      const fallbackItem = createFallbackContent<T>(milestoneIndex, fallbackIndex, totalMilestones);
      distributed.push(fallbackItem);
    }
  }
  
  return distributed;
}

/**
 * Create fallback content when real content is not available
 */
function createFallbackContent<T>(
  milestoneIndex: number,
  itemIndex: number,
  totalMilestones: number
): T {
  const milestoneNames = ['Beginner', 'Intermediate', 'Advanced'];
  const milestoneName = milestoneNames[milestoneIndex] || `Milestone ${milestoneIndex + 1}`;
  
  // Create realistic fallback content based on the type
  return {
    title: `${milestoneName} Learning Resource ${itemIndex + 1}`,
    description: `Essential ${milestoneName.toLowerCase()} content to support your learning journey`,
    url: '#', // This will trigger the "Not Available" message
    source: 'Skill Forge',
    qualityScore: 70,
    type: 'fallback'
  } as T;
}

/**
 * Enhance roadmap with real content using search results
 * Now uses milestone-aware content distribution for better matching
 */
export function enhanceRoadmapWithContent(
  roadmap: any,
  searchResults: SearchResults,
  topic: string
): any {
  console.log(`[Search Service] Step 3: Distributing content across milestones with milestone-aware matching`);
  
  const totalMilestones = roadmap.milestones.length;
  
  // Use milestone-aware distribution for better content matching
  const videoDistribution = distributeContentWithMilestoneContext(
    searchResults.videos,
    roadmap.milestones,
    'video'
  );
  
  const articleDistribution = distributeContentWithMilestoneContext(
    searchResults.articles,
    roadmap.milestones,
    'article'
  );
  
  // Images are no longer used - removed from the system
  
  // Count real vs fallback content for accurate logging
  const realVideos = searchResults.videos.filter(v => v.type !== 'fallback').length;
  const realArticles = searchResults.articles.filter(a => a.type !== 'fallback').length;
  
  console.log(`[Search Service] Content distribution: ${realVideos}/${searchResults.videos.length} real videos, ${realArticles}/${searchResults.articles.length} real articles`);
  
  const enhancedMilestones = roadmap.milestones.map((milestone: any, index: number) => {
    // Get milestone-specific content from distribution
    const milestoneVideos = videoDistribution[index] || [];
    const milestoneArticles = articleDistribution[index] || [];
    
    // Ensure we have the configured number of videos and articles per milestone
    const milestoneVideos_config = [];
    const milestoneArticles_config = [];
    
    // Create video arrays based on configuration
    for (let i = 0; i < VIDEOS_PER_MILESTONE; i++) {
      milestoneVideos_config.push(milestoneVideos[i] || createFallbackContent(index, i, totalMilestones));
    }
    
    // Create article arrays based on configuration  
    for (let i = 0; i < ARTICLES_PER_MILESTONE; i++) {
      milestoneArticles_config.push(milestoneArticles[i] || createFallbackContent(index, VIDEOS_PER_MILESTONE + i, totalMilestones));
    }
    
    const realVideosCount = milestoneVideos_config.filter(v => v.type !== 'fallback').length;
    const realArticlesCount = milestoneArticles_config.filter(a => a.type !== 'fallback').length;
    
    console.log(`[Search Service] Milestone ${index + 1} ("${milestone.title}"): ${realVideosCount}/${VIDEOS_PER_MILESTONE} real videos, ${realArticlesCount}/${ARTICLES_PER_MILESTONE} real articles`);
    
    // Enhance existing resources with real content
    const enhancedResources = milestone.resources.map((resource: any, resourceIndex: number) => {
      if (resource.type === 'video') {
        // Map to one of the configured videos based on resource index
        const videoIndex = resourceIndex % VIDEOS_PER_MILESTONE;
        const milestoneVideo = milestoneVideos_config[videoIndex];
        
        if (milestoneVideo) {
          return {
            ...resource,
            title: milestoneVideo.title || resource.title,
            url: milestoneVideo.url === '#' ? '#' : `https://youtu.be/${milestoneVideo.id}`,
            description: milestoneVideo.description || resource.description,
            duration: milestoneVideo.duration || resource.duration,
            thumbnail: milestoneVideo.thumbnail?.medium || milestoneVideo.thumbnail?.default || resource.thumbnail || '',
            source: milestoneVideo.source || 'YouTube',
            qualityScore: milestoneVideo.qualityScore || 70
          };
        }
      }
      
      if (resource.type === 'article') {
        const articleIndex = resourceIndex % ARTICLES_PER_MILESTONE;
        const article = milestoneArticles_config[articleIndex];
        return {
          ...resource,
          title: article.title || resource.title,
          url: article.url || resource.url,
          description: article.description || resource.description,
          readingTime: article.readingTime || resource.readingTime,
          source: article.source || resource.source,
          qualityScore: article.qualityScore || 70
        };
      }
      
      return resource;
    });
    
    // Create complete milestone data with all content pre-populated
    return {
      ...milestone,
      resources: enhancedResources,
      // Pre-populate videos array for milestone pages
      videos: milestoneVideos_config.map((video: any) => ({
        id: video.id,
        title: video.title,
        url: video.url === '#' ? '#' : `https://youtu.be/${video.id}`,
        description: video.description,
        duration: video.duration,
        thumbnail: video.thumbnail?.medium || video.thumbnail?.default || '',
        source: video.source || 'YouTube',
        qualityScore: video.qualityScore || 70,
        type: video.type || 'real'
      })),
      // Pre-populate articles array for milestone pages
      articles: milestoneArticles_config.map((article: any) => ({
        id: article.id,
        title: article.title,
        url: article.url,
        description: article.description,
        readingTime: article.readingTime,
        source: article.source,
        qualityScore: article.qualityScore || 70,
        type: article.type || 'real'
      }))
    };
  });
  
  return {
    ...roadmap,
    milestones: enhancedMilestones,
    metadata: searchResults.metadata
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get search statistics for monitoring
 */
export function getSearchStats(searchResults: SearchResults) {
  return {
    totalVideos: searchResults.videos.length,
    totalArticles: searchResults.articles.length,
    totalContent: searchResults.videos.length + searchResults.articles.length,
    domain: searchResults.metadata.classification.domain,
    complexity: searchResults.metadata.classification.complexity,
    learningStyle: searchResults.metadata.contentOptimization.learningStyle,
    estimatedTime: searchResults.metadata.classification.estimatedTime
  };
}

/**
 * Validate search results
 */
export function validateSearchResults(searchResults: SearchResults): boolean {
  return !!(
    Array.isArray(searchResults.videos) &&
    Array.isArray(searchResults.articles) &&
    searchResults.metadata &&
    searchResults.metadata.searchQueries &&
    searchResults.metadata.contentOptimization &&
    searchResults.metadata.classification
  );
}
