/**
 * Performance Tests
 * Tests for performance optimization and benchmarking
 */

import { 
  calculateProgressPercentage, 
  generateSkillSummary,
  validateMilestoneData,
  sanitizeUserInput
} from '@/lib/utils/progress-utils';

// Performance test utilities
const measurePerformance = (fn: () => any, iterations: number = 1000) => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  return {
    executionTime: endTime - startTime,
    averageTime: (endTime - startTime) / iterations,
    memoryUsage: endMemory - startMemory,
    iterations
  };
};

// Generate test data
const generateLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: `milestone-${i}`,
    title: `Milestone ${i}`,
    description: `Description for milestone ${i}`,
    levelNumber: Math.floor(i / 10) + 1,
    difficulty: ['beginner', 'intermediate', 'advanced'][i % 3],
    estimatedTime: 30 + (i % 60),
    completed: i % 2 === 0,
    completedAt: i % 2 === 0 ? '2025-01-01T10:00:00Z' : undefined,
    timeSpent: i % 2 === 0 ? 30 + (i % 60) : 0
  }));
};

const generateSkillData = (milestoneCount: number) => ({
  id: 'test-skill',
  name: 'Test Skill',
  milestones: generateLargeDataset(milestoneCount),
  createdAt: '2025-01-01T09:00:00Z',
  lastActivity: '2025-01-02T10:00:00Z'
});

