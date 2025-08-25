/**
 * Content Quality Engine - Universal Learning Support
 * 
 * This engine provides quality assessment and ranking for educational content
 * across ALL domains and skills - from programming to cooking, music to business,
 * art to science, and everything in between.
 * 
 * @author Skill Forge Team
 * @version 1.0.0
 */

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface QualityMetrics {
  relevanceScore: number;        // 0-100: How relevant is content to the query
  authorityScore: number;        // 0-100: Source credibility and expertise
  freshnessScore: number;        // 0-100: How recent and up-to-date
  engagementScore: number;       // 0-100: User engagement indicators
  educationalValue: number;      // 0-100: Teaching quality and clarity
  overallQuality: number;        // 0-100: Weighted final score
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  domain: string;
  publishedAt?: string;
  contentType: 'video' | 'article' | 'course' | 'tutorial' | 'documentation' | 'guide' | 'book' | 'podcast';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  learningObjectives?: string[];
  duration?: string;
  language: string;
  tags: string[];
  metrics?: QualityMetrics;
}

export interface LearningContext {
  topic: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  learningGoals?: string[];
  timeAvailable?: number; // minutes
  preferredFormats?: Array<'video' | 'article' | 'interactive' | 'visual'>;
  currentKnowledge?: string[];
}

export interface QualityEngineOptions {
  weights?: QualityWeights;
  minQualityThreshold?: number;
  diversityFactor?: number;
  personalizedScoring?: boolean;
}

export interface QualityWeights {
  relevance: number;
  authority: number;
  freshness: number;
  engagement: number;
  educational: number;
}

// ============================================================================
// UNIVERSAL SKILL CATEGORIES AND PATTERNS
// ============================================================================

/**
 * Universal skill categories covering all areas of human learning
 */
const UNIVERSAL_SKILL_CATEGORIES = {
  // Creative Arts
  visual_arts: ['drawing', 'painting', 'sculpture', 'photography', 'graphic design', 'animation', 'digital art'],
  performing_arts: ['music', 'singing', 'dancing', 'theater', 'acting', 'comedy', 'public speaking'],
  creative_writing: ['writing', 'poetry', 'storytelling', 'screenwriting', 'blogging', 'journalism'],
  
  // Practical Skills
  cooking: ['cooking', 'baking', 'nutrition', 'meal planning', 'food safety', 'culinary arts'],
  crafts: ['woodworking', 'knitting', 'sewing', 'pottery', 'jewelry making', 'diy', 'crafting'],
  home_improvement: ['plumbing', 'electrical', 'carpentry', 'gardening', 'interior design', 'renovation'],
  
  // Physical & Health
  fitness: ['exercise', 'yoga', 'pilates', 'weightlifting', 'cardio', 'sports', 'martial arts'],
  health: ['nutrition', 'mental health', 'meditation', 'wellness', 'first aid', 'healthcare'],
  sports: ['basketball', 'soccer', 'tennis', 'swimming', 'running', 'cycling', 'team sports'],
  
  // Business & Professional
  business: ['entrepreneurship', 'marketing', 'sales', 'management', 'leadership', 'strategy'],
  finance: ['investing', 'budgeting', 'accounting', 'economics', 'cryptocurrency', 'financial planning'],
  career: ['resume writing', 'interviewing', 'networking', 'professional development', 'career change'],
  
  // Technology & Digital
  programming: ['javascript', 'python', 'web development', 'mobile development', 'data science'],
  digital_skills: ['computer basics', 'internet safety', 'social media', 'digital marketing', 'online tools'],
  design_tech: ['ux design', 'ui design', 'web design', 'app design', 'user research'],
  
  // Academic & Sciences
  mathematics: ['arithmetic', 'algebra', 'calculus', 'statistics', 'geometry', 'math basics'],
  sciences: ['biology', 'chemistry', 'physics', 'astronomy', 'environmental science', 'psychology'],
  humanities: ['history', 'philosophy', 'literature', 'cultural studies', 'anthropology'],
  
  // Languages & Communication
  languages: ['english', 'spanish', 'french', 'mandarin', 'japanese', 'german', 'language learning'],
  communication: ['public speaking', 'presentation skills', 'writing', 'listening', 'body language'],
  
  // Personal Development
  life_skills: ['time management', 'organization', 'goal setting', 'productivity', 'stress management'],
  relationships: ['parenting', 'relationship skills', 'social skills', 'conflict resolution'],
  mindfulness: ['meditation', 'mindfulness', 'self-awareness', 'emotional intelligence', 'spirituality'],
  
  // Hobbies & Recreation
  games: ['chess', 'board games', 'video games', 'puzzles', 'card games', 'trivia'],
  collecting: ['antiques', 'coins', 'stamps', 'art collecting', 'vintage items'],
  outdoor: ['camping', 'hiking', 'fishing', 'hunting', 'survival skills', 'nature'],
  
  // Specialized & Professional
  automotive: ['car repair', 'mechanics', 'driving', 'motorcycle', 'car maintenance'],
  education: ['teaching', 'tutoring', 'curriculum design', 'educational technology'],
  healthcare_professional: ['nursing', 'medical training', 'therapy', 'counseling', 'veterinary'],
  
  // Emerging & Modern
  sustainability: ['renewable energy', 'sustainable living', 'recycling', 'eco-friendly practices'],
  social_impact: ['volunteering', 'community organizing', 'social justice', 'nonprofit management']
};

