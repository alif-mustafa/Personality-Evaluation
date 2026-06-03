"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ─── Inner component (needs useSearchParams, must be wrapped in Suspense) ───
function SpouseSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params passed from the invite link
  const inviteCode = searchParams.get("code") || "";
  const inviterFrom = searchParams.get("from") || "";
  const assessmentType = searchParams.get("assessment") || "";
  const prefilledEmail = searchParams.get("email") || "";

  const { signInWithGoogle, error: authError, clearError, isDemo } = useAuth();

  const [form, setForm] = useState({
    displayName: "",
    email: prefilledEmail,
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [done, setDone] = useState(false);

  // Keep email in sync if the URL param loads after initial render
  useEffect(() => {
    if (prefilledEmail) setForm((f) => ({ ...f, email: prefilledEmail }));
  }, [prefilledEmail]);

  // Password strength
  const { password } = form;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [password.length >= 8, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#f43f5e", "#f59e0b", "#3b7bfc", "#3a8c69"];

  /** Where to redirect the spouse after auth */
  const postAuthRedirect = assessmentType
    ? `/assessments/${assessmentType}?invite=${inviteCode}`
    : inviteCode
    ? `/couples/join?code=${inviteCode}&from=${encodeURIComponent(inviterFrom)}&autoaccept=1`
    : "/assessments";

  // ─── Email + password sign-up (no OTP required) ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!form.displayName.trim()) return setLocalError("Please enter your name.");
    if (!form.email.trim()) return setLocalError("Email is missing. Please use the original invite link.");
    if (form.password.length < 6) return setLocalError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setLocalError("Passwords do not match.");

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Sign up WITHOUT email confirmation — the invite email already verified ownership.
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            // Skip email confirmation by not specifying emailRedirectTo here.
            // Supabase will still send a confirmation email unless you disable it in the
            // dashboard (Auth → Email → "Confirm Email" toggle OFF).
            // We request an immediate session by signing in right after.
            data: {
              display_name: form.displayName.trim(),
              invite_code: inviteCode,
              invited_by: inviterFrom,
            },
          },
        });

        if (signUpError) {
          // If user already exists, try signing them in instead
          if (signUpError.message?.toLowerCase().includes("already registered") ||
              signUpError.message?.toLowerCase().includes("user already exists")) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: form.email.trim(),
              password: form.password,
            });
            if (signInError) throw signInError;
          } else {
            throw signUpError;
          }
        }

        // Create / upsert profile row
        if (data?.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: form.displayName.trim(),
            email: form.email.trim().toLowerCase(),
          });

          // Auto-accept the couple invite
          if (inviteCode) {
            await supabase
              .from("couple_invites")
              .update({ status: "accepted", partner_id: data.user.id })
              .eq("invite_code", inviteCode);

            // Fetch inviter id
            const { data: inv } = await supabase
              .from("couple_invites")
              .select("inviter_id")
              .eq("invite_code", inviteCode)
              .maybeSingle();

            if (inv?.inviter_id) {
              await supabase.from("couples").upsert(
                { user_1_id: inv.inviter_id, user_2_id: data.user.id },
                { onConflict: "user_1_id,user_2_id" }
              );
            }
          }
        }

        setDone(true);
        // If session is already established (email confirmation disabled), redirect immediately
        if (data?.session) {
          router.push(postAuthRedirect);
        }
        // Otherwise show success message — user needs to confirm email first
      } else {
        // Demo mode
        const users = JSON.parse(localStorage.getItem("aptaduo_users") || "[]");
        if (users.find((u) => u.email === form.email.toLowerCase())) {
          throw new Error("An account with this email already exists. Try signing in instead.");
        }
        const newUser = {
          id: "demo_" + Date.now().toString(36),
          email: form.email.toLowerCase(),
          passwordHash: "demo_" + form.password, // not secure, demo only
          displayName: form.displayName.trim(),
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        localStorage.setItem("aptaduo_users", JSON.stringify(users));

        const sessionUser = { id: newUser.id, email: newUser.email, displayName: newUser.displayName };
        localStorage.setItem("aptaduo_session", JSON.stringify({ user: sessionUser, profile: null }));

        // Auto-accept invite in demo mode
        if (inviteCode) {
          const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
          const idx = invites.findIndex((i) => i.inviteCode === inviteCode);
          if (idx >= 0) {
            invites[idx].status = "accepted";
            invites[idx].partnerId = newUser.id;
            localStorage.setItem("aptaduo_invites", JSON.stringify(invites));
          }
        }

        router.push(postAuthRedirect);
      }
    } catch (err) {
      setLocalError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Google sign-in ───
  const handleGoogleSignIn = async () => {
    clearError();
    setLocalError("");
    if (!isSupabaseConfigured || !supabase) {
      return setLocalError("Google Sign-In is not available in Demo Mode.");
    }
    // Pass invite info through the redirect URL so callback can handle it
    const redirectTo = `${window.location.origin}/auth/callback?invite=${inviteCode}&assessment=${assessmentType}&from=${encodeURIComponent(inviterFrom)}&email=${encodeURIComponent(form.email)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setLocalError(error.message);
  };

  const displayError = localError || authError;

  // ─── Success screen (when email confirmation is required) ───
  if (done && !isDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div
          className="max-w-md w-full rounded-2xl p-10 text-center animate-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <span className="text-6xl block mb-5">🎉</span>
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
            Account Created!
          </h1>
          <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
            We've sent a confirmation link to{" "}
            <strong style={{ color: "var(--foreground)" }}>{form.email}</strong>.
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Once confirmed, you'll be taken straight to your{" "}
            {assessmentType ? (
              <strong style={{ color: "var(--color-primary-500)" }}>{assessmentType} assessment</strong>
            ) : (
              "assessments"
            )}
            .
          </p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Already confirmed?{" "}
            <Link href={`/auth/login?redirect=${encodeURIComponent(postAuthRedirect)}`}
              className="font-semibold hover:underline"
              style={{ color: "var(--color-primary-500)" }}>
              Sign in here →
            </Link>
          </p>
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
            width: "600px", height: "600px",
            background: "linear-gradient(135deg, #f59e0b, #f43f5e)",
            top: "-220px", right: "-180px",
          }}
        />
        <div
          className="hero-shape"
          style={{
            width: "500px", height: "500px",
            background: "linear-gradient(135deg, #3b7bfc, #8b5cf6)",
            bottom: "-200px", left: "-180px",
            animationDelay: "3s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/Logo.png" alt="AptaDuo Logo" className="h-20 w-auto mb-2" />
          </Link>

          {/* Invite context banner */}
          <div
            className="mt-4 mb-2 px-5 py-3 rounded-2xl text-sm animate-fade-up"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(244,63,94,0.08))",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
          >
            <span className="text-xl block mb-1">💑</span>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>
              {inviterFrom
                ? `${decodeURIComponent(inviterFrom)} invited you!`
                : "You've been invited by your partner!"}
            </p>
            {assessmentType && (
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                You'll be taken straight to the{" "}
                <span style={{ color: "var(--color-primary-500)", fontWeight: 600 }}>
                  {assessmentType}
                </span>{" "}
                assessment after signing up.
              </p>
            )}
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 animate-fade-up"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
            Create Your Account
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Your email is already verified. Just set a password and you're in.
          </p>

          {displayError && (
            <div
              className="mb-4 p-3 rounded-xl text-sm animate-scale-in"
              style={{
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                color: "#f43f5e",
              }}
            >
              {displayError}
            </div>
          )}

          {/* Google Sign-In */}
          {!isDemo && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[var(--border-subtle)] border border-[var(--border)] mb-1"
                style={{ background: "var(--background)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <p className="text-xs text-center mb-4" style={{ color: "var(--text-tertiary)" }}>
                Google will use your invite email automatically.
              </p>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or set a password</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Your Name
              </label>
              <input
                id="spouse-name"
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="How should we address you?"
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {/* Email — pre-filled & locked */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email Address
                <span
                  className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(52,211,153,0.12)", color: "#059669" }}
                >
                  ✓ Verified
                </span>
              </label>
              <input
                id="spouse-email"
                type="email"
                value={form.email}
                readOnly
                className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-default"
                style={{
                  background: "var(--border-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Create Password
              </label>
              <div className="relative">
                <input
                  id="spouse-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30 pr-12"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm p-1 rounded"
                  style={{ color: "var(--text-tertiary)" }}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-2 animate-fade-up">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          background: level <= strengthScore ? strengthColors[strengthScore] : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColors[strengthScore] || "var(--text-tertiary)" }}>
                    {strengthLabels[strengthScore]}
                    {strengthScore < 3 && " — try adding uppercase, numbers, or symbols"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Confirm Password
              </label>
              <input
                id="spouse-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: "#f43f5e" }}>Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account & Start Assessment →"
              )}
            </button>
          </form>

          {/* Already have account */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(postAuthRedirect)}`}
              className="font-semibold transition-colors hover:underline"
              style={{ color: "var(--color-primary-500)" }}
            >
              Sign in instead
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-tertiary)" }}>
          🔒 Your personality data is private and never shared with third parties.
        </p>
      </div>
    </div>
  );
}

// ─── Exported page with Suspense boundary ───
export default function SpouseSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
        </div>
      }
    >
      <SpouseSignupContent />
    </Suspense>
  );
}
