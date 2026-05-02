/**
 * Big Five Inventory (BFI-44)
 * Based on John, Donahue, & Kentle (1991).
 * 
 * Scoring: Each item maps to a trait and may be reverse-scored (R).
 * Likert: 1 = Disagree strongly … 5 = Agree strongly
 */

export const BIG_FIVE_META = {
  id: "bigfive",
  title: "Big Five Personality Inventory",
  shortTitle: "Big Five (BFI-44)",
  description: "Measures the five major dimensions of personality: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.",
  questionCount: 44,
  estimatedMinutes: 8,
  icon: "🌊",
  traits: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"],
  traitColors: {
    Openness: "#8b5cf6",
    Conscientiousness: "#3b7bfc",
    Extraversion: "#f59e0b",
    Agreeableness: "#3a8c69",
    Neuroticism: "#f43f5e",
  },
};

export const BIG_FIVE_QUESTIONS = [
  // Prompt: "I see myself as someone who..."
  { id: 1,  text: "Is talkative", trait: "Extraversion", reverse: false },
  { id: 2,  text: "Tends to find fault with others", trait: "Agreeableness", reverse: true },
  { id: 3,  text: "Does a thorough job", trait: "Conscientiousness", reverse: false },
  { id: 4,  text: "Is depressed, blue", trait: "Neuroticism", reverse: false },
  { id: 5,  text: "Is original, comes up with new ideas", trait: "Openness", reverse: false },
  { id: 6,  text: "Is reserved", trait: "Extraversion", reverse: true },
  { id: 7,  text: "Is helpful and unselfish with others", trait: "Agreeableness", reverse: false },
  { id: 8,  text: "Can be somewhat careless", trait: "Conscientiousness", reverse: true },
  { id: 9,  text: "Is relaxed, handles stress well", trait: "Neuroticism", reverse: true },
  { id: 10, text: "Is curious about many different things", trait: "Openness", reverse: false },
  { id: 11, text: "Is full of energy", trait: "Extraversion", reverse: false },
  { id: 12, text: "Starts quarrels with others", trait: "Agreeableness", reverse: true },
  { id: 13, text: "Is a reliable worker", trait: "Conscientiousness", reverse: false },
  { id: 14, text: "Can be tense", trait: "Neuroticism", reverse: false },
  { id: 15, text: "Is ingenious, a deep thinker", trait: "Openness", reverse: false },
  { id: 16, text: "Generates a lot of enthusiasm", trait: "Extraversion", reverse: false },
  { id: 17, text: "Has a forgiving nature", trait: "Agreeableness", reverse: false },
  { id: 18, text: "Tends to be disorganized", trait: "Conscientiousness", reverse: true },
  { id: 19, text: "Worries a lot", trait: "Neuroticism", reverse: false },
  { id: 20, text: "Has an active imagination", trait: "Openness", reverse: false },
  { id: 21, text: "Tends to be quiet", trait: "Extraversion", reverse: true },
  { id: 22, text: "Is generally trusting", trait: "Agreeableness", reverse: false },
  { id: 23, text: "Tends to be lazy", trait: "Conscientiousness", reverse: true },
  { id: 24, text: "Is emotionally stable, not easily upset", trait: "Neuroticism", reverse: true },
  { id: 25, text: "Is inventive", trait: "Openness", reverse: false },
  { id: 26, text: "Has an assertive personality", trait: "Extraversion", reverse: false },
  { id: 27, text: "Can be cold and aloof", trait: "Agreeableness", reverse: true },
  { id: 28, text: "Perseveres until the task is finished", trait: "Conscientiousness", reverse: false },
  { id: 29, text: "Can be moody", trait: "Neuroticism", reverse: false },
  { id: 30, text: "Values artistic, aesthetic experiences", trait: "Openness", reverse: false },
  { id: 31, text: "Is sometimes shy, inhibited", trait: "Extraversion", reverse: true },
  { id: 32, text: "Is considerate and kind to almost everyone", trait: "Agreeableness", reverse: false },
  { id: 33, text: "Does things efficiently", trait: "Conscientiousness", reverse: false },
  { id: 34, text: "Remains calm in tense situations", trait: "Neuroticism", reverse: true },
  { id: 35, text: "Prefers work that is routine", trait: "Openness", reverse: true },
  { id: 36, text: "Is outgoing, sociable", trait: "Extraversion", reverse: false },
  { id: 37, text: "Is sometimes rude to others", trait: "Agreeableness", reverse: true },
  { id: 38, text: "Makes plans and follows through with them", trait: "Conscientiousness", reverse: false },
  { id: 39, text: "Gets nervous easily", trait: "Neuroticism", reverse: false },
  { id: 40, text: "Likes to reflect, play with ideas", trait: "Openness", reverse: false },
  { id: 41, text: "Has few artistic interests", trait: "Openness", reverse: true },
  { id: 42, text: "Likes to cooperate with others", trait: "Agreeableness", reverse: false },
  { id: 43, text: "Is easily distracted", trait: "Conscientiousness", reverse: true },
  { id: 44, text: "Is sophisticated in art, music, or literature", trait: "Openness", reverse: false },
];

export const BIG_FIVE_PROMPT = "I see myself as someone who...";

export const BIG_FIVE_LIKERT = [
  { value: 1, label: "Disagree Strongly" },
  { value: 2, label: "Disagree a Little" },
  { value: 3, label: "Neither Agree nor Disagree" },
  { value: 4, label: "Agree a Little" },
  { value: 5, label: "Agree Strongly" },
];

