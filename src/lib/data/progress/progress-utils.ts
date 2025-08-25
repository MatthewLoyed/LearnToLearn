// ============================================================================
// PROGRESS UTILITIES
// ============================================================================

import { format, differenceInDays, differenceInHours, differenceInMinutes, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns';
import type { Milestone, LearningPath, Achievement, ProgressState } from '@/contexts/ProgressContext';
import type { ProgressMetrics, LearningVelocity, TimeAnalytics, ProgressTrend, AchievementEligibility } from '@/hooks/useProgress';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ProgressCalculationOptions {
    includeIncomplete?: boolean;
    timeThreshold?: number; // Minimum time spent to count as activity
    dateRange?: {
        start: Date;
        end: Date;
    };
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ExportOptions {
    format: 'json' | 'csv' | 'pdf';
    includeAnalytics?: boolean;
    includeAchievements?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
}

export interface PerformanceMetrics {
    calculationTime: number; // in milliseconds
    memoryUsage: number; // in bytes
    dataSize: number; // number of records processed
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const DEFAULT_TIME_THRESHOLD = 5; // minutes
const MAX_DATASET_SIZE = 10000; // Maximum records for performance optimization
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class ProgressCache {
    private cache = new Map<string, CacheEntry<any>>();

    set<T>(key: string, data: T, duration: number = CACHE_DURATION): void {
        const now = Date.now();
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + duration
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

const progressCache = new ProgressCache();

// ============================================================================
// PROGRESS CALCULATION ALGORITHMS
// ============================================================================

/**
 * Calculate completion percentage for milestones
 */
export function calculate_completion_percentage(
    milestones: Milestone[],
    options: ProgressCalculationOptions = {}
): number {
    if (milestones.length === 0) return 0;

    const { includeIncomplete = false, timeThreshold = DEFAULT_TIME_THRESHOLD } = options;

    // Filter milestones based on time threshold
    let validMilestones = milestones;
    
    if (timeThreshold > 0) {
        validMilestones = validMilestones.filter(m => 
            m.completed && (!m.timeSpent || m.timeSpent >= timeThreshold * 60)
        );
    }

    // Calculate percentage based on original total, but only count valid completed milestones
    const totalMilestones = milestones.length;
    const completed = validMilestones.filter(m => m.completed).length;
    return Math.round((completed / totalMilestones) * 100);
}

/**
 * Calculate learning velocity (milestones per time period)
 */
export function calculate_learning_velocity(
    milestones: Milestone[],
    days: number = 7,
    options: ProgressCalculationOptions = {}
): number {
    const { timeThreshold = DEFAULT_TIME_THRESHOLD } = options;
    
    if (days <= 0) return 0;

    const cutoffDate = subDays(new Date(), days);
    const recentMilestones = milestones.filter(m => 
        m.completed && 
        m.completedAt && 
        new Date(m.completedAt) >= cutoffDate &&
        (!m.timeSpent || m.timeSpent >= timeThreshold * 60)
    );

    return recentMilestones.length / days;
}

/**
 * Calculate current streak of consecutive days with activity
 */
export function calculate_current_streak(
    milestones: Milestone[],
    options: ProgressCalculationOptions = {}
): number {
    const { timeThreshold = DEFAULT_TIME_THRESHOLD } = options;

    if (milestones.length === 0) return 0;

    const completedMilestones = milestones
        .filter(m => m.completed && m.completedAt && (!m.timeSpent || m.timeSpent >= timeThreshold * 60))
        .map(m => new Date(m.completedAt!))
        .sort((a, b) => b.getTime() - a.getTime()); // Sort descending

    if (completedMilestones.length === 0) return 0;

    let streak = 0;
    let currentDate = startOfDay(new Date());

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
export function calculate_longest_streak(
    milestones: Milestone[],
    options: ProgressCalculationOptions = {}
): number {
    const { timeThreshold = DEFAULT_TIME_THRESHOLD } = options;

    if (milestones.length === 0) return 0;

    const completedMilestones = milestones
        .filter(m => m.completed && m.completedAt && (!m.timeSpent || m.timeSpent >= timeThreshold * 60))
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
 * Calculate total time spent on milestones
 */
export function calculate_total_time_spent(
    milestones: Milestone[],
    options: ProgressCalculationOptions = {}
): number {
    const { dateRange } = options;

    let filteredMilestones = milestones.filter(m => m.completed && m.timeSpent);

    if (dateRange) {
        filteredMilestones = filteredMilestones.filter(m => {
            if (!m.completedAt) return false;
            const completionDate = new Date(m.completedAt);
            return completionDate >= dateRange.start && completionDate <= dateRange.end;
        });
    }

    return filteredMilestones.reduce((total, milestone) => {
        return total + (milestone.timeSpent || 0);
    }, 0);
}

/**
 * Calculate time analytics by content type
 */
export function calculate_time_by_type(
    milestones: Milestone[],
    options: ProgressCalculationOptions = {}
): TimeAnalytics['timeByType'] {
    const { dateRange } = options;

    let filteredMilestones = milestones.filter(m => m.completed && m.timeSpent);

    if (dateRange) {
        filteredMilestones = filteredMilestones.filter(m => {
            if (!m.completedAt) return false;
            const completionDate = new Date(m.completedAt);
            return completionDate >= dateRange.start && completionDate <= dateRange.end;
        });
    }

    const timeByType = {
        video: 0,
        article: 0,
        exercise: 0,
        quiz: 0
    };

    filteredMilestones.forEach(milestone => {
        if (milestone.timeSpent) {
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
 * Calculate progress trends
 */
export function calculate_progress_trend(
    milestones: Milestone[],
    period: 'day' | 'week' | 'month',
    options: ProgressCalculationOptions = {}
): ProgressTrend {
    const { timeThreshold = DEFAULT_TIME_THRESHOLD } = options;
    
    const days = period === 'day' ? 7 : period === 'week' ? 30 : 90;
    const timeByDay: { [key: string]: { timeSpent: number; milestonesCompleted: number } } = {};

    // Initialize the last N days
    for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'yyyy-MM-dd');
        timeByDay[dateKey] = { timeSpent: 0, milestonesCompleted: 0 };
    }

    // Calculate time spent and milestones completed for each day
    milestones.forEach(milestone => {
        if (milestone.completed && milestone.completedAt && (!milestone.timeSpent || milestone.timeSpent >= timeThreshold * 60)) {
            const completionDate = new Date(milestone.completedAt);
            const dateKey = format(completionDate, 'yyyy-MM-dd');

            if (timeByDay[dateKey]) {
                timeByDay[dateKey].timeSpent += milestone.timeSpent || 0;
                timeByDay[dateKey].milestonesCompleted += 1;
            }
        }
    });

    // Convert to array format and group by period if needed
    let groupedData = Object.entries(timeByDay)
        .map(([date, data]) => ({
            date,
            timeSpent: data.timeSpent,
            milestonesCompleted: data.milestonesCompleted
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (period === 'week') {
        // Group by week
        const weeklyData: { [week: string]: { completed: number; timeSpent: number; velocity: number } } = {};

        groupedData.forEach(day => {
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

        groupedData.forEach(day => {
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

// ============================================================================
// DATA VALIDATION AND SANITIZATION
// ============================================================================

/**
 * Validate milestone data
 */
export function validate_milestone(milestone: Milestone): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!milestone.id) {
        errors.push('Milestone ID is required');
    }

    if (!milestone.title) {
        errors.push('Milestone title is required');
    }

    if (!milestone.description) {
        errors.push('Milestone description is required');
    }

    if (!milestone.type) {
        errors.push('Milestone type is required');
    }

    // Type validation
    if (milestone.type && !['video', 'article', 'exercise', 'quiz'].includes(milestone.type)) {
        errors.push('Invalid milestone type');
    }

    // Time validation
    if (milestone.estimatedTime && milestone.estimatedTime <= 0) {
        errors.push('Estimated time must be positive');
    }

    if (milestone.timeSpent && milestone.timeSpent < 0) {
        errors.push('Time spent cannot be negative');
    }

    // Score validation
    if (milestone.score !== undefined && (milestone.score < 0 || milestone.score > 100)) {
        errors.push('Score must be between 0 and 100');
    }

    // Date validation
    if (milestone.completedAt) {
        const completionDate = new Date(milestone.completedAt);
        if (isNaN(completionDate.getTime())) {
            errors.push('Invalid completion date');
        } else if (completionDate > new Date()) {
            warnings.push('Completion date is in the future');
        }
    }

    // Required boolean fields
    if (milestone.completed === undefined) {
        errors.push('Milestone completion status is required');
    }

    // Consistency checks
    if (milestone.completed && !milestone.completedAt) {
        warnings.push('Completed milestone should have completion date');
    }

    if (!milestone.completed && milestone.completedAt) {
        warnings.push('Incomplete milestone should not have completion date');
    }

    if (milestone.completed && milestone.timeSpent === 0) {
        warnings.push('Completed milestone should have time spent');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate learning path data
 */
export function validate_learning_path(path: LearningPath): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!path.id) {
        errors.push('Learning path ID is required');
    }

    if (!path.topic) {
        errors.push('Learning path topic is required');
    }

    if (!path.milestones) {
        errors.push('Learning path milestones are required');
    }

    // Milestones validation
    if (path.milestones && path.milestones.length === 0) {
        warnings.push('Learning path has no milestones');
    } else if (path.milestones) {
        path.milestones.forEach((milestone, index) => {
            const milestoneValidation = validate_milestone(milestone);
            if (!milestoneValidation.isValid) {
                errors.push(`Milestone ${index + 1}: ${milestoneValidation.errors.join(', ')}`);
            }
            warnings.push(...milestoneValidation.warnings.map(w => `Milestone ${index + 1}: ${w}`));
        });
    }

    // Date validation (commented out since createdAt doesn't exist on LearningPath)
    // if (path.createdAt) {
    //     const createdDate = new Date(path.createdAt);
    //     if (isNaN(createdDate.getTime())) {
    //         errors.push('Invalid creation date');
    //     }
    // }

    // Date validation (commented out since updatedAt doesn't exist on LearningPath)
    // if (path.updatedAt) {
    //     const updatedDate = new Date(path.updatedAt);
    //     if (isNaN(updatedDate.getTime())) {
    //         errors.push('Invalid update date');
    //     }
    // }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate achievement data
 */
export function validate_achievement(achievement: Achievement): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!achievement.id) {
        errors.push('Achievement ID is required');
    }

    if (!achievement.title) {
        errors.push('Achievement title is required');
    }

    if (!achievement.description) {
        errors.push('Achievement description is required');
    }

    if (!achievement.icon) {
        errors.push('Achievement icon is required');
    }

    if (!achievement.criteria) {
        errors.push('Achievement criteria are required');
    }

    // Criteria validation
    if (achievement.criteria) {
        const criterion = achievement.criteria;
        if (!criterion.type) {
            errors.push('Criterion: Type is required');
        }

        if (criterion.value <= 0) {
            errors.push('Criterion: Required value must be positive');
        }
    }

    // Date validation
    if (achievement.unlockedAt) {
        const unlockDate = new Date(achievement.unlockedAt);
        if (isNaN(unlockDate.getTime())) {
            errors.push('Invalid unlock date');
        } else if (unlockDate > new Date()) {
            warnings.push('Unlock date is in the future');
        }
    }

    // Consistency checks
    if (achievement.unlocked && !achievement.unlockedAt) {
        warnings.push('Unlocked achievement should have unlock date');
    }

    if (!achievement.unlocked && achievement.unlockedAt) {
        warnings.push('Locked achievement should not have unlock date');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Sanitize milestone data
 */
export function sanitize_milestone(milestone: Milestone): Milestone {
    return {
        ...milestone,
        id: milestone.id?.trim() || '',
        title: milestone.title?.trim() || '',
        description: milestone.description?.trim() || '',
        type: milestone.type || 'video',
        estimatedTime: Math.max(0, milestone.estimatedTime || 0),
        timeSpent: Math.max(0, milestone.timeSpent || 0),
        score: milestone.score !== undefined ? Math.max(0, Math.min(100, milestone.score)) : undefined,
        notes: milestone.notes?.trim() || undefined,
        completed: Boolean(milestone.completed),
        completedAt: milestone.completedAt || undefined
    };
}

/**
 * Sanitize learning path data
 */
export function sanitize_learning_path(path: LearningPath): LearningPath {
    return {
        ...path,
        id: path.id?.trim() || '',
        topic: path.topic?.trim() || '',
        milestones: path.milestones?.map(sanitize_milestone) || []
    };
}

/**
 * Sanitize achievement data
 */
export function sanitize_achievement(achievement: Achievement): Achievement {
    return {
        ...achievement,
        id: achievement.id?.trim() || '',
        title: achievement.title?.trim() || '',
        description: achievement.description?.trim() || '',
        icon: achievement.icon?.trim() || '🏆',
        criteria: achievement.criteria ? {
            ...achievement.criteria,
            type: achievement.criteria.type || 'milestone_count',
            value: Math.max(1, achievement.criteria.value || 1)
        } : achievement.criteria
    };
}

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Export progress data in various formats
 */
export function export_progress_data(
    state: ProgressState,
    options: ExportOptions = { format: 'json' }
): string {
    const { format, includeAnalytics = true, includeAchievements = true, dateRange } = options;

    // Prepare export data
    const exportData: any = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        learningPaths: Object.values(state.learningPaths).map(path => ({
            id: path.id,
            topic: path.topic,
            milestones: path.milestones.map(m => ({
                id: m.id,
                title: m.title,
                type: m.type,
                completed: m.completed,
                completedAt: m.completedAt,
                timeSpent: m.timeSpent,
                score: m.score
            }))
        }))
    };

    if (includeAchievements) {
        exportData.achievements = state.achievements.map(a => ({
            id: a.id,
            title: a.title,
            unlocked: a.unlocked,
            unlockedAt: a.unlockedAt
        }));
    }

    if (includeAnalytics) {
        const allMilestones = Object.values(state.learningPaths).flatMap(path => path.milestones);
        
        exportData.analytics = {
            totalMilestones: allMilestones.length,
            completedMilestones: allMilestones.filter(m => m.completed).length,
            totalTimeSpent: calculate_total_time_spent(allMilestones, { dateRange }),
            timeByType: calculate_time_by_type(allMilestones, { dateRange }),
            currentStreak: calculate_current_streak(allMilestones),
            longestStreak: calculate_longest_streak(allMilestones)
        };
    }

    // Format export
    switch (format) {
        case 'json':
            return JSON.stringify(exportData, null, 2);
        
        case 'csv':
            return convert_to_csv(exportData);
        
        case 'pdf':
            return convert_to_pdf(exportData);
        
        default:
            return JSON.stringify(exportData, null, 2);
    }
}

/**
 * Convert data to CSV format
 */
function convert_to_csv(data: any): string {
    const lines: string[] = [];
    
    // Add header
    lines.push('Type,ID,Title,Status,Completed At,Time Spent,Score');
    
    // Add learning paths and milestones
    data.learningPaths.forEach((path: any) => {
        path.milestones.forEach((milestone: any) => {
            lines.push([
                'Milestone',
                milestone.id,
                `"${milestone.title}"`,
                milestone.completed ? 'Completed' : 'Incomplete',
                milestone.completedAt || '',
                milestone.timeSpent || 0,
                milestone.score || ''
            ].join(','));
        });
    });
    
    // Add achievements
    if (data.achievements) {
        data.achievements.forEach((achievement: any) => {
            lines.push([
                'Achievement',
                achievement.id,
                `"${achievement.title}"`,
                achievement.unlocked ? 'Unlocked' : 'Locked',
                achievement.unlockedAt || '',
                '',
                ''
            ].join(','));
        });
    }
    
    return lines.join('\n');
}

/**
 * Convert data to PDF format (placeholder)
 */
function convert_to_pdf(data: any): string {
    // This would normally use a PDF library like jsPDF
    // For now, return a formatted text representation
    return `Progress Report - ${new Date().toLocaleDateString()}\n\n` +
           `Total Milestones: ${data.analytics?.totalMilestones || 0}\n` +
           `Completed: ${data.analytics?.completedMilestones || 0}\n` +
           `Total Time: ${Math.round((data.analytics?.totalTimeSpent || 0) / 60)} minutes\n` +
           `Current Streak: ${data.analytics?.currentStreak || 0} days`;
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Optimize large datasets for performance
 */
export function optimize_dataset<T>(
    data: T[],
    maxSize: number = MAX_DATASET_SIZE
): T[] {
    if (data.length <= maxSize) {
        return data;
    }

    // For large datasets, sample data for performance
    const step = Math.ceil(data.length / maxSize);
    return data.filter((_, index) => index % step === 0);
}

/**
 * Measure performance of calculations
 */
export function measure_performance<T>(
    fn: () => T,
    description: string = 'Operation'
): { result: T; metrics: PerformanceMetrics } {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const result = fn();
    
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const metrics: PerformanceMetrics = {
        calculationTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        dataSize: 0 // This would be set based on the actual data size
    };

    console.debug(`${description} performance:`, metrics);
    
    return { result, metrics };
}

/**
 * Cache-optimized progress calculation
 */
export function calculate_cached_progress(
    state: ProgressState,
    options: ProgressCalculationOptions = {}
): ProgressMetrics {
    const cacheKey = `progress_${JSON.stringify(options)}_${state.learningPaths ? Object.keys(state.learningPaths).length : 0}`;
    
    const cached = progressCache.get<ProgressMetrics>(cacheKey);
    if (cached) {
        return cached;
    }

    const allMilestones = Object.values(state.learningPaths || {})
        .flatMap(path => path.milestones);

    const metrics: ProgressMetrics = {
        totalMilestones: allMilestones.length,
        completedMilestones: allMilestones.filter(m => m.completed).length,
        completionPercentage: calculate_completion_percentage(allMilestones, options),
        totalTimeSpent: calculate_total_time_spent(allMilestones, options),
        averageTimePerMilestone: 0,
        learningVelocity: calculate_learning_velocity(allMilestones, 7, options),
        currentStreak: calculate_current_streak(allMilestones, options),
        longestStreak: calculate_longest_streak(allMilestones, options),
        estimatedTimeToComplete: 0,
        timeSpentToday: calculate_total_time_spent(allMilestones, {
            ...options,
            dateRange: { start: startOfDay(new Date()), end: endOfDay(new Date()) }
        }),
        timeSpentThisWeek: calculate_total_time_spent(allMilestones, {
            ...options,
            dateRange: { start: subDays(new Date(), 7), end: new Date() }
        }),
        timeSpentThisMonth: calculate_total_time_spent(allMilestones, {
            ...options,
            dateRange: { start: subDays(new Date(), 30), end: new Date() }
        })
    };

    // Calculate derived metrics
    const completedMilestones = allMilestones.filter(m => m.completed);
    metrics.averageTimePerMilestone = completedMilestones.length > 0 
        ? metrics.totalTimeSpent / completedMilestones.length 
        : 0;

    const remainingMilestones = metrics.totalMilestones - metrics.completedMilestones;
    metrics.estimatedTimeToComplete = metrics.learningVelocity > 0 
        ? (remainingMilestones / metrics.learningVelocity) * 24 * 60 
        : 0;

    // Cache the result
    progressCache.set(cacheKey, metrics);
    
    return metrics;
}

// ============================================================================
// ACHIEVEMENT CRITERIA CHECKING
// ============================================================================

/**
 * Check achievement eligibility
 */
export function check_achievement_eligibility(
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

        const criteriaArray = [{
            type: criterion.type,
            current,
            required,
            description: `${criterion.type.replace('_', ' ')} requirement`
        }];

        const progress = Math.min((current / required) * 100, 100);
        const isEligible = current >= required;

        // Estimate time to unlock based on current velocity
        let estimatedTimeToUnlock = 0;
        if (!isEligible && metrics.learningVelocity > 0) {
            const remainingMilestones = metrics.totalMilestones - metrics.completedMilestones;
            estimatedTimeToUnlock = Math.round(remainingMilestones / metrics.learningVelocity * 24 * 60);
        }

        return {
            achievementId: achievement.id,
            isEligible,
            progress: Math.round(progress),
            criteria: criteriaArray,
            estimatedTimeToUnlock
        };
    });
}

// ============================================================================
// TIME-BASED CALCULATIONS AND FORMATTING
// ============================================================================

/**
 * Format time duration in human-readable format
 */
export function format_duration(minutes: number): string {
    if (minutes < 1) {
        return 'Less than 1 minute';
    }

    if (minutes < 60) {
        return `${Math.round(minutes)} minute${Math.round(minutes) !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Format date in human-readable format
 */
export function format_date(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format date and time in human-readable format
 */
export function format_datetime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy HH:mm');
}

/**
 * Calculate time difference in human-readable format
 */
export function format_time_difference(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, dateObj);

    if (diffInMinutes < 1) {
        return 'Just now';
    }

    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = differenceInHours(now, dateObj);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = differenceInDays(now, dateObj);
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    return format_date(dateObj);
}

/**
 * Get time periods for analytics
 */
export function get_time_periods(): {
    today: { start: Date; end: Date };
    thisWeek: { start: Date; end: Date };
    thisMonth: { start: Date; end: Date };
    lastWeek: { start: Date; end: Date };
    lastMonth: { start: Date; end: Date };
} {
    const now = new Date();
    
    return {
        today: {
            start: startOfDay(now),
            end: endOfDay(now)
        },
        thisWeek: {
            start: startOfDay(subDays(now, 7)),
            end: now
        },
        thisMonth: {
            start: startOfDay(subDays(now, 30)),
            end: now
        },
        lastWeek: {
            start: startOfDay(subDays(now, 14)),
            end: startOfDay(subDays(now, 7))
        },
        lastMonth: {
            start: startOfDay(subDays(now, 60)),
            end: startOfDay(subDays(now, 30))
        }
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clear all progress cache
 */
export function clear_progress_cache(): void {
    progressCache.clear();
}

/**
 * Get cache statistics
 */
export function get_cache_stats(): { size: number; entries: string[] } {
    return {
        size: progressCache.size(),
        entries: Array.from(progressCache['cache'].keys())
    };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
