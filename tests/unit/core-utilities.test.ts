/**
 * Core Utilities Unit Tests
 * Tests for essential utility functions used throughout the application
 */

import { 
  calculateProgressPercentage, 
  formatTimeSpent, 
  getTimeSinceLastActivity,
  generateSkillSummary,
  validateMilestoneData,
  sanitizeUserInput
} from '@/lib/utils/progress-utils';

// Mock data for testing
const mockMilestones = [
  { id: '1', title: 'Milestone 1', completed: true, completedAt: '2025-01-01T10:00:00Z' },
  { id: '2', title: 'Milestone 2', completed: true, completedAt: '2025-01-02T10:00:00Z' },
  { id: '3', title: 'Milestone 3', completed: false },
  { id: '4', title: 'Milestone 4', completed: false },
  { id: '5', title: 'Milestone 5', completed: false }
];

const mockSkillData = {
  id: 'javascript',
  name: 'JavaScript',
  milestones: mockMilestones,
  createdAt: '2025-01-01T09:00:00Z',
  lastActivity: '2025-01-02T10:00:00Z'
};

describe('Core Utilities', () => {
  describe('calculateProgressPercentage', () => {
    it('should calculate correct percentage for completed milestones', () => {
      const progress = calculateProgressPercentage(mockMilestones);
      expect(progress).toBe(40); // 2 completed out of 5 total = 40%
    });

    it('should return 0 for empty milestones array', () => {
      const progress = calculateProgressPercentage([]);
      expect(progress).toBe(0);
    });

    it('should return 100 for all completed milestones', () => {
      const allCompleted = mockMilestones.map(m => ({ ...m, completed: true }));
      const progress = calculateProgressPercentage(allCompleted);
      expect(progress).toBe(100);
    });

    it('should handle milestones with undefined completed status', () => {
      const mixedMilestones = [
        { id: '1', title: 'Milestone 1', completed: true },
        { id: '2', title: 'Milestone 2', completed: undefined },
        { id: '3', title: 'Milestone 3', completed: false }
      ];
      const progress = calculateProgressPercentage(mixedMilestones);
      expect(progress).toBe(33); // 1 completed out of 3 total = 33%
    });
  });

  describe('formatTimeSpent', () => {
    it('should format minutes correctly', () => {
      const time = formatTimeSpent(45);
      expect(time).toBe('45 minutes');
    });

    it('should format hours correctly', () => {
      const time = formatTimeSpent(120);
      expect(time).toBe('2 hours');
    });

    it('should format hours and minutes correctly', () => {
      const time = formatTimeSpent(90);
      expect(time).toBe('1 hour 30 minutes');
    });

    it('should handle zero minutes', () => {
      const time = formatTimeSpent(0);
      expect(time).toBe('0 minutes');
    });

    it('should handle large time values', () => {
      const time = formatTimeSpent(1440); // 24 hours
      expect(time).toBe('24 hours');
    });
  });

  describe('getTimeSinceLastActivity', () => {
    beforeEach(() => {
      // Mock current date using Jest's timer mocking
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-03T10:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Just now" for recent activity', () => {
      const recentTime = '2025-01-03T09:59:30Z';
      const timeSince = getTimeSinceLastActivity(recentTime);
      expect(timeSince).toBe('Just now');
    });

    it('should return minutes for activity within an hour', () => {
      const time30MinAgo = '2025-01-03T09:30:00Z';
      const timeSince = getTimeSinceLastActivity(time30MinAgo);
      expect(timeSince).toBe('30 minutes ago');
    });

    it('should return hours for activity within a day', () => {
      const time2HoursAgo = '2025-01-03T08:00:00Z';
      const timeSince = getTimeSinceLastActivity(time2HoursAgo);
      expect(timeSince).toBe('2 hours ago');
    });

    it('should return days for older activity', () => {
      const time2DaysAgo = '2025-01-01T10:00:00Z';
      const timeSince = getTimeSinceLastActivity(time2DaysAgo);
      expect(timeSince).toBe('2 days ago');
    });

    it('should handle invalid date strings', () => {
      const timeSince = getTimeSinceLastActivity('invalid-date');
      expect(timeSince).toBe('Unknown');
    });
  });

  describe('generateSkillSummary', () => {
    it('should generate correct summary for active skill', () => {
      const summary = generateSkillSummary(mockSkillData);
      
      expect(summary).toMatchObject({
        id: 'javascript',
        name: 'JavaScript',
        progressPercentage: 40,
        completedMilestones: 2,
        totalMilestones: 5,
        currentMilestone: 'Milestone 3',
        timeSpent: '0 minutes', // Mock data doesn't include timeSpent
        status: 'in-progress'
      });
      // Check that lastActivity is a string (we can't predict the exact value due to date mocking)
      expect(typeof summary.lastActivity).toBe('string');
    });

    it('should handle completed skill', () => {
      const completedSkill = {
        ...mockSkillData,
        milestones: mockMilestones.map(m => ({ ...m, completed: true }))
      };
      
      const summary = generateSkillSummary(completedSkill);
      expect(summary.status).toBe('completed');
      expect(summary.progressPercentage).toBe(100);
    });

    it('should handle skill with no milestones', () => {
      const emptySkill = { ...mockSkillData, milestones: [] };
      const summary = generateSkillSummary(emptySkill);
      
      expect(summary.progressPercentage).toBe(0);
      expect(summary.completedMilestones).toBe(0);
      expect(summary.totalMilestones).toBe(0);
      expect(summary.currentMilestone).toBe('No milestones');
    });
  });

  describe('validateMilestoneData', () => {
    it('should validate correct milestone data', () => {
      const validMilestone = {
        id: '1',
        title: 'Test Milestone',
        description: 'Test description',
        levelNumber: 1,
        difficulty: 'beginner',
        estimatedTime: 30
      };
      
      const result = validateMilestoneData(validMilestone);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidMilestone = {
        id: '1',
        title: '', // Missing title
        description: 'Test description'
        // Missing other required fields
      };
      
      const result = validateMilestoneData(invalidMilestone);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Level number is required');
    });

    it('should validate difficulty levels', () => {
      const invalidMilestone = {
        id: '1',
        title: 'Test Milestone',
        description: 'Test description',
        levelNumber: 1,
        difficulty: 'invalid-difficulty',
        estimatedTime: 30
      };
      
      const result = validateMilestoneData(invalidMilestone);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty must be beginner, intermediate, or advanced');
    });

    it('should validate estimated time is positive', () => {
      const invalidMilestone = {
        id: '1',
        title: 'Test Milestone',
        description: 'Test description',
        levelNumber: 1,
        difficulty: 'beginner',
        estimatedTime: -5
      };
      
      const result = validateMilestoneData(invalidMilestone);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated time must be positive');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeUserInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const sanitized = sanitizeUserInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should handle empty input', () => {
      const input = '';
      const sanitized = sanitizeUserInput(input);
      expect(sanitized).toBe('');
    });

    it('should handle null/undefined input', () => {
      expect(sanitizeUserInput(null)).toBe('');
      expect(sanitizeUserInput(undefined)).toBe('');
    });

    it('should preserve valid characters', () => {
      const input = 'Hello World 123!@#$%^&*()';
      const sanitized = sanitizeUserInput(input);
      expect(sanitized).toBe('Hello World 123!@#$%^&*()');
    });
  });
});
