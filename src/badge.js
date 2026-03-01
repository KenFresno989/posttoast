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
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: relative; display: inline-flex;';
    wrapper.appendChild(badge);

    // Strategy: place after the actor/header section so it's visible at top of post
    const header = postElement.querySelector('.feed-shared-actor')
      || postElement.querySelector('.update-components-actor')
      || postElement.querySelector('[class*="actor"]');

    if (header) {
      // Insert a row right after the header
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; justify-content: flex-end; padding: 4px 16px 0; position: relative;';
      row.appendChild(wrapper);
      header.insertAdjacentElement('afterend', row);
    } else {
      // Fallback: prepend to the post as a floating badge
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; justify-content: flex-end; padding: 4px 16px 0; position: relative;';
      row.appendChild(wrapper);
      postElement.prepend(row);
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
