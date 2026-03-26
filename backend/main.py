import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as aioredis
from .config import settings
from .routers import auth, sites, websocket, analytics
from .routers.upload import router as upload_router
from .routers.websocket import redis_subscriber

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("traffic_lens")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting — Supabase backend")
    redis_ok = False
    try:
        client = aioredis.from_url(settings.redis_url, decode_responses=True)
        await client.ping()
        await client.aclose()
        logger.info("Redis OK")
        redis_ok = True
    except Exception as exc:
        logger.warning(f"Redis not reachable — WebSocket fan-out disabled: {exc}")

    task = None
    if redis_ok:
        task = asyncio.create_task(redis_subscriber())
    yield
    if task:
        task.cancel()


app = FastAPI(
    title="Traffic Lens Africa API",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(sites.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(upload_router, prefix="/api/v1")
app.include_router(websocket.router)


@app.get("/health", tags=["health"])
async def health():
    checks: dict[str, str] = {}
    try:
        client = aioredis.from_url(settings.redis_url, decode_responses=True)
        await client.ping()
        await client.aclose()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "unreachable"
    status_str = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return {"status": status_str, **checks}
