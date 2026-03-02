// Copyright (c) 2026 PostToast. All rights reserved.
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
      /(?:repost|share|like) if you (?:agree|believe|think|feel|found)/i,
      /(?:who else|am i the only|raise your hand|tag someone)/i,
      /(?:comment|type) (?:yes|no|me|below|👇)/i,
      /what (?:do you|would you) think\s*\?\s*$/im,
      /follow (?:me|for )(?:more|so you|daily|weekly|to never miss)/i,
      /(?:never miss|don't miss) (?:content|posts|updates|a post)/i,
      /comment .{0,20} below/i,
      /(?:send|dm|message) (?:me|directly)/i,
      /want (?:the|my|a) (?:full|complete|free) (?:guide|template|checklist|playbook|framework)/i,
      /(?:save|bookmark) this (?:for|post)/i,
      /how will you (?:enjoy|spend|use|handle|approach)/i
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

  // ========== NEW TIER 2 SIGNALS ==========

  detectHumblebait(text) {
    const patterns = [
      /i'?m not sure (?:i |if i )?should (?:share|post|say|mention) this/i,
      /i debated (?:sharing|posting|whether to)/i,
      /i wasn'?t (?:going to|sure if i should) (?:share|post|say)/i,
      /i almost didn'?t (?:share|post) this/i,
      /(?:nervous|scared|hesitant|vulnerable) (?:to share|to post|about sharing|about posting)/i,
      /this (?:is|feels) (?:scary|vulnerable|hard) to (?:share|post|say|admit)/i
    ];

    if (patterns.some(p => p.test(text))) {
      const r = PostToastRubric.tier2.humblebait;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: '"I almost didn\'t share this" — but of course you did' };
    }
    return null;
  },

  detectGratitudeTheater(text) {
    const patterns = [
      /thank (?:you|everyone|all of you|each and every|this community) (?:for|who)/i,
      /(?:grateful|thankful) (?:to|for) (?:everyone|all|each|this community|my network|my tribe|my people)/i,
      /(?:couldn'?t have done|wouldn'?t be here|none of this).{0,30}without (?:you|everyone|all of you|my)/i,
      /(?:shoutout|shout out|hat tip|hats off) to (?:everyone|all|my|the amazing)/i,
      /thank you to everyone who (?:has |have )?(?:supported|believed|been|helped|cheered)/i,
      /(?:endless|immense|deep|profound|heartfelt|sincere) (?:gratitude|appreciation|thanks)/i,
      /(?:wonderful|amazing|incredible|beautiful) (?:people|humans|souls|community|network|journey)/i,
      /(?:been generous with|taken a chance on|believed in) me/i,
      /(?:enriching|meaningful|transformative|life.changing) (?:conversations?|experiences?|journey|connections?)/i
    ];

    const isPerformative = text.length > 200; // short thank-yous are fine

    if (patterns.some(p => p.test(text)) && isPerformative) {
      const r = PostToastRubric.tier2.gratitudeTheater;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Performative gratitude to an audience of thousands' };
    }
    return null;
  },

  detectTraumaFlex(text) {
    const trauma = /(?:i was broke|i was poor|i was homeless|i slept (?:on|in)|i had nothing|i dropped out|i was fired|i lost everything|i was rejected|grew up (?:in poverty|poor|without|on food stamps)|single (?:mom|dad|parent)|abusive|addiction|rehab)/i.test(text);
    const flex = /(?:now i|today i|fast forward|years later|look at me|i (?:make|earn|built|run|lead|own|manage)|(?:6|7|8).?figure|my company|my team|revenue|million|successful)/i.test(text);

    if (trauma && flex) {
      const r = PostToastRubric.tier2.traumaFlex;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Leading with hardship to make the flex hit harder' };
    }
    return null;
  },

  detectEchoChamber(text) {
    const unpopularOpinionPrefix = /(?:unpopular opinion|hot take|controversial|i'll probably get hate for this|people won't like this)/i.test(text);
    const popularOpinions = [
      /(?:hard work|work.?life balance|mental health|be kind|treat people|family (?:comes |is )first|kindness|empathy|listen more)/i,
      /(?:your degree doesn'?t matter|college (?:isn'?t|is not) (?:necessary|required|needed))/i,
      /(?:hire for attitude|culture (?:eats|beats) strategy|people don'?t leave (?:jobs|companies))/i,
      /(?:leadership is|real leaders|a true leader|the best managers)/i
    ];

    if (unpopularOpinionPrefix && popularOpinions.some(p => p.test(text))) {
      const r = PostToastRubric.tier2.echoChamber;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: '"Unpopular opinion" followed by the most popular opinion possible' };
    }
    return null;
  },

  detectPivotBrag(text) {
    const patterns = [
      /i (?:left|quit|walked away from|turned down) (?:my |a )?(?:\$?\d+[kK]|\d{3},?\d{3}|six.?figure|high.?paying|cushy|comfortable|corporate|big tech)/i,
      /(?:left|quit|walked away from).{0,40}(?:follow my|pursue my|chase my|find my|passion|dream|calling|purpose)/i,
      /(?:traded my|gave up my).{0,30}(?:salary|paycheck|bonus|stock|equity|comfort)/i,
      /(?:everyone thought i was crazy|they said i was (?:crazy|nuts|insane)|friends thought|family thought)/i
    ];

    if (patterns.some(p => p.test(text))) {
      const r = PostToastRubric.tier2.pivotBrag;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: '"I left my cushy job to follow my passion" — humble + flex + unsolicited' };
    }
    return null;
  },

  detectEmpathyCosplay(text) {
    const patterns = [
      /i (?:gave|tipped|bought|paid for) (?:my |a |the )?(?:barista|waiter|waitress|uber driver|delivery|stranger|homeless)/i,
      /(?:a stranger|someone|a homeless (?:man|woman|person)).{0,40}(?:taught me|showed me|reminded me|changed my)/i,
      /i (?:stopped|sat down|took time) to (?:talk to|listen to|help|chat with) (?:a |the )?(?:janitor|cleaner|security guard|intern|junior)/i,
      /(?:everyone walked past|nobody stopped|no one noticed).{0,30}(?:but i|except me|i stopped)/i
    ];

    if (patterns.some(p => p.test(text))) {
      const r = PostToastRubric.tier2.empathyCosplay;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Performing empathy for an audience instead of just... being kind' };
    }
    return null;
  },

  detectLinkedInfluencer(text) {
    const patterns = [
      /(?:i had (?:coffee|lunch|dinner|a call|a chat) with|i asked|i once met|i sat next to) (?:a |the )?(?:ceo|founder|billionaire|investor)/i,
      /(?:as|like) (?:steve jobs|elon|bezos|buffett|oprah|brené brown|simon sinek|gary vee) (?:once )?(?:said|taught|showed|always says)/i,
      /(?:i learned|takeaway|key insight) from (?:my time at|working at|meeting with) (?:google|meta|apple|amazon|microsoft|tesla|openai)/i
    ];

    if (patterns.some(p => p.test(text))) {
      const r = PostToastRubric.tier2.linkedInfluencer;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Borrowing clout from people you probably never met' };
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
      // Scale points for extreme broetry
      let pts = r.points;
      if (ratio >= 0.9) pts += 1.0;       // 90%+ single sentences = extra cringe
      else if (ratio >= 0.7) pts += 0.5;  // 70%+ gets a bump
      return { detected: true, points: pts, icon: r.icon, label: r.label, detail: `${singleSentenceLines.length} of ${lines.length} lines are single-sentence paragraphs` };
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

  detectInfomercial(text) {
    const educationalFrame = /(?:most people|here'?s (?:what|how|why|a)|let me (?:break|explain)|primer on|guide to|questions i get asked|complete guide)/i.test(text);
    const selfPromo = /(?:visit my|my website|check out my|i built|i created|my company|my firm|my team|we help|we offer|our platform|book a call|schedule a|link in)/i.test(text);
    const leadGen = /(?:comment .{0,20}(?:below|and i'll)|dm me|send me|want (?:the|my|a) (?:full|free)|get (?:the|my|your) (?:free|full))/i.test(text);

    const signals = [educationalFrame, selfPromo, leadGen].filter(Boolean).length;
    if (signals >= 2) {
      return { detected: true, points: 1.5, icon: '📺', label: 'Infomercial', detail: 'Education-shaped ad — "But wait, there\'s more!"' };
    }
    return null;
  },

  // ========== NEW TIER 3 SIGNALS ==========

  detectCorporateHaiku(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 3 || lines.length > 6) return null;

    const allShort = lines.every(l => l.trim().split(/\s+/).length <= 4);
    const hasBuzzwords = /(?:innovation|leadership|growth|mindset|culture|strategy|excellence|vision|impact|purpose|transformation)/i.test(text);

    if (allShort && hasBuzzwords) {
      const r = PostToastRubric.tier3.corporateHaiku;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Three buzzwords stacked vertically and called wisdom' };
    }
    return null;
  },

  detectSelfieSermon(text) {
    const hasAdvice = /(?:here'?s (?:my|the|a) (?:advice|tip|lesson|truth|thing)|lesson (?:i|learned)|my advice|pro tip|remember this|never forget|(?:we|you) (?:need|should|must|deserve|forget|spend too much))/i.test(text);
    const isLong = text.length > 200;
    const hasLifeWisdom = /(?:life is|life's too|you only (?:live|get)|at the end of the day|when you look back|on your deathbed|(?:work|that|it) matters|(?:let|allow|give) yourself|step(?:ping)? outside|take (?:a |the )?(?:break|moment|breath))/i.test(text);

    // Only need 2 of 3 signals now (was all 3)
    const score = (hasAdvice ? 1 : 0) + (isLong ? 1 : 0) + (hasLifeWisdom ? 1 : 0);
    if (score >= 2) {
      const r = PostToastRubric.tier3.selfiSermon;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Unsolicited life advice delivered to the void' };
    }
    return null;
  },

  detectRecruiterBait(text) {
    const patterns = [
      /(?:open to|exploring|looking for) (?:new |exciting )?(?:opportunities|roles|challenges|my next)/i,
      /(?:available|on the market|free agent|in transition|between roles)/i,
      /(?:if you(?:'re| are) (?:hiring|looking)|know anyone (?:hiring|looking)|my dms are open)/i,
      /(?:let'?s connect|let'?s chat|reach out|drop me a (?:line|message|dm))/i
    ];

    const isSubtle = /(?:excited (?:about|for) what'?s next|new chapter|next adventure|next chapter)/i.test(text);
    const matches = patterns.filter(p => p.test(text));

    if (matches.length >= 2 || (matches.length >= 1 && isSubtle)) {
      const r = PostToastRubric.tier3.recruiterBait;
      return { detected: true, points: r.points, icon: r.icon, label: r.label, detail: 'Open to work but making it sound like a lifestyle choice' };
    }
    return null;
  },

  detectFortuneCookie(text) {
    // Short profound-sounding one-liners that say nothing
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const fortuneCookies = lines.filter(l => {
      const trimmed = l.trim();
      const words = trimmed.split(/\s+/).length;
      // Short declarative statements (3-8 words) that sound profound
      return words >= 2 && words <= 8 && !trimmed.includes('?') &&
        /(?:create|is |are |build|attract|matter|define|start|change|grow|transform|begin|deserve)/i.test(trimmed);
    });

    if (fortuneCookies.length >= 3) {
      return { detected: true, points: 1.0, icon: '🥠', label: 'Fortune Cookie', detail: `${fortuneCookies.length} profound-sounding one-liners that say nothing` };
    }
    return null;
  },

  detectLetterCloser(text) {
    const patterns = [
      /(?:love|cheers|warmly|best|regards|gratitude|yours|sincerely|peace),?\s*\n/i,
      /(?:love & gratitude|with love|with gratitude|stay blessed|keep going),?\s*\n?\s*[A-Z][a-z]+\s*$/im,
      /(?:love|cheers|warmly|best|gratitude),?\s+[A-Z][a-z]+\s*$/im
    ];

    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 0.75, icon: '✍️', label: 'Letter Closer', detail: 'Signing a LinkedIn post like a handwritten letter to thousands' };
    }
    return null;
  },

  detectThirdPersonSelfPromo(text) {
    // "Follow [Name] for actionable insights"
    const patterns = [
      /follow \w+ (?:\w+ )?for (?:more|daily|actionable|weekly|the latest|insights|tips|content)/i,
      /connect with \w+ (?:\w+ )?(?:to learn|for|on)/i,
      /subscribe to \w+(?:'s)? (?:newsletter|channel|podcast)/i
    ];

    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.25, icon: '🗣️', label: 'Third Person Main Character', detail: 'Referring to yourself in third person to sell yourself' };
    }
    return null;
  },

  detectCopypasta(text) {
    // Chain mail / viral stories reposted on LinkedIn
    const patterns = [
      /a (?:professor|teacher|ceo|boss|manager) (?:got up|stood up|walked in|said|asked)/i,
      /(?:the (?:whole|entire) (?:class|room|office|team) (?:was|went) (?:silent|quiet))/i,
      /(?:everybody|everyone) (?:clapped|stood up|cheered|applauded)/i,
      /(?:that (?:student|employee|person|man|woman|kid)'s name\?)/i,
      /(?:i love this|repost this|share this if)/i
    ];
    const hasNoOriginalContent = !/\b(?:I think|in my experience|at my company|my take|I believe)\b/i.test(text);
    const matches = patterns.filter(p => p.test(text));

    if (matches.length >= 2 || (matches.length >= 1 && hasNoOriginalContent && text.length > 200)) {
      return { detected: true, points: 2.0, icon: '📋', label: 'Copypasta', detail: 'Chain-mail story reposted on a professional platform' };
    }
    return null;
  },

  detectAtFirstThenRealized(text) {
    const patterns = [
      /at first (?:i |I )?(?:thought|laughed|dismissed|ignored|didn't|was skeptical).{0,80}then (?:i |I )?(?:realized|understood|saw|noticed|got it)/i,
      /(?:i used to think|i always thought).{0,80}(?:then i realized|until i learned|now i know)/i,
      /(?:at first.{0,20}then.{0,20}(?:genius|brilliant|incredible|game.?changer))/i
    ];

    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.0, icon: '💡', label: 'The Epiphany Arc', detail: '"At first I laughed. Then I realized..." — the LinkedIn two-step' };
    }
    return null;
  },

  detectOverworkBrag(text) {
    const hourMatch = text.match(/(\d{2,3})\s*(?:hrs?|hours?)\s*(?:a |per |\/)?(?:week|wk)/i);
    const patterns = [
      /(?:i work|working|i put in|clocking|logged) \d{2,3}\s*(?:hrs?|hours?)/i,
      /(?:4|5)\s*(?:am|a\.m\.)\s*(?:every|daily|morning|wake|alarm|start)/i,
      /(?:no days off|no weekends|haven't taken a (?:day|vacation|break))/i,
      /(?:sleep is|sleep when|who needs sleep|i'll sleep when i'm dead)/i,
      /(?:while (?:you|they|everyone) (?:were |was )?(?:sleeping|partying|watching|relaxing))/i
    ];

    if (hourMatch && parseInt(hourMatch[1]) > 60) {
      return { detected: true, points: 2.0, icon: '⏰', label: 'Overwork Bragging', detail: `Bragging about ${hourMatch[1]} hours/week like it's a flex, not a cry for help` };
    }
    if (patterns.filter(p => p.test(text)).length >= 2) {
      return { detected: true, points: 1.5, icon: '⏰', label: 'Overwork Bragging', detail: 'Glorifying burnout as a personality trait' };
    }
    return null;
  },

  detectFacebookOnLinkedIn(text) {
    // Non-professional content: politics, religion, memes, personal rants
    const nonProfessional = [
      /(?:god|jesus|lord|pray|prayer|blessed be|amen|scripture|bible|church)/i,
      /(?:democrat|republican|liberal|conservative|trump|biden|maga|woke|libtard)/i,
      /(?:like and share|share if you agree|type amen|1 like = 1 prayer)/i,
      /(?:good morning linkedin|happy (?:monday|tuesday|wednesday|thursday|friday)|tgif|rise and grind)/i
    ];
    const noProfessionalContext = !/(?:company|industry|business|career|hire|job|team|project|product|customer|client|revenue|startup|market)/i.test(text);

    const matches = nonProfessional.filter(p => p.test(text));
    if (matches.length >= 1 && noProfessionalContext) {
      return { detected: true, points: 1.25, icon: '👴', label: 'Facebook on LinkedIn', detail: 'This belongs on Facebook, not a professional network' };
    }
    return null;
  },

  detectDisproportionateGratitude(text) {
    const bigThanks = /(?:can't thank|want to thank|grateful to|thankful for|shoutout to) (?:my |all |every |each )?(?:clients?|teammates?|partners?|family|friends|mentors?|colleagues?|network|community|everyone)/i.test(text);
    const trivialEvent = /(?:vanity plate|new (?:phone|laptop|desk|office|badge|title card)|coffee|lunch|parking spot|business card|first day|started (?:a|my) (?:new|podcast|blog|newsletter))/i.test(text);

    if (bigThanks && trivialEvent) {
      return { detected: true, points: 1.25, icon: '🏆', label: 'Oscar Speech', detail: 'Thanking the entire professional ecosystem for a minor personal event' };
    }
    return null;
  },

  detectSelfFanFiction(text) {
    // People writing fictional dialogues where they're the hero
    const hasDialogue = (text.match(/[""].*?[""]|["'].*?["']/g) || []).length >= 2;
    const hasReaction = /(?:shocked|stunned|speechless|couldn't believe|jaw dropped|eyes widened|went silent|was quiet)/i.test(text);
    const selfHero = /(?:i (?:replied|said|told|responded|answered|looked|smiled))/i.test(text);
    const coolDescriptor = /(?:without (?:batting|blinking|hesitating|missing)|calmly|confidently|simply said|just smiled)/i.test(text);

    if (hasDialogue && hasReaction && selfHero) {
      const pts = coolDescriptor ? 2.5 : 2.0;
      return { detected: true, points: pts, icon: '📖', label: 'Self Fan Fiction', detail: coolDescriptor ? 'Writing yourself as the cool genius who shocks everyone — and narrating your own composure' : 'A fictional dialogue where you\'re the hero who stuns the room' };
    }
    return null;
  },

  detectItsCrazyToMe(text) {
    const patterns = [
      /(?:it's|it is) (?:crazy|wild|insane|mind.?blowing|fascinating|incredible|unbelievable) (?:to me )?(?:that|how)/i,
      /(?:can we talk about|nobody is talking about|why isn't anyone|am i the only one who)/i,
      /(?:let that sink in|read that again|say it louder|think about that)/i
    ];

    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 0.75, icon: '🤯', label: 'Performative Amazement', detail: 'Pretending to be blown away by an obvious observation' };
    }
    return null;
  },

  detectAISlop(text) {
    const lower = text.toLowerCase();
    let score = 0;
    const evidence = [];

    // Vocabulary tells — words AI overuses
    const slopWords = [
      'delve', 'navigate', 'landscape', 'foster', 'resonate', 'crucial',
      'realm', 'embark', 'pivotal', 'nuanced', 'multifaceted', 'holistic',
      'paradigm', 'transformative', 'utilize', 'leverage', 'harness',
      'testament', 'underscores', 'aforementioned', 'comprehensive',
      'robust', 'streamline', 'spearhead', 'groundbreaking', 'cutting-edge',
      'ever-evolving', 'fast-paced', 'dynamic', 'innovative', 'elevate'
    ];
    const foundSlop = slopWords.filter(w => lower.includes(w));
    if (foundSlop.length >= 3) {
      score += 1.0;
      evidence.push(`${foundSlop.length} AI-favorite words: "${foundSlop.slice(0, 3).join('", "')}"...`);
    } else if (foundSlop.length >= 2) {
      score += 0.5;
      evidence.push(`AI vocabulary: "${foundSlop.join('", "')}""`);
    }

    // Structural tells
    const hasNumberedBoldList = /\d+\.\s*\*\*[^*]+\*\*/g.test(text) || /\d+\.\s+[A-Z][^.]{5,40}:/g.test(text);
    if (hasNumberedBoldList) {
      score += 0.5;
      evidence.push('Numbered bold-header list');
    }

    // "Here's the thing:" / "Let me be clear:" / "Here's why this matters:"
    const aiTransitions = [
      /here'?s (?:the thing|why (?:this|it|that) matters|what i'?ve learned)/i,
      /let me be (?:clear|honest|real|transparent)/i,
      /(?:the bottom line|at the end of the day|the reality is)/i,
      /(?:it'?s not (?:just )?about .{5,40}, it'?s about)/i
    ];
    const transitionMatches = aiTransitions.filter(p => p.test(text));
    if (transitionMatches.length >= 2) {
      score += 0.75;
      evidence.push('Multiple AI-style transitions');
    } else if (transitionMatches.length === 1) {
      score += 0.25;
    }

    // "In today's [noun]" opening
    if (/^in today'?s (?:world|landscape|economy|market|era|age|environment|climate)/im.test(text)) {
      score += 0.5;
      evidence.push('"In today\'s [landscape]" — the classic AI opener');
    }

    // Em dash abuse (AI loves em dashes)
    const emDashes = (text.match(/—|--/g) || []).length;
    if (emDashes >= 4) {
      score += 0.5;
      evidence.push(`${emDashes} em dashes — AI's favorite punctuation`);
    }

    // Excessive hedging
    const hedges = [
      /while (?:it'?s|this is) (?:true|important|valid|understandable)/i,
      /(?:that said|having said that|that being said|with that in mind)/i,
      /(?:it'?s (?:important|worth|crucial|essential) to (?:note|remember|acknowledge|recognize))/i
    ];
    const hedgeCount = hedges.filter(p => p.test(text)).length;
    if (hedgeCount >= 2) {
      score += 0.5;
      evidence.push('Excessive hedging — unnaturally balanced');
    }

    // Zero typos + uniform paragraph length (AI tell)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    if (paragraphs.length >= 3) {
      const lengths = paragraphs.map(p => p.trim().length);
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
      const cv = Math.sqrt(variance) / avg; // coefficient of variation
      if (cv < 0.25) { // very uniform paragraph lengths
        score += 0.5;
        evidence.push('Suspiciously uniform paragraph lengths');
      }
    }

    // "What do you think?" as closer (AI's favorite ending)
    if (/what (?:do you|are your|would you) (?:think|thoughts)\s*\??\s*$/im.test(text)) {
      score += 0.25;
      evidence.push('"What do you think?" — AI\'s go-to closer');
    }

    if (score >= 1.5) {
      return { detected: true, points: Math.min(score, 3.0), icon: '🤖', label: 'AI Slop', detail: evidence.join(' · ') };
    }
    return null;
  },

  detectLinkedInness(text) {
    // Base "LinkedIn energy" — long posts that read like a performance
    const words = text.split(/\s+/).length;
    const lines = text.split('\n').filter(l => l.trim().length > 0).length;
    let pts = 0;
    const reasons = [];

    // Long post (200+ words) that's not technical
    if (words > 200 && !/(?:```|function |const |import |class )/i.test(text)) {
      pts += 0.5;
      reasons.push('200+ word monologue');
    }

    // Exclamation point abuse
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations >= 3) {
      pts += 0.25;
      reasons.push(`${exclamations} exclamation points`);
    }

    // ALL CAPS words (3+)
    const capsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).filter(w => !['CEO', 'CTO', 'CFO', 'COO', 'CMO', 'VP', 'MBA', 'USA', 'LLC', 'INC', 'ROI', 'KPI', 'SaaS', 'API', 'HR', 'DEI', 'AI', 'ML'].includes(w));
    if (capsWords.length >= 2) {
      pts += 0.25;
      reasons.push(`${capsWords.length} SHOUTING words`);
    }

    // Ends with a question (engagement hook)
    if (/\?\s*$/.test(text.trim())) {
      pts += 0.25;
      reasons.push('Ends with a question hook');
    }

    if (pts > 0) {
      return { detected: true, points: pts, icon: '📡', label: 'LinkedIn Energy', detail: reasons.join(' · ') };
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

  // Turning a minor loss/setback into a heroic journey
  detectSilverMedalSermon(text) {
    const lossFrame = /(?:i (?:didn'?t|did not) win|i (?:lost|came in|finished) (?:last|second|2nd|third|3rd)|i (?:failed|wasn'?t (?:selected|chosen|picked))|i got (?:rejected|turned down|passed over)|didn'?t (?:get|make|land) (?:the|it|a))/i;
    const reframe = /(?:(?:and )?(?:i'?m |i am |i couldn'?t be )?(?:thrilled|grateful|thankful|happy|glad|proud|blessed)|(?:best thing|greatest lesson|exactly what i needed|keeps me (?:hungry|motivated|humble|going|driven))|(?:here'?s (?:why|what)|(?:and )?that'?s (?:ok|okay|fine|the point|what matters|a good thing))|(?:i (?:needed|learned|grew|improved)|made me (?:better|stronger|hungrier)))/i;
    const epic = /(?:next time|rematch|come back|won'?t (?:stop|quit|give up)|watch me|game on|let'?s go|bring it|i'?ll be (?:back|ready|better))/i;

    if (lossFrame.test(text) && reframe.test(text)) {
      let pts = 1.75;
      if (epic.test(text)) pts = 2.25;
      return { detected: true, points: pts, icon: '🥈', label: 'Silver Medal Sermon', detail: 'Turned a minor setback into a heroic underdog narrative' };
    }
    return null;
  },

  // New job announcements — legitimate LinkedIn use
  detectNewJobAnnouncement(text) {
    const patterns = [
      /(?:today i|i'?m |i am )(?:start|starting|joining|beginning|thrilled to (?:announce|share) (?:that )?i'?(?:m|ve)? (?:join|start|accept))/i,
      /(?:new role|new position|new chapter|new adventure|new journey) (?:as|at|with)/i,
      /(?:excited|thrilled|proud|happy|grateful) to (?:announce|share|say)?.{0,30}(?:join|start|accept|begin|new role|new position)/i,
      /(?:first day|day one|officially (?:start|join|part of))/i,
      /(?:i'?(?:m|ve) (?:just )?(?:joined|started|accepted|begun)|just started (?:a |my )new)/i,
      /(?:proud to (?:join|be (?:part of|joining)))/i
    ];

    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: -3.0, icon: '🎉', label: 'New Job Announcement', detail: 'One of the few legit reasons to post on LinkedIn — congrats!' };
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

  // Mundane activity reframed as profound leadership lesson
  detectMotivationalMundanity(text) {
    const mundaneActivities = /(?:went for a (?:run|walk|hike|swim|bike|jog)|took a (?:break|nap|walk|shower)|made (?:coffee|breakfast|dinner|lunch)|sat (?:in|on) (?:my|the)|played with (?:my|the) (?:kids|dog)|left (?:the office|work|my desk)|snuck out|stepped outside|drove (?:home|to work))/i;
    const profoundLesson = /(?:here'?s (?:the|what)|it (?:reminded|taught|hit|struck) me|(?:and )?(?:that|this) (?:matters|is (?:what|the)|changed)|we (?:spend|forget|need|don't)|(?:so|the) (?:lesson|takeaway|point|truth)|how will you|what (?:will|would) you|(?:let|allow|give) yourself)/i;
    const leadershipFrame = /(?:building|leading|planning|managing|executing|driving (?:impact|results|growth)|strategy|team|meetings|calendar (?:full|packed)|hustle|grind|impact)/i;

    if (mundaneActivities.test(text) && (profoundLesson.test(text) || leadershipFrame.test(text))) {
      let pts = 1.5;
      if (profoundLesson.test(text) && leadershipFrame.test(text)) pts = 2.0;
      return { detected: true, points: pts, icon: '🏃', label: 'Motivational Mundanity', detail: 'Turned a normal activity into a LinkedIn leadership lesson' };
    }
    return null;
  },

  // "Don't read this if..." / reverse psychology engagement bait
  detectAgreephishing(text) {
    const patterns = [
      /(?:don'?t|do not) (?:read|click|scroll|open|watch) (?:this|further|below|if)/i,
      /(?:stop scrolling|wait|hold on|before you scroll)/i,
      /(?:unpopular opinion|hot take|controversial|i'?ll probably get hate for this)/i,
      /(?:most people|nobody|no one) (?:will|wants to) (?:tell|say|admit|hear|talk about) (?:you|this)/i,
      /(?:i shouldn'?t (?:say|share|post) this|i might get fired for this)/i,
      /(?:this (?:will|might|may) (?:upset|offend|trigger|bother|surprise)|prepare to be)/i,
      /(?:you'?re not (?:ready|prepared) for this|brace yourself)/i
    ];

    const matches = patterns.filter(p => p.test(text));
    if (matches.length > 0) {
      const pts = matches.length > 1 ? 1.75 : 1.25;
      return { detected: true, points: pts, icon: '🎣', label: 'Agreephishing', detail: 'Reverse psychology engagement bait' };
    }
    return null;
  },

  // Open-ended question endings designed to farm comments
  detectQuestionFarming(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const lastLines = lines.slice(-3);
    const endPatterns = /(?:how (?:will|do|would|about) you|what (?:do|would|will|about) you|what'?s your|what are your|how are you|where do you|who (?:else|agrees|relates)|does anyone else|can you relate|sound familiar)\s*\??$/im;

    if (lastLines.some(l => endPatterns.test(l.trim()))) {
      return { detected: true, points: 0.75, icon: '🎤', label: 'Question Farming', detail: 'Ends with an open question to farm comments' };
    }
    return null;
  },

  // "Building in stealth" / artificial FOMO
  detectStealthModeFlex(text) {
    const patterns = [
      /(?:building|working|operating) in stealth/i,
      /stealth mode/i,
      /can'?t share (?:yet|much|details|more) but/i,
      /something (?:big|huge|exciting|special) (?:is )?coming/i,
      /stay tuned for (?:the|a|an|what)/i,
      /big (?:news|announcement) (?:coming|soon|dropping)/i,
      /watch this space/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.5, icon: '🕵️', label: 'Stealth Mode Flex', detail: 'Creating artificial FOMO about something nobody asked about' };
    }
    return null;
  },

  // Zero-effort poll/question bait
  detectLazyPollBait(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const lastLine = lines[lines.length - 1]?.trim() || '';
    const lazyEndings = /^(?:Agree|Thoughts|Your take|What would you add|What do you think|Right|Yes or no|True or false|Fair|Am I wrong)\s*\??\s*$/i;
    if (lazyEndings.test(lastLine)) {
      return { detected: true, points: 1.0, icon: '🗳️', label: 'Lazy Poll Bait', detail: 'Zero-effort one-word question fishing for comments' };
    }
    return null;
  },

  // "Tag someone who needs this"
  detectTagBrigade(text) {
    const patterns = [
      /tag (?:a |someone|your|the |that )/i,
      /who needs to (?:see|hear|read) this/i,
      /share this with (?:someone|a |your)/i,
      /send this to (?:someone|a |your|that)/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.5, icon: '🏷️', label: 'Tag Brigade', detail: 'Instagram engagement tactics on LinkedIn' };
    }
    return null;
  },

  // "Unpopular opinion:" (it's always popular)
  detectUnpopularOpinionTheater(text) {
    const patterns = [
      /^(?:unpopular opinion|hot take|controversial (?:take|opinion|but|thought))/im,
      /(?:this might be|this is probably|this may be) (?:unpopular|controversial)/i,
      /(?:i know this is|i know it'?s) (?:unpopular|controversial)/i,
      /(?:call me crazy|hear me out|don'?t @ me)/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.0, icon: '🌶️', label: 'Unpopular Opinion Theater', detail: 'Prefacing a mainstream opinion with "unpopular opinion" to seem edgy' };
    }
    return null;
  },

  // "I don't usually post but..."
  detectReluctantPoster(text) {
    const patterns = [
      /i (?:don'?t|rarely|never|seldom) (?:usually )?(?:post|share|write|do this)/i,
      /not (?:my style|something i (?:usually|normally)) (?:to |do)/i,
      /i normally stay quiet/i,
      /stepping out of my comfort zone (?:to|by) (?:post|shar)/i,
      /first time (?:posting|sharing|writing) (?:something like this|here|on linkedin)/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.0, icon: '🫣', label: 'Reluctant Poster', detail: '"I never post but..." — yes you do, your profile has 47 posts this month' };
    }
    return null;
  },

  // Fabricated encounters with wise strangers
  detectStrangerWisdom(text) {
    const strangers = /(?:homeless (?:man|woman|person)|janitor|uber driver|lyft driver|taxi driver|barista|cashier|waiter|waitress|stranger|old (?:man|woman)|kid|child|my (?:5|6|7|8|9|ten|\d+).year.old)/i;
    const wisdom = /(?:(?:taught|told|asked|reminded|said to|looked at) me|changed my (?:perspective|life|mind)|(?:made me|I) (?:realize|think|understand|reflect)|wise(?:st|r)? (?:thing|words|advice)|(?:simple|profound) (?:question|words|truth))/i;
    if (strangers.test(text) && wisdom.test(text)) {
      return { detected: true, points: 2.5, icon: '🧙', label: 'Stranger Wisdom', detail: 'A random stranger conveniently dispensed profound business wisdom' };
    }
    return null;
  },

  // Trivial event → profound life lesson
  detectMundaneEpiphany(text) {
    const mundane = /(?:dropped my|spilled (?:my |the )?coffee|stuck in traffic|waiting in line|flat tire|missed (?:my |the )(?:bus|train|flight)|couldn'?t find (?:parking|my keys)|burnt (?:my |the )|broke my phone|lost my wallet)/i;
    const epiphany = /(?:(?:and |then )?(?:i |it )?(?:realized|hit me|taught me|reminded me|learned|dawned on me)|(?:that'?s when|in that moment)|(?:lesson|takeaway|truth|perspective|metaphor for))/i;
    if (mundane.test(text) && epiphany.test(text)) {
      return { detected: true, points: 2.0, icon: '☕', label: 'Mundane Epiphany', detail: 'Turned a trivial everyday event into a profound life lesson' };
    }
    return null;
  },

  // "Swipe left" instructions on carousels
  detectCarouselCommander(text) {
    const patterns = [
      /swipe (?:left|right|👉|➡️|←)/i,
      /(?:👉|➡️)\s*swipe/i,
      /slide \d+ of/i,
      /check (?:each|every) slide/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 0.5, icon: '📱', label: 'Carousel Commander', detail: 'Explaining how to swipe like your audience are toddlers' };
    }
    return null;
  },

  // Inflated meaningless job titles
  detectFakeJobTitle(text) {
    const patterns = [
      /Chief (?:Happiness|Heart|People|Disruption|Inspiration|Dream|Vibe|Culture|Story|Chaos)/i,
      /(?:Growth|Marketing|Sales|Code|Data|Design) (?:Hacker|Ninja|Guru|Rockstar|Wizard|Maven|Jedi|Samurai|Unicorn)/i,
      /(?:Ninja|Guru|Rockstar|Wizard|Maven|Evangelist|Sherpa|Alchemist) (?:at|@|\|)/i,
      /Head of (?:Vibes|Dreams|Magic|Happiness|Awesomeness)/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.0, icon: '🦄', label: 'Fake Job Title', detail: 'A made-up title designed to sound quirky instead of competent' };
    }
    return null;
  },

  // "Here's why." clickbait suspense
  detectHeresWhyClickbait(text) {
    const patterns = [
      /here'?s (?:why|what (?:happened|I learned|nobody tells you|changed))[.:]/i,
      /(?:and |but )?(?:it|everything) changed[.:]/i,
      /(?:the result|what happened next)[?.:]/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 0.5, icon: '🪝', label: "Here's Why Clickbait", detail: 'BuzzFeed-style suspense for mundane information' };
    }
    return null;
  },

  // Exploiting death/illness/tragedy for engagement
  detectTragedyMining(text) {
    const tragedy = /(?:passed away|died|lost (?:my|our) (?:father|mother|dad|mom|brother|sister|friend|son|daughter|wife|husband|partner)|funeral|cancer|terminal|diagnosed|hospice|last (?:words|breath|moments))/i;
    const lesson = /(?:(?:taught|teaches|reminded) me|(?:\d+|three|four|five|six|seven) (?:lessons?|things?|takeaways?)|here'?s what|leadership|business|career|professional|entrepreneur)/i;
    if (tragedy.test(text) && lesson.test(text)) {
      return { detected: true, points: 2.5, icon: '⚰️', label: 'Tragedy Mining', detail: 'Exploiting death or illness for professional engagement' };
    }
    return null;
  },

  // "Building an empire" relationship status flex
  detectEmpireBuilder(text) {
    const patterns = [
      /building (?:an? )?empire/i,
      /(?:single|married|relationship).{0,30}(?:building|empire|grind)/i,
      /relationship status.{0,20}(?:hustle|grind|empire|startup|business)/i,
      /(?:married to|in a relationship with) (?:the |my )?(?:grind|hustle|vision|mission|startup)/i
    ];
    if (patterns.some(p => p.test(text))) {
      return { detected: true, points: 1.5, icon: '👑', label: 'Empire Builder', detail: 'My relationship status is "building an empire" — cool story bro' };
    }
    return null;
  },

  // "Thrilled to announce!" / maximum enthusiasm for everything
  detectExclamationAnnouncement(text) {
    const patterns = [
      /(?:thrilled|excited|delighted|honored|privileged|blessed|proud|overjoyed|ecstatic|humbled|stoked|pumped|over the moon) to (?:announce|share|reveal|unveil|launch|join|start)/i
    ];
    if (patterns.some(p => p.test(text))) {
      const exclamations = (text.match(/!/g) || []).length;
      const pts = exclamations >= 3 ? 1.0 : 0.5;
      return { detected: true, points: pts, icon: '📢', label: 'Exclamation Announcement', detail: 'Maximum enthusiasm for a routine professional update' };
    }
    return null;
  },

  // Fake strategy frameworks and business wisdom cosplay
  detectStrategerey(text) {
    const frameworkSpeak = [
      /(?:my |the |a )?(?:\d+|three|four|five|six|seven) (?:pillars?|principles?|keys?|rules?|laws?|steps?|secrets?|truths?) (?:of|to|for) (?:leadership|success|growth|scaling|hiring|winning|building|innovation)/i,
      /(?:framework|methodology|playbook|blueprint|roadmap|formula|system|matrix) (?:for|to|I) (?:use|built|developed|created|follow)/i,
      /(?:the |my )?(?:leadership|growth|success|innovation|hiring|scaling) (?:framework|playbook|matrix|formula|pyramid|flywheel)/i,
      /(?:here'?s|this is) (?:my|the|a) (?:framework|system|method|approach|model|process)/i,
      /(?:step 1|phase 1|pillar 1|principle 1|rule 1)[.:]/im,
      /(?:align|execute|iterate|optimize|scale)\s*→\s*(?:align|execute|iterate|optimize|scale|repeat|grow)/i,
      /(?:vision|mission|strategy|execution|culture)\s*[>→➡️]\s*(?:vision|mission|strategy|execution|culture|results)/i
    ];
    const buzzwordDensity = /(?:leverage|optimize|scale|align|execute|iterate|innovate|disrupt|transform|empower|unlock|accelerate)/gi;
    const buzzMatches = text.match(buzzwordDensity) || [];

    const frameworkMatch = frameworkSpeak.some(p => p.test(text));
    if (frameworkMatch) {
      const pts = buzzMatches.length >= 3 ? 2.0 : 1.5;
      return { detected: true, points: pts, icon: '🗺️', label: 'Strategy Cosplay', detail: 'Vague strategy framework that sounds impressive but says nothing' };
    }
    // Also catch heavy buzzword stacking even without explicit framework
    if (buzzMatches.length >= 5) {
      return { detected: true, points: 1.25, icon: '🗺️', label: 'Strategy Cosplay', detail: `${buzzMatches.length} strategy buzzwords in one post — that's not a strategy, that's a word salad` };
    }
    return null;
  },

  // Self-promotion disguised as reflection/gratitude
  detectHumblePromo(text) {
    const reflectionFrame = /(?:what (?:i'?ve|i have) learned|looking back|reflecting on|lessons from|(?:it'?s been|it has been) (?:a |an |\d+ )|anniversary|birthday|milestone|journey)/i;
    const selfPromo = /(?:check (?:out|it)|buy (?:a |my |the )|grab (?:a |your |my )|order (?:your|a|my)|get (?:your |a )?copy|suggest it to|spread the word|share (?:it |this )?with|available (?:on|at|now)|link (?:in |below|here)|get (?:it |the book |tickets )(?:here|at|on))/i;
    const humbleBrag = /(?:\d+ (?:podcasts?|TV|talks?|speaking|interviews?|keynotes?|articles?|countries|cities|downloads?|readers?|copies|clients?|customers?))/i;

    const hasReflection = reflectionFrame.test(text);
    const hasPromo = selfPromo.test(text);
    const hasBrag = humbleBrag.test(text);

    if (hasReflection && hasPromo) {
      let pts = 1.5;
      if (hasBrag) pts = 2.0;
      return { detected: true, points: pts, icon: '🎁', label: 'Humble Promo', detail: 'Self-promotion gift-wrapped as a personal reflection' };
    }
    if (hasReflection && hasBrag) {
      return { detected: true, points: 1.25, icon: '🎁', label: 'Humble Promo', detail: 'Listing accomplishments disguised as gratitude' };
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
      'detectHumblebait', 'detectGratitudeTheater', 'detectTraumaFlex', 'detectEchoChamber',
      'detectPivotBrag', 'detectEmpathyCosplay', 'detectLinkedInfluencer',
      // Tier 3
      'detectEmojiAbuse', 'detectBroetry', 'detectCorporateJargon', 'detectNarcissismIndex',
      'detectDramaticBreaks', 'detectHashtagSpam', 'detectCorporateHaiku', 'detectSelfieSermon',
      'detectRecruiterBait', 'detectLinkedInness', 'detectInfomercial',
      'detectFortuneCookie', 'detectLetterCloser', 'detectThirdPersonSelfPromo',
      'detectCopypasta', 'detectAtFirstThenRealized', 'detectOverworkBrag',
      'detectFacebookOnLinkedIn', 'detectDisproportionateGratitude',
      'detectSelfFanFiction', 'detectItsCrazyToMe', 'detectAISlop',
      'detectMotivationalMundanity', 'detectAgreephishing', 'detectQuestionFarming',
      'detectStealthModeFlex', 'detectLazyPollBait', 'detectTagBrigade',
      'detectUnpopularOpinionTheater', 'detectReluctantPoster', 'detectStrangerWisdom',
      'detectMundaneEpiphany', 'detectCarouselCommander', 'detectFakeJobTitle',
      'detectHeresWhyClickbait', 'detectTragedyMining', 'detectEmpireBuilder',
      'detectExclamationAnnouncement', 'detectStrategerey', 'detectHumblePromo',
      'detectSilverMedalSermon',
      // Negative
      'detectHasLinks', 'detectHasCode', 'detectShortFactual', 'detectSharesOthers',
      'detectNewJobAnnouncement'
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
