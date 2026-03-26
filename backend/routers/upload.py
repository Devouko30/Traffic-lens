import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from ..auth import get_current_user

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
MAX_SIZE_BYTES = 2 * 1024 * 1024 * 1024  # 2 GB

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("")
async def upload_video(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    filename = f"{uuid.uuid4()}{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)

    size = 0
    with open(dest, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1 MB chunks
            size += len(chunk)
            if size > MAX_SIZE_BYTES:
                f.close()
                os.remove(dest)
                raise HTTPException(status_code=413, detail="File too large (max 2 GB)")
            f.write(chunk)

    return {"path": dest, "filename": filename, "size_mb": round(size / 1024 / 1024, 1)}
