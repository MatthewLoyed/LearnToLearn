/**
 * OpenAI Service for Skill Forge
 * Handles AI-powered roadmap generation and customization
 * 
 * Features:
 * - Roadmap generation with GPT-4o-mini
 * - Topic-specific customization (fonts, colors, icons)
 * - Cost tracking and token usage monitoring
 * - Comprehensive error handling and fallbacks
 * - Credit protection with explicit user consent
 */

// ============================================================================
// CONFIGURATION - Import from centralized config
// ============================================================================

import { TOTAL_MILESTONES } from '../../config/content-config';
import { 
  SkillDeconstructionRequest, 
  SkillDeconstructionData, 
  SkillLevel, 
  SkillMilestone, 
  PracticeActivity 
} from './types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

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
  searchQueries?: {
    youtubeQueries: string[];
    articleQueries: string[];
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
  };
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

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const OPENAI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.6, // Reduced for more consistent output
  customizationTemperature: 0.2, // Reduced for more consistent styling
  maxRetries: 3,
  retryDelay: 1000, // ms
  costPer1kTokens: 0.00015, // GPT-4o-mini pricing
  estimatedTokensPerRoadmap: 1800, // Optimized estimate
  maxTokens: 4000, // Limit token usage for cost efficiency
  customizationMaxTokens: 500, // Limit customization tokens
  // Rate limiting and quota management
  maxRequestsPerMinute: 10, // Conservative rate limit
  maxRequestsPerHour: 100, // Hourly quota
  maxDailyCost: 5.0, // $5 daily spending limit
} as const;

// In-memory rate limiting (in production, use Redis or database)
const rateLimitStore = {
  requests: [] as Array<{ timestamp: number; cost: number }>,
  
  addRequest(cost: number = 0) {
    const now = Date.now();
    this.requests.push({ timestamp: now, cost });
    
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
  
  getDailyCost(): number {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return this.requests
      .filter(req => req.timestamp > oneDayAgo)
      .reduce((total, req) => total + req.cost, 0);
  }
};

const PROFESSIONAL_GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Source Sans Pro',  // Modern/Clean
  'Montserrat', 'Poppins', 'Lato', 'Nunito',         // Business/Professional
  'Lora', 'Crimson Text', 'Playfair Display',        // Academic/Elegant
  'JetBrains Mono', 'Fira Code', 'Source Code Pro'   // Tech/Programming
] as const;

const PROFESSIONAL_LUCIDE_ICONS = [
  // Achievement/Progress
  'Trophy', 'Target', 'Zap', 'TrendingUp', 'Star', 'Award',
  // Tech/Programming  
  'Code', 'Cpu', 'Database', 'Globe', 'Monitor', 'Smartphone',
  // Creative/Art
  'Palette', 'Brush', 'Image', 'Music', 'Camera', 'PenTool',
  // Academic/Education
  'BookOpen', 'GraduationCap', 'Lightbulb', 'Search', 'Library', 'Brain',
  // Business/Professional
  'Briefcase', 'ChartBar', 'DollarSign', 'Users', 'Building', 'FileText'
] as const;

const PROFESSIONAL_TAILWIND_COLORS = [
  // Blue family (trust, professional)
  'blue-600', 'blue-700', 'blue-800', 'indigo-600', 'indigo-700',
  // Purple family (creative, innovative)
  'purple-600', 'purple-700', 'violet-600', 'violet-700',
  // Green family (growth, success)
  'emerald-600', 'emerald-700', 'teal-600', 'teal-700',
  // Red family (energy, passion)
  'red-600', 'red-700', 'rose-600', 'rose-700',
  // Gray family (neutral, professional)
  'gray-600', 'gray-700', 'slate-600', 'slate-700'
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate estimated cost for OpenAI API call
 */
function calculateEstimatedCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * OPENAI_CONFIG.costPer1kTokens;
  const outputCost = (outputTokens / 1000) * OPENAI_CONFIG.costPer1kTokens;
  return inputCost + outputCost;
}

/**
 * Analyze topic for learning classification with enhanced accuracy
 */
function analyzeTopic(topic: string): { analyzedTopic: string; learningFocus: string; roadmapType: string } {
  // Enhanced topic analysis with improved classification accuracy
  const topicLower = topic.toLowerCase();
  
  // Career-focused indicators (high priority)
  const careerKeywords = ['career', 'job', 'profession', 'become', 'work as', 'get hired', 'salary', 'industry', 'professional'];
  if (careerKeywords.some(keyword => topicLower.includes(keyword))) {
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "career preparation and professional development",
      roadmapType: "career-focused"
    };
  }
  
  // Project-based indicators (high priority)
  const projectKeywords = ['build', 'create', 'make', 'develop', 'project', 'app', 'website', 'game', 'tool', 'system'];
  if (projectKeywords.some(keyword => topicLower.includes(keyword))) {
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "practical implementation and hands-on building",
      roadmapType: "project-based"
    };
  }
  
  // Academic indicators (medium priority)
  const academicKeywords = ['study', 'theory', 'understand', 'learn about', 'academic', 'research', 'concept', 'principle'];
  if (academicKeywords.some(keyword => topicLower.includes(keyword))) {
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "theoretical understanding and conceptual clarity",
      roadmapType: "academic-theory"
    };
  }
  
  // Skill enhancement indicators (medium priority)
  const skillKeywords = ['improve', 'get better', 'master', 'advanced', 'expert', 'enhance', 'optimize', 'perfect'];
  if (skillKeywords.some(keyword => topicLower.includes(keyword))) {
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "skill advancement and performance improvement",
      roadmapType: "skill-enhancement"
    };
  }
  
  // Hobby/leisure indicators (low priority)
  const hobbyKeywords = ['hobby', 'fun', 'enjoy', 'start', 'get into', 'learn for fun', 'personal'];
  if (hobbyKeywords.some(keyword => topicLower.includes(keyword))) {
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "personal enjoyment and practical skills",
      roadmapType: "hobby-leisure"
    };
  }
  
  // Technology-specific classification
  const techTopics = ['programming', 'coding', 'software', 'web', 'mobile', 'data', 'ai', 'machine learning', 'cybersecurity'];
  if (techTopics.some(tech => topicLower.includes(tech))) {
    // Default tech topics to career-focused unless explicitly hobby
    if (hobbyKeywords.some(keyword => topicLower.includes(keyword))) {
      return {
        analyzedTopic: topic.trim(),
        learningFocus: "personal enjoyment and practical skills",
        roadmapType: "hobby-leisure"
      };
    }
    return {
      analyzedTopic: topic.trim(),
      learningFocus: "career preparation and professional development",
      roadmapType: "career-focused"
    };
  }
  
  // Default to comprehensive learning
  return {
    analyzedTopic: topic.trim(),
    learningFocus: "comprehensive learning from basics to advanced",
    roadmapType: "comprehensive-learning"
  };
}

/**
 * Get context instructions based on roadmap type
 */
function getContextInstructions(roadmapType: string, topic: string): string {
  switch (roadmapType) {
    case "career-focused":
      return `Focus on career preparation for ${topic}. Emphasize job-ready skills, industry certifications, portfolio building, networking, and practical experience. Include real-world applications and professional development.`;
    
    case "project-based":
      return `Focus on practical implementation for ${topic}. Emphasize tools, frameworks, step-by-step implementation, and hands-on project building. Include specific technologies and actionable development steps.`;
    
    case "academic-theory":
      return `Focus on theoretical understanding of ${topic}. Emphasize conceptual clarity, foundational principles, academic resources, and deep comprehension. Include textbooks, research papers, and theoretical frameworks.`;
    
    case "skill-enhancement":
      return `Focus on improving existing skills in ${topic}. Assume the learner has basic knowledge and wants to advance to intermediate/advanced levels. Include advanced techniques, optimization strategies, and mastery-level concepts.`;
    
    case "comprehensive-learning":
      return `Create a complete learning journey for ${topic} from absolute beginner to advanced practitioner. Cover fundamentals, core concepts, practical applications, and advanced techniques.`;
    
    default:
      return `Create a well-rounded learning path for ${topic} that balances theory with practical application.`;
  }
}

