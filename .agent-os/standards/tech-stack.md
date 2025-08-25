# Tech Stack - Skill Forge

## Context

Current technology stack for the Skill Forge learning roadmap application.

## Frontend

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS 3.x + shadcn/ui components
- **Animations**: Framer Motion
- **Charts/Visuals**: Recharts for progress/roadmaps + Mermaid.js for flow diagrams
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter, Space Grotesk)
- **State Management**: React hooks (useState, useEffect)
- **Package Manager**: npm

## Backend

- **API Routes**: Next.js API routes for server-side logic
- **AI Integration**: OpenAI API (GPT-4o-mini)
- **External APIs**:
  - YouTube Data API v3 (video content)
  - Tavily Search API (article content)
  - Google Custom Search API (educational diagrams/images)
- **Authentication**: Supabase Auth (planned, not MVP priority)

## Database

- **Primary Database**: Supabase (PostgreSQL)
- **Use Cases**: User data, saved roadmaps, progress tracking
- **Status**: Planned integration

## Design System

- **Colors**: Custom HSL color palette with semantic colors
- **Typography**: Inter + Space Grotesk with comprehensive scale
- **Spacing**: Consistent spacing system (0-96 scale)
- **Components**: shadcn/ui base with custom enhancements
- **Dark Mode**: CSS variables with automatic and manual switching
- **Accessibility**: WCAG 2.1 AA compliant

## Development Tools

- **Build Tool**: Next.js built-in bundler
- **Linting**: ESLint with TypeScript rules
- **Type Checking**: TypeScript strict mode
- **Code Formatting**: Prettier (via ESLint)
- **Version Control**: Git
- **Development Server**: Next.js dev server

## Deployment

- **Platform**: Vercel (planned)
- **Environment Variables**: .env.local for local development
- **Build Process**: Next.js production build
- **Static Generation**: Next.js static site generation

## External Services

- **AI Content Generation**: OpenAI GPT-4o-mini for roadmaps and customization
- **Video Content**: YouTube Data API for educational videos
- **Article Content**: Tavily Search API for articles and tutorials
- **Image Search**: Google Custom Search API for educational diagrams
- **Analytics**: Planned integration
- **Error Tracking**: Planned integration

## Project Structure

```
LearnToLearn/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── ...             # Custom components
│   ├── lib/                # Utility functions
│   └── styles/             # CSS and design system
├── config/                 # Configuration files
├── docs/                   # Documentation
├── tasks/                  # Project management
├── .agent-os/              # Agent OS configuration
└── .cursor/rules/          # Cursor IDE rules
```

## Key Features

- **AI-Powered Roadmaps**: OpenAI generates structured learning paths
- **Dynamic Content**: Real-time API integration for videos and articles
- **Visual Learning**: Interactive diagrams and skill trees
- **Progress Tracking**: Milestone completion and achievement badges
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Screen reader support, keyboard navigation
- **Performance**: Optimized images, lazy loading, code splitting

## Development Standards

- **Code Style**: TypeScript strict mode, ESLint rules
- **Component Architecture**: Functional components with hooks
- **State Management**: Local state with React hooks
- **Error Handling**: Try-catch blocks, error boundaries
- **Testing**: Unit tests planned for components
- **Documentation**: Inline comments, README files
