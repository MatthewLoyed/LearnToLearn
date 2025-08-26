/**
 * YouTube Service for Skill Forge
 * Handles YouTube Data API v3 integration for educational video content
 * 
 * Features:
 * - Real YouTube Data API v3 integration
 * - Educational-focused video search
 * - Video metadata extraction (duration, views, likes)
 * - Channel information and subscriber counts
 * - Comprehensive error handling and fallbacks
 * - Rate limiting and quota management
 * 
 * QUALITY CONTROL SETTINGS:
 * Set ENABLE_QUALITY_FILTERING to false to disable all quality filtering
 * This will return all videos found without any quality scoring or filtering
 * 
 * TEMPORARILY DISABLED:
 * YouTube API integration is currently disabled in favor of direct browser search.
 * 
 * TO RE-ENABLE YOUTUBE API:
 * 1. Set ENABLE_YOUTUBE_API = true (line ~25)
 * 2. Ensure YOUTUBE_API_KEY is configured in environment variables
 * 3. The API will automatically start working again
 * 
 * CURRENT APPROACH:
 * Using direct browser search with educational-focused queries for better results
 * and no API limitations or rate limits.
 */

// ============================================================================
// YOUTUBE API CONFIGURATION
// ============================================================================

// Set to true to enable YouTube Data API integration
// Currently disabled in favor of direct browser search approach
const ENABLE_YOUTUBE_API = false;

// Set to false to disable all quality filtering and return all videos
// TODO: Set to false to test without quality filtering
const ENABLE_QUALITY_FILTERING = true;

// Quality thresholds (only used if ENABLE_QUALITY_FILTERING is true)
// OPTIMIZED: Skill-level specific view count thresholds
const QUALITY_CONFIG = {
  minQualityScore: 5,         // Lowered to 5 to ensure we get enough videos
  minViewCount: 1000000,      // 1M+ for beginner content only
  maxAgeInDays: 365 * 10,     // Increased from 5 to 10 years for more content
  requireCaptions: false,     // Whether to require captions
  maxResults: 10              // Maximum results to return
};

// Test configuration for bypassing quality filters
const TEST_CONFIG = {
  minViewCount: 1000000,        // At least 1M+ views for testing
  maxAgeInDays: 365 * 10,     // Up to 10 years old
  maxResults: 10              // Get 10 videos
};

