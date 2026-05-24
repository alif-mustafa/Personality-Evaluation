/**
 * AptaDuo Conflict Engine
 *
 * Takes both partners' completed assessment scores, analyses their
 * personality differences across all 4 assessments, and generates
 * one unified conflict report with a warm, human narrative.
 *
 * No external libraries. No API calls. No hardcoded scenarios.
 * Handles any combination of scores dynamically.
 *
 * @module conflictEngine
 */

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════

const ATTACHMENT_THRESHOLD = 4.5;

const ASSESSMENT_WEIGHTS = {
  attachment: 0.35,
  bigFive: 0.30,
  conflictStyle: 0.25,
  loveLanguage: 0.10,
};

const BIG_FIVE_TRAIT_WEIGHTS = {
  neuroticism: 0.30,
  agreeableness: 0.25,
  conscientiousness: 0.20,
  extraversion: 0.15,
  openness: 0.10,
};

// ════════════════════════════════════════════════════════════════
// ATTACHMENT STYLE HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Derive an attachment style label from raw anxiety / avoidance scores.
 *   high anxiety  + high avoidance → disorganised
 *   high anxiety  + low avoidance  → anxious
 *   low anxiety   + high avoidance → avoidant
 *   low anxiety   + low avoidance  → secure
 */
function deriveAttachmentStyle(anxietyScore, avoidanceScore) {
  const highAnxiety = anxietyScore >= ATTACHMENT_THRESHOLD;
  const highAvoidance = avoidanceScore >= ATTACHMENT_THRESHOLD;

  if (highAnxiety && highAvoidance) return 'disorganised';
  if (highAnxiety && !highAvoidance) return 'anxious';
  if (!highAnxiety && highAvoidance) return 'avoidant';
  return 'secure';
}

// ════════════════════════════════════════════════════════════════
// ATTACHMENT CLASH
// ════════════════════════════════════════════════════════════════

/**
 * Lookup table for attachment pair clash scores.
 * Keys are alphabetically-sorted pairs so we only store each combo once.
 */
const ATTACHMENT_CLASH_TABLE = {
  'anxious|avoidant': 100,
  'anxious|disorganised': 85,
  'avoidant|disorganised': 85,
  'disorganised|disorganised': 85,
  'disorganised|secure': 85,
  'anxious|anxious': 65,
  'avoidant|avoidant': 55,
  'anxious|secure': 35,
  'avoidant|secure': 30,
  'secure|secure': 5,
};

function lookupAttachmentClash(styleA, styleB) {
  // Handle the "disorganised + any" rule: if either is disorganised
  // and the pair isn't already in the table, return 85.
  const pair = [styleA, styleB].sort().join('|');
  if (pair in ATTACHMENT_CLASH_TABLE) {
    return ATTACHMENT_CLASH_TABLE[pair];
  }
  // Fallback for any pair involving disorganised not explicitly listed
  if (styleA === 'disorganised' || styleB === 'disorganised') return 85;
  // Shouldn't reach here with valid styles, but be safe
  return 50;
}

function scoreAttachmentClash(partnerA, partnerB) {
  const styleA = deriveAttachmentStyle(
    partnerA.attachment.anxietyScore,
    partnerA.attachment.avoidanceScore,
  );
  const styleB = deriveAttachmentStyle(
    partnerB.attachment.anxietyScore,
    partnerB.attachment.avoidanceScore,
  );

  const score = lookupAttachmentClash(styleA, styleB);

  return {
    score,
    severity: severityLabel(score),
    styleA,
    styleB,
  };
}

// ════════════════════════════════════════════════════════════════
// BIG FIVE CLASH
// ════════════════════════════════════════════════════════════════

function diffToClash(diff) {
  if (diff >= 2.0) return 100;
  if (diff >= 1.5) return 70;
  if (diff >= 1.0) return 40;
  return 15;
}

