"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error, clearError, isDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email.trim()) return setLocalError("Please enter your email.");
    if (!password) return setLocalError("Please enter your password.");
    if (password.length < 6) return setLocalError("Password must be at least 6 characters.");

    setIsSubmitting(true);
    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setLocalError(result.error || "Login failed. Please try again.");
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="hero-shape"
          style={{
            width: "600px", height: "600px",
            background: "linear-gradient(135deg, #3b7bfc, #8b5cf6)",
            top: "-200px", right: "-200px",
          }}
        />
        <div
          className="hero-shape"
          style={{
            width: "500px", height: "500px",
            background: "linear-gradient(135deg, #3a8c69, #34d399)",
            bottom: "-200px", left: "-200px",
            animationDelay: "3s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">◎</span>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
              Persona<span className="gradient-text">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
            Welcome Back
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to continue your personality journey
          </p>
        </div>

        {/* Demo mode banner */}
        {isDemo && (
          <div
            className="mb-6 p-3 rounded-xl text-center text-xs animate-fade-up"
            style={{
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.2)",
              color: "#d97706",
            }}
          >
            🧪 <strong>Demo Mode</strong> — Supabase not configured. Data is stored locally in your browser.
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
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

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold transition-colors hover:underline"
              style={{ color: "var(--color-primary-500)" }}
            >
              Create one — it&apos;s free
            </Link>
          </p>
        </form>

        {/* Security note */}
        <p className="text-center text-xs mt-6" style={{ color: "var(--text-tertiary)" }}>
          🔒 Your data is encrypted and never shared. PersonaLink is not a diagnostic tool.
        </p>
      </div>
    </div>
  );
}
