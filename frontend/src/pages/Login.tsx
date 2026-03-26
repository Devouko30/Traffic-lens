import { Link } from "react-router-dom";
import { AuthSwitch } from "../components/ui/auth-switch";

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: "#0A0A0A" }}
    >
      <div className="pointer-events-none fixed top-[-180px] left-[-180px] w-[700px] h-[700px] rounded-full bg-teal-500/20 blur-[80px]" />
      <div className="pointer-events-none fixed bottom-[-200px] right-[-200px] w-[650px] h-[650px] rounded-full bg-[#D4FF33]/10 blur-[90px]" />
      <div className="pointer-events-none fixed top-[40%] left-[55%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[60px]" />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <AuthSwitch />
        <p className="text-center text-xs text-white/20 mt-5">
          <Link to="/" className="text-white/20 hover:text-white/50 transition-colors no-underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