function scoreBigFiveClash(partnerA, partnerB) {
  const traits = Object.keys(BIG_FIVE_TRAIT_WEIGHTS);
  let weightedSum = 0;
  let worstTrait = null;
  let worstTraitClash = -1;

  for (const trait of traits) {
    const diff = Math.abs(partnerA.bigFive[trait] - partnerB.bigFive[trait]);
    const clash = diffToClash(diff);
    const weight = BIG_FIVE_TRAIT_WEIGHTS[trait];
    weightedSum += clash * weight;

    if (clash > worstTraitClash) {
      worstTraitClash = clash;
      worstTrait = trait;
    }
  }

  const score = Math.round(weightedSum);

  return {
    score,
    severity: severityLabel(score),
    primaryTrait: worstTrait,
  };
}

// ════════════════════════════════════════════════════════════════
// CONFLICT STYLE CLASH  (Gottman framework)
// ════════════════════════════════════════════════════════════════
//
// Gottman styles and their clash logic:
//   Validating      – calm, collaborative, compromise-seeking
//   Volatile        – passionate, expressive, intense but repairs fast
//   Conflict-Avoiding – minimises issues, steps back from tension
//   Hostile         – critical, contemptuous, win/lose framing
//   Hostile-Detached – combines attack with stonewalling / withdrawal
//
// Clash severity rationale:
//   Hostile-Detached + Hostile          = 100  attack + stonewall → Four Horsemen trap
//   Hostile-Detached + Hostile-Detached = 90   mutual attack-withdraw cycle
//   Hostile + Hostile                   = 85   high contempt/criticism on both sides
//   Hostile-Detached + Volatile         = 80   one attacks+withdraws, other escalates
//   Hostile + Conflict-Avoiding         = 75   one attacks, other shuts down silently
//   Hostile-Detached + Conflict-Avoiding= 65   mutual withdrawal, different flavours
//   Hostile + Volatile                  = 60   Hostile contempt meets raw passion
//   Hostile + Validating                = 50   contempt vs empathy — exhausting for Validator
//   Volatile + Conflict-Avoiding        = 45   passion vs peace-keeping mismatch
//   Hostile-Detached + Validating       = 40   validator worn down by stonewall pattern
//   Volatile + Volatile                 = 25   high energy but shared repair instinct
//   Validating + Conflict-Avoiding      = 20   minor mismatch, both prefer low heat
//   Volatile + Validating               = 15   workable — both value engagement
//   Validating + Validating             = 5    well-matched, collaborative baseline
//   Conflict-Avoiding + Conflict-Avoiding = 30 issues go unaddressed over time

const CONFLICT_STYLE_TABLE = {
  'Hostile|Hostile-Detached':           100,
  'Hostile-Detached|Hostile-Detached':   90,
  'Hostile|Hostile':                     85,
  'Hostile-Detached|Volatile':           80,
  'Conflict-Avoiding|Hostile':           75,
  'Conflict-Avoiding|Hostile-Detached':  65,
  'Hostile|Volatile':                    60,
  'Hostile|Validating':                  50,
  'Conflict-Avoiding|Volatile':          45,
  'Hostile-Detached|Validating':         40,
  'Conflict-Avoiding|Conflict-Avoiding': 30,
  'Volatile|Volatile':                   25,
  'Conflict-Avoiding|Validating':        20,
  'Validating|Volatile':                 15,
  'Validating|Validating':                5,
};

function scoreConflictStyleClash(partnerA, partnerB) {
  const styleA = partnerA.conflictStyle.dominantStyle;
  const styleB = partnerB.conflictStyle.dominantStyle;
  const pair = [styleA, styleB].sort().join('|');

  const score = pair in CONFLICT_STYLE_TABLE
    ? CONFLICT_STYLE_TABLE[pair]
    : 35; // safe fallback for any unlisted combination

  return {
    score,
    severity: severityLabel(score),
    styleA,
    styleB,
  };
}

