import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured with real credentials.
 * When not configured, the app runs in demo mode (localStorage auth).
 */
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project-url") &&
  !supabaseAnonKey.includes("your-anon-key");

/**
 * Supabase client instance.
 * Returns null if Supabase isn't configured (demo mode).
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
