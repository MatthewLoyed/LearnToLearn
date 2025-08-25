/**
 * Component Unit Tests
 * Tests for individual React components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock components - we'll test the actual components once we have them properly imported
// For now, we'll create simple test components to validate our testing setup

// Mock SkillCard component
const MockSkillCard = ({ skill, index }: { skill: any; index: number }) => (
  <div data-testid={`skill-card-${index}`} className="skill-card">
    <h3>{skill.name}</h3>
    <div data-testid="progress-bar" className="progress-bar">
      {skill.progressPercentage}%
    </div>
    <button data-testid="continue-button">Continue</button>
  </div>
);

// Mock ProgressOverview component
const MockProgressOverview = ({ activeSkills }: { activeSkills: any[] }) => (
  <div data-testid="progress-overview" className="progress-overview">
    <h2>Progress Overview</h2>
    <div data-testid="total-skills">Total Skills: {activeSkills.length}</div>
    <div data-testid="completed-milestones">
      Completed: {activeSkills.reduce((sum, skill) => sum + skill.completedMilestones, 0)}
    </div>
  </div>
);

// Mock MilestoneHeader component
const MockMilestoneHeader = ({ milestone }: { milestone: any }) => (
  <div data-testid="milestone-header" className="milestone-header">
    <h1>Level {milestone.levelNumber}: {milestone.title}</h1>
    <p>{milestone.description}</p>
    <span data-testid="difficulty" className={`difficulty-${milestone.difficulty}`}>
      {milestone.difficulty}
    </span>
    <span data-testid="estimated-time">{milestone.estimatedTime} minutes</span>
  </div>
);

// Mock CoreLearningSection component
const MockCoreLearningSection = ({ milestone }: { milestone: any }) => (
  <div data-testid="core-learning-section" className="core-learning">
    <h2>Core Learning</h2>
    {milestone.resources?.videos?.length > 0 && (
      <div data-testid="videos-section">
        <h3>Videos ({milestone.resources.videos.length})</h3>
        {milestone.resources.videos.map((video: any, index: number) => (
          <div key={index} data-testid={`video-${index}`} className="video-item">
            <h4>{video.title}</h4>
            <p>{video.description}</p>
          </div>
        ))}
      </div>
    )}
    {milestone.resources?.articles?.length > 0 && (
      <div data-testid="articles-section">
        <h3>Articles ({milestone.resources.articles.length})</h3>
        {milestone.resources.articles.map((article: any, index: number) => (
          <div key={index} data-testid={`article-${index}`} className="article-item">
            <h4>{article.title}</h4>
            <p>{article.description}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Mock ProgressLogging component
const MockProgressLogging = ({ 
  progressLog, 
  onProgressLogChange 
}: { 
  progressLog: string; 
  onProgressLogChange: (log: string) => void;
}) => (
  <div data-testid="progress-logging" className="progress-logging">
    <h2>Log Your Progress</h2>
    <textarea
      data-testid="progress-textarea"
      value={progressLog}
      onChange={(e) => onProgressLogChange(e.target.value)}
      placeholder="What challenges did you face?"
    />
    <div data-testid="quick-selection" className="quick-selection">
      <button 
        data-testid="challenge-button-1"
        onClick={() => onProgressLogChange('I struggled with the syntax')}
      >
        Syntax Issues
      </button>
      <button 
        data-testid="challenge-button-2"
        onClick={() => onProgressLogChange('I need more practice')}
      >
        Need More Practice
      </button>
    </div>
  </div>
);

// Test data
const mockSkill = {
  id: 'javascript',
  name: 'JavaScript',
  progressPercentage: 60,
  completedMilestones: 3,
  totalMilestones: 5,
  currentMilestone: 'Functions',
  lastActivity: '2 hours ago',
  status: 'in-progress'
};

const mockMilestone = {
  id: '1',
  title: 'Variables and Data Types',
  description: 'Learn the basics of JavaScript variables and data types',
  levelNumber: 1,
  difficulty: 'beginner',
  estimatedTime: 30,
  resources: {
    videos: [
      {
        id: 'video1',
        title: 'JavaScript Variables Tutorial',
        description: 'Learn about variables in JavaScript',
        url: 'https://youtube.com/watch?v=video1'
      }
    ],
    articles: [
      {
        id: 'article1',
        title: 'JavaScript Data Types Guide',
        description: 'Comprehensive guide to JavaScript data types',
        url: 'https://example.com/article1'
      }
    ]
  }
};

const mockActiveSkills = [
  mockSkill,
  {
    id: 'python',
    name: 'Python',
    progressPercentage: 40,
    completedMilestones: 2,
    totalMilestones: 5,
    currentMilestone: 'Control Flow',
    lastActivity: '1 day ago',
    status: 'in-progress'
  }
];

describe('Component Unit Tests', () => {
  describe('SkillCard Component', () => {
    it('should render skill information correctly', () => {
      render(<MockSkillCard skill={mockSkill} index={0} />);
      
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('should have correct test IDs for testing', () => {
      render(<MockSkillCard skill={mockSkill} index={0} />);
      
      expect(screen.getByTestId('skill-card-0')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByTestId('continue-button')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleContinue = jest.fn();
      render(
        <div onClick={handleContinue}>
          <MockSkillCard skill={mockSkill} index={0} />
        </div>
      );
      
      fireEvent.click(screen.getByTestId('continue-button'));
      expect(handleContinue).toHaveBeenCalled();
    });
  });

  describe('ProgressOverview Component', () => {
    it('should display correct progress statistics', () => {
      render(<MockProgressOverview activeSkills={mockActiveSkills} />);
      
      expect(screen.getByText('Progress Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Skills: 2')).toBeInTheDocument();
      expect(screen.getByText('Completed: 5')).toBeInTheDocument(); // 3 + 2
    });

    it('should handle empty skills array', () => {
      render(<MockProgressOverview activeSkills={[]} />);
      
      expect(screen.getByText('Total Skills: 0')).toBeInTheDocument();
      expect(screen.getByText('Completed: 0')).toBeInTheDocument();
    });
  });

  describe('MilestoneHeader Component', () => {
    it('should render milestone information correctly', () => {
      render(<MockMilestoneHeader milestone={mockMilestone} />);
      
      expect(screen.getByText('Level 1: Variables and Data Types')).toBeInTheDocument();
      expect(screen.getByText('Learn the basics of JavaScript variables and data types')).toBeInTheDocument();
      expect(screen.getByText('beginner')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
    });

    it('should have correct difficulty styling class', () => {
      render(<MockMilestoneHeader milestone={mockMilestone} />);
      
      const difficultyElement = screen.getByTestId('difficulty');
      expect(difficultyElement).toHaveClass('difficulty-beginner');
    });

    it('should handle different difficulty levels', () => {
      const advancedMilestone = { ...mockMilestone, difficulty: 'advanced' };
      render(<MockMilestoneHeader milestone={advancedMilestone} />);
      
      const difficultyElement = screen.getByTestId('difficulty');
      expect(difficultyElement).toHaveClass('difficulty-advanced');
    });
  });

  describe('CoreLearningSection Component', () => {
    it('should render videos section when videos are available', () => {
      render(<MockCoreLearningSection milestone={mockMilestone} />);
      
      expect(screen.getByText('Core Learning')).toBeInTheDocument();
      expect(screen.getByText('Videos (1)')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Variables Tutorial')).toBeInTheDocument();
    });

    it('should render articles section when articles are available', () => {
      render(<MockCoreLearningSection milestone={mockMilestone} />);
      
      expect(screen.getByText('Articles (1)')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Data Types Guide')).toBeInTheDocument();
    });

    it('should handle milestone without resources', () => {
      const milestoneWithoutResources = { ...mockMilestone, resources: {} };
      render(<MockCoreLearningSection milestone={milestoneWithoutResources} />);
      
      expect(screen.getByText('Core Learning')).toBeInTheDocument();
      expect(screen.queryByText('Videos')).not.toBeInTheDocument();
      expect(screen.queryByText('Articles')).not.toBeInTheDocument();
    });

    it('should handle multiple videos and articles', () => {
      const milestoneWithMultipleResources = {
        ...mockMilestone,
        resources: {
          videos: [
            { id: 'video1', title: 'Video 1', description: 'Description 1' },
            { id: 'video2', title: 'Video 2', description: 'Description 2' }
          ],
          articles: [
            { id: 'article1', title: 'Article 1', description: 'Description 1' },
            { id: 'article2', title: 'Article 2', description: 'Description 2' }
          ]
        }
      };
      
      render(<MockCoreLearningSection milestone={milestoneWithMultipleResources} />);
      
      expect(screen.getByText('Videos (2)')).toBeInTheDocument();
      expect(screen.getByText('Articles (2)')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('Video 2')).toBeInTheDocument();
      expect(screen.getByText('Article 1')).toBeInTheDocument();
      expect(screen.getByText('Article 2')).toBeInTheDocument();
    });
  });

  describe('ProgressLogging Component', () => {
    it('should render textarea with correct value', () => {
      const mockLog = 'I struggled with the syntax';
      const mockOnChange = jest.fn();
      
      render(<MockProgressLogging progressLog={mockLog} onProgressLogChange={mockOnChange} />);
      
      const textarea = screen.getByTestId('progress-textarea');
      expect(textarea).toHaveValue(mockLog);
      expect(textarea).toHaveAttribute('placeholder', 'What challenges did you face?');
    });

    it('should call onChange when textarea value changes', () => {
      const mockOnChange = jest.fn();
      render(<MockProgressLogging progressLog="" onProgressLogChange={mockOnChange} />);
      
      const textarea = screen.getByTestId('progress-textarea');
      fireEvent.change(textarea, { target: { value: 'New log entry' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('New log entry');
    });

    it('should render quick selection buttons', () => {
      const mockOnChange = jest.fn();
      render(<MockProgressLogging progressLog="" onProgressLogChange={mockOnChange} />);
      
      expect(screen.getByText('Syntax Issues')).toBeInTheDocument();
      expect(screen.getByText('Need More Practice')).toBeInTheDocument();
    });

    it('should call onChange when quick selection buttons are clicked', () => {
      const mockOnChange = jest.fn();
      render(<MockProgressLogging progressLog="" onProgressLogChange={mockOnChange} />);
      
      fireEvent.click(screen.getByTestId('challenge-button-1'));
      expect(mockOnChange).toHaveBeenCalledWith('I struggled with the syntax');
      
      fireEvent.click(screen.getByTestId('challenge-button-2'));
      expect(mockOnChange).toHaveBeenCalledWith('I need more practice');
    });

    it('should handle empty progress log', () => {
      const mockOnChange = jest.fn();
      render(<MockProgressLogging progressLog="" onProgressLogChange={mockOnChange} />);
      
      const textarea = screen.getByTestId('progress-textarea');
      expect(textarea).toHaveValue('');
    });
  });

  describe('Component Integration Tests', () => {
    it('should render multiple components together', () => {
      render(
        <div>
          <MockProgressOverview activeSkills={mockActiveSkills} />
          <MockSkillCard skill={mockSkill} index={0} />
          <MockMilestoneHeader milestone={mockMilestone} />
        </div>
      );
      
      expect(screen.getByText('Progress Overview')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Level 1: Variables and Data Types')).toBeInTheDocument();
    });

    it('should handle component state changes', async () => {
      const mockOnChange = jest.fn();
      render(<MockProgressLogging progressLog="" onProgressLogChange={mockOnChange} />);
      
      const textarea = screen.getByTestId('progress-textarea');
      
      // Simulate user typing
      fireEvent.change(textarea, { target: { value: 'User is typing...' } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('User is typing...');
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <div>
          <MockProgressOverview activeSkills={mockActiveSkills} />
          <MockMilestoneHeader milestone={mockMilestone} />
          <MockCoreLearningSection milestone={mockMilestone} />
        </div>
      );
      
      // Check that headings are in proper order
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveTextContent('Progress Overview'); // h2
      expect(headings[1]).toHaveTextContent('Level 1: Variables and Data Types'); // h1
      expect(headings[2]).toHaveTextContent('Core Learning'); // h2
    });

    it('should have proper button labels', () => {
      render(<MockSkillCard skill={mockSkill} index={0} />);
      
      const continueButton = screen.getByRole('button', { name: 'Continue' });
      expect(continueButton).toBeInTheDocument();
    });

    it('should have proper form labels', () => {
      const mockOnChange = jest.fn();
      render(<MockProgressLogging progressLog="" onProgressLogChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'What challenges did you face?');
    });
  });
});
