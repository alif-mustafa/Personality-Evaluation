"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

/**
 * AssessmentEngine — renders the quiz-taking experience.
 *
 * @param {string} type - Assessment type (bigfive, attachment, hexaco)
 * @param {Object} meta - Assessment metadata
 * @param {Object[]} questions - Question array
 * @param {string} prompt - Question prompt / stem
 * @param {Object[]} likert - Likert scale options
 */
export default function AssessmentEngine({ type, meta, questions, prompt, likert }) {
  const router = useRouter();
  const { saveResults } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isLast = currentIndex === totalQuestions - 1;
  const canGoBack = currentIndex > 0;
  const currentAnswer = responses[currentQuestion.id] ?? null;

  const answeredCount = useMemo(
    () => Object.keys(responses).length,
    [responses]
  );

  const handleSelect = useCallback(
    (value) => {
      setResponses((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));

      // Auto-advance after a short delay
      if (!isLast) {
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
        }, 300);
      }
    },
    [currentQuestion.id, isLast]
  );

  const handlePrev = useCallback(() => {
    if (canGoBack) setCurrentIndex((i) => i - 1);
  }, [canGoBack]);

  const handleNext = useCallback(() => {
    if (currentAnswer != null && !isLast) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentAnswer, isLast]);

  const handleSubmit = useCallback(async () => {
    if (answeredCount < totalQuestions) return;
    setIsSubmitting(true);

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 500));
    saveResults(type, responses);
    router.push(`/results/${type}`);
  }, [answeredCount, totalQuestions, saveResults, type, responses, router]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/assessments")}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors mb-4 flex items-center gap-1"
          >
            ← Back to Assessments
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{meta.icon}</span>
            <h1 className="text-2xl font-bold">{meta.shortTitle}</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">{prompt}</p>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 progress-track h-2">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--text-tertiary)] whitespace-nowrap">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div
          key={currentQuestion.id}
          className="rounded-2xl p-8 mb-6 animate-fade-up"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 block">
            Question {currentIndex + 1}
          </span>
          <h2 className="text-xl font-semibold mb-8 leading-relaxed">
            "{currentQuestion.text}"
          </h2>

          {/* Likert Scale */}
          <div className="flex flex-col gap-2">
            {likert.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`likert-option w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  currentAnswer === option.value ? "selected" : ""
                }`}
                style={{
                  background:
                    currentAnswer === option.value
                      ? "rgba(59, 123, 252, 0.08)"
                      : "var(--surface-elevated)",
                  border: `1.5px solid ${
                    currentAnswer === option.value
                      ? "var(--color-primary-500)"
                      : "var(--border)"
                  }`,
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor:
                        currentAnswer === option.value
                          ? "var(--color-primary-500)"
                          : "var(--border)",
                    }}
                  >
                    {currentAnswer === option.value && (
                      <span
                        className="w-2.5 h-2.5 rounded-full animate-scale-in"
                        style={{ background: "var(--color-primary-500)" }}
                      />
                    )}
                  </span>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={!canGoBack}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              canGoBack
                ? "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
                : "text-[var(--text-tertiary)] cursor-not-allowed opacity-50"
            }`}
          >
            ← Previous
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions || isSubmitting}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                answeredCount >= totalQuestions && !isSubmitting
                  ? "bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-md hover:shadow-lg"
                  : "bg-[var(--border)] text-[var(--text-tertiary)] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating...
                </span>
              ) : (
                `See Results (${answeredCount}/${totalQuestions})`
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentAnswer == null}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentAnswer != null
                  ? "text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/10"
                  : "text-[var(--text-tertiary)] cursor-not-allowed opacity-50"
              }`}
            >
              Next →
            </button>
          )}
        </div>

        {/* Answered indicator */}
        <div className="mt-8 flex flex-wrap gap-1.5 justify-center">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className="w-3 h-3 rounded-full transition-all duration-200 hover:scale-125"
              style={{
                background:
                  responses[q.id] != null
                    ? "var(--color-primary-500)"
                    : i === currentIndex
                    ? "var(--text-tertiary)"
                    : "var(--border)",
                boxShadow:
                  i === currentIndex ? "0 0 0 3px var(--color-primary-500)/20" : "none",
              }}
              title={`Question ${i + 1}${responses[q.id] != null ? " ✓" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
