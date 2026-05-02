"use client";

import Link from "next/link";
import { useApp } from "@/lib/context";

const ASSESSMENTS = [
  {
    type: "bigfive",
    icon: "🌊",
    title: "Big Five (BFI-44)",
    badge: "44 Questions",
    time: "~8 min",
    description:
      "Measures Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism — the gold standard of personality science.",
    gradient: "linear-gradient(135deg, #3b7bfc08, #8b5cf610)",
    accentColor: "#3b7bfc",
  },
  {
    type: "attachment",
    icon: "🔗",
    title: "Attachment Style",
    badge: "24 Questions",
    time: "~5 min",
    description:
      "Discover whether your relationship patterns lean Secure, Anxious, or Avoidant — and what that means for how you love.",
    gradient: "linear-gradient(135deg, #f59e0b08, #f43f5e10)",
    accentColor: "#f59e0b",
  },
  {
    type: "hexaco",
    icon: "💎",
    title: "HEXACO-Lite",
    badge: "20 Questions",
    time: "~4 min",
    description:
      "Focused on Honesty-Humility and Agreeableness — two traits that powerfully predict relationship quality.",
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
                href={`/assessments/${assessment.type}`}
                className="group block rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: assessment.gradient,
                  border: `1px solid ${assessment.accentColor}20`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <span className="text-5xl shrink-0 transition-transform duration-300 group-hover:scale-110">
                    {assessment.icon}
                  </span>
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
                        className="text-xs font-medium"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        ⏱ {assessment.time}
                      </span>
                      <span
                        className="text-sm font-semibold transition-all duration-200 group-hover:translate-x-1"
                        style={{ color: assessment.accentColor }}
                      >
                        {completed ? "Retake →" : "Start →"}
                      </span>
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
