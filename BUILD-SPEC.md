# LinkedIn Bullshit Detector — Build Spec

## What It Is
Chrome extension that scores LinkedIn posts 0-10 on a bullshit/cringe scale. Inline badge on every post. Click for breakdown. Share-worthy screenshots.

## Scoring Scale (The BS Meter)

| Score | Label | Meaning |
|-------|-------|---------|
| 0 | Genuine Human | Authentic, useful, no performance |
| 1 | Mostly Clean | Minor corporate-speak but real content |
| 2 | Slight Whiff | A touch of self-promotion, forgivable |
| 3 | Getting Warm | Noticeable humble brag or engagement bait |
| 4 | Corporate Smell | Jargon-heavy, clearly performing for the feed |
| 5 | Half Bullshit | Equal parts substance and theater |
| 6 | Mostly Theater | More performance than content |
| 7 | Full Cringe | Textbook LinkedIn cringe, multiple signals stacking |
| 8 | Peak LinkedIn | This is what people screenshot for Reddit |
| 9 | Weapons-Grade | Fabricated parables, toxic positivity overload |
| 10 | Pure Uncut BS | The platonic ideal of LinkedIn garbage |

Quarter/half points for nuance (e.g., 7.25, 8.5).

## Cringe Signals (Heuristic Engine)

### Tier 1: Heavy Hitters (+2-3 points each)
- **Fabricated Parables** — "A homeless man taught me about leadership..." (story arc: hardship → epiphany → humble lesson)
- **The Firing Genre** — "I fired my top performer and here's why..."
- **Crying in My Tesla** — Fake vulnerability from a position of obvious privilege
- **Stolen Valor** — Generic inspirational story repackaged as personal experience

### Tier 2: Core Cringe (+1-1.5 points each)
- **Humble Brag** — "I'm SO humbled to announce..." / "I never expected this..."
- **Thought Leader Cosplay** — "Here's what nobody tells you about..." / "Unpopular opinion:"
- **Engagement Bait** — "Agree? 👇" / "Thoughts?" / "Repost if you believe in..."
- **Toxic Positivity** — "Every rejection is a redirection" / "Grateful for the struggle"
- **Name Dropping** — Mentioning famous people/companies to borrow credibility
- **The Selfless Hiring Post** — "I hired someone everyone else rejected..."

### Tier 3: Seasoning (+0.25-0.75 points each)
- **Emoji Abuse** — 🚀💡🎯🙏 density above threshold
- **Broetry** — Single. Sentence. Paragraphs. For. Drama.
- **Corporate Jargon** — "leverage", "synergy", "disruptor", "ecosystem", "value-add"
- **Narcissism Index** — "I/me/my" density above threshold
- **Dramatic Line Breaks** — Excessive whitespace for fake suspense
- **Hashtag Spam** — #Leadership #Mindset #Hustle #GrindNeverStops

### Negative Signals (reduce score)
- Contains actual links to resources: -1
- Technical/educational content with code: -2
- Short factual post (<100 chars): -2
- Sharing someone else's achievement without centering self: -1

### Compound Multiplier
When 3+ Tier 2 signals stack in one post: multiply total by 1.25

## Architecture

```
linkedin-bs-detector/
├── manifest.json              # MV3, permissions: linkedin.com only
├── src/
│   ├── content.js             # Main content script entry
│   ├── observer.js            # MutationObserver for infinite scroll
│   ├── extractor.js           # Post text extraction from DOM
│   ├── scorer.js              # Heuristic scoring engine
│   ├── signals.js             # Signal detection (patterns, regex, structural)
│   ├── rubric.js              # Weights & thresholds (tunable)
│   ├── badge.js               # Badge UI injection into posts
│   ├── breakdown.js           # Click-to-expand score breakdown
│   ├── share.js               # Generate shareable score card
│   └── styles.css             # All injected styles
├── popup/
│   ├── popup.html             # Settings: toggle, sensitivity
│   ├── popup.js
│   └── popup.css
├── background.js              # Service worker (minimal for MVP)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── selectors.json             # LinkedIn DOM selectors (externalized for updates)
```

## DOM Strategy
- Primary: `[data-urn^="urn:li:activity"]` (most stable)
- Fallback: `.feed-shared-update-v2`
- Post text: `.feed-shared-text span[dir="ltr"]`
- MutationObserver on feed container for infinite scroll
- IntersectionObserver for performance (only score visible posts)
- Cache scores by post URN in a Map

## Badge UI
- Small pill badge top-right of each post: "🐂 7.5"
- Color: 0-3 green (#22c55e), 4-6 amber (#eab308), 7-10 red (#ef4444)
- Click → expand breakdown panel showing detected signals
- Each signal shows: icon + label + points (e.g., "🎭 Humble Brag +1.5")
- Breakdown tone: clinical with dry humor

## Share Feature (v1.1, not MVP blocker)
- "Share Score" button in breakdown panel
- Generates a card image: post preview + score + signal breakdown
- Copy to clipboard for Twitter/Reddit posting

## MVP Scope (v1.0)
- [x] Content script detecting LinkedIn posts
- [x] Heuristic scoring engine with all 3 tiers
- [x] Inline badge on each post
- [x] Click for signal breakdown
- [x] Popup with on/off toggle
- [ ] NOT: share cards, leaderboards, LLM scoring, accounts, Firefox

## Tech Stack
- Vanilla JS (no framework, keep it tiny)
- No build step for MVP (or esbuild if we want TS)
- chrome.storage.sync for settings
- No external API calls (100% local for MVP)
- No backend, no server, no database

## Monetization (v2, after traction)
- Free: badge + top 3 signals (50 posts/day)
- Pro $3.99/mo: full breakdown, unlimited, "Score My Draft" feature, share cards
- "Score My Draft" is the killer premium feature: paste your own post, see the score BEFORE you post it

## Launch Strategy
- r/LinkedInLunatics (800K+ members) — this is THE audience
- Twitter/X — screenshot scores of terrible posts
- ProductHunt — "We built a Michelin guide for LinkedIn bullshit"
- The extension markets itself: every screenshot with a badge is an ad

## Risk Mitigation
- LinkedIn DOM changes: externalized selectors, cascading fallback strategy
- Chrome Web Store: no data collection, no external calls, clean permissions
- "Is this mean?": scores the POST, not the person. Breakdown is analytical, not personal attacks. No public shaming features.
