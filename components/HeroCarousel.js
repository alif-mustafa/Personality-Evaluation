"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  {
    src: "/hero_couple.png",
    alt: "A couple on a sofa — she's on her phone while he tries to connect",
    card1: {
      icon: "💬",
      label: "Her Attachment Style",
      value: "Anxious",
      pct: 38,
      color: "#f97b6b",
    },
    card2: {
      icon: "🧠",
      label: "His Attachment Style",
      value: "Secure",
      pct: 78,
      color: "#7c6af7",
    },
  },
  {
    src: "/couple_2.png",
    alt: "Two women at a kitchen table — one reaching out, the other withdrawn",
    card1: {
      icon: "💝",
      label: "Her Love Language",
      value: "Quality Time",
      pct: 85,
      color: "#7c6af7",
    },
    card2: {
      icon: "🌟",
      label: "Her Love Language",
      value: "Acts of Service",
      pct: 60,
      color: "#f97b6b",
    },
  },
  {
    src: "/couple_3.png",
    alt: "Two men — one comforting the other who is stressed",
    card1: {
      icon: "🤝",
      label: "His Conflict Style",
      value: "Validator",
      pct: 74,
      color: "#7c6af7",
    },
    card2: {
      icon: "🌱",
      label: "His Big Five",
      value: "High Empathy",
      pct: 88,
      color: "#10b981",
    },
  },
  {
    src: "/couple_4.png",
    alt: "An Asian couple — one on their phone, the other feeling distant",
    card1: {
      icon: "💬",
      label: "Her Attachment Style",
      value: "Dismissive",
      pct: 30,
      color: "#f97b6b",
    },
    card2: {
      icon: "💝",
      label: "His Love Language",
      value: "Quality Time",
      pct: 90,
      color: "#7c6af7",
    },
  },
  {
    src: "/couple_5.png",
    alt: "An older couple on a porch — talking, laughing, holding hands",
    card1: {
      icon: "🕊️",
      label: "Her Conflict Style",
      value: "Validator",
      pct: 82,
      color: "#7c6af7",
    },
    card2: {
      icon: "🧠",
      label: "His Big Five",
      value: "High Openness",
      pct: 76,
      color: "#f59e0b",
    },
  },
];

function InsightCard({ card, side }) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute px-4 py-3 rounded-2xl shadow-xl"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(124,106,247,0.15)",
        backdropFilter: "blur(12px)",
        minWidth: 170,
        bottom: "6rem",
        ...(isLeft ? { left: "-0.5rem" } : { right: "-0.5rem" }),
        zIndex: 10,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: 15 }}>{card.icon}</span>
        <span className="text-xs font-semibold" style={{ color: "#1e1b4b", whiteSpace: "nowrap" }}>
          {card.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(124,106,247,0.12)" }}>
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
        <span className="text-xs font-bold whitespace-nowrap" style={{ color: card.color }}>
          {card.value}
        </span>
      </div>
    </div>
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

  // Auto-rotate — resets whenever current changes (so manual nav restarts the 7s timer)
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
    <div className="relative" style={{ width: 500, height: 560 }}>

      {/* ── Circular image frame — image fills the full circle ── */}
      <div
        className="absolute"
        style={{
          width: 440,
          height: 440,
          borderRadius: "50%",
          overflow: "hidden",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(145deg, rgba(124,106,247,0.08) 0%, rgba(249,123,107,0.08) 100%)",
        }}
      >
        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.35s ease",
            width: "100%",
            height: "100%",
            position: "relative",
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

      {/* ── Subtle left arrow ── */}
      <button
        onClick={() => goTo(current - 1)}
        aria-label="Previous"
        style={{
          position: "absolute",
          top: "calc(20px + 220px)",
          left: 0,
          transform: "translateY(-50%)",
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(124,106,247,0.18)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          zIndex: 20,
          transition: "background 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,106,247,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.72)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* ── Subtle right arrow ── */}
      <button
        onClick={() => goTo(current + 1)}
        aria-label="Next"
        style={{
          position: "absolute",
          top: "calc(20px + 220px)",
          right: 0,
          transform: "translateY(-50%)",
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(124,106,247,0.18)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          zIndex: 20,
          transition: "background 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,106,247,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.72)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* ── Floating insight cards ── */}
      <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }}>
        <InsightCard card={slide.card1} side="left" />
        <InsightCard card={slide.card2} side="right" />
      </div>

      {/* ── Dot indicators ── */}
      <div
        className="absolute flex gap-2 justify-center"
        style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
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
