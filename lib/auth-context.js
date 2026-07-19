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
                if (_event === "SIGNED_OUT" && typeof window !== "undefined") {
                  localStorage.removeItem("aptaduo_data");
                  window.location.href = "/";
                }
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (data && data.age) {
        setProfile({
          displayName: data.display_name,
          age: data.age,
          gender: data.gender,
          avatarUrl: data.avatar_url,
        });
        return;
      }
    } catch (e) {
      console.error("Supabase load profile error:", e);
    }
    
    // Fallback to localStorage if Supabase failed or data is incomplete
    try {
      const saved = JSON.parse(localStorage.getItem(`aptaduo_profile_${userId}`));
      if (saved && saved.age) {
        setProfile(saved);
      }
    } catch {}
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

  // ─── Reset Password (send email) ─
  const resetPassword = useCallback(async (email) => {
    setError(null);
    try {
      if (!isSupabaseConfigured) throw new Error("Not available in demo mode.");
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (authError) throw authError;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // ─── Update Password (after reset link) ─
  const updatePassword = useCallback(async (newPassword) => {
    setError(null);
    try {
      if (!isSupabaseConfigured) throw new Error("Not available in demo mode.");
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
      if (authError) throw authError;
      return { success: true };
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("aptaduo_data");
      window.location.href = "/";
    }
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
          const { error } = await supabase.from("profiles")
            .update({
              display_name: newProfile.displayName,
              age: newProfile.age,
              gender: newProfile.gender,
            })
            .eq("id", user.id);
          if (error) console.warn("Supabase upsert profile error:", error.message);
        }
        
        // Always save to localStorage as a fallback/cache
        if (user) {
          const profileKey = `aptaduo_profile_${user.id}`;
          localStorage.setItem(profileKey, JSON.stringify(newProfile));

          // Update session if it exists in demo mode or as cache
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
          // Cancel any existing pending invite from this user first
          await supabase
            .from("couple_invites")
            .update({ status: "cancelled" })
            .eq("inviter_id", user.id)
            .eq("status", "pending");

          // Store invite in Supabase
          const { error: dbError } = await supabase.from("couple_invites").insert({
            inviter_id: user.id,
            inviter_email: user.email,
            partner_email: partnerEmail.toLowerCase(),
            invite_code: inviteCode,
            assessment_type: assessmentType || null,
            status: "pending",
          });

          if (dbError) throw new Error("Database error: " + dbError.message);

          // Send the invite email via our API route
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
          // Demo mode — cancel existing pending invites from this user
          const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
          invites.forEach((inv) => {
            if (inv.inviterEmail === user.email && inv.status === "pending") {
              inv.status = "cancelled";
            }
          });
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

  // ─── Check for pending invites (received by current user) ───
  const checkInvites = useCallback(async () => {
    if (!user) return [];

    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from("couple_invites")
        .select("*")
        .eq("partner_email", user.email)
        .eq("status", "pending");
      // Map Supabase snake_case fields to camelCase for consistent UI access
      return (data || []).map((inv) => ({
        ...inv,
        inviteCode: inv.invite_code,
        inviterEmail: inv.inviter_email,
        inviterName: inv.inviter_email, // Best available — inviter name not stored in invites table
        partnerEmail: inv.partner_email,
        assessmentType: inv.assessment_type,
      }));
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
          .maybeSingle();
        
        if (fetchError || !invite) return { success: false, error: "Invite not found" };

        // 2. Update invite status with accepted_at timestamp
        const { error: updateError } = await supabase
          .from("couple_invites")
          .update({
            status: "accepted",
            partner_id: user.id,
            accepted_at: new Date().toISOString(),
          })
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
          invites[idx].acceptedAt = new Date().toISOString();
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

  // ─── Fetch linked partner status ─
  /**
   * Returns partner profile + list of completed assessments.
   * Returns null if no couple link exists.
   */
  const fetchPartnerStatus = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return null;

    try {
      // 1. Find couple record (use maybeSingle to avoid error when no rows)
      const { data: couple } = await supabase
        .from("couples")
        .select("user_1_id, user_2_id")
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .maybeSingle();

      if (!couple) return null;

      const partnerId = couple.user_1_id === user.id ? couple.user_2_id : couple.user_1_id;

      // 2. Fetch partner's profile
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .eq("id", partnerId)
        .maybeSingle();

      // 3. Fetch which assessments partner has completed
      let completedAssessments = [];
      try {
        const { data: partnerAssessments } = await supabase
          .from("user_assessments")
          .select("assessment_type, completed_at")
          .eq("user_id", partnerId);
        completedAssessments = (partnerAssessments || []).map((a) => a.assessment_type);
      } catch {
        // user_assessments table may not exist yet — gracefully handle
      }

      return {
        id: partnerId,
        displayName: partnerProfile?.display_name || partnerProfile?.email || "Your Partner",
        email: partnerProfile?.email || "",
        hasSignedUp: !!partnerProfile,
        completedAssessments,
      };
    } catch (err) {
      console.warn("fetchPartnerStatus error:", err?.message || err);
      return null;
    }
  }, [user]);

  // ─── Fetch partner's scores for a specific assessment ─
  /**
   * Returns the full score object for the partner's given assessment type.
   * Returns null if not available.
   */
  const fetchPartnerScores = useCallback(async (assessmentType) => {
    if (!user || !isSupabaseConfigured) return null;

    try {
      const { data: couple } = await supabase
        .from("couples")
        .select("user_1_id, user_2_id")
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .single();

      if (!couple) return null;

      const partnerId = couple.user_1_id === user.id ? couple.user_2_id : couple.user_1_id;

      const { data } = await supabase
        .from("user_assessments")
        .select("scores")
        .eq("user_id", partnerId)
        .eq("assessment_type", assessmentType)
        .single();

      return data?.scores || null;
    } catch (err) {
      console.warn("fetchPartnerScores error:", err?.message || err);
      return null;
    }
  }, [user]);

  // ─── Fetch the invite sent BY the current user ──
  /**
   * Returns the most recent invite sent by the current user.
   * Used to show the invite status panel on the couples page.
   */
  const fetchSentInvite = useCallback(async () => {
    if (!user) return null;

    if (isSupabaseConfigured) {
      // Get the most recent non-cancelled invite from this user
      const { data, error: fetchError } = await supabase
        .from("couple_invites")
        .select("*")
        .eq("inviter_id", user.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !data) return null;

      const appUrl = window.location.origin;
      const inviterName = profile?.displayName || user.displayName || user.email;

      return {
        inviteCode: data.invite_code,
        partnerEmail: data.partner_email,
        assessmentType: data.assessment_type,
        status: data.status,
        createdAt: data.created_at,
        acceptedAt: data.accepted_at || null,
        inviteLink: `${appUrl}/couples/join?code=${data.invite_code}&from=${encodeURIComponent(
          inviterName
        )}&assessment=${data.assessment_type || ""}&email=${encodeURIComponent(data.partner_email)}`,
      };
    } else {
      // Demo mode
      const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
      const mine = invites
        .filter((inv) => inv.inviterEmail === user.email && inv.status !== "cancelled")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (mine.length === 0) return null;
      const inv = mine[0];

      const appUrl = window.location.origin;
      const inviterName = profile?.displayName || user.displayName || user.email;

      return {
        inviteCode: inv.inviteCode,
        partnerEmail: inv.partnerEmail,
        assessmentType: inv.assessmentType,
        status: inv.status,
        createdAt: inv.createdAt,
        acceptedAt: inv.acceptedAt || null,
        inviteLink: `${appUrl}/couples/join?code=${inv.inviteCode}&from=${encodeURIComponent(
          inviterName
        )}&assessment=${inv.assessmentType || ""}&email=${encodeURIComponent(inv.partnerEmail)}`,
      };
    }
  }, [user, profile]);

  // ─── Update partner email on a pending invite ──
  /**
   * Changes the partner email on the current user's pending invite.
   * Generates a new invite code so old links stop working.
   * Only works when the invite is still "pending".
   */
  const updateInviteEmail = useCallback(
    async (newEmail) => {
      if (!user) return { success: false, error: "Not logged in" };

      const newInviteCode = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
      const appUrl = window.location.origin;
      const inviterName = profile?.displayName || user.displayName || user.email;

      const newInviteLink = `${appUrl}/couples/join?code=${newInviteCode}&from=${encodeURIComponent(
        inviterName
      )}&assessment=&email=${encodeURIComponent(newEmail)}`;

      if (isSupabaseConfigured) {
        const { error: updateError } = await supabase
          .from("couple_invites")
          .update({
            partner_email: newEmail.toLowerCase(),
            invite_code: newInviteCode,
          })
          .eq("inviter_id", user.id)
          .eq("status", "pending");

        if (updateError) return { success: false, error: updateError.message };
      } else {
        const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
        const idx = invites.findIndex(
          (inv) => inv.inviterEmail === user.email && inv.status === "pending"
        );
        if (idx >= 0) {
          invites[idx].partnerEmail = newEmail.toLowerCase();
          invites[idx].inviteCode = newInviteCode;
          localStorage.setItem("aptaduo_invites", JSON.stringify(invites));
        }
      }

      return { success: true, inviteLink: newInviteLink, inviteCode: newInviteCode };
    },
    [user, profile]
  );

  // ─── Cancel a pending invite ──
  const cancelInvite = useCallback(async () => {
    if (!user) return { success: false, error: "Not logged in" };

    if (isSupabaseConfigured) {
      const { error: updateError } = await supabase
        .from("couple_invites")
        .update({ status: "cancelled" })
        .eq("inviter_id", user.id)
        .eq("status", "pending");

      if (updateError) return { success: false, error: updateError.message };
    } else {
      const invites = JSON.parse(localStorage.getItem("aptaduo_invites") || "[]");
      invites.forEach((inv) => {
        if (inv.inviterEmail === user.email && inv.status === "pending") {
          inv.status = "cancelled";
        }
      });
      localStorage.setItem("aptaduo_invites", JSON.stringify(invites));
    }

    return { success: true };
  }, [user]);

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
    resetPassword,
    updatePassword,
    signOut,
    saveProfile,
    sendPartnerInvite,
    checkInvites,
    acceptInvite,
    fetchPartnerStatus,
    fetchPartnerScores,
    fetchSentInvite,
    updateInviteEmail,
    cancelInvite,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