/**
 * Get structure guidelines based on roadmap type and skill level
 */
function getStructureGuidelines(roadmapType: string, skillLevel: string): string {
  const baseGuidelines = `- Start with essential fundamentals and prerequisites
- Progress logically from basic to advanced concepts
- Include practical application and hands-on practice
- End with mastery or specialization opportunities
- Ensure each milestone builds upon previous knowledge
- Scale roadmap depth and pacing to the specified time commitment
- Adapt to learner's skill level (${skillLevel}) with no assumed prior knowledge if beginner
- Always include practice tasks or reflection questions per milestone
- Avoid hallucinated links; provide official documentation or clear search guidance if no reliable resource exists`;

  switch (roadmapType) {
    case "career-focused":
      return `${baseGuidelines}
- Emphasize industry-relevant skills and certifications
- Include portfolio-building and networking milestones
- Focus on job market requirements and professional standards
- Include real-world project experience and case studies`;
    
    case "project-based":
      return `${baseGuidelines}
- Focus on practical implementation and hands-on building
- Emphasize specific tools, frameworks, and technologies
- Include step-by-step project development milestones
- Prioritize working code and functional applications`;
    
    case "academic-theory":
      return `${baseGuidelines}
- Emphasize theoretical foundations and conceptual understanding
- Include academic resources, textbooks, and research materials
- Focus on deep comprehension rather than practical application
- Include theoretical frameworks and mathematical foundations`;
    
    case "skill-enhancement":
      return `${baseGuidelines}
- Focus on advanced techniques and optimization
- Include performance improvement strategies
- Emphasize practical mastery and real-world application
- Consider competitive or professional standards`;
    
    case "comprehensive-learning":
      return `${baseGuidelines}
- Cover complete skill development from scratch
- Include foundational knowledge and theory
- Balance breadth and depth of learning
- Prepare for real-world application and career development`;
    
    default:
      return baseGuidelines;
  }
}

/**
 * Get resource guidelines based on roadmap type
 */
function getResourceGuidelines(roadmapType: string): string {
  const baseGuidelines = `- Include a mix of theoretical and practical resources
- Focus on high-quality, current content
- Prefer official documentation and trusted sources
- Include both beginner-friendly and advanced materials
- If no suitable article exists, insert a placeholder with 'No reliable article found – search using [term].' Do not fabricate links
- Always include learning habit tips (spaced repetition, note-taking)
- Include mindset tips (patience, iteration, real-world application)
- Include resource vetting tips (avoid outdated content, check credibility)`;

  switch (roadmapType) {
    case "career-focused":
      return `${baseGuidelines}
- Emphasize industry certifications and professional training
- Include job market resources and career guidance
- Focus on portfolio-building and networking materials
- Include real-world case studies and industry examples`;
    
    case "project-based":
      return `${baseGuidelines}
- Emphasize hands-on tutorials and practical guides
- Include specific tool and framework documentation
- Focus on step-by-step implementation resources
- Include project templates and code examples`;
    
    case "academic-theory":
      return `${baseGuidelines}
- Emphasize textbooks, research papers, and academic sources
- Include theoretical frameworks and mathematical foundations
- Focus on conceptual understanding and deep learning
- Include academic courses and scholarly resources`;
    
    case "skill-enhancement":
      return `${baseGuidelines}
- Emphasize advanced tutorials and expert-level content
- Include performance analysis and optimization resources
- Focus on practical application and real-world scenarios
- Consider competitive or professional training materials`;
    
    case "comprehensive-learning":
      return `${baseGuidelines}
- Start with beginner-friendly foundational content
- Progress to intermediate and advanced materials
- Include comprehensive guides and complete courses
- Balance theory with practical application`;
    
    default:
      return baseGuidelines;
  }
}

// ============================================================================
// CORE OPENAI SERVICE FUNCTIONS
// ============================================================================

/**
 * Generate topic-specific customization using OpenAI
 */
export async function generateCustomization(topic: string, maxTokensMode: boolean = false): Promise<TopicCustomization> {
  const startTime = Date.now();
  
  try {
    // Validate API key - return fallback instead of throwing error
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured, using default customization');
      return getDefaultCustomization(topic);
    }

    // Rate limiting and quota checks
    const requestsPerMinute = rateLimitStore.getRequestsInLastMinute();
    const requestsPerHour = rateLimitStore.getRequestsInLastHour();
    const dailyCost = rateLimitStore.getDailyCost();
    
    if (requestsPerMinute >= OPENAI_CONFIG.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded: Too many requests per minute');
    }
    
    if (requestsPerHour >= OPENAI_CONFIG.maxRequestsPerHour) {
      throw new Error('Quota exceeded: Too many requests per hour');
    }
    
    if (dailyCost >= OPENAI_CONFIG.maxDailyCost) {
      throw new Error('Daily spending limit exceeded');
    }

    const customizationPrompt = `Analyze topic: "${topic}"

Classify topic type and select professional styling.

RESOURCES:
- FONTS: ${PROFESSIONAL_GOOGLE_FONTS.join(', ')}
- ICONS: ${PROFESSIONAL_LUCIDE_ICONS.join(', ')}
- COLORS: ${PROFESSIONAL_TAILWIND_COLORS.join(', ')}

Return JSON only:
{
  "category": "tech|art|academic|business|sports|other",
  "font": "selected-font",
  "icon": "selected-icon",
  "accentColor": "tailwind-color", 
  "background": "none"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'SkillForge-LearningApp/1.0',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional UI/UX designer. Always respond with valid JSON only. Do not include any markdown formatting or additional text outside the JSON object.'
          },
          {
            role: 'user',
            content: customizationPrompt
          }
        ],
        temperature: OPENAI_CONFIG.customizationTemperature,
        max_tokens: maxTokensMode ? undefined : OPENAI_CONFIG.customizationMaxTokens,
      }),
    });

    if (!response.ok) {
      const error = await handleOpenAIError(response);
      throw new Error(error.message);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    const customizationData = JSON.parse(content);
    
    // Validate customization data
    const validatedCustomization: TopicCustomization = {
      category: customizationData.category || 'general',
      font: customizationData.font || 'Inter',
      icon: customizationData.icon || 'Target',
      accentColor: customizationData.accentColor || 'blue-600',
      background: customizationData.background || 'none'
    };

    const cost = calculateEstimatedCost(
      data.usage?.prompt_tokens || 0,
      data.usage?.completion_tokens || 0
    );
    
    // Track usage for rate limiting
    rateLimitStore.addRequest(cost);
    
    console.log('✅ Customization generated successfully');

    return validatedCustomization;

  } catch (error) {
    console.error('❌ Customization generation failed:', error);
    
    // Return default customization on error
    return {
      category: 'general',
      font: 'Inter',
      icon: 'Target',
      accentColor: 'blue-600',
      background: 'none'
    };
  }
}

/**
 * Generate learning roadmap using OpenAI
 */
export async function generateRoadmap(request: OpenAIGenerationRequest): Promise<RoadmapData> {
  const startTime = Date.now();
  
  try {
    // Validate API key - return fallback instead of throwing error
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured, using fallback roadmap');
      return generateFallbackRoadmap(request.topic, request.skillLevel || 'beginner');
    }

    // Rate limiting and quota checks
    const requestsPerMinute = rateLimitStore.getRequestsInLastMinute();
    const requestsPerHour = rateLimitStore.getRequestsInLastHour();
    const dailyCost = rateLimitStore.getDailyCost();
    
    if (requestsPerMinute >= OPENAI_CONFIG.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded: Too many requests per minute');
    }
    
    if (requestsPerHour >= OPENAI_CONFIG.maxRequestsPerHour) {
      throw new Error('Quota exceeded: Too many requests per hour');
    }
    
    if (dailyCost >= OPENAI_CONFIG.maxDailyCost) {
      throw new Error('Daily spending limit exceeded');
    }

    // Enhanced topic analysis and prompt engineering
    const { analyzedTopic, learningFocus, roadmapType } = analyzeTopic(request.topic);
    
    const roadmapPrompt = `Create learning roadmap for: "${request.topic}"

CLASSIFICATION: ${roadmapType}
SKILL LEVEL: ${request.skillLevel}
TIME COMMITMENT: ${request.timeCommitment}

STRUCTURE GUIDELINES:
${getStructureGuidelines(roadmapType, request.skillLevel)}

RESOURCE GUIDELINES:
${getResourceGuidelines(roadmapType)}

Return JSON with structure:
{
  "topic": "${request.topic}",
  "queryType": "${roadmapType}",
  "overview": "2-3 sentence overview",
  "totalEstimatedTime": "8-12 weeks",
  "prerequisites": ["prereq1", "prereq2"],
  "tips": ["tip1", "tip2", "tip3", "tip4"],
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What will be learned and why important",
      "estimatedTime": "2-3 weeks",
      "difficulty": "beginner",
      "levelNumber": 1,
      "practiceActivity": {
        "title": "Practice Activity Title",
        "instructions": "Step-by-step instructions for the practice activity",
        "estimatedTime": "30-45 minutes",
        "difficulty": "beginner",
        "codeExample": "// Code example if applicable",
        "expectedOutcome": "What the learner should achieve"
      },
      "proTips": [
        "Pro tip 1 for this milestone",
        "Pro tip 2 for this milestone"
      ],
      "commonErrors": [
        "Common error 1 and how to avoid it",
        "Common error 2 and how to avoid it"
      ],
      "resources": [
        {
          "type": "video",
          "searchTerms": ["best tutorial beginners", "complete guide 2024"],
          "description": "What to look for"
        },
        {
          "type": "article",
          "title": "Article title",
          "url": "https://real-website.com/article",
          "description": "Brief description"
        }
      ]
    }
  ],
  }
}

