"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { TRAIT_CARDS, generateGrowthTips } from "@/lib/education";

export default function LearnPage() {
  const { results, isLoaded } = useApp();
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const growthTips = isLoaded ? generateGrowthTips(results) : [];
  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Learn About Personality
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Understand your traits in plain language with interactive cards and
            personalized growth tips.
          </p>
        </div>

        {/* Trait Cards */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            🃏 Trait Cards
            <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--border-subtle)", color: "var(--text-tertiary)" }}>
              Click to flip
            </span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {TRAIT_CARDS.map((card) => {
              const isFlipped = flippedCards[card.id];
              return (
                <div
                  key={card.id}
                  className="trait-card-flip cursor-pointer"
                  style={{ minHeight: "280px" }}
                  onClick={() => toggleFlip(card.id)}
                >
                  <div
                    className={`trait-card-inner relative w-full h-full ${
                      isFlipped ? "flipped" : ""
                    }`}
                    style={{ minHeight: "280px" }}
                  >
                    {/* FRONT */}
                    <div
                      className="trait-card-front absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
                      style={{
                        background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
                        border: `1px solid ${card.color}25`,
                      }}
                    >
                      <div>
                        <span className="text-4xl block mb-3">{card.emoji}</span>
                        <h3 className="text-base font-bold mb-2">{card.trait}</h3>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {card.front}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: `${card.color}15`,
                            color: card.color,
                          }}
                        >
                          {card.source}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          Tap to learn more →
                        </span>
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      className="trait-card-back absolute inset-0 rounded-2xl p-6 flex flex-col justify-between overflow-auto"
                      style={{
                        background: "var(--surface)",
                        border: `1px solid ${card.color}30`,
                        boxShadow: `0 0 20px ${card.color}10`,
                      }}
                    >
                      <div>
                        <h3
                          className="text-sm font-bold mb-3"
                          style={{ color: card.color }}
                        >
                          {card.trait}
                        </h3>
                        <p
                          className="text-xs leading-relaxed mb-4"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {card.back}
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          background: `${card.color}08`,
                          borderLeft: `3px solid ${card.color}`,
                        }}
                      >
                        <p
                          className="text-xs font-semibold mb-0.5"
                          style={{ color: card.color }}
                        >
                          🧠 Fun Fact
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {card.funFact}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Growth Tips */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            🌱 Your Growth Tips
          </h2>

          {growthTips.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4 stagger">
              {growthTips.map((tip, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{tip.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                        {tip.category}
                      </p>
                      <p className="text-sm font-semibold">{tip.trait}</p>
                    </div>
                    {tip.score != null && (
                      <span
                        className="ml-auto text-lg font-bold gradient-text"
                      >
                        {tip.score}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {tip.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-4xl block mb-3">🌱</span>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Complete at least one assessment to receive personalized growth
                tips based on your highest and lowest scoring traits.
              </p>
              <a
                href="/assessments"
                className="inline-flex px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                }}
              >
                Take an Assessment
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