/**
 * Universal learning indicators that apply across all domains
 */
const UNIVERSAL_LEARNING_INDICATORS = {
  educational_quality: [
    'step by step', 'tutorial', 'guide', 'how to', 'learn', 'course', 'lesson',
    'instruction', 'training', 'workshop', 'masterclass', 'beginner', 'advanced',
    'fundamentals', 'basics', 'comprehensive', 'complete', 'detailed'
  ],
  
  practical_value: [
    'hands-on', 'practical', 'real-world', 'example', 'demonstration', 'practice',
    'exercise', 'project', 'case study', 'application', 'implementation', 'tips',
    'techniques', 'methods', 'strategies', 'best practices'
  ],
  
  authority_indicators: [
    'expert', 'professional', 'certified', 'qualified', 'experienced', 'specialist',
    'master', 'instructor', 'teacher', 'coach', 'mentor', 'guru', 'authority',
    'renowned', 'acclaimed', 'award-winning', 'published', 'recognized'
  ],
  
  engagement_indicators: [
    'interactive', 'engaging', 'fun', 'easy', 'simple', 'clear', 'visual',
    'illustrated', 'animated', 'video', 'audio', 'podcast', 'live', 'session',
    'community', 'discussion', 'q&a', 'feedback', 'support'
  ]
};

/**
 * Quality scoring weights - default configuration
 */
export const DEFAULT_QUALITY_WEIGHTS: QualityWeights = {
  relevance: 0.35,    // 35% - Most important for learning
  educational: 0.25,  // 25% - Teaching quality
  authority: 0.20,    // 20% - Source credibility
  freshness: 0.15,    // 15% - Content recency
  engagement: 0.05    // 5% - User engagement
};

// ============================================================================
// CORE QUALITY ASSESSMENT FUNCTIONS
// ============================================================================

/**
 * Calculate relevance score based on query-content matching
 */
