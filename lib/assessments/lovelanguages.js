export const LOVELANGUAGES_META = {
  id: "lovelanguages",
  title: "The 5 Love Languages",
  shortTitle: "Love Languages",
  icon: "❤️",
};

export const LOVELANGUAGES_PROMPT =
  "For each pair of statements, select the one that makes you feel most loved and appreciated.";

// A = Words of Affirmation
// T = Quality Time
// G = Receiving Gifts
// S = Acts of Service
// P = Physical Touch
export const LOVELANGUAGES_QUESTIONS = [
  { id: "q1", format: "ab", options: [{ value: "A", label: "I like to receive notes of affirmation." }, { value: "P", label: "I like to be hugged." }] },
  { id: "q2", format: "ab", options: [{ value: "T", label: "I like to spend one-on-one time with a person who is special to me." }, { value: "S", label: "I feel loved when someone gives practical help to me." }] },
  { id: "q3", format: "ab", options: [{ value: "G", label: "I like it when people give me gifts." }, { value: "T", label: "I like leisurely visits with friends and loved ones." }] },
  { id: "q4", format: "ab", options: [{ value: "S", label: "I feel loved when people do things to help me." }, { value: "P", label: "I feel loved when people touch me." }] },
  { id: "q5", format: "ab", options: [{ value: "G", label: "I feel loved when someone I love or admire puts their arm around me." }, { value: "A", label: "I feel loved when I receive a gift from someone I love or admire." }] }, // Corrected mapping in scoring logic or options
  { id: "q6", format: "ab", options: [{ value: "T", label: "I like to go places with friends and loved ones." }, { value: "P", label: "I like to high-five or hold hands with people who are special to me." }] },
  { id: "q7", format: "ab", options: [{ value: "G", label: "Visible symbols of love (gifts) are very important to me." }, { value: "A", label: "I feel loved when people affirm me." }] },
  { id: "q8", format: "ab", options: [{ value: "P", label: "I like to sit close to people whom I enjoy being around." }, { value: "A", label: "I like for people to tell me I am beautiful/handsome." }] },
  { id: "q9", format: "ab", options: [{ value: "T", label: "I like to spend time with friends and loved ones." }, { value: "G", label: "I like to receive little gifts from friends and loved ones." }] },
  { id: "q10", format: "ab", options: [{ value: "A", label: "Words of acceptance are important to me." }, { value: "S", label: "I know someone loves me when he/she helps me." }] },
  { id: "q11", format: "ab", options: [{ value: "T", label: "I like being together and doing things with friends and loved ones." }, { value: "A", label: "I like it when kind words are spoken to me." }] },
  { id: "q12", format: "ab", options: [{ value: "P", label: "What someone does affects me more than what he/she says." }, { value: "S", label: "Hugs make me feel connected and valued." }] },
  { id: "q13", format: "ab", options: [{ value: "A", label: "I value praise and try to avoid criticism." }, { value: "G", label: "Several inexpensive gifts mean more to me than one large expensive gift." }] },
  { id: "q14", format: "ab", options: [{ value: "T", label: "I feel close to someone when we are talking or doing something together." }, { value: "P", label: "I feel closer to friends and loved ones when they touch me often." }] },
  { id: "q15", format: "ab", options: [{ value: "A", label: "I like for people to compliment my achievements." }, { value: "S", label: "I know people love me when they do things for me that they don't enjoy doing." }] },
  { id: "q16", format: "ab", options: [{ value: "P", label: "I like to be touched as friends and loved ones walk by." }, { value: "T", label: "I like it when people listen to me and show genuine interest in what I am saying." }] },
  { id: "q17", format: "ab", options: [{ value: "G", label: "I feel loved when friends and loved ones help me with jobs or projects." }, { value: "S", label: "I really enjoy receiving gifts from friends and loved ones." }] },
  { id: "q18", format: "ab", options: [{ value: "A", label: "I like for people to compliment my appearance." }, { value: "T", label: "I feel loved when people take time to understand my feelings." }] },
  { id: "q19", format: "ab", options: [{ value: "P", label: "I feel secure when a special person is touching me." }, { value: "S", label: "Acts of service make me feel loved." }] },
  { id: "q20", format: "ab", options: [{ value: "S", label: "I appreciate the many things that special people do for me." }, { value: "G", label: "I like receiving gifts that special people make for me." }] },
  { id: "q21", format: "ab", options: [{ value: "T", label: "I really enjoy the feeling I get when someone gives me undivided attention." }, { value: "S", label: "I really enjoy the feeling I get when someone does some act of service for me." }] },
  { id: "q22", format: "ab", options: [{ value: "G", label: "I feel loved when a person celebrates my birthday with a gift." }, { value: "A", label: "I feel loved when a person celebrates my birthday with meaningful words." }] },
  { id: "q23", format: "ab", options: [{ value: "G", label: "I know a person is thinking of me when he/she gives me a gift." }, { value: "S", label: "I feel loved when a person helps with my chores." }] },
  { id: "q24", format: "ab", options: [{ value: "T", label: "I appreciate it when someone listens patiently and doesn't interrupt me." }, { value: "G", label: "I appreciate it when someone remembers special days with a gift." }] },
  { id: "q25", format: "ab", options: [{ value: "T", label: "I like knowing loved ones are concerned enough to help with my daily tasks." }, { value: "S", label: "I enjoy extended trips with someone who is special to me." }] },
  { id: "q26", format: "ab", options: [{ value: "P", label: "I enjoy kissing or being kissed by people with whom I am close." }, { value: "G", label: "I enjoy receiving a gift given for no special reason." }] },
  { id: "q27", format: "ab", options: [{ value: "A", label: "I like to be told that I am appreciated." }, { value: "T", label: "I like for a person to look at me when we are talking." }] },
  { id: "q28", format: "ab", options: [{ value: "G", label: "Gifts from a friend or loved one are always special to me." }, { value: "P", label: "I feel good when a friend or loved one touches me." }] },
  { id: "q29", format: "ab", options: [{ value: "S", label: "I feel loved when a person enthusiastically does some task I have requested." }, { value: "A", label: "I feel loved when I am told how much I am needed." }] },
  { id: "q30", format: "ab", options: [{ value: "P", label: "I need to be touched every day." }, { value: "A", label: "I need words of affirmation every day." }] }
];

