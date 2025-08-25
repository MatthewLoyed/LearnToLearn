# Spec Requirements Document

> Spec: API Integration & Content Curation System
> Created: 2025-01-19

## Overview

Integrate and enhance the existing API system for Skill Forge to provide a comprehensive, high-quality content curation platform. This system will unify OpenAI GPT-4o-mini, YouTube Data API v3, Tavily Search API, and Google Custom Search API to deliver dynamic, personalized learning resources while maintaining performance, quality, and cost-effectiveness.

## Current State Analysis

### ✅ What's Already Built

#### 1. **AI Roadmap Generation** (`/api/generate-roadmap`)

- **Complete OpenAI GPT-4o-mini integration** with sophisticated prompt engineering
- **Advanced topic analysis** and query classification system
- **Curated fallback roadmaps** for common topics (React, Python, JavaScript)
- **Credit protection system** with explicit AI enabling/disabling
- **Real-time progress tracking** during generation (8-step process)
- **Professional customization** (fonts, colors, icons) based on topic analysis

#### 2. **YouTube Integration** (`/api/search-youtube`)

- **Mock implementation** ready for YouTube Data API v3 integration
- **Structured video data types** with duration, thumbnails, channels
- **Integrated into roadmap generation** via `enhanceRoadmapWithVideos()`
- **Video player components** with thumbnail/player UI switching

#### 3. **Article Search** (`/api/search-articles`)

- **Mock implementation** ready for Tavily/Google Search integration
- **Fallback article system** with curated resources for major topics
- **Quality filtering** targeting educational domains

#### 4. **Visual Search** (`/api/search-image`)

- **Google Custom Search integration** already implemented
- **Educational diagram targeting** with enhanced queries
- **Visual learning components** integrated into roadmap display

#### 5. **UI Components**

- **Comprehensive roadmap display** with milestone tracking
- **Video player integration** with YouTube embedding
- **Visual learning sections** with image display
- **Progress tracking** and completion state management
- **Topic-specific customization** with fonts, colors, themes

### 🔧 What Needs Enhancement

#### 1. **YouTube Data API Integration**

- Replace mock data with real YouTube Data API v3 calls
- Implement video quality filtering and relevance scoring
- Add video duration optimization for learning contexts
- Enhance search query generation for better results

#### 2. **Article Search Enhancement**

- Implement real Tavily Search API integration
- Add Google Custom Search as secondary source
- Improve content quality filtering and ranking
- Implement article relevance scoring system

#### 3. **Content Quality System**

- Add content ranking and filtering algorithms
- Implement relevance scoring based on learning objectives
- Add content freshness and authority metrics
- Create quality feedback loops for continuous improvement

#### 4. **Performance Optimization**

- Implement intelligent caching strategies
- Add content prefetching for common topics
- Optimize API call batching and parallel processing
- Add rate limiting and quota management

## User Stories

### Enhanced Content Discovery

**As a learner**, I want to receive high-quality, relevant learning resources that are specifically curated for my skill level and learning objectives, so that I can efficiently master new skills without wasting time on poor or irrelevant content.

**Detailed Workflow:**

1. User generates a learning roadmap for any topic
2. System analyzes the topic and classifies learning intent
3. AI generates structured milestones with specific learning objectives
4. For each milestone, system searches for:
   - 2-3 high-quality YouTube videos (appropriate length, quality, relevance)
   - 1-2 authoritative articles or tutorials
   - Relevant educational diagrams and visual aids
5. Content is ranked and filtered based on quality metrics
6. User receives a comprehensive roadmap with vetted, high-quality resources
7. User can provide feedback to improve future recommendations

### Real-Time Content Integration

**As a learner**, I want the content curation to happen in real-time during roadmap generation, so that I receive the most current and relevant resources available.

**Detailed Workflow:**

1. User starts roadmap generation process
2. System shows real-time progress (8-step process with live updates)
3. Step 4-5: Real YouTube and article search with live status updates
4. System displays "Searching YouTube for [specific topic]" and "Finding articles about [specific concept]"
5. Content is enhanced in real-time as APIs return results
6. Final roadmap includes fresh, current resources found during generation
7. System provides transparency about which resources are live vs. cached

### Quality Assurance System

**As a learner**, I want assurance that all recommended content meets high educational standards, so that I can trust the learning path and focus on learning rather than evaluating resource quality.

**Detailed Workflow:**

1. System applies multiple quality filters to all content
2. YouTube videos are filtered by: view count, like ratio, channel authority, content length appropriateness
3. Articles are filtered by: domain authority, publication date, content depth, educational focus
4. Visual content is verified for educational value and accuracy
5. User sees quality indicators (verified badges, quality scores, source credibility)
6. System continuously learns from user interactions to improve quality detection
7. Poor-quality content is automatically filtered out or flagged

