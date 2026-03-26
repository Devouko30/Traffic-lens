import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { useTrafficSocket } from "../hooks/useTrafficSocket";
import { useAuth } from "../hooks/AuthContext";
import CountChart from "../components/CountChart";
import LiveFeed from "../components/LiveFeed";
import RealtimeCharts from "../components/RealtimeCharts";
import VehicleTicker from "../components/VehicleTicker";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  ArrowUp, ArrowDown, Car, Wifi, WifiOff, Loader2,
  Activity, MapPin, Plus, X, Download, Truck,
} from "lucide-react";

interface Site { id: string; name: string; location: string; rtsp_url: string; }
interface SummaryItem { vehicle_class: string; direction: string; total: number; }
interface PlateEvent {
  id: number; timestamp: string; vehicle_class: string;
  direction: string; plate: string; confidence: number; speed_px_s?: number;
}

// ── Glassmorphism stat card ───────────────────────────────────────────────────
function StatCard({
  label, value, icon, accent, sub,
}: {
  label: string; value: number | string; icon: React.ReactNode; accent: string; sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(212,255,51,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(212,255,51,0.04) inset",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212,255,51,0.18)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(212,255,51,0.08)")}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold tabular-nums" style={{ color: "#FFFFFF" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{sub}</p>}
    </div>
  );
}

// ── Reusable glass panel ──────────────────────────────────────────────────────
function GlassPanel({ label, children, right }: { label: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(212,255,51,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {label}
        </p>
        {right}
      </div>
      {children}
    </div>
  );
}

// ── Add site modal ────────────────────────────────────────────────────────────
interface AddSiteModalProps {
  onClose: () => void;
  onCreated: () => void;
  getAuthHeader: () => Record<string, string>;
}

function AddSiteModal({ onClose, onCreated, getAuthHeader }: AddSiteModalProps) {
  const [form, setForm] = useState({ id: "", name: "", location: "", rtsp_url: "", line_y_ratio: "0.6" });
  const [videoMode, setVideoMode] = useState<"url" | "upload">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let rtsp_url = form.rtsp_url;

      if (videoMode === "upload") {
        if (!uploadedFile) { setError("Please select a video file."); setLoading(false); return; }
        // Upload the file first, get back a server-side path
        const fd = new FormData();
        fd.append("file", uploadedFile);
        const res = await axios.post("/api/v1/upload", fd, { headers: { ...getAuthHeader() } });
        rtsp_url = res.data.path;
      }

      await axios.post(
        "/api/v1/sites",
        { ...form, rtsp_url, line_y_ratio: parseFloat(form.line_y_ratio) },
        { headers: getAuthHeader() },
      );
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to create site");
    } finally {
      setLoading(false);
    }
  }

  const metaFields: { id: "id" | "name" | "location"; label: string; placeholder: string }[] = [
    { id: "id",       label: "Site ID (immutable)", placeholder: "site_19_mombasa" },
    { id: "name",     label: "Display Name",        placeholder: "Site 19" },
    { id: "location", label: "Location",            placeholder: "Mombasa Bonje" },
  ];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "6px 0", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
    border: "none", borderRadius: 8, fontFamily: "inherit", transition: "all 0.15s",
    background: active ? "rgba(212,255,51,0.15)" : "transparent",
    color: active ? "#D4FF33" : "rgba(255,255,255,0.35)",
    outline: active ? "1px solid rgba(212,255,51,0.3)" : "none",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-2xl p-6 w-full max-w-md shadow-glass-lg animate-scale-in border border-white/10"
        style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-zinc-100">Add Monitoring Site</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {/* Meta fields */}
          {metaFields.map(f => (
            <div key={f.id} className="space-y-1">
              <Label htmlFor={f.id}>{f.label}</Label>
              <Input id={f.id} required placeholder={f.placeholder} value={form[f.id]}
                onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))} />
            </div>
          ))}

          {/* Video source — URL or Upload */}
          <div className="space-y-2">
            <Label>Video Source</Label>
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4 }}>
              <button type="button" style={tabStyle(videoMode === "url")} onClick={() => setVideoMode("url")}>
                RTSP / URL
              </button>
              <button type="button" style={tabStyle(videoMode === "upload")} onClick={() => setVideoMode("upload")}>
                Upload File
              </button>
            </div>

            {videoMode === "url" ? (
              <Input
                required
                placeholder="rtsp://192.168.1.1/stream  or  /videos/clip.mp4"
                value={form.rtsp_url}
                onChange={e => setForm(p => ({ ...p, rtsp_url: e.target.value }))}
              />
            ) : (
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "20px 16px", borderRadius: 12, cursor: "pointer",
                border: "1px dashed rgba(212,255,51,0.25)", background: "rgba(212,255,51,0.03)",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212,255,51,0.5)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(212,255,51,0.25)")}
              >
                <input
                  type="file"
                  accept="video/mp4,video/avi,video/mov,video/mkv,video/webm,.mp4,.avi,.mov,.mkv,.webm"
                  style={{ display: "none" }}
                  onChange={e => setUploadedFile(e.target.files?.[0] ?? null)}
                />
                {uploadedFile ? (
                  <>
                    <span style={{ fontSize: 20 }}>🎬</span>
                    <span style={{ fontSize: 12, color: "#D4FF33", fontWeight: 600 }}>{uploadedFile.name}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB — click to change
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 24 }}>📁</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Click to select a video file</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>MP4, AVI, MOV, MKV, WebM</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Counting line */}
          <div className="space-y-1">
            <Label htmlFor="line_y_ratio">Counting line Y ratio (0.1–0.9)</Label>
            <Input id="line_y_ratio" type="number" min="0.1" max="0.9" step="0.05"
              value={form.line_y_ratio}
              onChange={e => setForm(p => ({ ...p, line_y_ratio: e.target.value }))} />
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ color: "rgba(212,255,51,0.7)", background: "rgba(212,255,51,0.06)", border: "1px solid rgba(212,255,51,0.15)" }}>{error}</p>
          )}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Site
          </Button>
        </form>
      </div>
    </div>
  );
}

