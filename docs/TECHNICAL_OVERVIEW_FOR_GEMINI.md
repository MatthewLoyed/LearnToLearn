# Skill Forge - Comprehensive Technical Overview

> **Project**: Skill Forge - AI-Powered Learning Roadmap Generator  
> **Version**: 1.0.0  
> **Architecture**: Next.js App Router with Modular Service Architecture  
> **AI Core**: OpenAI GPT-4o-mini with Advanced Prompt Engineering  
> **Date**: January 2025

---

## 1. High-Level Architecture Overview

### Core Architecture Pattern

Skill Forge follows a **modular service architecture** built on Next.js 15 with the App Router pattern. The system is designed around a **content-first approach** where AI-generated learning roadmaps are enhanced with real-time content from multiple external APIs.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router (pages, layouts, components)           │
│  • /app/page.tsx (Home/Landing)                            │
│  • /app/roadmap/[topic]/page.tsx (Roadmap Display)         │
│  • /app/layout.tsx (Root Layout)                           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                        │
│  • /api/generate-roadmap/route.ts (Main Orchestrator)      │
│  • /api/generate-roadmap/route.ts (Unified Content)        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Modular Services (src/lib/services/)                      │
│  • openai-service.ts (AI Roadmap Generation)               │
│  • youtube-service.ts (Video Content Curation)             │
│  • article-service.ts (Article Search & Filtering)         │

│  • search-service.ts (Unified Search Orchestration)        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    UTILITY LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Shared Utilities (src/lib/utils/)                         │
│  • quality-engine.ts (Universal Content Quality Assessment)│
│  • logger.ts (Centralized Logging)                         │
│  • formatting/ (UI Formatting & Customization)             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                         │
├─────────────────────────────────────────────────────────────┤
│  React Context + Local Storage                             │
│  • ProgressContext.tsx (Learning Progress Tracking)        │
│  • Local Storage (User Preferences & Progress)             │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Service-Oriented Design**: Each external API integration is encapsulated in its own service module with clear interfaces
2. **Quality-First Content Curation**: Universal quality engine that assesses content across all learning domains
3. **Progressive Enhancement**: AI features are optional and can be disabled for cost control
4. **Real-Time Content Integration**: Dynamic content fetching with intelligent fallbacks
5. **Modular Component Architecture**: Reusable UI components with lazy loading and skeleton states

