"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── Inner component needs useSearchParams → wrap in Suspense ───
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteCode = searchParams.get("invite") || "";
  const assessmentType = searchParams.get("assessment") || "";
  const inviterFrom = searchParams.get("from") || "";
  const partnerEmail = searchParams.get("email") || "";

  /** Build the redirect URL for the spouse after they are authenticated */
  function buildRedirectUrl() {
    if (assessmentType) {
      return inviteCode
        ? `/assessments/${assessmentType}?invite=${inviteCode}`
        : `/assessments/${assessmentType}`;
    }
    if (inviteCode) {
      return `/couples/join?code=${inviteCode}&from=${encodeURIComponent(inviterFrom)}&autoaccept=1`;
    }
    return "/dashboard";
  }

  useEffect(() => {
    async function handleCallback() {
      try {
        // Wait for Supabase to pick up the token from the URL hash/query
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await finalizeAndRedirect(session);
          return;
        }

        // Subscribe to auth state changes — covers the OAuth redirect case
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session) {
              await finalizeAndRedirect(session);
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Callback error:", err);
        router.push("/dashboard");
      }
    }

    async function finalizeAndRedirect(session) {
      // If this was a spouse Google sign-in with an invite code, auto-accept the invite
      if (inviteCode && session?.user) {
        try {
          await supabase
            .from("couple_invites")
            .update({ status: "accepted", partner_id: session.user.id })
            .eq("invite_code", inviteCode);

          const { data: inv } = await supabase
            .from("couple_invites")
            .select("inviter_id")
            .eq("invite_code", inviteCode)
            .maybeSingle();

          if (inv?.inviter_id) {
            await supabase.from("couples").upsert(
              { user_1_id: inv.inviter_id, user_2_id: session.user.id },
              { onConflict: "user_1_id,user_2_id" }
            );
          }
        } catch (err) {
          console.warn("Invite auto-accept warning:", err?.message || err);
          // Non-fatal — continue to redirect
        }
      }

      router.push(buildRedirectUrl());
    }

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--color-sage-500)]/30 border-t-[var(--color-sage-500)] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
          Completing sign in…
        </p>
        {assessmentType && (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            You'll be taken to your{" "}
            <span style={{ color: "var(--color-primary-500)", fontWeight: 600 }}>
              {assessmentType}
            </span>{" "}
            assessment in a moment.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--color-sage-500)]/30 border-t-[var(--color-sage-500)] rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
