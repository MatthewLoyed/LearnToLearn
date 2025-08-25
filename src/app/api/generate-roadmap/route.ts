import { NextRequest, NextResponse } from 'next/server';
import { generateCompleteRoadmap } from '@/lib/services/openai';
import { getCuratedRoadmap } from '@/lib/data/roadmaps';
import { searchAllContent, enhanceRoadmapWithContent } from '@/lib/services/search';
import { 
  logSection, 
  logRoadmapProgress, 
  logSuccess, 
  logWarning,
  createTimer
} from '@/lib/utils/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface RoadmapData {
  topic: string;
  queryType?: string;
  overview: string;
  totalEstimatedTime: string;
  prerequisites: string[];
  tips: string[];
  milestones: any[];
  searchQueries?: {
    youtubeQueries: string[];
    articleQueries: string[];
    detectedTopic: string;
    reasoning: string;
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
  };
}

interface RoadmapDataEnhanced extends RoadmapData {
  metadata?: any;
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const timer = createTimer('Roadmap', 'Complete Roadmap Generation');
  
  try {
    const body = await request.json();
    const { topic, skillLevel = 'beginner', aiEnabled = false, maxTokensMode = false } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    logSection('ROADMAP GENERATION');
    logRoadmapProgress(`Generating roadmap for: "${topic}" (${skillLevel})`);

    // Step 1: Get base roadmap (AI-generated or curated)
    let roadmap: RoadmapData;
    
    if (aiEnabled) {
      logRoadmapProgress(`Using AI-generated roadmap for: ${topic}`);
      const aiResponse = await generateCompleteRoadmap({
        topic,
        skillLevel,
        timeCommitment: 'flexible',
        aiEnabled: true
      });
      roadmap = aiResponse.roadmap;
    } else {
      logRoadmapProgress(`Using curated roadmap for: ${topic}`);
      roadmap = getCuratedRoadmap(topic) || getCuratedRoadmap('javascript'); // fallback
    }

    // Step 2: Enhance roadmap with real content (using integrated search queries for AI-generated roadmaps)
    if (aiEnabled) {
      logRoadmapProgress(`Enhancing roadmap with real content using integrated search queries for: ${topic}`);
      
      try {
        // For AI-generated roadmaps, we now have integrated search queries
        // This eliminates the need for a separate generateSearchQueries() call
        if (roadmap.searchQueries) {
          console.log('🔗 Using integrated search queries from unified AI generation');
          
          // Use the integrated search queries for content enhancement
          const searchResults = await searchAllContent(topic, {
            skillLevel
          });

          const enhancedRoadmap = enhanceRoadmapWithContent(roadmap, searchResults, topic);
          
          // Count real vs fallback content for accurate logging
          const realVideos = searchResults.videos.filter(v => v.type !== 'fallback').length;
          const realArticles = searchResults.articles.filter(a => a.type !== 'fallback').length;
          
          logSuccess('Roadmap', 'Successfully enhanced roadmap with integrated search queries', {
            videos: `${realVideos}/${searchResults.videos.length} real`,
            articles: `${realArticles}/${searchResults.articles.length} real`,
            costSaving: 'Saved ~$0.0002 by eliminating separate search query generation'
          });

          timer.end(enhancedRoadmap);
          return NextResponse.json(enhancedRoadmap);
        } else {
          // Fallback: Legacy roadmap without integrated search queries
          console.log('🔄 Legacy roadmap detected, using separate search query generation');
          
          const searchResults = await searchAllContent(topic, {
            skillLevel
          });

          const enhancedRoadmap = enhanceRoadmapWithContent(roadmap, searchResults, topic);
          
          const realVideos = searchResults.videos.filter(v => v.type !== 'fallback').length;
          const realArticles = searchResults.articles.filter(a => a.type !== 'fallback').length;
          
          logSuccess('Roadmap', 'Successfully enhanced roadmap with separate search queries', {
            videos: `${realVideos}/${searchResults.videos.length} real`,
            articles: `${realArticles}/${searchResults.articles.length} real`
          });

          timer.end(enhancedRoadmap);
          return NextResponse.json(enhancedRoadmap);
        }

      } catch (searchError) {
        logWarning('Roadmap', 'Content enhancement failed, returning base roadmap', searchError);
        return NextResponse.json(roadmap as RoadmapDataEnhanced);
      }
    } else {
      logRoadmapProgress(`AI disabled - returning curated roadmap without API calls for: ${topic}`);
      return NextResponse.json(roadmap as RoadmapDataEnhanced);
    }

  } catch (error) {
    logWarning('Roadmap', 'Error generating roadmap', error);
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
