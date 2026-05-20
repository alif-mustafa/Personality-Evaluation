"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const AuthContext = createContext(null);

const DEMO_USERS_KEY = "aptaduo_users";
const DEMO_SESSION_KEY = "aptaduo_session";

// ──────────────────────────────────────
// Demo-mode helpers (localStorage auth)
// ──────────────────────────────────────

function getDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function getDemoSession() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function saveDemoSession(session) {
  if (session) {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(DEMO_SESSION_KEY);
  }
}

function hashPassword(password) {
  // Simple hash for demo mode only — NOT cryptographically secure
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "demo_" + Math.abs(hash).toString(36);
}

// ──────────────────────────────────────
// Auth Provider
// ──────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { displayName, age, gender }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load session on mount
  useEffect(() => {
    async function init() {
      try {
        if (isSupabaseConfigured) {
          // Supabase mode
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) console.error("Session error:", error);
          
          if (session?.user) {
            setUser(session.user);
            await loadProfile(session.user.id);
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (session?.user) {
                setUser(session.user);
                await loadProfile(session.user.id);
              } else {
                setUser(null);
                setProfile(null);
              }
            }
          );

          setLoading(false);
          return () => subscription.unsubscribe();
        } else {
          // Demo mode
          const session = getDemoSession();
          if (session) {
            setUser(session.user);
            setProfile(session.profile || null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setLoading(false);
      }
    }
    init();
  }, []);

  // Load profile from Supabase
  async function loadProfile(userId) {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) {
        setProfile({
          displayName: data.display_name,
          age: data.age,
          gender: data.gender,
          avatarUrl: data.avatar_url,
        });
      }
    } catch {
      // Profile might not exist yet
    }
  }

  // ─── Sign Up ─────────────────────
  const signUp = useCallback(async (email, password, displayName) => {
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        });
        if (authError) throw authError;

        // Create profile row
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: displayName,
            email: email,
          });
        }

        return { success: true, needsConfirmation: !data.session };
      } else {
        // Demo mode
        const users = getDemoUsers();
        if (users.find((u) => u.email === email.toLowerCase())) {
          throw new Error("An account with this email already exists.");
        }

        const newUser = {
          id: "demo_" + Date.now().toString(36),
          email: email.toLowerCase(),
          passwordHash: hashPassword(password),
          displayName,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveDemoUsers(users);

        const sessionUser = { id: newUser.id, email: newUser.email, displayName };
        setUser(sessionUser);
        saveDemoSession({ user: sessionUser, profile: null });

        return { success: true, needsConfirmation: false };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // ─── Sign In ─────────────────────
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        return { success: true };
      } else {
        // Demo mode
        const users = getDemoUsers();
        const user = users.find(
          (u) =>
            u.email === email.toLowerCase() &&
            u.passwordHash === hashPassword(password)
        );

        if (!user) {
          throw new Error("Invalid email or password.");
        }

        const sessionUser = { id: user.id, email: user.email, displayName: user.displayName };

        // Load profile from localStorage
        const profileKey = `aptaduo_profile_${user.id}`;
        let savedProfile = null;
        try {
          savedProfile = JSON.parse(localStorage.getItem(profileKey) || "null");
        } catch {}

        setUser(sessionUser);
        setProfile(savedProfile);
        saveDemoSession({ user: sessionUser, profile: savedProfile });

        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // ─── Sign In with Google ─────────
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) throw authError;
        return { success: true };
      } else {
        throw new Error("Google Sign-In is not available in Demo Mode.");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // ─── Verify OTP ──────────────────
  const verifyOtp = useCallback(async (email, token, type = "signup") => {
    setError(null);
    try {
      if (isSupabaseConfigured) {
        const { data, error: authError } = await supabase.auth.verifyOtp({
          email,
          token,
          type,
        });
        if (authError) throw authError;
        
        if (data.user) {
          setUser(data.user);
          await loadProfile(data.user.id);
        }
        
        return { success: true };
      } else {
        return { success: true }; // Always succeed in demo mode
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // ─── Sign Out ────────────────────
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    saveDemoSession(null);
  }, []);

  // ─── Save Profile ────────────────
  const saveProfile = useCallback(
    async (profileData) => {
      setError(null);
      try {
        const newProfile = {
          displayName: profileData.displayName || user?.displayName || "",
          age: profileData.age,
          gender: profileData.gender,
        };

        if (isSupabaseConfigured && user) {
          await supabase.from("profiles").upsert({
            id: user.id,
            display_name: newProfile.displayName,
            age: newProfile.age,
            gender: newProfile.gender,
          });
        } else if (user) {
          // Demo mode — save to localStorage
          const profileKey = `aptaduo_profile_${user.id}`;
          localStorage.setItem(profileKey, JSON.stringify(newProfile));

          // Update session
          const session = getDemoSession();
          if (session) {
            session.profile = newProfile;
            saveDemoSession(session);
          }
        }

        setProfile(newProfile);
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    [user]
  );

  // ─── Send Partner Invite ─────────
  /**
   * @param {string} partnerEmail  - Spouse's email address
   * @param {string} [assessmentType] - Assessment to redirect spouse to (e.g. "bigfive")
   */
  const sendPartnerInvite = useCallback(
    async (partnerEmail, assessmentType = "") => {
      setError(null);
      try {
        if (!user) throw new Error("You must be logged in to invite a partner.");

        const inviteCode = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        const appUrl = window.location.origin;
        const inviterName = profile?.displayName || user.displayName || user.email;

        // Build the join link (used as fallback if email fails)
        const inviteLink = `${appUrl}/couples/join?code=${inviteCode}&from=${encodeURIComponent(
          inviterName
        )}&assessment=${assessmentType}&email=${encodeURIComponent(partnerEmail)}`;

        if (isSupabaseConfigured) {
          // 1. Store invite in Supabase
          await supabase.from("couple_invites").insert({
            inviter_id: user.id,
            inviter_email: user.email,
            partner_email: partnerEmail.toLowerCase(),
            invite_code: inviteCode,
            assessment_type: assessmentType || null,
            status: "pending",
          });

          // 2. Send the invite email via our API route
          let emailSent = false;
          try {
            const res = await fetch("/api/send-invite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                inviteCode,
                partnerEmail: partnerEmail.toLowerCase(),
                inviterName,
                inviterEmail: user.email,
                assessmentType,
                appUrl,
              }),
            });
            const data = await res.json();
            emailSent = data.emailSent ?? false;
          } catch (emailErr) {
            console.warn("Email send failed (non-fatal):", emailErr.message);
          }

          return { success: true, inviteLink, inviteCode, emailSent };
        } else {
          // Demo mode — store invite locally
          const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
          invites.push({
            inviterEmail: user.email,
            inviterName,
            partnerEmail: partnerEmail.toLowerCase(),
            inviteCode,
            assessmentType,
            status: "pending",
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("aptaduo_invites", JSON.stringify(invites));

          return { success: true, inviteLink, inviteCode, emailSent: false };
        }
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    [user, profile]
  );

  // ─── Check for pending invites ───
  const checkInvites = useCallback(async () => {
    if (!user) return [];

    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from("couple_invites")
        .select("*")
        .eq("partner_email", user.email)
        .eq("status", "pending");
      return data || [];
    } else {
      const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
      return invites.filter(
        (inv) => inv.partnerEmail === user.email && inv.status === "pending"
      );
    }
  }, [user]);

  // ─── Accept invite ───────────────
  const acceptInvite = useCallback(
    async (inviteCode) => {
      if (!user) return { success: false, error: "Not logged in" };

      if (isSupabaseConfigured) {
        // 1. Get the invite details
        const { data: invite, error: fetchError } = await supabase
          .from("couple_invites")
          .select("*")
          .eq("invite_code", inviteCode)
          .single();
        
        if (fetchError || !invite) return { success: false, error: "Invite not found" };

        // 2. Update invite status
        const { error: updateError } = await supabase
          .from("couple_invites")
          .update({ status: "accepted", partner_id: user.id })
          .eq("invite_code", inviteCode);
        
        if (updateError) return { success: false, error: updateError.message };

        // 3. Create a formal couple record
        const { error: coupleError } = await supabase
          .from("couples")
          .upsert({
            user_1_id: invite.inviter_id,
            user_2_id: user.id
          }, { onConflict: 'user_1_id,user_2_id' });

        if (coupleError) console.error("Error creating couple record:", coupleError);

      } else {
        const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
        const idx = invites.findIndex((inv) => inv.inviteCode === inviteCode);
        if (idx >= 0) {
          invites[idx].status = "accepted";
          invites[idx].partnerId = user.id;
          localStorage.setItem("aptaduo_invites", JSON.stringify(invites));
          
          // Local storage "couples" simulation
          const couples = JSON.parse(localStorage.getItem("aptaduo_couples") || "[]");
          couples.push({ user1: invites[idx].inviterEmail, user2: user.email });
          localStorage.setItem("aptaduo_couples", JSON.stringify(couples));
        }
      }

      return { success: true };
    },
    [user]
  );

  const hasProfile = !!(profile?.age && profile?.gender);

  const value = {
    user,
    profile,
    hasProfile,
    loading,
    error,
    isDemo: !isSupabaseConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    verifyOtp,
    signOut,
    saveProfile,
    sendPartnerInvite,
    checkInvites,
    acceptInvite,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
