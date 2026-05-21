"use client";

import { useApp } from "@/lib/context";
import Link from "next/link";
import dynamic from "next/dynamic";
import { generateGrowthTips } from "@/lib/education";

const RadarChart = dynamic(() => import("@/components/RadarChart"), { ssr: false });

export default function DashboardPage() {
  const { results, couple, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
      </div>
    );
  }

  const hasAnyResults = Object.keys(results).length > 0;
  const assessments = [
    { type: "bigfive", label: "Big Five", icon: "🌊" },
    { type: "lovelanguages", label: "Love Languages", icon: "❤️" },
    { type: "attachment", label: "Attachment Style", icon: "🔗" },
    { type: "gottman", label: "Conflict Styles", icon: "⚡" },
  ];

  // Prepare radar data from Big Five if available
  const bigFiveData = results.bigfive
    ? Object.entries(results.bigfive.scores).map(([trait, data]) => ({
        trait: trait.substring(0, 4) + ".",
        value: data.normalized,
        fullTrait: trait,
      }))
    : [];

  // Growth tips
  const growthTips = hasAnyResults ? generateGrowthTips(results) : [];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Your Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Your personality journey at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Assessment Progress */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              🎯 Assessment Progress
            </h3>
            <div className="space-y-4">
              {assessments.map((a) => {
                const completed = !!results[a.type];
                return (
                  <div key={a.type} className="flex items-center gap-4">
                    <span className="text-xl w-8">{a.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{a.label}</span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: completed
                              ? "var(--color-sage-500)/15"
                              : "var(--border-subtle)",
                            color: completed
                              ? "var(--color-sage-500)"
                              : "var(--text-tertiary)",
                          }}
                        >
                          {completed ? "✓ Complete" : "Not started"}
                        </span>
                      </div>
                      <div className="progress-track h-1.5">
                        <div
                          className="progress-fill"
                          style={{ width: completed ? "100%" : "0%" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!hasAnyResults && (
              <Link
                href="/assessments"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                }}
              >
                Take Your First Assessment →
              </Link>
            )}
          </div>

          {/* Couple Status */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              💑 Couple Status
            </h3>
            {couple.heatmap ? (
              <div>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                  Conflict heatmap generated with{" "}
                  {couple.heatmap.filter((c) => c.severity !== "low").length} areas
                  of focus.
                </p>
                <Link
                  href="/couples"
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-primary-500)" }}
                >
                  View Insights →
                </Link>
              </div>
            ) : (
              <div>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Compare your personality with a partner to unlock conflict
                  insights and reframing tools.
                </p>
                <Link
                  href="/couples"
                  className="inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>

          {/* Radar Chart */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 Trait Snapshot
            </h3>
            {bigFiveData.length > 0 ? (
              <div style={{ height: "250px" }}>
                <RadarChart data={bigFiveData} />
              </div>
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
                Complete the Big Five assessment to see your trait radar.
              </p>
            )}
          </div>

          {/* Growth Tips */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              💡 Growth Tips
            </h3>
            {growthTips.length > 0 ? (
              <div className="space-y-4">
                {growthTips.slice(0, 4).map((tip, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{tip.emoji}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                        {tip.category}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                        {tip.trait}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {tip.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-tertiary)" }}>
                Complete assessments to unlock personalized growth tips.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
