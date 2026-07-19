"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/context";
import { useAuth } from "@/lib/auth-context";
import { generateConflictHeatmap, generateReframingInsights } from "@/lib/couples";
import { scoreGottmanCouple } from "@/lib/scoring";
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

// ── Professional SVG Icons ──────────────────────────────────────────────
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
const IconMail = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconRefresh = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/>
  </svg>
);
const IconCheck = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconClock = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconPen = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);
const IconCancel = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconFlame = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);
const IconClipboard = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
);
const IconInbox = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
);

export default function CouplesPage() {
  const { results, couple, updateCoupleScores, updateCoupleAttachment, saveCoupleHeatmap, saveCoupleReframing, saveCoupleConflictStyle } = useApp();
  const { user, sendPartnerInvite, checkInvites, acceptInvite, fetchPartnerStatus, fetchPartnerScores, fetchSentInvite, updateInviteEmail, cancelInvite } = useAuth();

  const [activeTab, setActiveTab] = useState("invite");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteAssessment, setInviteAssessment] = useState("bigfive");
  const [inviteError, setInviteError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [copied, setCopied] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState(null);
  const [partnerStatusLoading, setPartnerStatusLoading] = useState(false);
  const [isGeneratingHeatmap, setIsGeneratingHeatmap] = useState(false);

  // Sent invite tracking
  const [sentInvite, setSentInvite] = useState(null); // null = loading, false = no invite
  const [sentInviteLoading, setSentInviteLoading] = useState(true);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newPartnerEmail, setNewPartnerEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Manual fallback scores
  const [partnerBScores, setPartnerBScores] = useState(couple?.partnerB || {});
  const [styleA, setStyleA] = useState(couple?.attachmentStyleA || "");
  const [styleB, setStyleB] = useState(couple?.attachmentStyleB || "");
  const [heatmapData, setHeatmapData] = useState(couple?.heatmap || null);
  const [reframingData, setReframingData] = useState(couple?.reframing || null);
  const [expandedAdvice, setExpandedAdvice] = useState(null);
  const [showManual, setShowManual] = useState(false);

  // Load pending invites, sent invite status, and partner status
  useEffect(() => {
    if (user) {
      checkInvites()
        .then(setPendingInvites)
        .catch((err) => console.error("Error checking invites:", err));

      fetchSentInvite()
        .then((inv) => {
          setSentInvite(inv || false);
        })
        .catch((err) => {
          console.error("Error fetching sent invite:", err);
          setSentInvite(false);
        })
        .finally(() => setSentInviteLoading(false));

      fetchPartnerStatus()
        .then((status) => {
          setPartnerStatus(status);
        })
        .catch((err) => {
          console.error("Error fetching partner status:", err);
        })
        .finally(() => {
          setPartnerStatusLoading(false);
        });
    }
  }, [user, checkInvites, fetchPartnerStatus, fetchSentInvite]);

  // Auto-fill Partner A from own results
  const getPartnerAScores = useCallback(() => {
    const s = {};
    if (results.bigfive) Object.entries(results.bigfive.scores).forEach(([t, d]) => { s[t] = d.normalized; });
    if (results.hexaco) Object.entries(results.hexaco.scores).forEach(([t, d]) => {
      s[t === "Agreeableness" ? "HEXACO Agreeableness" : t] = d.normalized;
    });
    return s;
  }, [results]);

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    setInviteError("");
    if (!partnerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
      return setInviteError("Please enter a valid email address.");
    }

    setIsSending(true);
    const result = await sendPartnerInvite(partnerEmail.trim(), inviteAssessment);
    setIsSending(false);

    if (result.success) {
      // Refresh sent invite status
      const inv = await fetchSentInvite();
      setSentInvite(inv || false);
      setPartnerEmail("");
    } else {
      setInviteError(result.error || "Failed to send invite.");
    }
  };

  const handleAcceptInvite = async (code) => {
    const result = await acceptInvite(code);
    if (result.success) {
      setPendingInvites((prev) => prev.filter((i) => i.inviteCode !== code));
      // Refresh partner status after accepting
      const status = await fetchPartnerStatus();
      setPartnerStatus(status);
    }
  };

  const handleChangeEmail = async () => {
    if (!newPartnerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPartnerEmail)) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    setIsUpdatingEmail(true);
    setInviteError("");
    const result = await updateInviteEmail(newPartnerEmail.trim());
    setIsUpdatingEmail(false);
    if (result.success) {
      const inv = await fetchSentInvite();
      setSentInvite(inv || false);
      setIsEditingEmail(false);
      setNewPartnerEmail("");
    } else {
      setInviteError(result.error || "Failed to update email.");
    }
  };

  const handleCancelInvite = async () => {
    setIsCancelling(true);
    const result = await cancelInvite();
    setIsCancelling(false);
    if (result.success) {
      setSentInvite(false);
    }
  };

  const handleGenerateHeatmapFromPartner = async () => {
    setIsGeneratingHeatmap(true);
    const partnerBigFive = await fetchPartnerScores("bigfive");
    setIsGeneratingHeatmap(false);

    if (!partnerBigFive) {
      alert("Could not fetch your partner's scores. Make sure they have completed the Core Personality assessment.");
      return;
    }

    const scoresA = getPartnerAScores();
    // Build normalized trait map from partner's bigfive result
    const scoresB = {};
    if (partnerBigFive.scores) {
      Object.entries(partnerBigFive.scores).forEach(([trait, data]) => {
        scoresB[trait] = data.normalized ?? data;
      });
    }

    const heatmap = generateConflictHeatmap(scoresA, scoresB);
    setHeatmapData(heatmap);
    saveCoupleHeatmap(heatmap);
    updateCoupleScores("A", scoresA);
    updateCoupleScores("B", scoresB);
    setPartnerBScores(scoresB);

    if (styleA && partnerBigFive.style) {
      const reframing = generateReframingInsights(styleA, partnerBigFive.style, scoresA, scoresB);
      setReframingData(reframing);
      saveCoupleReframing(reframing);
    }
    setActiveTab("heatmap");
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

  const handleGenerateDemoCoupleStyle = () => {
    if (!results.gottman) return;
    
    // Generate random 1-5 responses for partner B to simulate them completing the test
    const fakePartnerResponses = {};
    for (let i = 1; i <= 20; i++) {
      fakePartnerResponses[`g${i}`] = Math.floor(Math.random() * 5) + 1;
    }
    
    const coupleResult = scoreGottmanCouple(results.gottman.responses, fakePartnerResponses);
    saveCoupleConflictStyle(coupleResult);
  };

  const hasEnoughScores = Object.keys(getPartnerAScores()).length >= 3 && Object.keys(partnerBScores).length >= 3;

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto text-center pt-16">
          <span className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e" }}><IconLoveLanguages size={40} /></span>
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
            { id: "invite", label: "Invite Partner", icon: <IconMail size={16} /> },
            { id: "style", label: "Couple Style", icon: <IconGottman size={16} /> },
            { id: "heatmap", label: "Conflict Heatmap", icon: <IconFlame size={16} /> },
            { id: "reframing", label: "Reframing Tool", icon: <IconRefresh size={16} /> },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? "shadow-sm" : ""}`}
              style={{ background: activeTab === tab.id ? "var(--surface)" : "transparent", color: activeTab === tab.id ? "var(--foreground)" : "var(--text-secondary)" }}>
              <span className="mr-1.5 flex items-center justify-center">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        </div>

        {/* ===== INVITE TAB ===== */}
        {activeTab === "invite" && (
          <div className="animate-fade-up space-y-6">
            {/* ── Loading state ── */}
            {(partnerStatusLoading || sentInviteLoading) && (
              <div className="rounded-2xl p-6 flex items-center gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="w-5 h-5 border-2 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin shrink-0" />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Checking partner status…</p>
              </div>
            )}

            {/* ── Partner Status Panel (shown when couple is formally linked) ── */}
            {!partnerStatusLoading && partnerStatus && (
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-sage-500))" }}>
                      {partnerStatus.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold truncate">{partnerStatus.displayName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: "rgba(52,211,153,0.15)", color: "#059669" }}>💑 Linked</span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{partnerStatus.email}</p>
                    </div>
                  </div>
                </div>

                {/* Assessment Checklist */}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Assessment Progress</p>
                  <div className="space-y-2">
                    {[
                      { type: "bigfive", label: "Core Personality", icon: <IconPersonality size={16} /> },
                      { type: "lovelanguages", label: "Love Languages", icon: <IconLoveLanguages size={16} /> },
                      { type: "attachment", label: "Attachment Style", icon: <IconAttachment size={16} /> },
                      { type: "gottman", label: "Conflict Styles", icon: <IconGottman size={16} /> },
                    ].map((a) => {
                      const done = partnerStatus.completedAssessments.includes(a.type);
                      return (
                        <div key={a.type} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6">{a.icon}</span>
                            <span className="text-sm" style={{ color: done ? "var(--foreground)" : "var(--text-tertiary)" }}>{a.label}</span>
                          </div>
                          {done ? (
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "#059669" }}><IconCheck size={12} /> Done</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--border-subtle)", color: "var(--text-tertiary)" }}><IconClock size={12} /> Pending</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-generate heatmap CTA */}
                {partnerStatus.completedAssessments.includes("bigfive") && results.bigfive && (
                  <div className="px-6 pb-6">
                    <button
                      onClick={handleGenerateHeatmapFromPartner}
                      disabled={isGeneratingHeatmap}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #f43f5e, #f59e0b)" }}
                    >
                      {isGeneratingHeatmap ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading partner scores…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <IconFlame size={16} /> Generate Conflict Heatmap with Partner&apos;s Scores
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-center mt-2" style={{ color: "var(--text-tertiary)" }}>Automatically pulls your partner&apos;s Core Personality results</p>
                  </div>
                )}

                {partnerStatus.completedAssessments.includes("bigfive") && !results.bigfive && (
                  <div className="px-6 pb-6">
                    <div className="p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#d97706" }}>
                      <IconCheck size={16} /> <span>Your partner is ready! Complete your own <strong>Core Personality</strong> assessment to generate the heatmap.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Sent Invite Status Panel (shown when user has sent an invite but no couple link yet) ── */}
            {!partnerStatusLoading && !sentInviteLoading && !partnerStatus && sentInvite && (
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: sentInvite.status === "accepted" ? "rgba(52,211,153,0.15)" : "rgba(59,123,252,0.1)", color: sentInvite.status === "accepted" ? "#059669" : "var(--color-primary-500)" }}>
                      {sentInvite.status === "accepted" ? <IconCheck size={20} /> : <IconClock size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">Invite {sentInvite.status === "accepted" ? "Accepted!" : "Pending"}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{
                          background: sentInvite.status === "accepted" ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
                          color: sentInvite.status === "accepted" ? "#059669" : "#d97706"
                        }}>
                          {sentInvite.status === "accepted" ? <span className="flex items-center gap-1"><IconCheck size={12} /> Accepted</span> : <span className="flex items-center gap-1"><IconClock size={12} /> Waiting</span>}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>Sent to: {sentInvite.partnerEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {sentInvite.status === "accepted" && sentInvite.acceptedAt && (
                    <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                      <p style={{ color: "#059669" }} className="flex items-center gap-2">
                        <IconCheck size={16} /> <span>Your partner accepted the invite on <strong>{new Date(sentInvite.acceptedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong>.</span>
                        Refresh the page to see their profile and assessment progress.
                      </p>
                    </div>
                  )}

                  {sentInvite.status === "pending" && (
                    <>
                      {/* Copyable invite link */}
                      <div>
                        <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Share this link with your partner:</p>
                        <div className="flex gap-2">
                          <input type="text" readOnly value={sentInvite.inviteLink} className="flex-1 px-3 py-2.5 rounded-lg text-xs font-mono"
                            style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} />
                          <button onClick={() => handleCopyLink(sentInvite.inviteLink)} className="px-4 py-2.5 rounded-lg text-xs font-semibold shrink-0 transition-all"
                            style={{ background: copied ? "var(--color-sage-500)" : "var(--color-primary-500)", color: "white" }}>
                            {copied ? "✓ Copied!" : "Copy Link"}
                          </button>
                        </div>
                      </div>

                      {/* Change email inline editor */}
                      {isEditingEmail ? (
                        <div className="p-4 rounded-xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Change partner&apos;s email address:</p>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={newPartnerEmail}
                              onChange={(e) => setNewPartnerEmail(e.target.value)}
                              placeholder="new-partner@email.com"
                              className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
                              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                            />
                            <button
                              onClick={handleChangeEmail}
                              disabled={isUpdatingEmail}
                              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-white shrink-0 transition-all disabled:opacity-50"
                              style={{ background: "var(--color-primary-500)" }}
                            >
                              {isUpdatingEmail ? "Updating…" : "Update"}
                            </button>
                            <button
                              onClick={() => { setIsEditingEmail(false); setNewPartnerEmail(""); setInviteError(""); }}
                              className="px-3 py-2.5 rounded-lg text-xs font-medium shrink-0"
                              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                            >
                              Cancel
                            </button>
                          </div>
                          {inviteError && <p className="text-xs mt-2" style={{ color: "#f43f5e" }}>{inviteError}</p>}
                          <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>This will generate a new invite link. The old link will stop working.</p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setIsEditingEmail(true); setNewPartnerEmail(sentInvite.partnerEmail); }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[var(--border-subtle)]"
                            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                          >
                            <IconPen size={14} /> Change Email
                          </button>
                          <button
                            onClick={handleCancelInvite}
                            disabled={isCancelling}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(244,63,94,0.05)] disabled:opacity-50"
                            style={{ border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}
                          >
                            {isCancelling ? "Cancelling…" : <><IconCancel size={14} /> Cancel Invite</>}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Hint for when no invite exists and no partner is linked */}
            {!partnerStatusLoading && !sentInviteLoading && !partnerStatus && !sentInvite && (
              <div className="rounded-2xl p-5" style={{ background: "rgba(59,123,252,0.04)", border: "1px dashed rgba(59,123,252,0.2)" }}>
                <p className="text-sm text-center flex items-center justify-center gap-2" style={{ color: "var(--text-tertiary)" }}><IconMail size={16} /> Send an invite below to link your partner. Once they accept, you&apos;ll both be able to see each other&apos;s assessment data.</p>
              </div>
            )}

            {/* Pending invites received by the current user */}
            {pendingInvites.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "rgba(59,123,252,0.06)", border: "1px solid rgba(59,123,252,0.15)" }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><IconInbox size={20} /> You Have Pending Invites</h3>
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

            {/* Send invite (only show when no pending invite exists) */}
            {(!sentInvite || sentInvite.status === "accepted") && !partnerStatus && (
              <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(59,123,252,0.1)", color: "var(--color-primary-500)" }}><IconMail size={24} /></span>
                  <div>
                    <h3 className="text-xl font-bold">Invite Your Partner</h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Send an invite via email or share the link directly.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Assessment selector */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Direct them to this assessment first</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "bigfive", icon: <IconPersonality size={16} />, label: "Core Personality" },
                        { value: "lovelanguages", icon: <IconLoveLanguages size={16} />, label: "Love Languages" },
                        { value: "attachment", icon: <IconAttachment size={16} />, label: "Attachment" },
                        { value: "gottman", icon: <IconGottman size={16} />, label: "Conflict Styles" },
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
                      <button onClick={handleSendInvite} disabled={isSending} className={`px-6 py-3 rounded-xl text-sm font-semibold text-white shrink-0 transition-all ${isSending ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
                        style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}>
                        {isSending ? "Sending..." : "Send Invite"}
                      </button>
                    </div>
                    {inviteError && <p className="text-xs mt-2" style={{ color: "#f43f5e" }}>{inviteError}</p>}
                    <p className="text-xs mt-3" style={{ color: "var(--text-tertiary)" }}>Your partner will receive an email with a link. You can also copy and share the link manually after sending.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual entry fallback */}
            <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <button onClick={() => setShowManual(!showManual)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-primary-500)] flex items-center justify-center"><IconPen size={18} /></span>
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
                <span className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(59,123,252,0.1)", color: "var(--color-primary-500)" }}><IconRefresh size={40} /></span>
                <h3 className="text-xl font-semibold mb-2">Reframing Tool</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Select attachment styles and generate a heatmap to unlock reframing insights.</p>
                <button onClick={() => setActiveTab("invite")} className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Go to Invite</button>
              </div>
            )}
          </div>
        )}

        {/* ===== COUPLE STYLE TAB ===== */}
        {activeTab === "style" && (
          <div className="animate-fade-up">
            {couple?.gottmanCoupleResult ? (
              <div className="space-y-6">
                <div className="rounded-3xl p-6 sm:p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}><IconGottman size={20} /></div>
                    <div>
                      <h2 className="text-xl font-bold">Couple Conflict Style</h2>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Your shared interaction dynamic</p>
                    </div>
                  </div>

                  {couple.gottmanUiState === "ERROR_RETAKE_TEST" && (
                    <div className="text-center mb-8 p-8 rounded-2xl" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)" }}>
                      <h3 className="text-2xl font-bold mb-4" style={{ color: "#e11d48" }}>Invalid Data Detected</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Your responses contain contradictions. Please retake the assessment.</p>
                    </div>
                  )}

                  {couple.gottmanUiState === "CRISIS_INTERVENTION" && (
                    <div className="text-center mb-8 p-8 rounded-2xl" style={{ background: "rgba(244,63,94,0.1)", border: "2px solid #f43f5e" }}>
                      <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: "#f43f5e", color: "white" }}>Crisis Intervention</div>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ fontFamily: "var(--font-outfit)", color: "#e11d48" }}>High Risk Pattern</h3>
                      <p className="text-sm md:text-base leading-relaxed max-w-2xl mx-auto text-[var(--text-secondary)]">Urgent intervention is recommended. Highly damaging conflict patterns have been detected.</p>
                    </div>
                  )}

                  {["MATCHED_STYLE", "COMPLEMENTARY_MISMATCH", "HIGH_FRICTION_MISMATCH"].includes(couple.gottmanUiState) && (
                    <div className="text-center mb-8 p-8 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.05), transparent)", border: "1px solid var(--border)" }}>
                      <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" 
                        style={{ background: couple.gottmanUiState === "HIGH_FRICTION_MISMATCH" ? "rgba(244,63,94,0.15)" : "var(--color-sage-500)", color: couple.gottmanUiState === "HIGH_FRICTION_MISMATCH" ? "#e11d48" : "white" }}>
                        {couple.gottmanUiState.replace(/_/g, " ")}
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                        {couple.coupleProfile}
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                        {couple.gottmanUiState === "MATCHED_STYLE" && "You and your partner share the same healthy conflict style, making it easier to resolve disagreements."}
                        {couple.gottmanUiState === "COMPLEMENTARY_MISMATCH" && "You have different but compatible conflict styles. Understanding these differences can strengthen your bond."}
                        {couple.gottmanUiState === "HIGH_FRICTION_MISMATCH" && "Your styles naturally clash. You will need to put in extra effort and use the reframing tool to navigate arguments."}
                      </p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    {['A', 'B'].map((p) => {
                      const summary = p === 'A' ? couple.partnerASummary : couple.partnerBSummary;
                      if (!summary) return null;
                      return (
                        <div key={p} className="p-6 rounded-2xl" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                          <h4 className="font-bold mb-4">{p === 'A' ? "Your Profile" : "Partner's Profile"}</h4>
                          <p className="text-sm mb-2"><span style={{ color: "var(--text-secondary)" }}>Dominant Style:</span> <strong style={{ color: "var(--color-primary-500)" }}>{summary.dominant_style}</strong></p>
                          <div className="space-y-2 mt-4">
                            {summary.urgent_flags_present && <div className="text-xs p-2 rounded font-semibold flex items-center gap-2" style={{ background: "rgba(244,63,94,0.1)", color: "#e11d48" }}>⚠ Urgent Risk Detected</div>}
                            {summary.soft_flags_present && <div className="text-xs p-2 rounded font-semibold flex items-center gap-2" style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}>⚠ Soft Risk Detected</div>}
                            {!summary.urgent_flags_present && !summary.soft_flags_present && <div className="text-xs p-2 rounded font-semibold flex items-center gap-2" style={{ background: "rgba(52,211,153,0.1)", color: "#059669" }}>✓ No Red Flags</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 rounded-3xl" style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}>
                <span className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 opacity-50" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}><IconGottman size={32} /></span>
                <h3 className="text-lg font-bold mb-2">Couple Style Not Generated</h3>
                
                {!results.gottman ? (
                  <>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                      You need to complete the Couple Conflict Style assessment first.
                    </p>
                    <Link href="/assessments/gottman" className="px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}>
                      Take Assessment
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto 24px" }}>
                      Your responses are recorded. In a full implementation, your partner would accept an invite and complete the assessment to generate the shared couple style.
                    </p>
                    <button onClick={handleGenerateDemoCoupleStyle} className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                      Demo: Simulate Partner Responses
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
