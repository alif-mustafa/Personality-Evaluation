"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    href: "/assessments",
    label: "Assessments",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </svg>
    ),
  },
  {
    href: "/couples",
    label: "Couples",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "Learn",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Hide nav on auth pages
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = () => setShowUserMenu(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [showUserMenu]);

  if (isAuthPage) return null;

  const displayName = profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "";
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "?";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled ? "bg-[var(--surface)] shadow-md py-2 border-b border-[var(--border)]" : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/Logo.png" alt="AptaDuo Logo" className="h-10 w-auto transition-transform duration-300 group-hover:scale-110" />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-sans), Outfit, sans-serif" }}
            >
              Apta<span className="gradient-text">Duo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}

            {/* Auth section */}
            <div className="ml-3 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
              {!loading && user ? (
                /* Logged in — user avatar & dropdown */
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-[var(--border-subtle)]"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, var(--color-primary-500), var(--color-sage-500))",
                      }}
                    >
                      {initials}
                    </div>
                    <span className="text-sm font-medium max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl p-2 animate-scale-in"
                      style={{
                        background: "var(--surface-elevated)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-xl)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 mb-1">
                        <p className="text-sm font-semibold truncate">{displayName}</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                          {user.email}
                        </p>
                      </div>
                      <div className="h-px my-1" style={{ background: "var(--border)" }} />
                      <Link
                        href="/profile/setup"
                        className="block px-3 py-2 rounded-lg text-sm transition-all hover:bg-[var(--border-subtle)]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        ⚙️ Edit Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all hover:bg-[var(--border-subtle)]"
                        style={{ color: "#f43f5e" }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : !loading ? (
                /* Not logged in */
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--border-subtle)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-16 right-4 w-72 rounded-xl p-4 flex flex-col gap-1 animate-scale-in"
            style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info in mobile menu */}
            {user && (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary-500), var(--color-sage-500))",
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{user.email}</p>
                  </div>
                </div>
                <div className="h-px mb-1" style={{ background: "var(--border)" }} />
              </>
            )}

            {NAV_ITEMS.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}

            <div className="h-px my-1" style={{ background: "var(--border)" }} />

            {user ? (
              <>
                <Link
                  href="/profile/setup"
                  className="px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ⚙️ Edit Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ color: "#f43f5e" }}
                >
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-2 pt-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-center"
                  style={{ border: "1px solid var(--border)" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white text-center"
                  style={{
                    background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                  }}
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
