/**
 * OpenAI Service for Skill Forge
 * Handles AI-powered roadmap generation and search query generation
 * 
 * Features:
 * - Roadmap generation with GPT-4o-mini
 * - Search query generation for all APIs
 * - Content classification and optimization
 * - Cost tracking and token usage monitoring
 * - Comprehensive error handling and fallbacks
 * - Credit protection with explicit user consent
 */

// Re-export all functions from the main service file
export * from './openai-service';

// Export types from service file
export type {
  OpenAIGenerationRequest,
  OpenAIGenerationResponse,
  RoadmapData,
  TopicCustomization
} from './openai-service';
