export const ATTACHMENT_META = {
  id: "attachment",
  title: "Attachment Style (ECR-R)",
  shortTitle: "Attachment Style",
  icon: "🔗",
};

export const ATTACHMENT_PROMPT =
  "The following statements concern how you generally feel in emotionally intimate relationships. Respond to each statement by indicating how much you agree or disagree with it.";

export const ATTACHMENT_LIKERT = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Slightly Disagree" },
  { value: 4, label: "Neutral" },
  { value: 5, label: "Slightly Agree" },
  { value: 6, label: "Agree" },
  { value: 7, label: "Strongly Agree" },
];

export const ATTACHMENT_QUESTIONS = [
  { id: "e1", text: "I prefer not to show a partner how I feel deep down.", dimension: "Avoidance", reverse: false },
  { id: "e2", text: "I worry about being abandoned.", dimension: "Anxiety", reverse: false },
  { id: "e3", text: "I am very comfortable being close to romantic partners.", dimension: "Avoidance", reverse: true },
  { id: "e4", text: "I worry a lot about my relationships.", dimension: "Anxiety", reverse: false },
  { id: "e5", text: "Just when my partner starts to get close to me I find myself pulling away.", dimension: "Avoidance", reverse: false },
  { id: "e6", text: "I worry that romantic partners won't care about me as much as I care about them.", dimension: "Anxiety", reverse: false },
  { id: "e7", text: "I get uncomfortable when a romantic partner wants to be very close.", dimension: "Avoidance", reverse: false },
  { id: "e8", text: "I worry a fair amount about losing my partner.", dimension: "Anxiety", reverse: false },
  { id: "e9", text: "I don't feel comfortable opening up to romantic partners.", dimension: "Avoidance", reverse: false },
  { id: "e10", text: "I often wish that my partner's feelings for me were as strong as my feelings for him or her.", dimension: "Anxiety", reverse: false },
  { id: "e11", text: "I want to get close to my partner, but I keep pulling back.", dimension: "Avoidance", reverse: false },
  { id: "e12", text: "I often want to merge completely with romantic partners, and this sometimes scares them away.", dimension: "Anxiety", reverse: false },
  { id: "e13", text: "I am nervous when partners get too close to me.", dimension: "Avoidance", reverse: false },
  { id: "e14", text: "I worry about being alone.", dimension: "Anxiety", reverse: false },
  { id: "e15", text: "I feel comfortable sharing my private thoughts and feelings with my partner.", dimension: "Avoidance", reverse: true },
  { id: "e16", text: "My desire to be very close sometimes scares people away.", dimension: "Anxiety", reverse: false },
  { id: "e17", text: "I try to avoid getting too close to my partner.", dimension: "Avoidance", reverse: false },
  { id: "e18", text: "I need a lot of reassurance that I am loved by my partner.", dimension: "Anxiety", reverse: false },
  { id: "e19", text: "I find it relatively easy to get close to my partner.", dimension: "Avoidance", reverse: true },
  { id: "e20", text: "Sometimes I feel that I force my partners to show more feeling, more commitment.", dimension: "Anxiety", reverse: false },
  { id: "e21", text: "I find it difficult to allow myself to depend on romantic partners.", dimension: "Avoidance", reverse: false },
  { id: "e22", text: "I do not often worry about being abandoned.", dimension: "Anxiety", reverse: true },
  { id: "e23", text: "I prefer not to be too close to romantic partners.", dimension: "Avoidance", reverse: false },
  { id: "e24", text: "If I can't get my partner to show interest in me, I get upset or angry.", dimension: "Anxiety", reverse: false },
  { id: "e25", text: "I tell my partner just about everything.", dimension: "Avoidance", reverse: true },
  { id: "e26", text: "I find that my partner(s) don't want to get as close as I would like.", dimension: "Anxiety", reverse: false },
  { id: "e27", text: "I usually discuss my problems and concerns with my partner.", dimension: "Avoidance", reverse: true },
  { id: "e28", text: "When I'm not involved in a relationship, I feel somewhat anxious and incomplete.", dimension: "Anxiety", reverse: false },
  { id: "e29", text: "I feel comfortable depending on romantic partners.", dimension: "Avoidance", reverse: true },
  { id: "e30", text: "I get frustrated when my partner is not around as much as I would like.", dimension: "Anxiety", reverse: false },
  { id: "e31", text: "I don't mind asking romantic partners for comfort, advice, or help.", dimension: "Avoidance", reverse: true },
  { id: "e32", text: "I get frustrated if romantic partners are not available when I need them.", dimension: "Anxiety", reverse: false },
  { id: "e33", text: "It helps to turn to my romantic partner in times of need.", dimension: "Avoidance", reverse: true },
  { id: "e34", text: "When romantic partners disapprove of me, I feel really bad about myself.", dimension: "Anxiety", reverse: false },
  { id: "e35", text: "I turn to my partner for many things, including comfort and reassurance.", dimension: "Avoidance", reverse: true },
  { id: "e36", text: "I resent it when my partner spends time away from me.", dimension: "Anxiety", reverse: false },
];

export const ATTACHMENT_FEEDBACK = {
  "Secure": {
    title: "Secure",
    description: "You generally feel comfortable with intimacy and are usually warm and loving. You don't often worry about being abandoned or getting too close, which allows you to build healthy, balanced relationships."
  },
  "Anxious": {
    title: "Anxious-Preoccupied",
    description: "You crave emotional intimacy, but you often worry that your partner doesn't want to be as close as you do. This can lead to a need for frequent reassurance and a heightened sensitivity to relationship fluctuations."
  },
  "Avoidant": {
    title: "Dismissive-Avoidant",
    description: "You tend to equate intimacy with a loss of independence and often prefer to rely on yourself. You might feel uncomfortable when a partner gets too close and may distance yourself during emotionally intense moments."
  },
  "Fearful-Avoidant": {
    title: "Fearful-Avoidant",
    description: "You both desire and fear intimacy. You want close relationships but have a hard time trusting others or depending on them, often fearing that getting too close will lead to getting hurt."
  }
};
