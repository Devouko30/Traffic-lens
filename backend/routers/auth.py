import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional

from ..config import settings
from ..auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

_AUTH_BASE = f"{settings.supabase_url}/auth/v1"
_HEADERS = {"apikey": settings.supabase_anon_key, "Content-Type": "application/json"}


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


async def _post(path: str, body: dict) -> dict:
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{_AUTH_BASE}{path}", json=body, headers=_HEADERS)
    if res.status_code >= 400:
        data = res.json()
        detail = data.get("error_description") or data.get("msg") or data.get("error") or res.text
        raise HTTPException(status_code=res.status_code, detail=detail)
    return res.json()


@router.post("/register", status_code=201)
async def register(body: AuthRequest):
    data = await _post("/signup", {"email": body.email, "password": body.password})
    user = data.get("user") or data
    return {"id": user["id"], "email": user["email"]}


@router.post("/login")
async def login(body: AuthRequest):
    data = await _post(
        "/token?grant_type=password",
        {"email": body.email, "password": body.password},
    )
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "token_type": "bearer",
    }


@router.post("/refresh")
async def refresh(body: dict):
    rt = body.get("refresh_token")
    if not rt:
        raise HTTPException(status_code=400, detail="refresh_token required")
    data = await _post("/token?grant_type=refresh_token", {"refresh_token": rt})
    return {
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
):
    if credentials:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{_AUTH_BASE}/logout",
                headers={**_HEADERS, "Authorization": f"Bearer {credentials.credentials}"},
            )
    return {"detail": "Logged out"}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["sub"], "email": user.get("email")}
