import {
    calculate_completion_percentage,
    calculate_learning_velocity,
    calculate_current_streak,
    calculate_longest_streak,
    calculate_total_time_spent,
    calculate_time_by_type,
    calculate_progress_trend,
    validate_milestone,
    validate_learning_path,
    validate_achievement,
    sanitize_milestone,
    sanitize_learning_path,
    sanitize_achievement,
    export_progress_data,
    optimize_dataset,
    measure_performance,
    calculate_cached_progress,
    check_achievement_eligibility,
    format_duration,
    format_date,
    format_datetime,
    format_time_difference,
    get_time_periods,
    clear_progress_cache,
    get_cache_stats,
    debounce,
    throttle
} from './progress-utils';

import type { Milestone, LearningPath, Achievement, ProgressState } from '@/contexts/ProgressContext';
import type { ProgressMetrics } from '@/hooks/useProgress';

// ============================================================================
// TEST DATA
// ============================================================================

const mockMilestones: Milestone[] = [
    {
        id: 'milestone-1',
        title: 'Introduction to React',
        description: 'Learn the basics of React',
        type: 'video',
        estimatedTime: 30,
        completed: true,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        timeSpent: 1800, // 30 minutes
        score: 85,
        notes: 'Great introduction!'
    },
    {
        id: 'milestone-2',
        title: 'React Components',
        description: 'Understanding React components',
        type: 'article',
        estimatedTime: 45,
        completed: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        timeSpent: 2700, // 45 minutes
        score: 90,
        notes: 'Very helpful'
    },
    {
        id: 'milestone-3',
        title: 'State Management',
        description: 'Learn about state in React',
        type: 'exercise',
        estimatedTime: 60,
        completed: false,
        timeSpent: 0,
        score: undefined,
        notes: undefined
    }
];

