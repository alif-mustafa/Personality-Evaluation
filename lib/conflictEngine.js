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
// COUPLE CONFLICT STYLE SCORING  (Gottman framework)
// ════════════════════════════════════════════════════════════════
//
// Conflict style is a COUPLE-LEVEL descriptor, not an individual trait.
// There is ONE style per couple. The score reflects the severity of
// the couple's shared dynamic — NOT a "clash" between two styles.
//
// Stable styles (Validating, Volatile, Conflict-Avoiding) get lower
// scores because they maintain a healthy positive-to-negative ratio.
// Unstable styles (Hostile, Hostile-Detached) get high scores because
// their interaction loop is eroding the relationship.

const COUPLE_STYLE_SCORES = {
  'Validating':        5,
  'Volatile':         25,
  'Conflict-Avoiding': 30,
  'Hostile':          85,
  'Hostile-Detached': 100,
};

function scoreConflictStyleFromCoupleStyle(coupleStyle) {
  const style = coupleStyle || 'Validating';
  const score = COUPLE_STYLE_SCORES[style] ?? 35;

  return {
    score,
    severity: severityLabel(score),
    coupleStyle: style,
    stability: ['Hostile', 'Hostile-Detached'].includes(style) ? 'unstable' : 'stable',
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
  'Validating':       'calm, collaborative couple dynamic',
  'Volatile':         'passionate, expressive couple dynamic',
  'Conflict-Avoiding': 'peace-keeping, agree-to-disagree couple dynamic',
  'Hostile':          'defensive, combative couple dynamic',
  'Hostile-Detached': 'pursue-and-withdraw couple dynamic',
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
  const style = clash.coupleStyle;

  if (style === 'Hostile-Detached') {
    return (
      'Your couple\'s conflict pattern has become a pursue-and-withdraw loop. One of you ' +
      'tends to press the issue intensely while the other shuts down completely. The pursuit ' +
      'triggers the withdrawal, and the withdrawal triggers more pursuit — Gottman calls this ' +
      'the most erosive pattern in relationships. Neither of you is being unreasonable; your ' +
      'nervous systems are just responding in opposite but mutually reinforcing ways.'
    );
  }

  if (style === 'Hostile') {
    return (
      'Your couple\'s conflict pattern has become defensive and combative on both sides. ' +
      'Criticism, contempt, and blame can flow in both directions, and arguments tend to feel ' +
      'like battles rather than conversations. The issues cycle without reaching genuine ' +
      'resolution, and the ratio of warmth to conflict has tipped in the wrong direction.'
    );
  }

  if (style === 'Volatile') {
    return (
      'As a couple, you bring real passion to disagreements — you both speak your minds, ' +
      'feelings run high, and arguments can get heated. Gottman\'s research actually shows ' +
      'that Volatile couples can thrive when the ratio of warmth to conflict stays positive. ' +
      'The key for you is making sure the repair after the storm is just as expressive as ' +
      'the storm itself.'
    );
  }

  if (style === 'Conflict-Avoiding') {
    return (
      'As a couple, you both prefer peace over confrontation, which keeps the day-to-day ' +
      'atmosphere calm and comfortable. The risk is that neither of you tends to raise issues ' +
      'until they\'ve built up pressure. Finding a gentle, low-stakes way to check in ' +
      'regularly can protect the relationship from slow-burn resentment.'
    );
  }

  // Validating
  return (
    'As a couple, your conflict dynamic is calm, collaborative, and grounded in mutual respect. ' +
    'You approach disagreements as conversations rather than battles, and you both prioritise ' +
    'understanding each other\'s perspective. This is one of the healthiest patterns Gottman ' +
    'has identified.'
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
          'Your couple\'s conflict dynamic reinforces this further — the way you interact during ' +
          'disagreements has become a pattern that makes resolution feel elusive.'
        );
      }
      if (entry.score >= 40) {
        return (
          'Your couple\'s conflict pattern adds friction — even when the topic is small, ' +
          'the process of talking it through can feel frustrating.'
        );
      }
      return (
        'Your couple\'s conflict dynamic is healthy enough that disagreements are unlikely to ' +
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
        'Your couple\'s conflict dynamic is one of your biggest strengths. When disagreements ' +
        'come up, you approach them in a way that keeps the door open for resolution. Many ' +
        'couples struggle most with how they fight, not what they fight about, and you have ' +
        'a genuinely healthy foundation here.'
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
 * @param {Object} partnerA.attachment    - { anxietyScore, avoidanceScore }
 * @param {Object} partnerB - Same shape as partnerA
 * @param {Object} [options] - Optional settings
 * @param {string} [options.coupleConflictStyle] - Pre-computed couple conflict style
 *
 * @returns {{ score, label, clashes, narrative }}
 */
export function generateConflictReport(partnerA, partnerB, options = {}) {
  // 1. Score each dimension
  const attachmentClash = scoreAttachmentClash(partnerA, partnerB);
  const bigFiveClash = scoreBigFiveClash(partnerA, partnerB);
  const conflictStyleResult = scoreConflictStyleFromCoupleStyle(options.coupleConflictStyle);
  const loveLanguageClash = scoreLoveLanguageClash(partnerA, partnerB);

  const clashes = {
    attachment: attachmentClash,
    bigFive: bigFiveClash,
    conflictStyle: conflictStyleResult,
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
