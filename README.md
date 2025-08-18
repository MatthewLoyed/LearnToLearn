# Skill Forge 🚀

**Learn anything, faster** - Generate personalized learning roadmaps powered by AI. Master any skill with structured paths, curated resources, and smart progress tracking.

## ✨ Features

- **AI-Powered Roadmaps**: Generate personalized learning paths for any topic
- **Curated Resources**: Access hand-picked videos, articles, and tutorials
- **Progress Tracking**: Visualize your learning journey with interactive milestones
- **Smart Recommendations**: Get AI-powered study prompts and insights
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Real-time Search**: Find relevant YouTube videos and articles instantly

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS + Custom Design System
- **Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts (for future progress visualization)
- **Icons**: Lucide React

### Backend

- **API Routes**: Next.js API routes for server-side logic
- **AI Integration**: OpenAI API (placeholder)
- **Video Search**: YouTube API (placeholder)
- **Article Search**: Tavily/Google Search API (placeholder)

### Database (Future)

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

### Deployment

- **Platform**: Vercel (recommended)

## 📊 Usage Tracking

### Monitor Your API Usage

Keep track of your costs and usage with these dashboards:

- **[OpenAI Usage Dashboard](https://platform.openai.com/settings/organization/usage)** - Track token usage, costs, and rate limits
- **[Google Cloud Console](https://console.cloud.google.com/apis/dashboard?inv=1&invt=Ab5x-g&project=zeta-crossbar-469405-v7)** - Monitor YouTube API quota and metrics
- **[Tavily Dashboard](https://app.tavily.com/home)** - Monitor search quota and API metrics

### Cost Estimates

- **OpenAI**: ~$0.03 per roadmap (1K tokens)
- **YouTube API**: FREE (10K requests/day)
- **$5 credit**: ≈ 150 AI-generated roadmaps

### Credit Protection

- AI is **disabled by default** - no accidental charges
- **Manual activation required** - toggle on landing page
- **Visual indicators** - clear status display
- **Curated fallback** - free content for common topics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd LearnToLearn
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your API keys to `.env.local`:

   ```env
   # OpenAI API (for roadmap generation)
   OPENAI_API_KEY=your_openai_api_key_here

   # YouTube API (for video search)
   YOUTUBE_API_KEY=your_youtube_api_key_here

   # Tavily API (for article search)
   TAVILY_API_KEY=your_tavily_api_key_here

   # Supabase (for future database integration)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
LearnToLearn/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── generate-roadmap/   # AI roadmap generation
│   │   │   ├── search-youtube/     # YouTube video search
│   │   │   └── search-articles/    # Article search
│   │   ├── roadmap/[topic]/        # Dynamic roadmap pages
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   └── ...                     # Feature components
│   └── lib/
│       └── utils.ts                # Utility functions
├── public/                         # Static assets
├── tailwind.config.ts              # Tailwind configuration
└── package.json
```

## 🎨 Design System

The project uses a custom design system based on the `.superdesign` files:

- **Colors**: OKLCH color space for better color reproduction
- **Typography**: Inter + Space Grotesk fonts
- **Spacing**: Consistent spacing scale
- **Shadows**: Custom shadow system
- **Animations**: Smooth transitions and micro-interactions

### Key Design Tokens

- Primary: `oklch(0.3500 0.0800 45.0000)`
- Accent: `oklch(0.7000 0.1500 65.0000)`
- Border Radius: `0.75rem`
- Font Family: Inter, Space Grotesk

## 🔌 API Integration

### Current Status

The app currently uses mock data for demonstration. To enable real API integration:

1. **OpenAI API** (`/api/generate-roadmap`)

   - Replace mock response with actual OpenAI API call
   - Use GPT-4 for generating structured learning roadmaps

2. **YouTube API** (`/api/search-youtube`)

   - Replace mock videos with YouTube Data API v3
   - Search for educational content related to topics

3. **Tavily/Google Search** (`/api/search-articles`)
   - Replace mock articles with web search API
   - Find relevant tutorials and documentation

### Example API Integration

```typescript
// OpenAI API integration example
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert learning path designer...",
      },
      {
        role: "user",
        content: `Create a learning roadmap for ${topic}...`,
      },
    ],
  }),
});
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically detect Next.js

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔮 Future Features

- [ ] **User Authentication** with Supabase Auth
- [ ] **Progress Tracking** with charts and analytics
- [ ] **Community Features** - share and discover roadmaps
- [ ] **Offline Support** with service workers
- [ ] **Mobile App** with React Native
- [ ] **AI Study Assistant** for personalized help
- [ ] **Integration APIs** for learning platforms
- [ ] **Gamification** with badges and achievements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern learning platforms
- UI components from shadcn/ui
- Icons from Lucide React
- Animation library Framer Motion

---

**Built with ❤️ for learners everywhere**
