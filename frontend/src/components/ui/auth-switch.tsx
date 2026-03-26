import { useState, ChangeEvent, FormEvent } from "react";
import { Activity } from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";
import { AnimatedForm, Ripple, TechOrbitDisplay } from "./modern-animated-sign-in";

type Mode = "signin" | "signup";

type FormData = { email: string; password: string };

// Tech icons using devicons CDN
const iconsArray = [
  {
    component: () => <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" alt="React" className="w-full h-full" />,
    className: "size-[36px] border-none bg-transparent",
    duration: 20, delay: 0, radius: 90, path: false, reverse: false,
  },
  {
    component: () => <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" alt="TypeScript" className="w-full h-full" />,
    className: "size-[36px] border-none bg-transparent",
    duration: 20, delay: 10, radius: 90, path: false, reverse: false,
  },
  {
    component: () => <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind" className="w-full h-full" />,
    className: "size-[32px] border-none bg-transparent",
    duration: 25, delay: 5, radius: 160, path: false, reverse: true,
  },
  {
    component: () => <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" alt="Python" className="w-full h-full" />,
    className: "size-[32px] border-none bg-transparent",
    duration: 25, delay: 15, radius: 160, path: false, reverse: true,
  },
  {
    component: () => <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg" alt="FastAPI" className="w-full h-full" />,
    className: "size-[40px] border-none bg-transparent",
    duration: 30, delay: 8, radius: 230, path: false, reverse: false,
  },
  {
    component: () => <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" alt="Docker" className="w-full h-full" />,
    className: "size-[40px] border-none bg-transparent",
    duration: 30, delay: 20, radius: 230, path: false, reverse: false,
  },
];

export const AuthSwitch = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, name: keyof FormData) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (_e: FormEvent<HTMLFormElement>) => {
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        try {
          await register(formData.email, formData.password);
        } catch (err: any) {
          const msg: string = err?.message ?? "";
          if (msg === "CHECK_EMAIL") {
            setError("Check your email to confirm your account.");
          } else if (msg.toLowerCase().includes("already registered") || msg.includes("409")) {
            await login(formData.email, formData.password);
          } else {
            setError(msg || "Registration failed.");
          }
        }
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const formFields = {
    header: mode === "signin" ? "Welcome back" : "Create account",
    subHeader: mode === "signin"
      ? "Sign in to Traffic Lens Africa"
      : "Start monitoring traffic with AI",
    fields: [
      {
        label: "Email",
        required: true,
        type: "email" as const,
        placeholder: "you@example.com",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "email"),
      },
      {
        label: "Password",
        required: true,
        type: "password" as const,
        placeholder: "",
        onChange: (e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "password"),
      },
    ],
    submitButton: loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account",
    textVariantButton: mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in",
    errorField: error,
  };

  return (
    <section className="flex min-h-screen bg-[#0A0A0A]">
      {/* Left  orbit display */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden border-r border-white/5">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#D4FF33]/10 blur-[100px]" />
        <Ripple mainCircleSize={120} numCircles={7} />
        <TechOrbitDisplay iconsArray={iconsArray} text="Traffic Lens" />
        <p className="absolute bottom-8 text-xs text-white/20 tracking-widest uppercase">
          AI-powered traffic monitoring
        </p>
      </div>

      {/* Right  form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 relative">
        {/* Mobile blobs */}
        <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full bg-[#D4FF33]/8 blur-[80px] lg:hidden" />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.25)]">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-sm font-black tracking-widest uppercase text-white">
            Traffic Lens <span className="text-[#D4FF33]">Africa</span>
          </span>
        </div>

        {/* Mode toggle */}
        <div className="relative flex bg-white/5 rounded-2xl p-1 mb-8 border border-white/8 w-full max-w-sm">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 bg-[#D4FF33] shadow-[0_0_16px_rgba(212,255,51,0.4)]"
            style={{ left: mode === "signin" ? "4px" : "calc(50% + 3px)" }}
          />
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); }}
              className={`relative z-10 flex-1 py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-colors duration-300 ${
                mode === m ? "text-[#0A0A0A]" : "text-white/40 hover:text-white/60"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <AnimatedForm
          {...formFields}
          onSubmit={handleSubmit}
          goTo={() => setMode(mode === "signin" ? "signup" : "signin")}
        />
      </div>
    </section>
  );
};

export default AuthSwitch;
