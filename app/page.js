import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="hero-shape"
            style={{
              width: "500px",
              height: "500px",
              background: "linear-gradient(135deg, #3b7bfc, #8b5cf6)",
              top: "-100px",
              right: "-100px",
              animationDelay: "0s",
            }}
          />
          <div
            className="hero-shape"
            style={{
              width: "400px",
              height: "400px",
              background: "linear-gradient(135deg, #3a8c69, #34d399)",
              bottom: "-80px",
              left: "-80px",
              animationDelay: "2s",
            }}
          />
          <div
            className="hero-shape"
            style={{
              width: "300px",
              height: "300px",
              background: "linear-gradient(135deg, #f59e0b, #f43f5e)",
              top: "40%",
              left: "30%",
              animationDelay: "4s",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 pb-16">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-up"
            style={{
              background: "var(--color-primary-500)/10",
              color: "var(--color-primary-500)",
              border: "1px solid var(--color-primary-500)/20",
            }}
          >
            ✦ Science-Backed &amp; Free
          </span>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-up"
            style={{ fontFamily: "var(--font-outfit), sans-serif", animationDelay: "100ms" }}
          >
            Understand Yourself.
            <br />
            <span className="gradient-text">Understand Each Other.</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-up"
            style={{ color: "var(--text-secondary)", animationDelay: "200ms" }}
          >
            Take personality assessments grounded in research. Discover your Big
            Five traits, attachment style, and more — then unlock powerful couple
            insights.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/assessments"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              Start Free Assessment
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/learn"
              className="px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              Learn About Traits
            </Link>
          </div>

          {/* Stats */}
          <div
            className="flex items-center justify-center gap-8 sm:gap-12 animate-fade-up"
            style={{ animationDelay: "400ms" }}
          >
            {[
              { value: "3", label: "Assessments" },
              { value: "100%", label: "Free" },
              { value: "∞", label: "Insights" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span
                  className="text-3xl sm:text-4xl font-bold gradient-text"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs font-medium mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            How It Works
          </h2>
          <p className="text-center mb-16 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Three simple steps to deeper self-understanding and stronger relationships.
          </p>

          <div className="grid md:grid-cols-3 gap-8 stagger">
            {[
              {
                icon: "🧠",
                title: "Take Assessments",
                body: "Complete research-backed questionnaires — Big Five, Attachment Style, and HEXACO — in under 10 minutes each.",
              },
              {
                icon: "📊",
                title: "See Your Profile",
                body: "Visualize your personality traits with interactive radar charts and get personalized, empathetic feedback.",
              },
              {
                icon: "💑",
                title: "Couple Insights",
                body: "Compare profiles with your partner to uncover conflict zones and get attachment-theory-based reframing tools.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <span className="text-4xl block mb-4 transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Preview Cards */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Choose Your Assessment
          </h2>
          <p className="text-center mb-16 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Each assessment is grounded in decades of peer-reviewed personality research.
          </p>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {[
              {
                icon: "🌊",
                title: "Big Five (BFI-44)",
                badge: "44 Questions",
                time: "~8 min",
                body: "The gold standard — measures Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.",
                gradient: "linear-gradient(135deg, #3b7bfc20, #8b5cf620)",
                borderColor: "#3b7bfc",
              },
              {
                icon: "🔗",
                title: "Attachment Style",
                badge: "24 Questions",
                time: "~5 min",
                body: "Discover whether your love patterns lean Secure, Anxious, or Avoidant — and what that means for relationships.",
                gradient: "linear-gradient(135deg, #f59e0b20, #f43f5e20)",
                borderColor: "#f59e0b",
              },
              {
                icon: "💎",
                title: "HEXACO-Lite",
                badge: "20 Questions",
                time: "~4 min",
                body: "Focused on Honesty-Humility and Agreeableness — two powerful predictors of relationship quality.",
                gradient: "linear-gradient(135deg, #8b5cf620, #3a8c6920)",
                borderColor: "#8b5cf6",
              },
            ].map((card, i) => (
              <Link
                key={i}
                href="/assessments"
                className="group block p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{
                  background: card.gradient,
                  border: `1px solid ${card.borderColor}30`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{card.icon}</span>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: `${card.borderColor}15`, color: card.borderColor }}
                  >
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {card.body}
                </p>
                <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                  ⏱ {card.time}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
