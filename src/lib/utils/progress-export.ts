/**
 * Progress Export/Import Utilities
 * Simple utilities for backing up and restoring progress data
 */

import { ProgressState } from '../../contexts/ProgressContext';

/**
 * Export progress data to JSON string
 */
export function exportProgressData(state: ProgressState): string {
  try {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: state
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export progress data:', error);
    throw new Error('Failed to export progress data');
  }
}

/**
 * Import progress data from JSON string
 */
export function importProgressData(dataString: string): ProgressState | null {
  try {
    const importData = JSON.parse(dataString);
    
    // Validate the import data structure
    if (!importData.data || !importData.version) {
      throw new Error('Invalid progress data format');
    }
    
    // Basic validation of required fields
    const requiredFields = ['learningPaths', 'skillDeconstructions', 'practiceSessions', 'achievements'];
    for (const field of requiredFields) {
      if (!(field in importData.data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return importData.data as ProgressState;
  } catch (error) {
    console.error('Failed to import progress data:', error);
    return null;
  }
}

/**
 * Download progress data as a file
 */
export function downloadProgressData(state: ProgressState, filename?: string): void {
  try {
    const dataString = exportProgressData(state);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `skill-forge-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download progress data:', error);
    throw new Error('Failed to download progress data');
  }
}

/**
 * Generate progress summary for export
 */
export function generateProgressSummary(state: ProgressState): {
  totalLearningPaths: number;
  totalSkillDeconstructions: number;
  totalPracticeSessions: number;
  totalTimeSpent: number;
  completedMilestones: number;
  unlockedAchievements: number;
  lastActivity: string;
} {
  const totalLearningPaths = Object.keys(state.learningPaths).length;
  const totalSkillDeconstructions = Object.keys(state.skillDeconstructions).length;
  const totalPracticeSessions = Object.keys(state.practiceSessions).length;
  
  const completedMilestones = Object.values(state.learningPaths).reduce((total, path) => {
    return total + path.completedMilestones;
  }, 0) + Object.values(state.skillDeconstructions).reduce((total, skill) => {
    return total + skill.completedMilestones;
  }, 0);
  
  const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
  
  return {
    totalLearningPaths,
    totalSkillDeconstructions,
    totalPracticeSessions,
    totalTimeSpent: state.totalTimeSpent,
    completedMilestones,
    unlockedAchievements,
    lastActivity: state.lastActivityDate
  };
}