REQUIREMENTS:
- EXACTLY ${TOTAL_MILESTONES} milestones, progressive difficulty (beginner → intermediate → advanced)
- Each milestone: title, description, time, difficulty, levelNumber, practiceActivity, proTips, commonErrors, 1-2 video search terms, 1-2 articles
- Scale depth to ${request.timeCommitment}
- Focus on practical application with specific practice activities
- Include 1-2 educational visuals with specific technical image prompts
- Provide real-world applications and success stories`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'SkillForge-LearningApp/1.0',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning path designer. Always respond with valid JSON only. Do not include any markdown formatting or additional text outside the JSON object.'
          },
          {
            role: 'user',
            content: roadmapPrompt
          }
        ],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: request.maxTokensMode ? undefined : OPENAI_CONFIG.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await handleOpenAIError(response);
      throw new Error(error.message);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    
    // Try to extract JSON from the response
    let jsonString = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    const roadmapData = JSON.parse(jsonString);
    
    // Validate and clean the roadmap data
    const validatedRoadmap = validateAndCleanRoadmap(roadmapData, request.topic);

    const cost = calculateEstimatedCost(
      data.usage?.prompt_tokens || 0,
      data.usage?.completion_tokens || 0
    );
    
    // Track usage for rate limiting
    rateLimitStore.addRequest(cost);
    
    console.log('✅ Roadmap generated successfully');

    return validatedRoadmap;

  } catch (error) {
    console.error('❌ Roadmap generation failed:', error);
    throw error;
  }
}

/**
 * Generate complete roadmap with integrated search queries and simple customization
 * This unified function combines roadmap generation and search query optimization for better results and lower costs
 */
export async function generateCompleteRoadmap(request: OpenAIGenerationRequest): Promise<OpenAIGenerationResponse> {
  const startTime = Date.now();
  
  try {
    // Validate API key - return fallback instead of throwing error
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured, using fallback roadmap');
      const fallbackRoadmap = generateFallbackRoadmap(request.topic, request.skillLevel || 'beginner');
      return {
        roadmap: fallbackRoadmap,
        customization: getDefaultCustomization(request.topic),
        metadata: {
          generationTime: Date.now() - startTime,
          tokensUsed: 0,
          estimatedCost: 0,
          model: 'fallback',
          fallbackUsed: true
        }
      };
    }

    // Rate limiting and quota checks
    const requestsPerMinute = rateLimitStore.getRequestsInLastMinute();
    const requestsPerHour = rateLimitStore.getRequestsInLastHour();
    const dailyCost = rateLimitStore.getDailyCost();
    
    if (requestsPerMinute >= OPENAI_CONFIG.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded: Too many requests per minute');
    }
    
    if (requestsPerHour >= OPENAI_CONFIG.maxRequestsPerHour) {
      throw new Error('Quota exceeded: Too many requests per hour');
    }
    
    if (dailyCost >= OPENAI_CONFIG.maxDailyCost) {
      throw new Error('Daily spending limit exceeded');
    }

    // Enhanced topic analysis and prompt engineering
    const { analyzedTopic, learningFocus, roadmapType } = analyzeTopic(request.topic);
    
    const unifiedPrompt = `Create comprehensive learning roadmap with optimized search strategy for: "${request.topic}"

CLASSIFICATION: ${roadmapType}
SKILL LEVEL: ${request.skillLevel}
TIME COMMITMENT: ${request.timeCommitment}

STRUCTURE GUIDELINES:
${getStructureGuidelines(roadmapType, request.skillLevel)}

RESOURCE GUIDELINES:
${getResourceGuidelines(roadmapType)}

CRITICAL: You must generate BOTH the roadmap structure AND optimized search queries that perfectly align with each milestone's learning objectives.

