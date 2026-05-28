"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ForgotPasswordPage() {
  const { resetPassword, isDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return setError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return setError("Please enter a valid email address.");

    setIsSubmitting(true);

    try {
      // Step 1: Check if email exists in the DB
      const checkRes = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const checkData = await checkRes.json();

      if (!checkRes.ok) throw new Error(checkData.error || "Server error.");

      if (!checkData.exists) {
        setError("This email address is not registered. Please check the email or create a new account.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Email exists — trigger password reset email
      const result = await resetPassword(trimmed);
      if (!result.success) throw new Error(result.error);

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-shape" style={{ width: "600px", height: "600px", background: "linear-gradient(135deg, #3b7bfc, #8b5cf6)", top: "-200px", right: "-200px" }} />
          <div className="hero-shape" style={{ width: "500px", height: "500px", background: "linear-gradient(135deg, #3a8c69, #34d399)", bottom: "-200px", left: "-200px", animationDelay: "3s" }} />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div
            className="rounded-2xl p-10 animate-scale-in"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(58, 140, 105, 0.12)", border: "1.5px solid rgba(58, 140, 105, 0.3)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8c69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
              Check Your Email
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              We&apos;ve sent a password reset link to{" "}
              <strong style={{ color: "var(--foreground)" }}>{email}</strong>.
              Click the link in the email to set a new password.
            </p>
            <p className="text-xs mb-6" style={{ color: "var(--text-tertiary)" }}>
              Didn&apos;t receive it? Check your spam folder, or{" "}
              <button
                onClick={() => { setSuccess(false); setError(""); }}
                className="font-semibold hover:underline"
                style={{ color: "var(--color-primary-500)" }}
              >
                try again
              </button>.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-shape" style={{ width: "600px", height: "600px", background: "linear-gradient(135deg, #3b7bfc, #8b5cf6)", top: "-200px", right: "-200px" }} />
        <div className="hero-shape" style={{ width: "500px", height: "500px", background: "linear-gradient(135deg, #3a8c69, #34d399)", bottom: "-200px", left: "-200px", animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/Logo.png" alt="AptaDuo Logo" className="h-24 w-auto mb-2" />
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
            Forgot Your Password?
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {isDemo && (
          <div className="mb-6 p-3 rounded-xl text-center text-xs" style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.2)", color: "#d97706" }}>
            🧪 <strong>Demo Mode</strong> — Password reset is not available in demo mode.
          </div>
        )}

        <div
          className="rounded-2xl p-8 animate-fade-up"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm animate-scale-in" style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isDemo}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30 disabled:opacity-50"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isDemo}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))", boxShadow: "var(--shadow-glow)" }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            Remembered it?{" "}
            <Link href="/auth/login" className="font-semibold transition-colors hover:underline" style={{ color: "var(--color-primary-500)" }}>
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-tertiary)" }}>
          🔒 Your data is encrypted and never shared. AptaDuo is not a diagnostic tool.
        </p>
      </div>
    </div>
  );
}
