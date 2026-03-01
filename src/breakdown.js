/**
 * PostToast Breakdown Panel
 * Shows detailed signal breakdown when badge is clicked.
 */
const PostToastBreakdown = {

  activePanel: null,

  toggle(result, postElement, badge) {
    // Close existing panel
    if (this.activePanel) {
      this.activePanel.remove();
      if (this.activePanel._parentPost === postElement) {
        this.activePanel = null;
        return;
      }
      this.activePanel = null;
    }

    const panel = this.create(result);
    panel._parentPost = postElement;

    // Position below the badge — append to badge's parent wrapper
    const wrapper = badge.parentElement;
    if (wrapper) {
      wrapper.appendChild(panel);
    } else {
      badge.insertAdjacentElement('afterend', panel);
    }
    this.activePanel = panel;

    // Close on outside click
    const closeHandler = (e) => {
      if (!panel.contains(e.target) && !badge.contains(e.target)) {
        panel.remove();
        this.activePanel = null;
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);
  },

  create(result) {
    const panel = document.createElement('div');
    panel.className = 'pt-breakdown';

    const roastHeadline = PostToastRubric.getRoastHeadline(result.score);

    let html = `
      <div class="pt-breakdown-header">
        <span class="pt-breakdown-title">PostToast Breakdown</span>
        <span class="pt-breakdown-label ${PostToastScorer.getColorClass(result.score)}">${result.label}</span>
      </div>
      <div class="pt-roast-headline ${PostToastScorer.getColorClass(result.score)}">${roastHeadline}</div>
      <div class="pt-breakdown-signals">
    `;

    // Positive signals
    for (const signal of result.signals) {
      const scoreStr = '+' + (signal.points % 1 === 0 ? signal.points.toFixed(0) : signal.points.toFixed(signal.points % 0.5 === 0 ? 1 : 2));
      html += `
        <div class="pt-signal-row">
          <div class="pt-signal-info">
            <span class="pt-signal-icon">${signal.icon}</span>
            <span class="pt-signal-name">${signal.label}</span>
          </div>
          <span class="pt-signal-points ${PostToastScorer.getColorClass(signal.points * 2)}">${scoreStr}</span>
        </div>
        <div class="pt-signal-detail">${signal.detail}</div>
      `;
    }

    // Negative signals
    for (const signal of result.negativeSignals) {
      const scoreStr = signal.points.toFixed(signal.points % 1 === 0 ? 0 : 1);
      html += `
        <div class="pt-signal-row">
          <div class="pt-signal-info">
            <span class="pt-signal-icon">${signal.icon}</span>
            <span class="pt-signal-name">${signal.label}</span>
          </div>
          <span class="pt-signal-points pt-green">${scoreStr}</span>
        </div>
        <div class="pt-signal-detail">${signal.detail}</div>
      `;
    }

    // Compound multiplier note
    if (result.tier2Compound) {
      html += `
        <div class="pt-compound-note">
          ⚠️ Compound multiplier: ${result.tier2Count} core cringe signals stacking (×${PostToastRubric.compoundMultiplier})
        </div>
      `;
    }

    // Low score celebration
    if (result.signals.length === 0) {
      html += `
        <div class="pt-genuine-notice">
          🫡 No signals detected. This person just... said something real. Respect.
        </div>
      `;
    }

    // Total
    const scoreDisplay = result.score % 1 === 0 ? result.score.toFixed(0) : result.score.toFixed(result.score % 0.5 === 0 ? 1 : 2);
    html += `
      </div>
      <div class="pt-breakdown-total">
        <span>Total</span>
        <span class="pt-total-score ${PostToastScorer.getColorClass(result.score)}">${scoreDisplay} / 10</span>
      </div>
      <div class="pt-share-row">
        <button class="pt-share-btn" id="pt-share-${Date.now()}">📋 Copy Roast</button>
      </div>
      <div class="pt-breakdown-footer">
        🍞 PostToast — Roasting LinkedIn, one post at a time
      </div>
    `;

    panel.innerHTML = html;

    // Share button handler
    const shareBtn = panel.querySelector('.pt-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const signalList = result.signals.map(s => `${s.icon} ${s.label}: +${s.points}`).join('\n');
        const roast = PostToastRubric.getRoastHeadline(result.score);
        const scoreDisplay = result.score % 1 === 0 ? result.score.toFixed(0) : result.score.toFixed(result.score % 0.5 === 0 ? 1 : 2);
        const text = `🍞 PostToast Score: ${scoreDisplay}/10 — "${roast}"\n\n${signalList}\n\nposttoast.app`;
        navigator.clipboard.writeText(text).then(() => {
          shareBtn.textContent = 'Copied! 🍞';
          shareBtn.classList.add('pt-copied');
          setTimeout(() => {
            shareBtn.textContent = '📋 Copy Roast';
            shareBtn.classList.remove('pt-copied');
          }, 2000);
        });
      });
    }

    return panel;
  }
};
