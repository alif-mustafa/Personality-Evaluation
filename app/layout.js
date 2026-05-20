import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppProvider } from "@/lib/context";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "AptaDuo — Understand Yourself, Understand Each Other",
  description:
    "Free, science-backed personality assessments including Big Five, Attachment Style, Love Languages, and Gottman Conflict Styles. Discover your traits, compare with your partner, and unlock relationship insights.",
  keywords: ["personality test", "Big Five", "attachment style", "love languages", "Gottman", "couples", "relationship", "psychology"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} antialiased`}>
      <body
        className="min-h-screen flex flex-col"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <AuthProvider>
          <AppProvider>
            <Navbar />
            <main className="flex-1">{children}</main>

            {/* ── Footer ── */}
            <footer className="py-8 border-t" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span>© {new Date().getFullYear()} AptaDuo</span>
                <span className="hidden sm:inline">|</span>
                <Link href="/privacy" className="hover:opacity-70 transition-opacity">Privacy Policy</Link>
                <span className="hidden sm:inline">|</span>
                <Link href="/terms" className="hover:opacity-70 transition-opacity">Terms of Service</Link>
                <span className="hidden sm:inline">|</span>
                <a href="mailto:aptaduo@gmail.com" className="hover:opacity-70 transition-opacity">Contact</a>
              </div>
            </footer>

          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
