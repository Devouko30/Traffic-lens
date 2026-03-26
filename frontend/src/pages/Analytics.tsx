import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, parseISO } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../hooks/AuthContext";
import { Car, TrendingUp, Percent, ArrowUp, ArrowDown } from "lucide-react";

interface Site { id: string; name: string; location: string; }
interface HourlyBucket { hour: string; northbound: number; southbound: number; total: number; }
interface SiteStats {
  site_id: string; total_vehicles: number; northbound: number;
  southbound: number; top_class: string | null; plate_read_rate: number;
}

const Y = "#D4FF33";
const COLORS = [Y, "rgba(212,255,51,0.45)", "rgba(212,255,51,0.25)", "rgba(255,255,255,0.2)"];

const glass: React.CSSProperties = {
  background: "rgba(10,10,10,0.6)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(212,255,51,0.07)",
  borderRadius: 16,
};

const AreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(212,255,51,0.15)", borderRadius: 12, padding: "10px 14px", fontSize: 11 }}>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.stroke, display: "inline-block" }} />
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: "#fff" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function StatCard({ label, value, icon, sub }: { label: string; value: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div style={{ ...glass, padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(212,255,51,0.1)", border: "1px solid rgba(212,255,51,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default function Analytics() {
  const { authHeader } = useAuth();
  const [siteId, setSiteId] = useState<string | null>(null);
  const [hours, setHours] = useState("24");

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: () => axios.get("/api/v1/sites", { headers: authHeader() }).then(r => r.data),
  });

  const { data: hourly = [], isLoading: loadingHourly } = useQuery<HourlyBucket[]>({
    queryKey: ["hourly", siteId, hours],
    enabled: !!siteId,
    queryFn: () => axios.get(`/api/v1/analytics/${siteId}/hourly?hours=${hours}`, { headers: authHeader() }).then(r => r.data),
    refetchInterval: 60_000,
  });

  const { data: stats } = useQuery<SiteStats>({
    queryKey: ["stats", siteId],
    enabled: !!siteId,
    queryFn: () => axios.get(`/api/v1/analytics/${siteId}/stats`, { headers: authHeader() }).then(r => r.data),
    refetchInterval: 60_000,
  });

  const chartData = hourly.map(b => ({ ...b, hour: format(parseISO(b.hour), "HH:mm") }));
  const pieData = stats ? [{ name: "Northbound", value: stats.northbound }, { name: "Southbound", value: stats.southbound }] : [];
  const peakBucket = hourly.reduce((max, b) => (b.total > (max?.total ?? 0) ? b : max), null as HourlyBucket | null);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(212,255,51,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,255,51,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="orb w-[500px] h-[500px] -top-40 -right-40" style={{ background: "rgba(212,255,51,0.04)" }} />
      </div>

      {/* Page header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,255,51,0.07)" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>Analytics</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Select value={siteId ?? ""} onValueChange={v => setSiteId(v || null)}>
            <SelectTrigger className="w-52 h-8 text-xs"><SelectValue placeholder="Select site..." /></SelectTrigger>
            <SelectContent>{sites.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name} — {s.location}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={hours} onValueChange={setHours}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6h</SelectItem>
              <SelectItem value="24">Last 24h</SelectItem>
              <SelectItem value="48">Last 48h</SelectItem>
              <SelectItem value="168">Last 7d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div style={{ position: "relative", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
        {!siteId ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 0", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(212,255,51,0.06)", border: "1px solid rgba(212,255,51,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp style={{ width: 28, height: 28, color: "rgba(212,255,51,0.3)" }} />
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Select a site to view analytics</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                <StatCard label="Total Vehicles" value={stats.total_vehicles.toLocaleString()} icon={<Car style={{ width: 16, height: 16, color: Y }} />} sub={stats.top_class ? `Top: ${stats.top_class}` : undefined} />
                <StatCard label="Northbound" value={stats.northbound.toLocaleString()} icon={<ArrowUp style={{ width: 16, height: 16, color: Y }} />} />
                <StatCard label="Southbound" value={stats.southbound.toLocaleString()} icon={<ArrowDown style={{ width: 16, height: 16, color: Y }} />} />
                <StatCard label="Plate Read Rate" value={(stats.plate_read_rate * 100).toFixed(1) + "%"} icon={<Percent style={{ width: 16, height: 16, color: Y }} />} />
              </div>
            )}

            {/* Peak hour */}
            {peakBucket && (
              <div style={{ ...glass, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(212,255,51,0.1)", border: "1px solid rgba(212,255,51,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TrendingUp style={{ width: 18, height: 18, color: Y }} />
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Peak Hour</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                    {format(parseISO(peakBucket.hour), "HH:mm")} —{" "}
                    <span style={{ color: Y }}>{peakBucket.total} vehicles</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: 8 }}>
                      ({peakBucket.northbound}↑ {peakBucket.southbound}↓)
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              {/* Area chart */}
              <div style={{ ...glass, padding: "20px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Hourly Traffic Volume</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16 }}>Vehicle crossings per hour</p>
                {loadingHourly ? (
                  <div className="shimmer" style={{ height: 280, borderRadius: 12 }} />
                ) : chartData.length === 0 ? (
                  <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No data for this period</div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradN" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={Y} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={Y} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradS" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgba(212,255,51,0.4)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor={Y} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,255,51,0.05)" vertical={false} />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} axisLine={{ stroke: "rgba(212,255,51,0.08)" }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<AreaTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }} />
                      <Area type="monotone" dataKey="northbound" name="Northbound" stroke={Y} fill="url(#gradN)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="southbound" name="Southbound" stroke="rgba(212,255,51,0.5)" fill="url(#gradS)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Direction pie */}
              <div style={{ ...glass, padding: "20px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Direction Split</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16 }}>All-time N vs S</p>
                {pieData.every(d => d.value === 0) ? (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No data</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} opacity={0.9} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(212,255,51,0.15)", borderRadius: 10, fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                      {pieData.map((d, i) => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i], display: "inline-block" }} />
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>{d.name}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