### File Structure Overview

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   ├── roadmap/[topic]/          # Dynamic roadmap pages
│   ├── page.tsx                  # Landing page
│   └── layout.tsx                # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── VideoPlayer.tsx           # YouTube video integration
│   └── SkillTree.tsx             # Interactive skill visualization
├── contexts/                     # React Context providers
│   └── ProgressContext.tsx       # Learning progress management
├── hooks/                        # Custom React hooks
├── lib/                          # Core business logic
│   ├── services/                 # External API integrations
│   ├── utils/                    # Shared utilities
│   ├── data/                     # Static data and fallbacks
│   └── types/                    # TypeScript type definitions
└── styles/                       # Global styles and themes
```

---

## 2. Tech Stack

### Frontend Framework

- **Next.js 15.4.6** with App Router
- **React 19.1.0** with modern hooks and patterns
- **TypeScript 5** for type safety and developer experience

### Styling & UI

- **TailwindCSS 3.4.17** for utility-first styling
- **shadcn/ui** for pre-built, accessible components
- **Framer Motion 12.23.12** for smooth animations
- **Lucide React 0.539.0** for consistent iconography

### Data Visualization

- **Recharts 3.1.2** for progress charts and analytics
- **Mermaid.js 11.9.0** for flow diagrams and skill trees

### State Management

- **React Context API** for global state (ProgressContext)
- **Local Storage** for persistence
- **Zustand 5.0.8** (available but not currently used)

### Development Tools

- **Jest 30.0.5** for unit testing
- **ESLint 9** for code quality
- **PostCSS 8.5.6** for CSS processing
- **SWC** for fast compilation

### External Dependencies

- **date-fns 4.1.0** for date manipulation
- **clsx 2.1.1** for conditional class names
- **class-variance-authority 0.7.1** for component variants

### Build & Deployment

- **Vercel** for hosting and deployment
- **Turbopack** for development builds
- **SWC** for production compilation

---

## 3. The AI Core (The Most Important Section)

### OpenAI GPT-4o-mini Integration

The AI core is built around **sophisticated prompt engineering** and **intelligent content orchestration**. The system uses OpenAI's GPT-4o-mini model for multiple specialized tasks:

#### Core AI Functions

**1. Roadmap Generation** (`generateRoadmap`)

```typescript
// File: src/lib/services/openai/openai-service.ts:400-600
export async function generateRoadmap(
  request: OpenAIGenerationRequest
): Promise<OpenAIGenerationResponse> {
  const { topic, skillLevel, timeCommitment, aiEnabled, maxTokensMode } =
    request;

  // Advanced topic analysis and classification
  const { analyzedTopic, learningFocus, roadmapType } = analyzeTopic(topic);

  // Dynamic prompt construction based on learning intent
  const roadmapPrompt = `Create learning roadmap for: "${topic}"
  
  CLASSIFICATION: ${roadmapType}
  SKILL LEVEL: ${skillLevel}
  TIME COMMITMENT: ${timeCommitment}
  
  STRUCTURE GUIDELINES:
  ${getStructureGuidelines(roadmapType, skillLevel)}
  
  Return JSON with structure:
  {
    "topic": "${topic}",
    "queryType": "${roadmapType}",
    "overview": "2-3 sentence overview",
    "totalEstimatedTime": "8-12 weeks",
    "prerequisites": ["prereq1", "prereq2"],
    "tips": ["tip1", "tip2", "tip3", "tip4"],
    "milestones": [
      {
        "id": "milestone-1",
        "title": "Milestone title",
        "description": "What will be learned and why important",
        "estimatedTime": "2-3 weeks",
        "difficulty": "beginner",
        "resources": [
          {
            "type": "video",
            "searchTerms": ["best tutorial beginners", "complete guide 2024"],
            "description": "What to look for"
          }
        ]
      }
    ]
  }`;
}
```

**2. Intelligent Search Query Generation** (`generateSearchQueries`)

```typescript
// File: src/lib/services/openai/openai-service.ts:800-1000
export async function generateSearchQueries(
  topic: string,
  skillLevel: string,
  options: SearchQueryOptions = {}
): Promise<SearchQueryResponse> {
  const prompt = `Generate search queries for: "${topic}" (${skillLevel})
  
  REQUIREMENTS:
  - Create 3 YouTube queries optimized for educational content
  - Create 3 article queries targeting authoritative sources
  - Create 2 image queries for educational diagrams
  - Adapt queries to skill level (beginner/intermediate/advanced)
  - Include specific keywords for content type (tutorial, guide, etc.)
  
  Return JSON with structure:
  {
    "youtubeQueries": ["query1", "query2", "query3"],
    "articleQueries": ["query1", "query2", "query3"],
    "imageQueries": ["query1", "query2"],
    "detectedTopic": "analyzed topic",
    "reasoning": "why these queries were chosen",
    "classification": {
      "domain": "programming|business|creative|academic",
      "complexity": "basic|intermediate|advanced",
      "prerequisites": ["prereq1", "prereq2"],
      "estimatedTime": "time estimate"
    }
  }`;
}
```

**3. Topic Analysis & Classification** (`analyzeTopic`)

```typescript
// File: src/lib/services/openai/openai-service.ts:220-280
function analyzeTopic(topic: string): {
  analyzedTopic: string;
  learningFocus: string;
  roadmapType: string;
} {
  const topicLower = topic.toLowerCase();

  // Career-focused indicators (high priority)
  const careerKeywords = [
    "career",
    "job",
    "profession",
    "become",
    "work as",
    "get hired",
    "salary",
    "industry",
    "professional",
  ];
  if (careerKeywords.some((keyword) => topicLower.includes(keyword))) {
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "career preparation and professional development",
      roadmapType: "career-focused",
    };
  }

  // Project-based indicators (high priority)
  const projectKeywords = [
    "build",
    "create",
    "make",
    "develop",
    "project",
    "app",
    "website",
    "game",
    "tool",
    "system",
  ];
  if (projectKeywords.some((keyword) => topicLower.includes(keyword))) {
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "practical implementation and hands-on building",
      roadmapType: "project-based",
    };
  }

  // Additional classification logic for academic, skill-enhancement, hobby-leisure
  // ...
}
```

#### Advanced Prompt Engineering Features

**1. Dynamic Context Instructions**

```typescript
// File: src/lib/services/openai/openai-service.ts:300-350
function getContextInstructions(roadmapType: string, topic: string): string {
  switch (roadmapType) {
    case "career-focused":
      return `Focus on career preparation for ${topic}. Emphasize job-ready skills, industry certifications, portfolio building, networking, and practical experience. Include real-world applications and professional development.`;

    case "project-based":
      return `Focus on practical implementation for ${topic}. Emphasize tools, frameworks, step-by-step implementation, and hands-on project building. Include specific technologies and actionable development steps.`;

    // Additional roadmap types...
  }
}
```

**2. Skill Level Adaptation**

```typescript
// File: src/lib/services/openai/openai-service.ts:350-400
function getStructureGuidelines(
  roadmapType: string,
  skillLevel: string
): string {
  const baseGuidelines = `- Start with essential fundamentals and prerequisites
- Progress logically from basic to advanced concepts
- Include practical application and hands-on practice
- End with mastery or specialization opportunities
- Ensure each milestone builds upon previous knowledge
- Scale roadmap depth and pacing to the specified time commitment
- Adapt to learner's skill level (${skillLevel}) with no assumed prior knowledge if beginner
- Always include practice tasks or reflection questions per milestone`;

  // Additional roadmap-specific guidelines...
}
```

#### AI Configuration & Cost Management

**1. Token Management**

```typescript
// File: src/lib/services/openai/openai-service.ts:150-200
const OPENAI_CONFIG = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 4000,
  costPer1kTokens: 0.00015, // GPT-4o-mini pricing
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimit: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
  },
};
```

**2. Rate Limiting & Usage Tracking**

```typescript
// File: src/lib/services/openai/openai-service.ts:1200-1300
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(): boolean {
  const now = Date.now();
  const key = "openai";
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= OPENAI_CONFIG.rateLimit.requestsPerMinute) {
    return false;
  }

  limit.count++;
  return true;
}
```

#### AI-Powered Content Enhancement

**1. Intelligent Image Query Generation**

```typescript
// File: src/lib/services/openai/openai-service.ts:1100-1200
export async function generateIntelligentImageQueries(
  topic: string,
  milestone: LearningMilestone
): Promise<string[]> {
  const prompt = `Generate 2-3 specific image search queries for educational visuals about "${topic}" - milestone: "${milestone.title}"
  
  REQUIREMENTS:
  - Focus on technical diagrams, mind maps, or infographics
  - Include specific technical terms and concepts
  - Target educational and professional contexts
  - Avoid generic or decorative images
  
  Return JSON array: ["query1", "query2", "query3"]`;
}
```

**2. Content Quality Assessment**
The AI core works with a universal quality engine that assesses content across all learning domains:

```typescript
// File: src/lib/utils/quality/quality-engine.ts:100-200
export interface QualityMetrics {
  relevanceScore: number; // 0-100: How relevant is content to the query
  authorityScore: number; // 0-100: Source credibility and expertise
  freshnessScore: number; // 0-100: How recent and up-to-date
  engagementScore: number; // 0-100: User engagement indicators
  educationalValue: number; // 0-100: Teaching quality and clarity
  overallQuality: number; // 0-100: Weighted final score
}

