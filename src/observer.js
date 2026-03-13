// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast Observer v1.4.0
 * Watches for new posts loaded via infinite scroll and scores them.
 * Uses PostToastExtractor's feed wrapper detection for scoped observation.
 */
const PostToastObserver = {

  mutationObserver: null,
  intersectionObserver: null,
  scoreCache: new Map(),
  _initialized: false,

  init() {
    try {
      // Guard against double-initialization
      if (this._initialized) {
        console.log('[PostToast] Observer already initialized, skipping');
        return;
      }
      this._initialized = true;
      console.log('[PostToast] Initializing observer');
      
      // Set up IntersectionObserver FIRST
      this.intersectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            try {
              PostToastBadge.scorePost(entry.target);
              this.intersectionObserver.unobserve(entry.target);
            } catch (err) {
              console.error('[PostToast] Error scoring post:', err);
            }
          }
        }
      }, { rootMargin: '200px' });

      // Score all existing posts
      this.scoreVisiblePosts();

      // Watch for new posts (infinite scroll)
      this.mutationObserver = new MutationObserver((mutations) => {
        try {
          let hasNewNodes = false;
          for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
              hasNewNodes = true;
              break;
            }
          }
          if (hasNewNodes) {
            // Debounce
            clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(() => this.scoreVisiblePosts(), 300);
          }
        } catch (err) {
          console.error('[PostToast] Mutation observer error:', err);
        }
      });

      // Use extractor's feed root detection instead of hardcoded selectors
      const feedContainer = PostToastExtractor.getFeedRoot();

      if (feedContainer && feedContainer !== document.body) {
        this.mutationObserver.observe(feedContainer, {
          childList: true,
          subtree: true
        });
        console.log('[PostToast] Observer started on:', feedContainer.className || feedContainer.tagName);
      } else {
        // Fallback to body
        this.mutationObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
        console.log('[PostToast] Observer started on: document.body (fallback)');
      }
    } catch (err) {
      console.error('[PostToast] Fatal error in init:', err);
    }
  },

  scoreVisiblePosts() {
    try {
      const posts = PostToastExtractor.getAllPosts();
      const strategy = PostToastExtractor.getLastStrategy();
      const unscored = posts.filter(p => !PostToastBadge.isScored(p));
      // Only log when there's something new to score (reduce spam)
      if (unscored.length > 0) {
        console.log(`[PostToast] Scoring ${unscored.length} new posts of ${posts.length} total (strategy: ${strategy})`);
      }
      for (const post of unscored) {
        try {
          PostToastBadge.scorePost(post);
        } catch (err) {
          console.error('[PostToast] Error scoring post:', err);
        }
      }
    } catch (err) {
      console.error('[PostToast] Error in scoreVisiblePosts:', err);
    }
  },

  destroy() {
    try {
      if (this.mutationObserver) this.mutationObserver.disconnect();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      clearTimeout(this._debounceTimer);
      this._initialized = false;
      console.log('[PostToast] Observer destroyed');
    } catch (err) {
      console.error('[PostToast] Error destroying observer:', err);
    }
  }
};
