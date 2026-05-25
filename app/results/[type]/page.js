"use client";

import { use } from "react";
import { useApp } from "@/lib/context";
import { getAssessment } from "@/lib/assessments";
import Link from "next/link";
import dynamic from "next/dynamic";

const RadarChart = dynamic(() => import("@/components/RadarChart"), { ssr: false });

export default function ResultsPage({ params }) {
  const { type } = use(params);
  const { getResults, isLoaded } = useApp();

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
  const isTypology = type === "attachment" || type === "gottman" || type === "lovelanguages";

  // Prepare radar chart data
  const radarData = isTypology
    ? Object.entries(result.scores).map(([trait, data]) => ({
        trait,
        value: data.normalized,
      }))
    : Object.entries(result.scores).map(([trait, data]) => ({
        trait: trait.length > 12 ? trait.substring(0, 10) + "…" : trait,
        value: data.normalized,
        fullTrait: trait,
      }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <Link
            href="/assessments"
            className="text-sm mb-4 block transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back to Assessments
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{meta.icon}</span>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Your {meta.shortTitle} Results
              </h1>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Completed {new Date(result.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Radar Chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 animate-fade-up"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              animationDelay: "100ms",
            }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
              Trait Profile
            </h3>
            <div style={{ height: "300px" }}>
              <RadarChart data={radarData} />
            </div>

            {/* Typology style badge */}
            {isTypology && result.style && (
              <div
                className="mt-4 p-4 rounded-xl text-center"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span className="text-3xl block mb-2">
                  {result.feedback.emoji || "✨"}
                </span>
                <p className="text-sm font-semibold">{result.feedback.title || result.feedback.primary || result.style}</p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Your primary result
                </p>
              </div>
            )}
          </div>

          {/* Trait Breakdowns */}
          <div className="lg:col-span-3 space-y-4">
            {isTypology ? (
              /* Typology results (Attachment, Gottman, Love Languages) */
              <div className="space-y-4">
                {/* Style description */}
                <div
                  className="rounded-2xl p-6 animate-fade-up"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    animationDelay: "150ms",
                  }}
                >
                  <h3 className="text-lg font-bold mb-3">{result.feedback.title || result.feedback.primary || result.style}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                    {result.feedback.description || result.feedback.body}
                  </p>

                  {result.feedback.partial ? (
                    <div className="mt-6 flex justify-center">
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
                  ) : (
                    <>
                      {result.feedback.strengths && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                            Your Strengths
                          </h4>
                          <ul className="space-y-1">
                            {result.feedback.strengths.map((s, i) => (
                              <li
                                key={i}
                                className="text-sm flex items-center gap-2"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <span style={{ color: "var(--color-sage-400)" }}>✓</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.feedback.tip && (
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "var(--color-sage-500)/8",
                            borderLeft: "3px solid var(--color-sage-400)",
                          }}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-sage-500)" }}>
                            💡 Growth Tip
                          </p>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {result.feedback.tip}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Dimension scores */}
                {Object.entries(result.scores).map(([dim, data], i) => (
                  <div
                    key={dim}
                    className="rounded-2xl p-6 animate-fade-up"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-sm)",
                      animationDelay: `${200 + i * 80}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">
                        {type === "lovelanguages" && dim === "A" ? "Words of Affirmation" :
                         type === "lovelanguages" && dim === "T" ? "Quality Time" :
                         type === "lovelanguages" && dim === "G" ? "Receiving Gifts" :
                         type === "lovelanguages" && dim === "S" ? "Acts of Service" :
                         type === "lovelanguages" && dim === "P" ? "Physical Touch" : dim}
                      </h4>
                      <span className="text-lg font-bold gradient-text">{data.normalized}</span>
                    </div>
                    <div className="progress-track h-2">
                      <div className="progress-fill" style={{ width: `${data.normalized}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Big Five / HEXACO results */
              Object.entries(result.feedback).map(([trait, fb], i) => (
                <div
                  key={trait}
                  className="rounded-2xl p-6 animate-fade-up"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    animationDelay: `${150 + i * 80}ms`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold">{trait}</h3>
                    <span className="text-xl font-bold gradient-text">{fb.score}</span>
                  </div>

                  <div className="progress-track h-2 mb-4">
                    <div className="progress-fill" style={{ width: `${fb.score}%` }} />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-primary-400)" }}>
                    {fb.title}
                  </p>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                    {fb.body}
                  </p>

                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "var(--color-sage-500)/8",
                      borderLeft: "3px solid var(--color-sage-400)",
                    }}
                  >
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-sage-500)" }}>
                      💡 Tip
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {fb.tip}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-10 justify-center animate-fade-up" style={{ animationDelay: "600ms" }}>
          <Link
            href="/assessments"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
            }}
          >
            Take Another Assessment
          </Link>
          <Link
            href="/couples"
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Compare With Partner
          </Link>
        </div>
      </div>
    </div>
  );
}
