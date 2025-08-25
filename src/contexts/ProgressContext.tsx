'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    type: 'video' | 'article' | 'exercise' | 'quiz';
    estimatedTime: number; // in minutes
    completed: boolean;
    completedAt?: string;
    timeSpent: number; // in seconds
    score?: number; // 0-100
    notes?: string;
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

// ============================================================================
// SKILL DECONSTRUCTION PROGRESS TYPES
// ============================================================================

export interface SkillDeconstructionProgress {
    skillDeconstructionId: string;
    skillName: string;
    skillType: 'physical' | 'abstract';
    userQuery: string;
    startedAt: string;
    lastActivity: string;
    completedMilestones: number;
    totalMilestones: number;
    currentLevel: number;
    currentMilestoneId?: string;
    overallProgress: number; // 0-100 percentage
    estimatedTimeRemaining: number; // in minutes
    totalTimeSpent: number; // in minutes
    milestoneProgress: MilestoneProgress[];
    practiceAnalytics: PracticeAnalytics;
}

export interface MilestoneProgress {
    milestoneId: string;
    levelNumber: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    timeSpent: number; // in minutes
    practiceAttempts: number;
    practiceCompletions: number;
    notes?: string;
    difficultyRating?: number; // 1-5 scale
}

export interface PracticeAnalytics {
    totalPracticeTime: number; // in minutes
    averageDifficultyRating: number; // 1-5 scale
    mostChallengingActivity: string;
    completionRate: number; // 0-100 percentage
    totalPracticeSessions: number;
    successfulPracticeSessions: number;
}

export interface PracticeSession {
    id: string;
    milestoneId: string;
    skillDeconstructionId: string;
    activityType: 'code_challenge' | 'physical_practice' | 'reading' | 'video_watch';
    startedAt: string;
    completedAt?: string;
    timeSpent: number; // in minutes
    difficultyRating?: number; // 1-5 scale
    completed: boolean;
    notes?: string;
    reps?: number;
    sets?: number;
    successCriteria?: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    criteria: {
        type: 'milestone_count' | 'completion_percentage' | 'time_spent' | 'streak_days' | 'practice_sessions' | 'skill_level_completed';
        value: number;
        learningPathId?: string;
        skillDeconstructionId?: string;
    };
    unlocked: boolean;
    unlockedAt?: string;
}

export interface ProgressState {
    learningPaths: Record<string, LearningPath>;
    skillDeconstructions: Record<string, SkillDeconstructionProgress>;
    practiceSessions: Record<string, PracticeSession>;
    achievements: Achievement[];
    userId: string;
    totalTimeSpent: number;
    streakDays: number;
    lastActivityDate: string;
    currentSkillId?: string; // Track current active skill
    skillSwitchingHistory: string[]; // Track skill switching for navigation
}

export interface ProgressContextType {
    state: ProgressState;
    // Legacy progress management methods (for backward compatibility)
    mark_milestone_complete: (learningPathId: string, milestoneId: string, timeSpent: number, score?: number, notes?: string) => void;
    update_milestone_progress: (learningPathId: string, milestoneId: string, updates: Partial<Milestone>) => void;
    reset_milestone: (learningPathId: string, milestoneId: string) => void;
    start_learning_path: (topic: string, milestones: Omit<Milestone, 'completed' | 'completedAt' | 'timeSpent'>[]) => string;
    get_learning_path: (learningPathId: string) => LearningPath | null;
    get_all_learning_paths: () => LearningPath[];
    
    // Skill deconstruction progress methods
    start_skill_deconstruction: (skillDeconstructionData: any) => string;
    mark_milestone_complete_skill: (skillDeconstructionId: string, milestoneId: string, levelNumber: number, timeSpent: number, notes?: string, difficultyRating?: number) => void;
    start_practice_session: (skillDeconstructionId: string, milestoneId: string, activityType: string, reps?: number, sets?: number, successCriteria?: string) => string;
    complete_practice_session: (sessionId: string, timeSpent: number, completed: boolean, difficultyRating?: number, notes?: string) => void;
    update_milestone_progress_skill: (skillDeconstructionId: string, milestoneId: string, updates: Partial<MilestoneProgress>) => void;
    get_skill_deconstruction_progress: (skillDeconstructionId: string) => SkillDeconstructionProgress | null;
    get_all_skill_deconstructions: () => SkillDeconstructionProgress[];
    get_practice_sessions: (skillDeconstructionId?: string, milestoneId?: string) => PracticeSession[];
    
    // Achievement management
    unlock_achievement: (achievementId: string) => void;
    get_achievements: () => Achievement[];
    get_unlocked_achievements: () => Achievement[];
    
    // Analytics methods
    get_total_progress: () => number;
    get_learning_velocity: (days: number) => number;
    get_time_distribution: () => Record<string, number>;
    get_skill_deconstruction_analytics: (skillDeconstructionId: string) => {
        progress: SkillDeconstructionProgress;
        practiceSessions: PracticeSession[];
        timeSpent: number;
        completionRate: number;
        averageDifficulty: number;
    } | null;
    
    // Data management
    clear_progress: (learningPathId?: string, skillDeconstructionId?: string) => void;
    export_progress_data: () => string;
    import_progress_data: (data: string) => boolean;
    
