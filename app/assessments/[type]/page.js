"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AssessmentEngine from "@/components/AssessmentEngine";
import { getAssessment } from "@/lib/assessments";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function AssessmentPage({ params }) {
  const { type } = use(params);
  const router = useRouter();
  const { user, hasProfile, loading } = useAuth();
  const assessment = getAssessment(type);

  // Redirect to profile setup if not completed
  useEffect(() => {
    if (!loading && user && !hasProfile) {
      router.push("/profile/setup");
    }
  }, [loading, user, hasProfile, router]);

  if (!assessment) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <span className="text-5xl block mb-4">❓</span>
          <h1 className="text-2xl font-bold mb-2">Assessment Not Found</h1>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            The assessment you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/assessments"
            className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
            }}
          >
            View All Assessments
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, prompt to log in or continue as guest
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto text-center pt-16">
          <span className="text-5xl block mb-4">🔐</span>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Create an Account First
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Sign up to save your results, track progress, and compare with a partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
              }}
            >
              Sign Up Free
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-xl text-sm font-medium"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If logged in but no profile, redirect happens via useEffect
  if (!hasProfile) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary-500)]/30 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AssessmentEngine
      type={type}
      meta={assessment.meta}
      questions={assessment.questions}
      prompt={assessment.prompt}
      likert={assessment.likert}
    />
  );
}