describe('Performance Tests', () => {
  describe('Progress Calculation Performance', () => {
    it('should calculate progress efficiently for small datasets', () => {
      const smallDataset = generateLargeDataset(10);
      
      const result = measurePerformance(() => {
        calculateProgressPercentage(smallDataset);
      }, 10000);
      
      expect(result.averageTime).toBeLessThan(0.1); // Should be very fast
      expect(result.executionTime).toBeLessThan(1000); // Total time under 1 second
    });

    it('should calculate progress efficiently for medium datasets', () => {
      const mediumDataset = generateLargeDataset(100);
      
      const result = measurePerformance(() => {
        calculateProgressPercentage(mediumDataset);
      }, 1000);
      
      expect(result.averageTime).toBeLessThan(1); // Should be under 1ms per calculation
      expect(result.executionTime).toBeLessThan(1000); // Total time under 1 second
    });

    it('should calculate progress efficiently for large datasets', () => {
      const largeDataset = generateLargeDataset(1000);
      
      const result = measurePerformance(() => {
        calculateProgressPercentage(largeDataset);
      }, 100);
      
      expect(result.averageTime).toBeLessThan(10); // Should be under 10ms per calculation
      expect(result.executionTime).toBeLessThan(1000); // Total time under 1 second
    });

    it('should handle very large datasets without memory issues', () => {
      const veryLargeDataset = generateLargeDataset(10000);
      
      const result = measurePerformance(() => {
        calculateProgressPercentage(veryLargeDataset);
      }, 10);
      
      expect(result.averageTime).toBeLessThan(100); // Should be under 100ms per calculation
      expect(result.memoryUsage).toBeLessThan(50 * 1024 * 1024); // Should use less than 50MB
    });
  });

  describe('Skill Summary Generation Performance', () => {
    it('should generate skill summaries efficiently', () => {
      const skillData = generateSkillData(100);
      
      const result = measurePerformance(() => {
        generateSkillSummary(skillData);
      }, 1000);
      
      expect(result.averageTime).toBeLessThan(5); // Should be under 5ms per generation
      expect(result.executionTime).toBeLessThan(5000); // Total time under 5 seconds
    });

    it('should handle multiple skill summaries efficiently', () => {
      const skills = Array.from({ length: 10 }, (_, i) => generateSkillData(50));
      
      const result = measurePerformance(() => {
        skills.forEach(skill => generateSkillSummary(skill));
      }, 100);
      
      expect(result.averageTime).toBeLessThan(50); // Should be under 50ms for 10 skills
      expect(result.executionTime).toBeLessThan(5000); // Total time under 5 seconds
    });

    it('should handle empty skill data efficiently', () => {
      const emptySkillData = {
        id: 'empty-skill',
        name: 'Empty Skill',
        milestones: [],
        createdAt: '2025-01-01T09:00:00Z',
        lastActivity: '2025-01-02T10:00:00Z'
      };
      
      const result = measurePerformance(() => {
        generateSkillSummary(emptySkillData);
      }, 10000);
      
      expect(result.averageTime).toBeLessThan(0.1); // Should be very fast for empty data
    });
  });

  describe('Data Validation Performance', () => {
    it('should validate milestone data efficiently', () => {
      const validMilestone = {
        id: '1',
        title: 'Test Milestone',
        description: 'Test description',
        levelNumber: 1,
        difficulty: 'beginner',
        estimatedTime: 30
      };
      
      const result = measurePerformance(() => {
        validateMilestoneData(validMilestone);
      }, 10000);
      
      expect(result.averageTime).toBeLessThan(0.1); // Should be very fast
    });

    it('should handle invalid milestone data efficiently', () => {
      const invalidMilestone = {
        id: '1',
        title: '',
        description: 'Test description',
        levelNumber: undefined,
        difficulty: 'invalid-difficulty',
        estimatedTime: -5
      };
      
      const result = measurePerformance(() => {
        validateMilestoneData(invalidMilestone);
      }, 10000);
      
      expect(result.averageTime).toBeLessThan(0.1); // Should be very fast even with errors
    });
  });

  describe('Input Sanitization Performance', () => {
    it('should sanitize normal input efficiently', () => {
      const normalInput = 'Normal user input with some text';
      
      const result = measurePerformance(() => {
        sanitizeUserInput(normalInput);
      }, 10000);
      
      expect(result.averageTime).toBeLessThan(0.1); // Should be very fast
    });

    it('should sanitize malicious input efficiently', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World<script>alert("more xss")</script>';
      
      const result = measurePerformance(() => {
        sanitizeUserInput(maliciousInput);
      }, 10000);
      
      expect(result.averageTime).toBeLessThan(0.1); // Should be very fast
    });

    it('should handle large input efficiently', () => {
      const largeInput = 'A'.repeat(10000) + '<script>alert("xss")</script>' + 'B'.repeat(10000);
      
      const result = measurePerformance(() => {
        sanitizeUserInput(largeInput);
      }, 100);
      
      expect(result.averageTime).toBeLessThan(10); // Should be under 10ms for large input
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory during repeated operations', () => {
      const skillData = generateSkillData(100);
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        generateSkillSummary(skillData);
        calculateProgressPercentage(skillData.milestones);
        validateMilestoneData(skillData.milestones[0]);
        sanitizeUserInput('test input');
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle garbage collection properly', () => {
      const skillData = generateSkillData(1000);
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Create and discard many objects
      for (let i = 0; i < 100; i++) {
        const tempSkillData = generateSkillData(100);
        generateSkillSummary(tempSkillData);
      }
      
      // Force garbage collection again
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory should be cleaned up properly
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB increase
    });
  });

  describe('Concurrent Operation Performance', () => {
    it('should handle concurrent progress calculations', async () => {
      const skillData = generateSkillData(100);
      const promises = Array.from({ length: 10 }, () => 
        new Promise<number>((resolve) => {
          const startTime = performance.now();
          generateSkillSummary(skillData);
          const endTime = performance.now();
          resolve(endTime - startTime);
        })
      );
      
      const results = await Promise.all(promises);
      const averageTime = results.reduce((sum, time) => sum + time, 0) / results.length;
      
      expect(averageTime).toBeLessThan(10); // Should be under 10ms per operation
    });

    it('should handle concurrent data validation', async () => {
      const milestones = generateLargeDataset(100);
      const promises = Array.from({ length: 20 }, () => 
        new Promise<number>((resolve) => {
          const startTime = performance.now();
          milestones.forEach(milestone => validateMilestoneData(milestone));
          const endTime = performance.now();
          resolve(endTime - startTime);
        })
      );
      
      const results = await Promise.all(promises);
      const averageTime = results.reduce((sum, time) => sum + time, 0) / results.length;
      
      expect(averageTime).toBeLessThan(50); // Should be under 50ms for 100 validations
    });
  });

  describe('Scalability Tests', () => {
    it('should scale linearly with dataset size', () => {
      const sizes = [10, 100, 1000];
      const results = sizes.map(size => {
        const dataset = generateLargeDataset(size);
        const result = measurePerformance(() => {
          calculateProgressPercentage(dataset);
        }, 100);
        return { size, averageTime: result.averageTime };
      });
      
      // Check that performance scales reasonably (not exponentially)
      const timeRatio1 = results[1].averageTime / results[0].averageTime;
      const timeRatio2 = results[2].averageTime / results[1].averageTime;
      
      expect(timeRatio1).toBeLessThan(20); // Should not be more than 20x slower for 10x data
      expect(timeRatio2).toBeLessThan(20); // Should not be more than 20x slower for 10x data
    });

    it('should handle exponential growth gracefully', () => {
      const sizes = [1, 10, 100, 1000, 10000];
      const results = sizes.map(size => {
        const dataset = generateLargeDataset(size);
        const startTime = performance.now();
        calculateProgressPercentage(dataset);
        const endTime = performance.now();
        return { size, time: endTime - startTime };
      });
      
      // Check that no single operation takes too long
      results.forEach(result => {
        expect(result.time).toBeLessThan(1000); // No operation should take more than 1 second
      });
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should handle typical user session efficiently', () => {
      const skillData = generateSkillData(50); // Typical skill size
      
      // Simulate a typical user session with multiple operations
      const sessionOperations = [
        () => generateSkillSummary(skillData), // View dashboard
        () => calculateProgressPercentage(skillData.milestones), // Check progress
        () => validateMilestoneData(skillData.milestones[0]), // Validate current milestone
        () => sanitizeUserInput('User progress note'), // Log progress
        () => generateSkillSummary(skillData), // Refresh dashboard
      ];
      
      const result = measurePerformance(() => {
        sessionOperations.forEach(op => op());
      }, 1000); // 1000 typical sessions
      
      expect(result.averageTime).toBeLessThan(10); // Should be under 10ms per session
      expect(result.executionTime).toBeLessThan(10000); // Total time under 10 seconds
    });

    it('should handle admin operations efficiently', () => {
      const largeSkillData = generateSkillData(500); // Large skill for admin view
      
      // Simulate admin operations
      const adminOperations = [
        () => generateSkillSummary(largeSkillData), // View skill details
        () => largeSkillData.milestones.map(m => validateMilestoneData(m)), // Validate all milestones
        () => largeSkillData.milestones.map(m => sanitizeUserInput(m.title)), // Sanitize all titles
        () => calculateProgressPercentage(largeSkillData.milestones), // Calculate overall progress
      ];
      
      const result = measurePerformance(() => {
        adminOperations.forEach(op => op());
      }, 100); // 100 admin operations
      
      expect(result.averageTime).toBeLessThan(100); // Should be under 100ms per admin operation
      expect(result.executionTime).toBeLessThan(10000); // Total time under 10 seconds
    });
  });
});
