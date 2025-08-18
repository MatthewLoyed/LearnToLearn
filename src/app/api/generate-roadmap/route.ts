import { NextRequest, NextResponse } from 'next/server';

interface GenerateRoadmapRequest {
  topic: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: 'flexible' | 'part-time' | 'full-time';
  aiEnabled?: boolean;
}

interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources: Resource[];
}

interface Resource {
  type: 'video' | 'article' | 'tutorial' | 'practice';
  title: string;
  url: string;
  description: string;
  duration?: string;
}

interface RoadmapData {
  topic: string;
  queryType?: 'career-focused' | 'project-based' | 'academic-theory' | 'skill-enhancement' | 'hobby-leisure';
  overview: string;
  totalEstimatedTime: string;
  milestones: LearningMilestone[];
  prerequisites: string[];
  tips: string[];
}

// Curated knowledge base for common topics (free alternative)
const curatedRoadmaps: Record<string, RoadmapData> = {
  'react': {
    topic: 'React',
    queryType: 'career-focused',
    overview: 'Master React development from fundamentals to advanced patterns. Learn component-based architecture, state management, and modern React features.',
    totalEstimatedTime: '8-12 weeks',
    prerequisites: [
      'Basic HTML, CSS, and JavaScript knowledge',
      'Understanding of ES6+ features',
      'Familiarity with npm and package managers'
    ],
    tips: [
      'Build projects as you learn - theory + practice',
      'Use React DevTools for debugging',
      'Join React communities for support',
      'Focus on understanding component lifecycle'
    ],
    milestones: [
      {
        id: 'react-basics',
        title: 'React Fundamentals',
        description: 'Learn React components, JSX, props, and basic state management with useState.',
        estimatedTime: '2-3 weeks',
        difficulty: 'beginner',
        resources: [
          {
            type: 'video',
            title: 'React Tutorial for Beginners - 2024',
            url: 'https://youtu.be/bMknfKXIFA8',
            description: 'Complete React tutorial from scratch with modern practices',
            duration: '2:15:30'
          },
          {
            type: 'video',
            title: 'React Crash Course for Beginners',
            url: 'https://youtu.be/w7ejDZ8SWv8',
            description: 'Quick React fundamentals overview',
            duration: '1:45:20'
          },
          {
            type: 'article',
            title: 'React Official Tutorial',
            url: 'https://react.dev/learn/tutorial-tic-tac-toe',
            description: 'Official React tutorial - build a game'
          }
        ]
      },
      {
        id: 'react-hooks',
        title: 'React Hooks Deep Dive',
        description: 'Master useState, useEffect, useContext, and custom hooks for advanced state management.',
        estimatedTime: '2-3 weeks',
        difficulty: 'intermediate',
        resources: [
          {
            type: 'video',
            title: 'React Hooks Complete Guide',
            url: 'https://youtu.be/TNhaISOUy6Q',
            description: 'Comprehensive hooks tutorial with real examples',
            duration: '1:45:20'
          },
          {
            type: 'video',
            title: 'Advanced React Hooks Patterns',
            url: 'https://youtu.be/1jWS7cCuUXw',
            description: 'Advanced hooks patterns and best practices',
            duration: '1:20:15'
          }
        ]
      },
      {
        id: 'state-management',
        title: 'Advanced State Management',
        description: 'Learn Redux, Context API, Zustand, and state management patterns for complex applications.',
        estimatedTime: '3-4 weeks',
        difficulty: 'advanced',
        resources: [
          {
            type: 'video',
            title: 'Redux Toolkit Tutorial',
            url: 'https://youtu.be/9zySeP5vH9c',
            description: 'Modern Redux with Redux Toolkit',
            duration: '1:20:15'
          },
          {
            type: 'video',
            title: 'React Context API Tutorial',
            url: 'https://youtu.be/35lXWvCuM8U',
            description: 'Complete Context API guide',
            duration: '1:15:30'
          }
        ]
      }
    ]
  },
  'python': {
    topic: 'Python',
    queryType: 'career-focused',
    overview: 'Learn Python programming from basics to advanced concepts. Master data structures, algorithms, and real-world applications.',
    totalEstimatedTime: '10-14 weeks',
    prerequisites: [
      'Basic computer literacy',
      'Logical thinking skills',
      'Patience for debugging'
    ],
    tips: [
      'Practice coding daily, even if just 30 minutes',
      'Use Python\'s interactive shell for experimentation',
      'Read other people\'s code to learn best practices',
      'Build projects that interest you personally'
    ],
    milestones: [
      {
        id: 'python-basics',
        title: 'Python Fundamentals',
        description: 'Learn Python syntax, variables, data types, control structures, and basic functions.',
        estimatedTime: '3-4 weeks',
        difficulty: 'beginner',
        resources: [
          {
            type: 'video',
            title: 'Python for Beginners - Full Course',
            url: 'https://youtu.be/kqtD5dpn9C8',
            description: 'Complete Python tutorial for beginners',
            duration: '4:26:52'
          },
          {
            type: 'video',
            title: 'Python Crash Course for Beginners',
            url: 'https://youtu.be/JJmcL1N2KQs',
            description: 'Quick Python fundamentals overview',
            duration: '1:15:30'
          }
        ]
      },
      {
        id: 'data-structures',
        title: 'Data Structures & Algorithms',
        description: 'Master lists, dictionaries, sets, and basic algorithms in Python.',
        estimatedTime: '4-5 weeks',
        difficulty: 'intermediate',
        resources: [
          {
            type: 'video',
            title: 'Python Data Structures Tutorial',
            url: 'https://youtu.be/pkYVOmU3MgA',
            description: 'Complete guide to Python data structures',
            duration: '1:45:20'
          },
          {
            type: 'video',
            title: 'Python Algorithms for Beginners',
            url: 'https://youtu.be/8ext9G7xspg',
            description: 'Essential algorithms in Python',
            duration: '1:30:15'
          },
          {
            type: 'article',
            title: 'Python Data Structures',
            url: 'https://docs.python.org/3/tutorial/datastructures.html',
            description: 'Official Python documentation'
          }
        ]
      }
    ]
  },
  'javascript': {
    topic: 'JavaScript',
    queryType: 'career-focused',
    overview: 'Master JavaScript programming from ES6+ features to modern web development patterns and frameworks.',
    totalEstimatedTime: '8-12 weeks',
    prerequisites: [
      'Basic HTML and CSS knowledge',
      'Understanding of web browsers',
      'Familiarity with programming concepts'
    ],
    tips: [
      'Use modern ES6+ features from the start',
      'Practice in browser console regularly',
      'Learn async programming patterns',
      'Build real projects to apply knowledge'
    ],
    milestones: [
      {
        id: 'js-fundamentals',
        title: 'JavaScript Fundamentals',
        description: 'Learn variables, functions, objects, arrays, and ES6+ features like arrow functions and destructuring.',
        estimatedTime: '3-4 weeks',
        difficulty: 'beginner',
        resources: [
          {
            type: 'video',
            title: 'JavaScript Full Course for Beginners',
            url: 'https://youtu.be/lkIFF4maKMU?si=YIZoBNND7jyOGxPU',
            description: 'Complete JavaScript course from scratch',
            duration: '3:26:43'
          },
          {
            type: 'video',
            title: 'Modern JavaScript Crash Course',
            url: 'https://youtu.be/XIOLqoPHCJ4',
            description: 'Quick modern JavaScript overview',
            duration: '1:45:20'
          }
        ]
      },
      {
        id: 'async-js',
        title: 'Asynchronous JavaScript',
        description: 'Master promises, async/await, and handling asynchronous operations effectively.',
        estimatedTime: '2-3 weeks',
        difficulty: 'intermediate',
        resources: [
          {
            type: 'video',
            title: 'JavaScript Async/Await Tutorial',
            url: 'https://youtu.be/V_Kr9OSfVUQ',
            description: 'Complete async/await guide',
            duration: '1:20:15'
          },
          {
            type: 'video',
            title: 'JavaScript Promises Tutorial',
            url: 'https://youtu.be/DHvZLI7Db8E',
            description: 'Understanding JavaScript promises',
            duration: '1:15:30'
          },
          {
            type: 'article',
            title: 'JavaScript Promises Guide',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises',
            description: 'MDN Web Docs on Promises'
          }
        ]
      }
    ]
  }
};

