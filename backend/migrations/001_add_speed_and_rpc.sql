-- Migration: add speed_px_s column + ensure RPC functions exist
-- Run this in your Supabase SQL editor

-- 1. Add speed column (safe to run multiple times)
ALTER TABLE count_events
  ADD COLUMN IF NOT EXISTS speed_px_s FLOAT;

-- 2. RPC: get_site_summary — vehicle counts grouped by class + direction
CREATE OR REPLACE FUNCTION get_site_summary(p_site_id TEXT)
RETURNS TABLE(vehicle_class TEXT, direction TEXT, total BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT vehicle_class, direction, COUNT(*) AS total
  FROM count_events
  WHERE site_id = p_site_id
  GROUP BY vehicle_class, direction
  ORDER BY total DESC;
$$;

-- 3. RPC: get_hourly_trend — per-hour N/S counts since a given timestamp
CREATE OR REPLACE FUNCTION get_hourly_trend(p_site_id TEXT, p_since TIMESTAMPTZ)
RETURNS TABLE(hour TEXT, northbound BIGINT, southbound BIGINT, total BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT
    to_char(date_trunc('hour', timestamp), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS hour,
    COUNT(*) FILTER (WHERE direction = 'N') AS northbound,
    COUNT(*) FILTER (WHERE direction = 'S') AS southbound,
    COUNT(*) AS total
  FROM count_events
  WHERE site_id = p_site_id
    AND timestamp >= p_since
  GROUP BY date_trunc('hour', timestamp)
  ORDER BY date_trunc('hour', timestamp);
$$;

-- 4. RPC: get_site_stats — aggregate stats for a site
CREATE OR REPLACE FUNCTION get_site_stats(p_site_id TEXT)
RETURNS TABLE(
  site_id TEXT,
  total_vehicles BIGINT,
  northbound BIGINT,
  southbound BIGINT,
  top_class TEXT,
  plate_read_rate FLOAT
)
LANGUAGE sql STABLE AS $$
  WITH counts AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE direction = 'N') AS north,
      COUNT(*) FILTER (WHERE direction = 'S') AS south,
      COUNT(*) FILTER (WHERE plate != 'UNREAD') AS plates_read
    FROM count_events
    WHERE site_id = p_site_id
  ),
  top AS (
    SELECT vehicle_class
    FROM count_events
    WHERE site_id = p_site_id
    GROUP BY vehicle_class
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT
    p_site_id,
    counts.total,
    counts.north,
    counts.south,
    top.vehicle_class,
    CASE WHEN counts.total > 0
      THEN counts.plates_read::FLOAT / counts.total
      ELSE 0.0
    END
  FROM counts, top;
$$;
