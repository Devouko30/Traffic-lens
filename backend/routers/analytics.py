"""Analytics router — backed by Supabase RPC functions."""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase._async.client import AsyncClient
from ..db import get_supabase
from ..auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


class HourlyBucket(BaseModel):
    hour: str
    northbound: int
    southbound: int
    total: int


class SiteStats(BaseModel):
    site_id: str
    total_vehicles: int
    northbound: int
    southbound: int
    top_class: Optional[str]
    plate_read_rate: float


@router.get("/{site_id}/hourly", response_model=list[HourlyBucket])
async def hourly_trend(
    site_id: str,
    hours: int = 24,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    """Return per-hour vehicle counts for the last N hours (uses DB RPC `get_hourly_trend`)."""
    if hours < 1 or hours > 168:
        raise HTTPException(status_code=400, detail="hours must be between 1 and 168")

    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    res = await supabase.rpc(
        "get_hourly_trend", {"p_site_id": site_id, "p_since": since}
    ).execute()
    return res.data


@router.get("/{site_id}/stats", response_model=SiteStats)
async def site_stats(
    site_id: str,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    """Return aggregate stats for a site (uses DB RPC `get_site_stats`)."""
    # Verify site exists
    site_res = await supabase.table("sites").select("id").eq("id", site_id).execute()
    if not site_res.data:
        raise HTTPException(status_code=404, detail="Site not found")

    res = await supabase.rpc("get_site_stats", {"p_site_id": site_id}).execute()
    if not res.data:
        return SiteStats(
            site_id=site_id,
            total_vehicles=0,
            northbound=0,
            southbound=0,
            top_class=None,
            plate_read_rate=0.0,
        )
    return res.data[0]