import { 
  logAPI, 
  logSuccess, 
  logWarning, 
  logError,
  logContent,
  logAPICost,
  createTimer
} from '../../utils/logger';
import { DEFAULT_VIDEO_SEARCH_LIMIT } from '../../config/content-config';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface YouTubeSearchRequest {
  query: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxResults?: number;
  videoDuration?: 'short' | 'medium' | 'long';
  relevanceLanguage?: string;
  regionCode?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: {
    default: string;
    medium: string;
    high: string;
  };
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration?: string; // ISO 8601 duration (may be undefined for some videos)
  viewCount: number;
  likeCount: number;
  dislikeCount?: number;
  commentCount: number;
  tags: string[];
  categoryId: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
  liveBroadcastContent: 'none' | 'upcoming' | 'live';
  contentRating?: Record<string, string>;
  projection: 'rectangular' | '360';
  uploadStatus?: 'uploaded' | 'processed' | 'failed';
  privacyStatus?: 'private' | 'unlisted' | 'public';
  license?: 'youtube' | 'creativeCommon';
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids: boolean;
  topicCategories?: string[];
  recordingLocation?: string;
  recordingDate?: string;
  defaultTab?: string;
  topicDetails?: {
    topicIds: string[];
    relevantTopicIds: string[];
    topicCategories: string[];
  };
  player?: {
    embedHtml: string;
    embedHeight: number;
    embedWidth: number;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    dislikeCount?: string;
    favoriteCount: string;
    commentCount: string;
  };
  status?: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
  contentDetails?: {
    duration: string;
    dimension: {
      width: string;
      height: string;
    };
    definition: 'sd' | 'hd';
    caption: 'true' | 'false';
    licensedContent: boolean;
    contentRating?: Record<string, string>;
    projection: 'rectangular' | '360';
    hasCustomThumbnail?: boolean;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
      standard?: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: 'none' | 'upcoming' | 'live';
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
    defaultAudioLanguage?: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
  country?: string;
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
  topicCategories?: string[];
  topicIds?: string[];
  privacyStatus?: 'private' | 'unlisted' | 'public';
  keywords?: string;
  unsubscribedTrailer?: string;
  defaultLanguage?: string;
  defaultTab?: string;
  trackingAnalyticsAccountId?: string;
  managedByMe?: boolean;
  brandingSettings?: {
    channel: {
      title: string;
      description: string;
      keywords?: string;
      defaultTab?: string;
      trackingAnalyticsAccountId?: string;
      moderateComments?: boolean;
      showRelatedChannels?: boolean;
      showBrowseView?: boolean;
      featuredChannelsTitle?: string;
      featuredChannelsUrls?: string[];
      unsubscribedTrailer?: string;
      profileColor?: string;
      defaultLanguage?: string;
      country?: string;
    };
    image: {
      bannerExternalUrl?: string;
    };
    hints: Array<{
      property: string;
      value: string;
    }>;
  };
  contentDetails?: {
    relatedPlaylists: {
      likes: string;
      uploads: string;
    };
  };
  statistics?: {
    viewCount: string;
    commentCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
  status?: {
    privacyStatus: string;
    isLinked: boolean;
    longUploadsStatus: string;
    madeForKids: boolean;
    selfDeclaredMadeForKids: boolean;
  };
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    country?: string;
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  channels: YouTubeChannel[];
  playlists: any[]; // Not implemented yet
  totalResults: number;
  resultsPerPage: number;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeError {
  type: 'api_error' | 'quota_exceeded' | 'invalid_key' | 'service_unavailable' | 'parse_error';
  message: string;
  statusCode?: number;
  retryable: boolean;
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const YOUTUBE_CONFIG = {
  baseUrl: 'https://www.googleapis.com/youtube/v3',
  maxResults: 10,
  maxRetries: 3,
  retryDelay: 1000, // ms
  // Rate limiting and quota management
  maxRequestsPerMinute: 50, // YouTube API quota limit
  maxRequestsPerHour: 1000, // Conservative hourly limit
  maxDailyQuota: 10000, // Daily quota limit
} as const;

// Enhanced educational keywords for search query generation (Phase 1.2.3)
const EDUCATIONAL_KEYWORDS = {
  beginner: [
    'beginner', 'tutorial', 'basics', 'introduction', 'getting started', 'learn', 
    'step by step', 'fundamentals', 'first time', 'easy', 'simple', 'start here',
    'complete beginner', 'no experience', 'from scratch', 'basic concepts'
  ],
  intermediate: [
    'intermediate', 'advanced', 'deep dive', 'masterclass', 'expert', 'professional',
    'next level', 'building on', 'beyond basics', 'practical', 'real world',
    'hands-on', 'project-based', 'advanced concepts', 'best practices'
  ],
  advanced: [
    'advanced', 'expert', 'master', 'professional', 'enterprise', 'optimization',
    'production-ready', 'scalable', 'performance', 'architecture', 'design patterns',
    'system design', 'senior level', 'industry standard', 'enterprise grade'
  ]
} as const;

// Topic-specific educational keywords for different domains
const TOPIC_SPECIFIC_KEYWORDS = {
  programming: {
    general: ['coding', 'programming', 'development', 'software', 'code'],
    languages: ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
    frameworks: ['react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel'],
    concepts: ['algorithms', 'data structures', 'object-oriented', 'functional programming', 'async', 'promises'],
    tools: ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd']
  },
  design: {
    general: ['design', 'ui', 'ux', 'user interface', 'user experience'],
    tools: ['figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'invision'],
    concepts: ['wireframing', 'prototyping', 'user research', 'usability', 'accessibility']
  },
  business: {
    general: ['business', 'entrepreneurship', 'startup', 'marketing', 'finance'],
    concepts: ['strategy', 'leadership', 'management', 'analytics', 'growth hacking']
  },
  creative: {
    general: ['creative', 'art', 'music', 'photography', 'video', 'animation'],
    tools: ['premiere pro', 'after effects', 'blender', 'maya', 'cinema 4d']
  }
} as const;

// Content type keywords for different learning formats
const CONTENT_TYPE_KEYWORDS = {
  tutorial: ['tutorial', 'how to', 'guide', 'walkthrough', 'step by step'],
  course: ['course', 'class', 'lesson', 'lecture', 'curriculum', 'syllabus'],
  project: ['project', 'build', 'create', 'hands-on', 'practical', 'real-world'],
  explanation: ['explained', 'understand', 'concept', 'theory', 'fundamentals'],
  interview: ['interview', 'q&a', 'questions', 'answers', 'faq'],
  review: ['review', 'comparison', 'vs', 'versus', 'analysis', 'evaluation']
} as const;

// Fallback search strategies for when primary search fails
const FALLBACK_STRATEGIES = {
  broader: ['overview', 'introduction', 'basics', 'fundamentals'],
  practical: ['examples', 'demo', 'demonstration', 'practice', 'exercises'],
  popular: ['best', 'top', 'popular', 'trending', 'viral'],
  recent: ['latest', 'new', 'updated', '2024', '2023', 'recent'],
  comprehensive: ['complete', 'full', 'comprehensive', 'ultimate', 'definitive']
} as const;

// High-authority educational channels (partial list)
const EDUCATIONAL_CHANNELS = [
  'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
  'UCWv7vMbMWH4-V0ZXdmDpPBA', // Programming with Mosh
  'UCVTlvUkGslCV_h-nSAId8Sw', // CheatSheet
  'UCJ5v_MCY6GNUBTO8-D3XoAg', // Dev Ed
  'UCW5YeuERMmlnqo4oq8vwUpg', // The Net Ninja
  'UC29ju8bIPH5as8OGnQzwJyA', // Traversy Media
  'UCsT0YIqwnpJCM-mx7-gSA4Q', // TEDx Talks
  'UCJ24N4O0bP7LGLBDvye7oCA', // Computerphile
  'UCBa659QWEk1AI4Tg--mrJ2A', // Tom Scott
  'UCsBjURrPoezykLs9EqgamOA', // Fireship
] as const;

// In-memory rate limiting (in production, use Redis or database)
const rateLimitStore = {
  requests: [] as Array<{ timestamp: number; quotaUsed: number }>,
  
  addRequest(quotaUsed: number = 1) {
    const now = Date.now();
    this.requests.push({ timestamp: now, quotaUsed });
    
    // Clean up old requests (older than 1 hour)
    this.requests = this.requests.filter(req => now - req.timestamp < 60 * 60 * 1000);
  },
  
  getRequestsInLastMinute(): number {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    return this.requests.filter(req => req.timestamp > oneMinuteAgo).length;
  },
  
  getRequestsInLastHour(): number {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.requests.filter(req => req.timestamp > oneHourAgo).length;
  },
  
  getDailyQuotaUsed(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return this.requests
      .filter(req => req.timestamp > oneDayAgo)
      .reduce((total, req) => total + req.quotaUsed, 0);
  }
};

// ============================================================================
// QUALITY FILTERING FUNCTIONS (Phase 1.2.2)
// ============================================================================

/**
 * Enhanced video duration categorization
 */
export function categorizeVideoDuration(durationMinutes: number): 'micro' | 'short' | 'medium' | 'long' | 'extended' {
  if (durationMinutes < 3) return 'micro';
  if (durationMinutes < 10) return 'short'; 
  if (durationMinutes < 30) return 'medium';
  if (durationMinutes < 60) return 'long';
  return 'extended';
}

/**
 * Calculate engagement metrics score - PRIORITIZING VIEW COUNT
 */
export function calculateEngagementScore(video: YouTubeVideo): number {
  const viewCount = parseInt(video.statistics?.viewCount || '0');
  const likeCount = parseInt(video.statistics?.likeCount || '0');
  const commentCount = parseInt(video.statistics?.commentCount || '0');
  
  if (viewCount === 0) return 0;
  
  // View count score (0-60 points) - PRIORITIZED
  let viewScore = 0;
  if (viewCount >= 1000000) viewScore = 60;        // 1M+ views
  else if (viewCount >= 500000) viewScore = 55;    // 500K+ views
  else if (viewCount >= 100000) viewScore = 50;    // 100K+ views
  else if (viewCount >= 50000) viewScore = 45;     // 50K+ views
  else if (viewCount >= 10000) viewScore = 40;     // 10K+ views
  else if (viewCount >= 5000) viewScore = 35;      // 5K+ views
  else if (viewCount >= 1000) viewScore = 30;      // 1K+ views
  else viewScore = 20;                             // <1K views
  
  // Engagement rate score (0-40 points) - likes and comments
  const engagementRate = ((likeCount + commentCount) / viewCount) * 1000;
  const engagementScore = Math.min(Math.round(engagementRate * 8), 40);
  
  return viewScore + engagementScore;
}

/**
 * Calculate channel authority score based on multiple factors
 */
export function calculateChannelAuthorityScore(channel: YouTubeChannel | null, video: YouTubeVideo): number {
  if (!channel) return 0;
  
  let score = 0;
  
  const subscriberCount = parseInt(channel.statistics?.subscriberCount || '0');
  const videoCount = parseInt(channel.statistics?.videoCount || '0');
  const channelViewCount = parseInt(channel.statistics?.viewCount || '0');
  
  // Subscriber count (0-40 points)
  if (subscriberCount > 1000000) score += 40;
  else if (subscriberCount > 100000) score += 30;
  else if (subscriberCount > 10000) score += 20;
  else if (subscriberCount > 1000) score += 10;
  
  // Content volume and consistency (0-20 points)
  if (videoCount > 100) score += 20;
  else if (videoCount > 50) score += 15;
  else if (videoCount > 20) score += 10;
  else if (videoCount > 5) score += 5;
  
  // Channel view ratio (0-20 points)
  if (channelViewCount > 0 && videoCount > 0) {
    const avgViewsPerVideo = channelViewCount / videoCount;
    if (avgViewsPerVideo > 100000) score += 20;
    else if (avgViewsPerVideo > 10000) score += 15;
    else if (avgViewsPerVideo > 1000) score += 10;
    else if (avgViewsPerVideo > 100) score += 5;
  }
  
  // Content quality indicators (0-20 points) - broader than just educational
  const description = channel.snippet?.description?.toLowerCase() || '';
  const qualityKeywords = ['tutorial', 'guide', 'how to', 'learn', 'explained', 'tips', 'tricks', 'demo', 'example'];
  const keywordMatches = qualityKeywords.filter(keyword => description.includes(keyword)).length;
  score += Math.min(keywordMatches * 3, 20);
  
  return Math.min(score, 100);
}

/**
 * Create content quality prioritization score with heavy "how to" bias
 */
export function calculateEducationalPriorityScore(video: YouTubeVideo, channel: YouTubeChannel | null): number {
  let score = 0;
  
  // Title analysis with heavy "how to" bias (0-40 points)
  const title = video.title.toLowerCase();
  
  // HEAVY BIAS: "how to" gets maximum points
  if (title.includes('how to')) {
    score += 40;
  } else {
    // Other quality keywords get reduced points
    const qualityTitleKeywords = [
      'tutorial', 'guide', 'learn', 'explained', 'tips', 'tricks', 
      'demo', 'example', 'walkthrough', 'step by step', 'complete'
    ];
    const titleMatches = qualityTitleKeywords.filter(keyword => title.includes(keyword)).length;
    score += Math.min(titleMatches * 3, 20); // Reduced from 5 to 3 points each
  }
  
  // Description analysis (0-20 points)
  const description = video.description.toLowerCase();
  
  // HEAVY BIAS: "how to" in description gets bonus
  if (description.includes('how to')) {
    score += 15;
  }
  
  const qualityDescKeywords = [
    'learn', 'understand', 'master', 'practice', 'example', 
    'demonstration', 'walkthrough', 'comprehensive', 'detailed', 'show'
  ];
  const descMatches = qualityDescKeywords.filter(keyword => description.includes(keyword)).length;
  score += Math.min(descMatches * 1, 5); // Reduced points for non-"how to" content
  
  // Tags analysis (0-20 points) 
  const tags = video.tags || [];
  
  // HEAVY BIAS: "how to" in tags gets bonus
  const hasHowToTag = tags.some(tag => tag.toLowerCase().includes('how to'));
  if (hasHowToTag) {
    score += 15;
  }
  
  const qualityTagKeywords = [
    'tutorial', 'guide', 'tips', 'tricks', 'demo', 'example',
    'learn', 'explained', 'walkthrough', 'complete'
  ];
  const tagMatches = tags.filter(tag => 
    qualityTagKeywords.some(keyword => tag.toLowerCase().includes(keyword))
  ).length;
  score += Math.min(tagMatches * 1, 5); // Reduced points for non-"how to" content
  
  // Category check removed - no longer filtering by category
  
  // Channel quality indicators (0-20 points)
  if (channel) {
    const channelDesc = (channel.snippet?.description || '').toLowerCase();
    if (channelDesc.includes('how to') || channelDesc.includes('tutorial')) {
      score += 20;
    } else if (channelDesc.includes('guide') || channelDesc.includes('tips')) {
      score += 10;
    }
  }
  
  return Math.min(score, 100);
}

/**
 * Calculate relevance score based on learning objectives
 */
export function calculateRelevanceScore(video: YouTubeVideo, searchQuery: string, skillLevel?: string): number {
  let score = 0;
  const query = searchQuery.toLowerCase();
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  
  // Direct keyword matching (0-40 points)
  const queryWords = query.split(' ').filter(word => word.length > 2);
  let titleMatches = 0;
  let descMatches = 0;
  
  queryWords.forEach(word => {
    if (title.includes(word)) titleMatches++;
    if (description.includes(word)) descMatches++;
  });
  
  score += Math.min((titleMatches / queryWords.length) * 30, 30); // Title relevance
  score += Math.min((descMatches / queryWords.length) * 10, 10);  // Description relevance
  
  // Skill level alignment (0-25 points)
  if (skillLevel) {
    const skillKeywords = {
      'beginner': ['beginner', 'basic', 'intro', 'starting', 'first', 'simple', 'easy'],
      'intermediate': ['intermediate', 'advanced', 'next level', 'building on', 'deeper'],
      'advanced': ['advanced', 'expert', 'master', 'professional', 'complex', 'sophisticated']
    };
    
    const levelKeywords = skillKeywords[skillLevel as keyof typeof skillKeywords] || [];
    const levelMatches = levelKeywords.filter(keyword => 
      title.includes(keyword) || description.includes(keyword)
    ).length;
    score += Math.min(levelMatches * 5, 25);
  }
  
  // Content structure indicators (0-20 points)
  const structureKeywords = [
    'part 1', 'episode', 'chapter', 'section', 'module', 'lesson', 
    'step 1', 'complete guide', 'full course', 'comprehensive'
  ];
  const structureMatches = structureKeywords.filter(keyword => 
    title.includes(keyword) || description.includes(keyword)
  ).length;
  score += Math.min(structureMatches * 4, 20);
  
  // Practical application indicators (0-15 points)
  const practicalKeywords = [
    'example', 'demo', 'build', 'create', 'project', 'hands-on', 
    'practice', 'exercise', 'workshop', 'lab'
  ];
  const practicalMatches = practicalKeywords.filter(keyword => 
    title.includes(keyword) || description.includes(keyword)
  ).length;
  score += Math.min(practicalMatches * 3, 15);
  
  return Math.min(score, 100);
}

/**
 * Enhanced comprehensive video quality score with all filtering criteria
 */
export function calculateComprehensiveQualityScore(
  video: YouTubeVideo, 
  channel: YouTubeChannel | null, 
  searchQuery: string,
  skillLevel?: string
): number {
  // Weight distribution for different aspects - PRIORITIZING VIEW COUNT
  const weights = {
    engagement: 0.35,      // 35% - User engagement metrics (view count, likes, comments)
    authority: 0.15,       // 15% - Channel authority and credibility  
    educational: 0.20,     // 20% - Educational content indicators
    relevance: 0.20,       // 20% - Search relevance and skill level match
    technical: 0.10        // 10% - Technical quality (duration, recency)
  };
  
  // Calculate individual scores
  const engagementScore = calculateEngagementScore(video);
  const authorityScore = calculateChannelAuthorityScore(channel, video);
  const educationalScore = calculateEducationalPriorityScore(video, channel);
  const relevanceScore = calculateRelevanceScore(video, searchQuery, skillLevel);
  
  // Technical quality score (existing logic)
  let technicalScore = 0;
  const durationMinutes = parseDurationToMinutes(video.duration);
  const durationCategory = categorizeVideoDuration(durationMinutes);
  
  // If duration is not available, estimate based on video metadata
  const estimatedDurationMinutes = durationMinutes === 0 ? estimateVideoDuration(video) : durationMinutes;
  const finalDurationCategory = durationMinutes === 0 ? categorizeVideoDuration(estimatedDurationMinutes) : durationCategory;
  
  // Duration scoring (prefer medium to long videos for learning)
  switch (finalDurationCategory) {
    case 'medium': technicalScore += 40; break;
    case 'long': technicalScore += 35; break;
    case 'short': technicalScore += 25; break;
    case 'extended': technicalScore += 20; break;
    case 'micro': technicalScore += 10; break;
  }
  
  // Recency bonus
  const publishedDate = new Date(video.publishedAt);
  const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 365) technicalScore += 30;
  else if (daysSincePublished < 730) technicalScore += 20;
  else if (daysSincePublished < 1095) technicalScore += 10;
  
  // Video quality indicators (HD, captions)
  if (video.contentDetails?.definition === 'hd') technicalScore += 15;
  if (video.contentDetails?.caption === 'true') technicalScore += 15;
  
  technicalScore = Math.min(technicalScore, 100);
  
  // Calculate weighted final score
  const finalScore = 
    (engagementScore * weights.engagement) +
    (authorityScore * weights.authority) +
    (educationalScore * weights.educational) +
    (relevanceScore * weights.relevance) +
    (technicalScore * weights.technical);
  
  return Math.round(Math.min(finalScore, 100));
}

/**
 * Get adaptive quality thresholds based on content availability and skill level
 */
function getAdaptiveThresholds(
  videos: YouTubeVideo[],
  options: {
    minQualityScore: number;
    minViewCount: number;
    maxAgeInDays: number;
    targetResults: number;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
) {
  const { minQualityScore, minViewCount, maxAgeInDays, targetResults, skillLevel } = options;
  
  // Skill-level specific view count thresholds
  let baseViewCount: number;
  switch (skillLevel) {
    case 'beginner':
      baseViewCount = 1000000; // 1M+ for beginner (high quality, popular content)
      break;
    case 'intermediate':
      baseViewCount = 100000;  // 100K+ for intermediate
      break;
    case 'advanced':
      baseViewCount = 50000;   // 50K+ for advanced (more niche content)
      break;
    default:
      baseViewCount = 100000;  // Default to 100K
  }
  
  // Check if we have enough high-quality videos that meet original thresholds
  const highQualityVideos = videos.filter(video => {
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    return viewCount >= minViewCount;
  });
  
  // If we have enough high-quality videos, use original thresholds
  if (highQualityVideos.length >= targetResults) {
    return { minQualityScore, minViewCount, maxAgeInDays };
  }
  
  // If we have some videos but not enough high-quality ones, relax thresholds moderately
  if (videos.length >= targetResults) {
    return {
      minQualityScore: Math.max(2, minQualityScore * 0.7), // Reduce by 30%
      minViewCount: Math.max(baseViewCount * 0.5, baseViewCount * 0.5), // Reduce by 50% but respect skill level
      maxAgeInDays: maxAgeInDays * 1.5                     // Increase by 50%
    };
  }
  
  // If we have very few videos, use very relaxed thresholds
  return {
    minQualityScore: Math.max(1, minQualityScore * 0.5),   // Reduce by 50%
    minViewCount: Math.max(baseViewCount * 0.3, baseViewCount * 0.3), // Reduce by 70% but respect skill level
    maxAgeInDays: maxAgeInDays * 2                         // Double the age limit
  };
}

/**
 * Filter videos based on quality criteria
 */
export function filterVideosByQuality(
  videos: YouTubeVideo[], 
  channels: YouTubeChannel[],
  searchQuery: string,
  options: {
    minQualityScore?: number;
    maxResults?: number;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    preferredDuration?: 'short' | 'medium' | 'long';
    requireCaptions?: boolean;
    minViewCount?: number;
    maxAgeInDays?: number;
  } = {}
): YouTubeVideo[] {
  // If quality filtering is disabled, return all videos without filtering
  if (!ENABLE_QUALITY_FILTERING) {
    logWarning('YouTube', 'Quality filtering disabled - returning all videos without filtering');
    return videos.slice(0, options.maxResults || QUALITY_CONFIG.maxResults);
  }

  const {
    minQualityScore = QUALITY_CONFIG.minQualityScore,
    maxResults = QUALITY_CONFIG.maxResults,
    skillLevel,
    preferredDuration,
    requireCaptions = QUALITY_CONFIG.requireCaptions,
    minViewCount = QUALITY_CONFIG.minViewCount,
    maxAgeInDays = QUALITY_CONFIG.maxAgeInDays
  } = options;

  // Create channel lookup map
  const channelMap = new Map(channels.map(ch => [ch.id, ch]));
  
  // Apply adaptive quality filtering
  const adaptiveThresholds = getAdaptiveThresholds(videos, {
    minQualityScore,
    minViewCount,
    maxAgeInDays,
    targetResults: maxResults,
    skillLevel
  });

  // Count high-quality videos for debugging
  const highQualityCount = videos.filter(video => {
    const viewCount = parseInt(video.statistics?.viewCount || '0');
    return viewCount >= minViewCount;
  }).length;
  
  logSuccess('YouTube', 'Adaptive thresholds applied', {
    originalQualityScore: minQualityScore,
    adaptiveQualityScore: adaptiveThresholds.minQualityScore,
    originalViewCount: minViewCount,
    adaptiveViewCount: adaptiveThresholds.minViewCount,
    videosAvailable: videos.length,
    highQualityVideos: highQualityCount,
    targetResults: maxResults,
    skillLevel: skillLevel || 'unknown'
  });
  
  return videos
    .map(video => {
      const channel = channelMap.get(video.channelId);
      return { ...video, channel };
    })
    .filter(video => {
      // Quality score filter - calculate on the fly
      const qualityScore = calculateComprehensiveQualityScore(video, video.channel, searchQuery, skillLevel);
      if (qualityScore < adaptiveThresholds.minQualityScore) return false;
      
      // View count filter
      const viewCount = parseInt(video.statistics?.viewCount || '0');
      if (viewCount < adaptiveThresholds.minViewCount) return false;
      
      // Age filter
      const publishedDate = new Date(video.publishedAt);
      const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished > adaptiveThresholds.maxAgeInDays) return false;
      
      // Duration preference filter
      if (preferredDuration) {
        const durationMinutes = parseDurationToMinutes(video.duration);
        const category = categorizeVideoDuration(durationMinutes);
        if (category !== preferredDuration) return false;
      }
      
      // Captions requirement filter
      if (requireCaptions && video.contentDetails?.caption !== 'true') return false;
      
      return true;
    })
    .sort((a, b) => {
      const scoreA = calculateComprehensiveQualityScore(a, a.channel, searchQuery, skillLevel);
      const scoreB = calculateComprehensiveQualityScore(b, b.channel, searchQuery, skillLevel);
      return scoreB - scoreA;
    })
    .slice(0, maxResults);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert ISO 8601 duration to human-readable format
 */
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'Unknown';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format view count with appropriate suffix
 */
function formatViewCount(viewCount: string | number): string {
  const count = typeof viewCount === 'string' ? parseInt(viewCount) : viewCount;
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Enhanced search query generation with topic-specific optimization (Phase 1.2.3)
 */
function enhanceSearchQuery(
  query: string, 
  skillLevel?: 'beginner' | 'intermediate' | 'advanced',
  options?: {
    topic?: string;
    contentType?: 'tutorial' | 'course' | 'project' | 'explanation' | 'interview' | 'review';
    useFallback?: boolean;
    maxKeywords?: number;
  }
): string {
  let enhancedQuery = query.trim();
  
  // Early return for empty queries
  if (!enhancedQuery) {
    return 'tutorial learn guide';
  }
  
  const queryLower = enhancedQuery.toLowerCase();
  const maxKeywords = options?.maxKeywords || 3;
  let addedKeywords: string[] = [];
  
  // 1. Topic-specific keyword enhancement
  if (options?.topic) {
    const topicKeywords = TOPIC_SPECIFIC_KEYWORDS[options.topic as keyof typeof TOPIC_SPECIFIC_KEYWORDS];
    if (topicKeywords) {
      // Add general topic keywords if not already present
      const generalKeywords = topicKeywords.general || [];
      const relevantGeneral = generalKeywords.filter(keyword => 
        !queryLower.includes(keyword) && !addedKeywords.includes(keyword)
      );
      
      if (relevantGeneral.length > 0 && addedKeywords.length < maxKeywords) {
        const keyword = relevantGeneral[Math.floor(Math.random() * relevantGeneral.length)];
        enhancedQuery += ` ${keyword}`;
        addedKeywords.push(keyword);
      }
      
      // Add specific language/framework keywords if detected
      const specificCategories = ['languages', 'frameworks', 'concepts', 'tools'];
      for (const category of specificCategories) {
        if (topicKeywords[category as keyof typeof topicKeywords]) {
          const categoryKeywords = [...topicKeywords[category as keyof typeof topicKeywords]];
          const matchingKeywords = categoryKeywords.filter(keyword => 
            queryLower.includes(keyword) && !addedKeywords.includes(keyword)
          );
          
          if (matchingKeywords.length > 0 && addedKeywords.length < maxKeywords) {
            const keyword = matchingKeywords[0];
            enhancedQuery += ` ${keyword}`;
            addedKeywords.push(keyword);
            break; // Only add one category-specific keyword
          }
        }
      }
    }
  }
  
  // 2. Content type optimization
  if (options?.contentType && addedKeywords.length < maxKeywords) {
    const contentTypeKeywords = CONTENT_TYPE_KEYWORDS[options.contentType];
    const relevantContentKeywords = contentTypeKeywords.filter(keyword => 
      !queryLower.includes(keyword) && !addedKeywords.includes(keyword)
    );
    
    if (relevantContentKeywords.length > 0) {
      // Always add the first content type keyword to ensure it's included
      const keyword = relevantContentKeywords[0];
      enhancedQuery += ` ${keyword}`;
      addedKeywords.push(keyword);
    }
  }
  
  // 3. Skill level adaptation with intelligent keyword selection
  if (skillLevel && addedKeywords.length < maxKeywords) {
    const skillKeywords = EDUCATIONAL_KEYWORDS[skillLevel];
    const relevantSkillKeywords = skillKeywords.filter(keyword => 
      !queryLower.includes(keyword) && !addedKeywords.includes(keyword)
    );
    
    if (relevantSkillKeywords.length > 0) {
      // Prioritize certain keywords based on skill level and query content
      let priorityKeywords: readonly string[] = [];
      
      if (skillLevel === 'beginner') {
        priorityKeywords = ['tutorial', 'basics', 'introduction', 'learn', 'step by step'] as const;
      } else if (skillLevel === 'intermediate') {
        priorityKeywords = ['advanced', 'practical', 'hands-on', 'project-based'] as const;
      } else if (skillLevel === 'advanced') {
        priorityKeywords = ['expert', 'master', 'professional', 'enterprise'] as const;
      }
      
      // Try to add a priority keyword first
      const availablePriority = priorityKeywords.filter(keyword => 
        relevantSkillKeywords.includes(keyword as any)
      );
      
      if (availablePriority.length > 0) {
        const keyword = availablePriority[0];
        enhancedQuery += ` ${keyword}`;
        addedKeywords.push(keyword);
      } else {
        // Fall back to random relevant keyword
        const keyword = relevantSkillKeywords[Math.floor(Math.random() * relevantSkillKeywords.length)];
        enhancedQuery += ` ${keyword}`;
        addedKeywords.push(keyword);
      }
    }
  }
  
  // 4. Fallback strategy for broader search when needed
  if (options?.useFallback && addedKeywords.length < maxKeywords) {
    const fallbackCategories = Object.keys(FALLBACK_STRATEGIES) as Array<keyof typeof FALLBACK_STRATEGIES>;
    const selectedCategory = fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)];
    const fallbackKeywords = FALLBACK_STRATEGIES[selectedCategory];
    
    const relevantFallback = fallbackKeywords.filter(keyword => 
      !queryLower.includes(keyword) && !addedKeywords.includes(keyword)
    );
    
    if (relevantFallback.length > 0) {
      const keyword = relevantFallback[Math.floor(Math.random() * relevantFallback.length)];
      enhancedQuery += ` ${keyword}`;
      addedKeywords.push(keyword);
    }
  }
  
  // 5. Ensure basic educational context if no keywords were added
  if (addedKeywords.length === 0) {
    const basicEducational = ['tutorial', 'learn', 'guide'];
    const missingBasic = basicEducational.filter(keyword => !queryLower.includes(keyword));
    
    if (missingBasic.length > 0) {
      const keyword = missingBasic[0];
      enhancedQuery += ` ${keyword}`;
      addedKeywords.push(keyword);
    }
  }
  
  return enhancedQuery.trim();
}

/**
 * Generate multiple search query variations for better results
 */
function generateSearchQueryVariations(
  baseQuery: string,
  skillLevel?: 'beginner' | 'intermediate' | 'advanced',
  options?: {
    topic?: string;
    maxVariations?: number;
    includeFallbacks?: boolean;
  }
): string[] {
  const maxVariations = options?.maxVariations || 3;
  const variations: string[] = [];
  
  // Primary enhanced query
  const primaryQuery = enhanceSearchQuery(baseQuery, skillLevel, {
    topic: options?.topic,
    contentType: 'tutorial',
    maxKeywords: 2
  });
  variations.push(primaryQuery);
  
  // Course-focused variation
  if (variations.length < maxVariations) {
    const courseQuery = enhanceSearchQuery(baseQuery, skillLevel, {
      topic: options?.topic,
      contentType: 'course',
      maxKeywords: 2
    });
    if (courseQuery !== primaryQuery) {
      variations.push(courseQuery);
    }
  }
  
  // Project-focused variation
  if (variations.length < maxVariations) {
    const projectQuery = enhanceSearchQuery(baseQuery, skillLevel, {
      topic: options?.topic,
      contentType: 'project',
      maxKeywords: 2
    });
    if (projectQuery !== primaryQuery && !variations.includes(projectQuery)) {
      variations.push(projectQuery);
    }
  }
  
  // Fallback variations if requested
  if (options?.includeFallbacks && variations.length < maxVariations) {
    const fallbackQuery = enhanceSearchQuery(baseQuery, skillLevel, {
      topic: options?.topic,
      useFallback: true,
      maxKeywords: 2
    });
    if (!variations.includes(fallbackQuery)) {
      variations.push(fallbackQuery);
    }
  }
  
  return variations.slice(0, maxVariations);
}

/**
 * Detect topic from query for intelligent keyword enhancement
 */
function detectTopicFromQuery(query: string): string | null {
  if (!query || typeof query !== 'string') {
    return null;
  }
  const queryLower = query.toLowerCase();
  
  // Programming topics (highest priority) - expanded to catch more programming terms
  if (queryLower.includes('javascript') || queryLower.includes('js') || 
      queryLower.includes('react') || queryLower.includes('vue') || 
      queryLower.includes('angular') || queryLower.includes('node') ||
      queryLower.includes('python') || queryLower.includes('java') || 
      queryLower.includes('c++') || queryLower.includes('c#') || 
      queryLower.includes('php') || queryLower.includes('ruby') ||
      queryLower.includes('git') || queryLower.includes('docker') || 
      queryLower.includes('aws') || queryLower.includes('database') || 
      queryLower.includes('api') || queryLower.includes('algorithm') ||
      queryLower.includes('data structures') || queryLower.includes('data structure') ||
      queryLower.includes('programming') || queryLower.includes('coding') ||
      queryLower.includes('software') || queryLower.includes('development') ||
      queryLower.includes('computer science') || queryLower.includes('cs') ||
      queryLower.includes('backend') || queryLower.includes('frontend') ||
      queryLower.includes('fullstack') || queryLower.includes('full stack')) {
    return 'programming';
  }
  
  // Business topics (check before design to avoid conflicts)
  if (queryLower.includes('business') || queryLower.includes('startup') || 
      queryLower.includes('marketing') || queryLower.includes('finance') || 
      queryLower.includes('entrepreneur')) {
    return 'business';
  }
  
  // Design topics (more specific to avoid conflicts)
  if (queryLower.includes('ui design') || queryLower.includes('ux design') || 
      queryLower.includes('user interface') || queryLower.includes('user experience') ||
      queryLower.includes('figma') || queryLower.includes('sketch') || 
      queryLower.includes('photoshop') || queryLower.includes('illustrator') ||
      (queryLower.includes('design') && !queryLower.includes('system design') && !queryLower.includes('data structure'))) {
    return 'design';
  }
  
  // Creative topics (check specific terms to avoid conflicts)
  if (queryLower.includes('digital art') || queryLower.includes('music production') || 
      queryLower.includes('photography') || queryLower.includes('video editing') || 
      queryLower.includes('animation') || queryLower.includes('creative') ||
      (queryLower.includes('art') && !queryLower.includes('algorithm') && !queryLower.includes('artificial') && !queryLower.includes('smart') && !queryLower.includes('part'))) {
    return 'creative';
  }
  
  return null;
}

/**
 * Calculate video quality score based on various metrics
 */
function calculateVideoQualityScore(video: YouTubeVideo): number {
  let score = 0;
  
  // View count (0-30 points)
  const viewCount = parseInt(video.statistics?.viewCount || '0');
  if (viewCount > 1000000) score += 30;
  else if (viewCount > 100000) score += 20;
  else if (viewCount > 10000) score += 10;
  
  // Like ratio (0-25 points)
  const likeCount = parseInt(video.statistics?.likeCount || '0');
  const dislikeCount = parseInt(video.statistics?.dislikeCount || '0');
  const totalReactions = likeCount + dislikeCount;
  if (totalReactions > 0) {
    const likeRatio = likeCount / totalReactions;
    score += Math.round(likeRatio * 25);
  }
  
  // Channel authority (0-20 points)
  if (EDUCATIONAL_CHANNELS.includes(video.channelId as any)) {
    score += 20;
  }
  
  // Duration (0-15 points) - prefer medium length videos
  const durationMinutes = parseDurationToMinutes(video.duration);
  if (durationMinutes >= 5 && durationMinutes <= 30) score += 15;
  else if (durationMinutes > 30 && durationMinutes <= 60) score += 10;
  else if (durationMinutes > 1 && durationMinutes < 5) score += 5;
  
  // Recency (0-10 points)
  const publishedDate = new Date(video.publishedAt);
  const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 365) score += 10;
  else if (daysSincePublished < 730) score += 5;
  
  return Math.min(score, 100);
}

/**
 * Parse duration string to minutes
 */
function parseDurationToMinutes(duration: string | undefined): number {
  // Handle undefined or empty duration gracefully
  if (!duration || typeof duration !== 'string' || duration.trim() === '') {
    // Only log in development to avoid spam in production
    if (process.env.NODE_ENV === 'development') {
              // Duration not available - using default
    }
    return 0;
  }
  
  // Parse ISO 8601 duration format (PT1H2M3S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    // Log malformed duration strings for debugging
    if (process.env.NODE_ENV === 'development') {
              // Could not parse duration format
    }
    return 0;
  }
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
  
  // Log successful parsing in development
  if (process.env.NODE_ENV === 'development' && totalMinutes > 0) {
            // Duration parsed successfully
  }
  
  return totalMinutes;
}

/**
 * Estimate video duration when not available from API
 * Uses video metadata to make intelligent estimates
 */
function estimateVideoDuration(video: YouTubeVideo): number {
  // If we have a valid duration, use it
  if (video.duration) {
    const parsed = parseDurationToMinutes(video.duration);
    if (parsed > 0) return parsed;
  }
  
  // Estimate based on video title and description
  const title = video.title.toLowerCase();
  const description = video.description.toLowerCase();
  const fullText = `${title} ${description}`;
  
  // Keywords that suggest longer content
  const longContentKeywords = [
    'tutorial', 'course', 'lesson', 'guide', 'complete', 'full', 'comprehensive',
    'masterclass', 'deep dive', 'in depth', 'detailed', 'step by step', 'series'
  ];
  
  // Keywords that suggest shorter content
  const shortContentKeywords = [
    'quick', 'fast', 'brief', 'overview', 'intro', 'basics', 'tips', 'tricks',
    'summary', 'recap', 'explained', 'demo', 'example'
  ];
  
  // Count keyword matches
  const longMatches = longContentKeywords.filter(keyword => fullText.includes(keyword)).length;
  const shortMatches = shortContentKeywords.filter(keyword => fullText.includes(keyword)).length;
  
  // Estimate duration based on keyword analysis
  if (longMatches > shortMatches) {
    // More long-content keywords - estimate 15-30 minutes
    return Math.floor(Math.random() * 15) + 15; // 15-30 minutes
  } else if (shortMatches > longMatches) {
    // More short-content keywords - estimate 3-10 minutes
    return Math.floor(Math.random() * 7) + 3; // 3-10 minutes
  } else {
    // Mixed or no clear indicators - estimate 8-15 minutes (default)
    return Math.floor(Math.random() * 7) + 8; // 8-15 minutes
  }
}

// ============================================================================
// AI-ENHANCED QUERY GENERATION
// ============================================================================

/**
 * Enhance search queries using AI for better results
 * Uses hardcoded base queries but optimizes them with ChatGPT
 */
async function enhanceQueryWithAI(
  baseQuery: string, 
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
): Promise<string> {
  // Hardcoded base queries per skill level
  const baseQueries = {
    beginner: [
      'tutorial beginner introduction',
      'basics learn step by step',
      'for complete beginners'
    ],
    intermediate: [
      'intermediate tutorial advanced',
      'practical examples hands-on',
      'project-based learning'
    ],
    advanced: [
      'complete course full tutorial',
      'masterclass expert guide',
      'comprehensive deep dive'
    ]
  };

  const levelQueries = baseQueries[skillLevel || 'beginner'];
  const selectedQuery = levelQueries[Math.floor(Math.random() * levelQueries.length)];
  
  // Combine base query with skill-level specific terms
  const combinedQuery = `${baseQuery} ${selectedQuery}`;
  
  // If OpenAI is available, enhance the query
  if (process.env.OPENAI_API_KEY) {
    try {
      const enhancedQuery = await enhanceQueryWithOpenAI(combinedQuery, skillLevel);
      return enhancedQuery;
    } catch (error) {
              // OpenAI enhancement failed, using base query
      return combinedQuery;
    }
  }
  
  return combinedQuery;
}

/**
 * Use OpenAI to enhance search queries for better YouTube results
 */
async function enhanceQueryWithOpenAI(
  query: string, 
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
): Promise<string> {
  const prompt = `You are a YouTube search optimization expert. Enhance this search query to find the best educational videos on YouTube.

Original query: "${query}"
Skill level: ${skillLevel || 'beginner'}

Requirements:
- Keep it concise (max 6-8 words)
- Focus on educational content, not entertainment
- Include terms that indicate quality (tutorial, guide, course, etc.)
- Be specific to avoid irrelevant content (e.g., "3 ball juggling" not just "juggling")
- Avoid terms that might return entertainment content
- Make it specific enough to find relevant content

Examples:
- "juggling" → "3 ball juggling tutorial beginner"
- "javascript" → "javascript programming tutorial beginner"
- "cooking" → "home cooking basics tutorial"

Return ONLY the enhanced query, nothing else.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedQuery = data.choices[0]?.message?.content?.trim();
    
    if (enhancedQuery && enhancedQuery.length > 0) {
              console.log(`🔍 Enhanced query: "${query}" → "${enhancedQuery}"`);
      return enhancedQuery;
    }
    
    return query; // Fallback to original query
  } catch (error) {
            // OpenAI enhancement failed
    return query; // Fallback to original query
  }
}

// ============================================================================
// CORE YOUTUBE SERVICE FUNCTIONS
// ============================================================================

/**
 * Check if YouTube API is enabled
 */
function isYouTubeAPIEnabled(): boolean {
  if (!ENABLE_YOUTUBE_API) {
    console.log('🔌 YouTube API is disabled - using browser search approach instead');
    return false;
  }
  return true;
}

/**
 * Search for educational videos on YouTube
 */
export async function searchYouTubeVideos(request: YouTubeSearchRequest): Promise<YouTubeSearchResponse> {
  // Early return if API is disabled
  if (!isYouTubeAPIEnabled()) {
    return {
      videos: [],
      channels: [],
      playlists: [],
      totalResults: 0,
      resultsPerPage: 0,
      nextPageToken: undefined,
      prevPageToken: undefined,
      regionCode: 'US',
      pageInfo: {
        totalResults: 0,
        resultsPerPage: 0
      }
    };
  }
  const startTime = Date.now();
  
  try {
    // Validate API key
    if (!process.env.YOUTUBE_API_KEY) {
              console.warn('⚠️ YOUTUBE_API_KEY not found, using mock data');
      return getMockYouTubeResponse(request);
    }

    // Rate limiting and quota checks
    const requestsPerMinute = rateLimitStore.getRequestsInLastMinute();
    const requestsPerHour = rateLimitStore.getRequestsInLastHour();
    const dailyQuota = rateLimitStore.getDailyQuotaUsed();
    
    if (requestsPerMinute >= YOUTUBE_CONFIG.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded: Too many requests per minute');
    }
    
    if (requestsPerHour >= YOUTUBE_CONFIG.maxRequestsPerHour) {
      throw new Error('Quota exceeded: Too many requests per hour');
    }
    
    if (dailyQuota >= YOUTUBE_CONFIG.maxDailyQuota) {
      throw new Error('Daily quota limit exceeded');
    }

    logContent('YouTube', 'video', 'Search strategy', {
      original: request.query,
      skillLevel: request.skillLevel,
      maxResults: request.maxResults || YOUTUBE_CONFIG.maxResults
    });
    
    // Search YouTube with single query to get all requested videos
    const searchResult = await searchYouTubeWithSingleQuery(
      request.query || '',
      request.skillLevel,
      request.maxResults || YOUTUBE_CONFIG.maxResults
    );
    
    const { videos: allVideos, totalQueries, totalCost } = searchResult;

    // Get channel information for educational scoring
    const channelIds = [...new Set(allVideos.map(video => video.channelId))] as string[];
    const channelDetails = await getChannelDetails(channelIds);
    const finalTotalCost = totalCost + 1; // Channel details costs 1 quota unit
    
    // Apply comprehensive quality filtering (Phase 1.2.2)
    const enhancedVideos = filterVideosByQuality(
      allVideos,
      channelDetails,
      request.query || '',
      {
        minQualityScore: QUALITY_CONFIG.minQualityScore,
        maxResults: request.maxResults || QUALITY_CONFIG.maxResults,
        skillLevel: request.skillLevel,
        preferredDuration: request.videoDuration,
        requireCaptions: QUALITY_CONFIG.requireCaptions,
        minViewCount: QUALITY_CONFIG.minViewCount,
        maxAgeInDays: QUALITY_CONFIG.maxAgeInDays
      }
    );

    // Add detailed channel information for backward compatibility
    const compatibleVideos = enhancedVideos.map(video => {
      const channelInfo = channelDetails.find(channel => channel.id === video.channelId);
      return {
        ...video,
        channel: channelInfo ? {
          id: channelInfo.id,
          title: channelInfo.snippet.title,
          subscriberCount: channelInfo.statistics?.subscriberCount || '0',
          viewCount: channelInfo.statistics?.viewCount || '0',
          videoCount: channelInfo.statistics?.videoCount || '0',
          isEducational: EDUCATIONAL_CHANNELS.includes(channelInfo.id as any)
        } : null
      };
    });

    // Track usage for rate limiting
    rateLimitStore.addRequest(finalTotalCost); // Total cost of API calls
    
    logSuccess('YouTube', 'Search completed successfully', {
      query: request.query,
      results: compatibleVideos.length,
      generationTime: Date.now() - startTime,
      quotaUsed: finalTotalCost,
      totalQueries
    });

    return {
      videos: compatibleVideos,
      channels: channelDetails,
      playlists: [],
      totalResults: allVideos.length, // Total results from all queries
      resultsPerPage: request.maxResults || YOUTUBE_CONFIG.maxResults,
      nextPageToken: undefined, // No pagination in this new approach
      prevPageToken: undefined,
      regionCode: 'US', // Default region
      pageInfo: {
        totalResults: allVideos.length,
        resultsPerPage: request.maxResults || YOUTUBE_CONFIG.maxResults
      }
    };

  } catch (error) {
    logError('YouTube', 'Search failed', error);
    
    // Return mock data on error
    logWarning('YouTube', 'Using mock data due to error');
    return getMockYouTubeResponse(request);
  }
}

/**
 * Get detailed video information
 */
async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
  if (videoIds.length === 0) return [];

  try {
    const videoParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics,status',
      id: videoIds.join(','),
      key: process.env.YOUTUBE_API_KEY!
    });

    const videoUrl = `${YOUTUBE_CONFIG.baseUrl}/videos?${videoParams.toString()}`;
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      const error = await handleYouTubeError(videoResponse);
      throw new Error(error.message);
    }

    const videoData = await videoResponse.json();
    
    if (!videoData.items || !Array.isArray(videoData.items)) {
      throw new Error('Invalid video response structure from YouTube API');
    }

    // Track usage for rate limiting
    rateLimitStore.addRequest(1); // Video details request costs 1 quota unit

    return videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: {
        default: item.snippet.thumbnails.default?.url || '',
        medium: item.snippet.thumbnails.medium?.url || '',
        high: item.snippet.thumbnails.high?.url || ''
      },
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration || undefined,
      viewCount: parseInt(item.statistics?.viewCount || '0'),
      likeCount: parseInt(item.statistics?.likeCount || '0'),
      dislikeCount: parseInt(item.statistics?.dislikeCount || '0'),
      commentCount: parseInt(item.statistics?.commentCount || '0'),
      tags: item.snippet.tags || [],
      categoryId: item.snippet.categoryId,
      defaultLanguage: item.snippet.defaultLanguage,
      defaultAudioLanguage: item.snippet.defaultAudioLanguage,
      liveBroadcastContent: item.snippet.liveBroadcastContent,
      contentRating: item.contentDetails?.contentRating,
      projection: item.contentDetails?.projection || 'rectangular',
      uploadStatus: item.status?.uploadStatus,
      privacyStatus: item.status?.privacyStatus,
      license: item.status?.license,
      embeddable: item.status?.embeddable || false,
      publicStatsViewable: item.status?.publicStatsViewable || false,
      madeForKids: item.status?.madeForKids || false,
      topicCategories: item.topicDetails?.topicCategories,
      recordingLocation: item.recordingDetails?.locationDescription,
      recordingDate: item.recordingDetails?.recordingDate,
      defaultTab: item.brandingSettings?.channel?.defaultTab,
      topicDetails: item.topicDetails,
      player: item.player,
      statistics: item.statistics,
      status: item.status,
      contentDetails: item.contentDetails,
      snippet: item.snippet,
      qualityScore: calculateVideoQualityScore(item) // Add quality score for sorting
    }));

  } catch (error) {
    console.error('❌ Failed to get video details:', error);
    throw error;
  }
}

/**
 * Get channel information
 */
async function getChannelDetails(channelIds: string[]): Promise<YouTubeChannel[]> {
  if (channelIds.length === 0) return [];

  try {
    const channelParams = new URLSearchParams({
      part: 'snippet,statistics,brandingSettings,contentDetails,status',
      id: channelIds.join(','),
      key: process.env.YOUTUBE_API_KEY!
    });

    const channelUrl = `${YOUTUBE_CONFIG.baseUrl}/channels?${channelParams.toString()}`;
    const channelResponse = await fetch(channelUrl);
    
    if (!channelResponse.ok) {
      const error = await handleYouTubeError(channelResponse);
      throw new Error(error.message);
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || !Array.isArray(channelData.items)) {
      throw new Error('Invalid channel response structure from YouTube API');
    }

    // Track usage for rate limiting
    rateLimitStore.addRequest(1); // Channel details request costs 1 quota unit

    return channelData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      customUrl: item.snippet.customUrl,
      publishedAt: item.snippet.publishedAt,
      thumbnails: {
        default: item.snippet.thumbnails.default,
        medium: item.snippet.thumbnails.medium,
        high: item.snippet.thumbnails.high
      },
      country: item.snippet.country,
      viewCount: item.statistics?.viewCount || '0',
      subscriberCount: item.statistics?.subscriberCount || '0',
      hiddenSubscriberCount: item.statistics?.hiddenSubscriberCount || false,
      videoCount: item.statistics?.videoCount || '0',
      topicCategories: item.topicDetails?.topicCategories,
      topicIds: item.topicDetails?.topicIds,
      privacyStatus: item.status?.privacyStatus,
      keywords: item.brandingSettings?.channel?.keywords,
      unsubscribedTrailer: item.brandingSettings?.channel?.unsubscribedTrailer,
      defaultLanguage: item.snippet.defaultLanguage,
      defaultTab: item.brandingSettings?.channel?.defaultTab,
      trackingAnalyticsAccountId: item.brandingSettings?.channel?.trackingAnalyticsAccountId,
      managedByMe: item.status?.managedByMe,
      brandingSettings: item.brandingSettings,
      contentDetails: item.contentDetails,
      statistics: item.statistics,
      status: item.status,
      snippet: item.snippet
    }));

  } catch (error) {
    console.error('❌ Failed to get channel details:', error);
    throw error;
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle YouTube API errors
 */
async function handleYouTubeError(response: Response): Promise<YouTubeError> {
  const errorData = await response.text();
  console.error('YouTube API error:', response.status, response.statusText);
  console.error('Error details:', errorData);
  
  let error: YouTubeError;
  
  switch (response.status) {
    case 400:
      error = {
        type: 'api_error',
        message: 'Invalid YouTube API request',
        statusCode: response.status,
        retryable: false
      };
      break;
      
    case 401:
      error = {
        type: 'invalid_key',
        message: 'Invalid YouTube API key',
        statusCode: response.status,
        retryable: false
      };
      break;
      
    case 403:
      error = {
        type: 'quota_exceeded',
        message: 'YouTube API quota exceeded',
        statusCode: response.status,
        retryable: false
      };
      break;
      
    case 429:
      error = {
        type: 'quota_exceeded',
        message: 'YouTube API rate limit exceeded',
        statusCode: response.status,
        retryable: true
      };
      break;
      
    case 500:
    case 502:
    case 503:
    case 504:
      error = {
        type: 'service_unavailable',
        message: 'YouTube service temporarily unavailable',
        statusCode: response.status,
        retryable: true
      };
      break;
      
    default:
      error = {
        type: 'api_error',
        message: `YouTube API error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
        retryable: response.status >= 500
      };
  }
  
  return error;
}

