/**
 * Educational Trait Cards and Growth Tips
 *
 * Plain-language explanations for all personality traits
 * used across the Core Personality, Attachment, and HEXACO assessments.
 */

export const TRAIT_CARDS = [
  {
    id: "openness",
    trait: "Openness to Experience",
    emoji: "🎨",
    color: "#8b5cf6",
    front: "How much you enjoy new ideas, art, and adventure.",
    back: "People high in Openness are imaginative, curious, and drawn to novelty. They love exploring ideas, art, and experiences. People lower in Openness prefer the familiar and value practicality over abstraction. Neither is better — the world needs both dreamers and doers.",
    funFact: "High Openness is the strongest personality predictor of creative achievement.",
    source: "Core Personality",
  },
  {
    id: "conscientiousness",
    trait: "Conscientiousness",
    emoji: "📋",
    color: "#3b7bfc",
    front: "How organized, disciplined, and goal-directed you are.",
    back: "Highly conscientious people are planners, list-makers, and finishers. They follow through on commitments and pay attention to details. Lower scorers are more spontaneous and flexible, preferring to go with the flow. This trait is one of the strongest predictors of job performance and academic success.",
    funFact: "Conscientiousness is the strongest personality predictor of longevity — organized people tend to live longer.",
    source: "Core Personality",
  },
  {
    id: "extraversion",
    trait: "Extraversion",
    emoji: "🎉",
    color: "#f59e0b",
    front: "How much energy you get from social interaction.",
    back: "Extraverts are energized by being around people. They tend to be talkative, enthusiastic, and action-oriented. Introverts recharge in solitude and prefer deeper, one-on-one connections. It's a spectrum, not a binary — most people fall somewhere in the middle (called 'ambiverts').",
    funFact: "Introverts aren't necessarily shy — shyness is about anxiety, while introversion is about energy.",
    source: "Core Personality",
  },
  {
    id: "agreeableness",
    trait: "Agreeableness",
    emoji: "🤝",
    color: "#3a8c69",
    front: "How much you prioritize others' needs and social harmony.",
    back: "Agreeable people are warm, cooperative, and empathetic. They put others at ease and avoid conflict. Less agreeable people are more competitive, skeptical, and willing to challenge others. In relationships, agreeableness predicts kindness — but too much can mean difficulty setting boundaries.",
    funFact: "Agreeableness tends to increase as people age — we really do get mellower with time.",
    source: "Core Personality",
  },
  {
    id: "neuroticism",
    trait: "Neuroticism",
    emoji: "🌊",
    color: "#f43f5e",
    front: "How intensely you experience negative emotions.",
    back: "People high in Neuroticism feel emotions like anxiety, sadness, and frustration more intensely. This isn't a flaw — it's often paired with deep empathy and self-awareness. People lower in Neuroticism are more emotionally stable and tend to stay calm under pressure. Understanding your emotional baseline helps you build the right coping strategies.",
    funFact: "Neuroticism isn't about being 'neurotic' — it's better understood as 'emotional sensitivity.'",
    source: "Core Personality",
  },
  {
    id: "attachment-anxiety",
    trait: "Attachment Anxiety",
    emoji: "💛",
    color: "#f59e0b",
    front: "How much you worry about abandonment in relationships.",
    back: "Attachment anxiety reflects the degree to which you fear rejection or abandonment in close relationships. Higher anxiety doesn't mean you're 'needy' — it means your nervous system is wired to be vigilant about relational threats. This often develops in childhood and can shift with self-awareness and secure relationships.",
    funFact: "Approximately 20% of adults have an anxious attachment style, according to research.",
    source: "Attachment Theory",
  },
  {
    id: "attachment-avoidance",
    trait: "Attachment Avoidance",
    emoji: "🔵",
    color: "#3b7bfc",
    front: "How much you tend to maintain emotional distance in relationships.",
    back: "Attachment avoidance reflects the degree to which you keep emotional distance in close relationships. Higher avoidance doesn't mean you don't want love — it means closeness can feel threatening to your autonomy. This is a protective strategy, often learned early in life, and it can evolve with trust and intentional vulnerability.",
    funFact: "Avoidant attachment activates the same brain regions as physical pain when forced into emotional closeness.",
    source: "Attachment Theory",
  },
];

/**
 * Growth tips generator.
 * Returns personalized tips based on a user's highest and lowest scoring traits.
 */
export function generateGrowthTips(results) {
  const tips = [];

  // Core Personality tips
  if (results.bigfive) {
    const scores = results.bigfive.scores;
    const traitEntries = Object.entries(scores).map(([trait, data]) => ({
      trait,
      score: data.normalized,
    }));

    // Sort by score
    traitEntries.sort((a, b) => a.score - b.score);

    const lowest = traitEntries[0];
    const highest = traitEntries[traitEntries.length - 1];

    tips.push({
      category: "Your Superpower",
      emoji: "⭐",
      trait: highest.trait,
      score: highest.score,
      content: getSuperPowerTip(highest.trait),
    });

    tips.push({
      category: "Growth Edge",
      emoji: "🌱",
      trait: lowest.trait,
      score: lowest.score,
      content: getGrowthEdgeTip(lowest.trait),
    });
  }

  // Attachment tips
  if (results.attachment) {
    tips.push({
      category: "Relationship Pattern",
      emoji: "💝",
      trait: results.attachment.style,
      content: getAttachmentGrowthTip(results.attachment.style),
    });
  }

  // Love Languages tips
  if (results.lovelanguages) {
    tips.push({
      category: "Love Language",
      emoji: "❤️",
      trait: results.lovelanguages.style,
      content: getLoveLanguageGrowthTip(results.lovelanguages.style),
    });
  }

  // Gottman tips — only show when couple-level style is available
  if (results.coupleConflictStyle) {
    tips.push({
      category: "Couple Conflict Style",
      emoji: "⚡",
      trait: results.coupleConflictStyle,
      content: getGottmanGrowthTip(results.coupleConflictStyle),
    });
  }

  return tips;
}

