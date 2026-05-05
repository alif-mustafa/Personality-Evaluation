export const GOTTMAN_META = {
  id: "gottman",
  title: "Gottman Conflict Styles",
  shortTitle: "Conflict Styles",
  icon: "⚡",
};

export const GOTTMAN_PROMPT =
  "Read each statement about how you typically behave during conflicts or disagreements with a partner, and indicate how much you agree or disagree.";

export const GOTTMAN_LIKERT = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export const GOTTMAN_QUESTIONS = [
  // Validating
  { id: "g1", text: "Even when we disagree, I try to listen and understand my partner's perspective.", category: "Validating" },
  { id: "g2", text: "I believe it's important to compromise so we both feel satisfied.", category: "Validating" },
  { id: "g3", text: "During an argument, I make sure my partner knows their feelings are valid.", category: "Validating" },
  { id: "g4", text: "I prefer to calmly discuss our issues rather than having intense emotional fights.", category: "Validating" },
  
  // Volatile
  { id: "g5", text: "Our arguments can get very passionate and heated.", category: "Volatile" },
  { id: "g6", text: "I express my feelings very openly and intensely during conflicts.", category: "Volatile" },
  { id: "g7", text: "We often debate and argue, but we also make up quickly.", category: "Volatile" },
  { id: "g8", text: "I feel strongly about my opinions and will defend them vigorously in an argument.", category: "Volatile" },
  
  // Conflict-Avoiding
  { id: "g9", text: "I often let minor issues go rather than start an argument.", category: "Conflict-Avoiding" },
  { id: "g10", text: "I prefer to minimize our differences and focus on what we agree on.", category: "Conflict-Avoiding" },
  { id: "g11", text: "Talking about problems usually just makes things worse.", category: "Conflict-Avoiding" },
  { id: "g12", text: "I feel uncomfortable with conflict and try to step away when tensions rise.", category: "Conflict-Avoiding" },
  
  // Hostile
  { id: "g13", text: "I sometimes resort to sarcasm or name-calling when I'm really angry.", category: "Hostile" },
  { id: "g14", text: "During fights, I tend to criticize my partner's personality or character.", category: "Hostile" },
  { id: "g15", text: "Our arguments often feel like a competition where one person has to win.", category: "Hostile" },
  { id: "g16", text: "I find myself getting defensive and blaming my partner during disagreements.", category: "Hostile" },
  
  // Hostile-Detached
  { id: "g17", text: "When we fight, I eventually just shut down and ignore my partner.", category: "Hostile-Detached" },
  { id: "g18", text: "I feel emotionally disconnected and numb during our worst conflicts.", category: "Hostile-Detached" },
  { id: "g19", text: "Our arguments are often a mix of attacking each other and then completely withdrawing.", category: "Hostile-Detached" },
  { id: "g20", text: "I frequently walk away from conflicts feeling lonely and misunderstood.", category: "Hostile-Detached" },
];

export const GOTTMAN_FEEDBACK = {
  "Validating": {
    title: "Validating",
    description: "You approach conflict calmly and collaboratively. You value communication, active listening, and mutual respect, aiming for compromise. While healthy, be careful not to let the desire for harmony mask deeper issues that require passionate discussion."
  },
  "Volatile": {
    title: "Volatile",
    description: "Your conflicts are passionate and emotionally expressive. You aren't afraid to speak your mind and fiercely defend your position. While this brings energy to the relationship, ensure the intensity doesn't escalate into disrespect or hurtful remarks."
  },
  "Conflict-Avoiding": {
    title: "Conflict-Avoiding",
    description: "You prefer to minimize conflict, focusing on the positives and letting minor issues slide. This creates a peaceful environment, but avoiding all conflict can lead to unresolved issues building up over time."
  },
  "Hostile": {
    title: "Hostile",
    description: "During conflicts, you may exhibit high levels of defensiveness, criticism, and contempt. Arguments can feel like battles to be won. It is critical to work on managing emotional flooding and communicating without attacking your partner's character."
  },
  "Hostile-Detached": {
    title: "Hostile-Detached",
    description: "Your conflict style combines emotional attacks with emotional withdrawal (stonewalling). This pattern of fighting and then shutting down can create a profound sense of isolation and requires active effort to repair communication and emotional safety."
  }
};
