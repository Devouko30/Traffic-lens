import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read from env — must be set in Vercel dashboard under Environment Variables
const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabaseConfigured = !!(url && key && url.startsWith("https://"));

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in Vercel environment variables.");
  }
  if (!_supabase) {
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Named export used across the app — lazily initialized
export const supabase = {
  get auth() { return getSupabase().auth; },
  get from() { return getSupabase().from.bind(getSupabase()); },
  get rpc() { return getSupabase().rpc.bind(getSupabase()); },
  get storage() { return getSupabase().storage; },
  get realtime() { return getSupabase().realtime; },
  get channel() { return getSupabase().channel.bind(getSupabase()); },
};
