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

    // Make post container relative for badge positioning
    const computed = window.getComputedStyle(postElement);
    if (computed.position === 'static') {
      postElement.style.position = 'relative';
    }

    const badge = this.create(result, postElement);
    postElement.appendChild(badge);
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
