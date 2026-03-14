# PostToast v1.5.0 - Verification Checklist

## ✅ Code Changes

- [x] Added `span[dir="ltr"]` as universal TEXT_SELECTOR
- [x] Relaxed hashed-class fallback container filter (0.9 → 1.0)
- [x] Added engagement button validation to dataAttr layer
- [x] Removed diagnostic console.warn lines from extractor.js
- [x] Removed premature markScored from badge.js
- [x] Removed diagnostic console.warn lines from badge.js
- [x] Updated manifest.json to version 1.5.0

## ✅ Build & Tests

- [x] Bundle rebuilt successfully
- [x] Syntax validation passed (`node -c src/posttoast-bundle.js`)
- [x] All 105 tests passing (`node tests/run-tests.js`)

## ✅ Test Assets Created

- [x] `tests/mock-linkedin-standard.html` - Standard DOM variant
- [x] `tests/mock-linkedin-hashed.html` - Hashed-class DOM variant
- [x] Both pages have 5 posts with varying cringe levels
- [x] Both pages include realistic engagement buttons
- [x] Hashed page has NO data-urn, NO standard classes

## 📋 Manual Testing Steps

1. **Load the extension:**
   ```
   Chrome → Extensions → Developer mode ON → Load unpacked
   Select: ~/posttoast
   ```

2. **Test standard DOM:**
   - Open `file:///home/openclaw/posttoast/tests/mock-linkedin-standard.html`
   - Verify all 5 posts get badges
   - Check browser console: should see "Found X posts via urn:..." or similar
   - Click badges to verify breakdown modal

3. **Test hashed-class DOM:**
   - Open `file:///home/openclaw/posttoast/tests/mock-linkedin-hashed.html`
   - Verify all 5 posts get badges
   - Check browser console: should see "Found X posts via dataAttr:..."
   - Click badges to verify breakdown modal

4. **Test on live LinkedIn:**
   - Navigate to https://www.linkedin.com/feed/
   - Verify posts are being scored
   - Check which strategy is being used (console log)
   - Scroll to load more posts, verify new posts get scored

## 🐛 What To Look For

### Success Indicators
- All posts on both mock pages get badges
- No console errors
- Badges appear in correct position (next to author name/header)
- Clicking badges shows breakdown modal
- Scores match expected cringe levels

### Failure Indicators
- Posts found but not scored (check console for errors)
- Text extraction returns empty strings
- Engagement button validation failing
- Badges not appearing
- Infinite scoring loops (same post scored multiple times)

## 🔍 Debugging

If posts are found but not scored on hashed-class DOM:

1. **Check console logs:**
   ```
   [PostToast Extractor] Found X posts via dataAttr:...
   ```
   Should see this for hashed-class DOM

2. **Inspect a post element:**
   ```javascript
   // In browser console on mock-linkedin-hashed.html
   const post = document.querySelector('[data-view-tracking-scope]');
   console.log('Text length:', PostToastExtractor.extractText(post).length);
   console.log('Buttons:', post.querySelectorAll('button, [role="button"]').length);
   ```

3. **Verify selectors work:**
   ```javascript
   // Should find posts
   document.querySelectorAll('div[data-view-tracking-scope][data-display-contents="true"]').length
   
   // Should extract text
   const post = document.querySelector('[data-view-tracking-scope]');
   post.querySelectorAll('span[dir="ltr"]').length > 0
   ```

## 📦 Ready for Release

- [x] Version bumped to 1.5.0
- [x] All tests passing
- [x] Bundle rebuilt with fixes
- [x] Mock test pages created
- [x] Changelog documented
- [x] No diagnostic logs in production code

## 🚀 Next Steps

1. Manual test both mock pages in browser
2. Test on live LinkedIn (both DOM variants if possible)
3. If all tests pass → submit to Chrome Web Store
4. Monitor user reports for any edge cases