## Technical Requirements

### API Integration Architecture

#### 1. **Unified Content Service** (`src/lib/content-service.ts`)

- **Single entry point** for all content requests
- **Intelligent routing** between different APIs based on content type
- **Quality scoring** and ranking algorithms
- **Caching layer** with intelligent cache invalidation
- **Rate limiting** and quota management across all APIs
- **Error handling** with graceful fallbacks

#### 2. **OpenAI GPT-4o-mini Integration** (`src/lib/openai-service.ts`)

- **Advanced prompt engineering** for learning roadmap generation
- **Topic classification system** (career-focused, project-based, academic-theory, skill-enhancement, hobby-leisure)
- **Professional customization** (fonts, colors, icons) based on topic analysis
- **Credit protection system** with explicit user consent
- **Real-time progress tracking** during generation (8-step process)
- **Fallback to curated roadmaps** when AI is disabled
- **Error handling** with graceful degradation
- **Cost optimization** with intelligent prompt design

#### 3. **YouTube Data API v3 Enhancement** (`src/lib/youtube-service.ts`)

- **Advanced search queries** with educational focus
- **Video quality filtering** (duration, view count, like ratio, channel authority)
- **Content relevance scoring** based on learning objectives
- **Thumbnail optimization** and metadata extraction
- **Educational channel prioritization** (freeCodeCamp, Coursera, edX, etc.)
- **Batch processing** for multiple video searches

#### 4. **Article Search Service** (`src/lib/article-service.ts`)

- **Primary integration** with Tavily Search API
- **Secondary integration** with Google Custom Search
- **Educational domain prioritization** (MDN, official docs, W3Schools, etc.)
- **Content quality scoring** based on authority, freshness, depth
- **Article summarization** and key point extraction
- **Reading time estimation** and difficulty assessment

#### 5. **Content Quality Engine** (`src/lib/quality-engine.ts`)

- **Multi-factor quality scoring** algorithm
- **Educational value assessment** for all content types
- **Relevance scoring** based on learning milestone objectives
- **Authority metrics** (domain reputation, author credentials)
- **Freshness scoring** with decay functions for time-sensitive content
- **User feedback integration** for continuous improvement

#### 6. **Caching & Performance Layer** (`src/lib/cache-service.ts`)

- **Multi-tier caching** (memory, Redis, database)
- **Intelligent cache warming** for popular topics
- **Cache invalidation** strategies based on content type and freshness requirements
- **API response optimization** with compression and minification
- **Batch processing** and parallel API calls
- **Quota monitoring** and usage optimization

### Data Enhancement

#### 1. **Content Metadata Enrichment**

- **Video analysis**: Extract key topics, difficulty level, prerequisites
- **Article analysis**: Identify main concepts, code examples, practical applications
- **Visual content**: OCR for text extraction, concept identification
- **Learning path correlation**: Map content to specific learning objectives

#### 2. **Quality Metrics System**

- **Engagement metrics**: Views, likes, comments, shares (for videos)
- **Authority metrics**: Domain reputation, author credentials, citation count
- **Educational metrics**: Concept coverage, example quality, explanation clarity
- **Freshness metrics**: Publication date, update frequency, current relevance

#### 3. **Personalization Engine**

- **Skill level adaptation**: Filter content by difficulty appropriateness
- **Learning style preferences**: Visual, auditory, hands-on, theoretical
- **Progress tracking**: Recommend next-level content based on completion
- **Feedback learning**: Improve recommendations based on user interactions

## API Specifications

### OpenAI GPT-4o-mini Integration Service

```typescript
interface OpenAIGenerationRequest {
  topic: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  timeCommitment: "flexible" | "part-time" | "full-time";
  aiEnabled: boolean; // Critical: Only call OpenAI if explicitly enabled
  learningIntent?:
    | "career-focused"
    | "project-based"
    | "academic-theory"
    | "skill-enhancement"
    | "hobby-leisure";
}

interface OpenAIGenerationResponse {
  roadmap: RoadmapData;
  customization: TopicCustomization;
  metadata: {
    generationTime: number;
    tokensUsed: number;
    estimatedCost: number;
    model: string;
    fallbackUsed: boolean;
  };
}

interface TopicCustomization {
  category: string; // Determined by AI analysis
  font: string; // Google Font selection
  icon: string; // Lucide icon selection
  accentColor: string; // Tailwind color class
  background: string; // none | subtle-grid | minimal-dots
}

interface RoadmapData {
  topic: string;
  queryType: string;
  overview: string;
  totalEstimatedTime: string;
  prerequisites: string[];
  tips: string[];
  milestones: LearningMilestone[];
  visualLearning?: {
    customVisuals: VisualLearningItem[];
  };
  realWorldApplications?: {
    whyItMatters: RealWorldContext;
    practicalApplications: PracticalContext;
    successStories: SuccessStory[];
  };
}

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources: Resource[];
}

interface Resource {
  type: "video" | "article" | "tutorial" | "practice";
  title?: string;
  url?: string;
  description: string;
  duration?: string;
  searchTerms?: string[]; // For video/article search
}
```

