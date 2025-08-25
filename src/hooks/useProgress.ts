'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import { format, differenceInDays, differenceInHours, differenceInMinutes, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns';
import { use_progress } from '@/contexts/ProgressContext';
import type { Milestone, LearningPath, Achievement, ProgressState } from '@/contexts/ProgressContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ProgressMetrics {
    totalMilestones: number;
    completedMilestones: number;
    completionPercentage: number;
    totalTimeSpent: number; // in minutes
    averageTimePerMilestone: number; // in minutes
    learningVelocity: number; // milestones per day
    currentStreak: number; // consecutive days with activity
    longestStreak: number;
    estimatedTimeToComplete: number; // in minutes
    timeSpentToday: number; // in minutes
    timeSpentThisWeek: number; // in minutes
    timeSpentThisMonth: number; // in minutes
}

export interface LearningVelocity {
    daily: number; // milestones per day
    weekly: number; // milestones per week
    monthly: number; // milestones per month
    trend: 'increasing' | 'decreasing' | 'stable';
    prediction: number; // predicted completion date
}

export interface TimeAnalytics {
    totalTime: number; // in minutes
    timeByType: {
        video: number;
        article: number;
        exercise: number;
        quiz: number;
    };
    timeByDay: Array<{
        date: string;
        timeSpent: number;
        milestonesCompleted: number;
    }>;
    averageSessionLength: number; // in minutes
    mostProductiveTime: string; // hour of day
    mostProductiveDay: string; // day of week
}

export interface ProgressTrend {
    period: 'day' | 'week' | 'month';
    data: Array<{
        date: string;
        completed: number;
        timeSpent: number;
        velocity: number;
    }>;
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
}

export interface AchievementEligibility {
    achievementId: string;
    isEligible: boolean;
    progress: number; // 0-100
    criteria: {
        type: string;
        current: number;
        required: number;
        description: string;
    }[];
    estimatedTimeToUnlock: number; // in minutes
}

export interface UseProgressReturn {
    // Current progress metrics
    metrics: ProgressMetrics;
    
    // Learning velocity and trends
    velocity: LearningVelocity;
    
    // Time-based analytics
    timeAnalytics: TimeAnalytics;
    
    // Progress trends
    trends: {
        daily: ProgressTrend;
        weekly: ProgressTrend;
        monthly: ProgressTrend;
    };
    
    // Achievement eligibility
    achievementEligibility: AchievementEligibility[];
    
    // Utility functions
    get_progress_for_path: (pathId: string) => ProgressMetrics;
    get_velocity_for_period: (days: number) => number;
    get_time_spent_for_period: (days: number) => number;
    get_completion_estimate: (pathId?: string) => number;
    get_achievement_progress: (achievementId: string) => number;
    export_progress_data: () => string;
    