// ============================================================================
// QUOTA AND USAGE MONITORING
// ============================================================================

/**
 * Get current usage statistics
 */
export function getYouTubeUsageStats() {
  return {
    requestsPerMinute: rateLimitStore.getRequestsInLastMinute(),
    requestsPerHour: rateLimitStore.getRequestsInLastHour(),
    dailyQuotaUsed: rateLimitStore.getDailyQuotaUsed(),
    maxRequestsPerMinute: YOUTUBE_CONFIG.maxRequestsPerMinute,
    maxRequestsPerHour: YOUTUBE_CONFIG.maxRequestsPerHour,
    maxDailyQuota: YOUTUBE_CONFIG.maxDailyQuota
  };
}

/**
 * Check if usage is within limits
 */
export function checkYouTubeUsageLimits(): { withinLimits: boolean; warnings: string[] } {
  const stats = getYouTubeUsageStats();
  const warnings: string[] = [];
  
  if (stats.requestsPerMinute >= stats.maxRequestsPerMinute * 0.8) {
    warnings.push('Approaching YouTube rate limit (80% of minute limit)');
  }
  
  if (stats.requestsPerHour >= stats.maxRequestsPerHour * 0.8) {
    warnings.push('Approaching YouTube hourly quota (80% of hour limit)');
  }
  
  if (stats.dailyQuotaUsed >= stats.maxDailyQuota * 0.8) {
    warnings.push('Approaching YouTube daily quota (80% of daily limit)');
  }
  
  return {
    withinLimits: warnings.length === 0,
    warnings
  };
}

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

