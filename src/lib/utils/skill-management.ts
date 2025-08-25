// ============================================================================
// SKILL MANAGEMENT UTILITIES
// ============================================================================

import { SkillDeconstructionProgress, PracticeSession } from '@/contexts/ProgressContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SkillSummary {
  id: string;
  name: string;
  skillType: 'physical' | 'abstract';
  progress: number;
  currentMilestone: string;
  totalMilestones: number;
  completedMilestones: number;
  lastActive: string;
  estimatedTimeRemaining: number;
  totalTimeSpent: number;
  currentLevel: number;
  practiceSessions: number;
  completionRate: number;
}

export interface SkillAnalytics {
  totalSkills: number;
  activeSkills: number;
  completedSkills: number;
  overallProgress: number;
  totalTimeSpent: number;
  averageCompletionRate: number;
  mostActiveSkill: string;
  recentActivity: {
    skillId: string;
    skillName: string;
    activity: string;
    timestamp: string;
  }[];
}

export interface SkillRecommendation {
  skillId: string;
  skillName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTimeToComplete: number;
}

// ============================================================================
// SKILL CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate overall progress across all skills
 */
export function calculateOverallProgress(skills: SkillDeconstructionProgress[]): number {
  if (skills.length === 0) return 0;
  
  const totalProgress = skills.reduce((sum, skill) => sum + skill.overallProgress, 0);
  return Math.round(totalProgress / skills.length);
}

/**
 * Calculate total time spent across all skills
 */
export function calculateTotalTimeSpent(skills: SkillDeconstructionProgress[]): number {
  return skills.reduce((sum, skill) => sum + skill.totalTimeSpent, 0);
}

/**
 * Calculate average completion rate across all skills
 */
export function calculateAverageCompletionRate(skills: SkillDeconstructionProgress[]): number {
  if (skills.length === 0) return 0;
  
  const totalRate = skills.reduce((sum, skill) => {
    const rate = skill.totalMilestones > 0 
      ? (skill.completedMilestones / skill.totalMilestones) * 100 
      : 0;
    return sum + rate;
  }, 0);
  
  return Math.round(totalRate / skills.length);
}

/**
 * Get the most recently active skill
 */
export function getMostActiveSkill(skills: SkillDeconstructionProgress[]): SkillDeconstructionProgress | null {
  if (skills.length === 0) return null;
  
  return skills.reduce((mostActive, skill) => {
    const mostActiveDate = new Date(mostActive.lastActivity);
    const skillDate = new Date(skill.lastActivity);
    return skillDate > mostActiveDate ? skill : mostActive;
  });
}

/**
 * Get skills that need attention (low progress or long inactivity)
 */
export function getSkillsNeedingAttention(skills: SkillDeconstructionProgress[]): SkillDeconstructionProgress[] {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return skills.filter(skill => {
    const lastActivity = new Date(skill.lastActivity);
    const isInactive = lastActivity < oneWeekAgo;
    const hasLowProgress = skill.overallProgress < 30;
    
    return isInactive || hasLowProgress;
  });
}

// ============================================================================
// SKILL SUMMARY GENERATION
// ============================================================================

/**
 * Generate a summary for a single skill
 */
export function generateSkillSummary(
  skill: SkillDeconstructionProgress, 
  practiceSessions: PracticeSession[]
): SkillSummary {
  const skillPracticeSessions = practiceSessions.filter(
    session => session.skillDeconstructionId === skill.skillDeconstructionId
  );
  
  const currentMilestone = skill.milestoneProgress.find(mp => mp.status === 'in_progress');
  const currentMilestoneName = currentMilestone ? `Level ${currentMilestone.levelNumber}` : 'Completed';
  
  const completionRate = skill.totalMilestones > 0 
    ? Math.round((skill.completedMilestones / skill.totalMilestones) * 100)
    : 0;
  
  return {
    id: skill.skillDeconstructionId,
    name: skill.skillName,
    skillType: skill.skillType,
    progress: skill.overallProgress,
    currentMilestone: currentMilestoneName,
    totalMilestones: skill.totalMilestones,
    completedMilestones: skill.completedMilestones,
    lastActive: skill.lastActivity,
    estimatedTimeRemaining: skill.estimatedTimeRemaining,
    totalTimeSpent: skill.totalTimeSpent,
    currentLevel: skill.currentLevel,
    practiceSessions: skillPracticeSessions.length,
    completionRate
  };
}

/**
 * Generate summaries for all skills
 */
export function generateAllSkillSummaries(
  skills: SkillDeconstructionProgress[],
  practiceSessions: PracticeSession[]
): SkillSummary[] {
  return skills.map(skill => generateSkillSummary(skill, practiceSessions));
}

// ============================================================================
// SKILL ANALYTICS GENERATION
// ============================================================================

/**
 * Generate comprehensive analytics for all skills
 */
export function generateSkillAnalytics(
  skills: SkillDeconstructionProgress[],
  practiceSessions: PracticeSession[]
): SkillAnalytics {
  const totalSkills = skills.length;
  const activeSkills = skills.filter(skill => skill.overallProgress < 100).length;
  const completedSkills = skills.filter(skill => skill.overallProgress === 100).length;
  const overallProgress = calculateOverallProgress(skills);
  const totalTimeSpent = calculateTotalTimeSpent(skills);
  const averageCompletionRate = calculateAverageCompletionRate(skills);
  
  const mostActiveSkill = getMostActiveSkill(skills);
  const mostActiveSkillName = mostActiveSkill ? mostActiveSkill.skillName : 'None';
  
  // Generate recent activity (last 10 activities)
  const recentActivity = generateRecentActivity(skills, practiceSessions);
  
  return {
    totalSkills,
    activeSkills,
    completedSkills,
    overallProgress,
    totalTimeSpent,
    averageCompletionRate,
    mostActiveSkill: mostActiveSkillName,
    recentActivity
  };
}