    // State
    isLoading: boolean;
    error: string | null;
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const VELOCITY_CALCULATION_DAYS = 7; // Calculate velocity over last 7 days
const TREND_CALCULATION_DAYS = 30; // Calculate trends over last 30 days
const STREAK_THRESHOLD_MINUTES = 5; // Minimum time spent to count as activity

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate progress percentage for a learning path
 */
function calculate_completion_percentage(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;
    
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
}

/**
 * Calculate total time spent on milestones
 */
function calculate_total_time_spent(milestones: Milestone[]): number {
    return milestones.reduce((total, milestone) => {
        return total + (milestone.timeSpent || 0);
    }, 0);
}

/**
 * Calculate learning velocity (milestones per time period)
 */
function calculate_learning_velocity(
    milestones: Milestone[],
    days: number = VELOCITY_CALCULATION_DAYS
): number {
    const cutoffDate = subDays(new Date(), days);
    const recentMilestones = milestones.filter(m => 
        m.completed && m.completedAt && new Date(m.completedAt) >= cutoffDate
    );
    
    return recentMilestones.length / days;
}

/**
 * Calculate current streak of consecutive days with activity
 */
function calculate_current_streak(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;
    
    const completedMilestones = milestones
        .filter(m => m.completed && m.completedAt && m.timeSpent >= STREAK_THRESHOLD_MINUTES)
        .map(m => new Date(m.completedAt!))
        .sort((a, b) => b.getTime() - a.getTime()); // Sort descending
    
    if (completedMilestones.length === 0) return 0;
    
    let streak = 0;
    let currentDate = startOfDay(new Date());
    const today = startOfDay(new Date());
    
    while (true) {
        const hasActivity = completedMilestones.some(milestoneDate => {
            const milestoneDay = startOfDay(milestoneDate);
            return milestoneDay.getTime() === currentDate.getTime();
        });
        
        if (hasActivity) {
            streak++;
            currentDate = subDays(currentDate, 1);
        } else {
            break;
        }
    }
    
    return streak;
}

/**
 * Calculate longest streak
 */
function calculate_longest_streak(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0;
    
    const completedMilestones = milestones
        .filter(m => m.completed && m.completedAt && m.timeSpent >= STREAK_THRESHOLD_MINUTES)
        .map(m => new Date(m.completedAt!))
        .sort((a, b) => a.getTime() - b.getTime()); // Sort ascending
    
    if (completedMilestones.length === 0) return 0;
    
    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;
    
    for (const milestoneDate of completedMilestones) {
        const milestoneDay = startOfDay(milestoneDate);
        
        if (previousDate === null) {
            currentStreak = 1;
        } else {
            const previousDay = startOfDay(previousDate);
            const daysDiff = differenceInDays(milestoneDay, previousDay);
            
            if (daysDiff === 1) {
                currentStreak++;
            } else if (daysDiff === 0) {
                // Same day, continue streak
                continue;
            } else {
                // Gap in streak
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1;
            }
        }
        
        previousDate = milestoneDate;
    }
    
    return Math.max(longestStreak, currentStreak);
}

/**
 * Calculate time spent in a specific period
 */
function calculate_time_for_period(
    milestones: Milestone[],
    startDate: Date,
    endDate: Date
): number {
    return milestones
        .filter(m => m.completed && m.completedAt)
        .filter(m => {
            const completionDate = new Date(m.completedAt!);
            return completionDate >= startDate && completionDate <= endDate;
        })
        .reduce((total, m) => total + (m.timeSpent || 0), 0);
}

/**
 * Calculate time analytics by content type
 */
function calculate_time_by_type(milestones: Milestone[]): TimeAnalytics['timeByType'] {
    const timeByType = {
        video: 0,
        article: 0,
        exercise: 0,
        quiz: 0
    };
    
    milestones.forEach(milestone => {
        if (milestone.completed && milestone.timeSpent) {
            switch (milestone.type) {
                case 'video':
                    timeByType.video += milestone.timeSpent;
                    break;
                case 'article':
                    timeByType.article += milestone.timeSpent;
                    break;
                case 'exercise':
                    timeByType.exercise += milestone.timeSpent;
                    break;
                case 'quiz':
                    timeByType.quiz += milestone.timeSpent;
                    break;
            }
        }
    });
    
    return timeByType;
}

/**
 * Calculate time analytics by day
 */
function calculate_time_by_day(milestones: Milestone[], days: number = 30): TimeAnalytics['timeByDay'] {
    const timeByDay: { [key: string]: { timeSpent: number; milestonesCompleted: number } } = {};
    
    // Initialize the last N days
    for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'yyyy-MM-dd');
        timeByDay[dateKey] = { timeSpent: 0, milestonesCompleted: 0 };
    }
    
    // Calculate time spent and milestones completed for each day
    milestones.forEach(milestone => {
        if (milestone.completed && milestone.completedAt) {
            const completionDate = new Date(milestone.completedAt);
            const dateKey = format(completionDate, 'yyyy-MM-dd');
            
            if (timeByDay[dateKey]) {
                timeByDay[dateKey].timeSpent += milestone.timeSpent || 0;
                timeByDay[dateKey].milestonesCompleted += 1;
            }
        }
    });
    
    // Convert to array format
    return Object.entries(timeByDay)
        .map(([date, data]) => ({
            date,
            timeSpent: data.timeSpent,
            milestonesCompleted: data.milestonesCompleted
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate most productive time and day
 */
function calculate_productivity_metrics(milestones: Milestone[]): {
    mostProductiveTime: string;
    mostProductiveDay: string;
} {
    const timeDistribution: { [hour: number]: number } = {};
    const dayDistribution: { [day: number]: number } = {};
    
    // Initialize distributions
    for (let hour = 0; hour < 24; hour++) {
        timeDistribution[hour] = 0;
    }
    for (let day = 0; day < 7; day++) {
        dayDistribution[day] = 0;
    }
    
    // Calculate distributions
    milestones.forEach(milestone => {
        if (milestone.completed && milestone.completedAt) {
            const completionDate = new Date(milestone.completedAt);
            const hour = completionDate.getHours();
            const day = completionDate.getDay();
            
            timeDistribution[hour] += milestone.timeSpent || 0;
            dayDistribution[day] += milestone.timeSpent || 0;
        }
    });
    
    // Find most productive time
    const mostProductiveHour = Object.entries(timeDistribution)
        .reduce((max, [hour, time]) => time > max.time ? { hour: parseInt(hour), time } : max, { hour: 0, time: 0 })
        .hour;
    
    // Find most productive day
    const mostProductiveDayIndex = Object.entries(dayDistribution)
        .reduce((max, [day, time]) => time > max.time ? { day: parseInt(day), time } : max, { day: 0, time: 0 })
        .day;
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
        mostProductiveTime: `${mostProductiveHour}:00`,
        mostProductiveDay: dayNames[mostProductiveDayIndex]
    };
}

/**
 * Calculate progress trends
 */
function calculate_progress_trend(
    milestones: Milestone[],
    period: 'day' | 'week' | 'month'
): ProgressTrend {
    const days = period === 'day' ? 7 : period === 'week' ? 30 : 90;
    const timeByDay = calculate_time_by_day(milestones, days);
    
    // Group by period if needed
    let groupedData = timeByDay;
    if (period === 'week') {
        // Group by week
        const weeklyData: { [week: string]: { completed: number; timeSpent: number; velocity: number } } = {};
        
        timeByDay.forEach(day => {
            const date = new Date(day.date);
            const weekStart = format(startOfDay(subDays(date, date.getDay())), 'yyyy-MM-dd');
            
            if (!weeklyData[weekStart]) {
                weeklyData[weekStart] = { completed: 0, timeSpent: 0, velocity: 0 };
            }
            
            weeklyData[weekStart].completed += day.milestonesCompleted;
            weeklyData[weekStart].timeSpent += day.timeSpent;
        });
        
        groupedData = Object.entries(weeklyData).map(([date, data]) => ({
            date,
            timeSpent: data.timeSpent,
            milestonesCompleted: data.completed
        }));
    } else if (period === 'month') {
        // Group by month
        const monthlyData: { [month: string]: { completed: number; timeSpent: number; velocity: number } } = {};
        
        timeByDay.forEach(day => {
            const date = new Date(day.date);
            const monthKey = format(date, 'yyyy-MM');
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { completed: 0, timeSpent: 0, velocity: 0 };
            }
            
            monthlyData[monthKey].completed += day.milestonesCompleted;
            monthlyData[monthKey].timeSpent += day.timeSpent;
        });
        
        groupedData = Object.entries(monthlyData).map(([date, data]) => ({
            date,
            timeSpent: data.timeSpent,
            milestonesCompleted: data.completed
        }));
    }
    
    // Calculate velocity for each period
    const dataWithVelocity = groupedData.map((periodData, index) => {
        const velocity = periodData.milestonesCompleted / (period === 'day' ? 1 : period === 'week' ? 7 : 30);
        return {
            date: periodData.date,
            completed: periodData.milestonesCompleted,
            timeSpent: periodData.timeSpent,
            velocity
        };
    });
    
    // Calculate trend
    if (dataWithVelocity.length < 2) {
        return {
            period,
            data: dataWithVelocity,
            trend: 'stable',
            changePercentage: 0
        };
    }
    
    const recent = dataWithVelocity.slice(-3);
    const older = dataWithVelocity.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.completed, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.completed, 0) / older.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let changePercentage = 0;
    
    if (olderAvg > 0) {
        changePercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
        trend = changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable';
    }
    
    return {
        period,
        data: dataWithVelocity,
        trend,
        changePercentage: Math.round(changePercentage)
    };
}

