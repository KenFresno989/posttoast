/**
 * PostToast Signal Detectors
 * Each detector returns { detected: bool, points: number, detail: string } or null
 */
const PostToastSignals = {

  // ========== TIER 1: HEAVY HITTERS ==========

  detectFabricatedParable(text) {
    const lower = text.toLowerCase();
    const storyStarters = [
      /a (?:homeless|old|young|random|little|stranger|man|woman|kid|child|boy|girl) (?:once |at |on |in |who |came |taught|walked|approached|stopped|asked|said|told)/i,
      /(?:years? ago|few months? ago|back in \d{4}),? i (?:was|had|didn't|lost|quit|got fired|failed)/i,
      /i (?:was broke|was homeless|was sleeping|had nothing|lost everything|hit rock bottom)/i,
      /(?:then|and then|but then) (?:one day|everything changed|i realized|it hit me|something clicked)/i,
      /(?:that (?:moment|day|conversation|experience) (?:changed|taught|showed) (?:me|everything))/i
    ];

    // Story arc: hardship → epiphany → lesson
    const hasHardship = /(?:broke|homeless|couch|fired|rejected|failed|struggled|nothing|rock bottom|crying|tears|worst day|darkest)/i.test(lower);
    const hasEpiphany = /(?:then i realized|changed everything|one decision|that's when|the moment|light bulb|game.?changer|turned it around)/i.test(lower);
    const hasLesson = /(?:the lesson|here's what|moral|if i can|you can too|never give up|bet on yourself|lesson learned)/i.test(lower);

    const arcScore = [hasHardship, hasEpiphany, hasLesson].filter(Boolean).length;
    const starterMatch = storyStarters.some(r => r.test(text));

    if (arcScore >= 2 || (arcScore >= 1 && starterMatch)) {
      const r = PostToastRubric.tier1.fabricatedParable;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Rags-to-riches story arc detected' };
    }
    return null;
  },

  detectFiringGenre(text) {
    const patterns = [
      /i (?:fired|let go of|had to let go|terminated|removed) (?:my |our |the )?(?:top|best|star|highest|#1|number one)/i,
      /i fired (?:someone|an employee|a team member|my)/i,
      /(?:hardest|toughest|most difficult) (?:decision|thing|call) (?:i|we|as a).{0,30}(?:fire|let go|terminate)/i,
      /here's why i fired/i
    ];

    if (patterns.some(p => p.test(text))) {
      const r = PostToastRubric.tier1.firingGenre;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: '"I fired my top performer" energy' };
    }
    return null;
  },

  detectPrivilegeVulnerability(text) {
    const vulnerability = /(?:i cried|i was crying|tears|sobbing|broke down|couldn't stop crying|anxiety|panic attack|darkest moment)/i.test(text);
    const privilege = /(?:tesla|bmw|mercedes|porsche|first class|corner office|yacht|ceo|founder|7.?figure|6.?figure|my company|my startup|board meeting|private jet|penthouse)/i.test(text);

    if (vulnerability && privilege) {
      const r = PostToastRubric.tier1.privilegeVulnerability;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Vulnerability from a position of obvious privilege' };
    }
    return null;
  },

  detectStolenValor(text) {
    const genericStory = [
      /(?:a friend|someone|a mentor|my (?:uber|taxi|lyft) driver) (?:once )?(?:told|said|asked|taught) me/i,
      /(?:true story|this actually happened|happened to me)/i
    ];
    const vagueness = /(?:a few years ago|once upon|i'll never forget|picture this|imagine this)/i.test(text);
    const genericWisdom = /(?:that's when i knew|and it changed|blew my mind|i'll never forget|changed my perspective)/i.test(text);

    if (genericStory.some(p => p.test(text)) && (vagueness || genericWisdom)) {
      const r = PostToastRubric.tier1.stolenValor;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Generic wisdom story with no verifiable details' };
    }
    return null;
  },

  // ========== TIER 2: CORE CRINGE ==========

  detectHumbleBrag(text) {
    const patterns = [
      /(?:i'm |i am )?(?:so |truly |deeply |incredibly )?humbled/i,
      /humbled to (?:announce|share|say|report)/i,
      /thrilled to (?:announce|share|say)/i,
      /honored to (?:announce|be|share|join)/i,
      /blessed to (?:announce|share|be)/i,
      /i never (?:expected|imagined|thought|dreamed)/i,
      /i can't believe (?:i|this|it)/i,
      /(?:still processing|still can't believe|pinch me|is this real)/i,
      /didn't think (?:this|i|it) would/i,
      /(?:just a kid from|just a small town)/i
    ];

    const matches = patterns.filter(p => p.test(text));
    if (matches.length > 0) {
      const r = PostToastRubric.tier2.humbleBrag;
      const pts = matches.length > 1 ? r.points + 0.5 : r.points;
      return { detected: true, points: pts, icon: r.icon, label: r.label, detail: matches.length > 1 ? 'Multiple humble brag signals — overload' : 'Classic "humbled to announce" energy' };
    }
    return null;
  },

  detectThoughtLeader(text) {
    const patterns = [
      /here'?s what (?:nobody|no one|most people|they don't) (?:tells?|knows?|understands?|talks? about)/i,
      /unpopular opinion:?/i,
      /hot take:?/i,
      /controversial:?/i,
      /(?:the truth|real truth|hard truth|honest truth) (?:about|is|that)/i,
      /(?:stop|quit) (?:doing|saying|believing|thinking) (?:this|these|that)/i,
      /i'?(?:ve|ll) say it:? /i,
      /most (?:people|founders|leaders|ceos|entrepreneurs) (?:don't|won't|can't|fail to)/i,
      /the (?:real|actual|biggest) (?:reason|problem|issue|secret)/i,
      /\d+ (?:lessons?|things?|tips?|rules?|habits?) (?:i|that|for|every|no one)/i
    ];

    const matches = patterns.filter(p => p.test(text));
    if (matches.length > 0) {
      const r = PostToastRubric.tier2.thoughtLeader;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: `"${matches.length > 1 ? 'Serial' : 'Classic'} thought leader" framing` };
    }
    return null;
  },

  detectEngagementBait(text) {
    const patterns = [
      /agree\s*\??\s*(?:👇|⬇️|↓|drop|comment|share|repost)/i,
      /(?:thoughts|agree|disagree)\s*\?\s*(?:👇|⬇️)?/i,
      /(?:drop|leave|put) a (?:🔥|❤️|👍|💡|✋|comment|like)/i,
      /(?:repost|share|like) if you (?:agree|believe|think|feel)/i,
      /(?:who else|am i the only|raise your hand|tag someone)/i,
      /(?:comment|type) (?:yes|no|me|below|👇)/i,
      /what (?:do you|would you) think\s*\?\s*$/im,
      /follow (?:me |for )(?:more|daily|weekly)/i
    ];

    const matches = patterns.filter(p => p.test(text));
    if (matches.length > 0) {
      const r = PostToastRubric.tier2.engagementBait;
      const pts = matches.length > 1 ? r.points + 0.5 : r.points;
      return { detected: true, points: pts, icon: r.icon, label: r.label, detail: matches.length > 1 ? `${matches.length} engagement bait hooks` : 'Fishing for engagement' };
    }
    return null;
  },

  detectToxicPositivity(text) {
    const patterns = [
      /every (?:rejection|failure|setback|loss|no) is (?:a |an )?(?:blessing|redirection|lesson|opportunity|gift)/i,
      /(?:grateful|thankful) for (?:the|every|this) (?:struggle|failure|setback|challenge|pain|journey)/i,
      /(?:everything happens|things happen) for a reason/i,
      /(?:good vibes only|stay positive|choose joy|choose happiness|positive energy)/i,
      /(?:no bad days|no such thing as failure|there are no failures)/i,
      /if you (?:believe|dream|want) (?:it|hard) enough/i,
      /(?:your vibe|your energy|your mindset) (?:attracts|determines|creates)/i,
      /the (?:universe|world|life) (?:rewards|gives|wants|needs) (?:you|those who)/i,
      /(?:manifesting|manifest) (?:my|your|the|greatness)/i
    ];

    const matches = patterns.filter(p => p.test(text));
    if (matches.length > 0) {
      const r = PostToastRubric.tier2.toxicPositivity;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Toxic positivity — papering over reality with platitudes' };
    }
    return null;
  },

  detectNameDrop(text) {
    const names = [
      /(?:elon|musk|bezos|zuckerberg|zuck|gates|bill gates|buffett|oprah|obama|trump|steve jobs|jobs|gary vee|vaynerchuk|tim cook|satya nadella|jensen huang|sam altman)/i
    ];
    const companies = [
      /(?:at google|at meta|at apple|at amazon|at microsoft|at tesla|at openai|at stripe|at netflix|ex-google|ex-meta|ex-apple|ex-amazon|ex-microsoft)/i
    ];

    const nameMatch = names.some(p => p.test(text));
    const companyMatch = companies.some(p => p.test(text));

    if (nameMatch || companyMatch) {
      const r = PostToastRubric.tier2.nameDrop;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: nameMatch ? 'Borrowing credibility from famous names' : 'Strategic company name placement' };
    }
    return null;
  },

  detectSelflessHiring(text) {
    const patterns = [
      /i (?:hired|gave a chance|took a chance on) (?:someone|a person|an employee|a candidate) (?:everyone|nobody|others|other companies)/i,
      /(?:no one|nobody) (?:would|wanted to) (?:hire|interview|give.{0,10}chance)/i,
      /(?:gap in|gaps on) (?:their |the )?(?:resume|cv)/i,
      /took a chance on (?:them|her|him|someone)/i,
      /(?:best hire|greatest hire|best decision).{0,30}(?:everyone (?:said|told|thought))/i
    ];

    if (patterns.some(p => p.test(text))) {
      const r = PostToastRubric.tier2.selflessHiring;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: '"I hired someone nobody believed in" — hero complex' };
    }
    return null;
  },

  detectMotivationalSpeech(text) {
    const patterns = [
      /(?:bet on yourself|invest in yourself|back yourself)/i,
      /(?:you are|you're) (?:enough|worthy|capable|unstoppable|limitless)/i,
      /(?:the only person|the only thing) (?:stopping|holding|standing|between)/i,
      /(?:your (?:time|moment|day|turn) (?:is coming|will come|is here|is now))/i,
      /(?:don't|never) (?:let anyone|let them|give up|stop|quit)/i,
      /(?:grind|hustle|rise|keep going|keep pushing|keep showing up)/i,
      /(?:lions? don't|wolves? don't|eagles? don't|warriors? don't)/i
    ];

    const matches = patterns.filter(p => p.test(text));
    if (matches.length >= 2) {
      const r = PostToastRubric.tier2.garySpeech;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Unsolicited motivational speech — Gary Vee energy' };
    }
    return null;
  },

  // ========== TIER 3: SEASONING ==========

  detectEmojiAbuse(text) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu;
    const emojis = text.match(emojiRegex) || [];
    const density = emojis.length / Math.max(text.length, 1);
    const rocketCount = (text.match(/🚀/g) || []).length;

    if (density > PostToastRubric.thresholds.emojiDensity || emojis.length > 6) {
      const r = PostToastRubric.tier3.emojiAbuse;
      const detail = rocketCount >= 2 ? `${emojis.length} emojis including ${rocketCount} rockets 🚀` : `${emojis.length} emojis in ${text.length} characters`;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail };
    }
    return null;
  },

  detectBroetry(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 4) return null;

    const singleSentenceLines = lines.filter(l => {
      const trimmed = l.trim();
      return trimmed.length < 80 && !trimmed.includes('. ') && (trimmed.split(' ').length <= 12);
    });

    const ratio = singleSentenceLines.length / lines.length;

    if (ratio >= PostToastRubric.thresholds.broetryRatio && lines.length >= 5) {
      const r = PostToastRubric.tier3.broetry;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: `${singleSentenceLines.length} of ${lines.length} lines are single-sentence paragraphs` };
    }
    return null;
  },

  detectCorporateJargon(text) {
    const jargon = [
      'synergy', 'leverage', 'disrupt', 'disruption', 'disruptor', 'ecosystem',
      'value-add', 'value add', 'ideate', 'ideation', 'paradigm', 'paradigm shift',
      'pivot', 'scalable', 'bandwidth', 'circle back', 'deep dive', 'move the needle',
      'low-hanging fruit', 'thought leader', 'north star', 'game-changer', 'game changer',
      'bleeding edge', 'cutting edge', 'best-in-class', 'world-class', 'first-mover',
      'holistic', 'synergize', 'actionable', 'learnings', 'deliverables', 'stakeholder',
      'touch base', 'align', 'alignment', 'double down', 'unlock', 'unpack',
      'empower', 'empowerment', 'optimize', 'streamline', 'operationalize',
      'democratize', 'mission-critical', 'future-proof', 'hyper-growth'
    ];

    const lower = text.toLowerCase();
    const found = jargon.filter(j => lower.includes(j));

    if (found.length >= PostToastRubric.thresholds.jargonCount) {
      const r = PostToastRubric.tier3.corporateJargon;
      const pts = found.length >= 5 ? r.points + 0.5 : r.points;
      return { detected: true, points: pts, icon: r.icon, label: r.label, detail: `${found.length} jargon terms: "${found.slice(0, 3).join('", "')}"${found.length > 3 ? '...' : ''}` };
    }
    return null;
  },

  detectNarcissismIndex(text) {
    const words = text.split(/\s+/).length;
    const iCount = (text.match(/\b(?:I|I'm|I've|I'll|I'd|me|my|mine|myself)\b/g) || []).length;
    const density = iCount / Math.max(words, 1);

    if (density > PostToastRubric.thresholds.narcissismDensity && iCount > 5) {
      const r = PostToastRubric.tier3.narcissismIndex;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: `${iCount} first-person references in ${words} words` };
    }
    return null;
  },

  detectDramaticBreaks(text) {
    // Look for multiple consecutive newlines (empty lines for dramatic effect)
    const doubleBreaks = (text.match(/\n\s*\n/g) || []).length;
    const lines = text.split('\n').filter(l => l.trim().length > 0).length;

    if (doubleBreaks >= 4 && lines >= 5) {
      const r = PostToastRubric.tier3.dramaticBreaks;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: `${doubleBreaks} dramatic pauses for effect` };
    }
    return null;
  },

  detectHashtagSpam(text) {
    const hashtags = text.match(/#\w+/g) || [];
    if (hashtags.length >= PostToastRubric.thresholds.hashtagCount) {
      const r = PostToastRubric.tier3.hashtagSpam;
      const pts = hashtags.length >= 5 ? r.points + 0.25 : r.points;
      return { detected: true, points: pts, icon: r.icon, label: r.label, detail: `${hashtags.length} hashtags` };
    }
    return null;
  },

  // ========== NEGATIVE SIGNALS ==========

  detectHasLinks(text) {
    const links = text.match(/https?:\/\/\S+/g) || [];
    const isResourcey = /(?:article|paper|study|research|report|documentation|github|repo|tutorial)/i.test(text);

    if (links.length > 0 && isResourcey) {
      const r = PostToastRubric.negative.hasLinks;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Actually sharing useful resources' };
    }
    return null;
  },

  detectHasCode(text) {
    const codeIndicators = /(?:```|const |let |var |function |=>|import |export |class |def |public |private |<\/?[a-z]+>|\{\{|\}\})/i;
    if (codeIndicators.test(text)) {
      const r = PostToastRubric.negative.hasCode;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Technical/educational content' };
    }
    return null;
  },

  detectShortFactual(text) {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (cleanText.length < PostToastRubric.thresholds.shortPostLength) {
      const r = PostToastRubric.negative.shortFactual;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Short, factual post — respect' };
    }
    return null;
  },

  detectSharesOthers(text) {
    const patterns = [
      /(?:congrats|congratulations|shoutout|shout out|kudos|props|hat tip|hats off) to (?!me|myself)/i,
      /(?:so proud of|happy for|excited for) (?!me|myself)/i,
      /please (?:follow|check out|support|read) (?!me|my)/i
    ];
    const noSelfCenter = !/\b(?:I|me|my)\b/gi.test(text.slice(0, 50));

    if (patterns.some(p => p.test(text)) && noSelfCenter) {
      const r = PostToastRubric.negative.sharesOthers;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Genuinely celebrating someone else' };
    }
    return null;
  },

  // Run all detectors
  analyzeAll(text) {
    const results = [];
    const detectors = [
      // Tier 1
      'detectFabricatedParable', 'detectFiringGenre', 'detectPrivilegeVulnerability', 'detectStolenValor',
      // Tier 2
      'detectHumbleBrag', 'detectThoughtLeader', 'detectEngagementBait', 'detectToxicPositivity',
      'detectNameDrop', 'detectSelflessHiring', 'detectMotivationalSpeech',
      // Tier 3
      'detectEmojiAbuse', 'detectBroetry', 'detectCorporateJargon', 'detectNarcissismIndex',
      'detectDramaticBreaks', 'detectHashtagSpam',
      // Negative
      'detectHasLinks', 'detectHasCode', 'detectShortFactual', 'detectSharesOthers'
    ];

    for (const name of detectors) {
      try {
        const result = this[name](text);
        if (result && result.detected) {
          results.push(result);
        }
      } catch (e) {
        // Silently skip broken detectors
      }
    }

    return results;
  }
};