function exportCSV(plates: PlateEvent[], siteName: string) {
  const header = "timestamp,plate,class,direction,confidence,speed_px_s";
  const rows = plates.map(p =>
    `${p.timestamp},${p.plate},${p.vehicle_class},${p.direction},${(p.confidence * 100).toFixed(1)}%,${p.speed_px_s ?? ""}`
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plates_${siteName}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { authHeader } = useAuth();
  const [siteId, setSiteId] = useState<string | null>(null);
  const [showAddSite, setShowAddSite] = useState(false);

  const { data: sites = [], refetch: refetchSites } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: () => axios.get("/api/v1/sites", { headers: authHeader() }).then(r => r.data),
  });

  const { data: summary = [] } = useQuery<SummaryItem[]>({
    queryKey: ["summary", siteId],
    enabled: !!siteId,
    queryFn: () =>
      axios.get(`/api/v1/sites/${siteId}/summary`, { headers: authHeader() }).then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: plates = [] } = useQuery<PlateEvent[]>({
    queryKey: ["plates", siteId],
    enabled: !!siteId,
    queryFn: () =>
      axios.get(`/api/v1/sites/${siteId}/plates`, { headers: authHeader() }).then(r => r.data),
    refetchInterval: 15_000,
  });

  const { events: liveEvents, status: wsStatus, lastHeartbeat } = useTrafficSocket(siteId);

  const liveN      = liveEvents.filter(e => e.direction === "N").length;
  const liveS      = liveEvents.filter(e => e.direction === "S").length;
  const liveTrucks = liveEvents.filter(e => e.vehicle_class === "truck").length;
  const liveBuses  = liveEvents.filter(e => e.vehicle_class === "bus").length;
  const totalSummary = summary.reduce((acc, s) => acc + s.total, 0);
  const selectedSite = sites.find(s => s.id === siteId);
  const platesRead   = plates.filter(p => p.plate !== "UNREAD");

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      {/* Subtle grid + orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(212,255,51,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,255,51,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="orb w-[500px] h-[500px] -top-40 -right-40" style={{ background: "rgba(212,255,51,0.04)" }} />
        <div className="orb w-[350px] h-[350px] bottom-0 left-1/3" style={{ background: "rgba(212,255,51,0.03)", animationDelay: "-7s" }} />
      </div>

      {/* Page header */}
      <div
        className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
        style={{
          background: "rgba(10,10,10,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,255,51,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {wsStatus === "connected" ? (
              <><Wifi className="w-3.5 h-3.5" style={{ color: "#D4FF33" }} /><span style={{ color: "#D4FF33" }}>Live</span></>
            ) : wsStatus === "connecting" ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "rgba(212,255,51,0.5)" }} /><span style={{ color: "rgba(212,255,51,0.5)" }}>Connecting</span></>
            ) : (
              <><WifiOff className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} /><span style={{ color: "rgba(255,255,255,0.2)" }}>Offline</span></>
            )}
          </div>
          {selectedSite && (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="w-3 h-3" />{selectedSite.location}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={siteId ?? ""} onValueChange={v => setSiteId(v || null)}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Select site..." />
            </SelectTrigger>
            <SelectContent>
              {sites.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name} — {s.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            style={{ background: "rgba(212,255,51,0.12)", color: "#D4FF33", border: "1px solid rgba(212,255,51,0.2)" }}
            onClick={() => setShowAddSite(true)}
          >
            <Plus className="w-3.5 h-3.5" />Add Site
          </Button>
        </div>
      </div>

      <div className="relative px-6 py-6 space-y-6">
        {!siteId ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(212,255,51,0.06)", border: "1px solid rgba(212,255,51,0.12)" }}
            >
              <Car className="w-8 h-8" style={{ color: "rgba(212,255,51,0.3)" }} />
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Select a monitoring site to begin</p>
            <Button
              variant="outline" size="sm"
              onClick={() => setShowAddSite(true)}
              className="gap-1.5"
              style={{ borderColor: "rgba(212,255,51,0.2)", color: "#D4FF33" }}
            >
              <Plus className="w-3.5 h-3.5" />Add your first site
            </Button>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Northbound (live)" value={liveN}
                icon={<ArrowUp className="w-4 h-4" style={{ color: "#D4FF33" }} />} accent="bg-[#D4FF33]/10" />
              <StatCard label="Southbound (live)" value={liveS}
                icon={<ArrowDown className="w-4 h-4" style={{ color: "#D4FF33" }} />} accent="bg-[#D4FF33]/10" />
              <StatCard label="Trucks detected" value={liveTrucks}
                icon={<Truck className="w-4 h-4" style={{ color: "#D4FF33" }} />} accent="bg-[#D4FF33]/10"
                sub={`${liveBuses} buses this session`} />
              <StatCard label="All-time total" value={totalSummary}
                icon={<Activity className="w-4 h-4" style={{ color: "#D4FF33" }} />} accent="bg-[#D4FF33]/10"
                sub={`${platesRead.length} plates read`} />
            </div>

            {/* Live feed + class chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassPanel label="Live Camera Feed">
                <LiveFeed
                  url="/stream"
                  className="aspect-video"
                  vehicleCount={liveEvents.length > 0 ? 1 : 0}
                  totalCounted={liveN + liveS}
                  wsConnected={wsStatus === "connected"}
                  lastHeartbeat={lastHeartbeat}
                />
              </GlassPanel>
              <GlassPanel label="Vehicle Counts by Class (all-time)">
                <CountChart data={summary} />
              </GlassPanel>
            </div>

            {/* Real-time charts */}
            <RealtimeCharts events={liveEvents} />

            {/* Live ticker */}
            <GlassPanel
              label="Live Vehicle Events"
              right={
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#D4FF33" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#D4FF33" }} />
                  {liveEvents.length} this session
                </div>
              }
            >
              <VehicleTicker events={liveEvents} />
            </GlassPanel>

            {/* Plate reads */}
            <GlassPanel
              label="Plate Reads"
              right={
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{platesRead.length} records</Badge>
                  {platesRead.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
                      onClick={() => exportCSV(plates, selectedSite?.name ?? siteId!)}>
                      <Download className="w-3 h-3" />CSV
                    </Button>
                  )}
                </div>
              }
            >
              <ScrollArea className="h-[280px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 backdrop-blur-sm" style={{ background: "rgba(10,10,10,0.8)" }}>
                    <tr className="text-left text-xs border-b" style={{ color: "rgba(255,255,255,0.3)", borderColor: "rgba(212,255,51,0.08)" }}>
                      <th className="pb-2 pr-4 font-medium">Time</th>
                      <th className="pb-2 pr-4 font-medium">Plate</th>
                      <th className="pb-2 pr-4 font-medium">Class</th>
                      <th className="pb-2 pr-4 font-medium">Dir.</th>
                      <th className="pb-2 pr-4 font-medium">Speed</th>
                      <th className="pb-2 font-medium">Conf.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platesRead.slice(0, 100).map(p => (
                      <tr key={p.id} className="border-b transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: "rgba(212,255,51,0.05)" }}>
                        <td className="py-2 pr-4 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {format(new Date(p.timestamp), "dd MMM HH:mm:ss")}
                        </td>
                        <td className="py-2 pr-4 font-mono font-semibold text-xs text-white">{p.plate}</td>
                        <td className="py-2 pr-4 capitalize text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{p.vehicle_class}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={p.direction === "N" ? "north" : "south"}>
                            {p.direction === "N" ? "↑ N" : "↓ S"}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {p.speed_px_s ? `${Math.round(p.speed_px_s)} px/s` : "—"}
                        </td>
                        <td className="py-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {(p.confidence * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                    {platesRead.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
                        No plate reads yet
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </GlassPanel>
          </>
        )}
      </div>

      {showAddSite && (
        <AddSiteModal
          onClose={() => setShowAddSite(false)}
          onCreated={() => refetchSites()}
          getAuthHeader={authHeader}
        />
      )}
    </div>
  );
}



