import { NextRequest, NextResponse } from 'next/server';
import { testYouTubeVideoDiscovery } from '@/lib/services/youtube/youtube-service';

export async function POST(request: NextRequest) {
  try {
    const { topic, skillLevel = 'beginner' } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    console.log(`🧪 TEST API: Testing YouTube discovery for "${topic}" (${skillLevel})`);
    
    const result = await testYouTubeVideoDiscovery(topic, skillLevel);
    
    console.log(`🧪 TEST API: Found ${result.videos.length} videos for "${topic}"`);
    
    return NextResponse.json({
      success: true,
      topic,
      skillLevel,
      videos: result.videos,
      totalQueries: result.totalQueries,
      totalCost: result.totalCost,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🧪 TEST API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to test YouTube video discovery' },
      { status: 500 }
    );
  }
}
