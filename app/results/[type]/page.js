"use client";

import { use, useState } from "react";
import { useApp } from "@/lib/context";
import { useAuth } from "@/lib/auth-context";
import { getAssessment } from "@/lib/assessments";
import Link from "next/link";

// ────────────────────────────────────────────
// Assessment-specific color palettes for bars
// ────────────────────────────────────────────
const ASSESSMENT_COLORS = {
  bigfive: {
    Openness: "#8b5cf6",
    Conscientiousness: "#3b7bfc",
    Extraversion: "#f59e0b",
    Agreeableness: "#3a8c69",
    Neuroticism: "#f43f5e",
  },
  attachment: {
    Anxiety: "#f97316",
    Avoidance: "#6366f1",
  },
  lovelanguages: {
    A: "#3a8c69",
    T: "#f59e0b",
    G: "#8b5cf6",
    S: "#ec4899",
    P: "#f43f5e",
  },
  gottman: {
    Validating: "#3b7bfc",
    Volatile: "#f59e0b",
    "Conflict-Avoiding": "#3a8c69",
    Hostile: "#f43f5e",
    "Hostile-Detached": "#6b7280",
  },
};

// ────────────────────────────────────────────
// Love language full names (single-letter keys → labels)
// ────────────────────────────────────────────
const LOVE_LANGUAGE_NAMES = {
  A: "Words of Affirmation",
  T: "Quality Time",
  G: "Receiving Gifts",
  S: "Acts of Service",
  P: "Physical Touch",
};

// ────────────────────────────────────────────
// Assessment-specific hero illustrations
// Maps each result key to an illustration path
// ────────────────────────────────────────────
const HERO_ILLUSTRATIONS = {
  bigfive: {
    Openness: "/illustrations/bigfive_openness.png",
    Conscientiousness: "/illustrations/bigfive_conscientiousness.png",
    Extraversion: "/illustrations/bigfive_extraversion.png",
    Agreeableness: "/illustrations/bigfive_agreeableness.png",
    Neuroticism: "/illustrations/bigfive_neuroticism.png",
  },
  attachment: {
    Secure: "/illustrations/attachment_secure.png",
    Anxious: "/illustrations/attachment_anxious.png",
    Avoidant: "/illustrations/attachment_avoidant.png",
    "Fearful-Avoidant": "/illustrations/attachment_fearful.png",
  },
  lovelanguages: {
    "Words of Affirmation": "/illustrations/love_affirmation.png",
    "Quality Time": "/illustrations/love_qualitytime.png",
    "Receiving Gifts": "/illustrations/love_gifts.png",
    "Acts of Service": "/illustrations/love_service.png",
    "Physical Touch": "/illustrations/love_touch.png",
  },
  gottman: {
    Validating: "/illustrations/gottman_validating.png",
    Volatile: "/illustrations/gottman_volatile.png",
    "Conflict-Avoiding": "/illustrations/gottman_avoiding.png",
    Hostile: "/illustrations/gottman_hostile.png",
    "Hostile-Detached": "/illustrations/gottman_hostile_detached.png",
  },
};

// ────────────────────────────────────────────
// Assessment-specific warm gradient backgrounds
// ────────────────────────────────────────────
const HERO_GRADIENTS = {
  bigfive: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 40%, #dbeafe 100%)",
  attachment: "linear-gradient(135deg, #fef3c7 0%, #fce7f3 40%, #fae8ff 100%)",
  lovelanguages: "linear-gradient(135deg, #fce7f3 0%, #fff1f2 40%, #fef2f2 100%)",
  gottman: "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 40%, #ede9fe 100%)",
};

// ────────────────────────────────────────────
// Get the user's first name from auth context
// ────────────────────────────────────────────
function getFirstName(user, profile) {
  const displayName =
    profile?.displayName ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Friend";
  return displayName.split(" ")[0];
}

