# Skill Forge - Technical Stack

## Frontend Framework

### Core Framework

- **Next.js**: 15.4.6 with App Router
- **React**: 19.1.0
- **TypeScript**: 5.x with strict mode enabled
- **Node.js**: Latest LTS version

### Styling & UI

- **TailwindCSS**: 3.4.17 with custom design system
- **shadcn/ui**: Component library with custom enhancements
- **Framer Motion**: 12.23.12 for animations and transitions
- **Lucide React**: 0.539.0 for consistent iconography
- **Google Fonts**: Inter + Space Grotesk for typography

### State Management

- **React Hooks**: useState, useEffect for local state
- **Context API**: For global state management (planned)
- **Local Storage**: For persistent user preferences and progress

## Backend & APIs

### AI Integration

- **OpenAI GPT-4o-mini**: For intelligent roadmap generation and content customization
- **API Endpoint**: `/api/generate-roadmap`
- **Features**: Topic classification, visual customization, content personalization

### Content APIs

- **YouTube Data API v3**: Educational video content curation
  - Endpoint: `/api/search-youtube`
  - Features: Video search, duration fetching, thumbnail generation
- **Tavily Search API**: Article and tutorial content
  - Endpoint: `/api/search-articles`
  - Features: Web search, content extraction, relevance filtering
- **Google Custom Search API**: Educational diagrams and infographics
  - Endpoint: `/api/search-image`
  - Features: Image search, educational content filtering

### Database (Planned)

- **Supabase**: PostgreSQL-based backend
- **Features**: User authentication, progress storage, content management
- **Status**: Planned integration

## Development Tools

### Build & Development

- **Package Manager**: npm
- **Build Tool**: Next.js built-in bundler
- **Development Server**: Next.js dev server with Turbopack
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint with Next.js configuration

### Code Quality

- **ESLint**: 9.x with Next.js rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (via ESLint)
- **Git**: Version control with organized commit history

### Performance

- **Code Splitting**: Automatic with Next.js
- **Lazy Loading**: Component and image optimization
- **Bundle Analysis**: Next.js built-in analytics
- **Image Optimization**: Next.js Image component

## Design System

### Colors

- **Primary Palette**: Custom HSL color system
- **Semantic Colors**: Success, warning, error, info variants
- **Dark Mode**: CSS variables with automatic switching
- **Accessibility**: WCAG 2.1 AA compliant contrast ratios

### Typography

- **Primary Font**: Inter (sans-serif)
- **Secondary Font**: Space Grotesk (display)
- **Scale**: Comprehensive size system (xs to 9xl)
- **Line Heights**: Optimized for readability

### Components

- **Base Components**: shadcn/ui foundation
- **Custom Components**: Enhanced with project-specific features
- **Animation System**: Framer Motion integration
- **Responsive Design**: Mobile-first approach

## Project Structure

```
LearnToLearn/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── generate-roadmap/
│   │   │   ├── search-youtube/
│   │   │   ├── search-articles/
│   │   │   └── search-image/
│   │   ├── roadmap/[topic]/   # Dynamic roadmap pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── skill-tree.tsx
│   │   │   └── video-player.tsx
│   │   ├── ThemeToggle.tsx    # Dark mode toggle

│   ├── lib/                   # Utility functions
│   │   ├── community-resources.ts
│   │   └── font-utils.ts
│   └── styles/                # Design system
│       └── design-system.css
├── config/                    # Configuration files
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── next.config.ts
├── docs/                      # Documentation
├── tasks/                     # Project management
├── .agent-os/                 # Agent OS configuration
└── .cursor/rules/             # Cursor IDE rules
```

## API Architecture

### Roadmap Generation

```typescript
POST /api/generate-roadmap
{
  topic: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: 'flexible' | 'part-time' | 'full-time';
  aiEnabled?: boolean;
}
```

### Content Search

```typescript
POST /api/search-youtube
POST /api/search-articles
POST /api/search-image
{
  query: string;
  topic?: string;
  type?: string;
}
```

## Performance Optimizations

### Frontend

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with WebP
- **Font Loading**: Optimized Google Fonts loading
- **Bundle Size**: Tree-shaking and dead code elimination

### Backend

- **API Caching**: Intelligent caching for repeated requests
- **Rate Limiting**: API usage optimization
- **Error Handling**: Graceful degradation and fallbacks
- **Response Optimization**: Minimal payload sizes

## Security & Privacy

### API Security

- **Environment Variables**: Secure API key management
- **Rate Limiting**: Protection against abuse
- **Input Validation**: TypeScript and runtime validation
- **Error Handling**: No sensitive data exposure

### User Privacy

- **Local Storage**: User preferences stored locally
- **No Tracking**: Minimal analytics (planned)
- **Data Minimization**: Only necessary data collection
- **GDPR Compliance**: Planned for future

## Deployment & Infrastructure

### Current Setup

- **Development**: Local Next.js dev server
- **Build Process**: `npm run build`
- **Static Generation**: Next.js SSG capabilities

### Planned Deployment

- **Platform**: Vercel (recommended)
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics

## Development Workflow

### Code Standards

- **TypeScript**: Strict mode with comprehensive types
- **ESLint**: Enforced code quality rules
- **Git Workflow**: Feature branches with PR reviews
- **Testing**: Unit tests planned (Jest + React Testing Library)

### Agent OS Integration

- **Product Documentation**: Comprehensive feature tracking
- **Roadmap Management**: Phase-based development planning
- **Code Style**: Consistent patterns and conventions
- **Best Practices**: Performance and accessibility focus

## Future Technical Considerations

### Scalability

- **Database Optimization**: Indexing and query optimization
- **CDN Integration**: Global content delivery
- **API Rate Limits**: Efficient usage patterns
- **Caching Strategy**: Multi-level caching implementation

### Advanced Features

- **Real-time Updates**: WebSocket integration for live features
- **Offline Support**: Service Worker implementation
- **PWA Capabilities**: Progressive Web App features
- **Mobile App**: React Native consideration

### Monitoring & Analytics

- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error reporting
- **User Analytics**: Learning effectiveness metrics
- **A/B Testing**: Feature optimization framework
