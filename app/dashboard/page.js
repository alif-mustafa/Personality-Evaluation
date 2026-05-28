"use client";

import { useApp } from "@/lib/context";
import Link from "next/link";
import dynamic from "next/dynamic";
import { generateGrowthTips } from "@/lib/education";

const RadarChart = dynamic(() => import("@/components/RadarChart"), { ssr: false });

// ── Professional SVG Icons (matching assessments page) ──────────────────────
const IconPersonality = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="11" r="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 16l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLoveLanguages = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <path d="M18 30S6 22 6 14a7 7 0 0 1 12-4.9A7 7 0 0 1 30 14c0 8-12 16-12 16z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14h12M18 8v12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconAttachment = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="9" r="3" stroke={color} strokeWidth="2"/>
    <path d="M18 12v18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 16h16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 16c0 6 4 10 8 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 16c0 6-4 10-8 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconGottman = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
    <rect x="4" y="6" width="18" height="13" rx="4" stroke={color} strokeWidth="2"/>
    <path d="M7 19l-3 4 5-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="14" y="17" width="18" height="13" rx="4" stroke={color} strokeWidth="2"/>
    <path d="M29 30l3 4-5-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ASSESSMENT_ICONS = { bigfive: IconPersonality, lovelanguages: IconLoveLanguages, attachment: IconAttachment, gottman: IconGottman };
const ASSESSMENT_COLORS = { bigfive: "#3b7bfc", lovelanguages: "#f43f5e", attachment: "#f59e0b", gottman: "#8b5cf6" };

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
    { type: "bigfive", label: "Core Personality" },
    { type: "lovelanguages", label: "Love Languages" },
    { type: "attachment", label: "Attachment Style" },
    { type: "gottman", label: "Couple Conflict Style" },
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
              Assessment Progress
            </h3>
            <div className="space-y-4">
              {assessments.map((a) => {
                const completed = !!results[a.type];
                
                const href = completed ? `/results/${a.type}` : `/assessments/${a.type}`;
                const wrapperProps = { href, className: "flex items-center gap-4 group cursor-pointer transition-opacity hover:opacity-80" };

                return (
                  <Link key={a.type} {...wrapperProps}>
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ background: `${ASSESSMENT_COLORS[a.type]}15` }}>
                      {(() => { const Icon = ASSESSMENT_ICONS[a.type]; return <Icon size={18} color={ASSESSMENT_COLORS[a.type]} />; })()}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-2">
                          {a.label}
                          <span 
                            className="text-xs font-normal opacity-0 group-hover:opacity-100 transition-opacity" 
                            style={{ color: "var(--color-primary-500)" }}
                          >
                            {completed ? "View Results →" : "Start Assessment →"}
                          </span>
                        </span>
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
                  </Link>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Couple Status
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Trait Snapshot
            </h3>
            {bigFiveData.length > 0 ? (
              <div style={{ height: "250px" }}>
                <RadarChart data={bigFiveData} />
              </div>
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
                Complete the Core Personality assessment to see your trait radar.
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
              </svg>
              Growth Tips
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
