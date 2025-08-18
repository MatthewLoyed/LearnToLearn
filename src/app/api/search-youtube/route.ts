import { NextRequest, NextResponse } from "next/server";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  channel: string;
  publishedAt: string;
  viewCount: string;
  url: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const maxResults = searchParams.get("maxResults") || "5";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual YouTube API call
    // For now, return mock data
    const mockVideos: YouTubeVideo[] = [
      {
        id: "video1",
        title: `Complete ${query} Tutorial for Beginners`,
        description: `Learn ${query} from scratch with this comprehensive tutorial. Perfect for beginners who want to master the fundamentals.`,
        thumbnail: "https://via.placeholder.com/320x180",
        duration: "45:30",
        channel: "Tech Tutorials",
        publishedAt: "2024-01-15",
        viewCount: "125K",
        url: "https://youtube.com/watch?v=example1"
      },
      {
        id: "video2",
        title: `${query} Best Practices and Tips`,
        description: `Advanced tips and best practices for working with ${query}. Learn from industry experts.`,
        thumbnail: "https://via.placeholder.com/320x180",
        duration: "1:15:20",
        channel: "Code Masters",
        publishedAt: "2024-01-10",
        viewCount: "89K",
        url: "https://youtube.com/watch?v=example2"
      },
      {
        id: "video3",
        title: `${query} Project Building Guide`,
        description: `Build a real-world project using ${query}. Step-by-step guide with practical examples.`,
        thumbnail: "https://via.placeholder.com/320x180",
        duration: "2:30:15",
        channel: "Project Builders",
        publishedAt: "2024-01-05",
        viewCount: "67K",
        url: "https://youtube.com/watch?v=example3"
      },
      {
        id: "video4",
        title: `${query} Interview Questions and Answers`,
        description: `Common interview questions about ${query} and how to answer them effectively.`,
        thumbnail: "https://via.placeholder.com/320x180",
        duration: "38:45",
        channel: "Interview Prep",
        publishedAt: "2024-01-01",
        viewCount: "156K",
        url: "https://youtube.com/watch?v=example4"
      },
      {
        id: "video5",
        title: `${query} Advanced Concepts Explained`,
        description: `Deep dive into advanced ${query} concepts and techniques for experienced developers.`,
        thumbnail: "https://via.placeholder.com/320x180",
        duration: "1:45:30",
        channel: "Advanced Dev",
        publishedAt: "2023-12-28",
        viewCount: "42K",
        url: "https://youtube.com/watch?v=example5"
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      videos: mockVideos.slice(0, parseInt(maxResults)),
      totalResults: mockVideos.length,
      query: query
    });

  } catch (error) {
    console.error("Error searching YouTube:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube" },
      { status: 500 }
    );
  }
}
