import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid, Cell,
} from "recharts";

interface SummaryItem {
  vehicle_class: string;
  direction: string;
  total: number;
}

interface Props {
  data: SummaryItem[];
}

const CLASS_COLORS: Record<string, string> = {
  car:        "#3b82f6",
  truck:      "#f59e0b",
  bus:        "#10b981",
  motorcycle: "#8b5cf6",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-white/10 p-3 shadow-glass text-xs"
      style={{
        background: "rgba(9,9,11,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <p className="font-semibold text-zinc-200 mb-1.5 capitalize">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-zinc-400">{p.name}:</span>
          <span className="font-bold text-zinc-100">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function CountChart({ data }: Props) {
  const pivot: Record<string, { N: number; S: number; total: number }> = {};
  for (const item of data) {
    if (!pivot[item.vehicle_class]) pivot[item.vehicle_class] = { N: 0, S: 0, total: 0 };
    pivot[item.vehicle_class][item.direction as "N" | "S"] += item.total;
    pivot[item.vehicle_class].total += item.total;
  }
  const chartData = Object.entries(pivot).map(([cls, dirs]) => ({
    class: cls,
    Northbound: dirs.N,
    Southbound: dirs.S,
    total: dirs.total,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-zinc-600 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="class"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
        <Bar dataKey="Northbound" fill="#E8001D" radius={[4, 4, 0, 0]} maxBarSize={36} />
        <Bar dataKey="Southbound" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
