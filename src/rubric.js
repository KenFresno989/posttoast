// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast Scoring Rubric
 * Weights and thresholds for all cringe signals.
 * Tunable — adjust these to calibrate the scoring engine.
 */
const PostToastRubric = {
  // Score labels for each whole number
  labels: {
    0: 'Genuine Human',
    1: 'Mostly Clean',
    2: 'Slight Whiff',
    3: 'Getting Warm',
    4: 'Corporate Smell',
    5: 'Half Bullshit',
    6: 'Mostly Theater',
    7: 'Full Cringe',
    8: 'Peak LinkedIn',
    9: 'Weapons-Grade',
    10: 'Pure Uncut BS'
  },

  getLabel(score) {
    return this.labels[Math.min(10, Math.floor(score))] || 'Off the Charts';
  },

  // Tier 1: Heavy Hitters
  tier1: {
    fabricatedParable: { points: 2.5, icon: '📖', label: 'Fabricated Parable' },
    firingGenre: { points: 2.0, icon: '🔥', label: 'The Firing Genre' },
    privilegeVulnerability: { points: 2.0, icon: '😢', label: 'Crying in My Tesla' },
    stolenValor: { points: 2.0, icon: '🎭', label: 'Stolen Valor Story' }
  },

  // Tier 2: Core Cringe
  tier2: {
    humbleBrag: { points: 2.0, icon: '🙏', label: 'Humble Brag' },
    thoughtLeader: { points: 1.75, icon: '🎪', label: 'Thought Leader Cosplay' },
    engagementBait: { points: 1.5, icon: '🎣', label: 'Agreephishing' },
    toxicPositivity: { points: 1.5, icon: '🌈', label: 'Toxic Positivity' },
    nameDrop: { points: 1.0, icon: '📛', label: 'Name Dropping' },
    selflessHiring: { points: 1.25, icon: '🦸', label: 'Selfless Hiring Post' },
    garySpeech: { points: 1.0, icon: '🎤', label: 'Hustle Porn' },
    humblebait: { points: 1.0, icon: '🪤', label: 'Humblebait' },
    gratitudeTheater: { points: 1.0, icon: '🎭', label: 'Gratitude Theater' },
    traumaFlex: { points: 1.5, icon: '💪', label: 'Trauma Flexing' },
    echoChamber: { points: 1.0, icon: '🔄', label: 'Echo Chamber' },
    pivotBrag: { points: 1.25, icon: '🏃', label: 'The Pivot Brag' },
    empathyCosplay: { points: 1.5, icon: '🥺', label: 'Empathy Cosplay' },
    linkedInfluencer: { points: 1.0, icon: '👻', label: 'LinkedInfluencer' }
  },

  // Tier 3: Seasoning
  tier3: {
    emojiAbuse: { points: 0.75, icon: '😬', label: 'Emoji Abuse' },
    broetry: { points: 1.5, icon: '📝', label: 'Broetry' },
    corporateJargon: { points: 1.0, icon: '💼', label: 'Corporate Jargon' },
    narcissismIndex: { points: 1.0, icon: '🪞', label: 'Narcissism Index' },
    dramaticBreaks: { points: 0.75, icon: '⏸️', label: 'Dramatic Line Breaks' },
    hashtagSpam: { points: 0.75, icon: '#️⃣', label: 'Hashtag Spam' },
    corporateHaiku: { points: 0.75, icon: '🏯', label: 'Corporate Haiku' },
    selfiSermon: { points: 0.5, icon: '🤳', label: 'Selfie Sermon' },
    recruiterBait: { points: 0.5, icon: '🎯', label: 'Recruiter Bait' }
  },

  // Roast headlines per score bracket
  roastHeadlines: {
    0: 'Disgustingly authentic',
    1: 'Barely toasted. Almost sincere.',
    2: 'Minor seasoning detected',
    3: 'The LinkedIn is starting to show',
    4: 'Corporate smell is getting strong',
    5: 'The LinkedIn is strong with this one',
    6: 'Corporate cringe with a side of hustle',
    7: 'Screenshot this for the group chat',
    8: 'Weapons-grade thought leadership',
    9: 'Gary Vee would be proud',
    10: 'The final boss of LinkedIn'
  },

  getRoastHeadline(score) {
    return this.roastHeadlines[Math.min(10, Math.floor(score))] || 'Off the charts';
  },

  // Negative signals (reduce score)
  negative: {
    hasLinks: { points: -1.0, icon: '🔗', label: 'Shares Resources' },
    hasCode: { points: -2.0, icon: '💻', label: 'Technical Content' },
    shortFactual: { points: -2.0, icon: '📌', label: 'Short & Factual' },
    sharesOthers: { points: -1.0, icon: '🤝', label: 'Celebrates Others' }
  },

  // Compound multiplier: when 3+ Tier 2 signals stack
  compoundThreshold: 2,
  compoundMultiplier: 1.3,

  // Thresholds
  thresholds: {
    emojiDensity: 0.015,      // emojis per character (loosened)
    narcissismDensity: 0.04,  // I/me/my per word (loosened)
    broetryRatio: 0.45,       // % of paragraphs that are single sentences (loosened)
    hashtagCount: 2,          // hashtags to trigger (was 3)
    shortPostLength: 100,     // chars for "short factual"
    jargonCount: 2            // jargon words to trigger (was 3)
  }
};
