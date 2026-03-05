#!/usr/bin/env node
/**
 * PostToast v1.4.0 QA Test Suite
 * Standalone Node.js test runner — zero dependencies.
 *
 * Tests:
 *  - Extractor layer strategy (URN, CSS, structural, feed wrappers)
 *  - Scorer signal detection (all tiers)
 *  - Score math (compound multiplier, negative signals, clamping)
 *  - Credentialed rant signal tests (15 cases)
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = (() => {
  // Inline minimal DOM shim for testing — no jsdom needed
  // We mock the DOM API surface that PostToast uses
  return { JSDOM: null };
})();

// ═══════════════════════════════════════════════════
//  Load source modules into a shared scope
// ═══════════════════════════════════════════════════

// Shim browser globals
global.chrome = {
  runtime: { getManifest: () => ({ version: '1.4.0' }) },
  storage: { sync: { get: (k, cb) => cb({}) }, onChanged: { addListener: () => {} } }
};
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
global.MutationObserver = class { observe() {} disconnect() {} };
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  body: { querySelectorAll: () => [] },
  readyState: 'complete',
  addEventListener: () => {},
  contains: () => true
};

// Load source files in order (they declare globals via vm.runInThisContext)
const vm = require('vm');
const srcDir = path.join(__dirname, '..', 'src');
const loadOrder = ['rubric.js', 'signals.js', 'scorer.js', 'extractor.js'];
for (const file of loadOrder) {
  const code = fs.readFileSync(path.join(srcDir, file), 'utf8');
  // Strip console.log to reduce noise
  const quietCode = code.replace(/console\.log\(/g, '(() => {})(');
  try {
    vm.runInThisContext(quietCode, { filename: file });
  } catch (e) {
    console.error(`Failed to load ${file}:`, e.message);
  }
}

// ═══════════════════════════════════════════════════
//  Test framework
// ═══════════════════════════════════════════════════

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];

function assert(condition, name) {
  if (condition) {
    passed++;
    process.stdout.write('.');
  } else {
    failed++;
    failures.push(name);
    process.stdout.write('F');
  }
}

function assertEqual(actual, expected, name) {
  if (actual === expected) {
    passed++;
    process.stdout.write('.');
  } else {
    failed++;
    failures.push(`${name} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    process.stdout.write('F');
  }
}

function section(name) {
  process.stdout.write(`\n  ${name}: `);
}

// ═══════════════════════════════════════════════════
//  1. EXTRACTOR TESTS (selector layers)
// ═══════════════════════════════════════════════════

section('Extractor — feed wrapper list');
assert(PostToastExtractor.FEED_WRAPPERS.length >= 5, 'At least 5 feed wrapper selectors');
assert(PostToastExtractor.FEED_WRAPPERS[0] === 'div[data-testid="mainFeed"]', 'First wrapper is data-testid=mainFeed');
assert(PostToastExtractor.FEED_WRAPPERS.includes('main'), 'main is a fallback wrapper');

section('Extractor — URN layer');
assert(PostToastExtractor.LAYERS.urn.length >= 4, 'At least 4 URN selectors');
assert(PostToastExtractor.LAYERS.urn[0].includes('data-urn'), 'First URN selector uses data-urn');
assert(PostToastExtractor.LAYERS.urn.some(s => s.includes('data-id')), 'Has data-id URN selector');

section('Extractor — CSS layer');
assert(PostToastExtractor.LAYERS.css.length >= 4, 'At least 4 CSS selectors');
assert(PostToastExtractor.LAYERS.css.includes('.feed-shared-update-v2'), 'Has feed-shared-update-v2');
assert(PostToastExtractor.LAYERS.css.includes('.occludable-update'), 'Has occludable-update');
assert(PostToastExtractor.LAYERS.css.includes('.update-components-update'), 'Has update-components-update');
assert(PostToastExtractor.LAYERS.css.some(s => s.includes('main-feed-card')), 'Has main-feed-card article');

section('Extractor — structural fallback');
assert(typeof PostToastExtractor.detectPostsStructurally === 'function', 'Has structural detection method');
assert(typeof PostToastExtractor._looksLikePost === 'function', 'Has _looksLikePost heuristic');

section('Extractor — strategy logging');
assert(typeof PostToastExtractor.getLastStrategy === 'function', 'Has getLastStrategy()');
assert(typeof PostToastExtractor.getAllPostsWithStrategy === 'function', 'Has getAllPostsWithStrategy()');

section('Extractor — text selectors');
assert(PostToastExtractor.TEXT_SELECTORS.length >= 8, 'At least 8 text selectors');

section('Extractor — author selectors');
assert(PostToastExtractor.AUTHOR_SELECTORS.length >= 3, 'At least 3 author selectors');

section('Extractor — getPostUrn checks data-id');
// Verify getPostUrn tries data-id attribute too
const getPostUrnStr = PostToastExtractor.getPostUrn.toString();
assert(getPostUrnStr.includes('data-id'), 'getPostUrn checks data-id attribute');

// ═══════════════════════════════════════════════════
//  2. SCORER / SIGNAL TESTS — Tier 1
// ═══════════════════════════════════════════════════

section('Signals — Fabricated Parable');
assert(PostToastSignals.detectFabricatedParable('A homeless man once taught me about leadership. I was broke and sleeping on a couch. Then one day everything changed. The lesson? Never give up.').detected, 'Classic parable detected');
assert(!PostToastSignals.detectFabricatedParable('Just shipped a new feature. Here is the changelog.'), 'Non-parable not flagged');

section('Signals — Firing Genre');
assert(PostToastSignals.detectFiringGenre('I fired my top performer and here\'s why').detected, 'Firing genre detected');
assert(!PostToastSignals.detectFiringGenre('We shipped a hotfix for the login page'), 'Non-firing not flagged');

section('Signals — Privilege Vulnerability');
assert(PostToastSignals.detectPrivilegeVulnerability('I was crying in my Tesla after the board meeting. Anxiety is real even for CEOs.').detected, 'Privilege + vulnerability detected');
assert(!PostToastSignals.detectPrivilegeVulnerability('I was crying because I lost my wallet'), 'Vulnerability without privilege not flagged');

section('Signals — Stolen Valor');
assert(PostToastSignals.detectStolenValor('A friend once told me something that blew my mind. A few years ago, true story, that\'s when I knew.').detected, 'Stolen valor detected');

// ═══════════════════════════════════════════════════
//  3. SCORER / SIGNAL TESTS — Tier 2
// ═══════════════════════════════════════════════════

section('Signals — Humble Brag');
assert(PostToastSignals.detectHumbleBrag('I\'m so humbled to announce my promotion').detected, 'Humble brag detected');
assert(PostToastSignals.detectHumbleBrag('Thrilled to announce our Series B').detected, 'Thrilled variant detected');

section('Signals — Thought Leader');
assert(PostToastSignals.detectThoughtLeader('Here\'s what nobody tells you about leadership').detected, 'Thought leader detected');
assert(PostToastSignals.detectThoughtLeader('Unpopular opinion: remote work is better').detected, 'Unpopular opinion detected');

section('Signals — Engagement Bait');
assert(PostToastSignals.detectEngagementBait('Agree? 👇 Drop a comment below').detected, 'Engagement bait detected');
assert(PostToastSignals.detectEngagementBait('Who else feels this way?').detected, 'Who else detected');

section('Signals — Toxic Positivity');
assert(PostToastSignals.detectToxicPositivity('Every rejection is a redirection. Grateful for the struggle.').detected, 'Toxic positivity detected');

section('Signals — Name Drop');
assert(PostToastSignals.detectNameDrop('As Elon Musk once said').detected, 'Name drop detected');
assert(PostToastSignals.detectNameDrop('Working at Google taught me everything').detected, 'Company drop detected');

section('Signals — Selfless Hiring');
assert(PostToastSignals.detectSelflessHiring('I hired someone everyone else rejected. Gap in their resume? I didn\'t care.').detected, 'Selfless hiring detected');

section('Signals — Humblebait');
assert(PostToastSignals.detectHumblebait('I\'m not sure I should share this, but...').detected, 'Humblebait detected');

section('Signals — Gratitude Theater');
assert(PostToastSignals.detectGratitudeTheater('Thank you to everyone who has supported me on this incredible meaningful journey. Endless gratitude to this wonderful community of amazing people who have been generous with their time and connections. I couldn\'t have done this without all of you.').detected, 'Gratitude theater detected');

section('Signals — Trauma Flex');
assert(PostToastSignals.detectTraumaFlex('I was broke and sleeping on a couch. Now I run a 7-figure company.').detected, 'Trauma flex detected');

section('Signals — Echo Chamber');
assert(PostToastSignals.detectEchoChamber('Unpopular opinion: be kind to people and treat them well').detected, 'Echo chamber detected');

section('Signals — Pivot Brag');
assert(PostToastSignals.detectPivotBrag('I left my $200k corporate job to follow my passion. Everyone thought I was crazy.').detected, 'Pivot brag detected');

section('Signals — Empathy Cosplay');
assert(PostToastSignals.detectEmpathyCosplay('I stopped to talk to the janitor. Everyone walked past but I stopped.').detected, 'Empathy cosplay detected');

section('Signals — LinkedInfluencer');
assert(PostToastSignals.detectLinkedInfluencer('As Steve Jobs once said, think different.').detected, 'LinkedInfluencer detected');

// ═══════════════════════════════════════════════════
//  4. CREDENTIALED RANT TESTS (15 cases)
// ═══════════════════════════════════════════════════

section('Signals — Credentialed Rant');

const rantTests = [
  { text: 'As a marketing professional with 15 years of experience, I was shocked by what I saw at the conference.', expect: true, name: 'Years + shocked' },
  { text: 'As someone who has spent 20 years in HR, I was appalled by the hiring practices.', expect: true, name: 'Spent years + appalled' },
  { text: 'Having spent the last 10 years building teams, I couldn\'t believe what I just witnessed.', expect: true, name: 'Having spent + couldn\'t believe' },
  { text: 'In my 12 years of product management, I have never been so disappointed by a launch.', expect: true, name: 'In my years + disappointed' },
  { text: 'As a former engineering leader, I was stunned by the code quality.', expect: true, name: 'Former leader + stunned' },
  { text: 'As someone who has hired over 500 people, imagine my surprise when I saw this resume.', expect: true, name: 'Someone who has + imagine my surprise' },
  { text: 'With over 8 years in cybersecurity, I was horrified to find their API keys on GitHub.', expect: true, name: 'With years + horrified' },
  { text: 'As a UX researcher with 6 years doing usability studies, I was baffled by the checkout flow.', expect: true, name: 'UX researcher + baffled' },
  { text: 'After having spent 15 years in sales, I was floored by the pitch deck.', expect: true, name: 'After spent + floored' },
  { text: 'As someone who has managed teams of 50+, I was furious when I saw the new policy. Here\'s the thing: leaders need to do better.', expect: true, name: 'Full trifecta: credential + outrage + sermon' },
  { text: 'I like tacos on Tuesday.', expect: false, name: 'Irrelevant text' },
  { text: 'I was shocked by the weather today.', expect: false, name: 'Outrage without credential' },
  { text: 'As an engineer, I think React is great.', expect: false, name: 'Credential without outrage' },
  { text: 'The new iPhone is interesting.', expect: false, name: 'Neutral statement' },
  { text: 'Just shipped a bug fix. Back to work.', expect: false, name: 'Factual short post' }
];

for (const t of rantTests) {
  const result = PostToastSignals.detectCredentialedRant(t.text);
  const detected = result ? result.detected : false;
  assert(detected === t.expect, `Rant: ${t.name}`);
}

// ═══════════════════════════════════════════════════
//  5. SCORER / SIGNAL TESTS — Tier 3
// ═══════════════════════════════════════════════════

section('Signals — Emoji Abuse');
assert(PostToastSignals.detectEmojiAbuse('🚀🚀🚀 Launching our new product! 🎯💡🙏🔥🌟✨').detected, 'Emoji abuse detected');

section('Signals — Broetry');
assert(PostToastSignals.detectBroetry('I quit.\nThey laughed.\nI cried.\nI built.\nI shipped.\nThey copied.\nI won.').detected, 'Broetry detected');

section('Signals — Corporate Jargon');
assert(PostToastSignals.detectCorporateJargon('We need to leverage synergy to move the needle and deep dive into the ecosystem.').detected, 'Jargon detected');

section('Signals — Narcissism Index');
assert(PostToastSignals.detectNarcissismIndex('I built my company. I hired my team. I made my vision real. I never gave up. I pushed through. I led from the front. My investors believed in my vision.').detected, 'Narcissism detected');

section('Signals — Hashtag Spam');
assert(PostToastSignals.detectHashtagSpam('#Leadership #Mindset #Hustle #Growth').detected, 'Hashtag spam detected');

section('Signals — AI Slop');
assert(PostToastSignals.detectAISlop('In today\'s ever-evolving landscape, it\'s crucial to delve into the realm of holistic solutions. Here\'s the thing: it\'s not just about innovation, it\'s about fostering meaningful connections. Let me be clear — the bottom line is transformative.').detected, 'AI slop detected');

section('Signals — Copypasta');
assert(PostToastSignals.detectCopypasta('A professor got up in front of the class. The whole room went silent. Then everybody clapped. That student\'s name? Albert Einstein.').detected, 'Copypasta detected');

section('Signals — Stranger Wisdom');
assert(PostToastSignals.detectStrangerWisdom('My Uber driver taught me the wisest thing about business I\'ve ever heard. It changed my perspective forever.').detected, 'Stranger wisdom detected');

section('Signals — Tragedy Mining');
assert(PostToastSignals.detectTragedyMining('My father passed away last year. Here are 5 leadership lessons he taught me.').detected, 'Tragedy mining detected');

// ═══════════════════════════════════════════════════
//  6. SCORER INTEGRATION TESTS
// ═══════════════════════════════════════════════════

section('Scorer — basic scoring');
{
  const r = PostToastScorer.score('Just shipped a bug fix. Back to work.');
  assert(r.score >= 0, 'Score is non-negative');
  assert(r.score <= 10, 'Score is at most 10');
  assert(typeof r.label === 'string', 'Has label');
  assert(Array.isArray(r.signals), 'Has signals array');
}

section('Scorer — low score for genuine post');
{
  const r = PostToastScorer.score('Here is a tutorial on using PostgreSQL indexes. SELECT * FROM users WHERE id = 1;');
  assert(r.score <= 2, 'Technical content scores low');
}

section('Scorer — high score for cringe post');
{
  const r = PostToastScorer.score('I\'m SO humbled to announce that I\'ve been named a thought leader. Here\'s what nobody tells you about leadership. Agree? 👇 Every rejection is a redirection. #Leadership #Mindset #Hustle #Growth 🚀🚀🚀');
  assert(r.score >= 5, 'Cringe post scores 5+');
}

section('Scorer — compound multiplier');
{
  const r = PostToastScorer.score('I\'m so humbled to announce my new role. Here\'s what nobody tells you about this journey. Agree? 👇 Grateful for the struggle. Everyone thought I was crazy when I left my cushy job.');
  assert(r.tier2Compound === true || r.tier2Count >= 2, 'Multiple tier 2 signals detected');
}

section('Scorer — negative signals reduce score');
{
  const r = PostToastScorer.score('Check out this tutorial: https://github.com/example. const x = 1;');
  assert(r.negativeSignals.length > 0, 'Has negative signals');
}

section('Scorer — score clamping');
{
  const r = PostToastScorer.score('Just shipped a bug fix.');
  assert(r.score >= 0, 'Score never goes below 0');
  // Even the worst post should clamp at 10
  const r2 = PostToastScorer.score('I\'m SO humbled. Unpopular opinion: be kind. Agree? 👇 Who else? Every rejection is a blessing. I was broke sleeping on a couch. Now I run a 7-figure empire. A homeless man taught me about leadership. I fired my top performer. As Steve Jobs once said. Grateful for the struggle. 🚀🚀🚀🚀🚀🚀🚀 #Leadership #Mindset #Hustle #Growth #CEO');
  assert(r2.score <= 10, 'Score never exceeds 10');
}

section('Scorer — color assignment');
{
  assertEqual(PostToastScorer.getColor(0), '#22c55e', 'Score 0 is green');
  assertEqual(PostToastScorer.getColor(3), '#22c55e', 'Score 3 is green');
  assertEqual(PostToastScorer.getColor(4), '#eab308', 'Score 4 is amber');
  assertEqual(PostToastScorer.getColor(6), '#eab308', 'Score 6 is amber');
  assertEqual(PostToastScorer.getColor(7), '#ef4444', 'Score 7 is red');
  assertEqual(PostToastScorer.getColor(10), '#ef4444', 'Score 10 is red');
}

section('Scorer — quarter-point rounding');
{
  const r = PostToastScorer.score('I\'m SO humbled to announce my new role. Agree? 👇');
  const decimal = r.score % 0.25;
  assert(Math.abs(decimal) < 0.001, 'Score is on quarter-point grid');
}

// ═══════════════════════════════════════════════════
//  7. RUBRIC TESTS
// ═══════════════════════════════════════════════════

section('Rubric — labels');
assertEqual(PostToastRubric.getLabel(0), 'Genuine Human', 'Label for 0');
assertEqual(PostToastRubric.getLabel(5), 'Half Bullshit', 'Label for 5');
assertEqual(PostToastRubric.getLabel(10), 'Pure Uncut BS', 'Label for 10');
assertEqual(PostToastRubric.getLabel(7.5), 'Full Cringe', 'Label for 7.5 (floors to 7)');

section('Rubric — roast headlines');
assert(typeof PostToastRubric.getRoastHeadline(0) === 'string', 'Has roast for 0');
assert(typeof PostToastRubric.getRoastHeadline(10) === 'string', 'Has roast for 10');

section('Rubric — tier weights');
assert(PostToastRubric.tier1.fabricatedParable.points >= 2, 'Tier 1 weights are heavy');
assert(PostToastRubric.tier2.humbleBrag.points >= 1, 'Tier 2 weights are moderate');
assert(PostToastRubric.tier3.emojiAbuse.points < 2, 'Tier 3 weights are light');

// ═══════════════════════════════════════════════════
//  8. NEW v1.4.0 SIGNALS
// ═══════════════════════════════════════════════════

section('Signals — Overwork Bragging');
{
  const r = PostToastSignals.detectOverworkBrag('I work 80 hours a week. While you were sleeping, I was grinding. No days off.');
  assert(r && r.detected, 'Overwork brag detected');
}

section('Signals — Self Fan Fiction');
{
  const r = PostToastSignals.detectSelfFanFiction('The CEO said "That\'s impossible." I replied "Watch me." Without batting an eye. The whole room was stunned.');
  assert(r && r.detected, 'Self fan fiction detected');
}

section('Signals — Mundane Epiphany');
{
  const r = PostToastSignals.detectMundaneEpiphany('I spilled my coffee this morning and it reminded me — sometimes things don\'t go as planned. The lesson? Let go.');
  assert(r && r.detected, 'Mundane epiphany detected');
}

section('Signals — Stealth Mode Flex');
{
  const r = PostToastSignals.detectStealthModeFlex('Building in stealth. Can\'t share much yet but something big is coming. Stay tuned.');
  assert(r && r.detected, 'Stealth flex detected');
}

section('Signals — Reluctant Poster');
{
  const r = PostToastSignals.detectReluctantPoster('I don\'t usually post on LinkedIn but this felt important.');
  assert(r && r.detected, 'Reluctant poster detected');
}

// ═══════════════════════════════════════════════════
//  RESULTS
// ═══════════════════════════════════════════════════

console.log('\n');
console.log('═'.repeat(50));
console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('═'.repeat(50));

if (failures.length > 0) {
  console.log('\n  FAILURES:');
  for (const f of failures) {
    console.log(`    ✗ ${f}`);
  }
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
