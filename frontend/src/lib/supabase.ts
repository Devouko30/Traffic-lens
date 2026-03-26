import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Fallback prevents hard crash if env vars are missing at build time
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "placeholder";

export const supabase = createClient(url, key);

export const supabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== "https://placeholder.supabase.co" &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== "placeholder";