/**
 * Generate mock YouTube response when API key is not available
 */
function getMockYouTubeResponse(request: YouTubeSearchRequest): YouTubeSearchResponse {
  const query = request.query?.toLowerCase() || 'tutorial';
  const skillLevel = request.skillLevel || 'beginner';
  
  // Generate topic-appropriate mock videos
  const mockVideos: YouTubeVideo[] = [
    {
      id: 'mock-video-1',
      title: `Complete ${query} Tutorial for ${skillLevel === 'beginner' ? 'Beginners' : skillLevel === 'intermediate' ? 'Intermediate' : 'Advanced'}`,
      description: `Learn ${query} from scratch with this comprehensive tutorial. Perfect for ${skillLevel} level learners.`,
      thumbnail: {
        default: 'https://via.placeholder.com/120x90',
        medium: 'https://via.placeholder.com/320x180',
        high: 'https://via.placeholder.com/480x360'
      },
      channelTitle: 'Learning Channel',
      channelId: 'mock-channel-1',
      publishedAt: new Date().toISOString(),
      duration: 'PT15M30S',
      viewCount: 15000,
      likeCount: 850,
      commentCount: 120,
      tags: [query, 'tutorial', skillLevel, 'learning'],
      categoryId: '27', // Education
      liveBroadcastContent: 'none',
      embeddable: true,
      publicStatsViewable: true,
      madeForKids: false,
      projection: 'rectangular',
      snippet: {
        publishedAt: new Date().toISOString(),
        channelId: 'mock-channel-1',
        title: `Complete ${query} Tutorial for ${skillLevel === 'beginner' ? 'Beginners' : skillLevel === 'intermediate' ? 'Intermediate' : 'Advanced'}`,
        description: `Learn ${query} from scratch with this comprehensive tutorial. Perfect for ${skillLevel} level learners.`,
        thumbnails: {
          default: { url: 'https://via.placeholder.com/120x90', width: 120, height: 90 },
          medium: { url: 'https://via.placeholder.com/320x180', width: 320, height: 180 },
          high: { url: 'https://via.placeholder.com/480x360', width: 480, height: 360 }
        },
        channelTitle: 'Learning Channel',
        tags: [query, 'tutorial', skillLevel, 'learning'],
        categoryId: '27',
        liveBroadcastContent: 'none'
      }
    },
    {
      id: 'mock-video-2',
      title: `${query} Tips and Tricks - ${skillLevel} Guide`,
      description: `Advanced tips and techniques for mastering ${query}. Essential knowledge for ${skillLevel} learners.`,
      thumbnail: {
        default: 'https://via.placeholder.com/120x90',
        medium: 'https://via.placeholder.com/320x180',
        high: 'https://via.placeholder.com/480x360'
      },
      channelTitle: 'Expert Tutorials',
      channelId: 'mock-channel-2',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      duration: 'PT22M15S',
      viewCount: 8500,
      likeCount: 420,
      commentCount: 65,
      tags: [query, 'tips', skillLevel, 'advanced'],
      categoryId: '27', // Education
      liveBroadcastContent: 'none',
      embeddable: true,
      publicStatsViewable: true,
      madeForKids: false,
      projection: 'rectangular',
      snippet: {
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        channelId: 'mock-channel-2',
        title: `${query} Tips and Tricks - ${skillLevel} Guide`,
        description: `Advanced tips and techniques for mastering ${query}. Essential knowledge for ${skillLevel} learners.`,
        thumbnails: {
          default: { url: 'https://via.placeholder.com/120x90', width: 120, height: 90 },
          medium: { url: 'https://via.placeholder.com/320x180', width: 320, height: 180 },
          high: { url: 'https://via.placeholder.com/480x360', width: 480, height: 360 }
        },
        channelTitle: 'Expert Tutorials',
        tags: [query, 'tips', skillLevel, 'advanced'],
        categoryId: '27',
        liveBroadcastContent: 'none'
      }
    }
  ];
  
  return {
    videos: mockVideos.slice(0, request.maxResults || 5),
    channels: [],
    playlists: [],
    totalResults: mockVideos.length,
    resultsPerPage: request.maxResults || 5,
    nextPageToken: undefined,
    prevPageToken: undefined,
    regionCode: 'US',
    pageInfo: {
      totalResults: mockVideos.length,
      resultsPerPage: request.maxResults || 5
    }
  };
}

