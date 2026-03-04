// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast Observer
 * Watches for new posts loaded via infinite scroll and scores them.
 */
const PostToastObserver = {

  mutationObserver: null,
  intersectionObserver: null,
  scoreCache: new Map(),

  init() {
    try {
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

      // Observe the main feed container, or body as fallback
      const feedContainer = document.querySelector('.scaffold-finite-scroll__content')
        || document.querySelector('.core-rail')
        || document.querySelector('main')
        || document.body;

      if (feedContainer) {
        this.mutationObserver.observe(feedContainer, {
          childList: true,
          subtree: true
        });
        console.log('[PostToast] Observer started on:', feedContainer.className || 'body');
      } else {
        console.error('[PostToast] No feed container found');
      }
    } catch (err) {
      console.error('[PostToast] Fatal error in init:', err);
    }
  },

  scoreVisiblePosts() {
    try {
      const posts = PostToastExtractor.getAllPosts();
      console.log('[PostToast] Scoring visible posts:', posts.length);
      for (const post of posts) {
        if (!PostToastBadge.isScored(post)) {
          // Score directly — don't gate on IntersectionObserver
          try {
            PostToastBadge.scorePost(post);
          } catch (err) {
            console.error('[PostToast] Error scoring post:', err);
          }
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
      console.log('[PostToast] Observer destroyed');
    } catch (err) {
      console.error('[PostToast] Error destroying observer:', err);
    }
  }
};