// ════════════════════════════════════════════════════════════════
// LOVE LANGUAGE CLASH
// ════════════════════════════════════════════════════════════════

function scoreLoveLanguageClash(partnerA, partnerB) {
  const a = partnerA.loveLanguage;
  const b = partnerB.loveLanguage;

  let score;

  if (a.primary === b.primary) {
    // Both primaries match
    score = 5;
  } else if (a.primary === b.secondary || b.primary === a.secondary) {
    // One partner's primary matches the other's secondary
    score = 25;
  } else {
    // No match at all
    score = 70;
  }

  return {
    score,
    severity: severityLabel(score),
    langA: a.primary,
    langB: b.primary,
  };
}

// ════════════════════════════════════════════════════════════════
// SEVERITY & TOTAL SCORE HELPERS
// ════════════════════════════════════════════════════════════════

function severityLabel(score) {
  if (score >= 70) return 'High';
  if (score >= 45) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Minimal';
}

function computeTotalScore(clashes) {
  const raw =
    clashes.attachment.score * ASSESSMENT_WEIGHTS.attachment +
    clashes.bigFive.score * ASSESSMENT_WEIGHTS.bigFive +
    clashes.conflictStyle.score * ASSESSMENT_WEIGHTS.conflictStyle +
    clashes.loveLanguage.score * ASSESSMENT_WEIGHTS.loveLanguage;

  return Math.round(raw);
}

// ════════════════════════════════════════════════════════════════
// NARRATIVE GENERATION
// ════════════════════════════════════════════════════════════════

// — Friendly display names —

const ATTACHMENT_DISPLAY = {
  secure: 'secure',
  anxious: 'anxious',
  avoidant: 'avoidant',
  disorganised: 'disorganised',
};

const BIG_FIVE_DISPLAY = {
  neuroticism: 'emotional sensitivity',
  agreeableness: 'how you each handle disagreement',
  conscientiousness: 'structure and organisation',
  extraversion: 'social energy',
  openness: 'openness to new experiences',
};

const CONFLICT_STYLE_DISPLAY = {
  'Validating':       'calm and collaborative approach',
  'Volatile':         'passionate and expressive approach',
  'Conflict-Avoiding': 'peace-keeping, step-back approach',
  'Hostile':          'defensive and win-or-lose approach',
  'Hostile-Detached': 'attack-then-withdraw approach',
};

const LOVE_LANGUAGE_DISPLAY = {
  words: 'Words of Affirmation',
  acts: 'Acts of Service',
  gifts: 'Receiving Gifts',
  time: 'Quality Time',
  touch: 'Physical Touch',
};

// — Weighted clash entries sorted for narrative priority —

function rankedClashes(clashes) {
  const entries = [
    { key: 'attachment', weight: ASSESSMENT_WEIGHTS.attachment, ...clashes.attachment },
    { key: 'bigFive', weight: ASSESSMENT_WEIGHTS.bigFive, ...clashes.bigFive },
    { key: 'conflictStyle', weight: ASSESSMENT_WEIGHTS.conflictStyle, ...clashes.conflictStyle },
    { key: 'loveLanguage', weight: ASSESSMENT_WEIGHTS.loveLanguage, ...clashes.loveLanguage },
  ];

  // Sort by weighted contribution (score × weight), descending
  entries.sort((a, b) => b.score * b.weight - a.score * a.weight);
  return entries;
}

// — Section 1: WHAT IS REALLY HAPPENING —

function buildWhatIsHappening(primary) {
  switch (primary.key) {
    case 'attachment':
      return buildAttachmentHeadline(primary);
    case 'bigFive':
      return buildBigFiveHeadline(primary);
    case 'conflictStyle':
      return buildConflictStyleHeadline(primary);
    case 'loveLanguage':
      return buildLoveLanguageHeadline(primary);
    default:
      return '';
  }
}

