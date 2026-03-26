import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { Loader2, AlertCircle, CheckCircle, Activity } from "lucide-react";

type Mode = "login" | "register";

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() { setError(""); setInfo(""); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      if (mode === "register") {
        try {
          await register(email, password);
          // session set via onAuthStateChange, navigate happens in login
        } catch (err: any) {
          const msg: string = err?.message ?? "";
          if (msg === "CHECK_EMAIL") {
            setInfo("Check your email to confirm your account.");
          } else if (
            msg.toLowerCase().includes("already registered") ||
            msg.toLowerCase().includes("already been registered") ||
            msg.includes("409")
          ) {
            setInfo("Account exists, signing you in...");
            await login(email, password);
          } else {
            setError(msg || "Registration failed. Try again.");
          }
        }
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "11px 16px",
    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
    color: "#FFFFFF", fontSize: 13, outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: 10, fontWeight: 700,
    color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em",
    textTransform: "uppercase", marginBottom: 7,
  };
  function fi(ev: React.FocusEvent<HTMLInputElement>) {
    ev.target.style.borderColor = "rgba(212,255,51,0.5)";
    ev.target.style.boxShadow = "0 0 0 3px rgba(212,255,51,0.08)";
  }
  function fb(ev: React.FocusEvent<HTMLInputElement>) {
    ev.target.style.borderColor = "rgba(255,255,255,0.1)";
    ev.target.style.boxShadow = "none";
  }
  const activeTab: React.CSSProperties = {
    padding: "7px 20px", borderRadius: 9999, fontSize: 11, fontWeight: 800,
    letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
    border: "none", fontFamily: "inherit",
    background: "#D4FF33", color: "#0A0A0A",
    boxShadow: "0 0 18px rgba(212,255,51,0.55)",
  };
  const inactiveTab: React.CSSProperties = {
    padding: "7px 20px", borderRadius: 9999, fontSize: 11, fontWeight: 800,
    letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
    fontFamily: "inherit", background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)",
  };
  const cta: React.CSSProperties = {
    marginTop: 4, width: "100%", padding: "13px", borderRadius: 9999,
    background: loading ? "rgba(212,255,51,0.45)" : "#D4FF33",
    color: "#0A0A0A", fontSize: 12, fontWeight: 900,
    letterSpacing: "0.12em", textTransform: "uppercase",
    border: "none", cursor: loading ? "not-allowed" : "pointer",
    boxShadow: loading ? "none" : "0 0 24px rgba(212,255,51,0.5)",
    transition: "all 0.2s ease", display: "flex",
    alignItems: "center", justifyContent: "center",
    gap: 8, fontFamily: "inherit",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: "#0A0A0A" }}
    >
      <div style={{ position: "fixed", top: -180, left: -180, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(20,184,166,0.35) 0%, rgba(6,182,212,0.15) 40%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -200, right: -200, width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle at 60% 60%, rgba(212,255,51,0.22) 0%, rgba(163,230,53,0.1) 40%, transparent 70%)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "40%", left: "55%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative w-full max-w-[400px] animate-scale-in" style={{ zIndex: 10 }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(48px) saturate(200%)",
          WebkitBackdropFilter: "blur(48px) saturate(200%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 28, padding: "40px 36px",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 32px 80px rgba(0,0,0,0.55)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)", pointerEvents: "none" }} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, gap: 12 }}>
            <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(6,182,212,0.1) 100%)", border: "1px solid rgba(20,184,166,0.4)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 28px rgba(20,184,166,0.35)" }}>
              <Activity style={{ width: 26, height: 26, color: "#14B8A6" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: 19, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFFFFF", lineHeight: 1.2 }}>
                TRAFFIC LENS{" "}
                <span style={{ color: "#D4FF33", textShadow: "0 0 20px rgba(212,255,51,0.5)" }}>AFRICA</span>
              </h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                AI-powered traffic monitoring
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); reset(); }}
                style={mode === m ? activeTab : inactiveTab}
              >
                {m === "login" ? "SIGN IN" : "REGISTER"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="email" style={lbl}>Email</label>
              <input
                id="email" type="email" required
                value={email}
                onChange={ev => setEmail(ev.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={inp} onFocus={fi} onBlur={fb}
              />
            </div>
            <div>
              <label htmlFor="password" style={lbl}>Password</label>
              <input
                id="password" type="password" required
                value={password}
                onChange={ev => setPassword(ev.target.value)}
                placeholder=""
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                style={inp} onFocus={fi} onBlur={fb}
              />
            </div>

            {info && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: "9px 13px" }}>
                <CheckCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                {info}
              </div>
            )}

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12, padding: "9px 13px" }}>
                <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={cta}>
              {loading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                  {mode === "login" ? "SIGNING IN..." : "CREATING..."}
                </>
              ) : (
                mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 20 }}>
          <Link
            to="/"
            style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none" }}
            onMouseEnter={ev => (ev.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            onMouseLeave={ev => (ev.currentTarget.style.color = "rgba(255,255,255,0.2)")}
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}


