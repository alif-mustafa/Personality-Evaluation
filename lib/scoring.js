/**
 * AptaDuo Scoring Engine
 * 
 * Handles:
 * - Weighted scoring with reverse-item handling
 * - Big Five trait score calculation
 * - Attachment style (ECR-R) classification
 * - Love Languages primary language calculation
 * - Gottman Conflict Styles classification
 * - Normalization to 0–100 scale for cross-assessment comparison
 */

import { BIG_FIVE_QUESTIONS, BIG_FIVE_FEEDBACK } from "./assessments/bigfive";
import { ATTACHMENT_QUESTIONS, ATTACHMENT_FEEDBACK } from "./assessments/attachment";
import { LOVELANGUAGES_QUESTIONS, LOVELANGUAGES_FEEDBACK } from "./assessments/lovelanguages";
import { GOTTMAN_QUESTIONS, GOTTMAN_FEEDBACK } from "./assessments/gottman";

// ────────────────────────────────────────────
// Core scoring utilities
// ────────────────────────────────────────────

/**
 * Reverse-score a Likert item.
 * For a scale 1–N, reverse = (N + 1) - value.
 */
function reverseScore(value, maxScale) {
  return maxScale + 1 - value;
}

/**
 * Compute the mean score for a set of items belonging to a trait/dimension.
 * Returns a value on the original Likert scale (e.g. 1–5 or 1–7).
 */
function computeTraitMean(responses, questions, traitKey, traitField, maxScale) {
  const traitQuestions = questions.filter((q) => q[traitField] === traitKey);
  let sum = 0;
  let count = 0;

  for (const q of traitQuestions) {
    const resp = responses[q.id];
    if (resp == null) continue;

    const score = q.reverse ? reverseScore(resp, maxScale) : resp;
    sum += score;
    count++;
  }

  return count > 0 ? sum / count : 0;
}

/**
 * Normalize a mean score from its Likert range to a 0–100 scale.
 * mean ∈ [1, maxScale] → [0, 100]
 */
function normalizeTo100(mean, maxScale) {
  if (maxScale <= 1) return 0;
  return Math.round(((mean - 1) / (maxScale - 1)) * 100);
}

/**
 * Get feedback level based on normalized score (0–100).
 */
function getLevel(score) {
  if (score >= 67) return "high";
  if (score >= 34) return "mid";
  return "low";
}

// ────────────────────────────────────────────
// Big Five Scoring
// ────────────────────────────────────────────

export function scoreBigFive(responses) {
  const traits = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"];
  const maxScale = 5;
  const scores = {};
  const feedback = {};

  for (const trait of traits) {
    const mean = computeTraitMean(responses, BIG_FIVE_QUESTIONS, trait, "trait", maxScale);
    const normalized = normalizeTo100(mean, maxScale);
    const level = getLevel(normalized);

    scores[trait] = { mean: Math.round(mean * 100) / 100, normalized };
    feedback[trait] = {
      ...BIG_FIVE_FEEDBACK[trait][level],
      level,
      score: normalized,
    };
  }

  return { scores, feedback, type: "bigfive" };
}

// ────────────────────────────────────────────
// Attachment Style (ECR-R) Scoring
// ────────────────────────────────────────────

export function scoreAttachment(responses) {
  const maxScale = 7;
  const dimensions = ["Anxiety", "Avoidance"];
  const scores = {};

  for (const dim of dimensions) {
    const mean = computeTraitMean(responses, ATTACHMENT_QUESTIONS, dim, "dimension", maxScale);
    scores[dim] = {
      mean: Math.round(mean * 100) / 100,
      normalized: normalizeTo100(mean, maxScale),
    };
  }

  // Classify into attachment style based on quadrants
  // Midpoint of 7-point scale = 4.0
  const anxietyHigh = scores.Anxiety.mean >= 4.0;
  const avoidanceHigh = scores.Avoidance.mean >= 4.0;

  let style;
  if (!anxietyHigh && !avoidanceHigh) style = "Secure";
  else if (anxietyHigh && !avoidanceHigh) style = "Anxious";
  else if (!anxietyHigh && avoidanceHigh) style = "Avoidant";
  else style = "Fearful-Avoidant";

  const feedback = {
    style,
    ...ATTACHMENT_FEEDBACK[style],
    dimensions: scores,
  };

  return { scores, style, feedback, type: "attachment" };
}

