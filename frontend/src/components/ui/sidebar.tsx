"use client";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, MapPin, LogOut, Activity,
  ChevronDown, Wifi, WifiOff, Car, Truck, Bus,
} from "lucide-react";
import { useAuth } from "../../hooks/AuthContext";

// â”€â”€ Animated hamburger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnimatedMenuToggle({ toggle, isOpen }: { toggle: () => void; isOpen: boolean }) {
  return (
    <button onClick={toggle} aria-label="Toggle menu" className="focus:outline-none z-[999] p-1">
      <motion.div animate={{ y: isOpen ? 13 : 0 }} transition={{ duration: 0.3 }}>
        <motion.svg
          width="20" height="20" viewBox="0 0 24 24"
          initial="closed" animate={isOpen ? "open" : "closed"}
          transition={{ duration: 0.3 }}
          style={{ color: "#D4FF33" }}
        >
          <motion.path fill="transparent" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round"
            variants={{ closed: { d: "M 2 2.5 L 22 2.5" }, open: { d: "M 3 16.5 L 17 2.5" } }} />
          <motion.path fill="transparent" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round"
            variants={{ closed: { d: "M 2 12 L 22 12", opacity: 1 }, open: { opacity: 0 } }}
            transition={{ duration: 0.2 }} />
          <motion.path fill="transparent" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round"
            variants={{ closed: { d: "M 2 21.5 L 22 21.5" }, open: { d: "M 3 2.5 L 17 16.5" } }} />
        </motion.svg>
      </motion.div>
    </button>
  );
}

// â”€â”€ Collapsible section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center justify-between py-2 px-3 rounded-xl transition-colors"
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
        onClick={() => setOpen(!open)}
      >
        {title}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown style={{ width: 12, height: 12 }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// â”€â”€ Nav item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 cursor-pointer"
          style={{
            background: isActive ? "rgba(212,255,51,0.1)" : "transparent",
            color: isActive ? "#D4FF33" : "rgba(255,255,255,0.55)",
            outline: isActive ? "1px solid rgba(212,255,51,0.2)" : "none",
          }}
          onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <span style={{ color: isActive ? "#D4FF33" : "rgba(255,255,255,0.4)" }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#D4FF33" }} />
          )}
        </div>
      )}
    </NavLink>
  );
}

// â”€â”€ Sidebar content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    onClose?.();
    await logout();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo / brand */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(212,255,51,0.08)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(212,255,51,0.12)",
              border: "1px solid rgba(212,255,51,0.25)",
              boxShadow: "0 0 20px rgba(212,255,51,0.15)",
            }}
          >
            <Activity style={{ width: 20, height: 20, color: "#D4FF33" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", color: "#FFFFFF" }}>
              Traffic Lens
            </p>
            <p style={{ fontSize: 10, color: "rgba(212,255,51,0.6)", letterSpacing: "0.04em" }}>
              AFRICA
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{ background: "rgba(212,255,51,0.15)", color: "#D4FF33", border: "1px solid rgba(212,255,51,0.2)" }}
          >
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ?? "User"}
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Operator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="mb-2" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 12px 6px" }}>
          Monitor
        </div>
        <NavItem to="/dashboard" icon={<LayoutDashboard style={{ width: 16, height: 16 }} />} label="Dashboard" />
        <NavItem to="/analytics" icon={<BarChart3 style={{ width: 16, height: 16 }} />} label="Analytics" />
        <NavItem to="/sites" icon={<MapPin style={{ width: 16, height: 16 }} />} label="Sites" />

        <div className="mt-4">
          <CollapsibleSection title="Vehicle Types">
            {[
              { icon: <Car style={{ width: 14, height: 14 }} />, label: "Cars" },
              { icon: <Truck style={{ width: 14, height: 14 }} />, label: "Trucks" },
              { icon: <Bus style={{ width: 14, height: 14 }} />, label: "Buses" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "default" }}>
                <span style={{ color: "rgba(212,255,51,0.5)" }}>{icon}</span>{label}
              </div>
            ))}
          </CollapsibleSection>

          <CollapsibleSection title="System">
            <div className="px-3 py-2 rounded-xl" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              AI Engine: YOLOv8 + ByteTrack
              <br />ANPR: EasyOCR
              <br />Stream: MJPEG
            </div>
          </CollapsibleSection>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600 }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(248,113,113,0.08)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          Sign out
        </button>
      </div>
    </div>
  );
}

// â”€â”€ Glass sidebar styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GLASS: React.CSSProperties = {
  background: "rgba(10,10,10,0.75)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  borderRight: "1px solid rgba(212,255,51,0.07)",
};

// â”€â”€ Main export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0A" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full w-60 z-30"
        style={GLASS}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="md:hidden fixed top-0 left-0 h-full w-72 z-50 flex flex-col"
              style={GLASS}
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Page content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{
            background: "rgba(10,10,10,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(212,255,51,0.07)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(212,255,51,0.12)", border: "1px solid rgba(212,255,51,0.2)" }}
            >
              <Activity style={{ width: 14, height: 14, color: "#D4FF33" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em" }}>
              TRAFFIC LENS
            </span>
          </div>
          <AnimatedMenuToggle toggle={() => setMobileOpen(v => !v)} isOpen={mobileOpen} />
        </div>

        {/* Actual page */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}



