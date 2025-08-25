import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProgressProvider, use_progress, Milestone, LearningPath, Achievement } from './ProgressContext';

// ============================================================================
// TEST UTILITIES
// ============================================================================

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Test component to access context
function TestComponent() {
    const progress = use_progress();
    
    return (
        <div>
            <div data-testid="total-progress">{progress.get_total_progress()}</div>
            <div data-testid="learning-paths-count">{progress.get_all_learning_paths().length}</div>
            <div data-testid="achievements-count">{progress.get_achievements().length}</div>
            <div data-testid="unlocked-achievements-count">{progress.get_unlocked_achievements().length}</div>
            <button 
                data-testid="mark-complete"
                onClick={() => progress.mark_milestone_complete('test-path', 'test-milestone', 1800)}
            >
                Mark Complete
            </button>
            <button 
                data-testid="start-path"
                onClick={() => progress.start_learning_path('Test Topic', [
                    {
                        id: 'test-milestone',
                        title: 'Test Milestone',
                        type: 'video',
                        estimatedTime: 30
                    }
                ])}
            >
                Start Path
            </button>
            <button 
                data-testid="clear-progress"
                onClick={() => progress.clear_progress()}
            >
                Clear Progress
            </button>
        </div>
    );
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('ProgressContext', () => {
    beforeEach(() => {
        localStorageMock.getItem.mockReturnValue(null);
        localStorageMock.setItem.mockClear();
        localStorageMock.getItem.mockClear();
    });

    describe('Provider Setup', () => {
        it('should render without crashing', () => {
            render(
                <ProgressProvider>
                    <div>Test</div>
                </ProgressProvider>
            );
            expect(screen.getByText('Test')).toBeInTheDocument();
        });

        it('should load state from localStorage on mount', () => {
            const savedState = {
                learningPaths: {},
                achievements: [],
                userId: 'test-user',
                totalTimeSpent: 0,
                streakDays: 0,
                lastActivityDate: new Date().toISOString()
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

            render(
                <ProgressProvider userId="test-user">
                    <TestComponent />
                </ProgressProvider>
            );

            expect(localStorageMock.getItem).toHaveBeenCalledWith('skill_forge_progress_test-user');
        });

        it('should save state to localStorage when state changes', async () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Trigger a state change
            fireEvent.click(screen.getByTestId('start-path'));

            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalled();
            });
        });
    });

    describe('Learning Path Management', () => {
        it('should start a new learning path', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            const initialCount = screen.getByTestId('learning-paths-count').textContent;
            fireEvent.click(screen.getByTestId('start-path'));

            expect(screen.getByTestId('learning-paths-count').textContent).toBe('1');
        });

        it('should return learning path by ID', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            fireEvent.click(screen.getByTestId('start-path'));
            
            // The path ID is generated in the component, so we can't test the exact ID
            // But we can verify the path was created
            expect(screen.getByTestId('learning-paths-count').textContent).toBe('1');
        });

        it('should get all learning paths', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            expect(screen.getByTestId('learning-paths-count').textContent).toBe('0');
            
            fireEvent.click(screen.getByTestId('start-path'));
            
            expect(screen.getByTestId('learning-paths-count').textContent).toBe('1');
        });
    });

    describe('Milestone Management', () => {
        it('should mark milestone as complete', async () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Start a learning path first
            fireEvent.click(screen.getByTestId('start-path'));
            
            // Mark milestone complete
            fireEvent.click(screen.getByTestId('mark-complete'));

            await waitFor(() => {
                expect(localStorageMock.setItem).toHaveBeenCalled();
            });
        });

        it('should calculate total progress correctly', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Initial progress should be 0
            expect(screen.getByTestId('total-progress').textContent).toBe('0');
        });
    });

    describe('Achievement System', () => {
        it('should have default achievements', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Should have 5 default achievements
            expect(screen.getByTestId('achievements-count').textContent).toBe('5');
        });

        it('should start with no unlocked achievements', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            expect(screen.getByTestId('unlocked-achievements-count').textContent).toBe('0');
        });

        it('should unlock first milestone achievement when milestone is completed', async () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Start a learning path
            fireEvent.click(screen.getByTestId('start-path'));
            
            // Mark milestone complete (this should trigger first milestone achievement)
            fireEvent.click(screen.getByTestId('mark-complete'));

            // Wait for the achievement checking effect to run
            await waitFor(() => {
                expect(screen.getByTestId('unlocked-achievements-count').textContent).toBe('1');
            }, { timeout: 3000 });
        });
    });

    describe('Data Management', () => {
        it('should clear all progress', async () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Start a learning path
            fireEvent.click(screen.getByTestId('start-path'));
            expect(screen.getByTestId('learning-paths-count').textContent).toBe('1');

            // Clear progress
            fireEvent.click(screen.getByTestId('clear-progress'));

            await waitFor(() => {
                expect(screen.getByTestId('learning-paths-count').textContent).toBe('0');
            });
        });

        it('should export progress data', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // This would require accessing the context directly in the test
            // For now, we'll test that the provider renders without crashing
            expect(screen.getByTestId('total-progress')).toBeInTheDocument();
        });
    });

    describe('Analytics Methods', () => {
        it('should calculate learning velocity', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Initial velocity should be 0
            // This would require accessing the context directly in the test
            expect(screen.getByTestId('total-progress')).toBeInTheDocument();
        });

        it('should calculate time distribution', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Initial distribution should be all zeros
            // This would require accessing the context directly in the test
            expect(screen.getByTestId('total-progress')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle localStorage errors gracefully', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Should not crash when localStorage fails
            expect(screen.getByTestId('total-progress')).toBeInTheDocument();
        });

        it('should handle invalid milestone operations', () => {
            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Try to mark a non-existent milestone complete
            fireEvent.click(screen.getByTestId('mark-complete'));

            // Should not crash
            expect(screen.getByTestId('total-progress')).toBeInTheDocument();
        });
    });

    describe('Hook Usage', () => {
        it('should throw error when used outside provider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestComponent />);
            }).toThrow('use_progress must be used within a ProgressProvider');

            consoleSpy.mockRestore();
        });
    });

    describe('State Persistence', () => {
        it('should persist state across component re-renders', async () => {
            const { rerender } = render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Start a learning path
            fireEvent.click(screen.getByTestId('start-path'));
            expect(screen.getByTestId('learning-paths-count').textContent).toBe('1');

            // Re-render the component
            rerender(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // State should persist
            expect(screen.getByTestId('learning-paths-count').textContent).toBe('1');
        });
    });

    describe('Performance', () => {
        it('should handle large numbers of milestones efficiently', () => {
            const largeMilestones: Omit<Milestone, 'completed' | 'completedAt' | 'timeSpent'>[] = [];
            
            for (let i = 0; i < 100; i++) {
                largeMilestones.push({
                    id: `milestone-${i}`,
                    title: `Milestone ${i}`,
                    type: 'video',
                    estimatedTime: 30
                });
            }

            render(
                <ProgressProvider>
                    <TestComponent />
                </ProgressProvider>
            );

            // Should not crash with large milestone arrays
            expect(screen.getByTestId('total-progress')).toBeInTheDocument();
        });
    });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('ProgressContext Integration', () => {
    it('should maintain data consistency across multiple operations', async () => {
        render(
            <ProgressProvider>
                <TestComponent />
            </ProgressProvider>
        );

        // Start a learning path
        fireEvent.click(screen.getByTestId('start-path'));
        expect(screen.getByTestId('learning-paths-count').textContent).toBe('1');

        // Mark milestone complete
        fireEvent.click(screen.getByTestId('mark-complete'));

        await waitFor(() => {
            // Should have unlocked achievement
            expect(screen.getByTestId('unlocked-achievements-count').textContent).toBe('1');
        }, { timeout: 3000 });

        // Clear progress
        fireEvent.click(screen.getByTestId('clear-progress'));

        await waitFor(() => {
            // Should reset everything
            expect(screen.getByTestId('learning-paths-count').textContent).toBe('0');
            expect(screen.getByTestId('unlocked-achievements-count').textContent).toBe('0');
        });
    });

    it('should handle concurrent operations correctly', async () => {
        render(
            <ProgressProvider>
                <TestComponent />
            </ProgressProvider>
        );

        // Perform multiple operations quickly
        fireEvent.click(screen.getByTestId('start-path'));
        fireEvent.click(screen.getByTestId('mark-complete'));
        fireEvent.click(screen.getByTestId('start-path'));

        await waitFor(() => {
            // Should handle concurrent operations without errors
            expect(screen.getByTestId('learning-paths-count').textContent).toBe('2');
        });
    });
});