export const LOVELANGUAGES_FEEDBACK = {
  A: {
    title: "Words of Affirmation",
    description: "Actions don't always speak louder than words. If this is your love language, unsolicited compliments mean the world to you. Hearing the words, 'I love you,' are important – hearing the reasons behind that love sends your spirits skyward. Insults can leave you shattered and are not easily forgotten."
  },
  T: {
    title: "Quality Time",
    description: "In the vernacular of Quality Time, nothing says, 'I love you,' like full, undivided attention. Being there for this type of person is critical, but really being there – with the TV off, fork and knife down, and all chores and tasks on standby – makes your significant other feel truly special and loved."
  },
  G: {
    title: "Receiving Gifts",
    description: "Don't mistake this love language for materialism; the receiver of gifts thrives on the love, thoughtfulness, and effort behind the gift. If you speak this language, the perfect gift or gesture shows that you are known, you are cared for, and you are prized above whatever was sacrificed to bring the gift to you."
  },
  S: {
    title: "Acts of Service",
    description: "Can vacuuming the floors really be an expression of love? Absolutely! Anything you do to ease the burden of responsibilities weighing on an 'Acts of Service' person will speak volumes. The words he or she most want to hear: 'Let me do that for you.' Laziness, broken commitments, and making more work for them tell speakers of this language their feelings don't matter."
  },
  P: {
    title: "Physical Touch",
    description: "This language isn't all about the bedroom. A person whose primary language is Physical Touch is, not surprisingly, very touchy. Hugs, pats on the back, holding hands, and thoughtful touches on the arm, shoulder, or face – they can all be ways to show excitement, concern, care, and love. Physical presence and accessibility are crucial."
  }
};