// ────────────────────────────────────────────
// Build assessment-specific hero content
// ────────────────────────────────────────────
function getHeroContent(type, result, firstName) {
  switch (type) {
    case "bigfive": {
      // Find the highest-scoring trait
      const entries = Object.entries(result.feedback);
      const highest = entries.reduce((best, [trait, fb]) =>
        fb.score > (best[1]?.score || 0) ? [trait, fb] : best
      , ["", {}]);
      return {
        title: `${firstName}, you are ${highest[1]?.title || "Uniquely You"}`,
        description: highest[1]?.body || "Your personality is a unique blend of traits that shape how you connect with the world.",
        badge: highest[0],
      };
    }
    case "attachment": {
      const styleNames = {
        Secure: "Securely Attached",
        Anxious: "an Anxious-Preoccupied Partner",
        Avoidant: "a Dismissive-Avoidant Partner",
        "Fearful-Avoidant": "a Fearful-Avoidant Partner",
      };
      return {
        title: `${firstName}, you are ${styleNames[result.style] || result.style}`,
        description: result.feedback?.description || "Your attachment style shapes how you connect in intimate relationships.",
        badge: result.style,
      };
    }
    case "lovelanguages": {
      const primaryLang = result.feedback?.primary || "Love";
      const langTitles = {
        "Words of Affirmation": "a Words of Affirmation Person",
        "Quality Time": "a Quality Time Keeper",
        "Receiving Gifts": "a Thoughtful Gift Lover",
        "Acts of Service": "an Acts of Service Champion",
        "Physical Touch": "a Physical Touch Person",
      };
      return {
        title: `${firstName}, you are ${langTitles[primaryLang] || `a ${primaryLang} Person`}`,
        description: result.feedback?.description || "Your love language reveals how you most deeply experience and express affection.",
        badge: primaryLang,
      };
    }
    case "gottman": {
      if (result.feedback?.partial) {
        return {
          title: `${firstName}, your responses are recorded`,
          description: result.feedback.description,
          badge: "Awaiting Partner",
        };
      }
      const style = result.feedback?.title || result.style || "Your Style";
      return {
        title: `${firstName}, your conflict style is ${style}`,
        description: result.feedback?.description || "Your conflict style describes how you and your partner navigate disagreements.",
        badge: style,
      };
    }
    default:
      return {
        title: `${firstName}, here are your results`,
        description: "Your personalized assessment results are ready.",
        badge: "Results",
      };
  }
}

