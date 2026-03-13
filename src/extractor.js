// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast DOM Extractor v1.4.0
 * Resilient layered selector approach for LinkedIn's A/B-tested DOM.
 *
 * Strategy layers (tried in order):
 *   Layer 1 — URN-based selectors (data-urn, data-id)
 *   Layer 2 — CSS class selectors (feed-shared-update-v2, occludable-update, etc.)
 *   Layer 3 — Structural detection fallback (walk DOM for repeated containers)
 *
 * Feed wrapper detection scopes queries to the main feed area first.
 */
const PostToastExtractor = {

  // ── Feed wrapper selectors (most specific → universal) ──
  FEED_WRAPPERS: [
    'div[data-testid="mainFeed"]',
    'div[componentkey*="mainFeed"]',
    '.scaffold-finite-scroll--infinite',
    '.scaffold-finite-scroll__content',
    'ol.feed-container',
    '.core-rail'
    // NOTE: 'main' deliberately excluded — LinkedIn's posts aren't always
    // descendants of <main>, so it scopes the search to the wrong subtree.
    // Falls through to document.body instead (see getFeedRoot).
  ],

  // ── Post container selectors by layer ──
  LAYERS: {
    // Layer 1: URN-based (most stable across A/B tests)
    urn: [
      '[data-urn^="urn:li:activity"]',
      '[data-id^="urn:li:activity"]',
      '[data-urn^="urn:li:aggregate"]',
      '[data-id^="urn:li:aggregate"]'
    ],
    // Layer 2: CSS class selectors (change every 2-4 weeks)
    css: [
      '.feed-shared-update-v2',
      '.occludable-update',
      '.update-components-update',
      'article[data-id="main-feed-card"]'
    ],
    // Layer 2.5: Data-attribute selectors (LinkedIn tracking attrs, hashed-class DOM variant)
    dataAttr: [
      'div[data-view-tracking-scope][data-display-contents="true"]'
    ],
    // Layer 3: Structural (no class/attribute dependency)
    structural: null // handled by detectPostsStructurally()
  },

  // ── Post text selectors ──
  TEXT_SELECTORS: [
    '.feed-shared-text span[dir="ltr"]',
    '.feed-shared-update-v2__description span[dir="ltr"]',
    '.update-components-text span[dir="ltr"]',
    '.break-words span[dir="ltr"]',
    '.feed-shared-text',
    '.update-components-text .break-words',
    '.feed-shared-inline-show-more-text span[dir="ltr"]',
    '.feed-shared-update-v2__commentary span[dir="ltr"]',
    '.feed-shared-update-v2__commentary .break-words'
  ],

  // ── Post author selectors ──
  AUTHOR_SELECTORS: [
    '.feed-shared-actor__name span[aria-hidden="true"]',
    '.update-components-actor__name span[aria-hidden="true"]',
    '.feed-shared-actor__name'
  ],

  // ── Internal state ──
  _lastStrategy: null,
  _feedRoot: null,

  // ══════════════════════════════════════════════════════════
  //  Feed wrapper detection
  // ══════════════════════════════════════════════════════════

  /**
   * Find the feed wrapper element. Caches the result until it's detached.
   */
  getFeedRoot() {
    // Return cached root if still in DOM
    if (this._feedRoot && this._feedRoot !== document.body && document.contains(this._feedRoot)) {
      return this._feedRoot;
    }

    // Cache invalidated — try specific wrappers
    for (const sel of this.FEED_WRAPPERS) {
      const el = document.querySelector(sel);
      if (el) {
        this._feedRoot = el;
        this._feedRootSelector = sel;
        console.log('[PostToast Extractor] Feed root found via:', sel);
        return el;
      }
    }

    // No specific wrapper found — use document.body (unscoped search).
    // Don't cache body so we keep retrying specific wrappers next call.
    console.log('[PostToast Extractor] No feed wrapper found, using document.body (unscoped)');
    return document.body;
  },

  // ══════════════════════════════════════════════════════════
  //  Layer 3: Structural detection
  // ══════════════════════════════════════════════════════════

  /**
   * Walk the DOM looking for repeated sibling containers that look like posts.
   * A post-like container has: substantial text content AND engagement-like buttons.
   */
  detectPostsStructurally(root) {
    const candidates = [];

    // Look for <main> or largest scrollable area
    const searchRoot = root || this.getFeedRoot();

    // Strategy: find direct children of list-like containers (ol, ul, div with many children)
    const listContainers = searchRoot.querySelectorAll('ol, ul, div');

    for (const container of listContainers) {
      const children = Array.from(container.children);
      if (children.length < 3) continue; // need at least 3 siblings to look like a feed

      // Check if children look like post containers
      let postLikeCount = 0;
      const postLike = [];

      for (const child of children) {
        if (this._looksLikePost(child)) {
          postLikeCount++;
          postLike.push(child);
        }
      }

      // If 3+ siblings look like posts, we found the feed
      if (postLikeCount >= 3) {
        candidates.push(...postLike);
        break; // use the first matching container
      }
    }

    return candidates;
  },

  /**
   * Heuristic: does this element look like a LinkedIn post?
   * Must have: text > 50 chars AND some interactive element (button/link with engagement text).
   */
  _looksLikePost(el) {
    // Skip tiny or hidden elements
    if (!el || el.offsetHeight < 50) return false;

    const text = (el.innerText || '').trim();
    if (text.length < 50) return false;

    // Must have at least one button or interactive element (like, comment, share, repost)
    const buttons = el.querySelectorAll('button, [role="button"]');
    if (buttons.length < 2) return false;

    // Check for engagement-like button text
    const buttonTexts = Array.from(buttons).map(b => (b.innerText || b.getAttribute('aria-label') || '').toLowerCase());
    const engagementWords = ['like', 'comment', 'share', 'repost', 'send', 'react', 'love', 'celebrate', 'support', 'insightful', 'funny'];
    const hasEngagement = buttonTexts.some(t => engagementWords.some(w => t.includes(w)));

    return hasEngagement;
  },

  // ══════════════════════════════════════════════════════════
  //  Shared/Reshared post filtering
  // ══════════════════════════════════════════════════════════

  /**
   * Reshared post selectors — containers that wrap the original post
   * inside a shared/reposted feed item.
   */
  RESHARE_WRAPPERS: [
    '.feed-shared-update-v2__reshared-content',
    '[class*="reshared"]',
    '[class*="repost"]',
    '[class*="shared-content"]'
  ],

  /**
   * Filter out posts that are nested inside another post (reshared/reposted).
   * Only top-level feed items should be scored — their extractText() already
   * captures the combined sharer + original text as a single unit.
   */
  _filterNestedPosts(posts) {
    return posts.filter(post => {
      // Check if this post is inside a reshare wrapper
      for (const sel of this.RESHARE_WRAPPERS) {
        if (post.closest(sel)) return false;
      }
      // Check if this post is nested inside another post element
      // (i.e., a post whose ancestor is also in the posts array)
      for (const other of posts) {
        if (other !== post && other.contains(post)) return false;
      }
      return true;
    });
  },

  // ══════════════════════════════════════════════════════════
  //  Core API
  // ══════════════════════════════════════════════════════════

  /**
   * Get all posts in the feed using the layered strategy.
   * Returns { posts: Element[], strategy: string }
   */
  getAllPostsWithStrategy() {
    const root = this.getFeedRoot();

    // Layer 1: URN selectors
    for (const sel of this.LAYERS.urn) {
      const posts = root.querySelectorAll(sel);
      if (posts.length > 0) {
        this._lastStrategy = 'urn:' + sel;
        const filtered = this._filterNestedPosts(Array.from(posts));
        return { posts: filtered, strategy: this._lastStrategy };
      }
    }

    // Layer 2: CSS class selectors
    for (const sel of this.LAYERS.css) {
      const posts = root.querySelectorAll(sel);
      if (posts.length > 0) {
        this._lastStrategy = 'css:' + sel;
        const filtered = this._filterNestedPosts(Array.from(posts));
        return { posts: filtered, strategy: this._lastStrategy };
      }
    }

    // Layer 2.5: Data-attribute selectors (hashed-class DOM variant)
    for (const sel of this.LAYERS.dataAttr) {
      const posts = root.querySelectorAll(sel);
      // Filter to only post-like elements (skip composer, sort bar, dividers)
      const realPosts = Array.from(posts).filter(el => {
        const text = (el.innerText || el.textContent || '').trim();
        return text.length > 100;
      });
      if (realPosts.length > 0) {
        this._lastStrategy = 'dataAttr:' + sel;
        const filtered = this._filterNestedPosts(realPosts);
        return { posts: filtered, strategy: this._lastStrategy };
      }
    }

    // Layer 3: Structural detection
    const structuralPosts = this.detectPostsStructurally(root);
    if (structuralPosts.length > 0) {
      this._lastStrategy = 'structural';
      const filtered = this._filterNestedPosts(structuralPosts);
      return { posts: filtered, strategy: this._lastStrategy };
    }

    this._lastStrategy = 'none';
    return { posts: [], strategy: 'none' };
  },

  /**
   * Get all posts (backward-compatible — returns just the array).
   */
  getAllPosts() {
    const result = this.getAllPostsWithStrategy();
    if (result.posts.length > 0 && this._lastStrategy !== this._loggedStrategy) {
      console.log(`[PostToast Extractor] Found ${result.posts.length} posts via ${result.strategy}`);
      this._loggedStrategy = this._lastStrategy;
    }
    return result.posts;
  },

  /**
   * Find the post container for a given element (e.g., from a click event).
   */
  findPostContainer(element) {
    // Try URN selectors first (most reliable for .closest())
    for (const sel of this.LAYERS.urn) {
      const container = element.closest(sel);
      if (container) return container;
    }
    // Then CSS selectors
    for (const sel of this.LAYERS.css) {
      const container = element.closest(sel);
      if (container) return container;
    }
    // Then data-attribute selectors
    for (const sel of this.LAYERS.dataAttr) {
      const container = element.closest(sel);
      if (container) return container;
    }
    return null;
  },

  /**
   * Extract post text from a post element.
   */
  extractText(postElement) {
    // Try specific selectors first
    for (const selector of this.TEXT_SELECTORS) {
      const elements = postElement.querySelectorAll(selector);
      if (elements.length > 0) {
        const text = Array.from(elements)
          .map(el => el.innerText || el.textContent)
          .join('\n')
          .trim();
        if (this._extractDiag < 3) {
          console.warn('[PostToast DIAG] extractText: matched selector', selector, 'len=' + text.length);
          this._extractDiag = (this._extractDiag || 0) + 1;
        }
        return text;
      }
    }
    // Hashed-class fallback: find the largest text block that isn't
    // button/engagement text. Walk child divs, pick the one with most text.
    const candidates = postElement.querySelectorAll('div, span, p');
    let bestText = '';
    const containerLen = (postElement.innerText || '').length;
    let skippedBy90 = 0;
    for (const el of candidates) {
      // Skip if it's a button or inside a button
      if (el.closest('button, [role="button"]')) continue;
      const text = (el.innerText || el.textContent || '').trim();
      // Want the longest text block that's clearly post content
      if (text.length > bestText.length && text.length > 50) {
        // Make sure this isn't the entire post container (too much noise)
        if (text.length < containerLen * 0.9) {
          bestText = text;
        } else {
          skippedBy90++;
        }
      }
    }
    if (this._extractDiag === undefined) this._extractDiag = 0;
    if (this._extractDiag < 5) {
      console.warn('[PostToast DIAG] extractText hashed-class fallback:',
        'candidates=' + candidates.length,
        'containerLen=' + containerLen,
        'bestTextLen=' + bestText.length,
        'skippedBy90Filter=' + skippedBy90);
      this._extractDiag++;
    }
    if (bestText.length > 50) return bestText;
    // Ultimate fallback: full innerText
    const allText = postElement.innerText || '';
    if (this._extractDiag < 8) {
      console.warn('[PostToast DIAG] extractText ultimate fallback: allTextLen=' + allText.length);
      this._extractDiag++;
    }
    return allText.length > 50 ? allText : '';
  },

  /**
   * Extract author name from a post element.
   */
  extractAuthor(postElement) {
    for (const selector of this.AUTHOR_SELECTORS) {
      const el = postElement.querySelector(selector);
      if (el) return (el.innerText || el.textContent || '').trim();
    }
    return 'Unknown';
  },

  /**
   * Get the URN identifier for a post element.
   */
  getPostUrn(postElement) {
    // Check data-urn first
    const urn = postElement.getAttribute('data-urn');
    if (urn) return urn;
    // Check data-id
    const dataId = postElement.getAttribute('data-id');
    if (dataId && dataId.startsWith('urn:li:')) return dataId;
    // Search children
    const urnEl = postElement.querySelector('[data-urn]');
    if (urnEl) return urnEl.getAttribute('data-urn');
    const idEl = postElement.querySelector('[data-id^="urn:li:"]');
    if (idEl) return idEl.getAttribute('data-id');
    return null;
  },

  /**
   * Return the last successful selector strategy (for diagnostics).
   */
  getLastStrategy() {
    return this._lastStrategy;
  }
};