/**
 * Generate multiple focused search queries for better results
 */
function generateFocusedSearchQueries(
  baseQuery: string,
  skillLevel?: 'beginner' | 'intermediate' | 'advanced',
  options?: {
    topic?: string;
    maxQueries?: number;
  }
): string[] {
  const maxQueries = options?.maxQueries || 3;
  const queries: string[] = [];
  
  // Clean the base query - remove common filler words
  const cleanQuery = baseQuery
    .replace(/\b(how to|learn|tutorial|fundamentals|techniques|advanced|guide)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Generate focused queries based on skill level
  if (skillLevel === 'beginner') {
    // Beginner-focused queries (no "advanced" terms)
    queries.push(`${cleanQuery} tutorial for beginners`);
    queries.push(`${cleanQuery} basics step by step`);
    queries.push(`${cleanQuery} introduction course`);
  } else if (skillLevel === 'intermediate') {
    // Intermediate-focused queries
    queries.push(`${cleanQuery} intermediate tutorial`);
    queries.push(`${cleanQuery} practical examples`);
    queries.push(`${cleanQuery} hands-on guide`);
  } else if (skillLevel === 'advanced') {
    // Advanced-focused queries
    queries.push(`${cleanQuery} advanced tutorial`);
    queries.push(`${cleanQuery} expert techniques`);
    queries.push(`${cleanQuery} masterclass`);
  } else {
    // Default queries (beginner-friendly)
    queries.push(`${cleanQuery} tutorial`);
    queries.push(`${cleanQuery} guide`);
    queries.push(`${cleanQuery} course`);
  }
  
  // Add topic-specific variations if topic is detected
  if (options?.topic === 'programming') {
    if (queries.length < maxQueries) {
      queries.push(`${cleanQuery} coding tutorial`);
    }
    if (queries.length < maxQueries) {
      queries.push(`${cleanQuery} programming examples`);
    }
  }
  
  return queries.slice(0, maxQueries);
}

/**
 * Test function to get YouTube videos with minimal filtering
 * Bypasses all quality filters except basic view count
 */
export async function testYouTubeVideoDiscovery(
  topic: string,
  skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<{ videos: YouTubeVideo[]; totalQueries: number; totalCost: number }> {
  // Early return if API is disabled
  if (!isYouTubeAPIEnabled()) {
    console.log('🧪 TEST: YouTube API is disabled - using browser search approach instead');
    return { videos: [], totalQueries: 0, totalCost: 0 };
  }

  console.log(`🧪 TEST: YouTube video discovery for "${topic}" (${skillLevel})`);
  
  const allVideos: YouTubeVideo[] = [];
  let totalCost = 0;
  
  try {
    // Generate educational-focused query to avoid Shorts
    const cleanTopic = topic.replace(/^how to /i, ''); // Remove "how to" if already present
    const testQuery = `${cleanTopic} tutorial course guide lesson`;
    console.log(`🧪 TEST: Using educational query "${testQuery}"`);
    
    // Try different duration strategies to find the best content
    const durationStrategies = [
      { duration: 'medium', description: 'Medium videos (4-20 min)' },
      { duration: 'long', description: 'Long videos (20+ min)' },
      { duration: undefined, description: 'Any duration' }
    ];
    
    for (const strategy of durationStrategies) {
      console.log(`🧪 TEST: Trying ${strategy.description}`);
      
      // Build search parameters for this query - OPTIMIZED FOR REGULAR VIDEOS
      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: testQuery,
        type: 'video',
        maxResults: '25', // Get more results to filter from
        key: process.env.YOUTUBE_API_KEY,
        relevanceLanguage: 'en', // English only
        regionCode: 'US', // US region for better educational content
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        videoDefinition: 'high', // Prefer HD videos
        order: 'viewCount' // Use view count to prioritize popular content
        // REMOVED: videoLicense to get more content
      });
      
            // Add duration filter if specified
      if (strategy.duration) {
        searchParams.append('videoDuration', strategy.duration);
      }

      // Make search request
      const searchUrl = `${YOUTUBE_CONFIG.baseUrl}/search?${searchParams.toString()}`;
      console.log(`🧪 TEST: Searching URL: ${searchUrl.replace(process.env.YOUTUBE_API_KEY!, '[API_KEY]')}`);
      
      const searchResponse = await fetch(searchUrl);
      totalCost += 2; // Search costs 2 quota units

      if (!searchResponse.ok) {
        console.log(`🧪 TEST: Strategy ${strategy.description} failed, trying next...`);
        continue;
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        console.log(`🧪 TEST: No videos found for ${strategy.description}`);
        continue;
      }

      console.log(`🧪 TEST: Found ${searchData.items.length} videos with ${strategy.description}`);

      // Get video IDs
      const videoIds = searchData.items.map((item: any) => item.id.videoId);
      
      // Get detailed video information
      const detailsParams = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
        key: process.env.YOUTUBE_API_KEY
      });

      const detailsUrl = `${YOUTUBE_CONFIG.baseUrl}/videos?${detailsParams.toString()}`;
      const detailsResponse = await fetch(detailsUrl);
      totalCost += 1; // Details costs 1 quota unit

      if (!detailsResponse.ok) {
        console.log(`🧪 TEST: Failed to get video details for ${strategy.description}`);
        continue;
      }

      const detailsData = await detailsResponse.json();
      
      if (!detailsData.items || detailsData.items.length === 0) {
        console.log(`🧪 TEST: No video details found for ${strategy.description}`);
        continue;
      }

      console.log(`🧪 TEST: Retrieved details for ${detailsData.items.length} videos with ${strategy.description}`);

      // Process videos directly without getVideoDetails() - SIMPLIFIED
      const processedVideos = detailsData.items
        .map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: {
            default: item.snippet.thumbnails.default?.url || '',
            medium: item.snippet.thumbnails.medium?.url || '',
            high: item.snippet.thumbnails.high?.url || ''
          },
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
          duration: item.contentDetails?.duration || undefined,
          viewCount: parseInt(item.statistics?.viewCount || '0'),
          likeCount: parseInt(item.statistics?.likeCount || '0'),
          dislikeCount: parseInt(item.statistics?.dislikeCount || '0'),
          commentCount: parseInt(item.statistics?.commentCount || '0'),
          tags: item.snippet.tags || [],
          categoryId: item.snippet.categoryId,
          defaultLanguage: item.snippet.defaultLanguage,
          defaultAudioLanguage: item.snippet.defaultAudioLanguage,
          liveBroadcastContent: item.snippet.liveBroadcastContent,
          contentRating: item.contentDetails?.contentRating,
          projection: item.contentDetails?.projection || 'rectangular',
          uploadStatus: item.status?.uploadStatus,
          privacyStatus: item.status?.privacyStatus,
          license: item.status?.license,
          embeddable: item.status?.embeddable || false,
          publicStatsViewable: item.status?.publicStatsViewable || false,
          madeForKids: item.status?.madeForKids || false,
          topicCategories: item.topicDetails?.topicCategories,
          recordingLocation: item.recordingDetails?.locationDescription,
          recordingDate: item.recordingDetails?.recordingDate,
          defaultTab: item.brandingSettings?.channel?.defaultTab,
          topicDetails: item.topicDetails,
          player: item.player,
          statistics: item.statistics,
          status: item.status,
          contentDetails: item.contentDetails,
          snippet: item.snippet
        } as YouTubeVideo))
        .filter((video: YouTubeVideo) => {
          // Enhanced Shorts detection
          const title = video.title.toLowerCase();
          const description = video.description?.toLowerCase() || '';
          const duration = video.duration;
          const durationMinutes = parseDurationToMinutes(duration);
          const viewCount = parseInt(video.statistics?.viewCount || '0');
          
          const isShorts = title.includes('#shorts') || 
                          title.includes('short') ||
                          description.includes('#shorts') ||
                          duration === 'PT0M0S' || // 0 seconds duration
                          durationMinutes < 1 || // Less than 1 minute
                          title.includes('tiktok') ||
                          title.includes('reel') ||
                          title.includes('viral') ||
                          (durationMinutes >= 1 && durationMinutes <= 3 && title.includes('quick')) || // Quick tips under 3 minutes
                          (durationMinutes >= 1 && durationMinutes <= 3 && (title.includes('tip') || title.includes('hack'))) || // Tips/hacks under 3 minutes
                          (durationMinutes >= 1 && durationMinutes <= 5 && viewCount > 10000000); // High-view videos under 5 minutes (likely viral)
          
          // Only filter by view count and age
          const publishedDate = new Date(video.publishedAt);
          const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
          
          const passesViewCount = viewCount >= TEST_CONFIG.minViewCount;
          const passesAge = daysSincePublished <= TEST_CONFIG.maxAgeInDays;
          const passesShortsFilter = !isShorts;
          
          console.log(`🧪 TEST: Video "${video.title}" - ${formatViewCount(viewCount)} views, ${Math.round(daysSincePublished)} days old, ${durationMinutes}min, ${isShorts ? 'SHORTS' : 'Regular'} - View: ${passesViewCount}, Age: ${passesAge}, NotShorts: ${passesShortsFilter}`);
          
          return passesViewCount && passesAge && passesShortsFilter;
        });

      // Add to all videos
      allVideos.push(...processedVideos);
      
      // If we found enough good videos, stop searching
      if (allVideos.length >= TEST_CONFIG.maxResults) {
        console.log(`🧪 TEST: Found enough videos (${allVideos.length}), stopping search`);
        break;
      }
    }

    // Take the best videos from all strategies
    const finalVideos = allVideos
      .sort((a, b) => parseInt(b.statistics?.viewCount || '0') - parseInt(a.statistics?.viewCount || '0'))
      .slice(0, TEST_CONFIG.maxResults);

    console.log(`🧪 TEST: Final result: ${finalVideos.length} videos from all strategies`);
    
    // Log each video for debugging
    finalVideos.forEach((video, index) => {
      const viewCount = parseInt(video.statistics?.viewCount || '0');
      console.log(`🧪 TEST: ${index + 1}. "${video.title}" - ${formatViewCount(viewCount)} views - ${video.channelTitle}`);
    });

    return {
      videos: finalVideos,
      totalQueries: durationStrategies.length,
      totalCost
    };

  } catch (error) {
    console.error(`🧪 TEST: Error in YouTube video discovery:`, error);
    return {
      videos: [],
      totalQueries: 1,
      totalCost
    };
  }
}

