/**
 * OpenAI Service Types
 * Type definitions for OpenAI integration
 */

export interface OpenAIGenerationRequest {
  topic: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: 'flexible' | 'part-time' | 'full-time';
  aiEnabled: boolean; // Critical: Only call OpenAI if explicitly enabled
  maxTokensMode?: boolean; // Optional: Remove token limits for testing
  learningIntent?: 'career-focused' | 'project-based' | 'academic-theory' | 'skill-enhancement' | 'hobby-leisure';
}

export interface OpenAIGenerationResponse {
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

export interface TopicCustomization {
  category: string; // Determined by AI analysis
  font: string; // Google Font selection
  icon: string; // Lucide icon selection
  accentColor: string; // Tailwind color class
  background: string; // none | subtle-grid | minimal-dots
}

export interface RoadmapData {
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

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources: Resource[];
}

export interface Resource {
  type: 'video' | 'article' | 'tutorial' | 'practice';
  title?: string;
  url?: string;
  description: string;
  duration?: string;
  searchTerms?: string[]; // For video/article search
}

export interface VisualLearningItem {
  title: string;
  description: string;
  relevance: string;
  type: 'mindmap' | 'diagram' | 'infographic';
  imagePrompt: string;
}

export interface RealWorldContext {
  careerOpportunities: string;
  personalGrowth: string;
  creativeExpression: string;
  problemSolving: string;
}

export interface PracticalContext {
  professionalUse: string;
  communityImpact: string;
  personalProjects: string;
  entrepreneurial: string;
}

export interface SuccessStory {
  title: string;
  description: string;
  outcome: string;
}

export interface OpenAIError {
  type: 'api_error' | 'rate_limit' | 'quota_exceeded' | 'invalid_key' | 'service_unavailable' | 'parse_error';
  message: string;
  statusCode?: number;
  retryable: boolean;
}

export interface SearchQueryResult {
  youtubeQueries: string[];
  articleQueries: string[];
  imageQueries: string[];
  detectedTopic: string;
  reasoning: string;
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
}

// ============================================================================
// SKILL DECONSTRUCTION TYPES
// ============================================================================

export interface SkillDeconstructionRequest {
  topic: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: 'flexible' | 'part-time' | 'full-time';
  aiEnabled: boolean;
  maxTokensMode?: boolean;
}

export interface SkillDeconstructionResponse {
  skillDeconstruction: SkillDeconstructionData;
  metadata: {
    generationTime: number;
    tokensUsed: number;
    estimatedCost: number;
    model: string;
    fallbackUsed: boolean;
  };
}

export interface SkillDeconstructionData {
  id: string;
  skillName: string;
  skillType: 'physical' | 'abstract';
  userQuery: string;
  levels: SkillLevel[];
  totalEstimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  overview: string;
  prerequisites: string[];
  tips: string[];
}

export interface SkillLevel {
  level: number;
  title: string;
  description: string;
  estimatedTime: number; // in minutes
  milestones: SkillMilestone[];
}

export interface SkillMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  doThisNow: PracticeActivity;
  icon: string;
  content: {
    videos: any[];
    articles: any[];
    images: any[];
  };
}

export interface PracticeActivity {
  prompt: string;
  reps: number;
  sets: number;
  successCriteria: string;
  activityType: 'code_challenge' | 'physical_practice' | 'reading' | 'video_watch';
  estimatedTime: number; // in minutes
}

export interface MilestoneProgress {
  milestoneId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  practiceAttempts: number;
  practiceCompletions: number;
  notes?: string;
}

export interface PracticeActivityData {
  activityType: 'code_challenge' | 'physical_practice' | 'reading' | 'video_watch';
  title: string;
  description: string;
  completed: boolean;
  completionTime?: number; // in minutes
  difficultyRating?: number; // 1-5 scale
  userNotes?: string;
}

export interface SkillDeconstructionProgress {
  skillDeconstructionId: string;
  completedMilestones: number;
  totalMilestones: number;
  currentLevel: number;
  currentMilestone: string;
  overallProgress: number; // 0-100 percentage
  estimatedTimeRemaining: number; // in minutes
  milestoneProgress: MilestoneProgress[];
  practiceAnalytics: {
    totalPracticeTime: number;
    averageDifficultyRating: number;
    mostChallengingActivity: string;
    completionRate: number;
  };
}
