"""Sites CRUD router — backed by Supabase."""
from fastapi import APIRouter, Depends, HTTPException
from supabase._async.client import AsyncClient
from ..db import get_supabase
from ..auth import get_current_user
from ..schemas import SiteCreate, SiteUpdate, SiteOut, CountSummaryItem, CountEventOut

router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("", response_model=list[SiteOut])
async def list_sites(
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    res = await supabase.table("sites").select("*").order("created_at", desc=True).execute()
    return res.data


@router.post("", response_model=SiteOut, status_code=201)
async def create_site(
    body: SiteCreate,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    existing = await supabase.table("sites").select("id").eq("id", body.id).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail=f"Site '{body.id}' already exists")
    res = await supabase.table("sites").insert(body.model_dump()).execute()
    return res.data[0]


@router.get("/{site_id}", response_model=SiteOut)
async def get_site(
    site_id: str,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    res = await supabase.table("sites").select("*").eq("id", site_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Site not found")
    return res.data[0]


@router.patch("/{site_id}", response_model=SiteOut)
async def update_site(
    site_id: str,
    body: SiteUpdate,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await supabase.table("sites").update(updates).eq("id", site_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Site not found")
    return res.data[0]


@router.delete("/{site_id}", status_code=204)
async def delete_site(
    site_id: str,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    # cascade delete events first
    await supabase.table("count_events").delete().eq("site_id", site_id).execute()
    res = await supabase.table("sites").delete().eq("id", site_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Site not found")


@router.get("/{site_id}/summary", response_model=list[CountSummaryItem])
async def site_summary(
    site_id: str,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    # Use Supabase RPC for aggregation (expects a DB function `get_site_summary`)
    res = await supabase.rpc("get_site_summary", {"p_site_id": site_id}).execute()
    return res.data


@router.get("/{site_id}/plates", response_model=list[CountEventOut])
async def site_plates(
    site_id: str,
    limit: int = 200,
    supabase: AsyncClient = Depends(get_supabase),
    _: dict = Depends(get_current_user),
):
    limit = min(limit, 500)
    res = (
        await supabase.table("count_events")
        .select("id,site_id,timestamp,track_id,vehicle_class,direction,plate,confidence,speed_px_s")
        .eq("site_id", site_id)
        .order("timestamp", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data
