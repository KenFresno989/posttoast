# PostToast v1.5.0 Release Notes

## 🎯 Critical Bug Fix: Hashed-Class DOM Support

**Problem:** LinkedIn rolled out a hashed-class DOM variant to ~44% of users, breaking PostToast scoring.

**Solution:** Enhanced text extraction and post detection to handle both DOM variants seamlessly.

## 🔧 What Changed

### Text Extraction Enhanced
- Added `span[dir="ltr"]` as universal fallback selector (works in both DOM variants)
- Relaxed container filter for hashed-class posts (was too conservative)
- Smarter fallback logic that adapts to post structure

### Post Detection Improved  
- dataAttr layer now validates engagement buttons exist
- Filters out non-post elements (composer, sort bar, dividers)
- Prevents false positives from tracking divs

### Scoring Logic Fixed
- Removed premature "scored" marking that prevented retries
- Cleaner production code (no diagnostic logging)
- More reliable badge injection

## ✅ Testing

- **All 105 automated tests pass**
- **Bundle syntax validated**
- **Two mock HTML pages created for manual testing:**
  - `tests/mock-linkedin-standard.html` - Standard DOM
  - `tests/mock-linkedin-hashed.html` - Hashed-class DOM

## 📊 Expected Impact

- Should fix scoring for 44% of users experiencing the hashed-class DOM
- No impact on users with standard DOM (backward compatible)
- More resilient to future LinkedIn UI changes

## 🚀 Deployment Checklist

Before submitting to Chrome Web Store:

1. Load extension in Chrome Developer mode
2. Test both mock HTML pages - verify all 5 posts get scored
3. Test on live LinkedIn feed - verify posts score correctly
4. Check browser console for errors
5. Verify badges appear correctly and breakdown modal works

See `VERIFICATION.md` for detailed testing steps.

## 📝 Files Modified

- `src/extractor.js` - Enhanced text extraction and post detection
- `src/badge.js` - Fixed scoring logic and removed diagnostics
- `manifest.json` - Version bump to 1.5.0
- `src/posttoast-bundle.js` - Rebuilt with all changes

## 📚 Documentation Added

- `CHANGELOG-1.5.0.md` - Detailed change log
- `VERIFICATION.md` - Testing checklist and debugging guide
- `tests/mock-linkedin-standard.html` - Standard DOM test page
- `tests/mock-linkedin-hashed.html` - Hashed-class DOM test page

---

**Ready for manual testing and Chrome Web Store submission.**
