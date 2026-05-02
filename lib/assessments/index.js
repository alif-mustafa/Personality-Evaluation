/**
 * Assessment Registry
 * Central export for all assessment data.
 */

import { BIG_FIVE_META, BIG_FIVE_QUESTIONS, BIG_FIVE_PROMPT, BIG_FIVE_LIKERT } from "./bigfive";
import { ATTACHMENT_META, ATTACHMENT_QUESTIONS, ATTACHMENT_PROMPT, ATTACHMENT_LIKERT } from "./attachment";
import { HEXACO_META, HEXACO_QUESTIONS, HEXACO_PROMPT, HEXACO_LIKERT } from "./hexaco";

export const ASSESSMENTS = {
  bigfive: {
    meta: BIG_FIVE_META,
    questions: BIG_FIVE_QUESTIONS,
    prompt: BIG_FIVE_PROMPT,
    likert: BIG_FIVE_LIKERT,
  },
  attachment: {
    meta: ATTACHMENT_META,
    questions: ATTACHMENT_QUESTIONS,
    prompt: ATTACHMENT_PROMPT,
    likert: ATTACHMENT_LIKERT,
  },
  hexaco: {
    meta: HEXACO_META,
    questions: HEXACO_QUESTIONS,
    prompt: HEXACO_PROMPT,
    likert: HEXACO_LIKERT,
  },
};

export function getAssessment(type) {
  return ASSESSMENTS[type] || null;
}

export function getAllAssessments() {
  return Object.values(ASSESSMENTS);
}
