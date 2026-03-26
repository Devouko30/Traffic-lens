/**
 * RealtimeCharts — live recharts panels fed by WebSocket events.
 * Shows: rolling 60-second line chart, vehicle-class donut, direction gauge.
 */
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { format } from "date-fns";
import type { TrafficEvent } from "../hooks/useTrafficSocket";

interface Props {
  events: TrafficEvent[];
}

const CLASS_COLORS: Record<string, string> = {
  car:        "#3b82f6",
  truck:      "#f59e0b",
  bus:        "#10b981",
  motorcycle: "#8b5cf6",
};
const FALLBACK_COLOR = "#71717a";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-white/10 p-3 text-xs shadow-glass"
      style={{
        background: "rgba(9,9,11,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.fill }} />
          <span className="text-zinc-300">{p.name}:</span>
          <span className="font-bold text-zinc-100">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/** Bucket events into 5-second windows over the last 60 seconds */
function useRollingBuckets(events: TrafficEvent[]) {
  return useMemo(() => {
    const now = Date.now();
    const WINDOW = 60_000; // 60 s
    const BUCKET = 5_000;  // 5 s buckets → 12 buckets
    const buckets: Record<number, { N: number; S: number; total: number }> = {};

    for (let t = now - WINDOW; t <= now; t += BUCKET) {
      buckets[t] = { N: 0, S: 0, total: 0 };
    }

    for (const e of events) {
      const ts = new Date(e.timestamp).getTime();
      if (ts < now - WINDOW) continue;
      const key = Math.floor(ts / BUCKET) * BUCKET;
      if (!buckets[key]) buckets[key] = { N: 0, S: 0, total: 0 };
      buckets[key][e.direction]++;
      buckets[key].total++;
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([ts, v]) => ({
        time: format(new Date(Number(ts)), "HH:mm:ss"),
        Northbound: v.N,
        Southbound: v.S,
        Total: v.total,
      }));
  }, [events]);
}

/** Count by vehicle class */
function useClassBreakdown(events: TrafficEvent[]) {
  return useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.vehicle_class] = (counts[e.vehicle_class] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [events]);
}

export default function RealtimeCharts({ events }: Props) {
  const rollingData = useRollingBuckets(events);
  const classData   = useClassBreakdown(events);

  const northTotal = events.filter(e => e.direction === "N").length;
  const southTotal = events.filter(e => e.direction === "S").length;
  const dirData = [
    { name: "Northbound", value: northTotal },
    { name: "Southbound", value: southTotal },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Rolling 60-second line chart */}
      <div
        className="md:col-span-2 rounded-2xl p-4 border border-white/[0.07]"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}
      >
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Live Traffic — Last 60 seconds
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rollingData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "#52525b" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#52525b" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<GlassTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
            <Line
              type="monotone"
              dataKey="Northbound"
              stroke="#E8001D"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#E8001D" }}
            />
            <Line
              type="monotone"
              dataKey="Southbound"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Class breakdown donut */}
      <div
        className="rounded-2xl p-4 border border-white/[0.07] flex flex-col"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}
      >
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Vehicle Types (session)
        </p>
        {classData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
            Waiting for data…
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {classData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CLASS_COLORS[entry.name] ?? FALLBACK_COLOR}
                      opacity={0.9}
                    />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {classData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: CLASS_COLORS[d.name] ?? FALLBACK_COLOR }}
                    />
                    <span className="text-zinc-400 capitalize">{d.name}</span>
                  </div>
                  <span className="font-semibold text-zinc-200 tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Direction split bar */}
      <div
        className="md:col-span-3 rounded-2xl p-4 border border-white/[0.07]"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}
      >
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Direction Split (session)
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-red-400">↑ Northbound</span>
              <span className="font-bold text-zinc-100">{northTotal}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{
                  width: `${northTotal + southTotal > 0 ? (northTotal / (northTotal + southTotal)) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="text-xs text-zinc-600 shrink-0 tabular-nums">
            {northTotal + southTotal > 0
              ? `${Math.round((northTotal / (northTotal + southTotal)) * 100)}% / ${Math.round((southTotal / (northTotal + southTotal)) * 100)}%`
              : "—"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-blue-400">↓ Southbound</span>
              <span className="font-bold text-zinc-100">{southTotal}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${northTotal + southTotal > 0 ? (southTotal / (northTotal + southTotal)) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
