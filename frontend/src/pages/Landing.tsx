import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ScrollExpandMedia from "../components/ui/scroll-expansion-hero";
import { GlowCard } from "../components/ui/spotlight-card";
import { Activity, BarChart3, Shield, Zap, ArrowRight, Eye, Cpu, Car, CheckCircle } from "lucide-react";

const DETECTION_OVERLAY = "/detection-overlay.png";

/* ── tokens ── */
const Y = "#D4FF33";          // yellow — used sparingly
const BG = "#0A0A0A";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.07)";
const MUTED = "rgba(255,255,255,0.38)";

const features = [
  { icon: <Zap size={16} />,      title: "Real-time Detection",    desc: "YOLOv8n + ByteTrack at 30 FPS with sub-second latency." },
  { icon: <Cpu size={16} />,      title: "Vehicle Classification", desc: "Cars, trucks, buses, motorcycles — directional counting." },
  { icon: <Shield size={16} />,   title: "ANPR",                   desc: "EasyOCR plate recognition with confidence scoring." },
  { icon: <Eye size={16} />,      title: "Multi-site",             desc: "Manage unlimited monitoring sites from one dashboard." },
  { icon: <BarChart3 size={16} />, title: "Analytics",             desc: "Hourly trends, direction splits, peak-hour insights." },
  { icon: <Activity size={16} />, title: "Live Feed",              desc: "WebSocket streaming with track IDs and plate reads." },
];

const stats = [
  { value: "30 FPS", label: "Speed" },
  { value: "99.5%", label: "Accuracy" },
  { value: "<50ms", label: "Latency" },
  { value: "24/7",  label: "Uptime" },
];

const steps = [
  { n: "01", t: "Connect Camera",    d: "Add your RTSP stream or video file to a monitoring site." },
  { n: "02", t: "AI Processes Feed", d: "YOLOv8 detects and ByteTrack assigns persistent IDs." },
  { n: "03", t: "Live Intelligence", d: "Counts, plates, and analytics stream to your dashboard." },
];

function HeroContent() {
  return (
    <div style={{ background: BG, color: "#fff", position: "relative" }}>
      {/* grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
        backgroundSize: "56px 56px",
      }} />

      {/* stats */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 16px", textAlign: "center", backdropFilter: "blur(16px)" }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: Y, fontVariantNumeric: "tabular-nums", margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 4, letterSpacing: "0.14em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: Y, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>How It Works</p>
        <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 32, lineHeight: 1.2, color: "#fff" }}>
          Monitor every vehicle<br />
          <span style={{ color: Y }}>in three steps</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
          {steps.map(s => (
            <div key={s.n} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px", backdropFilter: "blur(16px)" }}>
              <p style={{ fontSize: 40, fontWeight: 900, color: "rgba(255,255,255,0.04)", marginBottom: 12, lineHeight: 1, userSelect: "none" }}>{s.n}</p>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, color: "#fff" }}>{s.t}</h3>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: Y, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>Capabilities</p>
        <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 32, lineHeight: 1.2, color: "#fff" }}>
          Everything you need<br />
          <span style={{ color: "#fff", opacity: 0.6 }}>to monitor traffic</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {features.map((f, i) => (
            <GlowCard
              key={f.title}
              customSize
              glowColor={["lime", "teal", "lime", "teal", "lime", "teal"][i % 6] as "lime" | "teal"}
              className="w-full h-auto min-h-[140px] aspect-auto p-5 flex flex-col gap-3"
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, color: "#fff" }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "48px 32px", textAlign: "center", backdropFilter: "blur(16px)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 300, height: 80, background: `radial-gradient(ellipse, rgba(212,255,51,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12, lineHeight: 1.2, color: "#fff" }}>
              Ready to deploy<br />on your highway?
            </h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
              Set up a monitoring site in minutes. Connect your RTSP camera and start counting.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/login">
                <button style={{ padding: "10px 24px", borderRadius: 9999, background: Y, color: BG, fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 0 20px rgba(212,255,51,0.3)` }}>
                  <Car size={14} /> Get Started
                </button>
              </Link>
              <Link to="/login">
                <button style={{ padding: "10px 24px", borderRadius: 9999, background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  View Demo <ArrowRight size={13} />
                </button>
              </Link>
            </div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              {["No credit card", "Deploy in minutes", "24/7 monitoring"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: MUTED }}>
                  <CheckCircle size={12} style={{ color: Y }} /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoBgOpacity, setVideoBgOpacity] = useState(1);

  /* Imperative play — guaranteed to work regardless of autoplay policy */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.play().catch(() => {
      // fallback: play on first interaction
      const resume = () => { vid.play().catch(() => {}); };
      document.addEventListener("click", resume, { once: true });
      document.addEventListener("keydown", resume, { once: true });
    });
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>

      {/* ── TRUE fixed video — lives at root, no transformed ancestors ── */}
      <video
        ref={videoRef}
        src="/vehicle-counting.mp4"
        muted
        loop
        playsInline
        disablePictureInPicture
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          opacity: videoBgOpacity,
          transition: "opacity 0.1s",
          pointerEvents: "none",
        }}
      />
      {/* vignette over video */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.15) 50%,rgba(0,0,0,0.65) 100%)",
        opacity: videoBgOpacity,
        transition: "opacity 0.1s",
      }} />

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(10,10,10,0.8)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: Y, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={14} style={{ color: BG }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>
              Traffic Lens <span style={{ color: Y }}>Africa</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link to="/login">
              <button style={{ padding: "6px 14px", borderRadius: 8, background: "transparent", color: MUTED, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: "0.06em" }}>
                Sign In
              </button>
            </Link>
            <Link to="/login">
              <button style={{ padding: "6px 16px", borderRadius: 8, background: Y, color: BG, fontSize: 11, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Scroll hero — no fixed children inside ── */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <ScrollExpandMedia
          mediaType="image"
          mediaSrc={DETECTION_OVERLAY}
          overlaySrc={DETECTION_OVERLAY}
          title="AI Traffic Intelligence"
          date="Traffic Lens Africa"
          scrollToExpand="↓ scroll to explore"
          onProgress={p => setVideoBgOpacity(Math.max(0, 1 - p * 0.9))}
        >
          <HeroContent />
        </ScrollExpandMedia>
      </div>
    </div>
  );
}