    // Multi-skill management methods
    get_active_skills: () => SkillDeconstructionProgress[];
    get_completed_skills: () => SkillDeconstructionProgress[];
    get_skill_by_id: (skillId: string) => SkillDeconstructionProgress | null;
    get_skill_progress_summary: (skillId: string) => {
      progress: number;
      completedMilestones: number;
      totalMilestones: number;
      currentLevel: number;
      timeSpent: number;
      lastActivity: string;
    } | null;
    get_overall_skill_analytics: () => {
      totalSkills: number;
      activeSkills: number;
      completedSkills: number;
      overallProgress: number;
      totalTimeSpent: number;
      averageProgress: number;
    };
    switch_to_skill: (skillId: string) => void;
    get_skill_recommendations: () => Array<{
      skillId: string;
      skillName: string;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }>;
}

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_milestone',
        title: 'First Steps',
        description: 'Completed your first milestone',
        icon: '🎯',
        criteria: { type: 'milestone_count', value: 1 },
        unlocked: false
    },
    {
        id: 'speed_learner',
        title: 'Speed Learner',
        description: 'Completed 5 milestones in a single day',
        icon: '⚡',
        criteria: { type: 'milestone_count', value: 5 },
        unlocked: false
    },
    {
        id: 'dedicated_student',
        title: 'Dedicated Student',
        description: 'Maintained a 7-day learning streak',
        icon: '🔥',
        criteria: { type: 'streak_days', value: 7 },
        unlocked: false
    },
    {
        id: 'halfway_there',
        title: 'Halfway There',
        description: 'Reached 50% completion on any learning path',
        icon: '📈',
        criteria: { type: 'completion_percentage', value: 50 },
        unlocked: false
    },
    {
        id: 'time_investor',
        title: 'Time Investor',
        description: 'Spent 10 hours learning',
        icon: '⏰',
        criteria: { type: 'time_spent', value: 36000 }, // 10 hours in seconds
        unlocked: false
    },
    {
        id: 'practice_master',
        title: 'Practice Master',
        description: 'Completed 20 practice sessions',
        icon: '💪',
        criteria: { type: 'practice_sessions', value: 20 },
        unlocked: false
    },
    {
        id: 'skill_level_complete',
        title: 'Level Up',
        description: 'Completed an entire skill level',
        icon: '🏆',
        criteria: { type: 'skill_level_completed', value: 1 },
        unlocked: false
    }
];

// ============================================================================
// REDUCER ACTIONS
// ============================================================================

type ProgressAction =
    // Legacy actions
    | { type: 'MARK_MILESTONE_COMPLETE'; payload: { learningPathId: string; milestoneId: string; timeSpent: number; score?: number; notes?: string } }
    | { type: 'UPDATE_MILESTONE'; payload: { learningPathId: string; milestoneId: string; updates: Partial<Milestone> } }
    | { type: 'RESET_MILESTONE'; payload: { learningPathId: string; milestoneId: string } }
    | { type: 'START_LEARNING_PATH'; payload: { topic: string; milestones: Omit<Milestone, 'completed' | 'completedAt' | 'timeSpent'>[] } }
    
    // Skill deconstruction actions
    | { type: 'START_SKILL_DECONSTRUCTION'; payload: { skillDeconstructionData: any } }
    | { type: 'MARK_MILESTONE_COMPLETE_SKILL'; payload: { skillDeconstructionId: string; milestoneId: string; levelNumber: number; timeSpent: number; notes?: string; difficultyRating?: number } }
    | { type: 'START_PRACTICE_SESSION'; payload: { sessionId: string; skillDeconstructionId: string; milestoneId: string; activityType: string; reps?: number; sets?: number; successCriteria?: string } }
    | { type: 'COMPLETE_PRACTICE_SESSION'; payload: { sessionId: string; timeSpent: number; completed: boolean; difficultyRating?: number; notes?: string } }
    | { type: 'UPDATE_MILESTONE_PROGRESS_SKILL'; payload: { skillDeconstructionId: string; milestoneId: string; updates: Partial<MilestoneProgress> } }
    
    // General actions
    | { type: 'UNLOCK_ACHIEVEMENT'; payload: { achievementId: string } }
    | { type: 'CLEAR_PROGRESS'; payload: { learningPathId?: string; skillDeconstructionId?: string } }
    | { type: 'LOAD_STATE'; payload: ProgressState }
    | { type: 'UPDATE_STREAK'; payload: { streakDays: number; lastActivityDate: string } }
    | { type: 'SWITCH_TO_SKILL'; payload: { skillId: string; timestamp: string } };

// ============================================================================
// REDUCER FUNCTION
// ============================================================================

