// Community resources for learning topics
// This provides fallback resources when AI-generated content is not available

export interface CommunityResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'article' | 'tutorial' | 'practice' | 'mindmap' | 'diagram' | 'infographic';
  category: 'general' | 'specific';
  verified: boolean;
  relevance?: string;
  imageUrl?: string;
}

export interface CommunityResources {
  visual: CommunityResource[];
  audio: CommunityResource[];
  courses: CommunityResource[];
  communities: CommunityResource[];
  general: CommunityResource[];
  specific: CommunityResource[];
}

// Default visual learning resources
const defaultVisualResources: CommunityResource[] = [
  {
    id: 'mindmap-basics',
    title: 'Mind Mapping Fundamentals',
    description: 'Learn how to create effective mind maps for better learning and memory retention',
    url: 'https://www.mindmeister.com/blog/mind-mapping-basics/',
    type: 'mindmap',
    category: 'general',
    verified: true,
    relevance: 'Mind maps help organize information visually and improve memory retention',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  },
  {
    id: 'diagram-techniques',
    title: 'Effective Diagram Creation',
    description: 'Master the art of creating clear, informative diagrams for learning',
    url: 'https://www.lucidchart.com/blog/how-to-create-effective-diagrams',
    type: 'diagram',
    category: 'general',
    verified: true,
    relevance: 'Diagrams break down complex concepts into visual, understandable components',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  },
  {
    id: 'infographic-design',
    title: 'Infographic Design Principles',
    description: 'Learn to create compelling infographics that enhance learning',
    url: 'https://venngage.com/blog/how-to-make-an-infographic/',
    type: 'infographic',
    category: 'general',
    verified: true,
    relevance: 'Infographics combine data and visuals to make information memorable and engaging',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  }
];

// Default audio learning resources
const defaultAudioResources: CommunityResource[] = [
  {
    id: 'podcast-learning',
    title: 'Learning Podcasts',
    description: 'Top educational podcasts for continuous learning',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX5Vy6DFOcx00',
    type: 'video',
    category: 'general',
    verified: true
  },
  {
    id: 'audiobook-platforms',
    title: 'Audiobook Learning Platforms',
    description: 'Best platforms for educational audiobooks',
    url: 'https://www.audible.com/ep/learning',
    type: 'tutorial',
    category: 'general',
    verified: true
  }
];

// Default course resources
const defaultCourseResources: CommunityResource[] = [
  {
    id: 'free-courses',
    title: 'Free Online Courses',
    description: 'High-quality free courses from top universities',
    url: 'https://www.coursera.org/search?query=free',
    type: 'tutorial',
    category: 'general',
    verified: true
  },
  {
    id: 'skillshare-courses',
    title: 'Skillshare Learning',
    description: 'Creative and practical skill courses',
    url: 'https://www.skillshare.com/browse',
    type: 'tutorial',
    category: 'general',
    verified: true
  }
];

// Default community resources
const defaultCommunityResources: CommunityResource[] = [
  {
    id: 'reddit-learning',
    title: 'r/LearnProgramming',
    description: 'Active community for programming learners',
    url: 'https://www.reddit.com/r/learnprogramming/',
    type: 'practice',
    category: 'general',
    verified: true
  },
  {
    id: 'discord-learning',
    title: 'Learning Discord Servers',
    description: 'Join Discord communities for collaborative learning',
    url: 'https://discord.gg/learn',
    type: 'practice',
    category: 'general',
    verified: true
  }
];

// Default general resources
const defaultGeneralResources: CommunityResource[] = [
  {
    id: 'khan-academy',
    title: 'Khan Academy',
    description: 'Free educational content across all subjects',
    url: 'https://www.khanacademy.org/',
    type: 'tutorial',
    category: 'general',
    verified: true
  },
  {
    id: 'youtube-education',
    title: 'YouTube Education',
    description: 'Educational content from verified creators',
    url: 'https://www.youtube.com/channel/UCsooa4yRKGN_zEE8iknghZA',
    type: 'video',
    category: 'general',
    verified: true
  }
];

// Default specific resources (will be populated based on topic)
const defaultSpecificResources: CommunityResource[] = [];

export function getAllResourcesForTopic(_topic: string): CommunityResources {
  // For now, return default resources
  // In the future, this could be enhanced to return topic-specific resources
  return {
    visual: defaultVisualResources,
    audio: defaultAudioResources,
    courses: defaultCourseResources,
    communities: defaultCommunityResources,
    general: defaultGeneralResources,
    specific: defaultSpecificResources
  };
}

// Export default resources for direct access
export const communityResources: CommunityResources = {
  visual: defaultVisualResources,
  audio: defaultAudioResources,
  courses: defaultCourseResources,
  communities: defaultCommunityResources,
  general: defaultGeneralResources,
  specific: defaultSpecificResources
};
