"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/context";
import { useAuth } from "@/lib/auth-context";
import { generateConflictHeatmap, generateReframingInsights } from "@/lib/couples";
import dynamic from "next/dynamic";
import Link from "next/link";

const RadarChart = dynamic(() => import("@/components/RadarChart"), { ssr: false });

const TRAIT_FIELDS = [
  "Openness", "Conscientiousness", "Extraversion", "Agreeableness",
  "Neuroticism", "Honesty-Humility", "HEXACO Agreeableness",
];
const ATTACHMENT_STYLES = ["Secure", "Anxious", "Avoidant", "Fearful-Avoidant"];
const SEVERITY_COLORS = {
  high: { bg: "rgba(244,63,94,0.12)", border: "#f43f5e", text: "#f43f5e", label: "High Friction" },
  moderate: { bg: "rgba(251,191,36,0.12)", border: "#fbbf24", text: "#d97706", label: "Moderate" },
  low: { bg: "rgba(52,211,153,0.12)", border: "#34d399", text: "#059669", label: "Compatible" },
};

export default function CouplesPage() {
  const { results, couple, updateCoupleScores, updateCoupleAttachment, saveCoupleHeatmap, saveCoupleReframing } = useApp();
  const { user, sendPartnerInvite, checkInvites, acceptInvite } = useAuth();

  const [activeTab, setActiveTab] = useState("invite");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteAssessment, setInviteAssessment] = useState("bigfive");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [pendingInvites, setPendingInvites] = useState([]);
  const [copied, setCopied] = useState(false);

  // Manual fallback scores
  const [partnerBScores, setPartnerBScores] = useState(couple?.partnerB || {});
  const [styleA, setStyleA] = useState(couple?.attachmentStyleA || "");
  const [styleB, setStyleB] = useState(couple?.attachmentStyleB || "");
  const [heatmapData, setHeatmapData] = useState(couple?.heatmap || null);
  const [reframingData, setReframingData] = useState(couple?.reframing || null);
  const [expandedAdvice, setExpandedAdvice] = useState(null);
  const [showManual, setShowManual] = useState(false);

  // Load pending invites
  useEffect(() => {
    if (user) {
      checkInvites().then(setPendingInvites);
    }
  }, [user, checkInvites]);

  // Auto-fill Partner A from own results
  const getPartnerAScores = useCallback(() => {
    const s = {};
    if (results.bigfive) Object.entries(results.bigfive.scores).forEach(([t, d]) => { s[t] = d.normalized; });
    if (results.hexaco) Object.entries(results.hexaco.scores).forEach(([t, d]) => {
      s[t === "Agreeableness" ? "HEXACO Agreeableness" : t] = d.normalized;
    });
    return s;
  }, [results]);

  const handleSendInvite = async () => {
    setInviteError("");
    if (!partnerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
      return setInviteError("Please enter a valid email address.");
    }
    const result = await sendPartnerInvite(partnerEmail.trim(), inviteAssessment);
    if (result.success) {
      setInviteSent(true);
      setInviteLink(result.inviteLink);
      setEmailSent(result.emailSent ?? false);
    } else {
      setInviteError(result.error || "Failed to send invite.");
    }
  };

  const handleAcceptInvite = async (code) => {
    const result = await acceptInvite(code);
    if (result.success) {
      setPendingInvites((prev) => prev.filter((i) => i.inviteCode !== code));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateHeatmap = () => {
    const scoresA = getPartnerAScores();
    const heatmap = generateConflictHeatmap(scoresA, partnerBScores);
    setHeatmapData(heatmap);
    saveCoupleHeatmap(heatmap);
    updateCoupleScores("A", scoresA);
    updateCoupleScores("B", partnerBScores);
    if (styleA && styleB) {
      const reframing = generateReframingInsights(styleA, styleB, scoresA, partnerBScores);
      setReframingData(reframing);
      saveCoupleReframing(reframing);
    }
    setActiveTab("heatmap");
  };

  const hasEnoughScores = Object.keys(getPartnerAScores()).length >= 3 && Object.keys(partnerBScores).length >= 3;

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto text-center pt-16">
          <span className="text-5xl block mb-4">💑</span>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Sign In to Use Couples Insight</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Create an account to invite your partner and compare personalities.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/signup" className="px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}>Sign Up Free</Link>
            <Link href="/auth/login" className="px-6 py-3 rounded-xl text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Couples Insight Engine</h1>
          <p style={{ color: "var(--text-secondary)" }}>Invite your partner, compare profiles, and unlock relationship insights.</p>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto pb-1 mb-8">
        <div className="flex gap-1 p-1 rounded-xl w-fit min-w-full sm:min-w-0" style={{ background: "var(--border-subtle)" }}>
          {[
            { id: "invite", label: "Invite Partner", icon: "📧" },
            { id: "heatmap", label: "Conflict Heatmap", icon: "🔥" },
            { id: "reframing", label: "Reframing Tool", icon: "🔄" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? "shadow-sm" : ""}`}
              style={{ background: activeTab === tab.id ? "var(--surface)" : "transparent", color: activeTab === tab.id ? "var(--foreground)" : "var(--text-secondary)" }}>
              <span className="mr-1.5">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        </div>

        {/* ===== INVITE TAB ===== */}
        {activeTab === "invite" && (
          <div className="animate-fade-up space-y-6">
            {/* Pending invites received */}
            {pendingInvites.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "rgba(59,123,252,0.06)", border: "1px solid rgba(59,123,252,0.15)" }}>
                <h3 className="text-lg font-semibold mb-3">📬 You Have Pending Invites</h3>
                {pendingInvites.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div>
                      <p className="text-sm font-medium">{inv.inviterName || inv.inviterEmail}</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>wants to compare personalities with you</p>
                    </div>
                    <button onClick={() => handleAcceptInvite(inv.inviteCode)} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--color-sage-500)" }}>Accept</button>
                  </div>
                ))}
              </div>
            )}

            {/* Send invite */}
            <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📧</span>
                <div>
                  <h3 className="text-xl font-bold">Invite Your Partner</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>An email will be sent with a direct link to the assessment you choose.</p>
                </div>
              </div>

              {!inviteSent ? (
                <div className="space-y-4">
                  {/* Assessment selector */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Direct them to this assessment first</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "bigfive", icon: "🌊", label: "Big Five" },
                        { value: "lovelanguages", icon: "❤️", label: "Love Languages" },
                        { value: "attachment", icon: "🔗", label: "Attachment" },
                        { value: "gottman", icon: "⚡", label: "Conflict Styles" },
                      ].map((a) => (
                        <button
                          key={a.value}
                          type="button"
                          onClick={() => setInviteAssessment(a.value)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: inviteAssessment === a.value ? "rgba(59,123,252,0.1)" : "var(--background)",
                            border: inviteAssessment === a.value ? "1px solid rgba(59,123,252,0.4)" : "1px solid var(--border)",
                            color: inviteAssessment === a.value ? "var(--color-primary-500)" : "var(--text-secondary)",
                          }}
                        >
                          <span>{a.icon}</span> {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Partner&apos;s Email Address</label>
                    <div className="flex gap-3">
                      <input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} placeholder="partner@email.com"
                        className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
                        style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                      <button onClick={handleSendInvite} className="px-6 py-3 rounded-xl text-sm font-semibold text-white shrink-0 transition-all hover:-translate-y-0.5"
                        style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}>
                        Send Invite
                      </button>
                    </div>
                    {inviteError && <p className="text-xs mt-2" style={{ color: "#f43f5e" }}>{inviteError}</p>}
                    <p className="text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>Your partner will receive an email with a link that takes them directly to their assessment and links your profiles automatically.</p>
                  </div>
                </div>
              ) : (
                <div className="animate-scale-in">
                  {/* Email sent / link ready banner */}
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: emailSent ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)", border: emailSent ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(251,191,36,0.2)" }}>
                    <span>{emailSent ? "✅" : "📋"}</span>
                    <p className="text-sm font-medium" style={{ color: emailSent ? "#059669" : "#d97706" }}>
                      {emailSent
                        ? <>Email sent to <strong>{partnerEmail}</strong>! They&apos;ll receive a direct link to the assessment.</>  
                        : <>Invite created. <strong>Copy the link below</strong> and share it with <strong>{partnerEmail}</strong>.</>}
                    </p>
                  </div>

                  {/* Always show copyable link as fallback */}
                  <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Share this link with your partner:</p>
                  <div className="flex gap-2">
                    <input type="text" readOnly value={inviteLink} className="flex-1 px-3 py-2.5 rounded-lg text-xs font-mono"
                      style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} />
                    <button onClick={handleCopyLink} className="px-4 py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all"
                      style={{ background: copied ? "var(--color-sage-500)" : "var(--color-primary-500)", color: "white" }}>
                      {copied ? "✓ Copied!" : "Copy Link"}
                    </button>
                  </div>
                  <button onClick={() => { setInviteSent(false); setPartnerEmail(""); setEmailSent(false); }} className="text-xs mt-4 block" style={{ color: "var(--text-tertiary)" }}>
                    ← Send another invite
                  </button>
                </div>
              )}
            </div>

            {/* Manual entry fallback */}
            <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <button onClick={() => setShowManual(!showManual)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>📝</span>
                  <span className="text-sm font-semibold">Or enter partner&apos;s scores manually</span>
                </div>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{showManual ? "▲ Hide" : "▼ Show"}</span>
              </button>

              {showManual && (
                <div className="mt-6 animate-fade-up">
                  <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>If your partner already knows their scores, enter them here (0–100 per trait).</p>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-4">
                    {TRAIT_FIELDS.map((trait) => (
                      <div key={trait} className="flex items-center gap-3">
                        <label className="text-xs w-36 shrink-0" style={{ color: "var(--text-secondary)" }}>{trait}</label>
                        <input type="number" min="0" max="100" value={partnerBScores[trait] ?? ""} placeholder="0–100"
                          onChange={(e) => { const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0)); setPartnerBScores(p => ({ ...p, [trait]: v })); updateCoupleScores("B", { ...partnerBScores, [trait]: v }); }}
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
                          style={{ background: "var(--background)", border: "1px solid var(--border)" }} />
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Your Attachment Style</label>
                      <select value={styleA} onChange={(e) => { setStyleA(e.target.value); updateCoupleAttachment("A", e.target.value); }}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                        <option value="">Select...</option>
                        {ATTACHMENT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>Partner&apos;s Attachment Style</label>
                      <select value={styleB} onChange={(e) => { setStyleB(e.target.value); updateCoupleAttachment("B", e.target.value); }}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                        <option value="">Select...</option>
                        {ATTACHMENT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <button onClick={handleGenerateHeatmap} disabled={!hasEnoughScores}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${hasEnoughScores ? "text-white hover:shadow-lg" : "cursor-not-allowed opacity-50"}`}
                    style={{ background: hasEnoughScores ? "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" : "var(--border)", color: hasEnoughScores ? "white" : "var(--text-tertiary)" }}>
                    🔥 Generate Conflict Heatmap
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== HEATMAP TAB ===== */}
        {activeTab === "heatmap" && (
          <div className="animate-fade-up">
            {heatmapData && heatmapData.length > 0 ? (
              <div className="space-y-4">
                {/* Radar comparison */}
                {(() => {
                  const scoresA = getPartnerAScores();
                  const radarA = TRAIT_FIELDS.filter(t => scoresA[t] != null).map(t => ({ trait: t.length > 10 ? t.substring(0, 8) + "…" : t, value: scoresA[t] }));
                  const radarB = TRAIT_FIELDS.filter(t => partnerBScores[t] != null).map(t => ({ trait: t.length > 10 ? t.substring(0, 8) + "…" : t, value: partnerBScores[t] }));
                  if (radarA.length > 0 && radarB.length > 0) {
                    return (
                      <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>Trait Comparison</h3>
                        <div style={{ height: "320px" }}><RadarChart data={radarA} compareData={radarB} showLegend labelA="You" labelB="Partner" /></div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <h3 className="text-lg font-semibold">Conflict Zones</h3>
                {heatmapData.map((item, i) => {
                  const sev = SEVERITY_COLORS[item.severity];
                  const isOpen = expandedAdvice === i;
                  return (
                    <div key={item.trait} className="rounded-2xl overflow-hidden heatmap-cell animate-fade-up" style={{ background: sev.bg, border: `1px solid ${sev.border}30`, animationDelay: `${i * 80}ms` }}>
                      <button onClick={() => setExpandedAdvice(isOpen ? null : i)} className="w-full p-5 text-left">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">{item.trait}</h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${sev.border}20`, color: sev.text }}>{sev.label}</span>
                          </div>
                          <span className="text-2xl font-bold" style={{ color: sev.text }}>{item.gap}</span>
                        </div>
                        <div className="space-y-2">
                          {[{ label: "You", score: item.scoreA, color: "var(--color-primary-500)" }, { label: "Partner", score: item.scoreB, color: "var(--color-sage-500)" }].map(p => (
                            <div key={p.label} className="flex items-center gap-3">
                              <span className="text-xs w-14 shrink-0" style={{ color: "var(--text-secondary)" }}>{p.label}</span>
                              <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border-subtle)" }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.score}%`, background: p.color }} />
                              </div>
                              <span className="text-xs font-medium w-8 text-right">{p.score}</span>
                            </div>
                          ))}
                        </div>
                        <span className="text-xs mt-3 block" style={{ color: "var(--text-tertiary)" }}>{isOpen ? "▲ Hide advice" : "▼ Show advice"}</span>
                      </button>
                      {isOpen && item.advice && (
                        <div className="px-5 pb-5 animate-fade-up">
                          <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                            <h5 className="font-semibold text-sm mb-2">{item.advice.title}</h5>
                            <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.advice.description}</p>
                            <div className="p-3 rounded-lg mb-3" style={{ background: "var(--color-sage-500)/8", borderLeft: "3px solid var(--color-sage-400)" }}>
                              <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-sage-500)" }}>💡 Advice</p>
                              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.advice.advice}</p>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{item.advice.deepDive}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🔥</span>
                <h3 className="text-xl font-semibold mb-2">No Heatmap Yet</h3>
                <p className="mb-4" style={{ color: "var(--text-secondary)" }}>Enter scores or wait for your partner to complete assessments.</p>
                <button onClick={() => setActiveTab("invite")} className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Go to Invite</button>
              </div>
            )}
          </div>
        )}

        {/* ===== REFRAMING TAB ===== */}
        {activeTab === "reframing" && (
          <div className="animate-fade-up">
            {reframingData ? (
              <div className="space-y-6">
                <div className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg, var(--color-primary-500)/8, var(--color-sage-500)/8)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{reframingData.dynamic.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold">{reframingData.dynamic.title}</h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{reframingData.dynamic.styleA} × {reframingData.dynamic.styleB}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>{reframingData.dynamic.scenario}</p>

                  {reframingData.dynamic.triggers?.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Common Triggers &amp; Reframes</h4>
                      {reframingData.dynamic.triggers.map((trigger, i) => (
                        <div key={i} className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                          <p className="text-sm font-semibold mb-3">⚡ Trigger: &quot;{trigger.trigger}&quot;</p>
                          <div className="grid sm:grid-cols-2 gap-3 mb-4">
                            {trigger.anxiousFeels && <div className="p-3 rounded-lg" style={{ background: "rgba(245,158,11,0.08)" }}><p className="text-xs font-semibold mb-1" style={{ color: "#f59e0b" }}>💛 Anxious feels:</p><p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>&quot;{trigger.anxiousFeels}&quot;</p></div>}
                            {trigger.avoidantFeels && <div className="p-3 rounded-lg" style={{ background: "rgba(59,123,252,0.08)" }}><p className="text-xs font-semibold mb-1" style={{ color: "#3b7bfc" }}>🔵 Avoidant feels:</p><p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>&quot;{trigger.avoidantFeels}&quot;</p></div>}
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: "var(--color-sage-500)/8", borderLeft: "3px solid var(--color-sage-400)" }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-sage-500)" }}>🔄 Reframe:</p>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{trigger.reframe}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-5 rounded-xl" style={{ background: "linear-gradient(135deg, var(--color-primary-500)/10, var(--color-sage-500)/10)", border: "1px solid var(--color-primary-500)/20" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2 gradient-text">The Path Forward</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{reframingData.dynamic.advice}</p>
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h4 className="font-semibold mb-2">🌟 Overall Insight</h4>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{reframingData.overallInsight}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🔄</span>
                <h3 className="text-xl font-semibold mb-2">Reframing Tool</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Select attachment styles and generate a heatmap to unlock reframing insights.</p>
                <button onClick={() => setActiveTab("invite")} className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Go to Invite</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