// ────────────────────────────────────────────
// Love Languages Scoring
// ────────────────────────────────────────────

export function scoreLoveLanguages(responses) {
  const languages = ["A", "T", "G", "S", "P"];
  const counts = { A: 0, T: 0, G: 0, S: 0, P: 0 };
  
  // Count frequencies
  for (const qId in responses) {
    const selected = responses[qId];
    if (counts[selected] !== undefined) {
      counts[selected]++;
    }
  }

  // Find the primary language
  let primaryLanguage = "A";
  let maxCount = -1;
  for (const lang of languages) {
    if (counts[lang] > maxCount) {
      maxCount = counts[lang];
      primaryLanguage = lang;
    }
  }

  const scores = {};
  for (const lang of languages) {
    // max possible score for any single language varies, but theoretically max is 30, realistically ~12
    // Let's normalize against max possible count (12)
    scores[lang] = {
      count: counts[lang],
      normalized: Math.min(100, Math.round((counts[lang] / 12) * 100)),
    };
  }

  const feedback = {
    primary: LOVELANGUAGES_FEEDBACK[primaryLanguage].title,
    description: LOVELANGUAGES_FEEDBACK[primaryLanguage].description,
    counts,
  };

  return { scores, style: feedback.primary, feedback, type: "lovelanguages" };
}

// ────────────────────────────────────────────
// Gottman Couple Conflict Style Scoring
// ────────────────────────────────────────────
//
// IMPORTANT: Gottman conflict style is a COUPLE-level descriptor.
// scoreGottman() scores ONE partner's responses — it returns dimension
// scores but does NOT assign an individual style label.
// scoreGottmanCouple() takes BOTH partners' responses and produces
// the single couple-level style.

/**
 * Score a single partner's Gottman responses.
 * Returns dimension scores (for radar chart display) but NO individual style label.
 * The style is only meaningful at the couple level.
 */
export function scoreGottman(responses) {
  const categories = ["Validating", "Volatile", "Conflict-Avoiding", "Hostile", "Hostile-Detached"];
  const maxScale = 5;
  const scores = {};

  for (const category of categories) {
    const mean = computeTraitMean(responses, GOTTMAN_QUESTIONS, category, "category", maxScale);
    scores[category] = {
      mean: Math.round(mean * 100) / 100,
      normalized: normalizeTo100(mean, maxScale),
    };
  }

  // No individual style — Gottman conflict style is a couple-level concept.
  // The feedback shown is a generic prompt to invite partner.
  const feedback = {
    partial: true,
    title: "Responses Recorded",
    description: "Your individual responses have been recorded. Gottman conflict style describes the dynamic between you and your partner as a couple — invite your partner to complete this assessment to discover your shared Couple Conflict Style.",
  };

  return { scores, style: null, feedback, type: "gottman" };
}

/**
 * Score BOTH partners' Gottman responses to produce ONE couple-level conflict style.
 *
 * Algorithm:
 * 1. Compute dimension means for each partner independently
 * 2. Average corresponding dimensions across both partners → couple-level dimension scores
 * 3. Classification priority:
 *    - If Hostile-Detached is dominant → "Hostile-Detached" (unstable)
 *    - If Hostile is dominant → "Hostile" (unstable)
 *    - Otherwise, highest stable style wins: Validating, Volatile, or Conflict-Avoiding
 *
 * @param {Object} responsesA - Partner A's raw responses { g1: 4, g2: 3, ... }
 * @param {Object} responsesB - Partner B's raw responses { g1: 2, g5: 5, ... }
 * @returns {{ coupleConflictStyle, stability, scores, confidence, rationale }}
 */