// Enhanced topic analysis and prompt engineering functions
function analyzeTopic(topic: string): { analyzedTopic: string; learningFocus: string; roadmapType: string } {
  // For now, use a simple fallback while we implement AI-powered classification
  // This will be replaced by ChatGPT's classification in the main prompt
  return {
    analyzedTopic: topic.trim(),
    learningFocus: "comprehensive learning from basics to advanced",
    roadmapType: "comprehensive-learning"
  };
}

function getContextInstructions(roadmapType: string, topic: string): string {
  switch (roadmapType) {
    case "career-focused":
      return `Focus on career preparation for ${topic}. Emphasize job-ready skills, industry certifications, portfolio building, networking, and practical experience. Include real-world applications and professional development.`;
    
    case "project-based":
      return `Focus on practical implementation for ${topic}. Emphasize tools, frameworks, step-by-step implementation, and hands-on project building. Include specific technologies and actionable development steps.`;
    
    case "academic-theory":
      return `Focus on theoretical understanding of ${topic}. Emphasize conceptual clarity, foundational principles, academic resources, and deep comprehension. Include textbooks, research papers, and theoretical frameworks.`;
    
    case "skill-enhancement":
      return `Focus on improving existing skills in ${topic}. Assume the learner has basic knowledge and wants to advance to intermediate/advanced levels. Include advanced techniques, optimization strategies, and mastery-level concepts.`;
    
    case "comprehensive-learning":
      return `Create a complete learning journey for ${topic} from absolute beginner to advanced practitioner. Cover fundamentals, core concepts, practical applications, and advanced techniques.`;
    
    default:
      return `Create a well-rounded learning path for ${topic} that balances theory with practical application.`;
  }
}

