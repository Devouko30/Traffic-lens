import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design system
        lime:  "#D4FF33",
        teal:  { DEFAULT: "#14B8A6", dim: "#0D9488", light: "#5EEAD4" },
        navy:  { DEFAULT: "#0F172A", card: "#131E30", border: "#1E2D45" },
        slate: { DEFAULT: "#94A3B8", dim: "#64748B" },
        pink:  "#FF3399",
        // shadcn tokens
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(148,163,184,0.06) 0%, rgba(148,163,184,0.02) 100%)",
        "teal-glow":  "radial-gradient(ellipse at center, rgba(20,184,166,0.15) 0%, transparent 70%)",
        "lime-glow":  "radial-gradient(ellipse at center, rgba(212,255,51,0.12) 0%, transparent 70%)",
        "navy-grid":  "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
      },
      animation: {
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":   "spin 3s linear infinite",
        "orb-drift":   "orb-drift 14s ease-in-out infinite alternate",
        "fade-up":     "fade-up 0.5s ease forwards",
        "fade-in":     "fade-in 0.4s ease forwards",
        "scale-in":    "scale-in 0.3s ease forwards",
        shimmer:       "shimmer 1.5s infinite",
        spotlight:     "spotlight 2s ease 0.75s forwards",
        ripple:        "ripple 2s ease calc(var(--i, 0) * 0.2s) infinite",
        orbit:         "orbit calc(var(--duration) * 1s) linear infinite",
      },
      keyframes: {
        spotlight: {
          "0%":   { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
        },
        "orb-drift": {
          "0%":   { transform: "translate(0, 0) scale(1)" },
          "33%":  { transform: "translate(40px, -25px) scale(1.06)" },
          "66%":  { transform: "translate(-25px, 18px) scale(0.96)" },
          "100%": { transform: "translate(12px, -12px) scale(1.03)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        ripple: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%":      { transform: "translate(-50%, -50%) scale(0.9)" },
        },
        orbit: {
          "0%":   { transform: "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)" },
        },
      },
      boxShadow: {
        glass:      "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(148,163,184,0.06) inset",
        "glass-lg": "0 16px 64px rgba(0,0,0,0.6), 0 1px 0 rgba(148,163,184,0.08) inset",
        "glow-teal": "0 0 24px rgba(20,184,166,0.35), 0 0 48px rgba(20,184,166,0.1)",
        "glow-lime": "0 0 24px rgba(212,255,51,0.35), 0 0 48px rgba(212,255,51,0.1)",
        "glow-red":  "0 0 24px rgba(232,0,29,0.3),   0 0 48px rgba(232,0,29,0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