/**
 * Search YouTube with single query to get all requested videos
 */
async function searchYouTubeWithSingleQuery(
  baseQuery: string,
  skillLevel?: 'beginner' | 'intermediate' | 'advanced',
  maxResults: number = DEFAULT_VIDEO_SEARCH_LIMIT
): Promise<{ videos: YouTubeVideo[]; totalQueries: number; totalCost: number }> {
  const allVideos: YouTubeVideo[] = [];
  let totalCost = 0;
  
          console.log(`🔍 Single query search: "${baseQuery}"`);
  
  try {
    // Generate AI-enhanced query for better results
    const enhancedQuery = await enhanceQueryWithAI(baseQuery, skillLevel);
    
    // Build search parameters for this query
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: enhancedQuery,
      type: 'video',
      maxResults: maxResults.toString(), // Get all requested videos from single query
      key: process.env.YOUTUBE_API_KEY,
      relevanceLanguage: 'en',
      regionCode: 'US',
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
      videoLicense: 'creativeCommon',
      order: 'viewCount', // Use view count to prioritize popular content
      // Removed videoCategoryId filter to allow content from any category
    });

    // Make search request
    const searchUrl = `${YOUTUBE_CONFIG.baseUrl}/search?${searchParams.toString()}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const error = await handleYouTubeError(searchResponse);
      console.warn(`  ❌ Query failed: ${error.message}`);
      return { videos: [], totalQueries: 1, totalCost: 0 };
    }

    const searchData = await searchResponse.json();
    totalCost = totalCost + 1; // Each search costs 1 quota unit
    
    if (searchData.items && Array.isArray(searchData.items)) {
      // Extract video IDs for detailed information
      const videoIds = searchData.items.map((item: any) => item.id.videoId);
      
      if (videoIds.length > 0) {
        // Get detailed video information
        const videoDetails = await getVideoDetails(videoIds);
        totalCost = totalCost + 1; // Video details costs 1 quota unit
        
        // Add all videos found
        for (const video of videoDetails) {
          allVideos.push(video);
        }
        
        console.log(`  ✅ Found ${videoDetails.length} videos`);
      }
    }
    
  } catch (error) {
    console.warn(`  ❌ Query failed: ${error}`);
  }
  
  logAPICost('YouTube', `${totalCost} quota units`);
  
  return {
    videos: allVideos,
    totalQueries: 1,
    totalCost
  };
}

/**
 * Search YouTube with multiple focused queries and aggregate results
 */
async function searchYouTubeWithMultipleQueries(
  baseQuery: string,
  skillLevel?: 'beginner' | 'intermediate' | 'advanced',
  maxResults: number = DEFAULT_VIDEO_SEARCH_LIMIT
): Promise<{ videos: YouTubeVideo[]; totalQueries: number; totalCost: number }> {
  const focusedQueries = generateFocusedSearchQueries(baseQuery, skillLevel);
  const allVideos: YouTubeVideo[] = [];
  let totalCost = 0;
  
          console.log(`🔍 Using ${focusedQueries.length} focused queries`);
  
  for (const query of focusedQueries) {
    try {
      console.log(`  📺 "${query}"`);
      
      // Build search parameters for this specific query
      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: Math.ceil(maxResults / focusedQueries.length).toString(), // Distribute results across queries
        key: process.env.YOUTUBE_API_KEY,
        relevanceLanguage: 'en',
        regionCode: 'US',
        videoEmbeddable: 'true',
                  videoSyndicated: 'true',
          videoLicense: 'creativeCommon',
          order: 'viewCount',
          // Removed videoCategoryId filter to allow content from any category
      });

      // Make search request
      const searchUrl = `${YOUTUBE_CONFIG.baseUrl}/search?${searchParams.toString()}`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        const error = await handleYouTubeError(searchResponse);
        console.warn(`  ❌ Query failed: ${error.message}`);
        continue;
      }

      const searchData = await searchResponse.json();
      totalCost = totalCost + 1; // Each search costs 1 quota unit
      
      if (searchData.items && Array.isArray(searchData.items)) {
        // Extract video IDs for detailed information
        const videoIds = searchData.items.map((item: any) => item.id.videoId);
        
        if (videoIds.length > 0) {
          // Get detailed video information
          const videoDetails = await getVideoDetails(videoIds);
          totalCost = totalCost + 1; // Video details costs 1 quota unit
          
          // Add unique videos (avoid duplicates)
          for (const video of videoDetails) {
            if (!allVideos.find(v => v.id === video.id)) {
              allVideos.push(video);
            }
          }
          
          console.log(`  ✅ Found ${videoDetails.length} videos`);
        }
      }
      
    } catch (error) {
      console.warn(`  ❌ Query failed: ${error}`);
      continue;
    }
  }
  
  // Keep relevance ordering from search, just take top results
  const sortedVideos = allVideos.slice(0, maxResults);
  
  logAPICost('YouTube', `${totalCost} quota units`);
  
  return {
    videos: sortedVideos,
    totalQueries: focusedQueries.length,
    totalCost
  };
}

// ============================================================================
// EXPORT UTILITY FUNCTIONS
// ============================================================================

export {
  parseDuration,
  formatViewCount,
  enhanceSearchQuery,
  calculateVideoQualityScore,
  parseDurationToMinutes,
  estimateVideoDuration,
  // New Phase 1.2.3 functions
  generateSearchQueryVariations,
  detectTopicFromQuery
};

/**
 * Comprehensive test to identify YouTube Data API limitations
 * Compares API results with expected regular YouTube search behavior
 */
export async function debugYouTubeAPILimitations(
  topic: string
): Promise<{ apiResults: any; analysis: any; recommendations: string[] }> {
  // Early return if API is disabled
  if (!isYouTubeAPIEnabled()) {
    console.log('🔍 DEBUG: YouTube API is disabled - using browser search approach instead');
    return {
      apiResults: [],
      analysis: {
        searchQueries: [],
        apiResults: [],
        potentialIssues: ['YouTube API is disabled'],
        recommendations: ['Use browser search approach instead']
      },
      recommendations: ['YouTube API is disabled - use browser search instead']
    };
  }

  console.log(`🔍 DEBUG: Analyzing YouTube API limitations for "${topic}"`);
  
  const analysis = {
    searchQueries: [] as string[],
    apiResults: [] as any[],
    potentialIssues: [] as string[],
    recommendations: [] as string[]
  };

  // Test 1: Basic search without restrictions - GET FULL VIDEO DETAILS
  console.log(`🔍 DEBUG: Test 1 - Basic search with full video details`);
  const basicQuery = `how to ${topic}`;
  analysis.searchQueries.push(basicQuery);
  
  const basicParams = new URLSearchParams({
    part: 'snippet',
    q: basicQuery,
    type: 'video',
    maxResults: '10',
    key: process.env.YOUTUBE_API_KEY!,
    order: 'viewCount'
  });

  try {
    const basicResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/search?${basicParams.toString()}`);
    const basicData = await basicResponse.json();
    
    if (basicData.items) {
      console.log(`🔍 DEBUG: Basic search found ${basicData.items.length} videos`);
      
      // Get full video details including view counts
      const videoIds = basicData.items.map((item: any) => item.id.videoId);
      const detailsParams = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
        key: process.env.YOUTUBE_API_KEY!
      });
      
      const detailsResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/videos?${detailsParams.toString()}`);
      const detailsData = await detailsResponse.json();
      
      if (detailsData.items) {
        const videosWithStats = detailsData.items.map((item: any) => {
          const duration = item.contentDetails?.duration;
          const durationMinutes = parseDurationToMinutes(duration);
          const isShorts = item.snippet.title.toLowerCase().includes('#shorts') || 
                          item.snippet.title.toLowerCase().includes('short') ||
                          item.snippet.description?.toLowerCase().includes('#shorts') ||
                          duration === 'PT0M0S' || 
                          durationMinutes < 1;
          
          return {
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            viewCount: parseInt(item.statistics?.viewCount || '0'),
            likeCount: parseInt(item.statistics?.likeCount || '0'),
            commentCount: parseInt(item.statistics?.commentCount || '0'),
            duration: duration,
            durationMinutes: durationMinutes,
            isShorts: isShorts
          };
        });
        
        // Filter out Shorts for analysis
        const regularVideos = videosWithStats.filter(v => !v.isShorts);
        const shortsVideos = videosWithStats.filter(v => v.isShorts);
        
        console.log(`🔍 DEBUG: Found ${regularVideos.length} regular videos and ${shortsVideos.length} Shorts`);
        console.log(`🔍 DEBUG: Regular video view counts:`, regularVideos.map(v => `${v.viewCount.toLocaleString()} views`));
        console.log(`🔍 DEBUG: Shorts view counts:`, shortsVideos.map(v => `${v.viewCount.toLocaleString()} views`));
        
        if (regularVideos.length > 0) {
          const maxRegularViews = Math.max(...regularVideos.map(v => v.viewCount));
          console.log(`🔍 DEBUG: Highest regular video: ${maxRegularViews.toLocaleString()} views`);
        }
        
        analysis.apiResults.push({
          test: 'Basic Search with Details',
          query: basicQuery,
          results: basicData.items.length,
          videos: videosWithStats,
          maxViews: Math.max(...videosWithStats.map(v => v.viewCount)),
          minViews: Math.min(...videosWithStats.map(v => v.viewCount))
        });
      }
    }
  } catch (error) {
    analysis.potentialIssues.push(`Basic search failed: ${error}`);
  }

  // Test 2: Search with current restrictions
  console.log(`🔍 DEBUG: Test 2 - Search with current restrictions`);
  const restrictedParams = new URLSearchParams({
    part: 'snippet',
    q: basicQuery,
    type: 'video',
    maxResults: '10',
    key: process.env.YOUTUBE_API_KEY!,
    relevanceLanguage: 'en',
    regionCode: 'US',
    videoEmbeddable: 'true',
    videoSyndicated: 'true',
    videoLicense: 'creativeCommon',
    order: 'viewCount'
  });

  try {
    const restrictedResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/search?${restrictedParams.toString()}`);
    const restrictedData = await restrictedResponse.json();
    
    if (restrictedData.items) {
      console.log(`🔍 DEBUG: Restricted search found ${restrictedData.items.length} videos`);
      analysis.apiResults.push({
        test: 'Restricted Search',
        query: basicQuery,
        results: restrictedData.items.length,
        videos: restrictedData.items.map((item: any) => ({
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt
        }))
      });
    }
  } catch (error) {
    analysis.potentialIssues.push(`Restricted search failed: ${error}`);
  }

  // Test 3: Search with different order parameters
  console.log(`🔍 DEBUG: Test 3 - Search with different order parameters`);
  const orders = ['relevance', 'viewCount', 'rating', 'date'];
  
  for (const order of orders) {
    const orderParams = new URLSearchParams({
      part: 'snippet',
      q: basicQuery,
      type: 'video',
      maxResults: '5',
      key: process.env.YOUTUBE_API_KEY!,
      order: order
    });

    try {
      const orderResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/search?${orderParams.toString()}`);
      const orderData = await orderResponse.json();
      
      if (orderData.items) {
        console.log(`🔍 DEBUG: ${order} order found ${orderData.items.length} videos`);
        analysis.apiResults.push({
          test: `${order} Order`,
          query: basicQuery,
          results: orderData.items.length,
          videos: orderData.items.map((item: any) => ({
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
          }))
        });
      }
    } catch (error) {
      analysis.potentialIssues.push(`${order} order search failed: ${error}`);
    }
  }

  // Test 4: Search without videoLicense restriction
  console.log(`🔍 DEBUG: Test 4 - Search without videoLicense restriction`);
  const noLicenseParams = new URLSearchParams({
    part: 'snippet',
    q: basicQuery,
    type: 'video',
    maxResults: '10',
    key: process.env.YOUTUBE_API_KEY!,
    order: 'viewCount'
    // Removed videoLicense: 'creativeCommon'
  });

  try {
    const noLicenseResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/search?${noLicenseParams.toString()}`);
    const noLicenseData = await noLicenseResponse.json();
    
    if (noLicenseData.items) {
      console.log(`🔍 DEBUG: No license restriction found ${noLicenseData.items.length} videos`);
      analysis.apiResults.push({
        test: 'No License Restriction',
        query: basicQuery,
        results: noLicenseData.items.length,
        videos: noLicenseData.items.map((item: any) => ({
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt
        }))
      });
    }
  } catch (error) {
    analysis.potentialIssues.push(`No license search failed: ${error}`);
  }

  // Test 5: Search with broader region
  console.log(`🔍 DEBUG: Test 5 - Search with broader region`);
  const globalParams = new URLSearchParams({
    part: 'snippet',
    q: basicQuery,
    type: 'video',
    maxResults: '10',
    key: process.env.YOUTUBE_API_KEY!,
    order: 'viewCount'
    // Removed regionCode: 'US'
  });

  try {
    const globalResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/search?${globalParams.toString()}`);
    const globalData = await globalResponse.json();
    
    if (globalData.items) {
      console.log(`🔍 DEBUG: Global search found ${globalData.items.length} videos`);
      analysis.apiResults.push({
        test: 'Global Search',
        query: basicQuery,
        results: globalData.items.length,
        videos: globalData.items.map((item: any) => ({
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt
        }))
      });
    }
  } catch (error) {
    analysis.potentialIssues.push(`Global search failed: ${error}`);
  }

  // Test 6: Search for the specific high-view video we expect
  console.log(`🔍 DEBUG: Test 6 - Search for specific high-view content`);
  const specificQueries = [
    'how to read faster 4 million views',
    'speed reading tutorial high views',
    'read faster technique popular',
    'speed reading course most viewed'
  ];
  
  for (const specificQuery of specificQueries) {
    const specificParams = new URLSearchParams({
      part: 'snippet',
      q: specificQuery,
      type: 'video',
      maxResults: '5',
      key: process.env.YOUTUBE_API_KEY!,
      order: 'viewCount'
    });

    try {
      const specificResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/search?${specificParams.toString()}`);
      const specificData = await specificResponse.json();
      
      if (specificData.items && specificData.items.length > 0) {
        console.log(`🔍 DEBUG: Specific query "${specificQuery}" found ${specificData.items.length} videos`);
        
        // Get video details
        const videoIds = specificData.items.map((item: any) => item.id.videoId);
        const detailsParams = new URLSearchParams({
          part: 'snippet,statistics',
          id: videoIds.join(','),
          key: process.env.YOUTUBE_API_KEY!
        });
        
        const detailsResponse = await fetch(`${YOUTUBE_CONFIG.baseUrl}/videos?${detailsParams.toString()}`);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.items) {
          const videosWithStats = detailsData.items.map((item: any) => ({
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            viewCount: parseInt(item.statistics?.viewCount || '0')
          }));
          
          const maxViews = Math.max(...videosWithStats.map(v => v.viewCount));
          console.log(`🔍 DEBUG: "${specificQuery}" - Highest view count: ${maxViews.toLocaleString()}`);
          
          if (maxViews >= 4000000) {
            analysis.potentialIssues.push(`Found high-view video (${maxViews.toLocaleString()} views) with query "${specificQuery}"`);
          }
        }
      }
    } catch (error) {
      console.log(`🔍 DEBUG: Specific query "${specificQuery}" failed: ${error}`);
    }
  }

  // Analyze results and generate recommendations
  console.log(`🔍 DEBUG: Analyzing results...`);
  
  // Check if restrictions are reducing results
  const basicResults = analysis.apiResults.find(r => r.test === 'Basic Search')?.results || 0;
  const restrictedResults = analysis.apiResults.find(r => r.test === 'Restricted Search')?.results || 0;
  
  if (restrictedResults < basicResults) {
    analysis.potentialIssues.push(`Restrictions reduced results from ${basicResults} to ${restrictedResults}`);
    analysis.recommendations.push('Consider removing some restrictions to get more results');
  }

  // Check if videoLicense restriction is problematic
  const noLicenseResults = analysis.apiResults.find(r => r.test === 'No License Restriction')?.results || 0;
  if (noLicenseResults > restrictedResults) {
    analysis.potentialIssues.push(`videoLicense restriction reduced results from ${noLicenseResults} to ${restrictedResults}`);
    analysis.recommendations.push('Remove videoLicense: "creativeCommon" restriction - it may be too limiting');
  }

  // Check if region restriction is problematic
  const globalResults = analysis.apiResults.find(r => r.test === 'Global Search')?.results || 0;
  if (globalResults > restrictedResults) {
    analysis.potentialIssues.push(`regionCode restriction reduced results from ${globalResults} to ${restrictedResults}`);
    analysis.recommendations.push('Remove regionCode: "US" restriction - it may be excluding good content');
  }

  // Check if order parameter affects results
  const viewCountResults = analysis.apiResults.find(r => r.test === 'viewCount Order')?.results || 0;
  const relevanceResults = analysis.apiResults.find(r => r.test === 'relevance Order')?.results || 0;
  
  if (viewCountResults !== relevanceResults) {
    analysis.potentialIssues.push(`Order parameter affects results: viewCount=${viewCountResults}, relevance=${relevanceResults}`);
    analysis.recommendations.push('Consider using "relevance" order instead of "viewCount" for better content discovery');
  }

  // Analyze the actual view counts we're getting
  const basicResult = analysis.apiResults.find(r => r.test === 'Basic Search with Details');
  if (basicResult) {
    console.log(`🔍 DEBUG: Highest view count found: ${basicResult.maxViews.toLocaleString()}`);
    console.log(`🔍 DEBUG: Lowest view count found: ${basicResult.minViews.toLocaleString()}`);
    
    // Filter out Shorts for analysis
    const regularVideos = basicResult.videos.filter(v => !v.isShorts);
    const shortsVideos = basicResult.videos.filter(v => v.isShorts);
    
    if (regularVideos.length > 0) {
      const maxRegularViews = Math.max(...regularVideos.map(v => v.viewCount));
      console.log(`🔍 DEBUG: Highest regular video: ${maxRegularViews.toLocaleString()} views`);
      
      if (maxRegularViews < 1000000) {
        analysis.potentialIssues.push(`Highest regular video (${maxRegularViews.toLocaleString()}) is below 1M - API may not be finding the most popular videos`);
        analysis.recommendations.push('The YouTube Data API may not return the same high-view videos as regular YouTube search');
      }
      
      // Check if we're getting the expected 4M+ view video
      const hasHighViewVideo = regularVideos.some(v => v.viewCount >= 4000000);
      if (!hasHighViewVideo) {
        analysis.potentialIssues.push('No regular videos with 4M+ views found - the expected "how to read faster" video with 4M views is missing');
        analysis.recommendations.push('YouTube Data API search results differ significantly from regular YouTube search');
      }
    }
    
    if (shortsVideos.length > 0) {
      const maxShortsViews = Math.max(...shortsVideos.map(v => v.viewCount));
      console.log(`🔍 DEBUG: Highest Shorts video: ${maxShortsViews.toLocaleString()} views`);
      analysis.potentialIssues.push(`Found ${shortsVideos.length} Shorts videos with up to ${maxShortsViews.toLocaleString()} views - these should be filtered out`);
      analysis.recommendations.push('Filter out YouTube Shorts to get better quality educational content');
    }
  }

  // General recommendations
  analysis.recommendations.push('YouTube Data API may have different results than regular YouTube search');
  analysis.recommendations.push('API results are influenced by region, language, and content restrictions');
  analysis.recommendations.push('Consider testing with fewer restrictions to see if we can find better content');
  analysis.recommendations.push('The API may not return the same "most viewed" results as regular YouTube search');

  console.log(`🔍 DEBUG: Analysis complete`);
  console.log(`🔍 DEBUG: Potential issues:`, analysis.potentialIssues);
  console.log(`🔍 DEBUG: Recommendations:`, analysis.recommendations);

  return {
    apiResults: analysis.apiResults,
    analysis: analysis,
    recommendations: analysis.recommendations
  };
}