Return JSON with this EXACT structure:
{
  "roadmap": {
    "topic": "${request.topic}",
    "queryType": "${roadmapType}",
    "overview": "2-3 sentence overview",
    "totalEstimatedTime": "8-12 weeks",
    "prerequisites": ["prereq1", "prereq2"],
    "tips": ["tip1", "tip2", "tip3", "tip4"],
    "milestones": [
      {
        "title": "Milestone title",
        "description": "What will be learned and why important",
        "estimatedTime": "2-3 weeks",
        "difficulty": "beginner",
        "levelNumber": 1,
        "practiceActivity": {
          "title": "Practice Activity Title",
          "instructions": "Step-by-step instructions for the practice activity",
          "estimatedTime": "30-45 minutes",
          "difficulty": "beginner",
          "codeExample": "// Code example if applicable",
          "expectedOutcome": "What the learner should achieve"
        },
        "proTips": [
          "Pro tip 1 for this milestone",
          "Pro tip 2 for this milestone"
        ],
        "commonErrors": [
          "Common error 1 and how to avoid it",
          "Common error 2 and how to avoid it"
        ],
        "resources": [
          {
            "type": "video",
            "searchTerms": ["specific search term 1", "specific search term 2"],
            "description": "What to look for in videos for this milestone"
          },
          {
            "type": "article",
            "searchTerms": ["specific article search 1", "specific article search 2"],
            "description": "What to look for in articles for this milestone"
          }
        ]
      }
    ]
  },
  "searchQueries": {
    "youtubeQueries": ["optimized youtube search 1", "optimized youtube search 2", "optimized youtube search 3"],
    "articleQueries": ["optimized article search 1", "optimized article search 2", "optimized article search 3"],
    "detectedTopic": "programming|design|business|creative|science|language|music|sports|other",
    "reasoning": "Brief explanation of search strategy and milestone alignment",
    "contentOptimization": {
      "learningStyle": "visual|auditory|kinesthetic|mixed",
      "difficultyAdjustment": "beginner-friendly|intermediate-focused|advanced-concepts",
      "contentTypes": ["tutorials", "examples", "projects", "theory", "practice"],
      "searchStrategy": "comprehensive|focused|progressive|hands-on"
    },
    "classification": {
      "domain": "computer-science|design|business|arts|science|language|music|sports|other",
      "complexity": "low|medium|high",
      "prerequisites": ["basic computer skills", "mathematics", "creativity"],
      "estimatedTime": "2-4 weeks|4-8 weeks|8-12 weeks|12+ weeks"
    }
  },
  "basicCustomization": {
    "category": "tech|art|academic|business|sports|other",
    "primaryColor": "blue|green|purple|red|orange|teal",
    "domain": "same as classification domain"
  }
}

REQUIREMENTS:
- EXACTLY ${TOTAL_MILESTONES} milestones, progressive difficulty (beginner → intermediate → advanced)
- Each milestone: title, description, time, difficulty, levelNumber, practiceActivity, proTips, commonErrors, milestone-specific search terms
- Create milestone-aware search queries that target content specifically for each learning objective
- Ensure search queries use consistent terminology and skill focus (avoid mixing different variations of the same skill)
- Include both general search queries and milestone-specific resource search terms
- Scale depth to ${request.timeCommitment}
- Focus on practical application with specific practice activities`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'SkillForge-LearningApp/1.0',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning path designer and content curator. You create comprehensive roadmaps with perfectly aligned search strategies. Always respond with valid JSON only. Do not include any markdown formatting or additional text outside the JSON object.'
          },
          {
            role: 'user',
            content: unifiedPrompt
          }
        ],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: request.maxTokensMode ? undefined : OPENAI_CONFIG.maxTokens * 1.5, // Increased for larger response
      }),
    });

    if (!response.ok) {
      const error = await handleOpenAIError(response);
      throw new Error(error.message);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    
    // Try to extract JSON from the response
    let jsonString = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    const unifiedData = JSON.parse(jsonString);
    
    // Validate and clean the data
    const validatedRoadmap = validateAndCleanRoadmap(unifiedData.roadmap, request.topic);
    
    // Create enhanced customization from basic data
    const customization: TopicCustomization = {
      category: unifiedData.basicCustomization?.category || 'general',
      font: getDefaultFontForCategory(unifiedData.basicCustomization?.category || 'general'),
      icon: getDefaultIconForCategory(unifiedData.basicCustomization?.category || 'general'),
      accentColor: getDefaultColorForCategory(unifiedData.basicCustomization?.primaryColor || 'blue'),
      background: 'none'
    };

    const cost = calculateEstimatedCost(
      data.usage?.prompt_tokens || 0,
      data.usage?.completion_tokens || 0
    );
    
    // Track usage for rate limiting
    rateLimitStore.addRequest(cost);
    
    console.log('✅ Unified roadmap and search queries generated successfully');
    console.log(`💰 Cost: $${cost.toFixed(4)} (${data.usage?.total_tokens || 0} tokens)`);

    const generationTime = Date.now() - startTime;

    return {
      roadmap: {
        ...validatedRoadmap,
        // Integrate search queries into roadmap metadata
        searchQueries: unifiedData.searchQueries || {
          youtubeQueries: [`${request.topic} tutorial`],
          articleQueries: [`${request.topic} guide`],
          detectedTopic: 'other',
          reasoning: 'Fallback queries',
          contentOptimization: {
            learningStyle: 'mixed',
            difficultyAdjustment: 'beginner-friendly',
            contentTypes: ['tutorials'],
            searchStrategy: 'basic'
          },
          classification: {
            domain: 'other',
            complexity: 'medium',
            prerequisites: ['basic knowledge'],
            estimatedTime: '4-8 weeks'
          }
        }
      },
      customization,
      metadata: {
        generationTime,
        tokensUsed: data.usage?.total_tokens || 0,
        estimatedCost: cost,
        model: OPENAI_CONFIG.model,
        fallbackUsed: false
      }
    };

  } catch (error) {
    console.error('❌ Unified roadmap generation failed:', error);
    throw error;
  }
}

// ============================================================================
// FALLBACK FUNCTIONS
// ============================================================================

/**
 * Generate a fallback roadmap when API key is missing or API fails
 */
function generateFallbackRoadmap(topic: string, skillLevel: 'beginner' | 'intermediate' | 'advanced'): RoadmapData {
      console.log(`🔄 Generating fallback roadmap`);
  
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  const timeMultiplier = skillLevel === 'beginner' ? 1.5 : skillLevel === 'intermediate' ? 1.2 : 1;
  
  return {
    topic: capitalizedTopic,
    queryType: 'fallback',
    overview: `This is a structured learning path for ${capitalizedTopic}. While we couldn't generate a custom roadmap due to missing API configuration, this roadmap will guide you through the essential concepts and skills you need to master ${topic}.`,
    totalEstimatedTime: `${Math.ceil(8 * timeMultiplier)} weeks`,
    prerequisites: [
      skillLevel === 'beginner' ? 'Basic computer literacy' : 'Basic programming concepts',
      'Willingness to learn and practice',
      'Access to learning resources'
    ],
    tips: [
      'Start with the fundamentals before moving to advanced topics',
      'Practice regularly - consistency is key to learning',
      'Join communities and forums related to your topic',
      'Build projects to apply what you learn',
      'Don\'t be afraid to make mistakes - they\'re part of learning'
    ],
         milestones: [
       {
         id: 'milestone-1',
         title: `${capitalizedTopic} Fundamentals`,
         description: `Learn the core concepts and fundamentals of ${topic}`,
         estimatedTime: `${Math.ceil(2 * timeMultiplier)} weeks`,
         difficulty: skillLevel,
         resources: []
       },
       {
         id: 'milestone-2',
         title: `Intermediate ${capitalizedTopic}`,
         description: `Build upon the basics and explore intermediate concepts`,
         estimatedTime: `${Math.ceil(3 * timeMultiplier)} weeks`,
         difficulty: skillLevel === 'beginner' ? 'intermediate' : skillLevel,
         resources: []
       },
       {
         id: 'milestone-3',
         title: `Advanced ${capitalizedTopic}`,
         description: `Master advanced techniques and best practices`,
         estimatedTime: `${Math.ceil(3 * timeMultiplier)} weeks`,
         difficulty: skillLevel === 'beginner' ? 'advanced' : skillLevel,
         resources: []
       }
     ]
  };
}

/**
 * Get default font for category
 */