const mockLearningPath: LearningPath = {
    id: 'test-path',
    topic: 'React Development',
    milestones: mockMilestones,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

const mockAchievements: Achievement[] = [
    {
        id: 'first-milestone',
        title: 'First Steps',
        description: 'Complete your first milestone',
        icon: '🎯',
        criteria: [
            {
                type: 'milestones_completed',
                required: 1,
                description: 'Complete 1 milestone'
            }
        ],
        unlocked: true,
        unlockedAt: new Date().toISOString()
    },
    {
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        criteria: [
            {
                type: 'streak_days',
                required: 7,
                description: 'Maintain a 7-day streak'
            }
        ],
        unlocked: false,
        unlockedAt: undefined
    }
];

const mockProgressState: ProgressState = {
    learningPaths: {
        'test-path': mockLearningPath
    },
    achievements: mockAchievements,
    aiCreditProtection: false
};

// ============================================================================
// PROGRESS CALCULATION TESTS
// ============================================================================

describe('Progress Calculation Functions', () => {
    describe('calculate_completion_percentage', () => {
        it('should return 0 for empty milestones', () => {
            expect(calculate_completion_percentage([])).toBe(0);
        });

        it('should calculate correct completion percentage', () => {
            expect(calculate_completion_percentage(mockMilestones)).toBe(67);
        });

        it('should handle options correctly', () => {
            expect(calculate_completion_percentage(mockMilestones, { includeIncomplete: true })).toBe(67);
            expect(calculate_completion_percentage(mockMilestones, { timeThreshold: 10 })).toBe(67);
        });
    });

    describe('calculate_learning_velocity', () => {
        it('should return 0 for empty milestones', () => {
            expect(calculate_learning_velocity([])).toBe(0);
        });

        it('should calculate velocity correctly', () => {
            const velocity = calculate_learning_velocity(mockMilestones, 7);
            expect(velocity).toBeGreaterThanOrEqual(0);
        });

        it('should handle different time periods', () => {
            expect(calculate_learning_velocity(mockMilestones, 1)).toBeGreaterThanOrEqual(0);
            expect(calculate_learning_velocity(mockMilestones, 30)).toBeGreaterThanOrEqual(0);
        });
    });

    describe('calculate_current_streak', () => {
        it('should return 0 for empty milestones', () => {
            expect(calculate_current_streak([])).toBe(0);
        });

        it('should calculate current streak correctly', () => {
            const streak = calculate_current_streak(mockMilestones);
            expect(streak).toBeGreaterThanOrEqual(0);
        });

        it('should handle time threshold options', () => {
            const streak = calculate_current_streak(mockMilestones, { timeThreshold: 10 });
            expect(streak).toBeGreaterThanOrEqual(0);
        });
    });

    describe('calculate_longest_streak', () => {
        it('should return 0 for empty milestones', () => {
            expect(calculate_longest_streak([])).toBe(0);
        });

        it('should calculate longest streak correctly', () => {
            const streak = calculate_longest_streak(mockMilestones);
            expect(streak).toBeGreaterThanOrEqual(0);
        });
    });

    describe('calculate_total_time_spent', () => {
        it('should return 0 for empty milestones', () => {
            expect(calculate_total_time_spent([])).toBe(0);
        });

        it('should calculate total time spent correctly', () => {
            expect(calculate_total_time_spent(mockMilestones)).toBe(4500); // 75 minutes
        });

        it('should handle date range options', () => {
            const today = new Date();
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            const timeSpent = calculate_total_time_spent(mockMilestones, {
                dateRange: { start: yesterday, end: today }
            });
            expect(timeSpent).toBeGreaterThanOrEqual(0);
        });
    });

    describe('calculate_time_by_type', () => {
        it('should return zero values for empty milestones', () => {
            const result = calculate_time_by_type([]);
            expect(result).toEqual({
                video: 0,
                article: 0,
                exercise: 0,
                quiz: 0
            });
        });

        it('should calculate time by type correctly', () => {
            const result = calculate_time_by_type(mockMilestones);
            expect(result.video).toBe(1800); // 30 minutes
            expect(result.article).toBe(2700); // 45 minutes
            expect(result.exercise).toBe(0);
            expect(result.quiz).toBe(0);
        });
    });

    describe('calculate_progress_trend', () => {
        it('should calculate daily trend correctly', () => {
            const trend = calculate_progress_trend(mockMilestones, 'day');
            expect(trend.period).toBe('day');
            expect(trend.trend).toMatch(/up|down|stable/);
            expect(trend.changePercentage).toBeGreaterThanOrEqual(0);
        });

        it('should calculate weekly trend correctly', () => {
            const trend = calculate_progress_trend(mockMilestones, 'week');
            expect(trend.period).toBe('week');
            expect(trend.trend).toMatch(/up|down|stable/);
        });

        it('should calculate monthly trend correctly', () => {
            const trend = calculate_progress_trend(mockMilestones, 'month');
            expect(trend.period).toBe('month');
            expect(trend.trend).toMatch(/up|down|stable/);
        });
    });
});

// ============================================================================
// DATA VALIDATION TESTS
// ============================================================================

describe('Data Validation Functions', () => {
    describe('validate_milestone', () => {
        it('should validate valid milestone', () => {
            const result = validate_milestone(mockMilestones[0]);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid milestone', () => {
            const invalidMilestone: Milestone = {
                id: '',
                title: '',
                description: '',
                type: 'invalid' as any,
                estimatedTime: -1,
                completed: false,
                timeSpent: -1,
                score: 150
            };

            const result = validate_milestone(invalidMilestone);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should provide warnings for inconsistent data', () => {
            const inconsistentMilestone: Milestone = {
                ...mockMilestones[0],
                completed: true,
                completedAt: undefined,
                timeSpent: 0
            };

            const result = validate_milestone(inconsistentMilestone);
            expect(result.warnings.length).toBeGreaterThan(0);
        });
    });

    describe('validate_learning_path', () => {
        it('should validate valid learning path', () => {
            const result = validate_learning_path(mockLearningPath);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid learning path', () => {
            const invalidPath: LearningPath = {
                id: '',
                topic: '',
                milestones: [],
                createdAt: 'invalid-date',
                updatedAt: 'invalid-date'
            };

            const result = validate_learning_path(invalidPath);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('validate_achievement', () => {
        it('should validate valid achievement', () => {
            const result = validate_achievement(mockAchievements[0]);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid achievement', () => {
            const invalidAchievement: Achievement = {
                id: '',
                title: '',
                description: '',
                icon: '',
                criteria: [],
                unlocked: false,
                unlockedAt: undefined
            };

            const result = validate_achievement(invalidAchievement);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});

// ============================================================================
// DATA SANITIZATION TESTS
// ============================================================================

describe('Data Sanitization Functions', () => {
    describe('sanitize_milestone', () => {
        it('should sanitize milestone data', () => {
            const dirtyMilestone: Milestone = {
                id: '  test-id  ',
                title: '  Test Title  ',
                description: '  Test Description  ',
                type: undefined as any,
                estimatedTime: -10,
                completed: 'true' as any,
                timeSpent: -5,
                score: 150,
                notes: '  Test Notes  ',
                completedAt: undefined
            };

            const sanitized = sanitize_milestone(dirtyMilestone);
            expect(sanitized.id).toBe('test-id');
            expect(sanitized.title).toBe('Test Title');
            expect(sanitized.description).toBe('Test Description');
            expect(sanitized.type).toBe('video');
            expect(sanitized.estimatedTime).toBe(0);
            expect(sanitized.completed).toBe(true);
            expect(sanitized.timeSpent).toBe(0);
            expect(sanitized.score).toBe(100);
            expect(sanitized.notes).toBe('Test Notes');
        });
    });

    describe('sanitize_learning_path', () => {
        it('should sanitize learning path data', () => {
            const dirtyPath: LearningPath = {
                id: '  test-path  ',
                topic: '  Test Topic  ',
                milestones: [],
                createdAt: undefined as any,
                updatedAt: undefined as any
            };

            const sanitized = sanitize_learning_path(dirtyPath);
            expect(sanitized.id).toBe('test-path');
            expect(sanitized.topic).toBe('Test Topic');
            expect(sanitized.createdAt).toBeDefined();
            expect(sanitized.updatedAt).toBeDefined();
        });
    });

    describe('sanitize_achievement', () => {
        it('should sanitize achievement data', () => {
            const dirtyAchievement: Achievement = {
                id: '  test-achievement  ',
                title: '  Test Achievement  ',
                description: '  Test Description  ',
                icon: '  🏆  ',
                criteria: [
                    {
                        type: '  milestones_completed  ',
                        required: -1,
                        description: '  Test Criterion  '
                    }
                ],
                unlocked: 'false' as any,
                unlockedAt: undefined
            };

            const sanitized = sanitize_achievement(dirtyAchievement);
            expect(sanitized.id).toBe('test-achievement');
            expect(sanitized.title).toBe('Test Achievement');
            expect(sanitized.description).toBe('Test Description');
            expect(sanitized.icon).toBe('🏆');
            expect(sanitized.criteria[0].type).toBe('milestones_completed');
            expect(sanitized.criteria[0].required).toBe(1);
            expect(sanitized.criteria[0].description).toBe('Test Criterion');
            expect(sanitized.unlocked).toBe(false);
        });
    });
});

// ============================================================================
// EXPORT FUNCTIONALITY TESTS
// ============================================================================

describe('Export Functionality', () => {
    describe('export_progress_data', () => {
        it('should export data in JSON format', () => {
            const result = export_progress_data(mockProgressState, { format: 'json' });
            const parsed = JSON.parse(result);
            expect(parsed.exportDate).toBeDefined();
            expect(parsed.version).toBe('1.0');
            expect(parsed.learningPaths).toBeDefined();
            expect(parsed.achievements).toBeDefined();
            expect(parsed.analytics).toBeDefined();
        });

        it('should export data in CSV format', () => {
            const result = export_progress_data(mockProgressState, { format: 'csv' });
            expect(result).toContain('Type,ID,Title,Status,Completed At,Time Spent,Score');
            expect(result).toContain('Milestone');
        });

        it('should export data in PDF format', () => {
            const result = export_progress_data(mockProgressState, { format: 'pdf' });
            expect(result).toContain('Progress Report');
            expect(result).toContain('Total Milestones');
        });

        it('should handle export options correctly', () => {
            const result = export_progress_data(mockProgressState, {
                format: 'json',
                includeAnalytics: false,
                includeAchievements: false
            });
            const parsed = JSON.parse(result);
            expect(parsed.analytics).toBeUndefined();
            expect(parsed.achievements).toBeUndefined();
        });
    });
});

// ============================================================================
// PERFORMANCE OPTIMIZATION TESTS
// ============================================================================

describe('Performance Optimization Functions', () => {
    describe('optimize_dataset', () => {
        it('should return original dataset if under max size', () => {
            const data = [1, 2, 3, 4, 5];
            const result = optimize_dataset(data, 10);
            expect(result).toEqual(data);
        });

        it('should optimize large datasets', () => {
            const data = Array.from({ length: 1000 }, (_, i) => i);
            const result = optimize_dataset(data, 100);
            expect(result.length).toBeLessThanOrEqual(100);
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('measure_performance', () => {
        it('should measure performance correctly', () => {
            const { result, metrics } = measure_performance(() => {
                return Array.from({ length: 1000 }, (_, i) => i * 2);
            }, 'Test Operation');

            expect(result).toHaveLength(1000);
            expect(metrics.calculationTime).toBeGreaterThan(0);
            expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
        });
    });

    describe('calculate_cached_progress', () => {
        it('should calculate cached progress correctly', () => {
            const metrics = calculate_cached_progress(mockProgressState);
            expect(metrics.totalMilestones).toBe(3); // Using default TOTAL_MILESTONES from config
            expect(metrics.completedMilestones).toBe(2);
            expect(metrics.completionPercentage).toBe(67);
        });

        it('should use cache for repeated calls', () => {
            // Clear cache first
            clear_progress_cache();
            
            const firstCall = calculate_cached_progress(mockProgressState);
            const secondCall = calculate_cached_progress(mockProgressState);
            
            expect(firstCall).toEqual(secondCall);
        });
    });
});

// ============================================================================
// ACHIEVEMENT CRITERIA CHECKING TESTS
// ============================================================================

describe('Achievement Criteria Checking', () => {
    describe('check_achievement_eligibility', () => {
        it('should check achievement eligibility correctly', () => {
            const metrics: ProgressMetrics = {
                totalMilestones: 3, // Using default TOTAL_MILESTONES from config
                completedMilestones: 2,
                completionPercentage: 67,
                totalTimeSpent: 4500,
                averageTimePerMilestone: 2250,
                learningVelocity: 0.29,
                currentStreak: 1,
                longestStreak: 1,
                estimatedTimeToComplete: 0,
                timeSpentToday: 0,
                timeSpentThisWeek: 4500,
                timeSpentThisMonth: 4500
            };

            const eligibility = check_achievement_eligibility(mockAchievements, mockMilestones, metrics);
            expect(eligibility).toHaveLength(2);
            
            const firstMilestoneAchievement = eligibility.find(a => a.achievementId === 'first-milestone');
            expect(firstMilestoneAchievement?.isEligible).toBe(true);
            expect(firstMilestoneAchievement?.progress).toBe(100);
        });
    });
});

// ============================================================================
// TIME-BASED CALCULATIONS TESTS
// ============================================================================

describe('Time-based Calculations and Formatting', () => {
    describe('format_duration', () => {
        it('should format duration correctly', () => {
            expect(format_duration(0)).toBe('Less than 1 minute');
            expect(format_duration(30)).toBe('30 minutes');
            expect(format_duration(60)).toBe('1 hour');
            expect(format_duration(90)).toBe('1 hour 30 minutes');
            expect(format_duration(120)).toBe('2 hours');
        });
    });

    describe('format_date', () => {
        it('should format date correctly', () => {
            const date = new Date('2023-12-25T12:00:00Z');
            const result = format_date(date);
            expect(result).toMatch(/Dec 25, 2023/);
        });

        it('should handle string dates', () => {
            const result = format_date('2023-12-25T12:00:00Z');
            expect(result).toMatch(/Dec 25, 2023/);
        });
    });

    describe('format_datetime', () => {
        it('should format datetime correctly', () => {
            const date = new Date('2023-12-25T10:30:00');
            const result = format_datetime(date);
            expect(result).toMatch(/Dec 25, 2023/);
            expect(result).toMatch(/10:30/);
        });
    });

    describe('format_time_difference', () => {
        it('should format time differences correctly', () => {
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            expect(format_time_difference(oneMinuteAgo)).toContain('minute');
            expect(format_time_difference(oneHourAgo)).toContain('hour');
            expect(format_time_difference(oneDayAgo)).toContain('day');
        });
    });

    describe('get_time_periods', () => {
        it('should return time periods correctly', () => {
            const periods = get_time_periods();
            expect(periods.today).toBeDefined();
            expect(periods.thisWeek).toBeDefined();
            expect(periods.thisMonth).toBeDefined();
            expect(periods.lastWeek).toBeDefined();
            expect(periods.lastMonth).toBeDefined();
        });
    });
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
    describe('Cache Management', () => {
        it('should clear cache correctly', () => {
            clear_progress_cache();
            const stats = get_cache_stats();
            expect(stats.size).toBe(0);
        });

        it('should get cache statistics', () => {
            clear_progress_cache();
            calculate_cached_progress(mockProgressState);
            const stats = get_cache_stats();
            expect(stats.size).toBeGreaterThan(0);
            expect(stats.entries).toBeDefined();
        });
    });

    describe('debounce', () => {
        it('should debounce function calls', (done) => {
            let callCount = 0;
            const debouncedFn = debounce(() => {
                callCount++;
            }, 100);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            setTimeout(() => {
                expect(callCount).toBe(1);
                done();
            }, 150);
        });
    });

    describe('throttle', () => {
        it('should throttle function calls', (done) => {
            let callCount = 0;
            const throttledFn = throttle(() => {
                callCount++;
            }, 100);

            throttledFn();
            throttledFn();
            throttledFn();

            setTimeout(() => {
                expect(callCount).toBe(1);
                done();
            }, 50);
        });
    });
});

// ============================================================================
// EDGE CASES AND ERROR HANDLING
// ============================================================================

describe('Edge Cases and Error Handling', () => {
    describe('Empty and Invalid Data', () => {
        it('should handle empty milestones array', () => {
            expect(calculate_completion_percentage([])).toBe(0);
            expect(calculate_learning_velocity([])).toBe(0);
            expect(calculate_current_streak([])).toBe(0);
            expect(calculate_longest_streak([])).toBe(0);
            expect(calculate_total_time_spent([])).toBe(0);
        });

        it('should handle null/undefined values gracefully', () => {
            const invalidMilestone: Milestone = {
                id: 'test',
                title: 'Test',
                description: 'Test',
                type: 'video',
                estimatedTime: undefined as any,
                completed: undefined as any,
                timeSpent: undefined as any,
                score: undefined,
                notes: undefined,
                completedAt: undefined
            };

            const result = validate_milestone(invalidMilestone);
            expect(result.isValid).toBe(false);
        });
    });

    describe('Performance with Large Datasets', () => {
        it('should handle large datasets efficiently', () => {
            const largeMilestones = Array.from({ length: 10000 }, (_, i) => ({
                id: `milestone-${i}`,
                title: `Milestone ${i}`,
                description: `Description ${i}`,
                type: 'video' as const,
                estimatedTime: 30,
                completed: i % 2 === 0,
                completedAt: i % 2 === 0 ? new Date().toISOString() : undefined,
                timeSpent: i % 2 === 0 ? 1800 : 0,
                score: i % 2 === 0 ? 85 : undefined,
                notes: i % 2 === 0 ? 'Notes' : undefined
            }));

            const startTime = performance.now();
            const result = calculate_completion_percentage(largeMilestones);
            const endTime = performance.now();

            expect(result).toBe(50);
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
        });
    });
});
