/**
 * PostToast Observer
 * Watches for new posts loaded via infinite scroll and scores them.
 */
const PostToastObserver = {

  mutationObserver: null,
  intersectionObserver: null,
  scoreCache: new Map(),

  init() {
    // Set up IntersectionObserver FIRST
    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          PostToastBadge.scorePost(entry.target);
          this.intersectionObserver.unobserve(entry.target);
        }
      }
    }, { rootMargin: '200px' });

    // Score all existing posts
    this.scoreVisiblePosts();

    // Watch for new posts (infinite scroll)
    this.mutationObserver = new MutationObserver((mutations) => {
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
    });

    // Observe the main feed container, or body as fallback
    const feedContainer = document.querySelector('.scaffold-finite-scroll__content')
      || document.querySelector('.core-rail')
      || document.querySelector('main')
      || document.body;

    this.mutationObserver.observe(feedContainer, {
      childList: true,
      subtree: true
    });

  },

  scoreVisiblePosts() {
    const posts = PostToastExtractor.getAllPosts();
    for (const post of posts) {
      if (!PostToastBadge.isScored(post)) {
        this.intersectionObserver.observe(post);
      }
    }
  },

  destroy() {
    if (this.mutationObserver) this.mutationObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    clearTimeout(this._debounceTimer);
  }
};
