/**
 * Centralized Content Configuration
 *
 * This file contains all configurable values for content distribution.
 * Change these values here to affect the entire system.
 *
 * IMPORTANT: This is the single source of truth for content configuration.
 * Do not define these values anywhere else in the codebase.
 */

// ============================================================================
// CONTENT DISTRIBUTION CONFIGURATION
// ============================================================================

/**
 * Content per milestone
 * These values determine how many resources are assigned to each milestone
 */
export const VIDEOS_PER_MILESTONE = 3;
export const ARTICLES_PER_MILESTONE = 1;

/**
 * Total number of milestones in a roadmap
 * This affects the total content calculation and OpenAI prompt requirements
 * 
 * NOTE: This should be dynamic based on AI-generated roadmaps, not hardcoded.
 * The AI will determine the appropriate number of milestones for each skill.
 */
export const TOTAL_MILESTONES = 5; // Increased to allow for more dynamic roadmaps

/**
 * Universal content (not milestone-specific)
 * 
 * NOTE: Image search has been deprecated. This section is kept for future use.
 */
export const TOTAL_IMAGES = 0; // Disabled - no longer using image search

// ============================================================================
// SEARCH CONFIGURATION
// ============================================================================

/**
 * Default search limits for each content type
 * These are used when no specific limit is provided
 */
export const DEFAULT_VIDEO_SEARCH_LIMIT = 6;
export const DEFAULT_ARTICLE_SEARCH_LIMIT = 6;
export const DEFAULT_IMAGE_SEARCH_LIMIT = 0; // Disabled - no longer using image search

/**
 * Google Custom Search configuration
 * These affect the image search API calls
 */
export const GOOGLE_SEARCH_MAX_RESULTS = 10; // Google API limit
export const GOOGLE_SEARCH_DEFAULT_RESULTS = 1; // Default per query

// ============================================================================
// AUTO-CALCULATED VALUES
// ============================================================================

/**
 * Total content calculations (auto-calculated from above)
 * These are derived values that automatically update when base config changes
 */
export const TOTAL_VIDEOS = VIDEOS_PER_MILESTONE * TOTAL_MILESTONES;
export const TOTAL_ARTICLES = ARTICLES_PER_MILESTONE * TOTAL_MILESTONES;

// ============================================================================
// CONFIGURATION DOCUMENTATION
// ============================================================================

/**
 * How to use these configuration values:
 *
 * 1. Import the values you need:
 *    import { VIDEOS_PER_MILESTONE, TOTAL_MILESTONES } from '@/lib/config/content-config';
 *
 * 2. Use them in your functions:
 *    const targetCount = VIDEOS_PER_MILESTONE;
 *
 * 3. For OpenAI prompts, use the template literal:
 *    `EXACTLY ${TOTAL_MILESTONES} milestones`
 *
 * Examples of what changing these values affects:
 *
 * - VIDEOS_PER_MILESTONE = 1: Each milestone gets 1 video (3 total for 3 milestones)
 * - VIDEOS_PER_MILESTONE = 5: Each milestone gets 5 videos (15 total for 3 milestones)
 * - TOTAL_MILESTONES = 5: Creates 5 milestones instead of 3
 * - TOTAL_IMAGES = 5: Shows 5 images in the Universal Learning Visuals section
 * - DEFAULT_VIDEO_SEARCH_LIMIT = 10: YouTube searches return up to 10 videos per query
 * - GOOGLE_SEARCH_DEFAULT_RESULTS = 3: Google image searches return 3 images per query
 *
 * The UI automatically adapts to these changes without additional code modifications.
 */