export function assessContentQuality(
  content: ContentItem,
  context: LearningContext,
  options: QualityEngineOptions = {}
): QualityMetrics {
  // Multi-factor quality assessment algorithm
  const relevanceScore = calculateRelevanceScore(content, context);
  const authorityScore = calculateAuthorityScore(content);
  const freshnessScore = calculateFreshnessScore(content);
  const engagementScore = calculateEngagementScore(content);
  const educationalValue = calculateEducationalValue(content, context);

  // Weighted combination based on learning context
  const weights = options.weights || DEFAULT_QUALITY_WEIGHTS;
  const overallQuality =
    (relevanceScore * weights.relevance +
      authorityScore * weights.authority +
      freshnessScore * weights.freshness +
      engagementScore * weights.engagement +
      educationalValue * weights.educational) /
    100;

  return {
    relevanceScore,
    authorityScore,
    freshnessScore,
    engagementScore,
    educationalValue,
    overallQuality,
  };
}
```

---

## 4. External API Integrations

### YouTube Data API v3 Integration

**Service Location**: `src/lib/services/youtube/youtube-service.ts`

**Key Features**:

- Real-time video search with educational focus
- Advanced quality filtering and scoring
- Channel authority assessment
- Duration optimization for learning contexts
- Rate limiting and quota management

**Core Functions**:

```typescript
// File: src/lib/services/youtube/youtube-service.ts:500-600
export async function searchYouTubeVideos(
  request: YouTubeSearchRequest
): Promise<YouTubeSearchResponse> {
  const { query, skillLevel = "beginner", maxResults = 10 } = request;

  // Enhanced query generation with AI
  const enhancedQuery = await enhanceQueryWithAI(query, skillLevel);

  // YouTube API call with educational parameters
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=${encodeURIComponent(enhancedQuery)}` +
      `&type=video&videoDuration=medium&order=relevance` +
      `&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}`
  );

  // Quality filtering and scoring
  const videos = await filterVideosByQuality(response.data.items, skillLevel);

  return {
    videos,
    query: enhancedQuery,
    totalResults: response.data.pageInfo.totalResults,
  };
}
```