function progress_reducer(state: ProgressState, action: ProgressAction): ProgressState {
    switch (action.type) {
        // Legacy cases (keeping for backward compatibility)
        case 'MARK_MILESTONE_COMPLETE': {
            const { learningPathId, milestoneId, timeSpent, score, notes } = action.payload;
            const learningPath = state.learningPaths[learningPathId];
            
            if (!learningPath) {
                console.warn(`Learning path ${learningPathId} not found`);
                return state;
            }

            const milestone = learningPath.milestones.find(m => m.id === milestoneId);
            if (!milestone) {
                console.warn(`Milestone ${milestoneId} not found in learning path ${learningPathId}`);
                return state;
            }

            // Update milestone
            const updatedMilestone: Milestone = {
                ...milestone,
                completed: true,
                completedAt: new Date().toISOString(),
                timeSpent,
                score,
                notes
            };

            // Update learning path
            const updatedMilestones = learningPath.milestones.map(m => 
                m.id === milestoneId ? updatedMilestone : m
            );

            const completedMilestones = updatedMilestones.filter(m => m.completed).length;
            const totalProgress = Math.round((completedMilestones / updatedMilestones.length) * 100);

            const updatedLearningPath: LearningPath = {
                ...learningPath,
                milestones: updatedMilestones,
                lastActivity: new Date().toISOString(),
                totalProgress,
                completedMilestones
            };

            // Calculate total time spent
            const totalTimeSpent = Object.values(state.learningPaths).reduce((total, path) => {
                return total + path.milestones.reduce((pathTotal, milestone) => {
                    return pathTotal + (milestone.timeSpent || 0);
                }, 0);
            }, 0) + timeSpent;

            return {
                ...state,
                learningPaths: {
                    ...state.learningPaths,
                    [learningPathId]: updatedLearningPath
                },
                totalTimeSpent
            };
        }

        case 'UPDATE_MILESTONE': {
            const { learningPathId, milestoneId, updates } = action.payload;
            const learningPath = state.learningPaths[learningPathId];
            
            if (!learningPath) return state;

            const updatedMilestones = learningPath.milestones.map(m => 
                m.id === milestoneId ? { ...m, ...updates } : m
            );

            const completedMilestones = updatedMilestones.filter(m => m.completed).length;
            const totalProgress = Math.round((completedMilestones / updatedMilestones.length) * 100);

            const updatedLearningPath: LearningPath = {
                ...learningPath,
                milestones: updatedMilestones,
                lastActivity: new Date().toISOString(),
                totalProgress,
                completedMilestones
            };

            return {
                ...state,
                learningPaths: {
                    ...state.learningPaths,
                    [learningPathId]: updatedLearningPath
                }
            };
        }

        case 'RESET_MILESTONE': {
            const { learningPathId, milestoneId } = action.payload;
            const learningPath = state.learningPaths[learningPathId];
            
            if (!learningPath) return state;

            const updatedMilestones = learningPath.milestones.map(m => 
                m.id === milestoneId ? {
                    ...m,
                    completed: false,
                    completedAt: undefined,
                    timeSpent: 0,
                    score: undefined,
                    notes: undefined
                } : m
            );

            const completedMilestones = updatedMilestones.filter(m => m.completed).length;
            const totalProgress = Math.round((completedMilestones / updatedMilestones.length) * 100);

            const updatedLearningPath: LearningPath = {
                ...learningPath,
                milestones: updatedMilestones,
                lastActivity: new Date().toISOString(),
                totalProgress,
                completedMilestones
            };

            return {
                ...state,
                learningPaths: {
                    ...state.learningPaths,
                    [learningPathId]: updatedLearningPath
                }
            };
        }

        case 'START_LEARNING_PATH': {
            const { topic, milestones } = action.payload;
            const learningPathId = `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const learningPath: LearningPath = {
                id: learningPathId,
                topic,
                milestones: milestones.map(m => ({
                    ...m,
                    completed: false,
                    timeSpent: 0
                })),
                startedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                totalProgress: 0,
                completedMilestones: 0,
                totalMilestones: milestones.length
            };

            return {
                ...state,
                learningPaths: {
                    ...state.learningPaths,
                    [learningPathId]: learningPath
                }
            };
        }

        // Skill deconstruction cases
        case 'START_SKILL_DECONSTRUCTION': {
            const { skillDeconstructionData } = action.payload;
            const skillDeconstructionId = skillDeconstructionData.id || `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Calculate total milestones across all levels
            const totalMilestones = skillDeconstructionData.levels.reduce((total, level) => {
                return total + level.milestones.length;
            }, 0);

            // Create milestone progress for each milestone
            const milestoneProgress: MilestoneProgress[] = skillDeconstructionData.levels.flatMap(level =>
                level.milestones.map(milestone => ({
                    milestoneId: milestone.id,
                    levelNumber: level.level,
                    status: 'not_started' as const,
                    timeSpent: 0,
                    practiceAttempts: 0,
                    practiceCompletions: 0
                }))
            );

            const skillDeconstructionProgress: SkillDeconstructionProgress = {
                skillDeconstructionId,
                skillName: skillDeconstructionData.skillName,
                skillType: skillDeconstructionData.skillType,
                userQuery: skillDeconstructionData.userQuery,
                startedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                completedMilestones: 0,
                totalMilestones,
                currentLevel: 1,
                overallProgress: 0,
                estimatedTimeRemaining: skillDeconstructionData.totalEstimatedTime,
                totalTimeSpent: 0,
                milestoneProgress,
                practiceAnalytics: {
                    totalPracticeTime: 0,
                    averageDifficultyRating: 0,
                    mostChallengingActivity: '',
                    completionRate: 0,
                    totalPracticeSessions: 0,
                    successfulPracticeSessions: 0
                }
            };

            return {
                ...state,
                skillDeconstructions: {
                    ...state.skillDeconstructions,
                    [skillDeconstructionId]: skillDeconstructionProgress
                }
            };
        }

        case 'MARK_MILESTONE_COMPLETE_SKILL': {
            const { skillDeconstructionId, milestoneId, levelNumber, timeSpent, notes, difficultyRating } = action.payload;
            const skillDeconstruction = state.skillDeconstructions[skillDeconstructionId];
            
            if (!skillDeconstruction) {
                console.warn(`Skill deconstruction ${skillDeconstructionId} not found`);
                return state;
            }

            // Update milestone progress
            const updatedMilestoneProgress = skillDeconstruction.milestoneProgress.map(mp => 
                mp.milestoneId === milestoneId ? {
                    ...mp,
                    status: 'completed' as const,
                    completedAt: new Date().toISOString(),
                    timeSpent: mp.timeSpent + timeSpent,
                    notes: notes || mp.notes,
                    difficultyRating: difficultyRating || mp.difficultyRating
                } : mp
            );

            // Calculate new progress
            const completedMilestones = updatedMilestoneProgress.filter(mp => mp.status === 'completed').length;
            const overallProgress = Math.round((completedMilestones / skillDeconstruction.totalMilestones) * 100);

            // Find next milestone to set as current
            const nextMilestone = updatedMilestoneProgress.find(mp => mp.status === 'not_started');
            const currentMilestoneId = nextMilestone?.milestoneId;

            // Update current level if all milestones in current level are completed
            const currentLevelMilestones = updatedMilestoneProgress.filter(mp => mp.levelNumber === skillDeconstruction.currentLevel);
            const currentLevelCompleted = currentLevelMilestones.every(mp => mp.status === 'completed');
            const nextLevel = currentLevelCompleted ? skillDeconstruction.currentLevel + 1 : skillDeconstruction.currentLevel;

            const updatedSkillDeconstruction: SkillDeconstructionProgress = {
                ...skillDeconstruction,
                lastActivity: new Date().toISOString(),
                completedMilestones,
                currentLevel: nextLevel,
                currentMilestoneId,
                overallProgress,
                totalTimeSpent: skillDeconstruction.totalTimeSpent + timeSpent,
                milestoneProgress: updatedMilestoneProgress
            };

            return {
                ...state,
                skillDeconstructions: {
                    ...state.skillDeconstructions,
                    [skillDeconstructionId]: updatedSkillDeconstruction
                }
            };
        }

        case 'START_PRACTICE_SESSION': {
            const { sessionId, skillDeconstructionId, milestoneId, activityType, reps, sets, successCriteria } = action.payload;
            
            const practiceSession: PracticeSession = {
                id: sessionId,
                milestoneId,
                skillDeconstructionId,
                activityType: activityType as any,
                startedAt: new Date().toISOString(),
                timeSpent: 0,
                completed: false,
                reps,
                sets,
                successCriteria
            };

            return {
                ...state,
                practiceSessions: {
                    ...state.practiceSessions,
                    [sessionId]: practiceSession
                }
            };
        }

        case 'COMPLETE_PRACTICE_SESSION': {
            const { sessionId, timeSpent, completed, difficultyRating, notes } = action.payload;
            const practiceSession = state.practiceSessions[sessionId];
            
            if (!practiceSession) return state;

            const updatedPracticeSession: PracticeSession = {
                ...practiceSession,
                completedAt: new Date().toISOString(),
                timeSpent,
                completed,
                difficultyRating,
                notes
            };

            // Update practice analytics for the skill deconstruction
            const skillDeconstruction = state.skillDeconstructions[practiceSession.skillDeconstructionId];
            if (skillDeconstruction) {
                const skillPracticeSessions = Object.values(state.practiceSessions).filter(
                    ps => ps.skillDeconstructionId === practiceSession.skillDeconstructionId
                );

                const totalPracticeTime = skillPracticeSessions.reduce((total, ps) => total + ps.timeSpent, 0);
                const completedSessions = skillPracticeSessions.filter(ps => ps.completed);
                const successfulSessions = completedSessions.filter(ps => ps.difficultyRating !== undefined);
                const averageDifficulty = successfulSessions.length > 0 
                    ? successfulSessions.reduce((sum, ps) => sum + (ps.difficultyRating || 0), 0) / successfulSessions.length
                    : 0;

                const mostChallengingActivity = successfulSessions.length > 0
                    ? successfulSessions.reduce((max, ps) => 
                        (ps.difficultyRating || 0) > (max.difficultyRating || 0) ? ps : max
                      ).activityType
                    : '';

                const completionRate = completedSessions.length > 0 
                    ? Math.round((completedSessions.length / skillPracticeSessions.length) * 100)
                    : 0;

                const updatedPracticeAnalytics: PracticeAnalytics = {
                    totalPracticeTime,
                    averageDifficultyRating: averageDifficulty,
                    mostChallengingActivity,
                    completionRate,
                    totalPracticeSessions: skillPracticeSessions.length,
                    successfulPracticeSessions: completedSessions.length
                };

                const updatedSkillDeconstruction: SkillDeconstructionProgress = {
                    ...skillDeconstruction,
                    lastActivity: new Date().toISOString(),
                    totalTimeSpent: skillDeconstruction.totalTimeSpent + timeSpent,
                    practiceAnalytics: updatedPracticeAnalytics
                };

                return {
                    ...state,
                    practiceSessions: {
                        ...state.practiceSessions,
                        [sessionId]: updatedPracticeSession
                    },
                    skillDeconstructions: {
                        ...state.skillDeconstructions,
                        [practiceSession.skillDeconstructionId]: updatedSkillDeconstruction
                    }
                };
            }

            return {
                ...state,
                practiceSessions: {
                    ...state.practiceSessions,
                    [sessionId]: updatedPracticeSession
                }
            };
        }

        case 'UPDATE_MILESTONE_PROGRESS_SKILL': {
            const { skillDeconstructionId, milestoneId, updates } = action.payload;
            const skillDeconstruction = state.skillDeconstructions[skillDeconstructionId];
            
            if (!skillDeconstruction) return state;

            const updatedMilestoneProgress = skillDeconstruction.milestoneProgress.map(mp => 
                mp.milestoneId === milestoneId ? { ...mp, ...updates } : mp
            );

            const updatedSkillDeconstruction: SkillDeconstructionProgress = {
                ...skillDeconstruction,
                lastActivity: new Date().toISOString(),
                milestoneProgress: updatedMilestoneProgress
            };

            return {
                ...state,
                skillDeconstructions: {
                    ...state.skillDeconstructions,
                    [skillDeconstructionId]: updatedSkillDeconstruction
                }
            };
        }

        case 'UNLOCK_ACHIEVEMENT': {
            const { achievementId } = action.payload;
            const achievement = state.achievements.find(a => a.id === achievementId);
            
            if (!achievement || achievement.unlocked) return state;

            const updatedAchievements = state.achievements.map(a => 
                a.id === achievementId ? {
                    ...a,
                    unlocked: true,
                    unlockedAt: new Date().toISOString()
                } : a
            );

            return {
                ...state,
                achievements: updatedAchievements
            };
        }

        case 'CLEAR_PROGRESS': {
            const { learningPathId, skillDeconstructionId } = action.payload;
            
            if (learningPathId) {
                const { [learningPathId]: removed, ...remainingPaths } = state.learningPaths;
                return {
                    ...state,
                    learningPaths: remainingPaths
                };
            } else if (skillDeconstructionId) {
                const { [skillDeconstructionId]: removed, ...remainingSkills } = state.skillDeconstructions;
                // Also remove related practice sessions
                const remainingPracticeSessions = Object.fromEntries(
                    Object.entries(state.practiceSessions).filter(
                        ([_, session]) => session.skillDeconstructionId !== skillDeconstructionId
                    )
                );
                return {
                    ...state,
                    skillDeconstructions: remainingSkills,
                    practiceSessions: remainingPracticeSessions
                };
            } else {
                return {
                    ...state,
                    learningPaths: {},
                    skillDeconstructions: {},
                    practiceSessions: {},
                    totalTimeSpent: 0,
                    streakDays: 0
                };
            }
        }

        case 'LOAD_STATE': {
            return action.payload;
        }

        case 'UPDATE_STREAK': {
            const { streakDays, lastActivityDate } = action.payload;
            return {
                ...state,
                streakDays,
                lastActivityDate
            };
        }

        case 'SWITCH_TO_SKILL': {
            const { skillId, timestamp } = action.payload;
            const updatedHistory = [...(state.skillSwitchingHistory || []), skillId];
            
            // Keep only the last 10 skill switches in history
            const trimmedHistory = updatedHistory.slice(-10);
            
            return {
                ...state,
                currentSkillId: skillId,
                skillSwitchingHistory: trimmedHistory,
                lastActivityDate: timestamp
            };
        }

        default:
            return state;
    }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ProgressProviderProps {
    children: ReactNode;
    userId?: string;
}

export function ProgressProvider({ children, userId = 'default_user' }: ProgressProviderProps) {
    const [state, dispatch] = useReducer(progress_reducer, {
        learningPaths: {},
        skillDeconstructions: {},
        practiceSessions: {},
        achievements: DEFAULT_ACHIEVEMENTS,
        userId,
        totalTimeSpent: 0,
        streakDays: 0,
        lastActivityDate: new Date().toISOString(),
        currentSkillId: undefined,
        skillSwitchingHistory: []
    });

    // ============================================================================
    // LOCAL STORAGE INTEGRATION
    // ============================================================================

    // Load state from localStorage on mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(`skill_forge_progress_${userId}`);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                dispatch({ type: 'LOAD_STATE', payload: parsedState });
            }
        } catch (error) {
            console.error('Failed to load progress from localStorage:', error);
        }
    }, [userId]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(`skill_forge_progress_${userId}`, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save progress to localStorage:', error);
        }
    }, [state, userId]);

    // ============================================================================
    // ACHIEVEMENT CHECKING
    // ============================================================================

    useEffect(() => {
        // Check for achievement unlocks whenever progress changes
        const check_achievements = () => {
            const totalMilestones = Object.values(state.learningPaths).reduce((total, path) => {
                return total + path.completedMilestones;
            }, 0);

            const skillDeconstructionMilestones = Object.values(state.skillDeconstructions).reduce((total, skill) => {
                return total + skill.completedMilestones;
            }, 0);

            const totalMilestonesAll = totalMilestones + skillDeconstructionMilestones;

            const maxProgress = Math.max(
                ...Object.values(state.learningPaths).map(path => path.totalProgress),
                ...Object.values(state.skillDeconstructions).map(skill => skill.overallProgress),
                0
            );

            const totalPracticeSessions = Object.values(state.practiceSessions).length;
            const completedSkillLevels = Object.values(state.skillDeconstructions).filter(
                skill => skill.currentLevel > 1
            ).length;

            // Check each achievement
            state.achievements.forEach(achievement => {
                if (achievement.unlocked) return;

                let shouldUnlock = false;

                switch (achievement.criteria.type) {
                    case 'milestone_count':
                        shouldUnlock = totalMilestonesAll >= achievement.criteria.value;
                        break;
                    case 'completion_percentage':
                        shouldUnlock = maxProgress >= achievement.criteria.value;
                        break;
                    case 'time_spent':
                        shouldUnlock = state.totalTimeSpent >= achievement.criteria.value;
                        break;
                    case 'streak_days':
                        shouldUnlock = state.streakDays >= achievement.criteria.value;
                        break;
                    case 'practice_sessions':
                        shouldUnlock = totalPracticeSessions >= achievement.criteria.value;
                        break;
                    case 'skill_level_completed':
                        shouldUnlock = completedSkillLevels >= achievement.criteria.value;
                        break;
                }

                if (shouldUnlock) {
                    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: { achievementId: achievement.id } });
                }
            });
        };

        check_achievements();
    }, [state.learningPaths, state.skillDeconstructions, state.practiceSessions, state.totalTimeSpent, state.streakDays, state.achievements]);

    // ============================================================================
    // CONTEXT METHODS
    // ============================================================================

    // Legacy methods (for backward compatibility)
    const mark_milestone_complete = (learningPathId: string, milestoneId: string, timeSpent: number, score?: number, notes?: string) => {
        dispatch({
            type: 'MARK_MILESTONE_COMPLETE',
            payload: { learningPathId, milestoneId, timeSpent, score, notes }
        });
    };

    const update_milestone_progress = (learningPathId: string, milestoneId: string, updates: Partial<Milestone>) => {
        dispatch({
            type: 'UPDATE_MILESTONE',
            payload: { learningPathId, milestoneId, updates }
        });
    };

    const reset_milestone = (learningPathId: string, milestoneId: string) => {
        dispatch({
            type: 'RESET_MILESTONE',
            payload: { learningPathId, milestoneId }
        });
    };

    const start_learning_path = (topic: string, milestones: Omit<Milestone, 'completed' | 'completedAt' | 'timeSpent'>[]) => {
        const learningPathId = `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        dispatch({
            type: 'START_LEARNING_PATH',
            payload: { topic, milestones }
        });
        return learningPathId;
    };

    const get_learning_path = (learningPathId: string): LearningPath | null => {
        return state.learningPaths[learningPathId] || null;
    };

    const get_all_learning_paths = (): LearningPath[] => {
        return Object.values(state.learningPaths);
    };

    // Skill deconstruction methods
    const start_skill_deconstruction = (skillDeconstructionData: any) => {
        dispatch({
            type: 'START_SKILL_DECONSTRUCTION',
            payload: { skillDeconstructionData }
        });
        return skillDeconstructionData.id;
    };

    const mark_milestone_complete_skill = (skillDeconstructionId: string, milestoneId: string, levelNumber: number, timeSpent: number, notes?: string, difficultyRating?: number) => {
        dispatch({
            type: 'MARK_MILESTONE_COMPLETE_SKILL',
            payload: { skillDeconstructionId, milestoneId, levelNumber, timeSpent, notes, difficultyRating }
        });
    };

    const start_practice_session = (skillDeconstructionId: string, milestoneId: string, activityType: string, reps?: number, sets?: number, successCriteria?: string) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        dispatch({
            type: 'START_PRACTICE_SESSION',
            payload: { sessionId, skillDeconstructionId, milestoneId, activityType, reps, sets, successCriteria }
        });
        return sessionId;
    };

    const complete_practice_session = (sessionId: string, timeSpent: number, completed: boolean, difficultyRating?: number, notes?: string) => {
        dispatch({
            type: 'COMPLETE_PRACTICE_SESSION',
            payload: { sessionId, timeSpent, completed, difficultyRating, notes }
        });
    };

    const update_milestone_progress_skill = (skillDeconstructionId: string, milestoneId: string, updates: Partial<MilestoneProgress>) => {
        dispatch({
            type: 'UPDATE_MILESTONE_PROGRESS_SKILL',
            payload: { skillDeconstructionId, milestoneId, updates }
        });
    };

    const get_skill_deconstruction_progress = (skillDeconstructionId: string): SkillDeconstructionProgress | null => {
        return state.skillDeconstructions[skillDeconstructionId] || null;
    };

    const get_all_skill_deconstructions = (): SkillDeconstructionProgress[] => {
        return Object.values(state.skillDeconstructions);
    };

    const get_practice_sessions = (skillDeconstructionId?: string, milestoneId?: string): PracticeSession[] => {
        let sessions = Object.values(state.practiceSessions);
        
        if (skillDeconstructionId) {
            sessions = sessions.filter(session => session.skillDeconstructionId === skillDeconstructionId);
        }
        
        if (milestoneId) {
            sessions = sessions.filter(session => session.milestoneId === milestoneId);
        }
        
        return sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    };

    const unlock_achievement = (achievementId: string) => {
        dispatch({
            type: 'UNLOCK_ACHIEVEMENT',
            payload: { achievementId }
        });
    };

    const get_achievements = (): Achievement[] => {
        return state.achievements;
    };

    const get_unlocked_achievements = (): Achievement[] => {
        return state.achievements.filter(a => a.unlocked);
    };

    const get_total_progress = (): number => {
        const paths = Object.values(state.learningPaths);
        const skills = Object.values(state.skillDeconstructions);
        
        if (paths.length === 0 && skills.length === 0) return 0;
        
        const totalProgress = paths.reduce((sum, path) => sum + path.totalProgress, 0) +
                            skills.reduce((sum, skill) => sum + skill.overallProgress, 0);
        
        return Math.round(totalProgress / (paths.length + skills.length));
    };

    const get_learning_velocity = (days: number): number => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentMilestones = Object.values(state.learningPaths).flatMap(path =>
            path.milestones.filter(m => 
                m.completed && m.completedAt && new Date(m.completedAt) >= cutoffDate
            )
        );

        const recentSkillMilestones = Object.values(state.skillDeconstructions).flatMap(skill =>
            skill.milestoneProgress.filter(mp => 
                mp.completedAt && new Date(mp.completedAt) >= cutoffDate
            )
        );

        return (recentMilestones.length + recentSkillMilestones.length) / days;
    };

    const get_time_distribution = (): Record<string, number> => {
        const distribution: Record<string, number> = {
            video: 0,
            article: 0,
            exercise: 0,
            quiz: 0,
            practice: 0
        };

        Object.values(state.learningPaths).forEach(path => {
            path.milestones.forEach(milestone => {
                if (milestone.completed && milestone.timeSpent) {
                    distribution[milestone.type] += milestone.timeSpent;
                }
            });
        });

        // Add practice session time
        Object.values(state.practiceSessions).forEach(session => {
            if (session.completed && session.timeSpent) {
                distribution.practice += session.timeSpent;
            }
        });

        return distribution;
    };

    const get_skill_deconstruction_analytics = (skillDeconstructionId: string) => {
        const progress = state.skillDeconstructions[skillDeconstructionId];
        if (!progress) return null;

        const practiceSessions = get_practice_sessions(skillDeconstructionId);
        const timeSpent = progress.totalTimeSpent;
        const completionRate = progress.overallProgress;
        const averageDifficulty = progress.practiceAnalytics.averageDifficultyRating;

        return {
            progress,
            practiceSessions,
            timeSpent,
            completionRate,
            averageDifficulty
        };
    };

    const clear_progress = (learningPathId?: string, skillDeconstructionId?: string) => {
        dispatch({
            type: 'CLEAR_PROGRESS',
            payload: { learningPathId, skillDeconstructionId }
        });
    };

    const export_progress_data = (): string => {
        return JSON.stringify(state, null, 2);
    };

    const import_progress_data = (data: string): boolean => {
        try {
            const parsedData = JSON.parse(data);
            dispatch({ type: 'LOAD_STATE', payload: parsedData });
            return true;
        } catch (error) {
            console.error('Failed to import progress data:', error);
            return false;
        }
    };

    // ============================================================================
    // MULTI-SKILL MANAGEMENT METHODS
    // ============================================================================

    const get_active_skills = (): SkillDeconstructionProgress[] => {
        return Object.values(state.skillDeconstructions).filter(skill => skill.overallProgress < 100);
    };

    const get_completed_skills = (): SkillDeconstructionProgress[] => {
        return Object.values(state.skillDeconstructions).filter(skill => skill.overallProgress === 100);
    };

    const get_skill_by_id = (skillId: string): SkillDeconstructionProgress | null => {
        return state.skillDeconstructions[skillId] || null;
    };

    const get_skill_progress_summary = (skillId: string) => {
        const skill = state.skillDeconstructions[skillId];
        if (!skill) return null;

        return {
            progress: skill.overallProgress,
            completedMilestones: skill.completedMilestones,
            totalMilestones: skill.totalMilestones,
            currentLevel: skill.currentLevel,
            timeSpent: skill.totalTimeSpent,
            lastActivity: skill.lastActivity
        };
    };

    const get_overall_skill_analytics = () => {
        const skills = Object.values(state.skillDeconstructions);
        const totalSkills = skills.length;
        const activeSkills = skills.filter(skill => skill.overallProgress < 100).length;
        const completedSkills = skills.filter(skill => skill.overallProgress === 100).length;
        const overallProgress = totalSkills > 0 
            ? Math.round(skills.reduce((sum, skill) => sum + skill.overallProgress, 0) / totalSkills)
            : 0;
        const totalTimeSpent = skills.reduce((sum, skill) => sum + skill.totalTimeSpent, 0);
        const averageProgress = totalSkills > 0 
            ? Math.round(skills.reduce((sum, skill) => sum + skill.overallProgress, 0) / totalSkills)
            : 0;

        return {
            totalSkills,
            activeSkills,
            completedSkills,
            overallProgress,
            totalTimeSpent,
            averageProgress
        };
    };

    const switch_to_skill = (skillId: string) => {
        console.log(`Switching to skill: ${skillId}`);
        
        // Update the current skill ID and add to history
        dispatch({
            type: 'SWITCH_TO_SKILL',
            payload: {
                skillId,
                timestamp: new Date().toISOString()
            }
        });
        
        // Update the last activity for the skill being switched to
        const skill = state.skillDeconstructions[skillId];
        if (skill) {
            dispatch({
                type: 'UPDATE_MILESTONE_PROGRESS_SKILL',
                payload: {
                    skillDeconstructionId: skillId,
                    milestoneId: skill.currentMilestoneId || '',
                    updates: { startedAt: new Date().toISOString() }
                }
            });
        }
    };

    const get_skill_recommendations = () => {
        const skills = Object.values(state.skillDeconstructions);
        const recommendations: Array<{
            skillId: string;
            skillName: string;
            reason: string;
            priority: 'high' | 'medium' | 'low';
        }> = [];

        skills.forEach(skill => {
            // Recommend skills with low progress
            if (skill.overallProgress < 20) {
                recommendations.push({
                    skillId: skill.skillDeconstructionId,
                    skillName: skill.skillName,
                    reason: 'Low progress - consider focusing on this skill',
                    priority: 'high'
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
                    priority: 'medium'
                });
            }

            // Recommend skills close to completion
            if (skill.overallProgress >= 80 && skill.overallProgress < 100) {
                recommendations.push({
                    skillId: skill.skillDeconstructionId,
                    skillName: skill.skillName,
                    reason: 'Almost complete - finish strong!',
                    priority: 'high'
                });
            }
        });

        // Sort by priority
        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    };

    // ============================================================================
    // CONTEXT VALUE
    // ============================================================================

    const contextValue: ProgressContextType = {
        state,
        // Legacy methods
        mark_milestone_complete,
        update_milestone_progress,
        reset_milestone,
        start_learning_path,
        get_learning_path,
        get_all_learning_paths,
        
        // Skill deconstruction methods
        start_skill_deconstruction,
        mark_milestone_complete_skill,
        start_practice_session,
        complete_practice_session,
        update_milestone_progress_skill,
        get_skill_deconstruction_progress,
        get_all_skill_deconstructions,
        get_practice_sessions,
        
        // Achievement methods
        unlock_achievement,
        get_achievements,
        get_unlocked_achievements,
        
        // Analytics methods
        get_total_progress,
        get_learning_velocity,
        get_time_distribution,
        get_skill_deconstruction_analytics,
        
        // Data management
        clear_progress,
        export_progress_data,
        import_progress_data,
        
        // Multi-skill management methods
        get_active_skills,
        get_completed_skills,
        get_skill_by_id,
        get_skill_progress_summary,
        get_overall_skill_analytics,
        switch_to_skill,
        get_skill_recommendations
    };

    return (
        <ProgressContext.Provider value={contextValue}>
            {children}
        </ProgressContext.Provider>
    );
}

// ============================================================================
// HOOK FOR USING THE CONTEXT
// ============================================================================

export function use_progress(): ProgressContextType {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error('use_progress must be used within a ProgressProvider');
    }
    return context;
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

export function debug_progress_state(state: ProgressState): void {
    console.group('🔍 Progress State Debug');
    console.log('User ID:', state.userId);
    console.log('Total Time Spent:', format_time(state.totalTimeSpent));
    console.log('Streak Days:', state.streakDays);
    console.log('Learning Paths:', Object.keys(state.learningPaths).length);
    console.log('Skill Deconstructions:', Object.keys(state.skillDeconstructions).length);
    console.log('Practice Sessions:', Object.keys(state.practiceSessions).length);
    console.log('Unlocked Achievements:', state.achievements.filter(a => a.unlocked).length);
    
    Object.values(state.learningPaths).forEach(path => {
        console.group(`📚 ${path.topic}`);
        console.log('Progress:', `${path.totalProgress}%`);
        console.log('Completed:', `${path.completedMilestones}/${path.totalMilestones}`);
        console.log('Started:', format(new Date(path.startedAt), 'MMM dd, yyyy'));
        console.groupEnd();
    });

    Object.values(state.skillDeconstructions).forEach(skill => {
        console.group(`🎯 ${skill.skillName} (${skill.skillType})`);
        console.log('Progress:', `${skill.overallProgress}%`);
        console.log('Completed:', `${skill.completedMilestones}/${skill.totalMilestones}`);
        console.log('Current Level:', skill.currentLevel);
        console.log('Practice Sessions:', skill.practiceAnalytics.totalPracticeSessions);
        console.log('Started:', format(new Date(skill.startedAt), 'MMM dd, yyyy'));
        console.groupEnd();
    });
    
    console.groupEnd();
}

function format_time(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
