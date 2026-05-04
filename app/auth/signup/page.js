"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, verifyOtp, loading, error, clearError, isDemo } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Password strength
  const passwordLength = form.password.length;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
  const strengthScore = [passwordLength >= 8, hasUppercase, hasNumber, hasSpecial].filter(
    Boolean
  ).length;
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#f43f5e", "#f59e0b", "#3b7bfc", "#3a8c69"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    // Validation
    if (!form.displayName.trim()) return setLocalError("Please enter your name.");
    if (!form.email.trim()) return setLocalError("Please enter your email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setLocalError("Please enter a valid email address.");
    if (form.password.length < 6)
      return setLocalError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword)
      return setLocalError("Passwords do not match.");

    setIsSubmitting(true);
    const result = await signUp(form.email.trim(), form.password, form.displayName.trim());
    setIsSubmitting(false);

    if (result.success) {
      if (result.needsConfirmation) {
        setSuccess(true);
      } else {
        router.push("/profile/setup");
      }
    } else {
      const errorMsg = result.error || "Registration failed. Please try again.";
      setLocalError(errorMsg);
      alert("Sign-up Error: " + errorMsg);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return setLocalError("Please enter the 6-digit code.");
    
    setIsVerifying(true);
    const result = await verifyOtp(form.email.trim(), otp);
    setIsVerifying(false);

    if (result.success) {
      router.push("/profile/setup");
    } else {
      setLocalError(result.error || "Verification failed. Please check the code.");
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    const result = await signInWithGoogle();
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const displayError = localError || error;

  // OTP Verification view
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center animate-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <span className="text-5xl block mb-4">📩</span>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Verify Your Email
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            We&apos;ve sent a verification code to{" "}
            <strong style={{ color: "var(--foreground)" }}>{form.email}</strong>.
            Please enter it below to activate your account.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {displayError && (
              <div className="p-3 rounded-xl text-sm mb-4" style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e" }}>
                {displayError}
              </div>
            )}
            
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] rounded-xl outline-none border focus:ring-2 focus:ring-[var(--color-sage-500)]/30 transition-all"
              style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />

            <button
              type="submit"
              disabled={isVerifying || otp.length < 6}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--color-sage-500), var(--color-sage-600))" }}
            >
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>

          <button 
            onClick={() => setSuccess(false)}
            className="mt-6 text-sm font-medium transition-colors hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back to signup
          </button>
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
            background: "linear-gradient(135deg, #3a8c69, #34d399)",
            top: "-200px", left: "-200px",
          }}
        />
        <div
          className="hero-shape"
          style={{
            width: "500px", height: "500px",
            background: "linear-gradient(135deg, #8b5cf6, #3b7bfc)",
            bottom: "-200px", right: "-200px",
            animationDelay: "3s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/Logo.png" alt="Lumora Logo" className="h-24 w-auto mb-2" />

          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
            Create Your Account
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Free forever. Discover your personality in minutes.
          </p>
        </div>

        {isDemo && (
          <div
            className="mb-6 p-3 rounded-xl text-center text-xs animate-fade-up"
            style={{
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              color: "#d97706",
            }}
          >
            🧪 <strong>Demo Mode</strong> — Data stored locally. No email verification required.
          </div>
        )}

        {/* Signup Form */}
        <div
          className="rounded-2xl p-8 animate-fade-up"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
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

          {/* Google Button */}
          {!isDemo && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[var(--border-subtle)] border border-[var(--border)]"
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

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or sign up with email</span>
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
                id="signup-name"
                type="text"
                value={form.displayName}
                onChange={update("displayName")}
                placeholder="How should we address you?"
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-sage-500)]/30"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-sage-500)]/30"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-sage-500)]/30 pr-12"
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

              {/* Password strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2 animate-fade-up">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            level <= strengthScore
                              ? strengthColors[strengthScore]
                              : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: strengthColors[strengthScore] || "var(--text-tertiary)" }}
                  >
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
                id="signup-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-sage-500)]/30"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: "#f43f5e" }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: "linear-gradient(135deg, var(--color-sage-500), var(--color-sage-600))",
                boxShadow: "0 0 30px rgba(58, 140, 105, 0.15)",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold transition-colors hover:underline"
              style={{ color: "var(--color-primary-500)" }}
            >
              Sign in
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
