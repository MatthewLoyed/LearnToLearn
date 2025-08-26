import { NextRequest, NextResponse } from 'next/server';
import { debugYouTubeAPILimitations } from '@/lib/services/youtube/youtube-service';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    console.log(`🔍 DEBUG API: Analyzing YouTube API limitations for "${topic}"`);
    
    const result = await debugYouTubeAPILimitations(topic);
    
    return NextResponse.json({
      success: true,
      topic,
      apiResults: result.apiResults,
      analysis: result.analysis,
      recommendations: result.recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔍 DEBUG API: Error:', error);
    return NextResponse.json(
      { error: 'Failed to debug YouTube API limitations' },
      { status: 500 }
    );
  }
}