**Quality Filtering Algorithm**:

```typescript
// File: src/lib/services/youtube/youtube-service.ts:1500-1700
function calculateComprehensiveQualityScore(video: YouTubeVideo): number {
  const engagementScore = calculateEngagementScore(video); // 35% weight
  const authorityScore = calculateChannelAuthorityScore(video); // 25% weight
  const relevanceScore = calculateRelevanceScore(video); // 20% weight
  const educationalScore = calculateEducationalPriorityScore(video); // 15% weight
  const freshnessScore = calculateFreshnessScore(video); // 5% weight

  return (
    engagementScore * 0.35 +
    authorityScore * 0.25 +
    relevanceScore * 0.2 +
    educationalScore * 0.15 +
    freshnessScore * 0.05
  );
}
```

### Tavily Search API Integration

**Service Location**: `src/lib/services/articles/article-service.ts`

**Key Features**:

- Educational article search with domain filtering
- Content type classification (tutorial, documentation, guide)
- Reading time estimation
- Authority scoring based on domain reputation
- Code example detection

**Core Functions**:

```typescript
// File: src/lib/services/articles/article-service.ts:200-300
export async function searchArticles(
  query: string,
  options: ArticleSearchOptions = {}
): Promise<Article[]> {
  const { maxResults = 10, skillLevel = "beginner" } = options;

  // Enhanced query with educational keywords
  const enhancedQuery = enhanceSearchQuery(query, skillLevel);

  // Tavily API call
  const response = await callTavilySearchAPI(enhancedQuery, {
    maxResults,
    searchDepth: "advanced",
    includeDomains: EDUCATIONAL_DOMAINS.map((d) => d.domain),
  });

  // Quality assessment and filtering
  const articles = response.results.map((result) => ({
    id: generateId(),
    title: result.title,
    description: result.content.substring(0, 200),
    url: result.url,
    source: extractDomain(result.url),
    domain: extractDomain(result.url),
    publishedAt: result.published_date,
    readingTime: calculateReadingTime(result.content),
    tags: extractTags(result.content),
    qualityScore: calculateQualityScore(result, skillLevel),
    educationalValue: calculateEducationalValue(result),
    authorityScore: calculateDomainAuthority(result.url),
    freshnessScore: calculateFreshnessScore(result.published_date),
    contentDepth: detectContentDepth(result.content),
    contentType: detectContentType(result.content),
    hasCodeExamples: detectCodeExamples(result.content),
  }));

  return filterArticlesByQuality(articles, options);
}
```