/**
 * Check achievement eligibility
 */
function check_achievement_eligibility(
    achievements: Achievement[],
    milestones: Milestone[],
    metrics: ProgressMetrics
): AchievementEligibility[] {
    return achievements.map(achievement => {
        const criterion = achievement.criteria;
        let current = 0;
        let required = criterion.value;
        
        switch (criterion.type) {
            case 'milestone_count':
                current = metrics.completedMilestones;
                break;
            case 'time_spent':
                current = Math.round(metrics.totalTimeSpent / 60); // Convert to hours
                required = criterion.value * 60; // Convert hours to minutes
                break;
            case 'streak_days':
                current = metrics.currentStreak;
                break;
            case 'completion_percentage':
                current = metrics.completionPercentage;
                break;
            default:
                current = 0;
        }
        
        const criteria = [{
            type: criterion.type,
            current,
            required,
            description: `Complete ${criterion.value} ${criterion.type.replace('_', ' ')}`
        }];
        
        const progress = criteria.reduce((total, c) => {
            return total + Math.min((c.current / c.required) * 100, 100);
        }, 0) / criteria.length;
        
        const isEligible = criteria.every(c => c.current >= c.required);
        
        // Estimate time to unlock based on current velocity
        let estimatedTimeToUnlock = 0;
        if (!isEligible && metrics.learningVelocity > 0) {
            const remainingMilestones = metrics.totalMilestones - metrics.completedMilestones;
            estimatedTimeToUnlock = Math.round(remainingMilestones / metrics.learningVelocity * 24 * 60); // Convert to minutes
        }
        
        return {
            achievementId: achievement.id,
            isEligible,
            progress: Math.round(progress),
            criteria,
            estimatedTimeToUnlock
        };
    });
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function use_progress_hook(): UseProgressReturn {
    const { state, get_achievements } = use_progress();
    const [isLoading, set_is_loading] = useState(true);
    const [error, set_error] = useState<string | null>(null);
    
    // ============================================================================
    // CALCULATE METRICS
    // ============================================================================
    
    const metrics = useMemo((): ProgressMetrics => {
        try {
            const allMilestones = Object.values(state.learningPaths)
                .flatMap(path => path.milestones);
            
            const totalMilestones = allMilestones.length;
            const completedMilestones = allMilestones.filter(m => m.completed).length;
            const completionPercentage = calculate_completion_percentage(allMilestones);
            const totalTimeSpent = calculate_total_time_spent(allMilestones);
            const averageTimePerMilestone = completedMilestones > 0 ? totalTimeSpent / completedMilestones : 0;
            const learningVelocity = calculate_learning_velocity(allMilestones);
            const currentStreak = calculate_current_streak(allMilestones);
            const longestStreak = calculate_longest_streak(allMilestones);
            
            // Calculate estimated time to complete
            const remainingMilestones = totalMilestones - completedMilestones;
            const estimatedTimeToComplete = learningVelocity > 0 
                ? (remainingMilestones / learningVelocity) * 24 * 60 // Convert to minutes
                : 0;
            
            // Calculate time spent in different periods
            const today = new Date();
            const timeSpentToday = calculate_time_for_period(
                allMilestones,
                startOfDay(today),
                endOfDay(today)
            );
            
            const weekStart = subDays(today, 7);
            const timeSpentThisWeek = calculate_time_for_period(
                allMilestones,
                weekStart,
                today
            );
            
            const monthStart = subDays(today, 30);
            const timeSpentThisMonth = calculate_time_for_period(
                allMilestones,
                monthStart,
                today
            );
            
            return {
                totalMilestones,
                completedMilestones,
                completionPercentage,
                totalTimeSpent,
                averageTimePerMilestone,
                learningVelocity,
                currentStreak,
                longestStreak,
                estimatedTimeToComplete,
                timeSpentToday,
                timeSpentThisWeek,
                timeSpentThisMonth
            };
        } catch (err) {
            console.error('Error calculating metrics:', err);
            set_error('Failed to calculate progress metrics');
            return {
                totalMilestones: 0,
                completedMilestones: 0,
                completionPercentage: 0,
                totalTimeSpent: 0,
                averageTimePerMilestone: 0,
                learningVelocity: 0,
                currentStreak: 0,
                longestStreak: 0,
                estimatedTimeToComplete: 0,
                timeSpentToday: 0,
                timeSpentThisWeek: 0,
                timeSpentThisMonth: 0
            };
        }
    }, [state.learningPaths]);
    
    // ============================================================================
    // CALCULATE VELOCITY
    // ============================================================================
    
    const velocity = useMemo((): LearningVelocity => {
        try {
            const allMilestones = Object.values(state.learningPaths)
                .flatMap(path => path.milestones);
            
            const daily = calculate_learning_velocity(allMilestones, 1);
            const weekly = calculate_learning_velocity(allMilestones, 7);
            const monthly = calculate_learning_velocity(allMilestones, 30);
            
            // Calculate trend
            const recentVelocity = calculate_learning_velocity(allMilestones, 7);
            const olderVelocity = calculate_learning_velocity(allMilestones, 14) - recentVelocity;
            
            let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
            if (Math.abs(recentVelocity - olderVelocity) > 0.1) {
                trend = recentVelocity > olderVelocity ? 'increasing' : 'decreasing';
            }
            
            // Predict completion date
            const remainingMilestones = metrics.totalMilestones - metrics.completedMilestones;
            const prediction = daily > 0 ? Date.now() + (remainingMilestones / daily) * 24 * 60 * 60 * 1000 : 0;
            
            return {
                daily,
                weekly,
                monthly,
                trend,
                prediction
            };
        } catch (err) {
            console.error('Error calculating velocity:', err);
            return {
                daily: 0,
                weekly: 0,
                monthly: 0,
                trend: 'stable',
                prediction: 0
            };
        }
    }, [state.learningPaths, metrics]);
    
    // ============================================================================
    // CALCULATE TIME ANALYTICS
    // ============================================================================
    
    const timeAnalytics = useMemo((): TimeAnalytics => {
        try {
            const allMilestones = Object.values(state.learningPaths)
                .flatMap(path => path.milestones);
            
            const totalTime = calculate_total_time_spent(allMilestones);
            const timeByType = calculate_time_by_type(allMilestones);
            const timeByDay = calculate_time_by_day(allMilestones);
            const { mostProductiveTime, mostProductiveDay } = calculate_productivity_metrics(allMilestones);
            
            // Calculate average session length
            const completedMilestones = allMilestones.filter(m => m.completed && m.timeSpent > 0);
            const averageSessionLength = completedMilestones.length > 0
                ? completedMilestones.reduce((sum, m) => sum + (m.timeSpent || 0), 0) / completedMilestones.length
                : 0;
            
            return {
                totalTime,
                timeByType,
                timeByDay,
                averageSessionLength,
                mostProductiveTime,
                mostProductiveDay
            };
        } catch (err) {
            console.error('Error calculating time analytics:', err);
            return {
                totalTime: 0,
                timeByType: { video: 0, article: 0, exercise: 0, quiz: 0 },
                timeByDay: [],
                averageSessionLength: 0,
                mostProductiveTime: '0:00',
                mostProductiveDay: 'Monday'
            };
        }
    }, [state.learningPaths]);
    
    // ============================================================================
    // CALCULATE TRENDS
    // ============================================================================
    
    const trends = useMemo(() => {
        try {
            const allMilestones = Object.values(state.learningPaths)
                .flatMap(path => path.milestones);
            
            return {
                daily: calculate_progress_trend(allMilestones, 'day'),
                weekly: calculate_progress_trend(allMilestones, 'week'),
                monthly: calculate_progress_trend(allMilestones, 'month')
            };
        } catch (err) {
            console.error('Error calculating trends:', err);
            return {
                daily: { period: 'day' as const, data: [], trend: 'stable' as const, changePercentage: 0 },
                weekly: { period: 'week' as const, data: [], trend: 'stable' as const, changePercentage: 0 },
                monthly: { period: 'month' as const, data: [], trend: 'stable' as const, changePercentage: 0 }
            };
        }
    }, [state.learningPaths]);
    
    // ============================================================================
    // CALCULATE ACHIEVEMENT ELIGIBILITY
    // ============================================================================
    
    const achievementEligibility = useMemo(() => {
        try {
            const achievements = get_achievements();
            const allMilestones = Object.values(state.learningPaths)
                .flatMap(path => path.milestones);
            
            return check_achievement_eligibility(achievements, allMilestones, metrics);
        } catch (err) {
            console.error('Error calculating achievement eligibility:', err);
            return [];
        }
    }, [state.learningPaths, metrics, get_achievements]);
    
    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    const get_progress_for_path = useCallback((pathId: string): ProgressMetrics => {
        try {
            const path = state.learningPaths[pathId];
            if (!path) {
                throw new Error(`Learning path not found: ${pathId}`);
            }
            
            const totalMilestones = path.milestones.length;
            const completedMilestones = path.milestones.filter(m => m.completed).length;
            const completionPercentage = calculate_completion_percentage(path.milestones);
            const totalTimeSpent = calculate_total_time_spent(path.milestones);
            const averageTimePerMilestone = completedMilestones > 0 ? totalTimeSpent / completedMilestones : 0;
            const learningVelocity = calculate_learning_velocity(path.milestones);
            const currentStreak = calculate_current_streak(path.milestones);
            const longestStreak = calculate_longest_streak(path.milestones);
            
            const remainingMilestones = totalMilestones - completedMilestones;
            const estimatedTimeToComplete = learningVelocity > 0 
                ? (remainingMilestones / learningVelocity) * 24 * 60
                : 0;
            
            const today = new Date();
            const timeSpentToday = calculate_time_for_period(
                path.milestones,
                startOfDay(today),
                endOfDay(today)
            );
            
            const weekStart = subDays(today, 7);
            const timeSpentThisWeek = calculate_time_for_period(
                path.milestones,
                weekStart,
                today
            );
            
            const monthStart = subDays(today, 30);
            const timeSpentThisMonth = calculate_time_for_period(
                path.milestones,
                monthStart,
                today
            );
            
            return {
                totalMilestones,
                completedMilestones,
                completionPercentage,
                totalTimeSpent,
                averageTimePerMilestone,
                learningVelocity,
                currentStreak,
                longestStreak,
                estimatedTimeToComplete,
                timeSpentToday,
                timeSpentThisWeek,
                timeSpentThisMonth
            };
        } catch (err) {
            console.error('Error getting progress for path:', err);
            throw err;
        }
    }, [state.learningPaths]);
    
    const get_velocity_for_period = useCallback((days: number): number => {
        try {
            const allMilestones = Object.values(state.learningPaths)
                .flatMap(path => path.milestones);
            
            return calculate_learning_velocity(allMilestones, days);
        } catch (err) {
            console.error('Error calculating velocity for period:', err);
            return 0;
        }
    }, [state.learningPaths]);
    
    const get_time_spent_for_period = useCallback((days: number): number => {
        try {
            const allMilestones = Object.values(state.learningPaths)
                .flatMap(path => path.milestones);
            
            const startDate = subDays(new Date(), days);
            const endDate = new Date();
            
            return calculate_time_for_period(allMilestones, startDate, endDate);
        } catch (err) {
            console.error('Error calculating time for period:', err);
            return 0;
        }
    }, [state.learningPaths]);
    
    const get_completion_estimate = useCallback((pathId?: string): number => {
        try {
            if (pathId) {
                const pathMetrics = get_progress_for_path(pathId);
                return pathMetrics.estimatedTimeToComplete;
            } else {
                return metrics.estimatedTimeToComplete;
            }
        } catch (err) {
            console.error('Error getting completion estimate:', err);
            return 0;
        }
    }, [metrics, get_progress_for_path]);
    
    const get_achievement_progress = useCallback((achievementId: string): number => {
        try {
            const achievement = achievementEligibility.find(a => a.achievementId === achievementId);
            return achievement ? achievement.progress : 0;
        } catch (err) {
            console.error('Error getting achievement progress:', err);
            return 0;
        }
    }, [achievementEligibility]);
    
    const export_progress_data = useCallback((): string => {
        try {
            const exportData = {
                metrics,
                velocity,
                timeAnalytics,
                trends,
                achievementEligibility,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (err) {
            console.error('Error exporting progress data:', err);
            throw new Error('Failed to export progress data');
        }
    }, [metrics, velocity, timeAnalytics, trends, achievementEligibility]);
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    useEffect(() => {
        try {
            set_is_loading(false);
            set_error(null);
        } catch (err) {
            console.error('Error initializing useProgress hook:', err);
            set_error('Failed to initialize progress tracking');
            set_is_loading(false);
        }
    }, []);
    
    // ============================================================================
    // RETURN VALUE
    // ============================================================================
    
    return {
        metrics,
        velocity,
        timeAnalytics,
        trends,
        achievementEligibility,
        get_progress_for_path,
        get_velocity_for_period,
        get_time_spent_for_period,
        get_completion_estimate,
        get_achievement_progress,
        export_progress_data,
        isLoading,
        error
    };
}
