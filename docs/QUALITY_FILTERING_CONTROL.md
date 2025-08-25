# Quality Filtering Control

## Quick Disable for Testing

To disable all quality filtering and return all videos/articles without any scoring or filtering:

### For YouTube Videos:

1. Open `src/lib/services/youtube/youtube-service.ts`
2. Find line with `const ENABLE_QUALITY_FILTERING = true;`
3. Change to `const ENABLE_QUALITY_FILTERING = false;`

### For Articles:

1. Open `src/lib/services/articles/article-service.ts`
2. Find line with `const ENABLE_QUALITY_FILTERING = true;`
3. Change to `const ENABLE_QUALITY_FILTERING = false;`

## What This Does

When `ENABLE_QUALITY_FILTERING = false`:

### YouTube Service:

- ✅ Returns ALL videos found by API
- ✅ No quality score filtering
- ✅ No view count filtering
- ✅ No age filtering
- ✅ No channel authority filtering
- ✅ No duration filtering
- ✅ No captions requirement

### Article Service:

- ✅ Returns ALL articles found by API
- ✅ No quality score filtering
- ✅ No authority score filtering
- ✅ No domain filtering
- ✅ No age filtering
- ✅ No author requirement

## Quality Thresholds (When Enabled)

### YouTube:

- `minQualityScore: 30` - Minimum quality score (0-100)
- `minViewCount: 100` - Minimum view count
- `maxAgeInDays: 1825` - Maximum age (5 years)
- `requireCaptions: false` - Captions optional
- `maxResults: 10` - Maximum results

### Articles:

- `minQualityScore: 30` - Minimum quality score (0-100)
- `minAuthorityScore: 20` - Minimum authority score (0-100)
- `maxAgeInDays: 1095` - Maximum age (3 years)
- `maxResults: 10` - Maximum results
- `requireAuthor: false` - Author optional

## Testing Workflow

1. **Disable filtering**: Set both services to `false`
2. **Test API calls**: Generate a roadmap to see if videos/articles load
3. **Check results**: Look for actual content vs error messages
4. **Re-enable**: Set back to `true` once you confirm APIs work
5. **Adjust thresholds**: Modify `QUALITY_CONFIG` values if needed

## ✅ Test Results

**Status**: Quality filtering has been optimized and adaptive filtering implemented.

**What was tested and implemented**:

- ✅ YouTube service: Quality filtering optimized with adaptive thresholds
- ✅ Article service: Quality filtering optimized with adaptive thresholds
- ✅ Adaptive threshold system: Automatically adjusts based on content availability
- ✅ Build process completes successfully with optimized settings
- ✅ API endpoints respond correctly with adaptive filtering

**Current Status**: Both services have optimized quality thresholds and adaptive filtering enabled.

## 🎯 Quality Tuning Results

### **Optimized Thresholds:**

- **YouTube**: `minQualityScore: 15` (down from 30), `minViewCount: 50` (down from 100), `maxAgeInDays: 3650` (up from 1825)
- **Articles**: `minQualityScore: 15` (down from 30), `minAuthorityScore: 10` (down from 20), `maxAgeInDays: 1825` (up from 1095)

### **Adaptive Filtering:**

- **Sufficient Content**: Uses original thresholds
- **Moderate Content**: Reduces thresholds by 30-50%
- **Limited Content**: Reduces thresholds by 50-70% and doubles age limits
- **Monitoring**: Logs adaptive threshold adjustments for transparency

## Debugging

When quality filtering is disabled, you'll see these console messages:

- YouTube: `"Quality filtering disabled - returning all videos without filtering"`
- Articles: `"Quality filtering disabled - returning all articles without filtering"`

This helps confirm the setting is working correctly.
