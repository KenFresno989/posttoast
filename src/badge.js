// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast Badge
 * Injects score badges into LinkedIn posts.
 */
const PostToastBadge = {

  BADGE_ATTR: 'data-posttoast-scored',

  isScored(postElement) {
    return postElement.hasAttribute(this.BADGE_ATTR);
  },

  markScored(postElement) {
    postElement.setAttribute(this.BADGE_ATTR, 'true');
  },

  create(result, postElement) {
    const badge = document.createElement('div');
    badge.className = `pt-badge ${PostToastScorer.getColorClass(result.score)}`;

    const scoreDisplay = result.score % 1 === 0 ? result.score.toFixed(0) : result.score.toFixed(result.score % 0.5 === 0 ? 1 : 2);

    badge.innerHTML = `<span class="pt-badge-icon">🍞</span><span class="pt-badge-score">${scoreDisplay}</span>`;
    badge.title = `PostToast: ${result.label}`;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      PostToastBreakdown.toggle(result, postElement, badge);
    });

    return badge;
  },

  inject(postElement, result) {
    if (this.isScored(postElement)) return;

    const badge = this.create(result, postElement);
    badge.style.cssText += 'margin-left: 8px; flex-shrink: 0;';

    // Strategy 1: Insert next to the Follow button in the header
    const followBtn = postElement.querySelector('button[aria-label*="Follow"], button[aria-label*="follow"]');
    if (followBtn) {
      followBtn.parentElement.insertBefore(badge, followBtn);
      this.markScored(postElement);
      return;
    }

    // Strategy 2: Insert at the end of the actor header's action area
    const actorContainer = postElement.querySelector('.feed-shared-actor__container')
      || postElement.querySelector('.update-components-actor__container');
    if (actorContainer) {
      // Find the right side (where Follow/menu lives)
      const meta = actorContainer.querySelector('.feed-shared-actor__meta, .update-components-actor__meta');
      if (meta && meta.parentElement) {
        meta.parentElement.appendChild(badge);
        this.markScored(postElement);
        return;
      }
    }

    // Strategy 3: Append to the actor row itself
    const header = postElement.querySelector('.feed-shared-actor')
      || postElement.querySelector('.update-components-actor')
      || postElement.querySelector('[class*="actor"]');

    if (header) {
      // Insert inline at the end of the header (same row, not a new row)
      header.style.cssText += 'display: flex; align-items: center;';
      header.appendChild(badge);
    } else {
      // Fallback: top-right of the post
      badge.style.cssText += 'position: absolute; top: 8px; right: 16px; z-index: 10;';
      postElement.style.position = 'relative';
      postElement.appendChild(badge);
    }

    this.markScored(postElement);
  },

  scorePost(postElement) {
    if (this.isScored(postElement)) return;

    // Skip non-post elements (sort bar, composer, nav, ads)
    const text = PostToastExtractor.extractText(postElement);
    if (!text || text.length < 50) return; // Skip empty/tiny elements

    // Must have engagement buttons to be a real post
    const buttons = postElement.querySelectorAll('button, [role="button"]');
    const buttonTexts = Array.from(buttons).map(b => (b.innerText || b.getAttribute('aria-label') || '').toLowerCase());
    const engagementWords = ['like', 'comment', 'share', 'repost', 'send', 'react', 'love', 'celebrate', 'support', 'insightful', 'funny'];
    const hasEngagement = buttonTexts.some(t => engagementWords.some(w => t.includes(w)));
    if (!hasEngagement) return; // Not a real post

    const result = PostToastScorer.score(text);
    this.inject(postElement, result);
  }
};
