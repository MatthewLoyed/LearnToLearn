# 🤖 AI Integration Setup Guide

## Quick Start (5 minutes)

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account/login
3. Generate new API key
4. Copy the key

### 2. Set Up Environment

1. Copy `env.example` to `.env.local`
2. Replace `your_openai_api_key_here` with your actual key
3. Restart your dev server

### 3. Test AI Integration

1. Go to your app
2. Enter any topic (e.g., "React", "Python", "Machine Learning")
3. Check if AI generates a roadmap

## What You Get

✅ **Working AI Integration** - Real roadmap generation
✅ **Fallback System** - Works even if AI fails
✅ **Error Handling** - Graceful degradation
✅ **Type Safety** - Full TypeScript support

## Next Steps (Optional)

### YouTube Videos

- Get YouTube Data API key
- Add to `.env.local`
- Videos will be real instead of placeholders

### Articles & Resources

- Get Tavily API key
- Add to `.env.local`
- Real articles instead of examples

### User Progress

- Set up Supabase
- Add database keys
- Save user progress

## Cost Estimate

- **OpenAI GPT-4**: ~$0.03 per roadmap
- **YouTube API**: Free tier (10,000 requests/day)
- **Tavily**: Free tier (1,000 requests/month)

## Troubleshooting

**"AI service not configured"**

- Check your `.env.local` file
- Make sure `OPENAI_API_KEY` is set
- Restart dev server

**"Failed to generate roadmap"**

- Check OpenAI API key is valid
- Check your OpenAI account has credits
- Check console for detailed errors

## Why This Approach?

1. **Start Simple** - Just OpenAI first
2. **Progressive Enhancement** - Add more APIs later
3. **Fallback System** - Always works
4. **Cost Control** - You control API usage
