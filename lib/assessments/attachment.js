/**
 * Attachment Style Assessment
 * Based on Experiences in Close Relationships – Revised (ECR-R)
 * Adapted to 24 items covering Anxiety and Avoidance dimensions.
 *
 * Scoring:
 * - High Anxiety + Low Avoidance → Anxious (Preoccupied)
 * - Low Anxiety + High Avoidance → Avoidant (Dismissive)
 * - High Anxiety + High Avoidance → Fearful-Avoidant
 * - Low Anxiety + Low Avoidance → Secure
 */

export const ATTACHMENT_META = {
  id: "attachment",
  title: "Attachment Style Assessment",
  shortTitle: "Attachment Style",
  description:
    "Discover whether your relationship patterns lean Secure, Anxious, Avoidant, or Fearful-Avoidant — and what that means for how you love.",
  questionCount: 24,
  estimatedMinutes: 5,
  icon: "🔗",
  traits: ["Anxiety", "Avoidance"],
  styles: ["Secure", "Anxious", "Avoidant", "Fearful-Avoidant"],
  traitColors: {
    Anxiety: "#f43f5e",
    Avoidance: "#8b5cf6",
  },
  styleColors: {
    Secure: "#3a8c69",
    Anxious: "#f59e0b",
    Avoidant: "#3b7bfc",
    "Fearful-Avoidant": "#f43f5e",
  },
};

export const ATTACHMENT_QUESTIONS = [
  // --- Anxiety dimension (12 items) ---
  { id: 1, text: "I worry about being abandoned by people close to me", dimension: "Anxiety", reverse: false },
  { id: 2, text: "I often worry that my partner doesn't really love me", dimension: "Anxiety", reverse: false },
  { id: 3, text: "I find that my desire to be very close sometimes scares people away", dimension: "Anxiety", reverse: false },
  { id: 4, text: "I need a lot of reassurance that I am loved", dimension: "Anxiety", reverse: false },
  { id: 5, text: "When I'm not in a relationship, I feel somewhat anxious and incomplete", dimension: "Anxiety", reverse: false },
  { id: 6, text: "I get frustrated when my partner is not available when I need them", dimension: "Anxiety", reverse: false },
  { id: 7, text: "I worry a fair amount about losing my partner", dimension: "Anxiety", reverse: false },
  { id: 8, text: "When I show my feelings, I'm afraid others will not feel the same about me", dimension: "Anxiety", reverse: false },
  { id: 9, text: "I rarely worry about my partner leaving me", dimension: "Anxiety", reverse: true },
  { id: 10, text: "My romantic partner makes me doubt myself", dimension: "Anxiety", reverse: false },
  { id: 11, text: "I do not often worry about being abandoned", dimension: "Anxiety", reverse: true },
  { id: 12, text: "I find that others are reluctant to get as close as I would like", dimension: "Anxiety", reverse: false },

  // --- Avoidance dimension (12 items) ---
  { id: 13, text: "I am very comfortable being close to romantic partners", dimension: "Avoidance", reverse: true },
  { id: 14, text: "I prefer not to show a partner how I feel deep down", dimension: "Avoidance", reverse: false },
  { id: 15, text: "I feel comfortable depending on romantic partners", dimension: "Avoidance", reverse: true },
  { id: 16, text: "I prefer not to be too close to romantic partners", dimension: "Avoidance", reverse: false },
  { id: 17, text: "I get uncomfortable when a partner wants to be very close", dimension: "Avoidance", reverse: false },
  { id: 18, text: "I find it relatively easy to get close to my partner", dimension: "Avoidance", reverse: true },
  { id: 19, text: "It's not difficult for me to be affectionate with my partner", dimension: "Avoidance", reverse: true },
  { id: 20, text: "I find it difficult to allow myself to depend on romantic partners", dimension: "Avoidance", reverse: false },
  { id: 21, text: "I am nervous when partners get too close to me", dimension: "Avoidance", reverse: false },
  { id: 22, text: "I feel comfortable sharing my private thoughts and feelings with my partner", dimension: "Avoidance", reverse: true },
  { id: 23, text: "I try to avoid getting too close to my partner", dimension: "Avoidance", reverse: false },
  { id: 24, text: "I tell my partner just about everything", dimension: "Avoidance", reverse: true },
];

export const ATTACHMENT_PROMPT = "Please indicate how much you agree or disagree with each statement about how you generally experience close relationships.";

export const ATTACHMENT_LIKERT = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Slightly Disagree" },
  { value: 4, label: "Neutral" },
  { value: 5, label: "Slightly Agree" },
  { value: 6, label: "Agree" },
  { value: 7, label: "Strongly Agree" },
];

export const ATTACHMENT_FEEDBACK = {
  Secure: {
    title: "Secure Attachment",
    emoji: "🛡️",
    body: "You feel comfortable with intimacy and independence in your relationships. You trust your partners, communicate openly, and aren't overly anxious about abandonment. This doesn't mean you never feel insecure — but when you do, you can reach out and reconnect without spiraling.",
    strengths: [
      "Comfortable with emotional closeness",
      "Can communicate needs clearly",
      "Trusting and trustworthy",
      "Recovers well from conflict",
    ],
    tip: "Your secure foundation allows you to support partners who may have less secure styles. You can be a 'safe haven' — but remember to also express your own vulnerabilities.",
  },
  Anxious: {
    title: "Anxious (Preoccupied) Attachment",
    emoji: "💛",
    body: "You care deeply about your relationships and crave closeness and reassurance. Sometimes, this means you're highly attuned to any signs of distance or disconnection. A late text reply or a distracted partner can trigger your 'alarm system' — not because something is wrong, but because your attachment system is wired to stay alert.",
    strengths: [
      "Deeply emotionally attuned",
      "Passionate and devoted in relationships",
      "Willing to work hard for connection",
      "Empathetic and caring",
    ],
    tip: "When you feel the urge to seek reassurance, pause and ask yourself: 'Is this a real threat, or is my attachment alarm going off?' Building self-soothing skills can help you feel secure from within.",
  },
  Avoidant: {
    title: "Avoidant (Dismissive) Attachment",
    emoji: "🔵",
    body: "You value your independence and self-sufficiency highly. Emotional closeness can sometimes feel uncomfortable or even threatening. This doesn't mean you don't want love — it means your nervous system learned early on to rely on yourself. You may pull back when things get too intense, not out of disinterest, but as a protective strategy.",
    strengths: [
      "Strong sense of self",
      "Calm under pressure",
      "Independent and self-reliant",
      "Comfortable with solitude",
    ],
    tip: "Vulnerability isn't weakness — it's the gateway to deeper connection. Try sharing one small feeling per day with someone you trust. Over time, closeness will feel less threatening.",
  },
  "Fearful-Avoidant": {
    title: "Fearful-Avoidant (Disorganized) Attachment",
    emoji: "🌊",
    body: "You experience a push-pull dynamic in relationships: you crave closeness but also fear it. This can feel confusing — wanting to reach out but then pulling back, or feeling overwhelmed by both intimacy and distance. This pattern often comes from mixed signals in early relationships, and it's more common than you might think.",
    strengths: [
      "Deeply empathetic and perceptive",
      "Capable of profound emotional depth",
      "Resilient and adaptable",
      "Self-aware when given the tools",
    ],
    tip: "Understanding this pattern is the first and most powerful step. Consider working with a therapist who specializes in attachment — you deserve support in building the secure relationships you long for.",
  },
};
