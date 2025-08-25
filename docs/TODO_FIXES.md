# TODO: Critical Fixes Needed

## 🚨 URGENT ISSUES TO FIX TOMORROW

### 1. Google Custom Search API Implementation ✅

- **Status**: IMPLEMENTED & HOOKED UP - Now using Google Custom Search for learning diagrams
- **Features**: Targets educational AND practical skill sites (Khan Academy, WikiHow, Instructables, etc.)
- **Coverage**: Academic topics + practical skills (juggling, cooking, crafts, etc.)
- **Safeguards**: Only 1 result per search, clear quota warnings
- **Cost**: 100 free queries/day - use sparingly!
- **Files**:

  - `src/app/api/search-image/route.ts` - API endpoint ✅

  - `src/app/roadmap/[topic]/page.tsx` - Integrated into roadmap page ✅

### 2. YouTube Videos Duplication

- **Issue**: OpenAI is returning the same YouTube videos sometimes
- **Expected**: Unique, high-quality videos for each topic
- **Current**: Duplicate video links appearing
- **Files to check**: `src/app/api/generate-roadmap/route.ts` (YouTube API integration)

### 3. AI Customization Not Working

- **Issue**: No custom fonts or colors being applied
- **Expected**: AI-driven styling based on topic (fonts, colors, icons)
- **Current**: Default styling only
- **Files to check**: `src/lib/font-utils.ts`, `src/app/api/generate-roadmap/route.ts`

### 4. AI Content Not Updating

- **Issue**: Quotes and success stories showing default values
- **Expected**: AI-generated personalized content
- **Current**: Generic fallback content
- **Files to check**: `src/app/roadmap/[topic]/page.tsx`, `src/app/api/generate-roadmap/route.ts`

### 5. Reddit Communities Not Dynamic

- **Issue**: Reddit communities showing default/general ones only
- **Expected**: Topic-specific communities (e.g., r/learnjavascript for JavaScript)
- **Current**: Generic communities like r/GetMotivated
- **Files to check**: `src/lib/community-resources.ts`, `src/app/roadmap/[topic]/page.tsx`

## 📊 COST ANALYSIS NEEDED TOMORROW

### Calculate Current Costs Per Request:

1. **OpenAI API**:

   - Current max_tokens: UNLIMITED (removed token limit)
   - Model: GPT-4o-mini (updated from GPT-4)
   - Cost per 1K tokens: ~$0.0006 (output)
   - Estimated per request: $0.01-0.05 (varies by response length)

2. **YouTube Data API**:

   - Free tier: 10K requests/day
   - Current usage: Check Google Cloud Console

3. **Tavily Search API**:

   - Free tier: 1K searches/month
   - Current usage: Check Tavily Dashboard

4. **Google Custom Search API**:
   - **Free tier**: 100 queries/day - use sparingly!
   - **Targets**: Educational sites (Khan Academy, Coursera, MIT, etc.)
   - **Quality**: Real educational diagrams and infographics
   - **Status**: ✅ IMPLEMENTED - Ready for testing

### Limits to Check:

- Daily/monthly quotas for each API
- Rate limiting (requests per second)
- Cost thresholds and alerts

## 🔧 TECHNICAL INVESTIGATION NEEDED

### Debug Steps:

1. **Check API calls in browser console** - see which APIs are actually being called
2. **Verify environment variables** - ensure all API keys are properly set
3. **Test individual API endpoints** - isolate which ones are failing
4. **Check AI prompt responses** - verify OpenAI is returning expected JSON structure
5. **Monitor network requests** - see if image search API is being called

### Files to Review:

- `src/app/api/generate-roadmap/route.ts` - Main API integration
- `src/app/api/search-image/route.ts` - Image search API
- `src/lib/font-utils.ts` - Customization utilities
- `src/lib/community-resources.ts` - Community links
- `src/app/roadmap/[topic]/page.tsx` - Frontend display logic

## 🎯 PRIORITY ORDER:

1. **Fix Unsplash API integration** (most visible issue)
2. **Fix AI customization** (fonts/colors)
3. **Fix YouTube video duplication**
4. **Fix AI content generation** (quotes, success stories)
5. **Fix Reddit communities**
6. **Calculate costs and limits**

---

**Note**: All these issues suggest the AI integration might not be working properly or the API responses aren't being processed correctly. Need to debug the entire AI pipeline.
