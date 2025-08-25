# AI Credits Protection Guide

## Overview

This guide explains how the AI credit protection system works to prevent accidental usage of your OpenAI credits.

## How It Works

### Default State: SAFE

- **AI is DISABLED by default** - no credits will be used
- **Curated roadmaps only** - uses pre-built content for common topics
- **No API calls** - completely free to use

### Manual Activation Required

- **Toggle on landing page** - user must explicitly enable AI
- **URL parameter** - `?ai=true` must be present
- **Visual confirmation** - clear indicators show AI status

### Safety Features

1. **Visual Toggle** - Clear on/off switch on landing page
2. **Status Indicator** - Shows AI enabled/disabled in roadmap header
3. **Warning Messages** - Explains when credits will be used
4. **Default Safe** - AI starts disabled, user must opt-in
5. **URL Parameter** - AI only enabled with explicit `?ai=true`

## Environment Variables

### Required Setup

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
ENABLE_OPENAI=false  # Safety switch - keep false unless needed
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Cost Control

- **OpenAI**: ~$0.03 per roadmap (1K tokens)
- **YouTube API**: FREE (10K requests/day)
- **Tavily API**: FREE (1K searches/month)
- **Estimated cost**: $5 credit = ~150 roadmaps

## Testing Strategy

### Free Testing (No Credits Used)

- Search for: "React", "Python", "JavaScript"
- These use curated roadmaps
- Perfect for UI/UX testing

### AI Testing (Uses Credits)

- Search for: "Machine Learning", "Digital Marketing", etc.
- Only when AI toggle is ON
- Use sparingly for testing

## Production Readiness

### Before Going Live

1. Set `ENABLE_OPENAI=false` in production
2. Test with curated roadmaps only
3. Monitor usage with tracking links below
4. Enable AI only when ready

---

## 📊 Usage Tracking Links

### OpenAI Usage Dashboard

**Track your OpenAI API usage and costs:**

- [OpenAI Usage Dashboard](https://platform.openai.com/settings/organization/usage)
- Monitor token usage, costs, and rate limits
- Set up billing alerts and usage limits

### Google Cloud Console

**Track your YouTube Data API usage:**

- [Google Cloud Console](https://console.cloud.google.com/apis/dashboard?inv=1&invt=Ab5x-g&project=zeta-crossbar-469405-v7)
- Monitor YouTube API quota usage
- View API metrics and error rates

### Tavily Dashboard

**Track your Tavily Search API usage:**

- [Tavily Dashboard](https://app.tavily.com/home)
- Monitor search quota usage
- View API metrics and search history

### Image Search APIs (Optional)

**For AI-curated custom visuals:**

- **Unsplash**: [Unsplash Applications](https://unsplash.com/oauth/applications) (Free: 50 requests/hour)
- **Pixabay**: [Pixabay API Docs](https://pixabay.com/api/docs/) (Free: 5,000 requests/hour)
- Monitor image search usage and quality
- Display actual images instead of placeholders

### Cost Monitoring Tips

1. **Check daily** - Monitor usage patterns
2. **Set alerts** - Configure billing notifications
3. **Track per roadmap** - ~1K tokens per AI-generated roadmap
4. **YouTube API** - 10K free requests/day (usually sufficient)

### Usage Estimates

- **OpenAI**: $5 credit ≈ 150 roadmaps
- **YouTube API**: FREE tier covers most usage
- **Tavily API**: FREE tier covers most usage
- **Image Search APIs**: FREE tier covers most usage
- **Total cost**: ~$0.03 per AI-generated roadmap (no additional cost for images)

---

## Troubleshooting

### Common Issues

1. **"AI not enabled" message** - Normal, using curated content
2. **No videos found** - YouTube API key missing or quota exceeded
3. **Invalid API key** - Check environment variables

### Debug Steps

1. Check browser console for error messages
2. Verify API keys in `.env.local`
3. Test with curated topics first
4. Monitor usage with tracking links above

## Best Practices

### Development

- Use curated roadmaps for testing
- Enable AI only when needed
- Monitor usage regularly

### Production

- Start with AI disabled
- Enable gradually based on demand
- Set up usage alerts
- Monitor costs with tracking links

---

**Remember: Your credits are protected by default. AI will only be used when you explicitly enable it!**
