"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword, isDemo } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);

  // Supabase appends token hash to the URL — verify it's present
  useEffect(() => {
    // The reset link from Supabase contains a hash fragment with the token.
    // Supabase JS SDK handles it automatically via onAuthStateChange.
    // We just check that we're not in demo mode.
    if (isDemo) setIsValidLink(false);
  }, [isDemo]);

  // Password strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [password.length >= 8, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#f43f5e", "#f59e0b", "#3b7bfc", "#3a8c69"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 3000);
    } else {
      setError(result.error || "Failed to update password. The reset link may have expired. Please request a new one.");
    }
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            Password reset is not available in demo mode.
          </p>
          <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: "var(--color-primary-500)" }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-shape" style={{ width: "600px", height: "600px", background: "linear-gradient(135deg, #3b7bfc, #8b5cf6)", top: "-200px", right: "-200px" }} />
          <div className="hero-shape" style={{ width: "500px", height: "500px", background: "linear-gradient(135deg, #3a8c69, #34d399)", bottom: "-200px", left: "-200px", animationDelay: "3s" }} />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl p-10 animate-scale-in" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(58, 140, 105, 0.12)", border: "1.5px solid rgba(58, 140, 105, 0.3)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a8c69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
              Password Updated!
            </h1>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Your password has been changed successfully. Redirecting you to your dashboard...
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary-500)" }}>
              Go to Dashboard →
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
            Set New Password
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Choose a strong password for your account.
          </p>
        </div>

        <div className="rounded-2xl p-8 animate-fade-up" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm animate-scale-in" style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30 pr-12"
                  style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: "var(--text-tertiary)" }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 animate-fade-up">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: level <= strengthScore ? strengthColors[strengthScore] : "var(--border)" }}
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
                Confirm New Password
              </label>
              <input
                id="reset-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
                style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs mt-1" style={{ color: "#f43f5e" }}>Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))", boxShadow: "var(--shadow-glow)" }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
