# PostToast v1.5.0 - Hashed-Class DOM Fix

## Problem
LinkedIn rolled out a hashed-class DOM variant affecting ~44% of users. This variant:
- Has NO `data-urn` attributes
- Has NO standard CSS classes (replaced with random hashes like `._dkFa32`)
- Posts found ONLY via `div[data-view-tracking-scope][data-display-contents="true"]`
- Text is in deeply nested divs/spans with NO recognizable classes

## Fixes Applied

### 1. Text Extraction (src/extractor.js)
**Added universal selector:**
- Added `span[dir="ltr"]` to TEXT_SELECTORS as last fallback
- This selector works in BOTH standard and hashed-class DOM

**Relaxed container filter:**
- Changed 0.9 threshold to 1.0 (100%) in hashed-class fallback
- For dataAttr-detected posts, the container IS the post, so largest text block can be 90%+ of container
- Now only rejects if text === entire container (100%)

**Removed diagnostic logging:**
- Cleaned up all `console.warn` diagnostic lines for production

### 2. Post Detection (src/extractor.js)
**Added engagement button validation:**
- dataAttr layer now validates posts have engagement buttons inside them
- Filters out non-post elements (composer, sort bar, dividers)
- Checks for Like/Comment/Share/Repost buttons via text and aria-labels

### 3. Badge Scoring (src/badge.js)
**Removed premature marking:**
- Removed `markScored()` at top of `scorePost()`
- Now only marks scored on successful injection
- Allows retry on scroll if text extraction initially fails

**Cleaned up diagnostic logging:**
- Removed all `console.warn` diagnostic lines for production

### 4. Manifest (manifest.json)
- Updated version to 1.5.0

## Testing

### Automated Tests
```bash
cd ~/posttoast
node tests/run-tests.js
```
All 105 tests pass ✓

### Manual Testing
Two mock HTML pages created for browser testing:

1. **tests/mock-linkedin-standard.html**
   - Uses real LinkedIn CSS classes
   - Has `data-urn` attributes
   - Should work with URN layer detection

2. **tests/mock-linkedin-hashed.html**
   - Uses random hashed CSS classes
   - NO `data-urn` attributes
   - Only has `data-view-tracking-scope` and `data-display-contents="true"`
   - Should work with dataAttr layer detection

**To test:**
1. Load extension in Chrome (Developer mode → Load unpacked)
2. Open each mock HTML file in a new tab
3. Verify all 5 posts get scored with badges
4. Click badges to verify breakdown modal works
5. Check browser console for errors

### Expected Scores (Both Pages)
- **Post 1** (Chad Thompson - Broetry): High cringe (8-10)
- **Post 2** (Sarah Jenkins - Humble Brag): Medium cringe (5-7)
- **Post 3** (Marcus Rodriguez - Genuine): Low cringe (0-2)
- **Post 4** (Jessica Martinez - Engagement Bait): High cringe (8-10)
- **Post 5** (Robert Chen - Corporate Jargon): Medium-high cringe (6-8)

## What Changed in the Code

### extractor.js
1. Added `span[dir="ltr"]` to TEXT_SELECTORS array
2. Relaxed hashed-class fallback filter from 0.9 to 1.0
3. Added engagement button validation to dataAttr layer
4. Removed all diagnostic console.warn lines

### badge.js
1. Removed premature `markScored()` call at top of `scorePost()`
2. Removed all diagnostic console.warn lines
3. Scoring now only marks as scored on successful injection

### manifest.json
1. Version bumped to 1.5.0

## Deployment
1. Bundle rebuilt with all changes
2. All tests passing
3. Syntax validated
4. Ready for Chrome Web Store submission
