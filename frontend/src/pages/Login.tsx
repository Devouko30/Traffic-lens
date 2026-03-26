import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Activity, Cpu, Radio, Zap, Eye, Globe, Layers, GitBranch } from "lucide-react";
import { useAuth } from "../hooks/AuthContext";
import { Ripple, TechOrbitDisplay, AnimatedForm } from "../components/ui/modern-animated-sign-in";

type Mode = "signin" | "signup";

const iconsArray = [
  {
    component: () => <Activity className="w-5 h-5 text-teal-400" />,
    className: "size-[36px] border border-teal-500/30 bg-teal-500/10",
    duration: 20, delay: 0, radius: 90, path: false, reverse: false,
  },
  {
    component: () => <Cpu className="w-5 h-5 text-[#D4FF33]" />,
    className: "size-[36px] border border-[#D4FF33]/30 bg-[#D4FF33]/10",
    duration: 20, delay: 10, radius: 90, path: false, reverse: false,
  },
  {
    component: () => <Radio className="w-4 h-4 text-purple-400" />,
    className: "size-[30px] border border-purple-500/30 bg-purple-500/10",
    duration: 20, delay: 5, radius: 150, path: false, reverse: true,
  },
  {
    component: () => <Zap className="w-4 h-4 text-[#D4FF33]" />,
    className: "size-[30px] border border-[#D4FF33]/30 bg-[#D4FF33]/10",
    duration: 20, delay: 15, radius: 150, path: false, reverse: true,
  },
  {
    component: () => <Eye className="w-5 h-5 text-teal-400" />,
    className: "size-[40px] border border-teal-500/30 bg-teal-500/10",
    duration: 20, delay: 0, radius: 210, path: false, reverse: false,
  },
  {
    component: () => <Globe className="w-5 h-5 text-blue-400" />,
    className: "size-[40px] border border-blue-500/30 bg-blue-500/10",
    duration: 20, delay: 20, radius: 210, path: false, reverse: false,
  },
  {
    component: () => <Layers className="w-5 h-5 text-[#D4FF33]" />,
    className: "size-[40px] border border-[#D4FF33]/30 bg-[#D4FF33]/10",
    duration: 20, delay: 10, radius: 270, path: false, reverse: true,
  },
  {
    component: () => <GitBranch className="w-5 h-5 text-purple-400" />,
    className: "size-[40px] border border-purple-500/30 bg-purple-500/10",
    duration: 20, delay: 30, radius: 270, path: false, reverse: true,
  },
];

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (_e: FormEvent<HTMLFormElement>) => {
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        try {
          await register(email, password);
        } catch (err: any) {
          const msg: string = err?.message ?? "";
          if (msg === "CHECK_EMAIL") {
            setError("Check your email to confirm your account.");
          } else if (msg.toLowerCase().includes("already registered") || msg.includes("409")) {
            await login(email, password);
          } else {
            setError(msg || "Registration failed.");
          }
        }
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Email",
      required: true,
      type: "email" as const,
      placeholder: "you@example.com",
      onChange: (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    },
    {
      label: "Password",
      required: true,
      type: "password" as const,
      placeholder: "",
      onChange: (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0A0A" }}>
      {/* Left  orbit display */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Blobs */}
        <div className="pointer-events-none absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-teal-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#D4FF33]/10 blur-[100px]" />

        <Ripple mainCircleSize={120} numCircles={6} className="opacity-40" />
        <TechOrbitDisplay
          iconsArray={iconsArray}
          text={"Traffic Lens\nAfrica"}
        />
      </div>

      {/* Right  form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 py-12 relative">
        {/* Mobile blobs */}
        <div className="lg:hidden pointer-events-none fixed top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-teal-500/15 blur-[80px]" />
        <div className="lg:hidden pointer-events-none fixed bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-[#D4FF33]/10 blur-[80px]" />

        {/* Logo (mobile only) */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-sm font-black tracking-widest uppercase text-white">
            Traffic Lens <span className="text-[#D4FF33]">Africa</span>
          </span>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-8 border border-white/8 w-full max-w-sm">
          <div className="relative flex w-full">
            <div
              className={`absolute top-0 bottom-0 w-1/2 rounded-xl bg-[#D4FF33] shadow-[0_0_20px_rgba(212,255,51,0.4)] transition-all duration-300 ease-in-out ${
                mode === "signin" ? "left-0" : "left-1/2"
              }`}
            />
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={`relative z-10 flex-1 py-2.5 text-xs font-black tracking-widest uppercase rounded-xl transition-colors duration-300 ${
                  mode === m ? "text-[#0A0A0A]" : "text-white/40 hover:text-white/60"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        </div>

        <AnimatedForm
          header={mode === "signin" ? "Welcome back" : "Create account"}
          subHeader={
            mode === "signin"
              ? "Sign in to your Traffic Lens account"
              : "Start monitoring traffic with AI"
          }
          fields={fields}
          submitButton={loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          textVariantButton={mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          errorField={error}
          onSubmit={handleSubmit}
          goTo={() => setMode(mode === "signin" ? "signup" : "signin")}
        />

        <p className="mt-8 text-xs text-white/20">
          <Link to="/" className="hover:text-white/50 transition-colors">
             Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
