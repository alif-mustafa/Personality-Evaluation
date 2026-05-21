"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  {
    src: "/hero_couple.png",
    alt: "A couple on a sofa — she's on her phone while he tries to connect",
    card1: { icon: "💬", label: "Her Attachment Style", value: "Anxious", pct: 38, color: "#f97b6b" },
    card2: { icon: "🧠", label: "His Attachment Style", value: "Secure", pct: 78, color: "#7c6af7" },
  },
  {
    src: "/couple_2.png",
    alt: "Two women at a kitchen table — one reaching out, the other withdrawn",
    card1: { icon: "💝", label: "Her Love Language", value: "Quality Time", pct: 85, color: "#7c6af7" },
    card2: { icon: "🌟", label: "Her Love Language", value: "Acts of Service", pct: 60, color: "#f97b6b" },
  },
  {
    src: "/couple_3.png",
    alt: "Two men — one comforting the other who is stressed",
    card1: { icon: "🤝", label: "His Conflict Style", value: "Validator", pct: 74, color: "#7c6af7" },
    card2: { icon: "🌱", label: "His Big Five", value: "High Empathy", pct: 88, color: "#10b981" },
  },
  {
    src: "/couple_4.png",
    alt: "An Asian couple — one on their phone, the other feeling distant",
    card1: { icon: "💬", label: "Her Attachment Style", value: "Dismissive", pct: 30, color: "#f97b6b" },
    card2: { icon: "💝", label: "His Love Language", value: "Quality Time", pct: 90, color: "#7c6af7" },
  },
  {
    src: "/couple_5.png",
    alt: "An older couple on a porch — talking, laughing, holding hands",
    card1: { icon: "🕊️", label: "Her Conflict Style", value: "Validator", pct: 82, color: "#7c6af7" },
    card2: { icon: "🧠", label: "His Big Five", value: "High Openness", pct: 76, color: "#f59e0b" },
  },
];

function InsightCard({ card, side }) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute px-3 py-2.5 rounded-2xl shadow-xl"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(124,106,247,0.15)",
        backdropFilter: "blur(12px)",
        minWidth: 140,
        maxWidth: 175,
        bottom: "5.5rem",
        ...(isLeft ? { left: "-0.25rem" } : { right: "-0.25rem" }),
        zIndex: 10,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ fontSize: 13 }}>{card.icon}</span>
        <span className="text-xs font-semibold leading-tight" style={{ color: "#1e1b4b" }}>
          {card.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div style={{ flex: 1, height: 4, borderRadius: 99, background: "rgba(124,106,247,0.12)" }}>
          <div
            style={{
              width: `${card.pct}%`,
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg, ${card.color}, ${card.color}cc)`,
              transition: "width 0.8s ease",
            }}
          />
        </div>
        <span className="text-xs font-bold whitespace-nowrap" style={{ color: card.color, fontSize: 11 }}>
          {card.value}
        </span>
      </div>
    </div>
  );
}

function ArrowButton({ onClick, direction, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="absolute z-20 flex items-center justify-center"
      style={{
        top: "50%",
        ...(direction === "left" ? { left: 0 } : { right: 0 }),
        transform: "translateY(-100%)",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(124,106,247,0.18)",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        transition: "background 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.95)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,106,247,0.18)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.72)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)";
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "left"
          ? <path d="M15 18l-6-6 6-6" />
          : <path d="M9 18l6-6-6-6" />
        }
      </svg>
    </button>
  );
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = useCallback((index) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(((index % slides.length) + slides.length) % slides.length);
      setVisible(true);
    }, 350);
  }, []);

  // Auto-rotate — restarts whenever current changes (so manual nav resets the 7s timer)
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 350);
    }, 7000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    // w-full on mobile, fixed 500px on desktop
    <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[500px] mx-auto" style={{ paddingBottom: "120px" }}>

      {/* ── Circular image frame ── */}
      <div
        className="relative mx-auto"
        style={{
          width: "100%",
          paddingBottom: "100%", // 1:1 aspect ratio trick
          borderRadius: "50%",
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(124,106,247,0.08) 0%, rgba(249,123,107,0.08) 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={current === 0}
          />
        </div>
      </div>

      {/* ── Left arrow ── */}
      <ArrowButton onClick={() => goTo(current - 1)} direction="left" label="Previous slide" />

      {/* ── Right arrow ── */}
      <ArrowButton onClick={() => goTo(current + 1)} direction="right" label="Next slide" />

      {/* ── Floating insight cards ── */}
      <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }}>
        <InsightCard card={slide.card1} side="left" />
        <InsightCard card={slide.card2} side="right" />
      </div>

      {/* ── Dot indicators ── */}
      <div
        className="absolute flex gap-2 justify-center"
        style={{ bottom: "2rem", left: "50%", transform: "translateX(-50%)" }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              borderRadius: 99,
              background: i === current
                ? "linear-gradient(90deg, #7c6af7, #f97b6b)"
                : "rgba(124,106,247,0.25)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

    </div>
  );
}
