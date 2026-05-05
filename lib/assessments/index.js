/**
 * Assessment Registry
 * Central export for all assessment data.
 */

import { BIG_FIVE_META, BIG_FIVE_QUESTIONS, BIG_FIVE_PROMPT, BIG_FIVE_LIKERT } from "./bigfive";
import { ATTACHMENT_META, ATTACHMENT_QUESTIONS, ATTACHMENT_PROMPT, ATTACHMENT_LIKERT } from "./attachment";
import { LOVELANGUAGES_META, LOVELANGUAGES_QUESTIONS, LOVELANGUAGES_PROMPT } from "./lovelanguages";
import { GOTTMAN_META, GOTTMAN_QUESTIONS, GOTTMAN_PROMPT, GOTTMAN_LIKERT } from "./gottman";

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
  lovelanguages: {
    meta: LOVELANGUAGES_META,
    questions: LOVELANGUAGES_QUESTIONS,
    prompt: LOVELANGUAGES_PROMPT,
  },
  gottman: {
    meta: GOTTMAN_META,
    questions: GOTTMAN_QUESTIONS,
    prompt: GOTTMAN_PROMPT,
    likert: GOTTMAN_LIKERT,
  },
};

export function getAssessment(type) {
  return ASSESSMENTS[type] || null;
}

export function getAllAssessments() {
  return Object.values(ASSESSMENTS);
}