function getSuperPowerTip(trait) {
  const tips = {
    Openness:
      "Your creativity and curiosity are gifts. Channel them into projects, conversations, and experiences that stretch your imagination. Consider sharing your ideas — the world benefits when open-minded people speak up.",
    Conscientiousness:
      "Your reliability and discipline set you apart. Others trust you with important tasks. Just remember that rest is productive too — scheduling downtime with the same intention you give to work can prevent burnout.",
    Extraversion:
      "Your social energy lights up rooms. Use it to build bridges — introduce people who should know each other, create gatherings, and champion others. Your enthusiasm is contagious in the best way.",
    Agreeableness:
      "Your warmth creates safe spaces. People feel they can be themselves around you. This is powerful. Make sure you're also creating safe space for yourself — your needs matter just as much.",
    Neuroticism:
      "Your emotional depth gives you exceptional empathy and intuition. You notice things others miss. Channel this sensitivity into creative expression, deep conversations, or helping others feel understood.",
  };
  return tips[trait] || "Continue developing this strength — it's a core part of who you are.";
}

function getGrowthEdgeTip(trait) {
  const tips = {
    Openness:
      "Consider expanding your comfort zone in small ways: try a new genre of music, take a different route, or ask someone an unexpected question. Growth doesn't require revolution — it can be one small experiment at a time.",
    Conscientiousness:
      "Start with one small system: a weekly to-do list, a 5-minute morning plan, or a simple habit tracker. Structure doesn't have to feel rigid — think of it as freedom from chaos.",
    Extraversion:
      "Your independence is valuable, but connection is a human need. Try reaching out to one person per week — a short coffee, a voice note, or even a thoughtful text. Small social investments compound over time.",
    Agreeableness:
      "Being direct doesn't have to mean being harsh. Practice the 'sandwich': genuine praise, honest feedback, genuine encouragement. Your opinions are valuable — the world needs to hear them.",
    Neuroticism:
      "Your emotional stability is a strength, but make sure you're not suppressing feelings. Check in with yourself: 'How am I actually feeling?' Emotional awareness keeps you connected to yourself and others.",
  };
  return tips[trait] || "This is an area with room to grow — approach it with curiosity, not judgment.";
}

function getAttachmentGrowthTip(style) {
  const tips = {
    Secure:
      "Your secure base is a gift — both to yourself and your partners. Continue investing in self-awareness and open communication. You have the capacity to help less securely attached partners grow toward security.",
    Anxious:
      "Your deep capacity for love is beautiful. Practice building a 'secure inner voice' by journaling, meditating, or talking to trusted friends when anxiety spikes. Over time, you can learn to soothe yourself AND accept comfort from others.",
    Avoidant:
      "Vulnerability is a muscle, not a switch. Start small: share one feeling per day with someone you trust. Notice that nothing terrible happens when you open up. Over time, closeness will feel less threatening and more nourishing.",
    "Fearful-Avoidant":
      "Your awareness of this pattern is the most powerful first step. Consider working with a therapist who understands attachment theory — having a 'safe base' professional relationship can help you build the template for safe personal ones.",
  };
  return tips[style] || "Understanding your attachment style is the first step toward more fulfilling relationships.";
}

function getLoveLanguageGrowthTip(style) {
  const tips = {
    "Words of Affirmation": "Your words have power. Make sure you are also speaking kindly to yourself. In relationships, tell your partner explicitly that verbal appreciation is how you feel loved best.",
    "Quality Time": "In our busy world, undivided attention is rare. Make sure to schedule 'device-free' time with your partner to truly connect and recharge your relationship battery.",
    "Receiving Gifts": "You appreciate the thought behind the gesture. Help your partner understand that gifts don't need to be expensive; a small, meaningful token shows they were thinking of you.",
    "Acts of Service": "You feel loved when someone eases your burden. Practice asking for help directly instead of waiting for your partner to notice what needs to be done.",
    "Physical Touch": "Physical connection grounds you. Communicate your need for non-sexual touch (like holding hands or sitting close) to keep your emotional bond strong.",
  };
  return tips[style] || "Understanding what makes you feel loved is the key to relationship satisfaction.";
}

function getGottmanGrowthTip(style) {
  const tips = {
    "Validating": "Your couple's calm, collaborative approach to conflict is a genuine strength. Just make sure you aren't avoiding necessary passionate disagreements for the sake of keeping the peace — sometimes important issues need emotional energy to resolve fully.",
    "Volatile": "Your couple's passion keeps the relationship energized. Practice 'soft startups' during arguments to ensure the shared intensity doesn't cross into personal criticism. The key is making sure the warmth and humor always outweigh the heat.",
    "Conflict-Avoiding": "Your couple's peaceful approach feels comfortable, but unspoken resentments can build quietly. Challenge yourselves to bring up one minor issue together this week and practice discussing it constructively. A gentle, regular check-in can prevent slow-burn resentment.",
    "Hostile": "Your couple's conflict pattern has become combative. Notice when you feel emotionally 'flooded' — that's the signal to take a 20-minute break. Practice expressing your needs without criticizing each other's character. Small shifts in how you start conversations can transform the entire dynamic.",
    "Hostile-Detached": "Your couple's conflict pattern has become a pursue-and-withdraw loop. The withdrawal is often self-protection, not indifference. Practice recognizing when one of you is shutting down and communicate: 'I need a break, but I will come back to this.' The pursuing partner can help by softening their approach.",
  };
  return tips[style] || "Awareness of your couple's conflict style allows you to communicate more effectively under stress.";
}
