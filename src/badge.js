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

    // Try to place in the social action bar (Like/Comment/Repost/Send)
    const actionBar = postElement.querySelector('.social-details-social-actions') 
      || postElement.querySelector('.feed-shared-social-actions')
      || postElement.querySelector('[class*="social-action"]');

    if (actionBar) {
      // Wrap badge in a relative container for breakdown positioning
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position: relative; display: inline-flex; align-items: center; margin-left: auto;';
      wrapper.appendChild(badge);
      actionBar.appendChild(wrapper);
    } else {
      // Fallback: put it after the post header area
      const header = postElement.querySelector('.feed-shared-actor')
        || postElement.querySelector('[class*="actor"]')
        || postElement.querySelector('.update-components-actor');

      if (header) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: relative; display: inline-flex; float: right; margin: 8px 12px 0 0;';
        wrapper.appendChild(badge);
        header.parentElement.insertBefore(wrapper, header.nextSibling);
      } else {
        // Last resort: absolute position in corner
        badge.style.cssText += 'position: absolute; top: 12px; right: 56px;';
        postElement.style.position = 'relative';
        postElement.appendChild(badge);
      }
    }

    this.markScored(postElement);
  },

  scorePost(postElement) {
    if (this.isScored(postElement)) return;

    const text = PostToastExtractor.extractText(postElement);
    if (!text || text.length < 20) return; // Skip empty/tiny posts

    const result = PostToastScorer.score(text);
    this.inject(postElement, result);
  }
};
