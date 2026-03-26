import { useState, useEffect, useRef } from "react";
import { VideoOff, Wifi, WifiOff, Eye } from "lucide-react";

interface LiveFeedProps {
  url: string;
  className?: string;
  vehicleCount?: number;
  totalCounted?: number;
  wsConnected?: boolean;
  lastHeartbeat?: Date | null;
}

export default function LiveFeed({
  url,
  className = "",
  vehicleCount = 0,
  totalCounted = 0,
  wsConnected = false,
  lastHeartbeat = null,
}: LiveFeedProps) {
  const [error, setError] = useState(false);
  const [streamAlive, setStreamAlive] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Detect if MJPEG stream is actually delivering frames
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imgRef.current && imgRef.current.naturalWidth > 0) {
        setStreamAlive(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [error]);

  // Heartbeat staleness check
  const heartbeatAge = lastHeartbeat
    ? Math.floor((Date.now() - lastHeartbeat.getTime()) / 1000)
    : null;
  const engineAlive = heartbeatAge !== null && heartbeatAge < 15;

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#0A0A0A] ${className}`}>
      {/* MJPEG stream */}
      {!error ? (
        <img
          ref={imgRef}
          src={url}
          alt="Live camera feed"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
          onLoad={() => setStreamAlive(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[240px] gap-3 text-zinc-600">
          <VideoOff className="w-10 h-10" />
          <p className="text-sm">Stream unavailable</p>
          <button
            className="text-xs text-zinc-500 underline"
            onClick={() => setError(false)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Glassmorphism top bar overlay */}
      {!error && (
        <div
          className="absolute inset-x-0 top-0 h-14 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,8,0.82) 0%, rgba(5,5,8,0.0) 100%)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Glassmorphism bottom bar overlay */}
      {!error && (
        <div
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(5,5,8,0.88) 0%, rgba(5,5,8,0.0) 100%)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* LIVE badge */}
      {!error && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 shadow-glass">
          <span
            className={`w-2 h-2 rounded-full ${streamAlive ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`}
          />
          LIVE
        </div>
      )}

      {/* Engine status */}
      {!error && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-xs px-2.5 py-1 rounded-full border border-white/10 shadow-glass">
          {engineAlive ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">AI Engine</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-zinc-500" />
              <span className="text-zinc-500">Engine offline</span>
            </>
          )}
        </div>
      )}

      {/* Bottom stats bar */}
      {!error && (
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-glass">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-300">
              <span className="font-semibold text-white">{vehicleCount}</span> in frame
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-glass">
            <span className="text-xs text-zinc-300">
              <span className="font-semibold text-emerald-400">{totalCounted}</span> counted
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
