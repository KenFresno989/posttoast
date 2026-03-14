# PostToast v1.6.0 — 8 New Cringe Signals

## Summary
Added 8 new LinkedIn cringe detection signals across Tier 1, Tier 2, and Tier 3.

## New Signals

### Tier 1 (+0.5 points)
1. **Reply Guy Energy** 🙋
   - Pattern: Sycophantic agreement posts with zero original thought
   - Examples: "This. So much this.", "Couldn't agree more", "THIS 👏 IS 👏 EVERYTHING"
   - Detection: Short post (<100 chars) + agreement phrases + tagged person OR no original thought

### Tier 2 (+0.75 points each)
2. **Stealth Flex** 💰
   - Pattern: Casually mentioning large dollar amounts, headcounts, or impressive metrics
   - Examples: "$454B market", "10M users", "205 verified decision-makers"
   - Detection: Dollar amounts > $1M, user counts > 10K with context words

3. **Research Self-Promo** 📊
   - Pattern: Framing company marketing as thought leadership
   - Examples: "our data shows", "download our whitepaper", "our research reveals"
   - Detection: First-person plural (we/our) + research keywords + often a CTA

4. **Engagement Bait Cliffhanger** 🎣
   - Pattern: Teasing a story to force engagement
   - Examples: "The answer surprised me...", "Here's what happened next"
   - Detection: Classic BuzzFeed-style cliffhanger phrases

5. **Recruiter Cringe** 📢
   - Pattern: Over-the-top language about roles or company culture
   - Examples: "We're building a FAMILY", "Looking for ROCKSTARS", "unicorn opportunity"
   - Detection: Recruiting language + cringe modifiers

6. **Fake Vulnerability** 🛡️
   - Pattern: Prefacing universally agreeable takes with "unpopular opinion"
   - Examples: "Unpopular opinion: be kind to people"
   - Detection: Vulnerability framing + universally agreeable statement

### Tier 3 (+1.0 points each)
7. **Poverty Cosplay** 🎭
   - Pattern: Wealthy people pretending to be humble about material things
   - Examples: "I drove a used Honda to my board meeting" (from a CEO)
   - Detection: Humility about material things + success/wealth signals in same post

8. **LinkedIn as Therapy** 🛋️
   - Pattern: Oversharing personal trauma for professional engagement
   - Examples: "My marriage fell apart and here's what it taught me about leadership"
   - Detection: Deeply personal trauma keywords + business pivot keywords

## Technical Changes
- Added 8 new detector methods to `src/signals.js`
- Added corresponding metadata entries to `src/rubric.js`
- Updated `analyzeAll()` method to call all new detectors
- Rebuilt bundle: `src/posttoast-bundle.js`
- Updated version in `manifest.json` to **1.6.0**

## Testing
- ✅ All 105 tests passing
- ✅ Syntax validated with `node -c`
- ✅ Bundle rebuilt successfully

## Regex Safety
All patterns designed to avoid catastrophic backtracking:
- Used bounded quantifiers (e.g., `.{0,40}` instead of `.*`)
- Avoided nested quantifiers
- Tested mentally against edge cases
- False positives minimized

## Files Modified
- `src/signals.js` — Added 8 new detector methods
- `src/rubric.js` — Added 8 new metadata entries
- `src/posttoast-bundle.js` — Rebuilt bundle
- `manifest.json` — Version bumped to 1.6.0