function getStructureGuidelines(roadmapType: string, skillLevel: string): string {
  const baseGuidelines = `- Start with essential fundamentals and prerequisites
- Progress logically from basic to advanced concepts
- Include practical application and hands-on practice
- End with mastery or specialization opportunities
- Ensure each milestone builds upon previous knowledge
- Scale roadmap depth and pacing to the specified time commitment
- Adapt to learner's skill level (${skillLevel}) with no assumed prior knowledge if beginner
- Always include practice tasks or reflection questions per milestone
- Avoid hallucinated links; provide official documentation or clear search guidance if no reliable resource exists`;

  switch (roadmapType) {
    case "career-focused":
      return `${baseGuidelines}
- Emphasize industry-relevant skills and certifications
- Include portfolio-building and networking milestones
- Focus on job market requirements and professional standards
- Include real-world project experience and case studies`;
    
    case "project-based":
      return `${baseGuidelines}
- Focus on practical implementation and hands-on building
- Emphasize specific tools, frameworks, and technologies
- Include step-by-step project development milestones
- Prioritize working code and functional applications`;
    
    case "academic-theory":
      return `${baseGuidelines}
- Emphasize theoretical foundations and conceptual understanding
- Include academic resources, textbooks, and research materials
- Focus on deep comprehension rather than practical application
- Include theoretical frameworks and mathematical foundations`;
    
    case "skill-enhancement":
      return `${baseGuidelines}
- Focus on advanced techniques and optimization
- Include performance improvement strategies
- Emphasize practical mastery and real-world application
- Consider competitive or professional standards`;
    
    case "comprehensive-learning":
      return `${baseGuidelines}
- Cover complete skill development from scratch
- Include foundational knowledge and theory
- Balance breadth and depth of learning
- Prepare for real-world application and career development`;
    
    default:
      return baseGuidelines;
  }
}

