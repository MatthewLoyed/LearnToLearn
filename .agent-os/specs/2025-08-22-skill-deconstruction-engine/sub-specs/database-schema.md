# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-22-skill-deconstruction-engine/spec.md

## New Tables

### `skill_deconstructions`

Stores the AI-generated skill deconstruction data with levels, milestones, and practice prompts.

```sql
CREATE TABLE skill_deconstructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_query TEXT NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  skill_type VARCHAR(50) NOT NULL CHECK (skill_type IN ('physical', 'abstract')),
  deconstruction_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient querying by skill type and name
CREATE INDEX idx_skill_deconstructions_type_name ON skill_deconstructions(skill_type, skill_name);
CREATE INDEX idx_skill_deconstructions_created_at ON skill_deconstructions(created_at);
```

**JSONB Structure for `deconstruction_data`:**

```json
{
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
            "prompt": "Your task is to write a Python program that prompts the user for an integer and prints 'Even' if it's even, and 'Odd' if it's odd. You must use an if/else statement.",
            "reps": 3,
            "sets": 1,
            "successCriteria": "Code runs without errors and produces correct output"
          },
          "estimatedTime": 30,
          "icon": "code"
        }
      ]
    }
  ],
  "totalEstimatedTime": 120,
  "difficulty": "beginner"
}
```

### `milestone_progress`

Tracks individual milestone completion and practice activity status.

```sql
CREATE TABLE milestone_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_deconstruction_id UUID NOT NULL REFERENCES skill_deconstructions(id) ON DELETE CASCADE,
  milestone_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  practice_attempts INTEGER DEFAULT 0,
  practice_completions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(skill_deconstruction_id, milestone_id)
);

-- Indexes for efficient progress tracking
CREATE INDEX idx_milestone_progress_status ON milestone_progress(status);
CREATE INDEX idx_milestone_progress_skill_deconstruction ON milestone_progress(skill_deconstruction_id);
CREATE INDEX idx_milestone_progress_completed_at ON milestone_progress(completed_at);
```

### `practice_activities`

Tracks individual practice activity completions with detailed feedback.

```sql
CREATE TABLE practice_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_progress_id UUID NOT NULL REFERENCES milestone_progress(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('code_challenge', 'physical_practice', 'reading', 'video_watch')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completion_time INTEGER, -- in minutes
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  user_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for activity tracking
CREATE INDEX idx_practice_activities_completed ON practice_activities(completed);
CREATE INDEX idx_practice_activities_milestone_progress ON practice_activities(milestone_progress_id);
CREATE INDEX idx_practice_activities_completed_at ON practice_activities(completed_at);
```

## Modified Tables

### `roadmaps` (Existing Table Enhancement)

Add new columns to support the skill deconstruction engine:

```sql
-- Add new columns to existing roadmaps table
ALTER TABLE roadmaps ADD COLUMN skill_deconstruction_id UUID REFERENCES skill_deconstructions(id);
ALTER TABLE roadmaps ADD COLUMN is_deconstructed BOOLEAN DEFAULT FALSE;

-- Index for efficient lookup
CREATE INDEX idx_roadmaps_skill_deconstruction ON roadmaps(skill_deconstruction_id);
```

## Data Integrity Rules

### Foreign Key Constraints

- `milestone_progress.skill_deconstruction_id` → `skill_deconstructions.id` (CASCADE DELETE)
- `practice_activities.milestone_progress_id` → `milestone_progress.id` (CASCADE DELETE)
- `roadmaps.skill_deconstruction_id` → `skill_deconstructions.id` (SET NULL on delete)

### Check Constraints

- Skill type must be either 'physical' or 'abstract'
- Milestone status must be one of the defined status values
- Practice activity type must be one of the defined activity types
- Difficulty rating must be between 1 and 5

### Unique Constraints

- Each milestone can only have one progress record per skill deconstruction
- Skill deconstruction query and skill name combination should be unique (optional, for caching)

## Performance Considerations

### Indexing Strategy

- **Primary Lookups**: Index on skill_deconstruction_id for efficient milestone and activity queries
- **Status Filtering**: Index on status fields for quick progress filtering
- **Time-based Queries**: Index on created_at and completed_at for analytics and reporting
- **Composite Indexes**: Index on (skill_deconstruction_id, milestone_id) for unique constraint enforcement

### Query Optimization

- Use JSONB operators for efficient querying of deconstruction data
- Implement pagination for large milestone lists
- Use materialized views for complex progress analytics (future enhancement)

## Migration Strategy

1. **Phase 1**: Create new tables without affecting existing functionality
2. **Phase 2**: Add new columns to existing roadmaps table
3. **Phase 3**: Migrate existing roadmap data to new schema (optional)
4. **Phase 4**: Implement new skill deconstruction engine using new schema

## Rationale

- **JSONB for Flexibility**: Allows storing complex skill deconstruction data without rigid schema constraints
- **Normalized Progress Tracking**: Separate tables for different types of progress data enable efficient querying
- **Cascade Deletes**: Ensures data consistency when skill deconstructions are deleted
- **Extensible Design**: Schema supports future enhancements like advanced analytics and community features
