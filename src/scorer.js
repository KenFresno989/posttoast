// Copyright (c) 2026 PostToast. All rights reserved.
/**
 * PostToast Scoring Engine
 * Combines signal detections into a final 0-10 score with quarter-point precision.
 */
const PostToastScorer = {

  score(text) {
    const signals = PostToastSignals.analyzeAll(text);

    let rawScore = 0;
    const positiveSignals = [];
    const negativeSignals = [];

    for (const signal of signals) {
      rawScore += signal.points;
      if (signal.points > 0) {
        positiveSignals.push(signal);
      } else {
        negativeSignals.push(signal);
      }
    }

    // Count Tier 2 hits for compound multiplier
    const tier2Detectors = [
      'Humble Brag', 'Thought Leader Cosplay', 'Agreephishing',
      'Toxic Positivity', 'Name Dropping', 'Selfless Hiring Post', 'Hustle Porn',
      'Humblebait', 'Gratitude Theater', 'Trauma Flexing', 'Echo Chamber',
      'The Pivot Brag', 'Empathy Cosplay', 'LinkedInfluencer'
    ];
    const tier2Count = positiveSignals.filter(s => tier2Detectors.includes(s.label)).length;

    if (tier2Count >= PostToastRubric.compoundThreshold) {
      rawScore *= PostToastRubric.compoundMultiplier;
    }

    // Round to nearest 0.25
    const finalScore = Math.max(0, Math.min(10, Math.round(rawScore * 4) / 4));

    const label = PostToastRubric.getLabel(finalScore);

    return {
      score: finalScore,
      label,
      signals: positiveSignals.sort((a, b) => b.points - a.points),
      negativeSignals,
      allSignals: signals,
      tier2Compound: tier2Count >= PostToastRubric.compoundThreshold,
      tier2Count
    };
  },

  getColor(score) {
    if (score <= 3) return '#22c55e';   // green
    if (score <= 6) return '#eab308';   // yellow/amber
    return '#ef4444';                    // red
  },

  getColorClass(score) {
    if (score <= 3) return 'pt-green';
    if (score <= 6) return 'pt-amber';
    return 'pt-red';
  }
};
