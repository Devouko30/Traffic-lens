import { cn } from "../../lib/utils";
import { useState, FormEvent } from "react";
import { Activity, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";

type Mode = "signin" | "signup";

export const AuthSwitch = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setError("");
    setInfo("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      if (mode === "signup") {
        try {
          await register(email, password);
        } catch (err: any) {
          const msg: string = err?.message ?? "";
          if (msg === "CHECK_EMAIL") {
            setInfo("Check your email to confirm your account.");
          } else if (
            msg.toLowerCase().includes("already registered") ||
            msg.toLowerCase().includes("already been registered") ||
            msg.includes("409")
          ) {
            setInfo("Account exists — signing you in...");
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

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-[#0A0A0A] border border-white/10",
          "shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
        )}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Background glow orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-[#D4FF33]/15 blur-3xl" />

        <div className="relative z-10 p-10">
          {/* Logo + title */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-[0_0_28px_rgba(20,184,166,0.3)]">
              <Activity className="w-7 h-7 text-teal-400" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-black tracking-widest uppercase text-white">
                Traffic Lens{" "}
                <span className="text-[#D4FF33] drop-shadow-[0_0_12px_rgba(212,255,51,0.6)]">
                  Africa
                </span>
              </h1>
              <p className="text-xs text-white/40 mt-1">AI-powered traffic monitoring</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="relative flex bg-white/5 rounded-2xl p-1 mb-8 border border-white/8">
            {/* Sliding pill */}
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-in-out",
                "bg-[#D4FF33] shadow-[0_0_20px_rgba(212,255,51,0.5)]",
                mode === "signin" ? "left-1" : "left-[calc(50%+3px)]"
              )}
            />
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); reset(); }}
                className={cn(
                  "relative z-10 flex-1 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-colors duration-300",
                  mode === m ? "text-[#0A0A0A]" : "text-white/40 hover:text-white/60"
                )}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="group relative">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#D4FF33] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20",
                    "bg-white/5 border border-white/10 outline-none",
                    "focus:border-[#D4FF33]/50 focus:shadow-[0_0_0_3px_rgba(212,255,51,0.08)]",
                    "transition-all duration-200"
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group relative">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#D4FF33] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20",
                    "bg-white/5 border border-white/10 outline-none",
                    "focus:border-[#D4FF33]/50 focus:shadow-[0_0_0_3px_rgba(212,255,51,0.08)]",
                    "transition-all duration-200"
                  )}
                />
              </div>
            </div>

            {/* Info message */}
            {info && (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/8 border border-green-400/20 rounded-xl px-3 py-2.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                {info}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/8 border border-red-400/20 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "mt-1 w-full flex items-center justify-center gap-2",
                "py-3.5 rounded-2xl text-xs font-black tracking-widest uppercase",
                "bg-[#D4FF33] text-[#0A0A0A]",
                "shadow-[0_0_24px_rgba(212,255,51,0.45)]",
                "hover:shadow-[0_0_36px_rgba(212,255,51,0.65)] hover:scale-[1.02]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none",
                "transition-all duration-200"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-white/25 tracking-widest uppercase">or continue with</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Social placeholders */}
          <div className="flex gap-3">
            {[
              { label: "Google", icon: "G" },
              { label: "GitHub", icon: <User className="w-4 h-4" /> },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                disabled
                title={`${label} (coming soon)`}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl",
                  "bg-white/5 border border-white/8 text-white/30",
                  "text-xs font-semibold tracking-wide",
                  "cursor-not-allowed opacity-50"
                )}
              >
                <span className="text-sm font-bold">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSwitch;
