/**
 * Couples Insight Engine
 *
 * Generates:
 * 1. Conflict Heatmap — scores the "gap" between partners on each trait
 * 2. Conflict Advice — targeted advice for each significant gap
 * 3. Attachment Reframing — explains triggers through attachment theory
 */

// ────────────────────────────────────────────
// Conflict Heatmap Generation
// ────────────────────────────────────────────

const TRAIT_LABELS = [
  "Openness",
  "Conscientiousness",
  "Extraversion",
  "Agreeableness",
  "Neuroticism",
];

/**
 * Generate heatmap data from two sets of trait scores.
 * Each partner's scores should be an object like { "Openness": 72, "Conscientiousness": 45, ... }
 * Values are 0–100 normalized scores.
 *
 * Returns an array of { trait, scoreA, scoreB, gap, severity, advice }
 */
export function generateConflictHeatmap(scoresA, scoresB) {
  const results = [];

  for (const trait of TRAIT_LABELS) {
    const a = scoresA[trait] ?? null;
    const b = scoresB[trait] ?? null;

    if (a == null || b == null) continue;

    const gap = Math.abs(a - b);
    const severity = getGapSeverity(gap);
    const advice = getConflictAdvice(trait, a, b, gap);

    results.push({
      trait,
      scoreA: a,
      scoreB: b,
      gap,
      severity,
      advice,
    });
  }

  // Sort by gap descending — biggest conflict zones first
  results.sort((a, b) => b.gap - a.gap);
  return results;
}

function getGapSeverity(gap) {
  if (gap >= 50) return "high";
  if (gap >= 25) return "moderate";
  return "low";
}

// ────────────────────────────────────────────
// Conflict Advice Engine
// ────────────────────────────────────────────

const CONFLICT_ADVICE = {
  Openness: {
    title: "The Explorer vs. The Homebody",
    highA: "Partner A craves novelty and exploration, while Partner B prefers routine and the familiar.",
    highB: "Partner B craves novelty and exploration, while Partner A prefers routine and the familiar.",
    advice: "Find a middle ground: try one new experience together per month while keeping familiar rituals intact. The key is respecting both the need for adventure and the need for stability.",
    deepDive: "This difference often shows up in arguments about vacation plans, social events, and even what to eat for dinner. The 'explorer' may feel stifled, while the 'homebody' may feel overwhelmed. Neither is wrong — you just have different thresholds for novelty.",
  },
  Conscientiousness: {
    title: "The Planner vs. The Improviser",
    highA: "Partner A is highly organized and structured, while Partner B is more spontaneous and flexible.",
    highB: "Partner B is highly organized and structured, while Partner A is more spontaneous and flexible.",
    advice: "Assign 'domains of responsibility' — let the planner own shared logistics (bills, schedules) while the improviser brings flexibility and fun. Avoid trying to change each other; instead, leverage both strengths.",
    deepDive: "This is the classic 'messy vs. tidy' battle. The planner may feel burdened and resentful, while the improviser may feel controlled. Agree on 'shared standards' for common spaces and give each person autonomy over their own domain.",
  },
  Extraversion: {
    title: "The Social Butterfly vs. The Quiet One",
    highA: "Partner A is energized by socializing, while Partner B needs more alone time to recharge.",
    highB: "Partner B is energized by socializing, while Partner A needs more alone time to recharge.",
    advice: "Build in both: plan social events that have a defined end time, so the introvert knows there's a finish line. The extrovert should cultivate some independent social outlets so they don't rely solely on the introvert for social energy.",
    deepDive: "This conflict often surfaces as: 'You never want to go out!' vs. 'You're always dragging me to parties!' The solution isn't compromise (which makes both unhappy) — it's independence. The extrovert goes out sometimes without the introvert, and neither feels guilty about it.",
  },
  Agreeableness: {
    title: "The Peacekeeper vs. The Challenger",
    highA: "Partner A tends to avoid conflict and prioritize harmony, while Partner B is more direct and confrontational.",
    highB: "Partner B tends to avoid conflict and prioritize harmony, while Partner A is more direct and confrontational.",
    advice: "The 'peacekeeper' needs to practice expressing disagreement safely, while the 'challenger' needs to soften their delivery. Establish a 'repair ritual' — a way to reconnect after disagreements.",
    deepDive: "When the peacekeeper suppresses their needs repeatedly, resentment builds. When the challenger pushes too hard, the peacekeeper shuts down. Breaking this cycle requires the challenger to slow down and ask, and the peacekeeper to speak up before they reach their breaking point.",
  },
  Neuroticism: {
    title: "The Sensitive Soul vs. The Steady Rock",
    highA: "Partner A feels emotions more intensely and may need more reassurance, while Partner B is more emotionally even-keeled.",
    highB: "Partner B feels emotions more intensely and may need more reassurance, while Partner A is more emotionally even-keeled.",
    advice: "The 'rock' should validate feelings without trying to fix them ('That sounds really hard' goes further than 'Just calm down'). The 'sensitive soul' should communicate what they need: 'I don't need you to solve this — I just need you to listen.'",
    deepDive: "The steady partner may feel like they're 'walking on eggshells,' while the sensitive partner may feel dismissed or misunderstood. The key insight: emotional intensity isn't a problem to solve — it's a reality to hold space for.",
  },
};

