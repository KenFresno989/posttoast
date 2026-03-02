// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast DOM Extractor
 * Extracts post text from LinkedIn's DOM using cascading selectors.
 */
const PostToastExtractor = {

  // Cascading selectors — most stable first
  SELECTORS: {
    postContainer: [
      '[data-urn^="urn:li:activity"]',
      '[data-urn^="urn:li:aggregate"]',
      '.feed-shared-update-v2',
      '.occludable-update',
      '.feed-shared-update-v2__content',
      '.update-components-update'
    ],
    postText: [
      '.feed-shared-text span[dir="ltr"]',
      '.feed-shared-update-v2__description span[dir="ltr"]',
      '.break-words span[dir="ltr"]',
      '.feed-shared-text',
      '.update-components-text span[dir="ltr"]',
      '.update-components-text .break-words',
      '.feed-shared-inline-show-more-text span[dir="ltr"]',
      '.feed-shared-update-v2__commentary span[dir="ltr"]',
      '.feed-shared-update-v2__commentary .break-words'
    ],
    postAuthor: [
      '.feed-shared-actor__name span[aria-hidden="true"]',
      '.update-components-actor__name span[aria-hidden="true"]',
      '.feed-shared-actor__name'
    ]
  },

  findPostContainer(element) {
    for (const selector of this.SELECTORS.postContainer) {
      const container = element.closest(selector);
      if (container) return container;
    }
    return null;
  },

  getAllPosts() {
    for (const selector of this.SELECTORS.postContainer) {
      const posts = document.querySelectorAll(selector);
      if (posts.length > 0) return Array.from(posts);
    }
    return [];
  },

  extractText(postElement) {
    for (const selector of this.SELECTORS.postText) {
      const elements = postElement.querySelectorAll(selector);
      if (elements.length > 0) {
        return Array.from(elements)
          .map(el => el.innerText || el.textContent)
          .join('\n')
          .trim();
      }
    }
    // Fallback: try to get any substantial text content
    const allText = postElement.innerText || '';
    return allText.length > 50 ? allText : '';
  },

  extractAuthor(postElement) {
    for (const selector of this.SELECTORS.postAuthor) {
      const el = postElement.querySelector(selector);
      if (el) return (el.innerText || el.textContent || '').trim();
    }
    return 'Unknown';
  },

  getPostUrn(postElement) {
    const urn = postElement.getAttribute('data-urn');
    if (urn) return urn;
    // Try to find URN in child elements
    const urnEl = postElement.querySelector('[data-urn]');
    return urnEl ? urnEl.getAttribute('data-urn') : null;
  }
};
