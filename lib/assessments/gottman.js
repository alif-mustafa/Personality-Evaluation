export const GOTTMAN_META = {
  id: "gottman",
  title: "Couple Conflict Style (Gottman)",
  shortTitle: "Couple Conflict Style",
  icon: "⚡",
};

export const GOTTMAN_PROMPT =
  "Think about how you and your partner typically interact during disagreements. Answer based on what usually happens between you as a couple, not what you wish would happen.";

export const GOTTMAN_LIKERT = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export const GOTTMAN_QUESTIONS = [
  // Validating
  { id: "g1", text: "When we disagree, we usually make an effort to hear each other's perspective before responding.", category: "Validating" },
  { id: "g2", text: "We tend to find a compromise that both of us can feel good about.", category: "Validating" },
  { id: "g3", text: "During arguments, we make sure each other's feelings are acknowledged and validated.", category: "Validating" },
  { id: "g4", text: "Our disagreements are usually calm conversations rather than intense emotional fights.", category: "Validating" },

  // Volatile
  { id: "g5", text: "Our arguments tend to get very passionate and heated.", category: "Volatile" },
  { id: "g6", text: "We both express our feelings very openly and intensely during conflicts.", category: "Volatile" },
  { id: "g7", text: "We often debate and argue intensely, but we also make up quickly and with a lot of warmth.", category: "Volatile" },
  { id: "g8", text: "We both feel strongly about our opinions and will defend them vigorously during an argument.", category: "Volatile" },

  // Conflict-Avoiding
  { id: "g9", text: "We tend to let minor issues go rather than start an argument about them.", category: "Conflict-Avoiding" },
  { id: "g10", text: "We prefer to focus on what we agree on and minimize our differences.", category: "Conflict-Avoiding" },
  { id: "g11", text: "In our relationship, talking about problems usually just makes things worse.", category: "Conflict-Avoiding" },
  { id: "g12", text: "When tensions rise between us, we both tend to step back rather than engage.", category: "Conflict-Avoiding" },

  // Hostile
  { id: "g13", text: "During our worst arguments, sarcasm, name-calling, or personal attacks tend to come out.", category: "Hostile" },
  { id: "g14", text: "In fights, we tend to criticize each other's personality or character rather than the specific issue.", category: "Hostile" },
  { id: "g15", text: "Our arguments often feel like a competition where one of us has to win.", category: "Hostile" },
  { id: "g16", text: "During disagreements, we both get defensive and blame each other.", category: "Hostile" },

  // Hostile-Detached
  { id: "g17", text: "In our arguments, one of us tends to pursue the issue intensely while the other shuts down completely.", category: "Hostile-Detached" },
  { id: "g18", text: "During our worst conflicts, we feel emotionally disconnected from each other — like we're in different worlds.", category: "Hostile-Detached" },
  { id: "g19", text: "Our arguments often follow a pattern of attacking each other and then completely withdrawing.", category: "Hostile-Detached" },
  { id: "g20", text: "After a fight, we both walk away feeling lonely and deeply misunderstood.", category: "Hostile-Detached" },
];

export const GOTTMAN_FEEDBACK = {
  "Validating": {
    title: "Validating",
    stability: "stable",
    description: "Your couple conflict style is Validating — calm, collaborative, and conversational. You prioritize understanding and validating each other's feelings before working toward compromise. You pick your battles carefully and keep conflict frequency low. Research shows Validating couples maintain a healthy 5:1 positive-to-negative interaction ratio.",
    strengths: [
      "You listen to each other during disagreements",
      "You validate each other's feelings before problem-solving",
      "You pick battles wisely and keep conflict constructive",
    ],
    tip: "Your calm approach is a strength. Just make sure you aren't avoiding necessary passionate disagreements for the sake of keeping the peace. Sometimes important issues need emotional energy to resolve fully.",
  },
  "Volatile": {
    title: "Volatile",
    stability: "stable",
    description: "Your couple conflict style is Volatile — highly passionate, expressive, and emotionally intense. You both debate and argue intensely, but you also show high levels of affection, humor, and warmth. You view conflict as a sign of intimacy and engagement. Despite the intensity, Volatile couples can be very stable when they maintain a 5:1 positive-to-negative ratio.",
    strengths: [
      "You're both fully engaged and emotionally present",
      "You repair quickly after arguments — warmth bounces back fast",
      "Your passion keeps the relationship energized and alive",
    ],
    tip: "Your shared passion is a genuine strength. Practice 'soft startups' during arguments to ensure the intensity doesn't cross into personal criticism. The key is making sure the warmth and humor always outweigh the heat.",
  },
  "Conflict-Avoiding": {
    title: "Conflict-Avoiding",
    stability: "stable",
    description: "Your couple conflict style is Conflict-Avoiding — you minimize disagreement, emphasize shared ground, and prefer to accept differences rather than hash them out. You let minor issues go and 'agree to disagree.' This style can be very stable as long as both of you genuinely feel at peace with this approach and maintain a 5:1 positive-to-negative ratio.",
    strengths: [
      "Your day-to-day atmosphere is peaceful and harmonious",
      "You focus on shared values rather than differences",
      "You both respect each other's autonomy and perspective",
    ],
    tip: "Peace is valuable, but unspoken resentments can build quietly over time. Challenge yourselves to bring up one minor issue together this week and practice discussing it constructively. A gentle, regular check-in can prevent slow-burn resentment.",
  },
  "Hostile": {
    title: "Hostile",
    stability: "unstable",
    description: "Your couple conflict style is Hostile — characterized by high levels of defensiveness, criticism, and contempt from both sides during arguments. Conflict feels like a battle rather than a conversation, with poor listening and frequent arguments that cycle without resolution or validation. Your positive-to-negative interaction ratio has likely fallen well below the healthy 5:1 threshold.",
    patterns: [
      "Arguments tend to escalate into personal attacks",
      "Defensiveness and blame flow in both directions",
      "Conflicts cycle without reaching genuine resolution",
    ],
    tip: "Notice when you feel emotionally 'flooded' — heart racing, feeling defensive. That's the signal to take a 20-minute break before continuing. Practice expressing your needs without criticizing your partner's character. Small shifts in how you start conversations can transform the entire pattern.",
  },
  "Hostile-Detached": {
    title: "Hostile-Detached",
    stability: "unstable",
    description: "Your couple conflict style is Hostile-Detached — one partner tends to engage passionately (pursuing, attacking, or pressing the issue) while the other completely detaches, stonewalls, or acts emotionally aloof. This creates an emotional cat-and-mouse dynamic that both of you co-create. Your positive-to-negative interaction ratio has likely collapsed.",
    patterns: [
      "One pursues while the other withdraws — a painful loop",
      "Arguments alternate between intense conflict and cold silence",
      "Both partners end up feeling deeply lonely and misunderstood",
    ],
    tip: "The withdrawal (stonewalling) is often a self-protection response, not indifference. Practice recognizing when you're shutting down and communicate: 'I need a break, but I will come back to this.' The pursuing partner can help by softening their approach — less intensity, more curiosity.",
  },
};
