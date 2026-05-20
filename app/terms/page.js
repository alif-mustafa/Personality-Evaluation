import Link from "next/link";

export const metadata = {
  title: "Terms of Service — AptaDuo",
  description: "Terms and conditions for using AptaDuo, the relationship psychology platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
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
            Terms of Service
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Last updated: May 2026</p>
        </div>

        <div
          className="p-6 rounded-2xl mb-10 flex gap-4"
          style={{ background: "rgba(249,123,107,0.06)", border: "1px solid rgba(249,123,107,0.2)" }}
        >
          <div className="text-3xl">⚕️</div>
          <div>
            <p className="font-semibold mb-1">Not a medical or diagnostic tool</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              AptaDuo is an educational tool based on psychological research. It is not a substitute for professional mental health advice, diagnosis, or treatment. If you are experiencing a mental health crisis, please contact a qualified professional.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using AptaDuo (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years old to use AptaDuo. By using the Service, you represent that you meet this age requirement. Users between 13 and 18 should have parental permission before using the Service.
            </p>
          </Section>

          <Section title="3. Your Account">
            <ul className="space-y-2 mt-2">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate information when creating your account.</li>
              <li>You may not share your account with others or create accounts for others without their consent.</li>
              <li>You must notify us immediately if you suspect unauthorized access to your account.</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to reverse engineer, scrape, or extract data from the Service.</li>
              <li>Impersonate any person or entity.</li>
              <li>Transmit any harmful, abusive, or offensive content.</li>
              <li>Interfere with the security or integrity of the Service.</li>
            </ul>
          </Section>

          <Section title="5. Educational Purpose Disclaimer">
            <p>
              <strong style={{ color: "var(--foreground)" }}>The assessments provided by AptaDuo are for educational and self-reflection purposes only.</strong> They are based on peer-reviewed psychological research but are not clinical instruments. Results should not be used to make medical, psychological, or legal decisions. AptaDuo is not a licensed therapist, counselor, or mental health provider.
            </p>
            <p className="mt-3">
              If you are experiencing relationship distress, mental health challenges, or personal difficulties, please seek support from a qualified mental health professional.
            </p>
          </Section>

          <Section title="6. Partner Invitations">
            <p>
              When you invite a partner to use AptaDuo, you confirm that you have their genuine consent to share their email address with us for the purpose of sending a one-time invitation. You must not send invitations to individuals who have not agreed to receive them.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              The AptaDuo platform, including its design, code, assessment scoring logic, and content, is our intellectual property. The underlying psychological frameworks (Big Five, ECR-R, Love Languages, Gottman) are based on published academic research. You may not reproduce or distribute our platform content without written permission.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, AptaDuo shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months prior to the claim (which for free users is zero).
            </p>
          </Section>

          <Section title="9. Changes to the Service">
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will provide reasonable notice of significant changes where possible.
            </p>
          </Section>

          <Section title="10. Governing Law">
            <p>
              These Terms shall be governed by applicable law. Any disputes shall be resolved through good-faith negotiation before pursuing formal legal action.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:aptaduo@gmail.com" className="underline" style={{ color: "var(--color-primary-500)" }}>aptaduo@gmail.com</a>
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 flex gap-4 text-sm" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/privacy" className="underline underline-offset-2 hover:opacity-70" style={{ color: "var(--color-primary-500)" }}>
            Privacy Policy
          </Link>
          <Link href="/" className="underline underline-offset-2 hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
            Back to AptaDuo
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-outfit)", color: "var(--foreground)" }}>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
