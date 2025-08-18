import { NextRequest, NextResponse } from "next/server";

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt?: string;
  readingTime?: string;
  tags: string[];
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

    // TODO: Replace with actual Tavily/Google Search API call
    // For now, return mock data
    const mockArticles: Article[] = [
      {
        id: "article1",
        title: `The Complete Guide to Learning ${query}`,
        description: `A comprehensive guide covering everything you need to know about ${query}, from basics to advanced concepts.`,
        url: "https://example.com/complete-guide",
        source: "Tech Blog",
        publishedAt: "2024-01-15",
        readingTime: "15 min read",
        tags: ["tutorial", "guide", "beginner"]
      },
      {
        id: "article2",
        title: `${query} Best Practices for 2024`,
        description: `Learn the latest best practices and industry standards for working with ${query} in modern development.`,
        url: "https://example.com/best-practices",
        source: "Dev Magazine",
        publishedAt: "2024-01-10",
        readingTime: "8 min read",
        tags: ["best-practices", "advanced", "industry"]
      },
      {
        id: "article3",
        title: `Getting Started with ${query}: A Beginner's Tutorial`,
        description: `Step-by-step tutorial for absolute beginners who want to learn ${query} from scratch.`,
        url: "https://example.com/beginner-tutorial",
        source: "Learn to Code",
        publishedAt: "2024-01-08",
        readingTime: "12 min read",
        tags: ["tutorial", "beginner", "step-by-step"]
      },
      {
        id: "article4",
        title: `${query} vs Other Technologies: A Comparison`,
        description: `Detailed comparison of ${query} with similar technologies to help you choose the right tool.`,
        url: "https://example.com/comparison",
        source: "Tech Reviews",
        publishedAt: "2024-01-05",
        readingTime: "10 min read",
        tags: ["comparison", "analysis", "decision-making"]
      },
      {
        id: "article5",
        title: `Advanced ${query} Techniques and Patterns`,
        description: `Explore advanced techniques, design patterns, and optimization strategies for ${query}.`,
        url: "https://example.com/advanced-techniques",
        source: "Advanced Dev",
        publishedAt: "2024-01-01",
        readingTime: "20 min read",
        tags: ["advanced", "patterns", "optimization"]
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      articles: mockArticles.slice(0, parseInt(maxResults)),
      totalResults: mockArticles.length,
      query: query
    });

  } catch (error) {
    console.error("Error searching articles:", error);
    return NextResponse.json(
      { error: "Failed to search articles" },
      { status: 500 }
    );
  }
}
