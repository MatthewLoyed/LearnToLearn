/**
 * Search Service Types
 * Type definitions for unified search functionality
 */

export interface SearchResults {
  videos: any[];
  articles: any[];
  images: any[];
  metadata: {
    searchQueries: {
      youtube: string[];
      articles: string[];
      images: string[];
      detectedTopic: string;
      reasoning: string;
    };
    contentOptimization: {
      learningStyle: string;
      difficultyAdjustment: string;
      contentTypes: string[];
      searchStrategy: string;
    };
    classification: {
      domain: string;
      complexity: string;
      prerequisites: string[];
      estimatedTime: string;
    };
    apiResults: {
      videos: number;
      articles: number;
      images: number;
    };
  };
}

export interface SearchOptions {
  maxVideos?: number;
  maxArticles?: number;
  maxImages?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SearchStats {
  totalVideos: number;
  totalArticles: number;
  totalImages: number;
  totalContent: number;
  domain: string;
  complexity: string;
  learningStyle: string;
  estimatedTime: string;
}
