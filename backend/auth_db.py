"""
Lightweight SQLite store for users + sessions.
Used instead of Supabase tables so auth works with zero migration setup.
"""
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "trafficlens.db"


def _conn() -> sqlite3.Connection:
    con = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    con.row_factory = sqlite3.Row
    return con


def init_db() -> None:
    with _conn() as con:
        con.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id           TEXT PRIMARY KEY,
                email        TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at   TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS user_sessions (
                id         TEXT PRIMARY KEY,
                user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)
        init_sites(con)


# ── Users ─────────────────────────────────────────────────────────────────────

def get_user_by_email(email: str) -> dict | None:
    with _conn() as con:
        row = con.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row) if row else None


def create_user(email: str, password_hash: str) -> dict:
    user_id = str(uuid.uuid4())
    with _conn() as con:
        con.execute(
            "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
            (user_id, email, password_hash),
        )
    return {"id": user_id, "email": email}


# ── Sessions ──────────────────────────────────────────────────────────────────

def create_session_row(session_id: str, user_id: str, expires_at: datetime) -> None:
    with _conn() as con:
        con.execute(
            "INSERT INTO user_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
            (session_id, user_id, expires_at.isoformat()),
        )


def get_session(session_id: str) -> dict | None:
    with _conn() as con:
        row = con.execute(
            "SELECT * FROM user_sessions WHERE id = ?", (session_id,)
        ).fetchone()
        return dict(row) if row else None


def delete_session(session_id: str) -> None:
    with _conn() as con:
        con.execute("DELETE FROM user_sessions WHERE id = ?", (session_id,))


def get_user_by_id(user_id: str) -> dict | None:
    with _conn() as con:
        row = con.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


# ── Sites ─────────────────────────────────────────────────────────────────────

def init_sites(con) -> None:
    con.executescript("""
        CREATE TABLE IF NOT EXISTS sites (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL,
            location     TEXT NOT NULL,
            rtsp_url     TEXT NOT NULL,
            line_y_ratio REAL NOT NULL DEFAULT 0.6,
            created_at   TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS count_events (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id       TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
            timestamp     TEXT NOT NULL,
            track_id      INTEGER NOT NULL,
            vehicle_class TEXT NOT NULL DEFAULT 'car',
            direction     TEXT NOT NULL DEFAULT 'N',
            plate         TEXT NOT NULL DEFAULT 'UNREAD',
            confidence    REAL NOT NULL DEFAULT 0.0,
            speed_px_s    REAL
        );
        CREATE INDEX IF NOT EXISTS idx_events_site ON count_events(site_id);
        CREATE INDEX IF NOT EXISTS idx_events_ts   ON count_events(timestamp);
    """)


def get_all_sites() -> list[dict]:
    with _conn() as con:
        rows = con.execute("SELECT * FROM sites ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


def get_site(site_id: str) -> dict | None:
    with _conn() as con:
        row = con.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
        return dict(row) if row else None


def insert_site(site: dict) -> dict:
    with _conn() as con:
        con.execute(
            "INSERT INTO sites (id, name, location, rtsp_url, line_y_ratio) VALUES (?,?,?,?,?)",
            (site["id"], site["name"], site["location"], site["rtsp_url"], site["line_y_ratio"]),
        )
    return get_site(site["id"])


def update_site(site_id: str, updates: dict) -> dict | None:
    if not updates:
        return get_site(site_id)
    cols = ", ".join(f"{k} = ?" for k in updates)
    vals = list(updates.values()) + [site_id]
    with _conn() as con:
        con.execute(f"UPDATE sites SET {cols} WHERE id = ?", vals)
    return get_site(site_id)


def delete_site(site_id: str) -> bool:
    with _conn() as con:
        cur = con.execute("DELETE FROM sites WHERE id = ?", (site_id,))
        return cur.rowcount > 0


def get_site_events(site_id: str, limit: int = 200) -> list[dict]:
    with _conn() as con:
        rows = con.execute(
            "SELECT * FROM count_events WHERE site_id = ? ORDER BY timestamp DESC LIMIT ?",
            (site_id, limit),
        ).fetchall()
        return [dict(r) for r in rows]


def get_site_summary(site_id: str) -> list[dict]:
    with _conn() as con:
        rows = con.execute(
            """SELECT vehicle_class, direction, COUNT(*) as total
               FROM count_events WHERE site_id = ?
               GROUP BY vehicle_class, direction""",
            (site_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def insert_event(event: dict) -> None:
    with _conn() as con:
        con.execute(
            """INSERT INTO count_events
               (site_id, timestamp, track_id, vehicle_class, direction, plate, confidence, speed_px_s)
               VALUES (?,?,?,?,?,?,?,?)""",
            (
                event["site_id"], event["timestamp"], event["track_id"],
                event.get("vehicle_class", "car"), event.get("direction", "N"),
                event.get("plate", "UNREAD"), event.get("confidence", 0.0),
                event.get("speed_px_s"),
            ),
        )
