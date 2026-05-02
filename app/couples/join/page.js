"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function JoinContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const from = searchParams.get("from");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-shape" style={{ width: "500px", height: "500px", background: "linear-gradient(135deg, #f59e0b, #f43f5e)", top: "-150px", right: "-100px" }} />
        <div className="hero-shape" style={{ width: "400px", height: "400px", background: "linear-gradient(135deg, #3b7bfc, #3a8c69)", bottom: "-150px", left: "-100px", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <span className="text-6xl block mb-6">💑</span>
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
          You&apos;ve Been Invited!
        </h1>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          {from ? (
            <><strong style={{ color: "var(--foreground)" }}>{decodeURIComponent(from)}</strong> wants to compare personality profiles with you on Lumora.</>
          ) : (
            "Someone wants to compare personality profiles with you on Lumora."
          )}
        </p>
        <p className="text-xs mb-8" style={{ color: "var(--text-tertiary)" }}>
          Create a free account, take the assessments, and unlock relationship insights together.
        </p>

        <div className="flex flex-col gap-3">
          <Link href={`/auth/signup${code ? `?invite=${code}` : ""}`}
            className="px-8 py-4 rounded-xl text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))", boxShadow: "var(--shadow-glow)" }}>
            Accept &amp; Create Account
          </Link>
          <Link href={`/auth/login${code ? `?invite=${code}` : ""}`}
            className="px-8 py-4 rounded-xl text-base font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
