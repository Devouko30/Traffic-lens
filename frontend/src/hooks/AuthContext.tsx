import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../lib/supabase";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authHeader: () => Record<string, string>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const register = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    // If session is returned immediately, user is logged in (email confirm disabled)
    if (data.session) return;
    // No session means email confirmation is required
    throw new Error("CHECK_EMAIL");
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
