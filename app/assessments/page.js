"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";

import { ASSESSMENT_ICONS } from "@/components/icons";

const ASSESSMENTS = [
  {
    type: "bigfive",
    title: "Core Personality",
    badge: "44 Questions",
    time: "~8 min",
    description:
      "Who they are. Measures Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism — the gold standard of personality science.",
    gradient: "linear-gradient(135deg, #3b7bfc08, #8b5cf610)",
    accentColor: "#3b7bfc",
  },
  {
    type: "lovelanguages",
    title: "Love Languages",
    badge: "30 Questions",
    time: "~6 min",
    description:
      "What makes them feel good. Discover your primary love language from Words of Affirmation, Quality Time, Gifts, Acts of Service, and Physical Touch.",
    gradient: "linear-gradient(135deg, #f43f5e08, #ec489910)",
    accentColor: "#f43f5e",
  },
  {
    type: "attachment",
    title: "Attachment Style",
    badge: "36 Questions",
    time: "~7 min",
    description:
      "Why they feel threatened during conflict. Understand how anxiety and avoidance shape your behavior in emotionally intimate relationships.",
    gradient: "linear-gradient(135deg, #f59e0b08, #f43f5e10)",
    accentColor: "#f59e0b",
  },
  {
    type: "gottman",
    title: "Couple Conflict Style",
    badge: "20 Questions",
    time: "~4 min",
    description:
      "How you communicate as a couple during conflict. Both partners complete this assessment separately, and the results are combined to reveal your shared Gottman conflict style: Validating, Volatile, Conflict-Avoiding, Hostile, or Hostile-Detached.",
    gradient: "linear-gradient(135deg, #8b5cf608, #3a8c6910)",
    accentColor: "#8b5cf6",
  },
];

export default function AssessmentsPage() {
  const { isCompleted, isLoaded } = useApp();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Personality Assessments
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Choose an assessment to begin. Each takes 5–10 minutes and provides
            instant results.
          </p>
        </div>

        <div className="grid gap-6 stagger">
          {ASSESSMENTS.map((assessment) => {
            const completed = isLoaded && isCompleted(assessment.type);
            return (
              <Link
                key={assessment.type}
                href={completed ? `/results/${assessment.type}` : `/assessments/${assessment.type}`}
                className="group block rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: assessment.gradient,
                  border: `1px solid ${assessment.accentColor}20`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div
                    className="shrink-0 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      width: 64,
                      height: 64,
                      background: `${assessment.accentColor}12`,
                      border: `1.5px solid ${assessment.accentColor}30`,
                    }}
                  >
                    {(() => { const Icon = ASSESSMENT_ICONS[assessment.type]; return <Icon color={assessment.accentColor} />; })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold">{assessment.title}</h3>
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          background: `${assessment.accentColor}15`,
                          color: assessment.accentColor,
                        }}
                      >
                        {assessment.badge}
                      </span>
                      {completed && (
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            background: "var(--color-sage-500)/15",
                            color: "var(--color-sage-500)",
                          }}
                        >
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {assessment.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-medium flex items-center gap-1.5"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {assessment.time}
                      </span>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-sm font-semibold transition-all duration-200 group-hover:translate-x-1"
                          style={{ color: assessment.accentColor }}
                        >
                          {completed ? "View Results →" : "Start →"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