function getDefaultFontForCategory(category: string): string {
  switch (category) {
    case 'tech':
    case 'programming':
      return 'JetBrains Mono';
    case 'academic':
    case 'science':
      return 'Lora';
    case 'art':
    case 'creative':
      return 'Playfair Display';
    case 'business':
      return 'Inter';
    default:
      return 'Open Sans';
  }
}

/**
 * Get default icon for category
 */
function getDefaultIconForCategory(category: string): string {
  switch (category) {
    case 'tech':
    case 'programming':
      return 'Code';
    case 'academic':
    case 'science':
      return 'BookOpen';
    case 'art':
    case 'creative':
      return 'Palette';
    case 'business':
      return 'Briefcase';
    case 'sports':
      return 'Trophy';
    default:
      return 'Target';
  }
}

/**
 * Get default color for primary color choice
 */
function getDefaultColorForCategory(primaryColor: string): string {
  switch (primaryColor) {
    case 'green':
      return 'emerald-600';
    case 'purple':
      return 'purple-600';
    case 'red':
      return 'red-600';
    case 'orange':
      return 'orange-600';
    case 'teal':
      return 'teal-600';
    case 'blue':
    default:
      return 'blue-600';
  }
}

 /**
  * Generate default customization when API key is missing
  */
 function getDefaultCustomization(topic: string): TopicCustomization {
      console.log(`🔄 Generating default customization`);
  
  // Simple topic categorization based on keywords
  const topicLower = topic.toLowerCase();
  
  let category = 'general';
  let accentColor = 'blue-600';
  let font = 'font-sans';
  let icon = '🎓';
  
  if (topicLower.includes('programming') || topicLower.includes('coding') || topicLower.includes('development')) {
    category = 'programming';
    accentColor = 'green-600';
    font = 'font-mono';
    icon = '💻';
  } else if (topicLower.includes('design') || topicLower.includes('art') || topicLower.includes('creative')) {
    category = 'design';
    accentColor = 'purple-600';
    font = 'font-serif';
    icon = '🎨';
  } else if (topicLower.includes('business') || topicLower.includes('management') || topicLower.includes('finance')) {
    category = 'business';
    accentColor = 'blue-800';
    font = 'font-sans';
    icon = '💼';
  } else if (topicLower.includes('science') || topicLower.includes('math') || topicLower.includes('physics')) {
    category = 'science';
    accentColor = 'indigo-600';
    font = 'font-serif';
    icon = '🔬';
  } else if (topicLower.includes('language') || topicLower.includes('speaking') || topicLower.includes('writing')) {
    category = 'language';
    accentColor = 'rose-600';
    font = 'font-serif';
    icon = '🗣️';
  }
  
  return {
    category,
    font,
    icon,
    accentColor,
    background: 'none'
  };
}

// ============================================================================
// SEARCH QUERY GENERATION
// ============================================================================

/**
 * Generate optimized search queries for all APIs using OpenAI
 * This replaces hardcoded topic detection and query generation
 * 
 * @param topic - The main learning topic
 * @param skillLevel - The learner's skill level
 * @param options - Configuration options for query generation
 * @param milestoneContext - Optional milestone context for more specific queries
 */
export async function generateSearchQueries(
  topic: string,
  skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  options?: {
    maxQueries?: number;
    includeVisuals?: boolean;
  },
  milestoneContext?: {
    title: string;
    description: string;
    difficulty: string;
  }
): Promise<{
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
}> {
  const maxQueries = options?.maxQueries || 3;
  const includeVisuals = options?.includeVisuals ?? true;

  // Build context-aware prompt
  let contextInfo = '';
  if (milestoneContext) {
    contextInfo = `

MILESTONE CONTEXT (for more specific queries):
- Title: "${milestoneContext.title}"
- Description: "${milestoneContext.description}"
- Difficulty: ${milestoneContext.difficulty}

Use this milestone context to generate more targeted and relevant queries that specifically address what this milestone teaches.`;
  }

  // Create dynamic query placeholders based on maxQueries
  const queryPlaceholders = Array.from({ length: maxQueries }, (_, i) => `"query${i + 1}"`).join(', ');
  
  const prompt = `You are an expert at generating search queries for educational content and analyzing learning topics.

Given a learning topic and skill level, provide:
1. Optimized search queries for YouTube and Articles
2. Content classification and analysis
3. Learning optimization recommendations

Topic: "${topic}"
Skill Level: ${skillLevel}${contextInfo}

Requirements:
- Generate ${maxQueries} focused queries for YouTube and Articles
- Queries should be specific and educational-focused (3-8 words max)
- Avoid generic terms like "how to learn" or "tutorial"
- For ${skillLevel} level, use appropriate terminology

- CRITICAL: Disambiguate ambiguous topics to ensure ALL content is on the same specific skill
  Examples: 
  - "juggling" → "3 ball juggling" (NOT soccer juggling, NOT contact juggling)
  - "photography" → "digital photography" (NOT film photography, NOT phone photography)
  - "cooking" → "home cooking" (NOT professional cooking, NOT baking)
  - "dancing" → "hip hop dancing" (NOT ballet, NOT salsa)
  - "guitar" → "acoustic guitar" (NOT electric guitar, NOT bass guitar)
  - "painting" → "watercolor painting" (NOT oil painting, NOT digital painting)
  
- ALWAYS choose the MOST COMMON interpretation of the skill and stick to it consistently
- NEVER mix different types of the same skill category in the same roadmap
${milestoneContext ? `
- Use milestone context to create highly specific queries that match the learning objectives` : ''}

Return a JSON object with this exact structure:
{
  "youtubeQueries": [${queryPlaceholders}],
  "articleQueries": [${queryPlaceholders}],
  "detectedTopic": "programming|design|business|creative|science|language|music|sports|other",
  "reasoning": "Brief explanation of why these queries were chosen, including which specific skill variation was chosen and why",
  "contentOptimization": {
    "learningStyle": "visual|auditory|kinesthetic|mixed",
    "difficultyAdjustment": "beginner-friendly|intermediate-focused|advanced-concepts",
    "contentTypes": ["tutorials", "examples", "projects", "theory", "practice"],
    "searchStrategy": "comprehensive|focused|progressive|hands-on"
  },
  "classification": {
    "domain": "computer-science|design|business|arts|science|language|music|sports|other",
    "complexity": "low|medium|high",
    "prerequisites": ["basic computer skills", "mathematics", "creativity"],
    "estimatedTime": "2-4 weeks|4-8 weeks|8-12 weeks|12+ weeks"
  }
}

Example for "juggling" (beginner):
{
  "youtubeQueries": ["3 ball juggling tutorial", "basic juggling patterns", "learn to juggle balls"],
  "articleQueries": ["3 ball juggling guide", "juggling basics tutorial", "ball juggling techniques"],

  "detectedTopic": "sports",
  "reasoning": "Chose 3 ball juggling (the most common form) specifically to avoid confusion with soccer juggling, contact juggling, or other variations. All queries focus on traditional ball juggling.",
  "contentOptimization": {
    "learningStyle": "mixed",
    "difficultyAdjustment": "intermediate-focused",
    "contentTypes": ["tutorials", "examples", "projects", "practice"],
    "searchStrategy": "hands-on"
  },
  "classification": {
    "domain": "computer-science",
    "complexity": "medium",
    "prerequisites": ["JavaScript basics", "React fundamentals", "ES6+ features"],
    "estimatedTime": "4-8 weeks"
  }
}`;

  try {
    // Check if API key is available - use fallback if not
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured, using fallback search queries');
      return generateFallbackQueries(topic, skillLevel, maxQueries, milestoneContext);
    }
    
    console.log(`🤖 Generating search queries with OpenAI`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'SkillForge-LearningApp/1.0',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at generating educational search queries and analyzing learning topics. CRITICAL: Always disambiguate ambiguous skills to ensure all content focuses on the same specific skill type. Never mix different variations of the same skill category. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 800, // Increased for more detailed analysis
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const error = await handleOpenAIError(response);
      throw new Error(error.message);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    const result = JSON.parse(content);
    
    console.log(`✅ OpenAI generated comprehensive analysis`);

    return {
      youtubeQueries: result.youtubeQueries || [],
      articleQueries: result.articleQueries || [],
      imageQueries: result.imageQueries || [],
      detectedTopic: result.detectedTopic || 'other',
      reasoning: result.reasoning || 'No reasoning provided',
      contentOptimization: result.contentOptimization || {
        learningStyle: 'mixed',
        difficultyAdjustment: 'beginner-friendly',
        contentTypes: ['tutorials', 'examples'],
        searchStrategy: 'comprehensive'
      },
      classification: result.classification || {
        domain: 'other',
        complexity: 'medium',
        prerequisites: ['basic knowledge'],
        estimatedTime: '4-8 weeks'
      }
    };

  } catch (error) {
    console.error('❌ OpenAI search query generation failed:', error);
    
    // Fallback to basic queries if OpenAI fails
    const fallbackQueries = generateFallbackQueries(topic, skillLevel, maxQueries, milestoneContext);
    
    console.log(`🔄 Using fallback queries due to OpenAI error`);
    
    return {
      ...fallbackQueries,
      detectedTopic: 'other',
      reasoning: 'Fallback queries used due to OpenAI error',
      contentOptimization: {
        learningStyle: 'mixed',
        difficultyAdjustment: 'beginner-friendly',
        contentTypes: ['tutorials', 'examples'],
        searchStrategy: 'comprehensive'
      },
      classification: {
        domain: 'other',
        complexity: 'medium',
        prerequisites: ['basic knowledge'],
        estimatedTime: '4-8 weeks'
      }
    };
  }
}