### Enhanced YouTube Search Service

```typescript
interface EnhancedYouTubeSearch {
  query: string;
  learningObjective: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  maxResults: number;
  preferredDuration: "short" | "medium" | "long"; // 5-15min, 15-45min, 45min+
  qualityThreshold: number; // Minimum quality score (0-100)
}

interface VideoQualityMetrics {
  relevanceScore: number; // How well video matches learning objective
  authorityScore: number; // Channel reputation and educational credentials
  engagementScore: number; // Like ratio, view count, comment quality (bonus, not requirement)
  freshnessScore: number; // Publication date and content currency
  educationalScore: number; // Educational value assessment
  overallScore: number; // Weighted combination of all metrics
}

interface EnhancedVideoResult {
  // Basic YouTube data
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  channelName: string;
  channelSubscribers: number;
  publishedAt: string;
  viewCount: number;
  likeCount: number;

  // Enhanced metadata
  qualityMetrics: VideoQualityMetrics;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  keyTopics: string[];
  prerequisites: string[];
  learningOutcomes: string[];

  // Quality indicators
  isVerifiedEducational: boolean;
  hasSubtitles: boolean;
  hasCodeExamples: boolean;
  estimatedComprehension: number; // 0-100 based on explanation quality
}
```

### Enhanced Article Search Service

```typescript
interface EnhancedArticleSearch {
  query: string;
  learningObjective: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  contentType: "tutorial" | "documentation" | "guide" | "reference";
  maxResults: number;
  qualityThreshold: number;
}

interface ArticleQualityMetrics {
  relevanceScore: number; // Content match to learning objective
  authorityScore: number; // Domain reputation and author credibility
  depthScore: number; // Content comprehensiveness and detail
  clarityScore: number; // Writing quality and explanation clarity
  freshnessScore: number; // Publication date and content currency
  practicalScore: number; // Hands-on examples and practical application
  overallScore: number; // Weighted combination of all metrics
}

interface EnhancedArticleResult {
  // Basic article data
  title: string;
  url: string;
  description: string;
  domain: string;
  publishedAt?: string;
  author?: string;

  // Enhanced metadata
  qualityMetrics: ArticleQualityMetrics;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  estimatedReadingTime: number; // in minutes
  keyTopics: string[];
  hasCodeExamples: boolean;
  hasPracticalExercises: boolean;

  // Content analysis
  mainConcepts: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  contentType: "tutorial" | "documentation" | "guide" | "reference";

  // Quality indicators
  isVerifiedEducational: boolean;
  hasUpdatedContent: boolean;
  citationCount?: number;
  userRating?: number;
}
```

### Unified Content Request API

```typescript
interface ContentRequest {
  milestone: {
    id: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    learningObjectives: string[];
  };
  topic: string;
  preferences: {
    videoCount: number;
    articleCount: number;
    visualCount: number;
    preferredVideoLength: "short" | "medium" | "long";
    qualityThreshold: number;
  };
}

interface EnhancedContentResponse {
  videos: EnhancedVideoResult[];
  articles: EnhancedArticleResult[];
  visuals: VisualLearningResult[];
  metadata: {
    searchDuration: number;
    totalResultsFound: number;
    qualityFilteredCount: number;
    cacheHitRate: number;
    apiCallsMade: {
      youtube: number;
      tavily: number;
      googleCustomSearch: number;
    };
  };
}
```

## Quality Assurance Requirements

### Content Filtering Standards

#### Video Quality Standards

- **Like ratio scoring**: Higher engagement is better, but no minimum threshold (educational content often has lower engagement)
- **Channel authority**: Prioritize verified educational channels, but don't exclude smaller creators
- **Content freshness**: Prioritize videos from last 2 years, decay older content
- **Duration appropriateness**: Match video length to learning objective complexity
- **Audio quality**: Filter out poor audio quality videos
- **Visual clarity**: Ensure clear screen recording and presentation quality

#### Article Quality Standards

- **Domain authority**: Prioritize high-authority educational domains
- **Content depth**: Minimum 500 words for tutorials, 200 for reference
- **Publication freshness**: Prioritize articles from last 18 months for tech content
- **Author credibility**: Verified authors or institutional publications preferred
- **Code quality**: For programming content, verify working code examples
- **Update frequency**: Prioritize actively maintained content

