/**
 * PersonaLink Scoring Engine
 * 
 * Handles:
 * - Weighted scoring with reverse-item handling
 * - Big Five trait score calculation
 * - Attachment style classification (Anxiety × Avoidance quadrants)
 * - HEXACO trait scoring
 * - Normalization to 0–100 scale for cross-assessment comparison
 */

import { BIG_FIVE_QUESTIONS, BIG_FIVE_FEEDBACK } from "./assessments/bigfive";
import { ATTACHMENT_QUESTIONS, ATTACHMENT_FEEDBACK } from "./assessments/attachment";
import { HEXACO_QUESTIONS, HEXACO_FEEDBACK } from "./assessments/hexaco";

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
// Attachment Style Scoring
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
// HEXACO Scoring
// ────────────────────────────────────────────

export function scoreHexaco(responses) {
  const traits = ["Honesty-Humility", "Agreeableness"];
  const maxScale = 5;
  const scores = {};
  const feedback = {};

  for (const trait of traits) {
    const mean = computeTraitMean(responses, HEXACO_QUESTIONS, trait, "trait", maxScale);
    const normalized = normalizeTo100(mean, maxScale);
    const level = getLevel(normalized);

    scores[trait] = { mean: Math.round(mean * 100) / 100, normalized };
    feedback[trait] = {
      ...HEXACO_FEEDBACK[trait][level],
      level,
      score: normalized,
    };
  }

  return { scores, feedback, type: "hexaco" };
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
    case "hexaco":
      return scoreHexaco(responses);
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
    "Honesty-Humility",
    "HEXACO Agreeableness",
  ];
}