/**
 * Generate fallback search queries when OpenAI fails
 */
function generateFallbackQueries(
  topic: string,
  skillLevel: 'beginner' | 'intermediate' | 'advanced',
  maxQueries: number,
  milestoneContext?: {
    title: string;
    description: string;
    difficulty: string;
  }
): {
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
} {
  const cleanTopic = topic.replace(/\b(how to|learn|tutorial|guide)\b/gi, '').trim();
  
  // Use milestone context to generate more specific queries if available
  let queryBase = cleanTopic;
  let reasoning = `Fallback queries generated for ${topic} due to missing API key`;
  
  if (milestoneContext) {
    // Extract key terms from milestone title and description
    const milestoneTerms = `${milestoneContext.title} ${milestoneContext.description}`
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'will', 'learn', 'about'].includes(word))
      .slice(0, 3)
      .join(' ');
    
    if (milestoneTerms) {
      queryBase = `${cleanTopic} ${milestoneTerms}`;
      reasoning = `Fallback queries generated for ${topic} - milestone: "${milestoneContext.title}" due to missing API key`;
    }
  }
  
  const youtubeQueries = [
    `${queryBase} tutorial`,
    `${queryBase} ${milestoneContext?.difficulty || skillLevel}`,
    `${queryBase} examples`
  ].slice(0, maxQueries);

  const articleQueries = [
    `${queryBase} guide`,
    `${queryBase} tutorial`,
    `${queryBase} best practices`
  ].slice(0, maxQueries);

  const imageQueries = [
    `${queryBase} diagram`,
    `${queryBase} chart`,
    `${queryBase} infographic`
  ].slice(0, maxQueries);

  return {
    youtubeQueries,
    articleQueries,
    imageQueries,
    detectedTopic: cleanTopic,
    reasoning,
    contentOptimization: {
      learningStyle: 'mixed',
      difficultyAdjustment: `${skillLevel}-focused`,
      contentTypes: ['tutorials', 'guides', 'examples'],
      searchStrategy: milestoneContext ? 'milestone-specific' : 'basic'
    },
    classification: {
      domain: 'general',
      complexity: skillLevel === 'beginner' ? 'low' : skillLevel === 'intermediate' ? 'medium' : 'high',
      prerequisites: ['basic knowledge'],
      estimatedTime: '4-8 weeks'
    }
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle OpenAI API errors
 */
async function handleOpenAIError(response: Response): Promise<OpenAIError> {
  const errorData = await response.text();
  console.error('OpenAI API error:', response.status, response.statusText);
  console.error('Error details:', errorData);
  
  let error: OpenAIError;
  
  switch (response.status) {
    case 401:
      error = {
        type: 'invalid_key',
        message: 'Invalid OpenAI API key',
        statusCode: response.status,
        retryable: false
      };
      break;
      
    case 429:
      error = {
        type: 'rate_limit',
        message: 'OpenAI API rate limit exceeded',
        statusCode: response.status,
        retryable: true
      };
      break;
      
    case 402:
      error = {
        type: 'quota_exceeded',
        message: 'OpenAI API quota exceeded',
        statusCode: response.status,
        retryable: false
      };
      break;
      
    case 500:
    case 502:
    case 503:
    case 504:
      error = {
        type: 'service_unavailable',
        message: 'OpenAI service temporarily unavailable',
        statusCode: response.status,
        retryable: true
      };
      break;
      
    default:
      error = {
        type: 'api_error',
        message: `OpenAI API error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
        retryable: response.status >= 500
      };
  }
  
  return error;
}

// ============================================================================
// VALIDATION AND CLEANING
// ============================================================================

/**
 * Validate and clean roadmap data
 */
function validateAndCleanRoadmap(data: any, topic: string): RoadmapData {
  const validQueryTypes = ['career-focused', 'project-based', 'academic-theory', 'skill-enhancement', 'hobby-leisure'] as const;
  type ValidQueryType = typeof validQueryTypes[number];
  
  const isValidQueryType = (type: string | undefined): type is ValidQueryType => {
    return type !== undefined && validQueryTypes.includes(type as ValidQueryType);
  };
  
  return {
    topic: data.topic || topic,
    queryType: isValidQueryType(data.queryType) ? data.queryType : 'comprehensive-learning',
    overview: data.overview || `Learn ${topic} step by step`,
    totalEstimatedTime: data.totalEstimatedTime || '8-12 weeks',
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
    tips: Array.isArray(data.tips) ? data.tips : [],
         milestones: Array.isArray(data.milestones) 
       ? data.milestones.map((milestone: any, index: number) => {
           const validDifficulties = ['beginner', 'intermediate', 'advanced'] as const;
           type ValidDifficulty = typeof validDifficulties[number];
           
           const isValidDifficulty = (diff: string): diff is ValidDifficulty => {
             return validDifficulties.includes(diff as ValidDifficulty);
           };
           
           return {
             id: `milestone-${index + 1}`,
             title: milestone.title || `Milestone ${index + 1}`,
             description: milestone.description || 'Learn this topic',
             estimatedTime: milestone.estimatedTime || '2-3 weeks',
             difficulty: isValidDifficulty(milestone.difficulty) ? milestone.difficulty : 'beginner',
             levelNumber: milestone.levelNumber || index + 1,
             practiceActivity: milestone.practiceActivity || {
               title: `Practice ${index + 1}`,
               instructions: 'Complete the practice activity for this milestone',
               estimatedTime: '30-45 minutes',
               difficulty: 'beginner',
               codeExample: '',
               expectedOutcome: 'Master the concepts covered in this milestone'
             },
             proTips: Array.isArray(milestone.proTips) ? milestone.proTips : [
               'Take your time with this milestone',
               'Practice regularly to reinforce learning'
             ],
             commonErrors: Array.isArray(milestone.commonErrors) ? milestone.commonErrors : [
               'Rushing through without understanding',
               'Not practicing enough'
             ],
             resources: Array.isArray(milestone.resources) ? milestone.resources : []
           };
         })
       : []
  };
}

// ============================================================================
// COST TRACKING AND MONITORING
// ============================================================================

/**
 * Get cost estimation for roadmap generation
 */
export function estimateRoadmapCost(): number {
  return calculateEstimatedCost(
    OPENAI_CONFIG.estimatedTokensPerRoadmap * 0.3, // Input tokens (30%)
    OPENAI_CONFIG.estimatedTokensPerRoadmap * 0.7  // Output tokens (70%)
  );
}

/**
 * Log cost usage for monitoring
 */
export function logCostUsage(topic: string, inputTokens: number, outputTokens: number): void {
  const cost = calculateEstimatedCost(inputTokens, outputTokens);
  console.log('💰 OpenAI API Cost:', `$${cost.toFixed(4)}`);
}

/**
 * Get current usage statistics
 */
export function getUsageStats() {
  return {
    requestsPerMinute: rateLimitStore.getRequestsInLastMinute(),
    requestsPerHour: rateLimitStore.getRequestsInLastHour(),
    dailyCost: rateLimitStore.getDailyCost(),
    maxRequestsPerMinute: OPENAI_CONFIG.maxRequestsPerMinute,
    maxRequestsPerHour: OPENAI_CONFIG.maxRequestsPerHour,
    maxDailyCost: OPENAI_CONFIG.maxDailyCost
  };
}

/**
 * Check if usage is within limits
 */
export function checkUsageLimits(): { withinLimits: boolean; warnings: string[] } {
  const stats = getUsageStats();
  const warnings: string[] = [];
  
  if (stats.requestsPerMinute >= stats.maxRequestsPerMinute * 0.8) {
    warnings.push('Approaching rate limit (80% of minute limit)');
  }
  
  if (stats.requestsPerHour >= stats.maxRequestsPerHour * 0.8) {
    warnings.push('Approaching hourly quota (80% of hour limit)');
  }
  
  if (stats.dailyCost >= stats.maxDailyCost * 0.8) {
    warnings.push('Approaching daily spending limit (80% of daily limit)');
  }
  
  return {
    withinLimits: warnings.length === 0,
    warnings
  };
}

// ============================================================================
// INTELLIGENT IMAGE QUERY GENERATION
// ============================================================================

/**
 * Generate intelligent image search queries using AI
 * AI decides whether images are useful for the topic and what type to search for
 */
export async function generateIntelligentImageQueries(
  topic: string,
  skillLevel: 'beginner' | 'intermediate' | 'advanced',
  domain: string
): Promise<{
  shouldSearch: boolean;
  queries: string[];
  visualType: 'mindmap' | 'diagram' | 'infographic' | 'flowchart' | 'technical' | 'general';
  reasoning: string;
}> {
  const prompt = `You are an expert at determining whether visual learning content would be helpful for learning a specific topic.

Topic: "${topic}"
Skill Level: ${skillLevel}
Domain: ${domain}

Your task is to:
1. Determine if visual content (diagrams, mindmaps, infographics, etc.) would be helpful for learning this topic
2. If helpful, generate 2-3 specific search queries for finding relevant visual content
3. Choose the most appropriate visual type from: mindmap, diagram, infographic, flowchart, technical, general

Consider:
- Some topics (like "how to improve communication") benefit greatly from visual content
- Some topics (like "how to meditate") might not need complex diagrams
- Technical topics often need technical diagrams
- Conceptual topics benefit from mindmaps and infographics
- Process-based topics need flowcharts

Respond in this exact JSON format:
{
  "shouldSearch": true/false,
  "queries": ["query1", "query2", "query3"],
  "visualType": "mindmap|diagram|infographic|flowchart|technical|general",
  "reasoning": "Brief explanation of why images are/aren't useful for this topic"
}

Examples:
- For "data structures": shouldSearch=true, visualType="diagram", queries=["data structures visualization", "binary tree diagram", "linked list visualization"]
- For "meditation techniques": shouldSearch=false, reasoning="Meditation is experiential and doesn't benefit from complex diagrams"
- For "communication skills": shouldSearch=true, visualType="infographic", queries=["communication skills infographic", "active listening diagram", "body language guide"]`;

  try {
    // Check if API key is available - return fallback if not
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured, using fallback image queries');
      return {
        shouldSearch: true,
        queries: [`${topic} diagram`, `${topic} infographic`],
        visualType: 'general',
        reasoning: 'Fallback: API key not configured, using basic search queries'
      };
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'SkillForge-LearningApp/1.0',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content curator who understands when visual learning aids are beneficial.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Parse JSON response
    const result = JSON.parse(content);
    
    // Validate response structure
    if (typeof result.shouldSearch !== 'boolean' || 
        !Array.isArray(result.queries) || 
        !result.visualType || 
        !result.reasoning) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return {
      shouldSearch: result.shouldSearch,
      queries: result.queries.slice(0, 3), // Limit to 3 queries max
      visualType: result.visualType,
      reasoning: result.reasoning
    };

  } catch (error) {
    console.error('[OpenAI] Intelligent image query generation failed:', error);
    
    // Fallback: return basic search for most topics
    return {
      shouldSearch: true,
      queries: [`${topic} diagram`, `${topic} infographic`],
      visualType: 'general',
      reasoning: 'Fallback: Basic visual search due to AI error'
    };
  }
}

/**
 * Generate skill deconstruction using OpenAI
 * This function breaks down skills into progressive levels with "Do This Now" practice activities
 */
export async function generateSkillDeconstruction(request: SkillDeconstructionRequest): Promise<SkillDeconstructionData> {
  const startTime = Date.now();
  
  try {
    // Validate API key - return fallback instead of throwing error
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API key not configured, using fallback skill deconstruction');
      return generateFallbackSkillDeconstruction(request.topic, request.skillLevel || 'beginner');
    }

    // Rate limiting and quota checks (reusing existing logic)
    const requestsPerMinute = rateLimitStore.getRequestsInLastMinute();
    const requestsPerHour = rateLimitStore.getRequestsInLastHour();
    const dailyCost = rateLimitStore.getDailyCost();
    
    if (requestsPerMinute >= OPENAI_CONFIG.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded: Too many requests per minute');
    }
    
    if (requestsPerHour >= OPENAI_CONFIG.maxRequestsPerHour) {
      throw new Error('Quota exceeded: Too many requests per hour');
    }
    
    if (dailyCost >= OPENAI_CONFIG.maxDailyCost) {
      throw new Error('Daily spending limit exceeded');
    }

    // Enhanced topic analysis (reusing existing logic)
    const { analyzedTopic, learningFocus, roadmapType } = analyzeTopic(request.topic);
    
    const deconstructionPrompt = `Deconstruct skill: "${request.topic}"

SKILL LEVEL: ${request.skillLevel}
TIME COMMITMENT: ${request.timeCommitment}
LEARNING FOCUS: ${learningFocus}

FIRST: Classify this skill as either "physical" or "abstract" based on the nature of the skill.
- Physical skills involve bodily movements, muscle memory, and physical coordination (e.g., juggling, dancing, cooking, sports)
- Abstract skills involve mental processes, problem-solving, and cognitive abilities (e.g., programming, mathematics, writing, analysis)

STRUCTURE GUIDELINES:
- Create 3-5 progressive levels (Foundation → Intermediate → Advanced)
- Each level contains 2-4 specific milestones
- Each milestone includes a "Do This Now" practice activity
- Focus on the 20% of skills that yield 80% of results
- Ensure each milestone builds upon previous knowledge
- Scale depth and pacing to the specified time commitment

PRACTICE ACTIVITY GUIDELINES:
Based on your skill classification, use appropriate practice structure:
- For PHYSICAL skills: Use "reps" and "sets" structure (e.g., "10 reps, 3 sets"), include specific physical movements, focus on muscle memory and coordination
- For ABSTRACT skills: Use "code challenges" or "problem-solving exercises", include specific tasks with measurable outcomes, focus on understanding and application

Return JSON with structure:
{
  "skillName": "Skill Name",
  "skillType": "physical|abstract",
  "userQuery": "${request.topic}",
  "overview": "2-3 sentence overview of the skill",
  "totalEstimatedTime": 120,
  "difficulty": "${request.skillLevel}",
  "prerequisites": ["prereq1", "prereq2"],
  "tips": ["tip1", "tip2", "tip3"],
  "levels": [
    {
      "level": 1,
      "title": "Level 1: Foundation",
      "description": "Basic understanding and initial attempts",
      "estimatedTime": 30,
      "milestones": [
        {
          "id": "milestone_1",
          "title": "Milestone title",
          "description": "What will be learned and why important",
          "estimatedTime": 15,
          "difficulty": "beginner",
          "doThisNow": {
            "prompt": "Specific practice instruction with reps/sets or code challenge",
            "reps": 3,
            "sets": 1,
            "successCriteria": "Clear criteria for completion",
            "activityType": "physical_practice|code_challenge",
            "estimatedTime": 10
          },
          "icon": "target",
          "content": {
            "videos": [],
            "articles": [],
            "images": []
          }
        }
      ]
    }
  ]
}

REQUIREMENTS:
- EXACTLY 3-5 levels with progressive difficulty
- Each level: 2-4 milestones with specific practice activities
- Each milestone: clear "Do This Now" prompt with reps/sets or code challenge
- Scale total time to ${request.timeCommitment}
- Focus on practical, actionable learning
- Include specific success criteria for each practice activity`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'SkillForge-LearningApp/1.0',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert skill deconstruction specialist who breaks down complex skills into progressive, actionable learning levels with mandatory practice activities. Always respond with valid JSON only. Do not include any markdown formatting or additional text outside the JSON object.'
          },
          {
            role: 'user',
            content: deconstructionPrompt
          }
        ],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: request.maxTokensMode ? undefined : OPENAI_CONFIG.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await handleOpenAIError(response);
      throw new Error(error.message);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content.trim();
    
    // Try to extract JSON from the response (reusing existing logic)
    let jsonString = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    const deconstructionData = JSON.parse(jsonString);
    
    // Add unique ID and validate data
    const validatedDeconstruction: SkillDeconstructionData = {
      id: generateUniqueId(),
      skillName: deconstructionData.skillName || request.topic,
      skillType: deconstructionData.skillType || 'abstract',
      userQuery: request.topic,
      levels: deconstructionData.levels || [],
      totalEstimatedTime: deconstructionData.totalEstimatedTime || 120,
      difficulty: deconstructionData.difficulty || request.skillLevel || 'beginner',
      overview: deconstructionData.overview || `Structured learning path for ${request.topic}`,
      prerequisites: deconstructionData.prerequisites || [],
      tips: deconstructionData.tips || []
    };

    const cost = calculateEstimatedCost(
      data.usage?.prompt_tokens || 0,
      data.usage?.completion_tokens || 0
    );
    
    // Track usage for rate limiting (reusing existing logic)
    rateLimitStore.addRequest(cost);
    
    console.log('✅ Skill deconstruction generated successfully');

    return validatedDeconstruction;

  } catch (error) {
    console.error('❌ Skill deconstruction generation failed:', error);
    throw error;
  }
}



/**
 * Generate a fallback skill deconstruction when API key is missing or API fails
 */
function generateFallbackSkillDeconstruction(topic: string, skillLevel: 'beginner' | 'intermediate' | 'advanced'): SkillDeconstructionData {
  console.log(`🔄 Generating fallback skill deconstruction`);
  
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
  // Default to abstract for fallback - AI will determine the actual type when available
  const skillType = 'abstract';
  
  return {
    id: generateUniqueId(),
    skillName: capitalizedTopic,
    skillType,
    userQuery: topic,
    overview: `This is a structured skill deconstruction for ${capitalizedTopic}. While we couldn't generate a custom deconstruction due to missing API configuration, this provides a basic framework for learning ${topic} through progressive levels and practice activities.`,
    totalEstimatedTime: 120,
    difficulty: skillLevel,
    prerequisites: [
      'Basic understanding of the topic area',
      'Willingness to practice regularly',
      'Access to learning resources'
    ],
    tips: [
      'Practice consistently, even if just for 15 minutes a day',
      'Focus on the fundamentals before moving to advanced concepts',
      'Track your progress and celebrate small wins',
      'Don\'t be afraid to make mistakes - they\'re part of learning'
    ],
    levels: [
      {
        level: 1,
        title: 'Level 1: Foundation',
        description: 'Basic understanding and initial attempts',
        estimatedTime: 30,
        milestones: [
          {
            id: 'milestone_1',
            title: 'Understanding the Basics',
            description: 'Learn the fundamental concepts and terminology',
            estimatedTime: 15,
            difficulty: 'beginner',
            doThisNow: {
              prompt: 'Complete 3 basic exercises or problems. Focus on understanding the concepts.',
              reps: 3,
              sets: 1,
              successCriteria: 'Able to demonstrate basic understanding and complete simple tasks',
              activityType: 'code_challenge',
              estimatedTime: 10
            },
            icon: 'target',
            content: { videos: [], articles: [], images: [] }
          }
        ]
      },
      {
        level: 2,
        title: 'Level 2: Building Skills',
        description: 'Developing practical abilities and confidence',
        estimatedTime: 45,
        milestones: [
          {
            id: 'milestone_2',
            title: 'Practical Application',
            description: 'Apply what you\'ve learned to real scenarios',
            estimatedTime: 20,
            difficulty: 'intermediate',
            doThisNow: {
              prompt: 'Complete 5 intermediate challenges. Focus on problem-solving and application.',
              reps: 5,
              sets: 2,
              successCriteria: 'Able to handle moderate complexity and show consistent improvement',
              activityType: 'code_challenge',
              estimatedTime: 15
            },
            icon: 'zap',
            content: { videos: [], articles: [], images: [] }
          }
        ]
      },
      {
        level: 3,
        title: 'Level 3: Mastery',
        description: 'Advanced techniques and refinement',
        estimatedTime: 45,
        milestones: [
          {
            id: 'milestone_3',
            title: 'Advanced Techniques',
            description: 'Master complex scenarios and advanced concepts',
            estimatedTime: 25,
            difficulty: 'advanced',
            doThisNow: {
              prompt: 'Complete 3 advanced challenges. Focus on optimization and innovation.',
              reps: 3,
              sets: 3,
              successCriteria: 'Able to handle complex scenarios with confidence and creativity',
              activityType: 'code_challenge',
              estimatedTime: 20
            },
            icon: 'star',
            content: { videos: [], articles: [], images: [] }
          }
        ]
      }
    ]
  };
}

/**
 * Generate unique ID for skill deconstructions
 */
function generateUniqueId(): string {
  return `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