function buildAttachmentHeadline(clash) {
  const { styleA, styleB } = clash;

  if (
    (styleA === 'anxious' && styleB === 'avoidant') ||
    (styleA === 'avoidant' && styleB === 'anxious')
  ) {
    return (
      'One of you reaches out for closeness when things feel uncertain, while the other ' +
      'needs space to feel safe. This creates a cycle where the more one partner pursues ' +
      'connection, the more the other pulls back — not because they don\'t care, but because ' +
      'closeness feels overwhelming in a different way.'
    );
  }

  if (styleA === 'disorganised' || styleB === 'disorganised') {
    return (
      'One of you carries a deep tension between wanting closeness and fearing it at the same ' +
      'time. This means that on some days togetherness feels wonderful, and on other days it ' +
      'feels like too much. It isn\'t about mixed signals — it\'s about two very real needs ' +
      'pulling in opposite directions inside the same heart.'
    );
  }

  if (styleA === 'anxious' && styleB === 'anxious') {
    return (
      'Both of you crave reassurance and closeness deeply, which is a beautiful thing — but ' +
      'it can also mean that when one of you feels unsure, the other picks up on that worry ' +
      'instantly. The emotional temperature in the relationship can swing quickly because both ' +
      'of you are tuned in so sensitively to each other.'
    );
  }

  if (styleA === 'avoidant' && styleB === 'avoidant') {
    return (
      'Both of you value independence and personal space highly, which can make your ' +
      'relationship feel peaceful on the surface. The challenge is that important feelings ' +
      'sometimes go unexpressed, and distance can quietly grow without either of you realising ' +
      'it until it feels hard to bridge.'
    );
  }

  if (
    (styleA === 'anxious' && styleB === 'secure') ||
    (styleA === 'secure' && styleB === 'anxious')
  ) {
    return (
      'One of you sometimes needs extra reassurance that things are okay between you. The good ' +
      'news is the other partner has a naturally steady, grounding presence. With a little extra ' +
      'patience and intentional communication, this difference can actually become a source of ' +
      'growth rather than tension.'
    );
  }

  if (
    (styleA === 'avoidant' && styleB === 'secure') ||
    (styleA === 'secure' && styleB === 'avoidant')
  ) {
    return (
      'One of you tends to process feelings internally and may need a bit more space during ' +
      'difficult moments. The other is comfortable with closeness and emotional sharing. This ' +
      'isn\'t a wall between you — it\'s simply two different speeds of opening up, and with ' +
      'awareness it can become easier over time.'
    );
  }

  // secure + secure
  return (
    'Both of you bring a strong sense of emotional security to this relationship. You feel ' +
    'comfortable leaning on each other and giving each other space when needed. This is a ' +
    'genuinely solid foundation.'
  );
}

function buildBigFiveHeadline(clash) {
  const trait = clash.primaryTrait;

  const descriptions = {
    neuroticism:
      'You experience and process stress in very different ways. One of you feels emotions ' +
      'intensely and may need to talk things through, while the other stays calmer under ' +
      'pressure and might not realise how much the other is carrying. This gap can make one ' +
      'partner feel unheard and the other feel overwhelmed.',

    agreeableness:
      'One of you naturally leans toward keeping the peace, while the other is more ' +
      'comfortable standing firm. When decisions need to be made or boundaries need to be ' +
      'drawn, this difference can feel like one person is always giving in and the other is ' +
      'always pushing forward.',

    conscientiousness:
      'You have very different relationships with structure and planning. One of you feels ' +
      'most at ease when things are organised and predictable, while the other thrives with ' +
      'more flexibility and spontaneity. This can lead to everyday friction around routines, ' +
      'responsibilities, and expectations.',

    extraversion:
      'Your social batteries are wired differently. One of you recharges through time with ' +
      'people and shared activities, while the other needs quiet time to restore energy. ' +
      'Neither approach is wrong — but without awareness, it can feel like one partner is ' +
      'too demanding and the other too distant.',

    openness:
      'You see the world through different lenses. One of you is drawn to new ideas, change, ' +
      'and exploration, while the other finds comfort and meaning in the familiar. This is a ' +
      'difference in how you relate to life itself, and it shows up in choices big and small.',
  };

  return descriptions[trait] || '';
}