### Google Custom Search API Integration

**Note**: The image service has been deprecated and removed from the system as visual learning is no longer part of the core learning experience.

### Unified Search Orchestration

**Service Location**: `src/lib/services/search/search-service.ts`

**Key Features**:

- Coordinates all external API calls
- Implements intelligent content distribution
- Handles parallel processing and error recovery
- Provides unified response format

**Core Functions**:

```typescript
// File: src/lib/services/search/search-service.ts:50-150
export async function searchAllContent(
  topic: string,
  options: SearchOptions = {}
): Promise<SearchResults> {
  const {
    maxVideos = 3,
    maxArticles = 6,
    maxImages = 3,
    skillLevel = "beginner",
  } = options;

  // Step 1: Generate search queries using OpenAI
  const searchQueries = await generateSearchQueries(topic, skillLevel, {
    maxQueries: 3,
    includeVisuals: true,
  });

  // Step 2: Parallel API calls with error handling
  const [videoResults, articleResults, imageResults] = await Promise.allSettled(
    [
      searchYouTubeVideos(searchQueries.youtubeQueries[0], {
        maxResults: maxVideos,
        skillLevel,
      }),
      searchArticles(searchQueries.articleQueries[0], {
        maxResults: maxArticles,
        skillLevel,
      }),
      // Image search has been deprecated
      Promise.resolve({ images: [] }),
    ]
  );

  // Step 3: Content distribution and quality ranking
  const distributedContent = distributeContentAcrossMilestones(
    videoResults.status === "fulfilled" ? videoResults.value : [],
    articleResults.status === "fulfilled" ? articleResults.value : [],
    imageResults.status === "fulfilled" ? imageResults.value : []
  );

  return {
    videos: distributedContent.videos,
    articles: distributedContent.articles,
    images: distributedContent.images,
    metadata: {
      searchQueries: searchQueries,
      contentOptimization: {
        learningStyle: detectLearningStyle(topic, skillLevel),
        difficultyAdjustment: adjustForSkillLevel(skillLevel),
        contentTypes: ["video", "article", "visual"],
        searchStrategy: "comprehensive",
      },
      classification: searchQueries.classification,
      apiResults: {
        videos:
          videoResults.status === "fulfilled" ? videoResults.value.length : 0,
        articles:
          articleResults.status === "fulfilled"
            ? articleResults.value.length
            : 0,
        images:
          imageResults.status === "fulfilled" ? imageResults.value.length : 0,
      },
    },
  };
}
```

---

## 5. Data and State Management

### React Context Architecture

**Primary Context**: `src/contexts/ProgressContext.tsx`

**State Structure**:

```typescript
// File: src/contexts/ProgressContext.tsx:20-50
export interface ProgressState {
  learningPaths: Record<string, LearningPath>;
  achievements: Achievement[];
  userId: string;
  totalTimeSpent: number;
  streakDays: number;
  lastActivityDate: string;
}

export interface LearningPath {
  id: string;
  topic: string;
  milestones: Milestone[];
  startedAt: string;
  lastActivity: string;
  totalProgress: number; // 0-100
  completedMilestones: number;
  totalMilestones: number;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  type: "video" | "article" | "exercise" | "quiz";
  estimatedTime: number; // in minutes
  completed: boolean;
  completedAt?: string;
  timeSpent: number; // in seconds
  score?: number; // 0-100
  notes?: string;
}
```

**Context Methods**:

