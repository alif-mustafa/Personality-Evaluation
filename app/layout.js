import { Inter, Outfit } from "next/font/google";
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
    "Free, science-backed personality assessments including Big Five, Attachment Style, and HEXACO. Discover your traits, compare with your partner, and unlock relationship insights.",
  keywords: ["personality test", "Big Five", "attachment style", "HEXACO", "couples", "relationship", "psychology"],
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
            <footer className="py-8 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
              <p>AptaDuo · Science-backed personality insights · Not a diagnostic tool</p>
              <p className="mt-1">All assessments are based on peer-reviewed research and are for educational purposes only.</p>
            </footer>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
