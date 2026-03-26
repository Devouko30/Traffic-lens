/**
 * VehicleTicker — real-time scrolling feed of vehicle crossing events.
 * Shows thumbnail, class badge, plate, direction, speed, confidence.
 */
import { useRef, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import type { TrafficEvent } from "../hooks/useTrafficSocket";

interface Props {
  events: TrafficEvent[];
  maxVisible?: number;
}

const CLASS_COLORS: Record<string, string> = {
  car:        "bg-blue-500/20 text-blue-300 border-blue-500/30",
  truck:      "bg-amber-500/20 text-amber-300 border-amber-500/30",
  bus:        "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  motorcycle: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function VehicleTicker({ events, maxVisible = 60 }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on new event
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const visible = events.slice(0, maxVisible);

  if (visible.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-zinc-600 text-sm">
        Waiting for vehicles…
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-[280px] overflow-y-auto space-y-1 pr-1"
      style={{ scrollbarWidth: "thin" }}
    >
      {visible.map((e, i) => (
        <div
          key={`${e.track_id}-${e.timestamp}-${i}`}
          className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/[0.05] transition-all duration-200 hover:border-white/10"
          style={{
            background: i === 0
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,255,255,0.02)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          {/* Thumbnail */}
          <div className="w-12 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
            {e.thumb ? (
              <img
                src={`data:image/jpeg;base64,${e.thumb}`}
                alt={e.vehicle_class}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                {e.vehicle_class?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          {/* Class badge */}
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${
              CLASS_COLORS[e.vehicle_class] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            {e.vehicle_class}
          </span>

          {/* Direction */}
          <Badge
            variant={e.direction === "N" ? "north" : "south"}
            className="shrink-0 text-[10px]"
          >
            {e.direction === "N" ? "↑ N" : "↓ S"}
          </Badge>

          {/* Plate */}
          <span className="font-mono text-xs font-semibold text-zinc-100 min-w-[72px]">
            {e.plate !== "UNREAD" ? e.plate : <span className="text-zinc-600">—</span>}
          </span>

          {/* Speed */}
          {e.speed_px_s !== undefined && e.speed_px_s > 0 && (
            <span className="text-[10px] text-zinc-500 shrink-0">
              {Math.round(e.speed_px_s)} px/s
            </span>
          )}

          {/* Confidence */}
          <span className="text-[10px] text-zinc-600 ml-auto shrink-0">
            {(e.confidence * 100).toFixed(0)}%
          </span>

          {/* Timestamp */}
          <span className="text-[10px] text-zinc-600 shrink-0 w-16 text-right">
            {format(new Date(e.timestamp), "HH:mm:ss")}
          </span>
        </div>
      ))}
    </div>
  );
}
