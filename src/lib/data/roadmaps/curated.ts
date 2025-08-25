/**
 * Curated Learning Roadmaps
 * 
 * Pre-built roadmaps for common topics to provide immediate value
 * without requiring AI generation.
 * 
 * @author Skill Forge Team
 * @version 1.0.0
 */

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources: Resource[];
  // Add skill deconstruction fields to match AI-generated structure
  doThisNow?: {
    prompt: string;
    reps?: number;
    sets?: number;
    activityType: string;
  };
}

export interface Resource {
  type: 'video' | 'article' | 'tutorial' | 'practice' | 'visual';
  title: string;
  url: string;
  description: string;
  duration?: string;
  searchTerms?: string[];
  source?: string;
  qualityScore?: number;
  thumbnail?: string;
  readingTime?: string;
}

export interface RoadmapData {
  topic: string;
  queryType?: 'career-focused' | 'project-based' | 'academic-theory' | 'skill-enhancement' | 'hobby-leisure' | 'comprehensive-learning';
  overview: string;
  totalEstimatedTime: string;
  milestones: LearningMilestone[];
  prerequisites: string[];
  tips: string[];
  // Add metadata fields to match AI-generated structure
  metadata?: {
    skillLevel: string;
    timeCommitment: string;
    learningStyle: string;
    contentTypes: string[];
  };
}

