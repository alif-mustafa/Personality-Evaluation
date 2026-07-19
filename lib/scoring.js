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

function calculateMean(scores) {
  if (!scores || scores.length === 0) return 0;
  return scores.reduce((sum, val) => sum + val, 0) / scores.length;
}

function evaluatePartner(responses) {
  const averages = {
    Validating: calculateMean(responses.Validating),
    Volatile: calculateMean(responses.Volatile),
    Avoidant: calculateMean(responses.Avoidant),
    Hostile: calculateMean(responses.Hostile),
    Hostile_Detached: calculateMean(responses.Hostile_Detached),
  };

  const stableScores = [
    { name: "Validating", score: averages.Validating },
    { name: "Volatile", score: averages.Volatile },
    { name: "Avoidant", score: averages.Avoidant },
  ].sort((a, b) => b.score - a.score);

  const maxStable = stableScores[0].score;
  const minStable = stableScores[2].score;
  const top1 = stableScores[0];
  const top2 = stableScores[1];

  let dominant_style = top1.name;
  
  if (maxStable - minStable < 0.5) {
    dominant_style = "Inconclusive";
  } else if (top1.score - top2.score <= 0.2) {
    dominant_style = "Blended";
  }

  const maxUnstable = Math.max(averages.Hostile, averages.Hostile_Detached);
  let urgent_flags_present = false;
  let soft_flags_present = false;

  if (maxUnstable >= 3.5) {
    urgent_flags_present = true;
  } else if (maxUnstable >= 2.5) {
    soft_flags_present = true;
  }

  let is_invalid = false;
  if (maxStable >= 4.0 && urgent_flags_present) {
    if (Math.abs(maxStable - maxUnstable) < 0.5) {
      is_invalid = true;
      dominant_style = "Invalid_Contradiction";
    }
  }

  return {
    dominant_style,
    soft_flags_present,
    urgent_flags_present,
    is_invalid,
  };
}

function getCategoryScores(responses) {
  return {
    Validating: [responses.g1, responses.g2, responses.g3, responses.g4].filter(v => v != null),
    Volatile: [responses.g5, responses.g6, responses.g7, responses.g8].filter(v => v != null),
    Avoidant: [responses.g9, responses.g10, responses.g11, responses.g12].filter(v => v != null),
    Hostile: [responses.g13, responses.g14, responses.g15, responses.g16].filter(v => v != null),
    Hostile_Detached: [responses.g17, responses.g18, responses.g19, responses.g20].filter(v => v != null),
  };
}

export function scoreGottmanCouple(responsesA, responsesB) {
  const partnerA = getCategoryScores(responsesA);
  const partnerB = getCategoryScores(responsesB);

  const summaryA = evaluatePartner(partnerA);
  const summaryB = evaluatePartner(partnerB);

  let ui_state = "";
  let couple_profile = "";

  if (summaryA.is_invalid || summaryB.is_invalid) {
    ui_state = "ERROR_RETAKE_TEST";
    couple_profile = "N/A";
  } else if (summaryA.urgent_flags_present || summaryB.urgent_flags_present) {
    ui_state = "CRISIS_INTERVENTION";
    couple_profile = "N/A";
  } else {
    const styleA = summaryA.dominant_style;
    const styleB = summaryB.dominant_style;

    if (styleA === styleB) {
      ui_state = "MATCHED_STYLE";
      couple_profile = `Matched ${styleA}`;
    } else {
      const pair = [styleA, styleB];
      if (pair.includes("Volatile") && pair.includes("Avoidant")) {
        ui_state = "HIGH_FRICTION_MISMATCH";
        couple_profile = "Volatile-Avoidant";
      } else {
        ui_state = "COMPLEMENTARY_MISMATCH";
        couple_profile = `${styleA}-${styleB}`;
      }
    }
  }

  const cleanSummaryA = {
    dominant_style: summaryA.dominant_style,
    soft_flags_present: summaryA.soft_flags_present,
    urgent_flags_present: summaryA.urgent_flags_present,
  };

  const cleanSummaryB = {
    dominant_style: summaryB.dominant_style,
    soft_flags_present: summaryB.soft_flags_present,
    urgent_flags_present: summaryB.urgent_flags_present,
  };

  return {
    ui_state,
    couple_profile,
    partner_a_summary: cleanSummaryA,
    partner_b_summary: cleanSummaryB,
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
