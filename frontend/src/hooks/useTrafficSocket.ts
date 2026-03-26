import { useEffect, useRef, useState, useCallback } from "react";

export interface TrafficEvent {
  type: "vehicle" | "heartbeat" | "ping";
  site_id: string;
  timestamp: string;
  track_id: number;
  vehicle_class: string;
  direction: "N" | "S";
  plate: string;
  confidence: number;
  speed_px_s?: number;
  thumb?: string; // base64 JPEG
}

export type WsStatus = "connecting" | "connected" | "disconnected";

const MAX_EVENTS = 500;
const INITIAL_BACKOFF = 1_000;
const MAX_BACKOFF = 30_000;

export function useTrafficSocket(siteId: string | null) {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(INITIAL_BACKOFF);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!siteId || !mountedRef.current) return;

    setStatus("connecting");
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${window.location.host}/ws/${siteId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      backoffRef.current = INITIAL_BACKOFF;
      setStatus("connected");
    };

    ws.onmessage = (e) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(e.data) as TrafficEvent;
        if (data.type === "ping") return;
        if (data.type === "heartbeat") {
          setLastHeartbeat(new Date(data.timestamp));
          return;
        }
        setEvents((prev) => {
          const next = [data, ...prev];
          return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
        });
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setStatus("disconnected");
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus("disconnected");
      retryTimerRef.current = setTimeout(() => {
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF);
        connect();
      }, backoffRef.current);
    };
  }, [siteId]);

  useEffect(() => {
    mountedRef.current = true;
    setEvents([]);
    connect();

    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { events, status, lastHeartbeat };
}