export function calculateRelevanceScore(
  content: ContentItem,
  context: LearningContext
): number {
  let score = 10; // Base score for all content
  const queryLower = context.topic.toLowerCase();
  const titleLower = content.title.toLowerCase();
  const descLower = content.description.toLowerCase();
  const tagsLower = content.tags.map(tag => tag.toLowerCase());
  
  // Exact topic match in title (highest relevance)
  if (titleLower.includes(queryLower)) {
    score += 50;
  }
  
  // Topic keywords in title (more generous scoring)
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  const titleMatches = queryWords.filter(word => titleLower.includes(word));
  score += (titleMatches.length / Math.max(queryWords.length, 1)) * 35;
  
  // Topic match in description
  if (descLower.includes(queryLower)) {
    score += 20;
  }
  
  // Keywords in description (more generous)
  const descMatches = queryWords.filter(word => descLower.includes(word));
  score += (descMatches.length / Math.max(queryWords.length, 1)) * 15;
  
  // Tag matches (improved matching)
  const tagMatches = tagsLower.filter(tag => 
    queryWords.some(word => 
      tag.includes(word) || 
      word.includes(tag) ||
      tag === word
    )
  );
  score += Math.min(tagMatches.length * 8, 20);
  
  // Semantic topic matching (cooking, music, fitness, etc.)
  const topicCategories = Object.keys(UNIVERSAL_SKILL_CATEGORIES);
  const matchingCategories = topicCategories.filter(category => {
    const categoryWords = UNIVERSAL_SKILL_CATEGORIES[category as keyof typeof UNIVERSAL_SKILL_CATEGORIES];
    return categoryWords.some(word => 
      queryLower.includes(word) || 
      titleLower.includes(word) ||
      tagsLower.some(tag => tag.includes(word))
    );
  });
  score += matchingCategories.length * 10;
  
  // Skill level alignment
  if (context.skillLevel && content.skillLevel) {
    if (content.skillLevel === context.skillLevel || content.skillLevel === 'all-levels') {
      score += 15;
    } else if (
      (context.skillLevel === 'beginner' && content.skillLevel === 'intermediate') ||
      (context.skillLevel === 'intermediate' && content.skillLevel === 'advanced')
    ) {
      score += 8; // Slight stretch is okay
    }
  }
  
  // Learning objectives alignment (more generous)
  if (context.learningGoals && content.learningObjectives) {
    const goalMatches = context.learningGoals.filter(goal =>
      content.learningObjectives!.some(obj => 
        obj.toLowerCase().includes(goal.toLowerCase()) ||
        goal.toLowerCase().includes(obj.toLowerCase())
      )
    );
    score += Math.min(goalMatches.length * 5, 15);
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate authority score based on source credibility
 */
export function calculateAuthorityScore(content: ContentItem): number {
  let score = 50; // Base score
  
  const titleLower = content.title.toLowerCase();
  const descLower = content.description.toLowerCase();
  const domainLower = content.domain.toLowerCase();
  
  // High-authority domains (universal)
  const authorityDomains = [
    // Educational institutions
    '.edu', 'university', 'college', 'academy', 'institute',
    // Government and official sources
    '.gov', '.org', 'official', 'government',
    // Professional organizations
    'professional', 'association', 'society', 'council',
    // Established learning platforms
    'coursera', 'edx', 'udemy', 'khan', 'masterclass', 'skillshare',
    'youtube.com', 'vimeo.com', 'ted.com', 'tedx',
    // Subject-specific authorities vary by domain
    'wikipedia', 'britannica', 'national', 'international'
  ];
  
  // Check domain authority
  const domainAuthority = authorityDomains.filter(auth => 
    domainLower.includes(auth)
  ).length;
  score += Math.min(domainAuthority * 15, 30);
  
  // Check for authority indicators in content
  const authorityKeywords = UNIVERSAL_LEARNING_INDICATORS.authority_indicators;
  const titleAuthorityMatches = authorityKeywords.filter(keyword => 
    titleLower.includes(keyword)
  );
  const descAuthorityMatches = authorityKeywords.filter(keyword => 
    descLower.includes(keyword)
  );
  
  score += Math.min(titleAuthorityMatches.length * 5, 15);
  score += Math.min(descAuthorityMatches.length * 3, 10);
  
  // Professional/expert indicators
  const expertTerms = ['expert', 'professional', 'certified', 'master', 'phd', 'dr.'];
  const expertMatches = expertTerms.filter(term => 
    titleLower.includes(term) || descLower.includes(term)
  );
  score += Math.min(expertMatches.length * 5, 15);
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate freshness score based on publication date
 */
export function calculateFreshnessScore(content: ContentItem): number {
  if (!content.publishedAt) {
    return 50; // Neutral score for unknown dates
  }
  
  try {
    const publishDate = new Date(content.publishedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Future dates are suspicious
    if (daysDiff < 0) return 30;
    
    // Different freshness expectations for different content types
    let optimalDays: number;
    switch (content.contentType) {
      case 'article':
        optimalDays = 365; // Articles stay relevant for about a year
        break;
      case 'video':
        optimalDays = 730; // Videos stay relevant longer
        break;
      case 'course':
        optimalDays = 1095; // Courses stay relevant for ~3 years
        break;
      case 'book':
        optimalDays = 1825; // Books stay relevant for ~5 years
        break;
      case 'tutorial':
        optimalDays = 545; // Tutorials for ~1.5 years
        break;
      default:
        optimalDays = 730; // Default 2 years
    }
    
    // Calculate freshness with exponential decay
    if (daysDiff <= optimalDays) {
      return Math.round(100 * Math.exp(-daysDiff / (optimalDays * 0.5)));
    } else {
      return Math.round(20 * Math.exp(-(daysDiff - optimalDays) / (optimalDays * 2)));
    }
  } catch {
    return 50; // Neutral score for invalid dates
  }
}

/**
 * Calculate engagement score based on content characteristics
 */
export function calculateEngagementScore(content: ContentItem): number {
  let score = 50; // Base score
  
  const titleLower = content.title.toLowerCase();
  const descLower = content.description.toLowerCase();
  
  // Check for engagement indicators
  const engagementKeywords = UNIVERSAL_LEARNING_INDICATORS.engagement_indicators;
  const titleEngagementMatches = engagementKeywords.filter(keyword => 
    titleLower.includes(keyword)
  );
  const descEngagementMatches = engagementKeywords.filter(keyword => 
    descLower.includes(keyword)
  );
  
  score += Math.min(titleEngagementMatches.length * 8, 25);
  score += Math.min(descEngagementMatches.length * 5, 15);
  
  // Video content typically more engaging
  if (content.contentType === 'video') {
    score += 10;
  } else if (content.contentType === 'course') {
    score += 15; // Courses are structured and engaging
  }
  
  // Interactive content bonus
  if (titleLower.includes('interactive') || descLower.includes('interactive')) {
    score += 15;
  }
  
  // Duration appropriateness (if available)
  if (content.duration) {
    const durationLower = content.duration.toLowerCase();
    if (durationLower.includes('min') || durationLower.includes('hour')) {
      score += 5; // Good to have time estimates
    }
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate educational value score
 */
export function calculateEducationalValue(content: ContentItem): number {
  let score = 50; // Base score
  
  const titleLower = content.title.toLowerCase();
  const descLower = content.description.toLowerCase();
  
  // Check for educational quality indicators
  const educationalKeywords = UNIVERSAL_LEARNING_INDICATORS.educational_quality;
  const titleEducationalMatches = educationalKeywords.filter(keyword => 
    titleLower.includes(keyword)
  );
  const descEducationalMatches = educationalKeywords.filter(keyword => 
    descLower.includes(keyword)
  );
  
  score += Math.min(titleEducationalMatches.length * 6, 20);
  score += Math.min(descEducationalMatches.length * 4, 15);
  
  // Practical value indicators
  const practicalKeywords = UNIVERSAL_LEARNING_INDICATORS.practical_value;
  const titlePracticalMatches = practicalKeywords.filter(keyword => 
    titleLower.includes(keyword)
  );
  const descPracticalMatches = practicalKeywords.filter(keyword => 
    descLower.includes(keyword)
  );
  
  score += Math.min(titlePracticalMatches.length * 5, 15);
  score += Math.min(descPracticalMatches.length * 3, 10);
  
  // Structured learning content bonus
  const structuredTerms = ['course', 'curriculum', 'syllabus', 'module', 'chapter', 'lesson'];
  const structuredMatches = structuredTerms.filter(term => 
    titleLower.includes(term) || descLower.includes(term)
  );
  score += Math.min(structuredMatches.length * 8, 20);
  
  // Learning objectives bonus
  if (content.learningObjectives && content.learningObjectives.length > 0) {
    score += Math.min(content.learningObjectives.length * 3, 15);
  }
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate overall quality score using weighted metrics
 */
export function calculateOverallQuality(
  metrics: Omit<QualityMetrics, 'overallQuality'>,
  weights: QualityWeights = DEFAULT_QUALITY_WEIGHTS
): number {
  const weightedScore = 
    (metrics.relevanceScore * weights.relevance) +
    (metrics.authorityScore * weights.authority) +
    (metrics.freshnessScore * weights.freshness) +
    (metrics.engagementScore * weights.engagement) +
    (metrics.educationalValue * weights.educational);
  
  return Math.round(weightedScore);
}

/**
 * Assess content quality comprehensively
 */
export function assessContentQuality(
  content: ContentItem,
  context: LearningContext,
  options: QualityEngineOptions = {}
): QualityMetrics {
  const relevanceScore = calculateRelevanceScore(content, context);
  const authorityScore = calculateAuthorityScore(content);
  const freshnessScore = calculateFreshnessScore(content);
  const engagementScore = calculateEngagementScore(content);
  const educationalValue = calculateEducationalValue(content);
  
  const overallQuality = calculateOverallQuality(
    { relevanceScore, authorityScore, freshnessScore, engagementScore, educationalValue },
    options.weights || DEFAULT_QUALITY_WEIGHTS
  );
  
  return {
    relevanceScore,
    authorityScore,
    freshnessScore,
    engagementScore,
    educationalValue,
    overallQuality
  };
}

// ============================================================================
// CONTENT RANKING AND FILTERING
// ============================================================================

/**
 * Rank content items by quality and relevance
 */
export function rankContent(
  contentItems: ContentItem[],
  context: LearningContext,
  options: QualityEngineOptions = {}
): ContentItem[] {
  // Assess quality for all items
  const assessedContent = contentItems.map(item => ({
    ...item,
    metrics: assessContentQuality(item, context, options)
  }));
  
  // Filter by minimum quality threshold
  const minThreshold = options.minQualityThreshold || 40;
  const qualityFiltered = assessedContent.filter(item => 
    item.metrics!.overallQuality >= minThreshold
  );
  
  // Sort by overall quality (descending)
  const sorted = qualityFiltered.sort((a, b) => 
    b.metrics!.overallQuality - a.metrics!.overallQuality
  );
  
  // Apply diversity factor if specified
  if (options.diversityFactor && options.diversityFactor > 0) {
    return applyContentDiversity(sorted, options.diversityFactor);
  }
  
  return sorted;
}

/**
 * Apply content diversity to avoid too similar results
 */
function applyContentDiversity(
  sortedContent: ContentItem[],
  diversityFactor: number
): ContentItem[] {
  const diversified: ContentItem[] = [];
  const used: Set<string> = new Set();
  
  for (const item of sortedContent) {
    // Check diversity criteria
    const diversityKey = `${item.domain}-${item.contentType}-${item.skillLevel}`;
    
    if (!used.has(diversityKey) || diversified.length < 3) {
      diversified.push(item);
      used.add(diversityKey);
    } else if (Math.random() < (1 - diversityFactor)) {
      // Randomly include some similar content based on diversity factor
      diversified.push(item);
    }
  }
  
  return diversified;
}

/**
 * Filter content by learning objectives
 */
export function filterByLearningObjectives(
  contentItems: ContentItem[],
  learningGoals: string[]
): ContentItem[] {
  return contentItems.filter(item => {
    if (!item.learningObjectives) return true; // Include if no objectives specified
    
    return learningGoals.some(goal =>
      item.learningObjectives!.some(objective =>
        objective.toLowerCase().includes(goal.toLowerCase()) ||
        goal.toLowerCase().includes(objective.toLowerCase())
      )
    );
  });
}

/**
 * Get quality insights for content analysis
 */
export function getQualityInsights(contentItems: ContentItem[]): {
  averageQuality: number;
  qualityDistribution: { range: string; count: number }[];
  contentTypeBreakdown: { type: string; count: number; avgQuality: number }[];
  authorityDistribution: { range: string; count: number }[];
} {
  const withMetrics = contentItems.filter(item => item.metrics);
  
  if (withMetrics.length === 0) {
    return {
      averageQuality: 0,
      qualityDistribution: [],
      contentTypeBreakdown: [],
      authorityDistribution: []
    };
  }
  
  const avgQuality = withMetrics.reduce((sum, item) => 
    sum + item.metrics!.overallQuality, 0
  ) / withMetrics.length;
  
  // Quality distribution
  const qualityRanges = [
    { range: '90-100 (Excellent)', min: 90, max: 100 },
    { range: '80-89 (Very Good)', min: 80, max: 89 },
    { range: '70-79 (Good)', min: 70, max: 79 },
    { range: '60-69 (Fair)', min: 60, max: 69 },
    { range: '0-59 (Poor)', min: 0, max: 59 }
  ];
  
  const qualityDistribution = qualityRanges.map(range => ({
    range: range.range,
    count: withMetrics.filter(item => 
      item.metrics!.overallQuality >= range.min && 
      item.metrics!.overallQuality <= range.max
    ).length
  }));
  
  // Content type breakdown
  const typeMap = new Map<string, { count: number; totalQuality: number }>();
  withMetrics.forEach(item => {
    const type = item.contentType;
    const current = typeMap.get(type) || { count: 0, totalQuality: 0 };
    typeMap.set(type, {
      count: current.count + 1,
      totalQuality: current.totalQuality + item.metrics!.overallQuality
    });
  });
  
  const contentTypeBreakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    avgQuality: Math.round(data.totalQuality / data.count)
  }));
  
  // Authority distribution
  const authorityRanges = [
    { range: '90-100 (Expert)', min: 90, max: 100 },
    { range: '70-89 (Professional)', min: 70, max: 89 },
    { range: '50-69 (Reliable)', min: 50, max: 69 },
    { range: '0-49 (Unverified)', min: 0, max: 49 }
  ];
  
  const authorityDistribution = authorityRanges.map(range => ({
    range: range.range,
    count: withMetrics.filter(item => 
      item.metrics!.authorityScore >= range.min && 
      item.metrics!.authorityScore <= range.max
    ).length
  }));
  
  return {
    averageQuality: Math.round(avgQuality),
    qualityDistribution,
    contentTypeBreakdown,
    authorityDistribution
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  UNIVERSAL_SKILL_CATEGORIES,
  UNIVERSAL_LEARNING_INDICATORS
};
