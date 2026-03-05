# PostToast QA Process

**Owner:** Geoffrey (automated, runs before every build/publish)
**Last updated:** 2026-03-05

---

## When QA Runs

1. **Every build** — before generating a zip or telling Lee it's ready
2. **Every version bump** — before pushing to GitHub
3. **On demand** — when Lee asks, or when investigating a bug

Geoffrey runs this without being asked. No build ships without a green QA pass.

---

## QA Tiers

### Tier 1: Automated Tests (run-tests.js)
**What it catches:** Scoring logic, signal detection, rubric weights, extractor selectors

```bash
node tests/run-tests.js
```

Must be 100% pass. No exceptions.

### Tier 2: Bundle Integrity Checks
**What it catches:** The v1.3.2 / v1.4.0 class of bugs — module loading, scope isolation, IIFE traps

These are in `tests/run-bundle-qa.js` and verify:
- Bundle contains all 7 module definitions in correct order
- No `window[name]` dependency checks (the recurring bug)
- Content script IIFE can resolve all module references
- Bundle is a strict superset of all source files (no stale code)
- `checkDependencies()` uses `typeof ModuleName` not `window[ModuleName]`

```bash
node tests/run-bundle-qa.js
```

### Tier 3: Manifest & Zip Validation
**What it catches:** Wrong files in zip, manifest pointing to missing files, version mismatches

Verified in `run-bundle-qa.js`:
- manifest.json `content_scripts.js` only references `src/posttoast-bundle.js`
- All files referenced in manifest exist
- Version in manifest matches expected version
- Zip excludes: `BUILD-SPEC.md`, `store/`, `tests/`, `.git/`, `.gitignore`
- No test files in zip
- Zip size sanity check (< 200KB)

### Tier 4: Regression Watchlist
**What it catches:** Known bugs that have recurred

| Bug | Versions Affected | Check |
|-----|-------------------|-------|
| `window[name]` dependency check | v1.3.1, v1.4.0 | Grep bundle for `window[name]` — must be zero matches |
| Multiple JS in content_scripts | v1.2.x | Manifest content_scripts.js must be exactly `["src/posttoast-bundle.js"]` |
| IntersectionObserver gate | v1.3.1 | Observer must call `scoreVisiblePosts()` directly, not gate on IO callback |
| Stale bundle | any | Bundle byte count must equal concatenation of source files |

---

## Build Checklist (Geoffrey follows this)

1. [ ] Pull latest from GitHub
2. [ ] Run `node tests/run-tests.js` — 100% pass
3. [ ] Run `node tests/run-bundle-qa.js` — 100% pass
4. [ ] If source files changed: rebuild bundle, re-run both test suites
5. [ ] Version bump in manifest.json
6. [ ] Rebuild zip (exclude BUILD-SPEC.md, store/, tests/, .git*)
7. [ ] Verify zip contents match expectations
8. [ ] Commit + push to GitHub
9. [ ] Send zip to Lee with QA summary

---

## Post-Incident Additions

When a new bug class is discovered:
1. Add a regression test to `run-bundle-qa.js`
2. Add it to the Regression Watchlist above
3. Document root cause in the daily memory file

This is a living document. It gets stricter over time, never looser.