function buildConflictStyleHeadline(clash) {
  const { styleA, styleB } = clash;
  const pair = [styleA, styleB].sort().join('|');

  // Hostile-Detached involved — the most severe pattern
  if (pair === 'Hostile|Hostile-Detached') {
    return (
      'One of you can slide into criticism or contempt during a fight, and the other responds ' +
      'by shutting down entirely — a combination Gottman calls the most erosive pattern in ' +
      'relationships. The attack triggers the withdrawal, and the withdrawal triggers more ' +
      'frustration. Neither of you is being unreasonable; your nervous systems are just ' +
      'responding in opposite but mutually reinforcing ways.'
    );
  }

  if (pair === 'Hostile-Detached|Hostile-Detached') {
    return (
      'Both of you can cycle between intense conflict and complete emotional shutdown. ' +
      'Arguments may start hot, then go cold — not because the issue is resolved, but ' +
      'because it feels too overwhelming to stay in. This pattern leaves both partners ' +
      'feeling unseen and exhausted, and the issues quietly accumulate.'
    );
  }

  if (pair === 'Hostile|Hostile') {
    return (
      'Both of you bring a lot of fire to disagreements. Criticism can fly in both ' +
      'directions, and arguments can feel like battles rather than conversations. The good ' +
      'news is there is no avoidance — both of you are engaged. The challenge is learning ' +
      'to fight about the issue rather than each other\'s character.'
    );
  }

  if (pair === 'Conflict-Avoiding|Hostile' || pair === 'Hostile|Conflict-Avoiding') {
    return (
      'One of you responds to tension with directness that can tip into criticism, while the ' +
      'other tends to go quiet and step away. The partner who pushes can feel like nothing ' +
      'ever gets resolved, while the partner who retreats feels they need distance to stay ' +
      'safe. These are deeply human responses — just pulling in opposite directions.'
    );
  }

  if (pair === 'Conflict-Avoiding|Volatile' || pair === 'Volatile|Conflict-Avoiding') {
    return (
      'One of you processes conflict with a lot of emotional energy and expression, while the ' +
      'other prefers to let things settle quietly rather than engage. This can feel like one ' +
      'partner is always turning the volume up while the other is turning it off — leaving ' +
      'both feeling misunderstood about what a healthy conversation looks like.'
    );
  }

  if (pair === 'Hostile|Validating' || pair === 'Validating|Hostile') {
    return (
      'One of you brings care and empathy to disagreements, genuinely trying to hear the ' +
      'other out. But when the other partner\'s conflict style leans toward criticism or ' +
      'defensiveness, that generosity can slowly wear thin. Over time, the validating ' +
      'partner may start to feel more like a therapist than an equal.'
    );
  }

  if (pair === 'Volatile|Volatile') {
    return (
      'Both of you bring real passion to disagreements — you speak your minds, feelings run ' +
      'high, and arguments can get heated. Gottman\'s research actually shows that Volatile ' +
      'pairs can thrive when the ratio of warmth to conflict stays positive. The key for ' +
      'you is making sure the repair after the storm is just as expressive as the storm itself.'
    );
  }

  if (pair === 'Conflict-Avoiding|Conflict-Avoiding') {
    return (
      'Both of you prefer peace over confrontation, which keeps the day-to-day atmosphere ' +
      'calm and comfortable. The risk is that neither of you tends to raise issues until ' +
      'they\'ve built up pressure. Finding a gentle, low-stakes way to check in regularly ' +
      'can protect the relationship from slow-burn resentment.'
    );
  }

  // Well-matched or low-clash combos
  return (
    'Your conflict styles are reasonably well-matched. You approach disagreements in ' +
    'compatible ways, which means even difficult conversations have a decent foundation ' +
    'to work from.'
  );
}

