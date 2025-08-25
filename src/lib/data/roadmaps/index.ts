/**
 * Roadmaps Data Management
 * Handles roadmap data, curation, and access
 * 
 * Features:
 * - Curated roadmap data
 * - Roadmap access and search
 * - Topic matching and fallbacks
 */

// Re-export all functions from the curated roadmaps file
export * from './curated';

// Export types from curated file
export type {
  RoadmapData,
  LearningMilestone,
  Resource
} from './curated';
