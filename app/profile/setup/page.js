"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const GENDER_OPTIONS = [
  { value: "male", label: "Male", icon: "♂️" },
  { value: "female", label: "Female", icon: "♀️" },
  { value: "non-binary", label: "Non-binary", icon: "⚧️" },
  { value: "prefer-not-to-say", label: "Prefer not to say", icon: "🤐" },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, saveProfile, profile } = useAuth();
  const [age, setAge] = useState(profile?.age || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return setError("Please enter a valid age (13–120).");
    }
    if (!gender) {
      return setError("Please select a gender option.");
    }

    setIsSubmitting(true);
    const result = await saveProfile({
      displayName: user?.displayName || "",
      age: ageNum,
      gender,
    });
    setIsSubmitting(false);

    if (result.success) {
      router.push("/assessments");
    } else {
      setError(result.error || "Failed to save profile.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="hero-shape"
          style={{
            width: "500px", height: "500px",
            background: "linear-gradient(135deg, #8b5cf6, #3b7bfc)",
            top: "-150px", right: "-100px",
          }}
        />
        <div
          className="hero-shape"
          style={{
            width: "400px", height: "400px",
            background: "linear-gradient(135deg, #f59e0b, #f43f5e)",
            bottom: "-150px", left: "-100px",
            animationDelay: "2s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">👤</span>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Before We Begin
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            We need a couple of details to personalize your experience.
            <br />
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              This information helps us provide more accurate context for your results.
            </span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 animate-fade-up"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {error && (
            <div
              className="mb-6 p-3 rounded-xl text-sm animate-scale-in"
              style={{
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                color: "#f43f5e",
              }}
            >
              {error}
            </div>
          )}

          {/* Age */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Your Age
            </label>
            <input
              id="profile-age"
              type="number"
              min="13"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 25"
              className="w-full px-4 py-3.5 rounded-xl text-base outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary-500)]/30"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
              You must be at least 13 years old to use PersonaLink.
            </p>
          </div>

          {/* Gender */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
                    gender === option.value ? "selected" : ""
                  }`}
                  style={{
                    background:
                      gender === option.value
                        ? "rgba(59, 123, 252, 0.08)"
                        : "var(--background)",
                    border: `1.5px solid ${
                      gender === option.value
                        ? "var(--color-primary-500)"
                        : "var(--border)"
                    }`,
                    boxShadow:
                      gender === option.value
                        ? "0 0 0 3px rgba(59, 123, 252, 0.1)"
                        : "none",
                  }}
                >
                  <span className="text-xl block mb-1">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div
            className="mb-6 p-3 rounded-xl flex items-start gap-3"
            style={{
              background: "var(--color-sage-500)/6",
              border: "1px solid var(--color-sage-500)/15",
            }}
          >
            <span className="text-lg">🔒</span>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Your age and gender are used only to contextualize your personality
              feedback. They are never shared and you can update them anytime in
              your profile settings.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Continue to Assessments →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
