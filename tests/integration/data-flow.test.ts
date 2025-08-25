/**
 * Data Flow Integration Tests
 * Tests for data flow between components and services
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
  {
    id: '1',
    title: 'Variables and Data Types',
    description: 'Learn the basics of JavaScript variables',
    levelNumber: 1,
    difficulty: 'beginner',
    estimatedTime: 30,
    completed: true,
    completedAt: '2025-01-01T10:00:00Z',
    timeSpent: 45
  },
  {
    id: '2',
    title: 'Control Flow',
    description: 'Learn if/else statements and loops',
    levelNumber: 2,
    difficulty: 'beginner',
    estimatedTime: 45,
    completed: true,
    completedAt: '2025-01-02T10:00:00Z',
    timeSpent: 60
  },
  {
    id: '3',
    title: 'Functions',
    description: 'Learn to create and use functions',
    levelNumber: 3,
    difficulty: 'intermediate',
    estimatedTime: 60,
    completed: false,
    timeSpent: 0
  },
  {
    id: '4',
    title: 'Objects and Arrays',
    description: 'Work with complex data structures',
    levelNumber: 4,
    difficulty: 'intermediate',
    estimatedTime: 75,
    completed: false,
    timeSpent: 0
  }
];

const mockSkillData = {
  id: 'javascript',
  name: 'JavaScript',
  milestones: mockMilestones,
  createdAt: '2025-01-01T09:00:00Z',
  lastActivity: '2025-01-02T10:00:00Z'
};

describe('Data Flow Integration Tests', () => {
  describe('Progress Calculation Flow', () => {
    it('should calculate progress correctly through the entire flow', () => {
      // Step 1: Calculate progress percentage
      const progressPercentage = calculateProgressPercentage(mockMilestones);
      expect(progressPercentage).toBe(50); // 2 completed out of 4 total

      // Step 2: Generate skill summary
      const skillSummary = generateSkillSummary(mockSkillData);
      expect(skillSummary.progressPercentage).toBe(50);
      expect(skillSummary.completedMilestones).toBe(2);
      expect(skillSummary.totalMilestones).toBe(4);
      expect(skillSummary.currentMilestone).toBe('Functions');
      expect(skillSummary.status).toBe('in-progress');
    });

    it('should handle completed skill flow', () => {
      const completedMilestones = mockMilestones.map(m => ({ ...m, completed: true }));
      const completedSkillData = { ...mockSkillData, milestones: completedMilestones };
      
      const progressPercentage = calculateProgressPercentage(completedMilestones);
      expect(progressPercentage).toBe(100);

      const skillSummary = generateSkillSummary(completedSkillData);
      expect(skillSummary.progressPercentage).toBe(100);
      expect(skillSummary.status).toBe('completed');
      expect(skillSummary.currentMilestone).toBe('No milestones');
    });

    it('should handle empty skill flow', () => {
      const emptySkillData = { ...mockSkillData, milestones: [] };
      
      const progressPercentage = calculateProgressPercentage([]);
      expect(progressPercentage).toBe(0);

      const skillSummary = generateSkillSummary(emptySkillData);
      expect(skillSummary.progressPercentage).toBe(0);
      expect(skillSummary.status).toBe('not-started');
      expect(skillSummary.currentMilestone).toBe('No milestones');
    });
  });

  describe('Time Calculation Flow', () => {
    it('should format time spent correctly through the flow', () => {
      // Calculate total time spent
      const totalTimeSpent = mockMilestones
        .filter(m => m.completed)
        .reduce((sum, m) => sum + (m.timeSpent || 0), 0);
      expect(totalTimeSpent).toBe(105); // 45 + 60

      // Format the time
      const formattedTime = formatTimeSpent(totalTimeSpent);
      expect(formattedTime).toBe('1 hour 45 minutes');
    });

    it('should handle time formatting edge cases', () => {
      expect(formatTimeSpent(0)).toBe('0 minutes');
      expect(formatTimeSpent(30)).toBe('30 minutes');
      expect(formatTimeSpent(60)).toBe('1 hours');
      expect(formatTimeSpent(90)).toBe('1 hour 30 minutes');
    });

    it('should calculate time since last activity correctly', () => {
      // Mock current time
      const originalDate = global.Date;
      const mockDate = new Date('2025-01-03T10:00:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;

      const timeSince = getTimeSinceLastActivity('2025-01-02T10:00:00Z');
      expect(timeSince).toBe('1 days ago');

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('Data Validation Flow', () => {
    it('should validate milestone data through the flow', () => {
      const validMilestone = {
        id: '1',
        title: 'Test Milestone',
        description: 'Test description',
        levelNumber: 1,
        difficulty: 'beginner',
        estimatedTime: 30
      };

      const validation = validateMilestoneData(validMilestone);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect validation errors through the flow', () => {
      const invalidMilestone = {
        id: '1',
        title: '', // Missing title
        description: 'Test description',
        levelNumber: undefined, // Missing level number
        difficulty: 'invalid-difficulty',
        estimatedTime: -5
      };

      const validation = validateMilestoneData(invalidMilestone);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title is required');
      expect(validation.errors).toContain('Level number is required');
      expect(validation.errors).toContain('Difficulty must be beginner, intermediate, or advanced');
      expect(validation.errors).toContain('Estimated time must be positive');
    });

    it('should sanitize user input through the flow', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World  ';
      const sanitized = sanitizeUserInput(maliciousInput);
      expect(sanitized).toBe('Hello World');

      const normalInput = 'Normal user input';
      const sanitizedNormal = sanitizeUserInput(normalInput);
      expect(sanitizedNormal).toBe('Normal user input');
    });
  });

  describe('Skill Summary Generation Flow', () => {
    it('should generate complete skill summary with all data', () => {
      const summary = generateSkillSummary(mockSkillData);
      
      // Verify all required fields are present
      expect(summary).toHaveProperty('id', 'javascript');
      expect(summary).toHaveProperty('name', 'JavaScript');
      expect(summary).toHaveProperty('progressPercentage', 50);
      expect(summary).toHaveProperty('completedMilestones', 2);
      expect(summary).toHaveProperty('totalMilestones', 4);
      expect(summary).toHaveProperty('currentMilestone', 'Functions');
      expect(summary).toHaveProperty('lastActivity', '1 days ago');
      expect(summary).toHaveProperty('timeSpent', '0 minutes');
      expect(summary).toHaveProperty('status', 'in-progress');
    });

    it('should handle skill with no last activity', () => {
      const skillWithoutActivity = { ...mockSkillData, lastActivity: undefined };
      const summary = generateSkillSummary(skillWithoutActivity);
      expect(summary.lastActivity).toBe('Unknown');
    });

    it('should handle skill with invalid last activity', () => {
      const skillWithInvalidActivity = { ...mockSkillData, lastActivity: 'invalid-date' };
      const summary = generateSkillSummary(skillWithInvalidActivity);
      expect(summary.lastActivity).toBe('Unknown');
    });
  });

  describe('Multi-Skill Data Flow', () => {
    it('should handle multiple skills in the system', () => {
      const pythonSkillData = {
        id: 'python',
        name: 'Python',
        milestones: [
          { id: '1', title: 'Python Basics', completed: true, completedAt: '2025-01-01T10:00:00Z' },
          { id: '2', title: 'Python Functions', completed: false }
        ],
        createdAt: '2025-01-01T09:00:00Z',
        lastActivity: '2025-01-01T10:00:00Z'
      };

      const javascriptSummary = generateSkillSummary(mockSkillData);
      const pythonSummary = generateSkillSummary(pythonSkillData);

      expect(javascriptSummary.id).toBe('javascript');
      expect(javascriptSummary.progressPercentage).toBe(50);
      expect(pythonSummary.id).toBe('python');
      expect(pythonSummary.progressPercentage).toBe(50);
    });

    it('should calculate overall progress across multiple skills', () => {
      const skills = [
        { ...mockSkillData, milestones: mockMilestones }, // 50% progress
        {
          id: 'python',
          name: 'Python',
          milestones: [
            { id: '1', title: 'Python Basics', completed: true },
            { id: '2', title: 'Python Functions', completed: true },
            { id: '3', title: 'Python OOP', completed: false }
          ],
          createdAt: '2025-01-01T09:00:00Z',
          lastActivity: '2025-01-01T10:00:00Z'
        } // 67% progress
      ];

      const summaries = skills.map(generateSkillSummary);
      const overallProgress = summaries.reduce((sum, skill) => sum + skill.progressPercentage, 0) / summaries.length;
      
      expect(overallProgress).toBe(58.5); // (50 + 67) / 2
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle missing milestone data gracefully', () => {
      const incompleteMilestones = [
        { id: '1', title: 'Test', completed: true },
        { id: '2', title: 'Test 2' } // Missing completed property
      ];

      const progressPercentage = calculateProgressPercentage(incompleteMilestones);
      expect(progressPercentage).toBe(50); // Only one is explicitly completed
    });

    it('should handle null/undefined values in skill data', () => {
      const skillWithNulls = {
        id: 'test',
        name: 'Test Skill',
        milestones: null,
        createdAt: null,
        lastActivity: null
      };

      const summary = generateSkillSummary(skillWithNulls);
      expect(summary.progressPercentage).toBe(0);
      expect(summary.totalMilestones).toBe(0);
      expect(summary.lastActivity).toBe('Unknown');
    });

    it('should handle invalid milestone data in validation', () => {
      const invalidMilestone = {
        title: null,
        levelNumber: 'not-a-number',
        difficulty: 'super-hard',
        estimatedTime: 'not-a-number'
      };

      const validation = validateMilestoneData(invalidMilestone);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Flow', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeMilestones = Array.from({ length: 1000 }, (_, i) => ({
        id: `milestone-${i}`,
        title: `Milestone ${i}`,
        completed: i < 500, // 50% completion
        completedAt: i < 500 ? '2025-01-01T10:00:00Z' : undefined
      }));

      const startTime = performance.now();
      const progressPercentage = calculateProgressPercentage(largeMilestones);
      const endTime = performance.now();

      expect(progressPercentage).toBe(50);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle multiple skill summaries efficiently', () => {
      const skills = Array.from({ length: 100 }, (_, i) => ({
        id: `skill-${i}`,
        name: `Skill ${i}`,
        milestones: Array.from({ length: 10 }, (_, j) => ({
          id: `milestone-${i}-${j}`,
          title: `Milestone ${j}`,
          completed: j < 5, // 50% completion
          completedAt: j < 5 ? '2025-01-01T10:00:00Z' : undefined
        })),
        createdAt: '2025-01-01T09:00:00Z',
        lastActivity: '2025-01-01T10:00:00Z'
      }));

      const startTime = performance.now();
      const summaries = skills.map(generateSkillSummary);
      const endTime = performance.now();

      expect(summaries).toHaveLength(100);
      expect(summaries[0].progressPercentage).toBe(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});