// Curated knowledge base - ONLY Python roadmap for testing UI without AI credits
export const curatedRoadmaps: Record<string, RoadmapData> = {
  'python': {
    topic: 'Python',
    queryType: 'career-focused',
    overview: 'Master Python programming from fundamentals to advanced applications. Learn syntax, data structures, algorithms, and real-world problem solving with hands-on practice.',
    totalEstimatedTime: '10-14 weeks',
    metadata: {
      skillLevel: 'beginner',
      timeCommitment: 'flexible',
      learningStyle: 'hands-on',
      contentTypes: ['video', 'article', 'practice', 'visual']
    },
    prerequisites: [
      'Basic computer literacy and file management',
      'Logical thinking and problem-solving mindset',
      'Patience for debugging and iterative learning',
      'Access to a computer with internet connection'
    ],
    tips: [
      'Practice coding daily, even if just 30 minutes - consistency beats intensity',
      'Use Python\'s interactive shell (REPL) for experimentation and quick testing',
      'Read other people\'s code on GitHub to learn best practices and patterns',
      'Build projects that genuinely interest you to maintain motivation',
      'Join Python communities and forums for support and collaboration',
      'Focus on understanding concepts rather than memorizing syntax'
    ],
    milestones: [
      {
        id: 'milestone-1',
        title: 'Python Fundamentals & Syntax',
        description: 'Master Python syntax, variables, data types, control structures, and write your first programs. Learn to think like a programmer.',
        estimatedTime: '3-4 weeks',
        difficulty: 'beginner',
        doThisNow: {
          prompt: 'Write a Python program that asks for your name and age, then prints a personalized greeting with your age in months.',
          reps: 3,
          sets: 1,
          activityType: 'code_challenge'
        },
        resources: [
          {
            type: 'video',
            title: 'Python for Beginners - Full Course',
            url: '#',
            description: 'Complete Python tutorial for beginners with hands-on exercises',
            duration: '4:26:52',
            source: 'YouTube',
            qualityScore: 85,
            thumbnail: 'https://img.youtube.com/vi/kqtD5dpn9C8/mqdefault.jpg'
          },
          {
            type: 'video',
            title: 'Python Crash Course for Beginners',
            url: '#',
            description: 'Quick Python fundamentals overview with practical examples',
            duration: '1:15:30',
            source: 'YouTube',
            qualityScore: 80,
            thumbnail: 'https://img.youtube.com/vi/JJmcL1N2KQs/mqdefault.jpg'
          },
          {
            type: 'article',
            title: 'Python Official Tutorial - Getting Started',
            url: 'https://docs.python.org/3/tutorial/',
            description: 'Official Python documentation tutorial for beginners',
            source: 'Python.org',
            qualityScore: 90,
            readingTime: '15 min'
          },
          {
            type: 'practice',
            title: 'Python Basics Practice Exercises',
            url: 'https://www.practicepython.org/',
            description: 'Interactive Python exercises for beginners',
            source: 'PracticePython.org',
            qualityScore: 85
          },
          {
            type: 'visual',
            title: 'Python Syntax Cheat Sheet',
            url: 'https://www.pythoncheatsheet.org/',
            description: 'Visual reference for Python syntax and common patterns',
            source: 'PythonCheatSheet.org',
            qualityScore: 75
          }
        ]
      },
      {
        id: 'milestone-2',
        title: 'Data Structures & Collections',
        description: 'Master Python\'s built-in data structures: lists, dictionaries, sets, and tuples. Learn when and how to use each effectively.',
        estimatedTime: '4-5 weeks',
        difficulty: 'intermediate',
        doThisNow: {
          prompt: 'Create a program that manages a simple contact book using dictionaries. Add, search, and display contacts with their phone numbers.',
          reps: 2,
          sets: 2,
          activityType: 'code_challenge'
        },
        resources: [
          {
            type: 'video',
            title: 'Python Data Structures Tutorial',
            url: '#',
            description: 'Complete guide to Python data structures with real examples',
            duration: '1:45:20',
            source: 'YouTube',
            qualityScore: 88,
            thumbnail: 'https://img.youtube.com/vi/pkYVOmU3MgA/mqdefault.jpg'
          },
          {
            type: 'video',
            title: 'Python Lists and Dictionaries Deep Dive',
            url: '#',
            description: 'Advanced techniques for working with Python collections',
            duration: '1:30:15',
            source: 'YouTube',
            qualityScore: 85,
            thumbnail: 'https://img.youtube.com/vi/8ext9G7xspg/mqdefault.jpg'
          },
          {
            type: 'article',
            title: 'Python Data Structures Documentation',
            url: 'https://docs.python.org/3/tutorial/datastructures.html',
            description: 'Official Python documentation on data structures',
            source: 'Python.org',
            qualityScore: 95,
            readingTime: '20 min'
          },
          {
            type: 'practice',
            title: 'Data Structures Practice Problems',
            url: 'https://leetcode.com/tag/array/',
            description: 'Practice problems focused on data structure manipulation',
            source: 'LeetCode',
            qualityScore: 90
          },
          {
            type: 'visual',
            title: 'Python Data Structures Visualization',
            url: 'https://visualgo.net/en',
            description: 'Interactive visualizations of data structures and algorithms',
            source: 'VisuAlgo',
            qualityScore: 80
          }
        ]
      },
      {
        id: 'milestone-3',
        title: 'Functions, Modules & Code Organization',
        description: 'Learn to write reusable functions, organize code into modules, and understand Python\'s import system.',
        estimatedTime: '3-4 weeks',
        difficulty: 'intermediate',
        doThisNow: {
          prompt: 'Create a module with utility functions for string manipulation. Include functions for palindrome checking, word counting, and text formatting.',
          reps: 1,
          sets: 3,
          activityType: 'code_challenge'
        },
        resources: [
          {
            type: 'video',
            title: 'Python Functions Complete Tutorial',
            url: '#',
            description: 'Comprehensive guide to Python functions and modules',
            duration: '2:10:45',
            source: 'YouTube',
            qualityScore: 87,
            thumbnail: 'https://img.youtube.com/vi/9Os0o3wzS_I/mqdefault.jpg'
          },
          {
            type: 'video',
            title: 'Python Modules and Packages',
            url: '#',
            description: 'How to organize and structure Python projects',
            duration: '1:25:30',
            source: 'YouTube',
            qualityScore: 82,
            thumbnail: 'https://img.youtube.com/vi/0oTh1CXRaQ0/mqdefault.jpg'
          },
          {
            type: 'article',
            title: 'Python Functions and Modules Guide',
            url: 'https://docs.python.org/3/tutorial/modules.html',
            description: 'Official documentation on Python functions and modules',
            source: 'Python.org',
            qualityScore: 92,
            readingTime: '25 min'
          },
          {
            type: 'practice',
            title: 'Function Writing Exercises',
            url: 'https://www.codewars.com/kata/search/python?q=&r[]=-8&tags=functions',
            description: 'Practice writing and testing Python functions',
            source: 'CodeWars',
            qualityScore: 88
          },
          {
            type: 'visual',
            title: 'Python Function Flow Diagrams',
            url: 'https://www.draw.io/',
            description: 'Create flow diagrams to visualize function logic',
            source: 'Draw.io',
            qualityScore: 75
          }
        ]
      },
      {
        id: 'milestone-4',
        title: 'File I/O & Data Processing',
        description: 'Learn to read and write files, work with CSV/JSON data, and handle different file formats effectively.',
        estimatedTime: '2-3 weeks',
        difficulty: 'intermediate',
        doThisNow: {
          prompt: 'Create a program that reads a CSV file of student grades, calculates averages, and generates a summary report.',
          reps: 2,
          sets: 2,
          activityType: 'code_challenge'
        },
        resources: [
          {
            type: 'video',
            title: 'Python File Handling Tutorial',
            url: '#',
            description: 'Complete guide to file I/O and data processing in Python',
            duration: '1:35:20',
            source: 'YouTube',
            qualityScore: 85,
            thumbnail: 'https://img.youtube.com/vi/Uh2ebFW8OYM/mqdefault.jpg'
          },
          {
            type: 'video',
            title: 'Working with CSV and JSON in Python',
            url: '#',
            description: 'Practical examples of data file processing',
            duration: '1:20:15',
            source: 'YouTube',
            qualityScore: 83,
            thumbnail: 'https://img.youtube.com/vi/WDe80Q_2fFc/mqdefault.jpg'
          },
          {
            type: 'article',
            title: 'Python File I/O Documentation',
            url: 'https://docs.python.org/3/tutorial/inputoutput.html',
            description: 'Official Python documentation on file handling',
            source: 'Python.org',
            qualityScore: 90,
            readingTime: '18 min'
          },
          {
            type: 'practice',
            title: 'File Processing Projects',
            url: 'https://github.com/topics/python-file-processing',
            description: 'Real-world file processing projects and examples',
            source: 'GitHub',
            qualityScore: 85
          },
          {
            type: 'visual',
            title: 'Data Processing Workflow Diagrams',
            url: 'https://mermaid.live/',
            description: 'Visualize data processing workflows and pipelines',
            source: 'Mermaid',
            qualityScore: 80
          }
        ]
      },
      {
        id: 'milestone-5',
        title: 'Error Handling & Debugging',
        description: 'Master try-except blocks, logging, debugging techniques, and writing robust, production-ready code.',
        estimatedTime: '2-3 weeks',
        difficulty: 'intermediate',
        doThisNow: {
          prompt: 'Write a robust function that safely divides two numbers, handles all possible errors, and provides meaningful error messages.',
          reps: 3,
          sets: 1,
          activityType: 'code_challenge'
        },
        resources: [
          {
            type: 'video',
            title: 'Python Error Handling Complete Guide',
            url: '#',
            description: 'Comprehensive tutorial on exceptions and error handling',
            duration: '1:45:30',
            source: 'YouTube',
            qualityScore: 88,
            thumbnail: 'https://img.youtube.com/vi/6tNS--WetLI/mqdefault.jpg'
          },
          {
            type: 'video',
            title: 'Python Debugging Techniques',
            url: '#',
            description: 'Professional debugging strategies and tools',
            duration: '1:15:45',
            source: 'YouTube',
            qualityScore: 85,
            thumbnail: 'https://img.youtube.com/vi/7V2v6fJqJvY/mqdefault.jpg'
          },
          {
            type: 'article',
            title: 'Python Exception Handling',
            url: 'https://docs.python.org/3/tutorial/errors.html',
            description: 'Official Python documentation on exceptions',
            source: 'Python.org',
            qualityScore: 95,
            readingTime: '22 min'
          },
          {
            type: 'practice',
            title: 'Error Handling Exercises',
            url: 'https://www.hackerrank.com/domains/python?filters%5Bsubdomains%5D%5B%5D=python-errors-and-exceptions',
            description: 'Practice problems focused on error handling',
            source: 'HackerRank',
            qualityScore: 87
          },
          {
            type: 'visual',
            title: 'Debugging Flow Charts',
            url: 'https://www.lucidchart.com/',
            description: 'Create debugging flowcharts and decision trees',
            source: 'Lucidchart',
            qualityScore: 75
          }
        ]
      },
      {
        id: 'milestone-6',
        title: 'Advanced Python Concepts',
        description: 'Explore decorators, generators, context managers, and advanced Python features for professional development.',
        estimatedTime: '4-5 weeks',
        difficulty: 'advanced',
        doThisNow: {
          prompt: 'Create a decorator that measures and logs the execution time of functions, then apply it to several test functions.',
          reps: 1,
          sets: 3,
          activityType: 'code_challenge'
        },
        resources: [
          {
            type: 'video',
            title: 'Advanced Python Programming',
            url: '#',
            description: 'Deep dive into advanced Python concepts and patterns',
            duration: '2:30:15',
            source: 'YouTube',
            qualityScore: 90,
            thumbnail: 'https://img.youtube.com/vi/3ohzBxoFHAY/mqdefault.jpg'
          },
          {
            type: 'video',
            title: 'Python Decorators and Generators',
            url: '#',
            description: 'Advanced Python features for professional development',
            duration: '1:50:20',
            source: 'YouTube',
            qualityScore: 87,
            thumbnail: 'https://img.youtube.com/vi/FsAPt_9Bf3U/mqdefault.jpg'
          },
          {
            type: 'article',
            title: 'Advanced Python Programming Guide',
            url: 'https://docs.python.org/3/howto/functional.html',
            description: 'Official Python documentation on advanced features',
            source: 'Python.org',
            qualityScore: 92,
            readingTime: '30 min'
          },
          {
            type: 'practice',
            title: 'Advanced Python Challenges',
            url: 'https://www.codewars.com/kata/search/python?q=&r[]=-6&tags=advanced',
            description: 'Advanced Python programming challenges',
            source: 'CodeWars',
            qualityScore: 90
          },
          {
            type: 'visual',
            title: 'Python Advanced Concepts Diagrams',
            url: 'https://excalidraw.com/',
            description: 'Visual explanations of advanced Python concepts',
            source: 'Excalidraw',
            qualityScore: 80
          }
        ]
      }
    ]
  }
};

/**
 * Get a curated roadmap by topic
 * @param topic - The topic to search for
 * @returns The roadmap data or null if not found
 */
export function getCuratedRoadmap(topic: string): RoadmapData | null {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Direct match
  if (curatedRoadmaps[normalizedTopic]) {
    return curatedRoadmaps[normalizedTopic];
  }
  
  // Partial match (for topics like "python programming" -> "python")
  for (const [key, roadmap] of Object.entries(curatedRoadmaps)) {
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      return roadmap;
    }
  }
  
  // Default to Python for any topic that doesn't have a curated roadmap
  return curatedRoadmaps['python'];
}

/**
 * Get all available curated roadmap topics
 * @returns Array of available topic names
 */
export function getAvailableCuratedTopics(): string[] {
  return Object.keys(curatedRoadmaps);
}

/**
 * Check if a topic has a curated roadmap
 * @param topic - The topic to check
 * @returns True if a curated roadmap exists
 */
export function hasCuratedRoadmap(topic: string): boolean {
  return getCuratedRoadmap(topic) !== null;
}
