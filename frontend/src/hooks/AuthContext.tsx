import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../lib/supabase";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  ready: boolean;
  isAuthenticated: boolean;
  configured: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authHeader: () => Record<string, string>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthCtx | null>(null);

// Read the cached Supabase session from localStorage synchronously so we
// can set ready=true immediately on page load without waiting for a network round-trip.
function getInitialSession(): Session | null {
  if (!supabaseConfigured) return null;
  try {
    // Supabase stores the session under "sb-<project>-auth-token" in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const s: Session | null = parsed?.currentSession ?? parsed ?? null;
          // Treat as valid only if the access token hasn't expired yet
          if (s?.access_token && s.expires_at && s.expires_at * 1000 > Date.now()) {
            return s;
          }
        }
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(getInitialSession);
  // If we already have a valid cached session we're ready immediately
  const [ready, setReady] = useState(() => !supabaseConfigured || getInitialSession() !== null);

  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }

    // Subscribe first so we never miss an event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setReady(true);
    });

    // Kick off a background refresh to validate/renew the token.
    // We don't block rendering on this — the cached session is already shown.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    }).catch(() => setReady(true));

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) throw new Error("App not configured — contact admin.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // Set session synchronously before navigating so PrivateLayout sees
    // isAuthenticated=true immediately — no spinner flash on redirect.
    if (data.session) setSession(data.session);
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const register = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) throw new Error("App not configured — contact admin.");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (data.session) return;
    throw new Error("CHECK_EMAIL");
  }, []);

  const logout = useCallback(async () => {
    if (supabaseConfigured) await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }, [navigate]);

  const getToken = useCallback(() => session?.access_token ?? null, [session]);

  const authHeader = useCallback((): Record<string, string> => {
    const token = session?.access_token;
    if (!token) { navigate("/login", { replace: true }); return {}; }
    return { Authorization: `Bearer ${token}` };
  }, [session, navigate]);

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      session,
      ready,
      isAuthenticated: !!session,
      configured: supabaseConfigured,
      login, register, logout, authHeader, getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
