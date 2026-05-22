"use client";

import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
import { useAuth } from "@/lib/auth-context";

const steps = [
  {
    step: "01",
    img: "/icon_brain.png",
    title: "Take Assessments",
    body: "Complete research-backed questionnaires — Core Personality, Attachment Style, Love Languages, and Gottman Conflict Styles — in under 10 minutes each.",
    accent: "var(--color-primary-500)",
    accentBg: "rgba(124,106,247,0.08)",
  },
  {
    step: "02",
    img: "/icon_chart.png",
    title: "See Your Profile",
    body: "Visualize your personality traits with interactive radar charts and get personalized, empathetic feedback grounded in real psychology.",
    accent: "#a78bfa",
    accentBg: "rgba(167,139,250,0.08)",
  },
  {
    step: "03",
    img: "/icon_couple.png",
    title: "Couple Insights",
    body: "Compare profiles with your partner to uncover how you complement each other — and get science-based tools to navigate your differences.",
    accent: "var(--color-sage-500)",
    accentBg: "rgba(249,123,107,0.08)",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Ambient background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-shape" style={{ width: "300px", height: "300px", background: "linear-gradient(135deg, #7c6af7, #818cf8)", top: "-80px", right: "-80px", animationDelay: "0s" }} />
          <div className="hero-shape" style={{ width: "250px", height: "250px", background: "linear-gradient(135deg, #f97b6b, #fb7185)", bottom: "-60px", left: "-60px", animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 lg:py-20">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            <h1
              className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.15] mb-6 animate-fade-up tracking-tight"
              style={{ fontFamily: "var(--font-outfit), sans-serif", animationDelay: "100ms" }}
            >
              <span className="block">Understand Yourself,</span>
              <span className="block gradient-text">Understand Each Other.</span>
            </h1>

            <p
              className="text-base sm:text-lg max-w-xl mb-8 animate-fade-up leading-relaxed mx-auto lg:mx-0"
              style={{ color: "var(--text-secondary)", animationDelay: "200ms" }}
            >
              Every couple argues. But most arguments aren&apos;t really about the dishes, the silence, or the plans that changed. They&apos;re about two different people seeing the world differently. AptaDuo gently shows you why, and helps you find the light in each other.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-10 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <Link
                href="/assessments"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                Start Free Assessment
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              {!user && (
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    background: "var(--surface)",
                  }}
                >
                  Create Free Account
                </Link>
              )}
            </div>

          </div>

          {/* Right — rotating illustration carousel */}
          <div className="flex justify-center items-center animate-fade-up" style={{ animationDelay: "200ms" }}>
            <HeroCarousel />
          </div>

        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              How It Works
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Three simple steps to deeper self-understanding and stronger relationships.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-6">
            {/* Connector line — desktop only */}
            <div
              className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)]"
              style={{ height: "2px", background: "linear-gradient(90deg, rgba(124,106,247,0.3), rgba(249,123,107,0.3))" }}
            />

            {steps.map((item) => (
              <div
                key={item.step}
                className="relative group p-5 sm:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {/* Illustration icon + step number */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: item.accentBg, border: `1px solid ${item.accent}20` }}
                  >
                    <Image src={item.img} alt={item.title} width={56} height={56} className="object-contain p-2" />
                  </div>
                  <span
                    className="text-2xl font-extrabold"
                    style={{ color: item.accent, opacity: 0.25, fontFamily: "var(--font-outfit)" }}
                  >
                    {item.step}
                  </span>
                </div>

                {/* Accent bar */}
                <div
                  className="h-0.5 w-10 rounded-full mb-5 transition-all duration-300 group-hover:w-16"
                  style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }}
                />

                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
