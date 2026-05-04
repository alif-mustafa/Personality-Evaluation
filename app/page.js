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

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 pb-4">


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
            Every couple argues. But most arguments aren't really about the dishes, the silence, or the plans that changed. They're about two different people seeing the world differently. Lumora gently shows you why - and helps you find the light in each other.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-fade-up"
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

          </div>


        </div>
      </section>

      {/* How It Works */}
      <section className="pt-12 pb-24 px-4" style={{ background: "var(--surface)" }}>
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


    </>
  );
}