```typescript
// File: src/contexts/ProgressContext.tsx:50-80
export interface ProgressContextType {
  state: ProgressState;
  // Progress management methods
  mark_milestone_complete: (
    learningPathId: string,
    milestoneId: string,
    timeSpent: number,
    score?: number,
    notes?: string
  ) => void;
  update_milestone_progress: (
    learningPathId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ) => void;
  reset_milestone: (learningPathId: string, milestoneId: string) => void;
  // Learning path management
  start_learning_path: (
    topic: string,
    milestones: Omit<Milestone, "completed" | "completedAt" | "timeSpent">[]
  ) => string;
  get_learning_path: (learningPathId: string) => LearningPath | null;
  get_all_learning_paths: () => LearningPath[];
  // Achievement management
  unlock_achievement: (achievementId: string) => void;
  get_achievements: () => Achievement[];
  get_unlocked_achievements: () => Achievement[];
  // Analytics methods
  get_total_progress: () => number;
  get_learning_velocity: (days: number) => number;
  get_time_distribution: () => Record<string, number>;
  // Data management
  clear_progress: (learningPathId?: string) => void;
  export_progress_data: () => string;
  import_progress_data: (data: string) => boolean;
}
```

### Local Storage Persistence

**Storage Strategy**:

```typescript
// File: src/contexts/ProgressContext.tsx:400-500
const STORAGE_KEYS = {
  LEARNING_PATHS: "skill-forge-learning-paths",
  ACHIEVEMENTS: "skill-forge-achievements",
  USER_PREFERENCES: "skill-forge-preferences",
  PROGRESS_STATS: "skill-forge-stats",
};

// Automatic persistence on state changes
useEffect(() => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEYS.LEARNING_PATHS,
      JSON.stringify(state.learningPaths)
    );
    localStorage.setItem(
      STORAGE_KEYS.ACHIEVEMENTS,
      JSON.stringify(state.achievements)
    );
  }
}, [state.learningPaths, state.achievements]);

// Initialization from storage
useEffect(() => {
  if (typeof window !== "undefined") {
    const savedPaths = localStorage.getItem(STORAGE_KEYS.LEARNING_PATHS);
    const savedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);

    if (savedPaths) {
      dispatch({
        type: "LOAD_LEARNING_PATHS",
        payload: JSON.parse(savedPaths),
      });
    }
    if (savedAchievements) {
      dispatch({
        type: "LOAD_ACHIEVEMENTS",
        payload: JSON.parse(savedAchievements),
      });
    }
  }
}, []);
```

### Achievement System

**Achievement Definitions**:

```typescript
// File: src/contexts/ProgressContext.tsx:80-120
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_milestone",
    title: "First Steps",
    description: "Completed your first milestone",
    icon: "🎯",
    criteria: { type: "milestone_count", value: 1 },
    unlocked: false,
  },
  {
    id: "speed_learner",
    title: "Speed Learner",
    description: "Completed 5 milestones in a single day",
    icon: "⚡",
    criteria: { type: "milestone_count", value: 5 },
    unlocked: false,
  },
  {
    id: "streak_master",
    title: "Streak Master",
    description: "Maintained a 7-day learning streak",
    icon: "🔥",
    criteria: { type: "streak_days", value: 7 },
    unlocked: false,
  },
  {
    id: "time_investor",
    title: "Time Investor",
    description: "Spent 10 hours learning",
    icon: "⏰",
    criteria: { type: "time_spent", value: 600 }, // 10 hours in minutes
    unlocked: false,
  },
];
```

### Analytics & Insights

**Progress Analytics**:

```typescript
// File: src/contexts/ProgressContext.tsx:500-600
function get_learning_velocity(days: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentMilestones = Object.values(state.learningPaths)
    .flatMap((path) => path.milestones)
    .filter(
      (milestone) =>
        milestone.completed &&
        milestone.completedAt &&
        new Date(milestone.completedAt) > cutoffDate
    );

  return recentMilestones.length / days; // milestones per day
}

function get_time_distribution(): Record<string, number> {
  const distribution: Record<string, number> = {};

  Object.values(state.learningPaths).forEach((path) => {
    path.milestones.forEach((milestone) => {
      if (milestone.completed && milestone.timeSpent) {
        const topic = path.topic;
        distribution[topic] = (distribution[topic] || 0) + milestone.timeSpent;
      }
    });
  });

  return distribution;
}
```

### Data Flow Architecture

**Component State Management**:

