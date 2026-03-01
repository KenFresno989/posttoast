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
    humbleBrag: { points: 1.5, icon: '🙏', label: 'Humble Brag' },
    thoughtLeader: { points: 1.25, icon: '🎪', label: 'Thought Leader Cosplay' },
    engagementBait: { points: 1.0, icon: '🎣', label: 'Engagement Bait' },
    toxicPositivity: { points: 1.0, icon: '🌈', label: 'Toxic Positivity' },
    nameDrop: { points: 1.0, icon: '📛', label: 'Name Dropping' },
    selflessHiring: { points: 1.25, icon: '🦸', label: 'Selfless Hiring Post' },
    garySpeech: { points: 1.0, icon: '🎤', label: 'Motivational Speech' }
  },

  // Tier 3: Seasoning
  tier3: {
    emojiAbuse: { points: 0.75, icon: '😬', label: 'Emoji Abuse' },
    broetry: { points: 1.0, icon: '📝', label: 'Broetry' },
    corporateJargon: { points: 0.75, icon: '💼', label: 'Corporate Jargon' },
    narcissismIndex: { points: 0.75, icon: '🪞', label: 'Narcissism Index' },
    dramaticBreaks: { points: 0.5, icon: '⏸️', label: 'Dramatic Line Breaks' },
    hashtagSpam: { points: 0.5, icon: '#️⃣', label: 'Hashtag Spam' }
  },

  // Negative signals (reduce score)
  negative: {
    hasLinks: { points: -1.0, icon: '🔗', label: 'Shares Resources' },
    hasCode: { points: -2.0, icon: '💻', label: 'Technical Content' },
    shortFactual: { points: -2.0, icon: '📌', label: 'Short & Factual' },
    sharesOthers: { points: -1.0, icon: '🤝', label: 'Celebrates Others' }
  },

  // Compound multiplier: when 3+ Tier 2 signals stack
  compoundThreshold: 3,
  compoundMultiplier: 1.25,

  // Thresholds
  thresholds: {
    emojiDensity: 0.03,       // emojis per character
    narcissismDensity: 0.06,  // I/me/my per word
    broetryRatio: 0.6,        // % of paragraphs that are single sentences
    hashtagCount: 3,          // hashtags to trigger
    shortPostLength: 100,     // chars for "short factual"
    jargonCount: 3            // jargon words to trigger
  }
};