// ────────────────────────────────────────────
// Build Superpower & Blindspot insights
// ────────────────────────────────────────────
function getInsights(type, result) {
  switch (type) {
    case "bigfive": {
      const entries = Object.entries(result.feedback);
      const highest = entries.reduce((best, [, fb]) =>
        fb.score > (best[1]?.score || 0) ? [fb.title, fb] : best
      , ["", {}]);
      const lowest = entries.reduce((worst, [, fb]) =>
        fb.score < (worst[1]?.score ?? 101) ? [fb.title, fb] : worst
      , ["", { score: 101 }]);
      return {
        superpower: {
          label: highest[1]?.title || "Your Strength",
          text: highest[1]?.body || "You have a strong, defining personality trait that shapes how you engage with the world.",
        },
        blindspot: {
          label: lowest[1]?.title || "Growth Area",
          text: lowest[1]?.tip || "Every strength has a shadow. Be mindful of how this trait shows up under stress.",
        },
      };
    }
    case "attachment": {
      const insights = {
        Secure: {
          superpower: { label: "Emotional Safety", text: "You create a safe haven for your partner. Your comfort with intimacy and independence makes you a steady, reliable presence in relationships." },
          blindspot: { label: "Over-Accommodation", text: "Be mindful that your natural comfort with relationships doesn't lead you to overlook red flags or accommodate unhealthy dynamics out of a desire to keep the peace." },
        },
        Anxious: {
          superpower: { label: "Deep Emotional Attunement", text: "You are incredibly perceptive to the emotional currents in your relationships. Your sensitivity is a gift — you notice things others miss." },
          blindspot: { label: "Reassurance Seeking", text: "Your need for closeness can sometimes be read by a partner as pressure. Practice self-soothing techniques and communicate your needs with words, not tests." },
        },
        Avoidant: {
          superpower: { label: "Self-Reliance", text: "You are grounded in your own identity and don't lose yourself in relationships. Your independence is a strength that many admire." },
          blindspot: { label: "Emotional Distance", text: "Be mindful that your partner's need for closeness isn't a threat to your autonomy. Small gestures of vulnerability can strengthen your bond without compromising your independence." },
        },
        "Fearful-Avoidant": {
          superpower: { label: "Emotional Depth", text: "You have an extraordinary capacity for emotional depth. Your awareness of both the desire for and fear of intimacy gives you a nuanced understanding of human connection." },
          blindspot: { label: "Push-Pull Patterns", text: "Notice when you're alternating between seeking closeness and pulling away. Naming this pattern out loud — 'I want to be close but I'm scared' — can transform the dynamic." },
        },
      };
      return insights[result.style] || insights.Secure;
    }
    case "lovelanguages": {
      const primary = result.feedback?.primary;
      const insights = {
        "Words of Affirmation": {
          superpower: { label: "Verbal Encouragement", text: "Because you value words so deeply, you excel at making others feel seen and appreciated through heartfelt compliments, love notes, and genuine verbal praise." },
          blindspot: { label: "Criticism Sensitivity", text: "Be mindful that a partner's blunt communication style isn't always criticism. Their silence or lack of verbal praise doesn't mean they don't care — they may simply express love differently." },
        },
        "Quality Time": {
          superpower: { label: "Presence & Connection", text: "Because you are highly sensitive to Presence (the core of Quality Time), you excel at creating deep, focused moments of connection." },
          blindspot: { label: "Distraction Sensitivity", text: "Be mindful that a partner's simple need for space can inadvertently feel like a disconnection to you. Your 'Quality Time' radar is always on." },
        },
        "Receiving Gifts": {
          superpower: { label: "Symbolic Thinking", text: "You understand the deep symbolism behind thoughtful gestures. A small, well-chosen gift says 'I was thinking about you' in a way that fills your emotional tank." },
          blindspot: { label: "Unmet Expectations", text: "Be mindful that not everyone naturally thinks in terms of gifts and symbols. Your partner may show love in ways that don't involve tangible tokens — and that's equally valid." },
        },
        "Acts of Service": {
          superpower: { label: "Practical Love", text: "You show love through action, and you deeply appreciate when others do the same. For you, 'Let me handle that' is one of the most loving things someone can say." },
          blindspot: { label: "Burden Tracking", text: "Be mindful of keeping an internal scorecard of who does what. Your partner may not notice the same tasks you do — communicating specific needs works better than expecting them to just see it." },
        },
        "Physical Touch": {
          superpower: { label: "Physical Reassurance", text: "Your ability to communicate care, safety, and love through touch is deeply powerful. A hug, a hand-hold, or a gentle touch on the arm can say more than a thousand words." },
          blindspot: { label: "Touch Mismatch", text: "Be mindful that your partner may have different comfort levels with physical affection, especially in public. Their hesitation isn't rejection — it's their own boundary." },
        },
      };
      return insights[primary] || insights["Quality Time"];
    }
    case "gottman": {
      if (result.feedback?.partial) {
        return null; // No insights until partner completes
      }
      const style = result.feedback?.title || result.style;
      const strengths = result.feedback?.strengths;
      const patterns = result.feedback?.patterns;
      const tip = result.feedback?.tip;

      if (strengths) {
        return {
          superpower: { label: "Your Strengths Together", text: strengths.join(" ") },
          blindspot: { label: "Growth Edge", text: tip || "Continue nurturing your communication patterns." },
        };
      }
      if (patterns) {
        return {
          superpower: { label: "Awareness is Power", text: `Recognizing your ${style} pattern is the first step toward change. Many couples transform their dynamic with intentional practice.` },
          blindspot: { label: "Patterns to Watch", text: patterns.join(" ") + (tip ? ` ${tip}` : "") },
        };
      }
      return null;
    }
    default:
      return null;
  }
}