export function scoreGottmanCouple(responsesA, responsesB) {
  const categories = ["Validating", "Volatile", "Conflict-Avoiding", "Hostile", "Hostile-Detached"];
  const maxScale = 5;

  // Step 1: Score each partner individually
  const meansA = {};
  const meansB = {};
  for (const category of categories) {
    meansA[category] = computeTraitMean(responsesA, GOTTMAN_QUESTIONS, category, "category", maxScale);
    meansB[category] = computeTraitMean(responsesB, GOTTMAN_QUESTIONS, category, "category", maxScale);
  }

  // Step 2: Average across partners for couple-level scores
  const coupleScores = {};
  for (const category of categories) {
    const coupleMean = (meansA[category] + meansB[category]) / 2;
    coupleScores[category] = {
      mean: Math.round(coupleMean * 100) / 100,
      normalized: normalizeTo100(coupleMean, maxScale),
      partnerA: Math.round(meansA[category] * 100) / 100,
      partnerB: Math.round(meansB[category] * 100) / 100,
    };
  }

  // Step 3: Classification with unstable-style priority
  const unstableStyles = ["Hostile-Detached", "Hostile"];
  const stableStyles = ["Validating", "Volatile", "Conflict-Avoiding"];

  // Check if any unstable style is the overall highest
  let highestCategory = categories[0];
  let highestMean = -1;
  for (const category of categories) {
    if (coupleScores[category].mean > highestMean) {
      highestMean = coupleScores[category].mean;
      highestCategory = category;
    }
  }

  let coupleConflictStyle;
  let rationale;

  if (unstableStyles.includes(highestCategory)) {
    // Unstable style is dominant
    coupleConflictStyle = highestCategory;
    rationale = `Both partners' combined responses indicate elevated ${highestCategory} patterns, suggesting the couple's interaction loop has become ${highestCategory === "Hostile" ? "defensive and combative" : "a cycle of pursuit and withdrawal"}.`;
  } else {
    // Stable style is dominant — but check if unstable scores are also high
    const highestUnstable = unstableStyles.reduce(
      (best, cat) => coupleScores[cat].mean > coupleScores[best].mean ? cat : best,
      unstableStyles[0]
    );
    const unstableGap = highestMean - coupleScores[highestUnstable].mean;

    if (unstableGap < 0.3 && coupleScores[highestUnstable].mean >= 3.0) {
      // Unstable score is dangerously close to the dominant stable score
      coupleConflictStyle = highestUnstable;
      rationale = `While ${highestCategory} patterns are present, ${highestUnstable} patterns are nearly as strong (gap: ${unstableGap.toFixed(1)}), indicating the couple's dynamic leans toward an unstable loop.`;
    } else {
      coupleConflictStyle = highestCategory;
      rationale = `Both partners' combined responses show a predominantly ${highestCategory} interaction pattern, which is a stable conflict style.`;
    }
  }

  const stability = unstableStyles.includes(coupleConflictStyle) ? "unstable" : "stable";

  // Confidence: how far ahead is the dominant style?
  const sortedMeans = categories.map(c => coupleScores[c].mean).sort((a, b) => b - a);
  const confidence = sortedMeans[0] - sortedMeans[1];

  const feedback = {
    ...GOTTMAN_FEEDBACK[coupleConflictStyle],
    partial: false,
  };

  return {
    coupleConflictStyle,
    stability,
    scores: coupleScores,
    confidence: Math.round(confidence * 100) / 100,
    rationale,
    feedback,
    type: "gottman_couple",
  };
}

// ────────────────────────────────────────────
// Unified scorer
// ────────────────────────────────────────────

export function scoreAssessment(type, responses) {
  switch (type) {
    case "bigfive":
      return scoreBigFive(responses);
    case "attachment":
      return scoreAttachment(responses);
    case "lovelanguages":
      return scoreLoveLanguages(responses);
    case "gottman":
      return scoreGottman(responses);
    default:
      throw new Error(`Unknown assessment type: ${type}`);
  }
}

// ────────────────────────────────────────────
// Get all trait names for couple comparison
// ────────────────────────────────────────────

export function getComparisonTraits() {
  return [
    "Openness",
    "Conscientiousness",
    "Extraversion",
    "Agreeableness",
    "Neuroticism",
    "Anxiety (Attachment)",
    "Avoidance (Attachment)",
    // Using main conflict style dimensions or Love language counts as numerical traits if needed,
    // though Love Languages and Gottman are often matched on style rather than trait continuum.
  ];
}
