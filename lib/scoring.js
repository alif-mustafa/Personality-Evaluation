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
// Gottman Conflict Styles Scoring
// ────────────────────────────────────────────

export function scoreGottman(responses) {
  const categories = ["Validating", "Volatile", "Conflict-Avoiding", "Hostile", "Hostile-Detached"];
  const maxScale = 5;
  const scores = {};
  let primaryStyle = categories[0];
  let maxMean = -1;

  for (const category of categories) {
    const mean = computeTraitMean(responses, GOTTMAN_QUESTIONS, category, "category", maxScale);
    scores[category] = {
      mean: Math.round(mean * 100) / 100,
      normalized: normalizeTo100(mean, maxScale),
    };
    
    if (mean > maxMean) {
      maxMean = mean;
      primaryStyle = category;
    }
  }

  const feedback = {
    style: primaryStyle,
    ...GOTTMAN_FEEDBACK[primaryStyle],
  };

  return { scores, style: primaryStyle, feedback, type: "gottman" };
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