// ────────────────────────────────────────────
// Bar Chart Component
// ────────────────────────────────────────────
function ScoreBar({ label, score, color, maxScore = 100, delay = 0 }) {
  const percentage = Math.min(100, Math.round((score / maxScore) * 100));
  return (
    <div
      className="flex items-center gap-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5 w-44 shrink-0">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      <div className="flex-1 relative">
        <div
          className="h-7 rounded-lg overflow-hidden"
          style={{ background: "var(--border-subtle)" }}
        >
          <div
            className="h-full rounded-lg transition-all duration-1000 ease-out relative"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}dd, ${color})`,
              minWidth: percentage > 0 ? "2rem" : "0",
            }}
          >
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-sm"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              {score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Insight Card Component
// ────────────────────────────────────────────
function InsightCard({ icon, title, label, text, accentColor, delay = 0 }) {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-up"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: accentColor }}>
          {title}
        </h4>
      </div>
      <p className="text-sm font-semibold mb-1">{label}</p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {text}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────
// Action Icon Button
// ────────────────────────────────────────────
function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {icon}
    </button>
  );
}

// ────────────────────────────────────────────
// Main Results Page
// ────────────────────────────────────────────
export default function ResultsPage({ params }) {
  const { type } = use(params);
  const { getResults, isLoaded } = useApp();
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
      </div>
    );
  }

  const result = getResults(type);
  const assessment = getAssessment(type);

  if (!result || !assessment) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <span className="text-5xl block mb-4">📋</span>
          <h1 className="text-2xl font-bold mb-2">No Results Yet</h1>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            You haven&apos;t completed this assessment yet.
          </p>
          <Link
            href="/assessments"
            className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
            }}
          >
            Take an Assessment
          </Link>
        </div>
      </div>
    );
  }

  const { meta } = assessment;
  const firstName = getFirstName(user, profile);
  const hero = getHeroContent(type, result, firstName);
  const insights = getInsights(type, result);
  const colors = ASSESSMENT_COLORS[type] || {};

  // Resolve which illustration to show based on result
  const illustrationMap = HERO_ILLUSTRATIONS[type] || {};
  let illustrationKey = hero.badge; // default to the badge (trait/style name)
  if (type === "bigfive") {
    // For Big Five, badge is the highest trait name (e.g., "Agreeableness")
    illustrationKey = hero.badge;
  } else if (type === "attachment") {
    illustrationKey = result.style;
  } else if (type === "lovelanguages") {
    illustrationKey = result.feedback?.primary;
  } else if (type === "gottman") {
    illustrationKey = result.feedback?.title || result.style;
  }
  const heroIllustration = illustrationMap[illustrationKey] || Object.values(illustrationMap)[0];

  // Build score bars data
  const scoreBars = Object.entries(result.scores).map(([key, data]) => ({
    key,
    label:
      type === "lovelanguages"
        ? LOVE_LANGUAGE_NAMES[key] || key
        : key,
    score: data.normalized,
    color: colors[key] || "#7c6af7",
  }));

  // Sort bars by score descending for visual impact
  scoreBars.sort((a, b) => b.score - a.score);

  const handleCopy = () => {
    const text = `My ${meta.shortTitle} Results:\n${hero.title}\n\n${scoreBars.map(b => `${b.label}: ${b.score}`).join("\n")}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 animate-fade-up">
          <Link
            href="/assessments"
            className="text-sm mb-4 inline-flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back to Assessments
          </Link>

          <div className="flex items-start justify-between mt-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{meta.icon}</span>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Your {meta.shortTitle} Results
                </h1>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Completed {new Date(result.completedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <ActionButton
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                }
                label="Share"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `My ${meta.shortTitle} Results`,
                      text: `${hero.title}`,
                    }).catch(() => {});
                  }
                }}
              />
              <ActionButton
                icon={
                  copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )
                }
                label="Copy results"
                onClick={handleCopy}
              />
            </div>
          </div>
        </div>

        {/* ── Hero Card ── */}
        <div
          className="rounded-2xl overflow-hidden mb-8 animate-fade-up"
          style={{
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            animationDelay: "80ms",
          }}
        >
          <div className="flex flex-col sm:flex-row">
            <div
              className="sm:w-56 shrink-0 flex items-center justify-center p-4 relative overflow-hidden"
              style={{ background: HERO_GRADIENTS[type] || HERO_GRADIENTS.bigfive }}
            >
              {/* Couple Illustration */}
              {heroIllustration && (
                <img
                  src={heroIllustration}
                  alt={hero.badge || "Assessment result illustration"}
                  className="w-full h-full object-cover rounded-xl"
                  style={{ maxHeight: "200px", minHeight: "160px" }}
                />
              )}
              {/* Decorative blobs */}
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20"
                style={{ background: colors[Object.keys(colors)[0]] || "#7c6af7" }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15"
                style={{ background: colors[Object.keys(colors)[1]] || "#f97b6b" }}
              />
            </div>

            {/* Hero Text */}
            <div className="flex-1 p-6 sm:p-8" style={{ background: "var(--surface)" }}>
              <h2
                className="text-xl sm:text-2xl font-bold mb-3 leading-snug"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {hero.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {hero.description}
              </p>
              {hero.badge && (
                <span
                  className="inline-block mt-4 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `${colors[Object.keys(colors)[0]] || "#7c6af7"}15`,
                    color: colors[Object.keys(colors)[0]] || "#7c6af7",
                    border: `1px solid ${colors[Object.keys(colors)[0]] || "#7c6af7"}30`,
                  }}
                >
                  {hero.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Score Bars ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-8 animate-fade-up"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            animationDelay: "160ms",
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Score Breakdown
          </h3>
          <div className="space-y-4">
            {scoreBars.map((bar, i) => (
              <ScoreBar
                key={bar.key}
                label={bar.label}
                score={bar.score}
                color={bar.color}
                delay={200 + i * 60}
              />
            ))}
          </div>
        </div>

        {/* ── Superpower & Blindspot ── */}
        {insights && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <InsightCard
              icon="⚡"
              title="Your Superpower"
              label={insights.superpower.label}
              text={insights.superpower.text}
              accentColor="#3a8c69"
              delay={400}
            />
            <InsightCard
              icon="🔍"
              title="Your Blindspot"
              label={insights.blindspot.label}
              text={insights.blindspot.text}
              accentColor="#f59e0b"
              delay={480}
            />
          </div>
        )}

        {/* ── Big Five: Individual Trait Cards ── */}
        {type === "bigfive" && result.feedback && (
          <div className="space-y-4 mb-8">
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-2 animate-fade-up"
              style={{ color: "var(--text-tertiary)", animationDelay: "500ms" }}
            >
              Trait Details
            </h3>
            {Object.entries(result.feedback).map(([trait, fb], i) => (
              <div
                key={trait}
                className="rounded-2xl p-5 animate-fade-up"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  animationDelay: `${540 + i * 70}ms`,
                  borderLeft: `3px solid ${ASSESSMENT_COLORS.bigfive[trait] || "#7c6af7"}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold">{trait}</h4>
                  <span
                    className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `${ASSESSMENT_COLORS.bigfive[trait]}15`,
                      color: ASSESSMENT_COLORS.bigfive[trait],
                    }}
                  >
                    {fb.score}
                  </span>
                </div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: ASSESSMENT_COLORS.bigfive[trait] || "var(--color-primary-400)" }}
                >
                  {fb.title}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {fb.body}
                </p>
                {fb.tip && (
                  <div
                    className="mt-3 p-3 rounded-xl"
                    style={{
                      background: `${ASSESSMENT_COLORS.bigfive[trait]}08`,
                      borderLeft: `2px solid ${ASSESSMENT_COLORS.bigfive[trait]}40`,
                    }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      💡 {fb.tip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Gottman: Invite Partner CTA (when partial) ── */}
        {type === "gottman" && result.feedback?.partial && (
          <div
            className="rounded-2xl p-6 text-center mb-8 animate-fade-up"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              animationDelay: "400ms",
            }}
          >
            <span className="text-4xl block mb-3">🤝</span>
            <h3 className="text-lg font-bold mb-2">What&apos;s Next?</h3>
            <p
              className="text-sm mb-4 max-w-md mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Gottman conflict style describes the dynamic between you and your partner as a couple.
              Invite your partner to complete this assessment to discover your shared style.
            </p>
            <Link
              href="/couples"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
              }}
            >
              Invite Partner & Compare →
            </Link>
          </div>
        )}

        {/* ── Attachment: Dimension Detail ── */}
        {type === "attachment" && (
          <div
            className="rounded-2xl p-5 mb-8 animate-fade-up"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              animationDelay: "500ms",
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              How Attachment Styles Work
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Your attachment style is determined by two dimensions: <strong>Anxiety</strong> (fear of abandonment, need for reassurance) and <strong>Avoidance</strong> (discomfort with closeness, preference for independence).
              Low scores on both dimensions indicate a <strong>Secure</strong> attachment style. Your unique combination shapes how you experience intimacy and emotional closeness.
            </p>
          </div>
        )}

        {/* ── Gottman/Attachment: Strengths or Patterns list ── */}
        {(type === "attachment" || (type === "gottman" && !result.feedback?.partial)) && (
          <>
            {result.feedback?.strengths && (
              <div
                className="rounded-2xl p-5 mb-8 animate-fade-up"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  animationDelay: "560ms",
                }}
              >
                <h4
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#3a8c69" }}
                >
                  ✓ Your Strengths
                </h4>
                <ul className="space-y-2">
                  {result.feedback.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm flex items-start gap-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span style={{ color: "#3a8c69", marginTop: "2px" }}>•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.feedback?.patterns && (
              <div
                className="rounded-2xl p-5 mb-8 animate-fade-up"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  animationDelay: "560ms",
                }}
              >
                <h4
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "#f59e0b" }}
                >
                  ⚠ Patterns to Watch
                </h4>
                <ul className="space-y-2">
                  {result.feedback.patterns.map((p, i) => (
                    <li
                      key={i}
                      className="text-sm flex items-start gap-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span style={{ color: "#f59e0b", marginTop: "2px" }}>•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* ── Growth Tip (for typology assessments with a tip) ── */}
        {result.feedback?.tip && !result.feedback?.partial && (type === "attachment" || type === "gottman" || type === "lovelanguages") && (
          <div
            className="rounded-2xl p-5 mb-8 animate-fade-up"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              animationDelay: "620ms",
              borderLeft: "3px solid var(--color-sage-400)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span>
              <h4
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-sage-500)" }}
              >
                Growth Tip
              </h4>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {result.feedback.tip}
            </p>
          </div>
        )}

        {/* ── CTA Buttons ── */}
        <div
          className="flex flex-wrap gap-4 justify-center animate-fade-up"
          style={{ animationDelay: "700ms" }}
        >
          <Link
            href="/assessments"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            Take Another Assessment
          </Link>
          <Link
            href="/couples"
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              background: "var(--surface)",
            }}
          >
            Compare With Partner
          </Link>
        </div>

      </div>
    </div>
  );
}
