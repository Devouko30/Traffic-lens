import json
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as aioredis
from ..config import settings
from ..db import get_supabase
from ..schemas import TrafficEvent

router = APIRouter(tags=["websocket"])

# site_id → set of connected websockets
_connections: dict[str, set[WebSocket]] = {}


@router.websocket("/ws/{site_id}")
async def ws_endpoint(websocket: WebSocket, site_id: str):
    await websocket.accept()
    _connections.setdefault(site_id, set()).add(websocket)
    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_text('{"type":"ping"}')
    except WebSocketDisconnect:
        pass
    finally:
        _connections.get(site_id, set()).discard(websocket)


async def broadcast_to_site(site_id: str, message: str) -> None:
    dead: set[WebSocket] = set()
    for ws in list(_connections.get(site_id, set())):
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    _connections.get(site_id, set()).difference_update(dead)


async def _persist_event(event: TrafficEvent) -> None:
    """Persist a traffic event to Supabase (skip thumbnails — too large for DB)."""
    supabase = await get_supabase()
    ts = event.timestamp
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    await supabase.table("count_events").insert({
        "site_id":       event.site_id,
        "timestamp":     ts.isoformat(),
        "track_id":      event.track_id,
        "vehicle_class": event.vehicle_class or "unknown",
        "direction":     event.direction,
        "plate":         event.plate,
        "confidence":    event.confidence,
        "speed_px_s":    event.speed_px_s,
    }).execute()


async def redis_subscriber() -> None:
    """Background task: subscribe to Redis traffic:events, persist to Supabase, fan-out to WS."""
    client = aioredis.from_url(settings.redis_url, decode_responses=True)
    pubsub = client.pubsub()
    await pubsub.subscribe("traffic:events")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue
        try:
            data = json.loads(message["data"])
            site_id = data.get("site_id")
            if not site_id:
                continue

            event_type = data.get("type", "vehicle")

            # Heartbeat — fan-out only, no DB write
            if event_type == "heartbeat":
                await broadcast_to_site(site_id, message["data"])
                continue

            # Vehicle event — persist (without thumb) then fan-out with thumb
            event = TrafficEvent.from_redis(data)
            asyncio.create_task(_persist_event(event))
            await broadcast_to_site(site_id, message["data"])
        except Exception as exc:
            print(f"[WS subscriber] error: {exc}")
