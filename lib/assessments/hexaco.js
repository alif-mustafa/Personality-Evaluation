/**
 * HEXACO-Lite Assessment
 * Focused on Honesty-Humility (H) and Agreeableness (A) scales.
 * Based on the HEXACO Personality Inventory – Revised (HEXACO-PI-R).
 * 
 * 20 items: 10 Honesty-Humility, 10 Agreeableness
 */

export const HEXACO_META = {
  id: "hexaco",
  title: "HEXACO-Lite Assessment",
  shortTitle: "HEXACO-Lite",
  description:
    "Focused on Honesty-Humility and Agreeableness — two traits that powerfully predict relationship quality, trust, and cooperation.",
  questionCount: 20,
  estimatedMinutes: 4,
  icon: "💎",
  traits: ["Honesty-Humility", "Agreeableness"],
  traitColors: {
    "Honesty-Humility": "#8b5cf6",
    Agreeableness: "#3a8c69",
  },
};

export const HEXACO_QUESTIONS = [
  // --- Honesty-Humility (10 items) ---
  { id: 1,  text: "I wouldn't use flattery to get a raise or promotion, even if I thought it would succeed", trait: "Honesty-Humility", reverse: false },
  { id: 2,  text: "If I knew I could never get caught, I would be willing to steal a million dollars", trait: "Honesty-Humility", reverse: true },
  { id: 3,  text: "I'd be tempted to use counterfeit money if I were sure I could get away with it", trait: "Honesty-Humility", reverse: true },
  { id: 4,  text: "I wouldn't pretend to like someone just to get that person to do favors for me", trait: "Honesty-Humility", reverse: false },
  { id: 5,  text: "Having a lot of money is not especially important to me", trait: "Honesty-Humility", reverse: false },
  { id: 6,  text: "I think I am entitled to more respect than the average person", trait: "Honesty-Humility", reverse: true },
  { id: 7,  text: "I want people to know that I am an important person of high status", trait: "Honesty-Humility", reverse: true },
  { id: 8,  text: "I would never accept a bribe, even if it were very large", trait: "Honesty-Humility", reverse: false },
  { id: 9,  text: "I am an ordinary person who is no better than others", trait: "Honesty-Humility", reverse: false },
  { id: 10, text: "If I want something from someone, I'll laugh at that person's worst jokes", trait: "Honesty-Humility", reverse: true },

  // --- Agreeableness (10 items) ---
  { id: 11, text: "I rarely hold a grudge, even against people who have badly wronged me", trait: "Agreeableness", reverse: false },
  { id: 12, text: "People sometimes tell me that I am too critical of others", trait: "Agreeableness", reverse: true },
  { id: 13, text: "I tend to be lenient in judging other people", trait: "Agreeableness", reverse: false },
  { id: 14, text: "Even when people make a lot of mistakes, I rarely say anything negative", trait: "Agreeableness", reverse: false },
  { id: 15, text: "My attitude toward people who have treated me badly is 'forgive and forget'", trait: "Agreeableness", reverse: false },
  { id: 16, text: "I find it hard to fully forgive someone who has done something mean to me", trait: "Agreeableness", reverse: true },
  { id: 17, text: "People think of me as someone with a quick temper", trait: "Agreeableness", reverse: true },
  { id: 18, text: "I generally accept others' faults without complaining", trait: "Agreeableness", reverse: false },
  { id: 19, text: "I am usually quite flexible in my opinions when people disagree with me", trait: "Agreeableness", reverse: false },
  { id: 20, text: "When someone insults me, I can stay calm and move on", trait: "Agreeableness", reverse: false },
];

export const HEXACO_PROMPT = "Please indicate how much you agree or disagree with each statement.";

export const HEXACO_LIKERT = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export const HEXACO_FEEDBACK = {
  "Honesty-Humility": {
    high: {
      title: "Authentic & Humble",
      body: "You have a strong moral compass and value fairness and sincerity. You're unlikely to manipulate others for personal gain, and you don't seek special treatment or status. People tend to trust you deeply because your actions consistently align with your values.",
      tip: "Your authenticity builds genuine trust. In a world that sometimes rewards self-promotion, your humility is a quiet superpower. Don't let it keep you from advocating for yourself when you deserve recognition.",
    },
    mid: {
      title: "Pragmatically Honest",
      body: "You generally value honesty and fairness, but you're also practical. You understand that social situations sometimes require tact, and you can navigate the gray areas of self-presentation without losing your integrity.",
      tip: "You have a healthy balance. Trust your instincts about when to be direct and when to be diplomatic — you tend to read these situations well.",
    },
    low: {
      title: "Strategic & Ambitious",
      body: "You're comfortable with self-promotion and strategic social behavior. You understand how the game is played and you're not afraid to play it. This can be a strength in competitive environments, though it may sometimes create friction in close relationships where raw honesty is expected.",
      tip: "Your strategic mind is an asset. In intimate relationships, consider intentionally 'letting your guard down' — vulnerability with trusted people tends to deepen bonds significantly.",
    },
  },
  Agreeableness: {
    high: {
      title: "Patient & Forgiving",
      body: "You have a remarkable ability to let go of grudges and give people the benefit of the doubt. You're slow to anger and quick to forgive. This creates a warm, safe atmosphere around you that others are drawn to.",
      tip: "Your patience is admirable. Make sure you're not suppressing legitimate feelings of hurt — forgiving and processing are both important. Journaling can help you honor both.",
    },
    mid: {
      title: "Fair-Minded",
      body: "You can be both understanding and firm, depending on the situation. You're willing to forgive, but you also recognize when boundaries have been crossed. This balanced approach serves you well in most relationships.",
      tip: "Your balanced perspective makes you a natural mediator. When conflicts arise, others may look to you for a fair assessment — trust your judgment.",
    },
    low: {
      title: "Direct & Uncompromising",
      body: "You have strong opinions and you're not afraid to express them. When someone wrongs you, you remember. This isn't necessarily a flaw — it's your way of protecting yourself and maintaining standards. You call things as you see them.",
      tip: "Your standards are clear, which people respect. In close relationships, practicing the 'repair conversation' (returning to a conflict calmly after cooling down) can help prevent small issues from becoming lasting rifts.",
    },
  },
};
