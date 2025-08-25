/**
 * Progress Utilities
 * Core utility functions for progress tracking and calculations
 */

import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

// ============================================================================
// PROGRESS CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate progress percentage for milestones
 */
export function calculateProgressPercentage(milestones: any[]): number {
  if (milestones.length === 0) return 0;
  
  const completed = milestones.filter(m => m.completed === true).length;
  return Math.round((completed / milestones.length) * 100);
}

/**
 * Format time spent in human-readable format
 */
export function formatTimeSpent(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hours`;
  }
  
  return `${hours} hour ${remainingMinutes} minutes`;
}

/**
 * Get time since last activity in human-readable format
 */
export function getTimeSinceLastActivity(lastActivity: string): string {
  if (!lastActivity) return 'Unknown';
  
  try {
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(lastActivityDate.getTime())) {
      return 'Unknown';
    }
    
    const diffInMinutes = differenceInMinutes(now, lastActivityDate);
    
    if (diffInMinutes < 1) {
      return 'Just now';
    }
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = differenceInHours(now, lastActivityDate);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
    const diffInDays = differenceInDays(now, lastActivityDate);
    return `${diffInDays} days ago`;
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Generate skill summary with progress information
 */
export function generateSkillSummary(skillData: any) {
  const milestones = skillData.milestones || [];
  const progressPercentage = calculateProgressPercentage(milestones);
  const completedMilestones = milestones.filter((m: any) => m.completed).length;
  const totalMilestones = milestones.length;
  
  // Find current milestone (first incomplete one)
  const currentMilestone = milestones.find((m: any) => !m.completed);
  const currentMilestoneTitle = currentMilestone ? currentMilestone.title : 'No milestones';
  
  // Determine status
  let status = 'in-progress';
  if (totalMilestones === 0) {
    status = 'not-started';
  } else if (progressPercentage === 100) {
    status = 'completed';
  }
  
  return {
    id: skillData.id,
    name: skillData.name,
    progressPercentage,
    completedMilestones,
    totalMilestones,
    currentMilestone: currentMilestoneTitle,
    lastActivity: getTimeSinceLastActivity(skillData.lastActivity),
    timeSpent: '0 minutes', // Placeholder - would calculate from actual data
    status
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate milestone data
 */
export function validateMilestoneData(milestone: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!milestone.title || milestone.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!milestone.levelNumber) {
    errors.push('Level number is required');
  }
  
  if (!milestone.description) {
    errors.push('Description is required');
  }
  
  // Validate difficulty
  if (milestone.difficulty && !['beginner', 'intermediate', 'advanced'].includes(milestone.difficulty)) {
    errors.push('Difficulty must be beginner, intermediate, or advanced');
  }
  
  // Validate estimated time
  if (milestone.estimatedTime !== undefined && milestone.estimatedTime <= 0) {
    errors.push('Estimated time must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize user input to prevent XSS and other security issues
 */
export function sanitizeUserInput(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return '';
  }
  
  // Remove HTML tags and their content
  const withoutTags = input.replace(/<[^>]*>.*?<\/[^>]*>/g, '').replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  return withoutTags.trim();
}