function getResourceGuidelines(roadmapType: string): string {
  const baseGuidelines = `- Include a mix of theoretical and practical resources
- Focus on high-quality, current content
- Prefer official documentation and trusted sources
- Include both beginner-friendly and advanced materials
- If no suitable article exists, insert a placeholder with 'No reliable article found – search using [term].' Do not fabricate links
- Always include learning habit tips (spaced repetition, note-taking)
- Include mindset tips (patience, iteration, real-world application)
- Include resource vetting tips (avoid outdated content, check credibility)`;

  switch (roadmapType) {
    case "career-focused":
      return `${baseGuidelines}
- Emphasize industry certifications and professional training
- Include job market resources and career guidance
- Focus on portfolio-building and networking materials
- Include real-world case studies and industry examples`;
    
    case "project-based":
      return `${baseGuidelines}
- Emphasize hands-on tutorials and practical guides
- Include specific tool and framework documentation
- Focus on step-by-step implementation resources
- Include project templates and code examples`;
    
    case "academic-theory":
      return `${baseGuidelines}
- Emphasize textbooks, research papers, and academic sources
- Include theoretical frameworks and mathematical foundations
- Focus on conceptual understanding and deep learning
- Include academic courses and scholarly resources`;
    
    case "skill-enhancement":
      return `${baseGuidelines}
- Emphasize advanced tutorials and expert-level content
- Include performance analysis and optimization resources
- Focus on practical application and real-world scenarios
- Consider competitive or professional training materials`;
    
    case "comprehensive-learning":
      return `${baseGuidelines}
- Start with beginner-friendly foundational content
- Progress to intermediate and advanced materials
- Include comprehensive guides and complete courses
- Balance theory with practical application`;
    
    default:
      return baseGuidelines;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRoadmapRequest = await request.json();
    const { topic, skillLevel, timeCommitment, aiEnabled = false } = body;

    // Check for curated roadmap first (free option)
    const normalizedTopic = topic.toLowerCase().trim();
    if (curatedRoadmaps[normalizedTopic]) {
      console.log('Using curated roadmap for:', topic);
      return NextResponse.json(curatedRoadmaps[normalizedTopic]);
    }

    // Try OpenAI API if available AND explicitly enabled
    if (process.env.OPENAI_API_KEY && (process.env.ENABLE_OPENAI === 'true' || aiEnabled)) {
      console.log('Attempting OpenAI API for:', topic);
      
      try {
        // Enhanced topic analysis and prompt engineering
        const { analyzedTopic, learningFocus, roadmapType } = analyzeTopic(topic);
        
                 const prompt = `You are an expert learning path designer creating a comprehensive roadmap for: "${topic}"

FIRST: CLASSIFY THE QUERY TYPE
Analyze the user's query and classify it into one of these 5 categories:

1. **CAREER-FOCUSED**: "how to become a data scientist", "career in web development", "job as a designer"
   - Focus: Job readiness, certifications, portfolio building, networking, professional development

2. **PROJECT-BASED**: "build a mobile app", "create a website", "make a game", "develop a chatbot"
   - Focus: Practical implementation, specific tools, step-by-step building, working code

3. **ACADEMIC-THEORY**: "understand quantum mechanics", "study machine learning", "learn about economics"
   - Focus: Theoretical foundations, conceptual understanding, academic resources, deep comprehension

4. **SKILL-ENHANCEMENT**: "how to get better at spikeball", "improve my cooking", "master guitar"
   - Focus: Advanced techniques, performance improvement, mastery-level concepts

5. **HOBBY-LEISURE**: "learn photography", "get into gardening", "start painting", "play chess"
   - Focus: Enjoyment, personal growth, practical skills, community involvement

CLASSIFICATION INSTRUCTIONS:
- Analyze the intent and context of the query
- Consider the user's implied goals and motivations
- Choose the most appropriate category based on the primary focus
- If multiple categories apply, choose the dominant one

TOPIC ANALYSIS:
- Original query: "${topic}"
- Query classification: [YOU MUST CLASSIFY INTO ONE OF THE 5 CATEGORIES ABOVE]
- Learning focus: [BASED ON CLASSIFICATION]
- Roadmap type: [BASED ON CLASSIFICATION]

CONTEXT UNDERSTANDING:
Based on your classification, provide appropriate context:
- For CAREER-FOCUSED: Emphasize job-ready skills, industry certifications, portfolio building, networking, and practical experience
- For PROJECT-BASED: Emphasize tools, frameworks, step-by-step implementation, and hands-on project building
- For ACADEMIC-THEORY: Emphasize conceptual clarity, foundational principles, academic resources, and deep comprehension
- For SKILL-ENHANCEMENT: Assume basic knowledge and focus on advanced techniques, optimization strategies, and mastery-level concepts
- For HOBBY-LEISURE: Emphasize enjoyment, practical application, community resources, and personal growth

LEARNING ROADMAP REQUIREMENTS:
- Skill level: ${skillLevel}
- Time commitment: ${timeCommitment}
- Target: [BASED ON YOUR CLASSIFICATION]

ROADMAP STRUCTURE GUIDELINES:
- Start with essential fundamentals and prerequisites
- Progress logically from basic to advanced concepts
- Include practical application and hands-on practice
- End with mastery or specialization opportunities
- Ensure each milestone builds upon previous knowledge
- Scale roadmap depth and pacing to the specified time commitment
- Adapt to learner's skill level (${skillLevel}) with no assumed prior knowledge if beginner
- Always include practice tasks or reflection questions per milestone
- Avoid hallucinated links; provide official documentation or clear search guidance if no reliable resource exists

RESOURCE GUIDELINES:
- Include a mix of theoretical and practical resources
- Focus on high-quality, current content
- Prefer official documentation and trusted sources
- Include both beginner-friendly and advanced materials
- If no suitable article exists, insert a placeholder with 'No reliable article found – search using [term].' Do not fabricate links
- Always include learning habit tips (spaced repetition, note-taking)
- Include mindset tips (patience, iteration, real-world application)
- Include resource vetting tips (avoid outdated content, check credibility)

VIDEO SEARCH STRATEGY:
- DO NOT provide YouTube URLs directly
- Provide 1-2 descriptive search terms per milestone
- Use popular, well-known educational channels
- Include terms like "best tutorial", "complete guide", "for beginners"
- Consider skill progression: basic → intermediate → advanced

VIDEO DURATION OPTIMIZATION:
- Beginner/early milestones: 8-15 minutes (easy digestion)
- Intermediate milestones: 15-30 minutes (deeper concepts)  
- Advanced milestones: 30-60 minutes (comprehensive coverage)

ARTICLE QUALITY STANDARDS:
- Include 1-2 high-quality articles per milestone
- Focus on official documentation and trusted sources
- Prefer well-known educational sites and official guides
- Ensure articles are current and relevant

MILESTONE PROGRESSION:
- Start with fundamentals and prerequisites
- Build progressively from basic to advanced concepts
- Include practical application milestones
- End with mastery or advanced specialization
- Ensure logical flow and clear dependencies

Please provide a JSON response with this exact structure:
{
  "topic": "${topic}",
  "queryType": "[ONE OF: career-focused, project-based, academic-theory, skill-enhancement, hobby-leisure]",
  "overview": "A 2-3 sentence overview explaining what this roadmap covers and the learning journey",
  "totalEstimatedTime": "e.g., '8-12 weeks' or '3-6 months'",
  "prerequisites": ["essential prerequisite 1", "essential prerequisite 2"],
  "tips": ["pro tip 1", "pro tip 2", "pro tip 3", "pro tip 4"],
  "milestones": [
    {
      "id": "unique-id-1",
      "title": "Clear milestone title",
      "description": "Detailed description of what will be learned and why it's important",
      "estimatedTime": "2-3 weeks",
      "difficulty": "beginner",
      "resources": [
        {
          "type": "video",
          "searchTerms": ["best tutorial for beginners", "complete guide 2024"],
          "description": "What to look for in this video resource"
        },
        {
          "type": "article",
          "title": "Real article title",
          "url": "https://real-website.com/actual-article",
          "description": "Brief description of the article content"
        }
      ]
    }
  ]
}

SPECIFIC REQUIREMENTS:
- Include 5-8 well-structured milestones
- Each milestone must include: title, why it matters, estimated time, difficulty, 1-2 search terms, and 1-2 articles
- If no trusted article exists, instruct learner to rely on official docs and specify the URL
- Scale the number of milestones and depth of each milestone based on ${timeCommitment}. Short commitments = condensed essentials. Long commitments = more depth and breadth
- At the end of each milestone, suggest 1-2 practice exercises, projects, or reflection questions to check progress
- Ensure progression from basic fundamentals to advanced concepts
- Make milestones actionable and measurable
- Focus on practical, real-world application
- Consider the ${skillLevel} skill level and ${timeCommitment} time commitment
- If topic is very niche or interdisciplinary, identify 1-2 broader prerequisite fields and integrate them into the roadmap

Remember: This roadmap should be comprehensive, practical, and tailored to help someone achieve mastery in ${topic}.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'User-Agent': 'SkillForge-LearningApp/1.0',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are an expert learning path designer. Always respond with valid JSON only. Do not include any markdown formatting or additional text outside the JSON object.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
                         temperature: 0.7,
             // CREDIT USAGE: This controls how much AI response we get (and pay for)
             // 4000 tokens ≈ $0.12 per roadmap request
             // Increase this for more detailed roadmaps, decrease to save credits
             max_tokens: 4000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Validate OpenAI response structure
          if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            console.error('Invalid OpenAI response structure:', data);
            throw new Error('Invalid response structure from OpenAI');
          }

          const choice = data.choices[0];
          if (!choice.message || !choice.message.content) {
            console.error('Missing message content in OpenAI response:', choice);
            throw new Error('Missing message content from OpenAI');
          }

          const aiResponse = choice.message.content.trim();
          console.log('OpenAI response received, length:', aiResponse.length);

          if (aiResponse) {
            try {
              // Try to extract JSON from the response
              let jsonString = aiResponse;
              
              // Look for JSON object in the response
              const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                jsonString = jsonMatch[0];
              }

                             // Parse the JSON response
               const roadmapData = JSON.parse(jsonString);
               console.log('Successfully parsed AI response for topic:', topic);
               
               // Enhance roadmap with real YouTube videos
               const enhancedRoadmap = await enhanceRoadmapWithVideos(roadmapData, topic);
               
               // Validate and clean the roadmap data
               const validatedRoadmap = validateAndCleanRoadmap(enhancedRoadmap, topic);
               return NextResponse.json(validatedRoadmap);
              
            } catch (parseError) {
              console.error('Failed to parse AI response:', parseError);
              console.log('Raw AI response:', aiResponse);
              throw new Error('Failed to parse AI response as JSON');
            }
          } else {
            throw new Error('Empty response from OpenAI');
          }
        } else {
          // Handle specific HTTP error codes
          const errorData = await response.text();
          console.error('OpenAI API error:', response.status, response.statusText);
          console.error('Error details:', errorData);
          
          if (response.status === 401) {
            throw new Error('Invalid OpenAI API key');
          } else if (response.status === 429) {
            throw new Error('OpenAI API rate limit exceeded');
          } else if (response.status >= 500) {
            throw new Error('OpenAI service temporarily unavailable');
          } else {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }
        }
              } catch (openaiError) {
          console.error('OpenAI API call failed:', openaiError);
          
          // Log specific error details for debugging
          if (openaiError instanceof Error) {
            console.error('Error message:', openaiError.message);
            console.error('Error stack:', openaiError.stack);
          }
          
          // Don't throw here - let it fall through to fallback
        }
    }

    // Fallback to generic roadmap
    console.log('Using fallback roadmap for:', topic);
    return NextResponse.json(getFallbackRoadmap(topic, skillLevel));

  } catch (error) {
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Search for articles using Tavily Search API
async function searchArticles(topic: string, milestone: string): Promise<Array<{title: string, url: string, description: string}>> {
  try {
    // Check if Tavily API key is available
    if (!process.env.TAVILY_API_KEY) {
      console.log('Tavily API key not available, using fallback articles');
      return getFallbackArticles(topic, milestone);
    }

    const searchQuery = `${topic} ${milestone} tutorial guide documentation`;
    console.log(`Searching articles for: ${searchQuery}`);
    console.log(`Tavily API key present: ${process.env.TAVILY_API_KEY ? 'Yes' : 'No'}`);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: searchQuery,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        max_results: 2,
        include_domains: [
          'developer.mozilla.org',
          'docs.python.org',
          'react.dev',
          'nodejs.org',
          'web.dev',
          'css-tricks.com',
          'stackoverflow.com',
          'github.com'
        ]
      })
    });

    if (!response.ok) {
      console.error('Tavily API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Tavily API error details:', errorText);
      return getFallbackArticles(topic, milestone);
    }

    const data = await response.json();
    console.log('Tavily API response:', JSON.stringify(data, null, 2));
    
    if (!data.results || data.results.length === 0) {
      console.log('No results from Tavily API, using fallback articles');
      return getFallbackArticles(topic, milestone);
    }

    return data.results.map((result: any) => ({
      title: result.title || `${milestone} Guide`,
      url: result.url,
      description: result.content?.substring(0, 150) + '...' || `Learn about ${milestone} in ${topic}`
    }));

  } catch (error) {
    console.error('Error searching articles:', error);
    return getFallbackArticles(topic, milestone);
  }
}

// Fallback articles when API is not available
function getFallbackArticles(topic: string, milestone: string): Array<{title: string, url: string, description: string}> {
  const topicLower = topic.toLowerCase();
  const milestoneLower = milestone.toLowerCase();
  
  // Curated fallback articles based on topic
  const fallbackArticles: Record<string, Array<{title: string, url: string, description: string}>> = {
    'react': [
      {
        title: 'React Official Documentation',
        url: 'https://react.dev/learn',
        description: 'Official React documentation and tutorials'
      },
      {
        title: 'React Tutorial - MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started',
        description: 'Comprehensive React tutorial from MDN'
      }
    ],
    'python': [
      {
        title: 'Python Official Tutorial',
        url: 'https://docs.python.org/3/tutorial/',
        description: 'Official Python tutorial and documentation'
      },
      {
        title: 'Python for Beginners - Real Python',
        url: 'https://realpython.com/python-basics/',
        description: 'Beginner-friendly Python tutorials and guides'
      }
    ],
    'javascript': [
      {
        title: 'JavaScript Guide - MDN',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        description: 'Complete JavaScript guide from MDN'
      },
      {
        title: 'JavaScript Tutorial - W3Schools',
        url: 'https://www.w3schools.com/js/',
        description: 'Interactive JavaScript tutorials and examples'
      }
    ]
  };

  // Return topic-specific articles or generic ones
  return fallbackArticles[topicLower] || [
    {
      title: `${milestone} - Complete Guide`,
      url: `https://developer.mozilla.org/en-US/docs/Web`,
      description: `Comprehensive guide for ${milestone} in ${topic} - MDN Web Docs`
    },
    {
      title: `${milestone} Best Practices`,
      url: `https://web.dev/learn`,
      description: `Official documentation and best practices for ${milestone} - Web.dev`
    }
  ];
}

// Search for YouTube videos using YouTube Data API
async function searchYouTubeVideos(query: string, maxResults: number = 2): Promise<Array<{title: string, url: string, description: string, duration: string}>> {
  try {
    // Check if YouTube API key is available
    if (!process.env.YOUTUBE_API_KEY) {
      console.log('YouTube API key not available, using fallback');
      return [];
    }

    const searchQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&order=relevance&videoDuration=medium&videoDefinition=high&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      console.error('YouTube API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Get video details (duration, etc.) for the found videos
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!detailsResponse.ok) {
      return data.items.map((item: any) => ({
        title: item.snippet.title,
        url: `https://youtu.be/${item.id.videoId}`,
        description: item.snippet.description,
        duration: 'Unknown'
      }));
    }

    const detailsData = await detailsResponse.json();
    
    return data.items.map((item: any, index: number) => {
      const details = detailsData.items[index];
      const duration = details?.contentDetails?.duration || 'Unknown';
      
      return {
        title: item.snippet.title,
        url: `https://youtu.be/${item.id.videoId}`,
        description: item.snippet.description,
        duration: formatDuration(duration)
      };
    });

  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    return [];
  }
}

// Helper function to format YouTube duration (PT4M13S -> 4:13)
function formatDuration(duration: string): string {
  if (duration === 'Unknown') return 'Unknown';
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'Unknown';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Enhance roadmap with real videos and articles
async function enhanceRoadmapWithVideos(roadmapData: any, topic: string): Promise<any> {
  try {
    const enhancedMilestones = await Promise.all(
      roadmapData.milestones.map(async (milestone: any) => {
        const enhancedResources = await Promise.all(
          milestone.resources.map(async (resource: any) => {
            if (resource.type === 'video' && resource.searchTerms) {
              // Use the first search term to find videos
              const searchQuery = `${topic} ${resource.searchTerms[0]}`;
              console.log(`Searching YouTube for: ${searchQuery}`);
              
              const videos = await searchYouTubeVideos(searchQuery, 1);
              
              if (videos.length > 0) {
                const video = videos[0];
                return {
                  type: 'video',
                  title: video.title,
                  url: video.url,
                  description: resource.description || video.description,
                  duration: video.duration
                };
              } else {
                // Fallback if no videos found
                return {
                  type: 'video',
                  title: `${milestone.title} Tutorial`,
                  url: 'https://youtu.be/dQw4w9WgXcQ', // Rick Roll as fallback
                  description: resource.description || 'Video tutorial for this topic',
                  duration: 'Unknown'
                };
              }
            } else if (resource.type === 'article' && !resource.url) {
              // Search for articles if no URL provided
              console.log(`Searching articles for: ${topic} ${milestone.title}`);
              const articles = await searchArticles(topic, milestone.title);
              
              if (articles.length > 0) {
                return {
                  type: 'article',
                  title: articles[0].title,
                  url: articles[0].url,
                  description: articles[0].description
                };
              } else {
                // Fallback article
                return {
                  type: 'article',
                  title: `${milestone.title} Guide`,
                  url: `https://example.com/${topic}-${milestone.title.toLowerCase().replace(/\s+/g, '-')}`,
                  description: `Learn about ${milestone.title} in ${topic}`
                };
              }
            }
            return resource;
          })
        );
        
        return {
          ...milestone,
          resources: enhancedResources
        };
      })
    );
    
    return {
      ...roadmapData,
      milestones: enhancedMilestones
    };
  } catch (error) {
    console.error('Error enhancing roadmap with videos and articles:', error);
    return roadmapData; // Return original if enhancement fails
  }
}

// Fallback roadmap if AI fails
function getFallbackRoadmap(topic: string, skillLevel: string): RoadmapData {
  return {
    topic,
    queryType: 'comprehensive-learning',
    overview: `A comprehensive learning path for ${topic} designed for ${skillLevel} level students. This roadmap will guide you from basics to advanced concepts.`,
    totalEstimatedTime: '8-12 weeks',
    prerequisites: [
      'Basic computer literacy',
      'Willingness to learn and practice',
      'Access to a computer and internet'
    ],
    tips: [
      'Practice regularly, even if just 30 minutes a day',
      'Build projects to apply what you learn',
      'Join communities to get help and stay motivated',
      'Don\'t rush - focus on understanding concepts deeply'
    ],
    milestones: [
      {
        id: 'fundamentals',
        title: 'Learn the Fundamentals',
        description: 'Start with the basics and core concepts of the topic.',
        estimatedTime: '2-3 weeks',
        difficulty: 'beginner',
        resources: [
          {
            type: 'video',
            title: 'Introduction to Fundamentals',
            url: 'https://youtu.be/5ryCb5jvx4Q?si=Z5vKBnTaJWJ-jU35',
            description: 'Basic introduction video',
            duration: '45:00'
          },
          {
            type: 'article',
            title: 'Getting Started Guide',
            url: 'https://example.com/guide',
            description: 'Comprehensive getting started article'
          }
        ]
      },
      {
        id: 'intermediate',
        title: 'Intermediate Concepts',
        description: 'Build on fundamentals with more advanced topics and practical applications.',
        estimatedTime: '3-4 weeks',
        difficulty: 'intermediate',
        resources: [
          {
            type: 'video',
            title: 'Intermediate Tutorial',
            url: 'https://youtu.be/5ryCb5jvx4Q?si=Z5vKBnTaJWJ-jU35',
            description: 'Intermediate level tutorial',
            duration: '1:15:00'
          }
        ]
      },
      {
        id: 'advanced',
        title: 'Advanced Topics',
        description: 'Master advanced concepts and build real-world projects.',
        estimatedTime: '3-5 weeks',
        difficulty: 'advanced',
        resources: [
          {
            type: 'practice',
            title: 'Advanced Project Ideas',
            url: 'https://example.com/projects',
            description: 'Collection of advanced project ideas'
          }
        ]
      }
    ]
  };
}

// Validate and clean roadmap data
function validateAndCleanRoadmap(data: any, topic: string): RoadmapData {
  const validQueryTypes = ['career-focused', 'project-based', 'academic-theory', 'skill-enhancement', 'hobby-leisure'];
  
  return {
    topic: data.topic || topic,
    queryType: validQueryTypes.includes(data.queryType) ? data.queryType : 'comprehensive-learning',
    overview: data.overview || `Learn ${topic} step by step`,
    totalEstimatedTime: data.totalEstimatedTime || '8-12 weeks',
    prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
    tips: Array.isArray(data.tips) ? data.tips : [],
    milestones: Array.isArray(data.milestones) 
      ? data.milestones.map((milestone: any, index: number) => ({
          id: milestone.id || `milestone-${index}`,
          title: milestone.title || `Milestone ${index + 1}`,
          description: milestone.description || 'Learn this topic',
          estimatedTime: milestone.estimatedTime || '2-3 weeks',
          difficulty: ['beginner', 'intermediate', 'advanced'].includes(milestone.difficulty) 
            ? milestone.difficulty 
            : 'beginner',
          resources: Array.isArray(milestone.resources) ? milestone.resources : []
        }))
      : []
  };
}