```typescript
// File: src/app/roadmap/[topic]/page.tsx:50-100
export default function RoadmapPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);

  // Enhanced loading progress tracking
  const [loadingProgress, setLoadingProgress] = useState({
    currentStep: 0,
    totalSteps: 0,
    currentMessage: "",
    progress: 0,
  });

  // Progress context integration
  const { mark_milestone_complete, get_learning_path, start_learning_path } =
    useContext(ProgressContext);
}
```

**API Data Flow**:

```typescript
// File: src/app/api/generate-roadmap/route.ts:30-80
export async function POST(request: NextRequest) {
  const {
    topic,
    skillLevel = "beginner",
    aiEnabled = false,
    maxTokensMode = false,
  } = await request.json();

  // Step 1: Get base roadmap (AI-generated or curated)
  let roadmap: RoadmapData;

  if (aiEnabled) {
    const aiResponse = await generateCompleteRoadmap({
      topic,
      skillLevel,
      timeCommitment: "flexible",
      aiEnabled: true,
      maxTokensMode,
    });
    roadmap = aiResponse.roadmap;
  } else {
    roadmap = getCuratedRoadmap(topic) || getCuratedRoadmap("javascript");
  }

  // Step 2: Enhance roadmap with real content (only if AI is enabled)
  if (aiEnabled) {
    const searchResults = await searchAllContent(topic, {
      maxVideos: 3,
      maxArticles: 6,
      maxImages: 3,
      skillLevel,
    });

    const enhancedRoadmap = enhanceRoadmapWithContent(
      roadmap,
      searchResults,
      topic
    );
    return NextResponse.json(enhancedRoadmap);
  }

  return NextResponse.json(roadmap);
}
```

### Error Handling & Fallbacks

**Graceful Degradation**:

```typescript
// File: src/lib/services/search/search-service.ts:200-300
export async function searchAllContent(
  topic: string,
  options: SearchOptions = {}
): Promise<SearchResults> {
  try {
    // Primary search with all APIs
    const results = await performComprehensiveSearch(topic, options);
    return results;
  } catch (error) {
    console.warn(
      "Comprehensive search failed, falling back to curated content:",
      error
    );

    // Fallback to curated content
    return {
      videos: getCuratedVideos(topic, options.skillLevel),
      articles: getCuratedArticles(topic, options.skillLevel),
      images: getCuratedImages(topic),
      metadata: {
        searchQueries: {
          youtube: [],
          articles: [],
          images: [],
          detectedTopic: topic,
          reasoning: "fallback",
        },
        contentOptimization: {
          learningStyle: "fallback",
          difficultyAdjustment: "basic",
          contentTypes: [],
          searchStrategy: "curated",
        },
        classification: {
          domain: "general",
          complexity: "basic",
          prerequisites: [],
          estimatedTime: "flexible",
        },
        apiResults: { videos: 0, articles: 0, images: 0 },
      },
    };
  }
}
```

---

## Summary

Skill Forge represents a sophisticated learning platform that combines **advanced AI capabilities** with **real-time content curation** to deliver personalized learning experiences. The architecture is built for **scalability**, **quality**, and **user experience**, with comprehensive error handling and fallback mechanisms.

**Key Strengths**:

1. **Modular Service Architecture** - Clean separation of concerns with reusable components
2. **Advanced AI Integration** - Sophisticated prompt engineering and intelligent content orchestration
3. **Quality-First Content Curation** - Universal quality engine that works across all learning domains
4. **Real-Time Content Integration** - Dynamic content fetching with intelligent fallbacks
5. **Comprehensive State Management** - Robust progress tracking and achievement system
6. **Performance Optimization** - Lazy loading, skeleton states, and efficient API usage

**Technical Highlights**:

- **1,439 lines** of OpenAI service code with advanced prompt engineering
- **2,051 lines** of YouTube service with comprehensive quality filtering
- **1,201 lines** of article service with educational domain targeting
- **664 lines** of universal quality engine for content assessment
- **641 lines** of progress context for state management
- **1,496 lines** of roadmap page with comprehensive UI components

The system is production-ready with comprehensive testing, error handling, and performance optimizations, making it an excellent foundation for further development and enhancement.