/**
 * Feedback templates — empathetic, strengths-first, non-diagnostic
 */
export const BIG_FIVE_FEEDBACK = {
  Openness: {
    high: {
      title: "A Creative Explorer",
      body: "You have a natural curiosity and love exploring new ideas, perspectives, and experiences. This makes you an imaginative thinker and a creative problem-solver. You tend to appreciate art, beauty, and unconventional approaches to life.",
      tip: "Your openness is a gift. To stay grounded, consider pairing your exploration with routines that give you stability — like a creative practice with regular hours.",
    },
    mid: {
      title: "Balanced & Adaptable",
      body: "You strike a nice balance between embracing new experiences and appreciating the familiar. You can be creative when the situation calls for it, but you also value practical, tested approaches.",
      tip: "You're naturally versatile. Try pushing your creative boundaries once a week — explore a new genre of music, try a different route, or read something outside your comfort zone.",
    },
    low: {
      title: "Practical & Grounded",
      body: "You tend to prefer the tried-and-true over the experimental. You value clarity, practicality, and concrete results. This gives you a steady, dependable presence that others often find reassuring.",
      tip: "Your groundedness is a strength. To expand your perspective gently, try one small 'new thing' per month — it could be as simple as a new recipe or a different podcast.",
    },
  },
  Conscientiousness: {
    high: {
      title: "Reliable & Driven",
      body: "You're someone who follows through. You set goals, make plans, and work diligently toward them. Others can count on you, and you take pride in doing things well and on time.",
      tip: "Your discipline is admirable. Just remember: rest is productive too. Build in guilt-free downtime to recharge — you've earned it.",
    },
    mid: {
      title: "Flexibly Organized",
      body: "You're capable of being organized and focused when it matters, but you're also flexible enough to adapt when plans change. You don't need rigid structures to get things done.",
      tip: "Try identifying your top 3 priorities each week. This light structure can help you channel your energy without feeling boxed in.",
    },
    low: {
      title: "Spontaneous & Flexible",
      body: "You tend to go with the flow and prefer spontaneity over strict schedules. You're adaptable and can shift gears easily, which makes you comfortable in dynamic environments.",
      tip: "Your flexibility is valuable. For areas where follow-through really matters (health, finances, key relationships), consider one small system — like a weekly check-in with yourself.",
    },
  },
  Extraversion: {
    high: {
      title: "Energized by Connection",
      body: "You thrive on social interaction and draw energy from being around others. You're likely enthusiastic, talkative, and comfortable taking the lead in group settings.",
      tip: "Your social energy is contagious. To deepen relationships, try scheduling one-on-one time alongside group activities — deeper connections fuel you differently.",
    },
    mid: {
      title: "The Social Chameleon",
      body: "You enjoy socializing but also value your alone time. You can be the life of the party when you choose, and equally content with a quiet evening in. This balance serves you well.",
      tip: "Honor both sides of yourself. Check in with your energy levels — sometimes you need people, sometimes you need solitude. Both are valid.",
    },
    low: {
      title: "Reflective & Independent",
      body: "You tend to recharge in quieter settings and prefer meaningful one-on-one conversations over large gatherings. You're thoughtful, observant, and comfortable with your own company.",
      tip: "Your reflective nature is a superpower for deep thinking. When social situations feel draining, give yourself permission to arrive late, leave early, or skip entirely.",
    },
  },
  Agreeableness: {
    high: {
      title: "Warm & Compassionate",
      body: "You care deeply about others' well-being and tend to be cooperative, trusting, and empathetic. People feel safe around you, and you're often the peacemaker in group dynamics.",
      tip: "Your compassion is beautiful — just make sure it extends to yourself too. Practice saying 'no' occasionally; your needs matter as much as everyone else's.",
    },
    mid: {
      title: "Fair & Balanced",
      body: "You can be warm and cooperative while also standing firm when needed. You value fairness and can see multiple sides of an argument, which makes you a natural mediator.",
      tip: "You navigate social dynamics well. Trust your instincts about when to be flexible and when to hold your ground — you're usually right.",
    },
    low: {
      title: "Direct & Analytical",
      body: "You tend to prioritize logic and honesty over social harmony. You're comfortable with debate, skeptical of surface-level politeness, and willing to challenge ideas directly.",
      tip: "Your directness is valuable — many people appreciate honest feedback. In close relationships, pairing your honesty with warmth ('I'm saying this because I care') can help your message land better.",
    },
  },
  Neuroticism: {
    high: {
      title: "Deeply Feeling",
      body: "You experience emotions with intensity, which means you're attuned to both your own inner world and the emotional currents around you. This sensitivity, while sometimes overwhelming, is also the source of deep empathy and self-awareness.",
      tip: "Your emotional depth is real and valid. Building a 'calm toolkit' — deep breathing, journaling, nature walks — can help you navigate intense moments without being swept away by them.",
    },
    mid: {
      title: "Emotionally Balanced",
      body: "You experience a healthy range of emotions without being overwhelmed by them. You can feel stress and worry, but you generally recover and move forward without getting stuck.",
      tip: "You have a solid emotional foundation. During stressful periods, lean into the coping strategies that already work for you — you've built good instincts.",
    },
    low: {
      title: "Calm & Steady",
      body: "You tend to be emotionally stable and even-keeled, handling stress and setbacks with relative ease. Others may look to you as an anchor during turbulent times.",
      tip: "Your calm is a gift to those around you. Just remember that occasional stress or sadness is completely normal — you don't always have to be the steady one.",
    },
  },
};