/**
 * Generate recent activity list
 */
function generateRecentActivity(
  skills: SkillDeconstructionProgress[],
  practiceSessions: PracticeSession[]
): SkillAnalytics['recentActivity'] {
  const activities: Array<{
    skillId: string;
    skillName: string;
    activity: string;
    timestamp: string;
  }> = [];
  
  // Add skill activities
  skills.forEach(skill => {
    activities.push({
      skillId: skill.skillDeconstructionId,
      skillName: skill.skillName,
      activity: `Updated progress to ${skill.overallProgress}%`,
      timestamp: skill.lastActivity
    });
  });
  
  // Add practice session activities
  practiceSessions.forEach(session => {
    const skill = skills.find(s => s.skillDeconstructionId === session.skillDeconstructionId);
    if (skill) {
      activities.push({
        skillId: session.skillDeconstructionId,
        skillName: skill.skillName,
        activity: `Completed ${session.activityType} practice`,
        timestamp: session.completedAt || session.startedAt
      });
    }
  });
  
  // Sort by timestamp and take last 10
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}

// ============================================================================
// SKILL RECOMMENDATIONS
// ============================================================================

/**
 * Generate skill recommendations based on current progress
 */
export function generateSkillRecommendations(
  skills: SkillDeconstructionProgress[]
): SkillRecommendation[] {
  const recommendations: SkillRecommendation[] = [];
  
  skills.forEach(skill => {
    // Recommend skills with low progress
    if (skill.overallProgress < 20) {
      recommendations.push({
        skillId: skill.skillDeconstructionId,
        skillName: skill.skillName,
        reason: 'Low progress - consider focusing on this skill',
        priority: 'high',
        estimatedTimeToComplete: skill.estimatedTimeRemaining
      });
    }
    
    // Recommend skills that haven't been active recently
    const lastActivity = new Date(skill.lastActivity);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    if (lastActivity < oneWeekAgo && skill.overallProgress < 100) {
      recommendations.push({
        skillId: skill.skillDeconstructionId,
        skillName: skill.skillName,
        reason: 'Inactive for over a week - time to continue learning',
        priority: 'medium',
        estimatedTimeToComplete: skill.estimatedTimeRemaining
      });
    }
    
    // Recommend skills close to completion
    if (skill.overallProgress >= 80 && skill.overallProgress < 100) {
      recommendations.push({
        skillId: skill.skillDeconstructionId,
        skillName: skill.skillName,
        reason: 'Almost complete - finish strong!',
        priority: 'high',
        estimatedTimeToComplete: skill.estimatedTimeRemaining
      });
    }
  });
  
  // Sort by priority and estimated time
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    return a.estimatedTimeToComplete - b.estimatedTimeToComplete;
  });
}

// ============================================================================
// SKILL SWITCHING UTILITIES
// ============================================================================

/**
 * Get the next recommended skill to work on
 */
export function getNextRecommendedSkill(skills: SkillDeconstructionProgress[]): SkillDeconstructionProgress | null {
  if (skills.length === 0) return null;
  
  // First, try to find skills with low progress
  const lowProgressSkills = skills.filter(skill => skill.overallProgress < 30);
  if (lowProgressSkills.length > 0) {
    return lowProgressSkills.reduce((earliest, skill) => {
      const earliestDate = new Date(earliest.startedAt);
      const skillDate = new Date(skill.startedAt);
      return skillDate < earliestDate ? skill : earliest;
    });
  }
  
  // Then, try to find skills that haven't been active recently
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const inactiveSkills = skills.filter(skill => {
    const lastActivity = new Date(skill.lastActivity);
    return lastActivity < oneWeekAgo && skill.overallProgress < 100;
  });
  
  if (inactiveSkills.length > 0) {
    return inactiveSkills.reduce((earliest, skill) => {
      const earliestDate = new Date(earliest.lastActivity);
      const skillDate = new Date(skill.lastActivity);
      return skillDate < earliestDate ? skill : earliest;
    });
  }
  
  // Finally, return the skill with the lowest progress
  return skills.reduce((lowest, skill) => 
    skill.overallProgress < lowest.overallProgress ? skill : lowest
  );
}

/**
 * Get skills that are close to completion
 */
export function getSkillsNearCompletion(skills: SkillDeconstructionProgress[]): SkillDeconstructionProgress[] {
  return skills.filter(skill => 
    skill.overallProgress >= 80 && skill.overallProgress < 100
  );
}

// ============================================================================
// TIME AND PROGRESS UTILITIES
// ============================================================================

/**
 * Format time in a human-readable format
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate time since last activity
 */
export function getTimeSinceLastActivity(lastActivity: string): string {
  const now = new Date();
  const lastActivityDate = new Date(lastActivity);
  const diffInMs = now.getTime() - lastActivityDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}

/**
 * Calculate estimated time to complete a skill
 */
export function calculateTimeToComplete(skill: SkillDeconstructionProgress): number {
  if (skill.overallProgress === 100) return 0;
  
  const remainingProgress = 100 - skill.overallProgress;
  const averageTimePerPercent = skill.totalTimeSpent / Math.max(skill.overallProgress, 1);
  
  return Math.round(remainingProgress * averageTimePerPercent);
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

// All functions are already exported above, no need for duplicate exports
