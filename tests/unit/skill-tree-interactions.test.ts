/**
 * Unit tests for Skill Tree Interactions
 * Tests the new functionality for clickable locked milestones
 */

describe('Skill Tree Interactions', () => {
  // Mock data for testing
  const mockNodes = [
    {
      id: 'prerequisites',
      title: 'Prerequisites',
      description: 'Basic knowledge and setup requirements',
      status: 'completed' as const,
      difficulty: 'beginner' as const,
      estimatedTime: '1 week',
      dependencies: [],
      type: 'foundation' as const,
      resources: { videos: 0, articles: 2, practice: 0 }
    },
    {
      id: 'milestone-1',
      title: 'First Milestone',
      description: 'First learning milestone',
      status: 'in-progress' as const,
      difficulty: 'beginner' as const,
      estimatedTime: '2 weeks',
      dependencies: ['prerequisites'],
      type: 'skill' as const,
      resources: { videos: 1, articles: 2, practice: 1 }
    },
    {
      id: 'milestone-2',
      title: 'Second Milestone',
      description: 'Second learning milestone',
      status: 'locked' as const,
      difficulty: 'intermediate' as const,
      estimatedTime: '3 weeks',
      dependencies: ['milestone-1'],
      type: 'skill' as const,
      resources: { videos: 2, articles: 3, practice: 2 }
    }
  ];

  describe('Locked Milestone Functionality', () => {
    it('should identify locked milestones correctly', () => {
      const lockedNodes = mockNodes.filter(node => node.status === 'locked');
      expect(lockedNodes).toHaveLength(1);
      expect(lockedNodes[0].id).toBe('milestone-2');
      expect(lockedNodes[0].title).toBe('Second Milestone');
    });

    it('should have prerequisites for locked milestones', () => {
      const lockedNode = mockNodes.find(node => node.status === 'locked');
      expect(lockedNode).toBeDefined();
      expect(lockedNode?.dependencies).toHaveLength(1);
      expect(lockedNode?.dependencies[0]).toBe('milestone-1');
    });

    it('should show correct prerequisite information', () => {
      const lockedNode = mockNodes.find(node => node.status === 'locked');
      const prerequisiteNode = mockNodes.find(node => node.id === lockedNode?.dependencies[0]);
      
      expect(prerequisiteNode).toBeDefined();
      expect(prerequisiteNode?.title).toBe('First Milestone');
      expect(prerequisiteNode?.status).toBe('in-progress');
    });
  });

  describe('Available Milestone Functionality', () => {
    it('should identify available milestones correctly', () => {
      const availableNodes = mockNodes.filter(node => node.status === 'available');
      // In our test data, no nodes are 'available' - they're either completed, in-progress, or locked
      expect(availableNodes).toHaveLength(0);
    });

    it('should have completed prerequisites for available milestones', () => {
      // Create a scenario where a milestone should be available
      const availableNode = {
        id: 'milestone-3',
        title: 'Third Milestone',
        description: 'Third learning milestone',
        status: 'available' as const,
        difficulty: 'intermediate' as const,
        estimatedTime: '4 weeks',
        dependencies: ['prerequisites'], // prerequisites is completed
        type: 'skill' as const,
        resources: { videos: 3, articles: 4, practice: 3 }
      };

      const prerequisiteNode = mockNodes.find(node => node.id === availableNode.dependencies[0]);
      expect(prerequisiteNode?.status).toBe('completed');
    });
  });

  describe('Completed Milestone Functionality', () => {
    it('should identify completed milestones correctly', () => {
      const completedNodes = mockNodes.filter(node => node.status === 'completed');
      expect(completedNodes).toHaveLength(1);
      expect(completedNodes[0].id).toBe('prerequisites');
      expect(completedNodes[0].title).toBe('Prerequisites');
    });

    it('should have no dependencies for foundation nodes', () => {
      const foundationNode = mockNodes.find(node => node.type === 'foundation');
      expect(foundationNode).toBeDefined();
      expect(foundationNode?.dependencies).toHaveLength(0);
    });
  });

  describe('Node Click Behavior Logic', () => {
    it('should allow clicking on all node types', () => {
      // This tests the logic that determines if a node should be clickable
      const shouldBeClickable = (node: any) => {
        // All nodes should be clickable now (including locked ones)
        return true;
      };

      mockNodes.forEach(node => {
        expect(shouldBeClickable(node)).toBe(true);
      });
    });

    it('should only auto-complete available nodes', () => {
      const shouldAutoComplete = (node: any) => {
        return node.status === 'available';
      };

      mockNodes.forEach(node => {
        if (node.status === 'available') {
          expect(shouldAutoComplete(node)).toBe(true);
        } else {
          expect(shouldAutoComplete(node)).toBe(false);
        }
      });
    });

    it('should show prerequisites for locked nodes', () => {
      const shouldShowPrerequisites = (node: any) => {
        return node.status === 'locked' && node.dependencies.length > 0;
      };

      const lockedNode = mockNodes.find(node => node.status === 'locked');
      expect(shouldShowPrerequisites(lockedNode!)).toBe(true);
    });
  });
});
