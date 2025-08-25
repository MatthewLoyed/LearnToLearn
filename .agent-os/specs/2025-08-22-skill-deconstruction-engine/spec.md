# Spec Requirements Document

> Spec: Skill Deconstruction Engine
> Created: 2025-08-22

## Overview

Enhance the existing Skill Forge platform with an AI-powered skill deconstruction engine that dynamically breaks down any skill (physical or abstract) into essential 20/80 components with actionable milestones and "Do This Now" prompts. This engine will extend the current roadmap generation system to provide structured, interactive learning paths that force active engagement rather than passive consumption, building on the existing SkillTree component, OpenAI service, and content integration infrastructure.

## User Stories

### Skill Deconstruction Request

As a learner, I want to type a simple query like "how to improve at javascript" and receive a structured learning path broken down into essential components, so that I can focus on the most impactful 20% of the skill that will give me 80% of the results.

**Detailed Workflow:**

1. User enters skill query in natural language
2. System analyzes the query to determine skill type (physical vs abstract)
3. OpenAI deconstructs the skill into 3-5 progressive levels
4. Each level contains specific milestones with measurable outcomes
5. Each milestone includes "Do This Now" prompts with reps/sets structure
6. System integrates existing video content with new interactive prompts
7. User receives a professional, structured learning dashboard

### Interactive Learning Path

As a learner, I want each milestone to include mandatory practice activities with clear success criteria, so that I can actively engage with the material instead of passively watching videos.

**Detailed Workflow:**

1. User selects a milestone from their skill tree
2. System displays embedded video content followed by mandatory practice section
3. Practice section includes specific "Do This Now" instructions with reps/sets
4. User must complete practice activities to mark milestone as complete
5. System tracks progress and provides feedback on completion

### Progress Tracking

As a learner, I want to see my progress through a professional dashboard that shows completed milestones and current focus areas, so that I can stay motivated and understand my learning trajectory.

**Detailed Workflow:**

1. System displays skill tree as professional progress dashboard
2. Completed milestones show checkmarks with completion dates
3. Current active milestone is highlighted with different styling
4. Each milestone has unique icon based on skill type
5. Progress percentage and estimated completion time are displayed

## Spec Scope

1. **AI Skill Deconstruction** - OpenAI-powered analysis that breaks down skills into essential 20/80 components with progressive levels and milestones
2. **Interactive Milestone System** - Each milestone includes embedded videos followed by mandatory "Do This Now" practice prompts with reps/sets structure
3. **Professional Progress Dashboard** - Clean, modern skill tree visualization with milestone-specific icons and progress tracking
4. **Content Integration** - Seamless integration with existing video and article content from current roadmap system (visual content removed)
5. **Practice Validation** - System that tracks completion of practice activities and provides feedback on progress

## Out of Scope

- Gamification features (badges, points, leaderboards)
- Community features (forums, peer reviews, social learning)
- Advanced analytics and detailed performance metrics
- Mobile app development
- Offline learning capabilities
- Multi-language support

## Expected Deliverable

1. Users can enter skill queries and receive AI-generated structured learning paths with 3-5 progressive levels, each containing specific milestones and "Do This Now" practice prompts
2. Each milestone displays embedded video content followed by mandatory practice activities that users must complete to progress
3. Professional progress dashboard shows skill tree with milestone completion status, current focus areas, and estimated completion times
