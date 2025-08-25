/**
 * Unified Search Service for Skill Forge
 * Handles all search operations for videos, articles, and images
 * 
 * Features:
 * - OpenAI-powered search query generation
 * - Multi-query search with deduplication
 * - Content distribution across milestones
 * - Cost tracking and optimization
 */

// Re-export all functions from the main service file
export * from './search-service';

// Export types from service file
export type {
  SearchResults,
  SearchOptions
} from './search-service';