function buildLoveLanguageHeadline(clash) {
  const { langA, langB, score } = clash;

  if (score <= 5) {
    return (
      `You both feel most loved through ${LOVE_LANGUAGE_DISPLAY[langA]}, which means the ` +
      'gestures that matter most to one of you are already the ones the other is naturally ' +
      'inclined to give. This is a real gift in a relationship.'
    );
  }

  if (score <= 25) {
    return (
      `One of you feels most loved through ${LOVE_LANGUAGE_DISPLAY[langA]} and the other ` +
      `through ${LOVE_LANGUAGE_DISPLAY[langB]}, but there is meaningful overlap in your ` +
      'secondary preferences. You already have a bridge — it just needs a little more ' +
      'intentional traffic.'
    );
  }

  return (
    `One of you feels most loved through ${LOVE_LANGUAGE_DISPLAY[langA]} while the other ` +
    `lights up with ${LOVE_LANGUAGE_DISPLAY[langB]}. This means you may sometimes be ` +
    'showing love in the way that feels natural to you rather than in the way your partner ' +
    'receives it best. The love is there — it just needs a bit of translation.'
  );
}

// — Section 2: WHY IT KEEPS HAPPENING —

function buildWhyItKeepsHappening(ranked, totalScore) {
  // Only include if total score >= 30
  if (totalScore < 30) return null;

  const secondary = ranked[1];
  const tertiary = ranked[2];

  if (!secondary) return null;

  const parts = [];

  parts.push(amplifierSentence(secondary));

  if (tertiary && tertiary.score >= 25) {
    parts.push(amplifierSentence(tertiary));
  }

  return parts.filter(Boolean).join(' ');
}

function amplifierSentence(entry) {
  switch (entry.key) {
    case 'attachment':
      if (entry.score >= 70) {
        return (
          'Underneath it all, the way you each handle emotional closeness adds fuel to this ' +
          'cycle — one of you reaches in while the other pulls away, keeping the pattern alive.'
        );
      }
      if (entry.score >= 40) {
        return (
          'Your different comfort levels with emotional closeness make it harder to break the ' +
          'pattern, because each of you reads the other\'s behaviour through a different emotional lens.'
        );
      }
      return (
        'Your attachment needs are close enough that this factor adds only gentle background ' +
        'tension rather than a strong pull.'
      );

    case 'bigFive': {
      const traitName = BIG_FIVE_DISPLAY[entry.primaryTrait] || entry.primaryTrait;
      if (entry.score >= 70) {
        return (
          `Your difference in ${traitName} amplifies things further — it shapes how you ` +
          'each show up day-to-day, making the same situation feel completely different to each of you.'
        );
      }
      if (entry.score >= 40) {
        return (
          `A gap in ${traitName} also plays a role, subtly colouring how you each ` +
          'experience everyday moments together.'
        );
      }
      return (
        `Your personalities are fairly aligned on ${traitName}, so this area adds only ` +
        'a small ripple.'
      );
    }

    case 'conflictStyle':
      if (entry.score >= 70) {
        return (
          'The way you each handle disagreements reinforces this further — your conflict ' +
          'instincts pull you in opposite directions, making resolution feel elusive.'
        );
      }
      if (entry.score >= 40) {
        return (
          'Your different approaches to disagreement mean that even when the topic is small, ' +
          'the process of talking it through can feel frustrating.'
        );
      }
      return (
        'Your approaches to conflict are similar enough that disagreements are unlikely to ' +
        'be a major driver on their own.'
      );

    case 'loveLanguage':
      if (entry.score >= 70) {
        return (
          'On top of this, you show love in different languages — the care you each give may ' +
          'not always land the way it\'s intended, leaving both of you feeling under-appreciated.'
        );
      }
      if (entry.score >= 25) {
        return (
          'A small gap in how you prefer to receive love adds a layer of missed connection, ' +
          'though it\'s the kind of thing that improves quickly with awareness.'
        );
      }
      return '';

    default:
      return '';
  }
}

