#!/usr/bin/env node
/**
 * PostToast Bundle & Manifest QA
 * Catches the class of bugs that scoring tests can't:
 * - Module loading / scope issues
 * - Manifest misconfigurations
 * - Stale bundles
 * - Recurring regressions
 *
 * Run: node tests/run-bundle-qa.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));

let passed = 0;
let failed = 0;
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

function section(name) {
  process.stdout.write(`\n  ${name}: `);
}

// ═══════════════════════════════════════════════════
//  1. BUNDLE MODULE DEFINITIONS
// ═══════════════════════════════════════════════════

const bundle = read('src/posttoast-bundle.js');

section('Bundle — module definitions');

const requiredModules = [
  'PostToastRubric',
  'PostToastSignals',
  'PostToastScorer',
  'PostToastExtractor',
  'PostToastBadge',
  'PostToastBreakdown',
  'PostToastObserver'
];

// All 7 modules must be defined
for (const mod of requiredModules) {
  const pattern = new RegExp(`^const ${mod}\\s*=`, 'm');
  assert(pattern.test(bundle), `Module "${mod}" defined in bundle`);
}

// Correct order (each module's definition line must come after the previous)
section('Bundle — module order');
const positions = requiredModules.map(mod => {
  const match = bundle.match(new RegExp(`^const ${mod}\\s*=`, 'm'));
  return match ? match.index : -1;
});
for (let i = 1; i < positions.length; i++) {
  assert(
    positions[i] > positions[i - 1],
    `${requiredModules[i]} comes after ${requiredModules[i - 1]}`
  );
}

// ═══════════════════════════════════════════════════
//  2. REGRESSION: window[name] BUG (v1.3.1, v1.4.0)
// ═══════════════════════════════════════════════════

section('Regression — no window[name] dependency checks');

const windowNameMatches = bundle.match(/window\[.*name\]/g);
assert(
  !windowNameMatches,
  'Bundle must not contain window[name] pattern'
);

// Also check source file directly
const contentJs = read('src/content.js');
const contentWindowName = contentJs.match(/window\[.*name\]/g);
assert(
  !contentWindowName,
  'content.js source must not contain window[name] pattern'
);

// Verify checkDependencies uses typeof directly
assert(
  contentJs.includes('typeof PostToastExtractor'),
  'checkDependencies uses typeof PostToastExtractor (not window)'
);
assert(
  contentJs.includes('typeof PostToastObserver'),
  'checkDependencies uses typeof PostToastObserver (not window)'
);
assert(
  contentJs.includes('typeof PostToastBadge'),
  'checkDependencies uses typeof PostToastBadge (not window)'
);

// ═══════════════════════════════════════════════════
//  3. REGRESSION: Multiple JS files in content_scripts
// ═══════════════════════════════════════════════════

section('Regression — single bundle in manifest');

const manifest = JSON.parse(read('manifest.json'));
const csJs = manifest.content_scripts[0].js;
assert(csJs.length === 1, 'Only one JS file in content_scripts');
assert(csJs[0] === 'src/posttoast-bundle.js', 'Content script is the bundle');

// ═══════════════════════════════════════════════════
//  4. MANIFEST INTEGRITY
// ═══════════════════════════════════════════════════

section('Manifest — file references exist');

// All files referenced in manifest must exist
const manifestFiles = [
  ...csJs,
  ...manifest.content_scripts[0].css,
  manifest.background.service_worker,
  manifest.action.default_popup,
  ...Object.values(manifest.action.default_icon),
  ...Object.values(manifest.icons)
];

for (const f of [...new Set(manifestFiles)]) {
  assert(exists(f), `Referenced file exists: ${f}`);
}

// MV3
assert(manifest.manifest_version === 3, 'Manifest version is 3');

// Permissions minimal
assert(
  manifest.permissions.length <= 2,
  `Permissions are minimal (${manifest.permissions.length} ≤ 2)`
);
assert(
  !manifest.permissions.includes('tabs'),
  'No "tabs" permission (not needed)'
);
assert(
  !manifest.permissions.includes('activeTab'),
  'No "activeTab" permission (not needed)'
);

// Host permissions scoped to LinkedIn only
assert(
  manifest.host_permissions.length === 1 &&
  manifest.host_permissions[0] === 'https://www.linkedin.com/*',
  'Host permissions scoped to LinkedIn only'
);

// ═══════════════════════════════════════════════════
//  5. BUNDLE FRESHNESS
// ═══════════════════════════════════════════════════

section('Bundle — freshness check');

const sourceOrder = [
  'src/rubric.js',
  'src/signals.js',
  'src/scorer.js',
  'src/extractor.js',
  'src/badge.js',
  'src/breakdown.js',
  'src/observer.js',
  'src/content.js'
];

const expectedBundle = sourceOrder.map(f => read(f)).join('');
assert(
  bundle === expectedBundle,
  'Bundle matches concatenation of source files (not stale)'
);

// ═══════════════════════════════════════════════════
//  6. REGRESSION: IntersectionObserver gate
// ═══════════════════════════════════════════════════

section('Regression — no IO gate on initial scoring');

const observerJs = read('src/observer.js');
// scoreVisiblePosts should exist
assert(
  observerJs.includes('scoreVisiblePosts'),
  'Observer has scoreVisiblePosts function'
);
// scoreVisiblePosts must be called directly in init(), not only inside IO callback
// The fix: init() must call this.scoreVisiblePosts() outside the IO constructor
const initBlock = observerJs.match(/init\(\)\s*\{[\s\S]*?scoreVisiblePosts/);
const ioBlock = observerJs.match(/new IntersectionObserver\(([\s\S]*?)\}\s*,/);
// Verify scoreVisiblePosts is called at top level of init, not only inside IO callback
const ioCallbackBody = ioBlock ? ioBlock[1] : '';
assert(
  !ioCallbackBody.includes('scoreVisiblePosts'),
  'scoreVisiblePosts not called inside IntersectionObserver callback'
);
assert(
  initBlock !== null,
  'scoreVisiblePosts called directly in init()'
);

// ═══════════════════════════════════════════════════
//  7. VERSION CONSISTENCY
// ═══════════════════════════════════════════════════

section('Version — consistency');

// Version format check
assert(
  /^\d+\.\d+\.\d+$/.test(manifest.version),
  `Version format is semver: ${manifest.version}`
);

// ═══════════════════════════════════════════════════
//  8. CONTENT SCRIPT SAFETY
// ═══════════════════════════════════════════════════

section('Content script — safety checks');

// No eval or Function constructor
assert(!bundle.includes('eval('), 'No eval() in bundle');
assert(
  !bundle.match(/new\s+Function\s*\(/),
  'No new Function() in bundle'
);

// No external network requests (fetch, XMLHttpRequest)
assert(!bundle.includes('fetch('), 'No fetch() calls in bundle');
assert(!bundle.includes('XMLHttpRequest'), 'No XMLHttpRequest in bundle');

// No data exfiltration vectors
assert(
  !bundle.includes('sendBeacon'),
  'No navigator.sendBeacon in bundle'
);

// ═══════════════════════════════════════════════════
//  RESULTS
// ═══════════════════════════════════════════════════

console.log('\n');
console.log('══════════════════════════════════════════════════');
console.log(`  BUNDLE QA: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('══════════════════════════════════════════════════');

if (failures.length > 0) {
  console.log('\n  FAILURES:');
  failures.forEach(f => console.log(`    ✗ ${f}`));
}

process.exit(failed > 0 ? 1 : 0);
