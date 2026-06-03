"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code") || "";
  const from = searchParams.get("from") || "";
  const assessment = searchParams.get("assessment") || "";
  const email = searchParams.get("email") || "";
  const autoAccept = searchParams.get("autoaccept") === "1";

  // Build deep-link query string for spouse-signup
  const spouseSignupParams = new URLSearchParams();
  if (code) spouseSignupParams.set("code", code);
  if (from) spouseSignupParams.set("from", from);
  if (assessment) spouseSignupParams.set("assessment", assessment);
  if (email) spouseSignupParams.set("email", email);

  const spouseSignupUrl = `/auth/spouse-signup?${spouseSignupParams.toString()}`;

  // If the logged-in user was redirected here after Google OAuth with autoaccept,
  // attempt to accept the invite automatically and redirect to the assessment.
  useEffect(() => {
    if (!autoAccept || !code) return;

    async function acceptAndRedirect() {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        await supabase
          .from("couple_invites")
          .update({ status: "accepted", partner_id: session.user.id })
          .eq("invite_code", code);

        const { data: inv } = await supabase
          .from("couple_invites")
          .select("inviter_id")
          .eq("invite_code", code)
          .maybeSingle();

        if (inv?.inviter_id) {
          await supabase.from("couples").upsert(
            { user_1_id: inv.inviter_id, user_2_id: session.user.id },
            { onConflict: "user_1_id,user_2_id" }
          );
        }

        // Redirect to assessment or dashboard
        router.push(assessment ? `/assessments/${assessment}` : "/assessments");
      } catch (err) {
        console.warn("Auto-accept error:", err?.message || err);
        router.push(assessment ? `/assessments/${assessment}` : "/assessments");
      }
    }

    acceptAndRedirect();
  }, [autoAccept, code, assessment, router]);

  if (autoAccept) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Linking your profiles…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="hero-shape"
          style={{
            width: "500px", height: "500px",
            background: "linear-gradient(135deg, #f59e0b, #f43f5e)",
            top: "-150px", right: "-100px",
          }}
        />
        <div
          className="hero-shape"
          style={{
            width: "400px", height: "400px",
            background: "linear-gradient(135deg, #3b7bfc, #3a8c69)",
            bottom: "-150px", left: "-100px",
            animationDelay: "2s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <span className="text-6xl block mb-6">💑</span>

        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
          You&apos;ve Been Invited!
        </h1>

        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          {from ? (
            <>
              <strong style={{ color: "var(--foreground)" }}>{decodeURIComponent(from)}</strong>{" "}
              wants to compare personality profiles with you on AptaDuo.
            </>
          ) : (
            "Your partner wants to compare personality profiles with you on AptaDuo."
          )}
        </p>

        {assessment && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(59,123,252,0.1)",
              border: "1px solid rgba(59,123,252,0.2)",
              color: "var(--color-primary-500)",
            }}
          >
            🎯 You&apos;ll start with the <strong className="ml-1">{assessment}</strong> assessment
          </div>
        )}

        <p className="text-xs mb-8" style={{ color: "var(--text-tertiary)" }}>
          {email
            ? `Sign up with ${email} — it's already been verified for you.`
            : "Create a free account, take the assessments, and unlock relationship insights together."}
        </p>

        <div className="flex flex-col gap-3">
          {/* Primary CTA → spouse-specific signup */}
          <Link
            href={spouseSignupUrl}
            className="px-8 py-4 rounded-xl text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            Accept &amp; Create Account →
          </Link>

          {/* Secondary CTA for existing users */}
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(
              assessment ? `/assessments/${assessment}?invite=${code}` : `/couples/join?code=${code}&autoaccept=1`
            )}`}
            className="px-8 py-4 rounded-xl text-base font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            I Already Have an Account
          </Link>
        </div>

        <p className="text-xs mt-8" style={{ color: "var(--text-tertiary)" }}>
          🔒 Your personality data is private. Only comparison results are shared between linked partners.
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
