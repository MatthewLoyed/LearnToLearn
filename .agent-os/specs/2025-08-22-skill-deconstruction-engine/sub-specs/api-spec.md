# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-22-skill-deconstruction-engine/spec.md

## Endpoints

### POST /api/generate-roadmap

**Purpose:** Enhanced roadmap generation endpoint that now uses the skill deconstruction engine to create structured learning paths with interactive milestones and practice prompts.

**Parameters:**

- `topic` (string, required): The skill or topic to deconstruct (e.g., "how to improve at javascript")
- `learningStyle` (string, optional): Preferred learning style (visual, auditory, kinesthetic)
- `difficulty` (string, optional): Desired difficulty level (beginner, intermediate, advanced)

**Response:**

```json
{
  "success": true,
  "data": {
    "skillDeconstruction": {
      "id": "uuid",
      "skillName": "JavaScript Programming",
      "skillType": "abstract",
      "userQuery": "how to improve at javascript",
      "levels": [
        {
          "level": 1,
          "title": "Level 1: Foundation",
          "description": "Basic understanding and initial attempts",
          "milestones": [
            {
              "id": "milestone_1",
              "title": "Variables and Data Types",
              "description": "Write a program that stores user input in a variable and prints it back",
              "doThisNow": {
                "prompt": "Your task is to write a JavaScript program that prompts the user for their name and prints 'Hello, [name]!'",
                "reps": 3,
                "sets": 1,
                "successCriteria": "Code runs without errors and produces correct output"
              },
              "estimatedTime": 30,
              "icon": "code",
              "content": {
                "videos": [...],
                "articles": [...],
                "images": [...]
              }
            }
          ]
        }
      ],
      "totalEstimatedTime": 120,
      "difficulty": "beginner"
    },
    "progress": {
      "completedMilestones": 0,
      "totalMilestones": 12,
      "currentLevel": 1,
      "currentMilestone": "milestone_1"
    }
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid topic or missing required parameters
- `500 Internal Server Error`: AI deconstruction failed or content generation error

### GET /api/skill-deconstruction/:id

**Purpose:** Retrieve a specific skill deconstruction with current progress data from localStorage.

**Parameters:**

- `id` (string, required): ID of the skill deconstruction

**Response:**

```json
{
  "success": true,
  "data": {
    "skillDeconstruction": {
      // Same structure as POST response
    },
    "progress": {
      "milestones": [
        {
          "milestoneId": "milestone_1",
          "status": "completed",
          "startedAt": "2025-08-22T10:00:00Z",
          "completedAt": "2025-08-22T10:30:00Z",
          "practiceAttempts": 1,
          "practiceCompletions": 1
        }
      ],
      "overallProgress": {
        "completedMilestones": 3,
        "totalMilestones": 12,
        "percentageComplete": 25,
        "estimatedTimeRemaining": 90
      }
    }
  }
}
```

**Errors:**

- `404 Not Found`: Skill deconstruction not found in localStorage
- `500 Internal Server Error`: Processing error

### POST /api/milestone/:milestoneId/start

**Purpose:** Mark a milestone as started and begin tracking progress.

**Parameters:**

- `milestoneId` (string, required): ID of the milestone to start
- `skillDeconstructionId` (string, required): ID of the skill deconstruction

**Response:**

```json
{
  "success": true,
  "data": {
    "milestoneProgress": {
      "id": "uuid",
      "milestoneId": "milestone_1",
      "status": "in_progress",
      "startedAt": "2025-08-22T10:00:00Z",
      "practiceAttempts": 0,
      "practiceCompletions": 0
    }
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid milestone ID or already started
- `404 Not Found`: Milestone or skill deconstruction not found in localStorage

### POST /api/milestone/:milestoneId/complete

**Purpose:** Mark a milestone as completed and record practice activity data.

**Parameters:**

- `milestoneId` (string, required): ID of the milestone to complete
- `skillDeconstructionId` (string, required): ID of the skill deconstruction
- `practiceData` (object, optional): Practice activity completion data

**Request Body:**

```json
{
  "practiceData": {
    "activities": [
      {
        "activityType": "code_challenge",
        "title": "Variables and Data Types Challenge",
        "completionTime": 25,
        "difficultyRating": 2,
        "userNotes": "Struggled with template literals initially"
      }
    ],
    "notes": "Completed all practice exercises successfully"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "milestoneProgress": {
      "id": "uuid",
      "milestoneId": "milestone_1",
      "status": "completed",
      "completedAt": "2025-08-22T10:30:00Z",
      "practiceAttempts": 1,
      "practiceCompletions": 1
    },
    "nextMilestone": {
      "id": "milestone_2",
      "title": "Control Flow (If/Else)",
      "description": "Create a simple program that tells the user if a number is even or odd"
    }
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid milestone ID or not in progress
- `404 Not Found`: Milestone or skill deconstruction not found in localStorage

### GET /api/progress/:skillDeconstructionId

**Purpose:** Get detailed progress data for a skill deconstruction including all milestone statuses and practice activities.

**Parameters:**

- `skillDeconstructionId` (string, required): ID of the skill deconstruction

**Response:**

```json
{
  "success": true,
  "data": {
    "overallProgress": {
      "completedMilestones": 3,
      "totalMilestones": 12,
      "percentageComplete": 25,
      "estimatedTimeRemaining": 90,
      "currentLevel": 2,
      "currentMilestone": "milestone_4"
    },
    "milestoneProgress": [
      {
        "milestoneId": "milestone_1",
        "title": "Variables and Data Types",
        "status": "completed",
        "startedAt": "2025-08-22T10:00:00Z",
        "completedAt": "2025-08-22T10:30:00Z",
        "practiceActivities": [
          {
            "id": "uuid",
            "activityType": "code_challenge",
            "title": "Variables and Data Types Challenge",
            "completed": true,
            "completionTime": 25,
            "difficultyRating": 2
          }
        ]
      }
    ],
    "practiceAnalytics": {
      "totalPracticeTime": 75,
      "averageDifficultyRating": 2.3,
      "mostChallengingActivity": "Template Literals Exercise",
      "completionRate": 100
    }
  }
}
```

**Errors:**

- `404 Not Found`: Skill deconstruction not found in localStorage
- `500 Internal Server Error`: Processing error

## Controllers

### SkillDeconstructionController

**Actions:**

- `generateDeconstruction(topic, options)`: Main method that orchestrates skill deconstruction
- `getDeconstruction(id)`: Retrieve existing deconstruction with progress
- `updateProgress(milestoneId, action, data)`: Update milestone progress status

**Business Logic:**

- AI prompt engineering for skill deconstruction
- Content distribution across milestones
- Progress tracking and analytics
- Error handling and fallbacks

### MilestoneProgressController

**Actions:**

- `startMilestone(milestoneId, skillDeconstructionId)`: Begin milestone tracking
- `completeMilestone(milestoneId, skillDeconstructionId, practiceData)`: Mark milestone complete
- `getProgress(skillDeconstructionId)`: Retrieve detailed progress data

**Business Logic:**

- Milestone status management
- Practice activity tracking
- Progress calculation and analytics
- Next milestone determination

## Integration Points

### OpenAI Service Integration

- Enhanced prompt engineering for skill deconstruction
- Structured output parsing for levels and milestones
- Error handling and retry logic
- Cost tracking and optimization

### Content Service Integration

- Intelligent distribution of videos, articles, and images across milestones
- Content quality filtering and relevance scoring
- Fallback content when primary sources unavailable

### Progress Tracking Integration

- localStorage-based session management
- Milestone completion tracking
- Practice activity analytics
- Progress visualization data

## Error Handling

### Graceful Degradation

- Fallback to basic roadmap if AI deconstruction fails
- Mock milestone data when content unavailable
- Progress tracking continues even with partial failures

### User Feedback

- Clear error messages for different failure types
- Progress indicators during long operations
- Retry mechanisms for transient failures

## Performance Considerations

### Caching Strategy

- Cache skill deconstructions in localStorage to avoid redundant AI calls
- Cache progress data with appropriate TTL
- Implement ETags for efficient client-side caching

### Response Optimization

- Lazy loading of milestone content
- Pagination for large progress datasets
- Compression for JSON responses