#### Visual Content Standards

- **Educational relevance**: Must directly support learning objectives
- **Image quality**: Minimum resolution and clarity standards
- **Accuracy verification**: Cross-reference with authoritative sources
- **Copyright compliance**: Ensure proper licensing for educational use
- **Accessibility**: Include alt text and descriptions for all visuals

### Performance Requirements

#### Response Time Targets

- **Roadmap generation**: Complete within 30 seconds for AI-enabled requests
- **Content search**: Return results within 5 seconds per milestone
- **Cache hits**: Serve cached content within 500ms
- **Progressive loading**: Show partial results as they become available

#### API Rate Limiting

- **OpenAI API**: Implement credit protection with usage monitoring and cost optimization
- **YouTube Data API**: Respect 10,000 units/day limit with intelligent batching
- **Tavily Search API**: Optimize for cost-effectiveness with result caching
- **Google Custom Search**: Manage 100 free queries/day efficiently

#### Caching Strategy

- **AI-generated roadmaps**: Cache for 7 days with topic-based invalidation
- **Topic customization data**: Cache for 30 days (fonts, colors, icons)
- **Video metadata**: Cache for 24 hours with quality score updates
- **Article content**: Cache for 12 hours with freshness checks
- **Visual content**: Cache for 7 days with periodic quality verification
- **Popular topics**: Pre-cache roadmaps for top 50 requested topics

## Success Metrics

### Quality Metrics

- **Content relevance score**: Average 8.5/10 based on user feedback
- **Learning objective coverage**: 95% of milestones have appropriate resources
- **Resource quality rating**: Minimum 4.2/5.0 average user rating
- **Educational value assessment**: 90% of content meets educational standards

### Performance Metrics

- **API response time**: 95% of requests under 5 seconds
- **Cache hit rate**: 70% for popular topics, 40% overall
- **API cost efficiency**: Reduce per-roadmap cost by 30% through optimization
- **Error rate**: Less than 2% failed content requests

### User Experience Metrics

- **Content satisfaction**: 85% of users rate resources as helpful
- **Learning path completion**: 60% complete at least 3 milestones
- **Resource utilization**: Average 2.5 resources viewed per milestone
- **Feedback quality**: 40% of users provide content feedback

## Implementation Priority

### Phase 1: Core API Integration (Week 1-2)

1. **OpenAI Integration Enhancement**

   - Optimize prompt engineering for better roadmap quality
   - Enhance topic classification accuracy
   - Improve cost efficiency and token usage
   - Add better error handling and fallback mechanisms

2. **YouTube Data API v3 Integration**

   - Replace mock data with real API calls
   - Implement basic quality filtering
   - Add video metadata extraction

3. **Tavily Search API Integration**

   - Implement article search functionality
   - Add educational domain prioritization
   - Replace fallback articles with real search

4. **Content Quality Engine (Basic)**
   - Implement basic quality scoring
   - Add relevance filtering
   - Create quality metrics collection

### Phase 2: Enhanced Quality & Performance (Week 3-4)

1. **Advanced Quality Filtering**

   - Implement multi-factor quality scoring
   - Add authority and freshness metrics
   - Create educational value assessment

2. **Caching & Performance Layer**

   - Implement Redis caching layer
   - Add intelligent cache warming
   - Optimize API call batching

3. **Content Enhancement**
   - Add metadata enrichment
   - Implement difficulty level detection
   - Create learning outcome mapping

### Phase 3: Intelligence & Optimization (Week 5-6)

1. **Personalization Engine**

   - Implement skill-level adaptation
   - Add learning style preferences
   - Create progress-based recommendations

2. **Advanced Features**

   - Add content summarization
   - Implement prerequisite detection
   - Create learning path optimization

3. **Quality Feedback Loop**
   - Implement user feedback collection
   - Add continuous quality improvement
   - Create content rating system

## Risk Mitigation

### API Limitations

- **OpenAI cost management**: Implement credit protection, usage monitoring, and prompt optimization
- **YouTube quota limits**: Implement intelligent batching and caching
- **Tavily cost management**: Use caching and query optimization
- **Google Search limits**: Fallback to alternative sources when quota exceeded

### Content Quality Risks

- **Low-quality content**: Multi-layer filtering with human verification samples
- **Outdated information**: Implement freshness decay and update notifications
- **Irrelevant results**: Advanced relevance scoring with user feedback loops

### Performance Risks

- **High latency**: Progressive loading and result streaming
- **API failures**: Robust fallback systems and error recovery
- **Scale issues**: Horizontal scaling and load balancing strategies

This comprehensive API integration system will transform Skill Forge into a world-class learning platform that delivers consistently high-quality, relevant, and engaging educational content to learners at any skill level.
