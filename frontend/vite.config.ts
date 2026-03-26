import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "motion/react": "framer-motion",
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/ws": { target: "ws://localhost:8000", ws: true },
      "/stream": "http://localhost:8889",
    },
  },
  build: {
    // Increase warning threshold — we know some chunks are large
    chunkSizeWarningLimit: 600,
    // Minify with esbuild (default, fastest)
    minify: "esbuild",
    // Enable CSS code splitting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Fine-grained manual chunks — each loads only when needed
        manualChunks(id) {
          // React core — always needed, load first
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          // Router
          if (id.includes("node_modules/react-router-dom") || id.includes("node_modules/react-router/")) {
            return "vendor-router";
          }
          // Supabase — auth only, lazy
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }
          // Charts — only on analytics page
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "vendor-charts";
          }
          // Framer motion — sidebar + login animations
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-motion";
          }
          // Radix UI
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Tanstack query
          if (id.includes("node_modules/@tanstack/")) {
            return "vendor-query";
          }
          // Spline 3D — very heavy, isolate it
          if (id.includes("node_modules/@splinetool/")) {
            return "vendor-spline";
          }
          // Everything else in node_modules
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
});
