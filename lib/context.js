"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { scoreAssessment } from "@/lib/scoring";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const AppContext = createContext(null);

const STORAGE_KEY = "aptaduo_data";

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

const DEFAULT_STATE = {
  acceptedTerms: false,
  // Assessment results (keyed by assessment type)
  results: {},
  // Couple data
  couple: {
    partnerA: {},
    partnerB: {},
    attachmentStyleA: null,
    attachmentStyleB: null,
    heatmap: null,
    reframing: null,
    coupleConflictStyle: null,
    conflictStyleStability: null,
    conflictStyleRationale: null,
  },
  // Linked partner data (fetched from Supabase)
  partner: null,
};

export function AppProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setState((prev) => ({ ...prev, ...saved }));
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(state);
    }
  }, [state, isLoaded]);

  /**
   * Save assessment results.
   * Persists to localStorage AND upserts into Supabase if logged in.
   */
  const saveResults = useCallback(async (type, responses) => {
    const result = scoreAssessment(type, responses);
    const entry = { ...result, responses, completedAt: new Date().toISOString() };

    setState((prev) => ({
      ...prev,
      results: { ...prev.results, [type]: entry },
    }));

    // Persist to Supabase if configured and user is logged in
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from("user_assessments").upsert({
            user_id: session.user.id,
            assessment_type: type,
            scores: entry,
            completed_at: entry.completedAt,
          }, { onConflict: "user_id,assessment_type" });
        }
      } catch (err) {
        console.warn("Failed to sync assessment to Supabase:", err.message);
      }
    }

    return result;
  }, []);

  /**
   * Get results for a specific assessment.
   */
  const getResults = useCallback(
    (type) => state.results[type] || null,
    [state.results]
  );

  /**
   * Check if an assessment is completed.
   */
  const isCompleted = useCallback(
    (type) => !!state.results[type],
    [state.results]
  );

  /**
   * Update couple scores.
   */
  const updateCoupleScores = useCallback((partner, scores) => {
    setState((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        [partner === "A" ? "partnerA" : "partnerB"]: scores,
      },
    }));
  }, []);

  /**
   * Update couple attachment styles.
   */
  const updateCoupleAttachment = useCallback((partner, style) => {
    setState((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        [partner === "A" ? "attachmentStyleA" : "attachmentStyleB"]: style,
      },
    }));
  }, []);

  /**
   * Save heatmap results.
   */
  const saveCoupleHeatmap = useCallback((heatmap) => {
    setState((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        heatmap,
      },
    }));
  }, []);

  /**
   * Save reframing insights.
   */
  const saveCoupleReframing = useCallback((reframing) => {
    setState((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        reframing,
      },
    }));
  }, []);

  /**
   * Save couple conflict style result.
   */
  const saveCoupleConflictStyle = useCallback((result) => {
    setState((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        coupleConflictStyle: result.coupleConflictStyle,
        conflictStyleStability: result.stability,
        conflictStyleRationale: result.rationale,
        gottmanCoupleResult: result,
      },
    }));
  }, []);

  /**
   * Clear all data.
   */
  const clearAll = useCallback(() => {
    setState(DEFAULT_STATE);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const acceptTerms = useCallback(() => {
    setState((prev) => ({ ...prev, acceptedTerms: true }));
  }, []);

  /**
   * Save partner data fetched from Supabase.
   */
  const setPartnerData = useCallback((partnerData) => {
    setState((prev) => ({ ...prev, partner: partnerData }));
  }, []);

  const value = {
    ...state,
    isLoaded,
    acceptTerms,
    saveResults,
    getResults,
    isCompleted,
    updateCoupleScores,
    updateCoupleAttachment,
    saveCoupleHeatmap,
    saveCoupleReframing,
    saveCoupleConflictStyle,
    setPartnerData,
    clearAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