function getConflictAdvice(trait, scoreA, scoreB, gap) {
  const template = CONFLICT_ADVICE[trait];
  if (!template) return null;

  const description = scoreA > scoreB ? template.highA : template.highB;

  return {
    title: template.title,
    description,
    advice: template.advice,
    deepDive: template.deepDive,
  };
}

// ────────────────────────────────────────────
// Attachment Reframing Tool
// ────────────────────────────────────────────

const ATTACHMENT_DYNAMICS = {
  "Anxious-Avoidant": {
    title: "The Anxious-Avoidant Trap",
    emoji: "🌀",
    scenario:
      "When the anxious partner reaches out for connection (texting frequently, seeking reassurance), the avoidant partner feels overwhelmed and pulls back. This pulling back triggers the anxious partner's deepest fear — abandonment — causing them to reach out MORE intensely. The avoidant partner then retreats further. This creates a painful cycle that neither partner wants but both perpetuate.",
    triggers: [
      {
        trigger: "A late text reply",
        anxiousFeels: "They don't care about me. I'm not a priority.",
        avoidantFeels: "I just need some space. Why are they so clingy?",
        reframe:
          "The late reply isn't about love or its absence. The anxious partner's alarm system reads 'silence = danger.' The avoidant partner's system reads 'pressure = threat.' Both are trying to feel safe — just in opposite ways.",
      },
      {
        trigger: "Wanting different amounts of alone time",
        anxiousFeels: "They're pulling away from me. Something must be wrong.",
        avoidantFeels: "I need to recharge. Their constant presence is suffocating.",
        reframe:
          "Alone time isn't rejection — it's regulation. And togetherness isn't control — it's connection. Agreeing on 'I need space AND I'm coming back' can break this cycle.",
      },
      {
        trigger: "A disagreement about plans",
        anxiousFeels: "If we're not on the same page, does that mean we're not right for each other?",
        avoidantFeels: "It's just plans. Why does everything have to be so emotional?",
        reframe:
          "The anxious partner processes disagreements through a relational lens ('What does this say about US?'), while the avoidant partner processes them logically ('Let's just figure this out'). Neither approach is wrong — they just need translation.",
      },
    ],
    advice:
      "The golden rule for this pairing: the avoidant partner should practice moving TOWARD (even when uncomfortable), and the anxious partner should practice self-soothing FIRST (before reaching out). Over time, this rewires both nervous systems toward security.",
  },
  "Anxious-Anxious": {
    title: "The Double Anxiety Spiral",
    emoji: "🔄",
    scenario:
      "When both partners have anxious attachment, the relationship can feel intensely passionate but also turbulent. Both crave reassurance and closeness, but neither feels fully secure in providing it — because they're both looking for it at the same time. Minor issues can quickly escalate as both partners' alarm systems activate simultaneously.",
    triggers: [
      {
        trigger: "One partner seeming distant",
        anxiousFeels: "Both partners: 'Are they losing interest? Do they still love me?'",
        avoidantFeels: null,
        reframe:
          "When both partners' anxious alarms go off at once, it can create a feedback loop of seeking reassurance from someone who also needs reassurance. Building individual coping skills (self-soothing, journaling) gives each person a foundation to draw from.",
      },
    ],
    advice:
      "Create explicit rituals of reassurance — a morning 'I love you' text, a weekly relationship check-in. When both partners know the reassurance is coming, the anxiety has less fuel.",
  },
  "Avoidant-Avoidant": {
    title: "The Distant Dance",
    emoji: "🏔️",
    scenario:
      "Two avoidant partners may build a relationship that looks calm on the surface but lacks emotional depth. Both are comfortable with independence, but neither may initiate vulnerability or emotional intimacy. The relationship can feel more like roommates than romantic partners over time.",
    triggers: [
      {
        trigger: "Neither initiating emotional conversations",
        anxiousFeels: null,
        avoidantFeels: "Both partners: 'I don't want to rock the boat. Things are fine as they are.'",
        reframe:
          "'Fine' can become 'flat' without intentional vulnerability. Someone has to go first. Try the '10% more open' approach: share just a little more than feels comfortable, and see what happens.",
      },
    ],
    advice:
      "Schedule regular emotional check-ins — not because something is wrong, but because connection needs tending. Even 10 minutes of genuine sharing per week can prevent emotional drift.",
  },
  "Secure-Anxious": {
    title: "The Secure Anchor",
    emoji: "⚓",
    scenario:
      "A secure partner can be a powerful healing force for an anxious partner. The secure partner's consistent, non-reactive presence helps the anxious partner's nervous system learn that closeness doesn't lead to abandonment. Over time, the anxious partner often becomes 'earned secure.'",
    triggers: [
      {
        trigger: "The anxious partner seeking extra reassurance",
        anxiousFeels: "I know I'm being 'too much,' but I can't help it.",
        avoidantFeels: null,
        reframe:
          "The secure partner should know: your consistency IS the medicine. You don't have to fix the anxiety — just be steady. And anxious partner: your partner's calm isn't indifference — it's safety.",
      },
    ],
    advice:
      "This is one of the most growth-promoting pairings. The key is patience: the secure partner models healthy attachment, and the anxious partner learns to trust it. It takes time, but it works.",
  },
  "Secure-Avoidant": {
    title: "The Patient Bridge",
    emoji: "🌉",
    scenario:
      "A secure partner can help an avoidant partner slowly open up. The secure partner's non-demanding warmth signals safety. The avoidant partner learns, over time, that vulnerability doesn't lead to hurt or control.",
    triggers: [
      {
        trigger: "The avoidant partner pulling back",
        anxiousFeels: null,
        avoidantFeels: "I need space but I don't want to hurt them.",
        reframe:
          "The secure partner can offer space without anxiety: 'Take the time you need — I'll be here.' This paradoxically makes the avoidant partner want to return sooner.",
      },
    ],
    advice:
      "The secure partner's gift is patience without pressure. Invite closeness, but never force it. Over time, the avoidant partner will offer more vulnerability — on their own terms.",
  },
  "Secure-Secure": {
    title: "The Secure Foundation",
    emoji: "🏡",
    scenario:
      "Two secure partners create a relationship characterized by trust, open communication, and mutual support. Conflicts are resolved through dialogue rather than drama. This doesn't mean the relationship is perfect — it means both partners have the tools to repair ruptures quickly.",
    triggers: [],
    advice:
      "Your relationship has a strong foundation. The challenge is complacency — don't take your connection for granted. Continue to invest in emotional intimacy, shared experiences, and individual growth.",
  },
};

