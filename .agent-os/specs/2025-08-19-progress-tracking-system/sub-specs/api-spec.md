# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-19-progress-tracking-system/spec.md

## Endpoints

### POST /api/track-progress

**Purpose:** Record user progress updates for learning milestones and achievements
**Parameters:**

- `userId` (string, required): Unique identifier for the user
- `learningPathId` (string, required): Identifier for the specific learning path
- `milestoneId` (string, required): Identifier for the completed milestone
- `completionData` (object, required): Additional completion metadata
  - `completedAt` (ISO string): Timestamp of completion
  - `timeSpent` (number): Time spent in seconds
  - `score` (number, optional): Achievement score if applicable
  - `notes` (string, optional): User notes about the milestone

**Response:**

```json
{
  "success": true,
  "data": {
    "progressId": "progress_123",
    "updatedAt": "2025-08-19T20:40:00Z",
    "totalProgress": 75,
    "achievementsUnlocked": ["first_milestone", "speed_learner"]
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid milestone ID or missing required parameters
- `404 Not Found`: Learning path or milestone not found
- `500 Internal Server Error`: Database or processing error

### GET /api/progress/:userId

**Purpose:** Retrieve comprehensive user progress data for all learning paths
**Parameters:**

- `userId` (string, required): Unique identifier for the user
- `learningPathId` (string, optional): Filter by specific learning path
- `includeAchievements` (boolean, optional): Include achievement data in response

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "learningPaths": [
      {
        "learningPathId": "path_456",
        "topic": "JavaScript Fundamentals",
        "totalMilestones": 10,
        "completedMilestones": 7,
        "progressPercentage": 70,
        "startedAt": "2025-08-15T10:00:00Z",
        "lastActivity": "2025-08-19T18:30:00Z",
        "milestones": [
          {
            "milestoneId": "milestone_1",
            "title": "Variables and Data Types",
            "completed": true,
            "completedAt": "2025-08-15T11:30:00Z",
            "timeSpent": 1800
          }
        ]
      }
    ],
    "achievements": [
      {
        "achievementId": "first_milestone",
        "title": "First Steps",
        "description": "Completed your first milestone",
        "unlockedAt": "2025-08-15T11:30:00Z",
        "icon": "🎯"
      }
    ],
    "analytics": {
      "totalTimeSpent": 7200,
      "averageCompletionTime": 1200,
      "learningVelocity": 2.3
    }
  }
}
```

**Errors:**

- `404 Not Found`: User not found
- `500 Internal Server Error`: Database or processing error

### PUT /api/progress/:userId

**Purpose:** Update existing progress records or add new milestone completions
**Parameters:**

- `userId` (string, required): Unique identifier for the user
- `updates` (array, required): Array of progress updates
  - `milestoneId` (string): Milestone to update
  - `learningPathId` (string): Associated learning path
  - `action` (string): "complete", "update", or "reset"
  - `data` (object): Update data based on action type

**Response:**

```json
{
  "success": true,
  "data": {
    "updatedCount": 3,
    "newAchievements": ["speed_learner"],
    "totalProgress": 80
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid update data or action
- `404 Not Found`: User or milestone not found
- `409 Conflict`: Conflicting progress data
- `500 Internal Server Error`: Database or processing error

### DELETE /api/progress/:userId

**Purpose:** Clear all progress data for a user (with confirmation)
**Parameters:**

- `userId` (string, required): Unique identifier for the user
- `confirmation` (string, required): Must be "DELETE_ALL_PROGRESS" to confirm
- `learningPathId` (string, optional): Clear only specific learning path progress

**Response:**

```json
{
  "success": true,
  "data": {
    "deletedRecords": 15,
    "message": "Progress data cleared successfully"
  }
}
```

**Errors:**

- `400 Bad Request`: Missing confirmation or invalid confirmation string
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database or processing error

### GET /api/progress/:userId/analytics

**Purpose:** Retrieve detailed learning analytics and insights
**Parameters:**

- `userId` (string, required): Unique identifier for the user
- `timeRange` (string, optional): "week", "month", "year", or "all"
- `learningPathId` (string, optional): Filter by specific learning path

**Response:**

```json
{
  "success": true,
  "data": {
    "timeRange": "month",
    "learningVelocity": 2.3,
    "averageSessionTime": 1800,
    "completionRate": 85,
    "streakDays": 7,
    "timeDistribution": {
      "videos": 40,
      "articles": 30,
      "exercises": 30
    },
    "trends": [
      {
        "date": "2025-08-19",
        "milestonesCompleted": 2,
        "timeSpent": 3600
      }
    ],
    "recommendations": [
      "Try studying in shorter sessions for better retention",
      "Focus on exercises to improve practical skills"
    ]
  }
}
```

**Errors:**

- `404 Not Found`: User not found
- `500 Internal Server Error`: Database or processing error

## Data Models

### Progress Record

```typescript
interface ProgressRecord {
  id: string;
  userId: string;
  learningPathId: string;
  milestoneId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
  score?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Achievement Record

```typescript
interface AchievementRecord {
  id: string;
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
  criteria: AchievementCriteria;
}
```

### Learning Analytics

```typescript
interface LearningAnalytics {
  userId: string;
  totalTimeSpent: number;
  averageCompletionTime: number;
  learningVelocity: number;
  completionRate: number;
  streakDays: number;
  timeDistribution: Record<string, number>;
  trends: TrendData[];
  recommendations: string[];
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details if available"
  }
}
```

### Common Error Codes

- `INVALID_INPUT`: Request parameters are invalid or missing
- `USER_NOT_FOUND`: Specified user does not exist
- `MILESTONE_NOT_FOUND`: Specified milestone does not exist
- `LEARNING_PATH_NOT_FOUND`: Specified learning path does not exist
- `PROGRESS_CONFLICT`: Conflicting progress data detected
- `STORAGE_ERROR`: Database or storage operation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests in time period

## Rate Limiting

- **Standard Endpoints**: 100 requests per minute per user
- **Analytics Endpoints**: 20 requests per minute per user
- **Delete Operations**: 5 requests per minute per user

## Authentication & Security

- All endpoints require user authentication (future implementation)
- Progress data is encrypted at rest
- User data isolation ensures users can only access their own progress
- Input validation and sanitization on all endpoints
- CORS configuration for cross-origin requests
