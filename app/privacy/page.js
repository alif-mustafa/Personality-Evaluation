import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — AptaDuo",
  description: "How AptaDuo collects, uses, and protects your personal information and assessment data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm mb-8 transition-colors hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to home
          </Link>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-outfit)" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Last updated: May 2026</p>
        </div>

        {/* Privacy shield callout */}
        <div
          className="p-6 rounded-2xl mb-10 flex gap-4"
          style={{ background: "rgba(124,106,247,0.06)", border: "1px solid rgba(124,106,247,0.2)" }}
        >
          <div className="text-3xl">🔒</div>
          <div>
            <p className="font-semibold mb-1">Your privacy is our priority</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              AptaDuo is built on a simple principle: your psychological assessment results are deeply personal. We will never sell, share, or monetize your personal data. This policy explains exactly what we collect, why we collect it, and how it is protected.
            </p>
          </div>
        </div>

        <div className="prose-like space-y-10" style={{ color: "var(--foreground)" }}>
          <Section title="1. Who We Are">
            <p>
              AptaDuo (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a relationship psychology platform operated at{" "}
              <a href="https://aptaduo.com" className="underline" style={{ color: "var(--color-primary-500)" }}>aptaduo.com</a>.
              Our mission is to help couples and individuals develop self-awareness through validated psychological assessments.
            </p>
            <p>
              For privacy-related questions, contact us at:{" "}
              <a href="mailto:aptaduo@gmail.com" className="underline" style={{ color: "var(--color-primary-500)" }}>aptaduo@gmail.com</a>
            </p>
          </Section>

          <Section title="2. What Data We Collect">
            <p>We collect the minimum data necessary to provide our service:</p>
            <ul className="space-y-3 mt-3">
              <Li icon="👤"><strong>Account Information:</strong> Your email address and display name when you register. If you sign in with Google, we receive your name and email from Google.</Li>
              <Li icon="📝"><strong>Assessment Responses:</strong> Your answers to personality questionnaires. These are stored securely and are only accessible by you and, if you choose, your invited partner.</Li>
              <Li icon="👥"><strong>Profile Information:</strong> Optional information such as your age range and gender, which are used solely to provide more relevant assessment context.</Li>
              <Li icon="📧"><strong>Partner Invitation:</strong> If you invite a partner, we store their email address to send a one-time invitation. We do not add them to any mailing list.</Li>
              <Li icon="🌐"><strong>Technical Data:</strong> Standard server logs (IP address, browser type, timestamps) for security and debugging purposes. These are not linked to your identity.</Li>
            </ul>
          </Section>

          <Section title="3. What We Do NOT Collect">
            <ul className="space-y-2 mt-2">
              <Li icon="🚫">We do not collect payment information (the service is free).</Li>
              <Li icon="🚫">We do not use advertising trackers or sell data to advertisers.</Li>
              <Li icon="🚫">We do not build behavioral profiles for resale.</Li>
              <Li icon="🚫">We do not share your assessment results with any third party without your explicit consent.</Li>
            </ul>
          </Section>

          <Section title="4. How We Use Your Data">
            <p>We use your data <strong>only</strong> to:</p>
            <ul className="space-y-2 mt-2">
              <Li icon="✅">Provide the assessment and personality insights service.</Li>
              <Li icon="✅">Enable the couple comparison feature when both partners have consented.</Li>
              <Li icon="✅">Send transactional emails (partner invitations, password resets).</Li>
              <Li icon="✅">Improve the product based on aggregated, anonymized usage patterns.</Li>
            </ul>
          </Section>

          <Section title="5. Data Storage and Security">
            <p>
              Your data is stored on <strong>Supabase</strong>, which provides enterprise-grade encryption at rest (AES-256) and in transit (TLS 1.2+). Our database infrastructure is hosted in secure data centers.
            </p>
            <p className="mt-3">
              Assessment results are protected by Row-Level Security (RLS) policies, meaning each user can only ever access their own data — even database administrators cannot access individual user records through the application layer.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="space-y-2 mt-2">
              <Li icon="📋"><strong>Access:</strong> Request a copy of all data we hold about you.</Li>
              <Li icon="✏️"><strong>Correction:</strong> Update or correct your personal information at any time via your profile settings.</Li>
              <Li icon="🗑️"><strong>Deletion:</strong> Request complete deletion of your account and all associated data by emailing <a href="mailto:aptaduo@gmail.com" className="underline" style={{ color: "var(--color-primary-500)" }}>aptaduo@gmail.com</a>. We will process requests within 30 days.</Li>
              <Li icon="📤"><strong>Portability:</strong> Request an export of your assessment data in a machine-readable format.</Li>
            </ul>
          </Section>

          <Section title="7. Cookies">
            <p>
              We use only essential cookies required to keep you logged in to your session. We do not use marketing, analytics, or tracking cookies. You can disable cookies in your browser settings, but this will prevent you from staying logged in.
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              AptaDuo is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us immediately at <a href="mailto:aptaduo@gmail.com" className="underline" style={{ color: "var(--color-primary-500)" }}>aptaduo@gmail.com</a>.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this policy as our product evolves. We will notify registered users of material changes via email. Continued use of the service after notification constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              For any privacy-related concerns or requests, please contact us at:{" "}
              <a href="mailto:aptaduo@gmail.com" className="underline" style={{ color: "var(--color-primary-500)" }}>aptaduo@gmail.com</a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

function Li({ icon, children }) {
  return (
    <li className="flex items-start gap-2 list-none">
      <span className="mt-0.5 text-base flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