/**
 * Determine attachment dynamic between two partners.
 * @param {string} styleA - "Secure" | "Anxious" | "Avoidant" | "Fearful-Avoidant"
 * @param {string} styleB - same
 * @returns {Object} dynamic insight
 */
export function getAttachmentDynamic(styleA, styleB) {
  // Normalize Fearful-Avoidant to Anxious for dynamic purposes (they have both high anxiety AND avoidance)
  const normA = styleA === "Fearful-Avoidant" ? "Anxious" : styleA;
  const normB = styleB === "Fearful-Avoidant" ? "Anxious" : styleB;

  // Generate lookup key (order-independent)
  const sorted = [normA, normB].sort();
  const key = sorted.join("-");

  const dynamic = ATTACHMENT_DYNAMICS[key];

  if (dynamic) return { ...dynamic, styleA, styleB };

  // Fallback
  return {
    title: "Unique Dynamic",
    emoji: "🔮",
    scenario: "Your combination is unique. The most important insight is that attachment styles are not fixed — they can shift with awareness, intention, and safe relationships.",
    triggers: [],
    advice: "Focus on understanding each other's needs for closeness and independence. Open, non-judgmental conversation about what makes each of you feel safe is the most powerful tool you have.",
    styleA,
    styleB,
  };
}

/**
 * Generate comprehensive reframing insights for a couple.
 */
export function generateReframingInsights(styleA, styleB, scoresA, scoresB) {
  const dynamic = getAttachmentDynamic(styleA, styleB);

  // Add heatmap-informed insights
  const traitConflicts = generateConflictHeatmap(scoresA, scoresB);
  const topConflicts = traitConflicts.filter((c) => c.severity !== "low").slice(0, 3);

  return {
    dynamic,
    topConflicts,
    overallInsight: generateOverallInsight(styleA, styleB, topConflicts),
  };
}

function generateOverallInsight(styleA, styleB, topConflicts) {
  const conflictNames = topConflicts.map((c) => c.advice?.title || c.trait).join(", ");

  if (topConflicts.length === 0) {
    return "Your personality profiles are remarkably compatible! While no relationship is conflict-free, your traits suggest you'll navigate disagreements with relative ease. Focus on maintaining the emotional connection that comes naturally to you.";
  }

  return `Your biggest growth areas as a couple are: ${conflictNames}. Understanding these dynamics — not as flaws, but as different ways of moving through the world — is the first step toward turning friction into deeper understanding. Remember: conflict isn't the enemy of love. Unrepaired conflict is.`;
}