// — Section 3: WHERE YOUR STRENGTH IS —

function buildWhereYourStrengthIs(clashes) {
  // Find the assessment with the lowest clash score
  const entries = [
    { key: 'attachment', score: clashes.attachment.score },
    { key: 'bigFive', score: clashes.bigFive.score },
    { key: 'conflictStyle', score: clashes.conflictStyle.score },
    { key: 'loveLanguage', score: clashes.loveLanguage.score },
  ];

  entries.sort((a, b) => a.score - b.score);
  const strongest = entries[0];

  // If even the "best" area is still quite high, use the default
  if (strongest.score >= 60) {
    return (
      'You are here, looking for understanding rather than blame — that willingness is ' +
      'where every good relationship begins.'
    );
  }

  switch (strongest.key) {
    case 'attachment':
      return (
        'Where you truly shine is in the emotional foundation of your relationship. ' +
        'You share a similar sense of what closeness and security look like, and that is ' +
        'one of the hardest things to build from scratch. It means that even when surface-level ' +
        'disagreements arise, the bedrock underneath is solid.'
      );

    case 'bigFive':
      return (
        'Your personalities are actually well-matched in the areas that matter most for ' +
        'daily life together. You process the world in compatible ways, and that shared rhythm ' +
        'gives you a natural ease that many couples have to work much harder to find.'
      );

    case 'conflictStyle':
      return (
        'When disagreements do come up, you both approach them in a way that keeps the door ' +
        'open for resolution. This is a real strength — many couples struggle most with how ' +
        'they fight, not what they fight about, and you have a healthy foundation here.'
      );

    case 'loveLanguage':
      return (
        'The way you give and receive love is naturally in sync. You already speak each other\'s ' +
        'emotional language, which means the everyday gestures of care and affection between ' +
        'you are likely to land just right. That kind of alignment is a quiet but powerful glue.'
      );

    default:
      return (
        'You are here, looking for understanding rather than blame — that willingness is ' +
        'where every good relationship begins.'
      );
  }
}

// ════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════

/**
 * Generate a unified conflict report for a couple.
 *
 * @param {Object} partnerA - All four assessment results for partner A
 * @param {Object} partnerA.loveLanguage  - { primary, secondary }
 * @param {Object} partnerA.bigFive       - { openness, conscientiousness, extraversion, agreeableness, neuroticism }
 * @param {Object} partnerA.conflictStyle - { dominantStyle }
 * @param {Object} partnerA.attachment    - { anxietyScore, avoidanceScore }
 * @param {Object} partnerB - Same shape as partnerA
 *
 * @returns {{ score, label, clashes, narrative }}
 */
export function generateConflictReport(partnerA, partnerB) {
  // 1. Score each dimension
  const attachmentClash = scoreAttachmentClash(partnerA, partnerB);
  const bigFiveClash = scoreBigFiveClash(partnerA, partnerB);
  const conflictStyleClash = scoreConflictStyleClash(partnerA, partnerB);
  const loveLanguageClash = scoreLoveLanguageClash(partnerA, partnerB);

  const clashes = {
    attachment: attachmentClash,
    bigFive: bigFiveClash,
    conflictStyle: conflictStyleClash,
    loveLanguage: loveLanguageClash,
  };

  // 2. Compute total score
  const score = computeTotalScore(clashes);
  const label = severityLabel(score);

  // 3. Build narrative
  const ranked = rankedClashes(clashes);
  const primary = ranked[0];

  const narrative = {
    whatIsHappening: buildWhatIsHappening(primary),
    whyItKeepsHappening: buildWhyItKeepsHappening(ranked, score),
    whereYourStrengthIs: buildWhereYourStrengthIs(clashes),
  };

  return { score, label, clashes, narrative };
}
