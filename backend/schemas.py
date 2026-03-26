from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SiteCreate(BaseModel):
    id: str
    name: str
    location: str
    rtsp_url: str
    line_y_ratio: float = 0.6


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    rtsp_url: Optional[str] = None
    line_y_ratio: Optional[float] = None


class SiteOut(SiteCreate):
    created_at: datetime
    model_config = {"from_attributes": True}


class CountEventOut(BaseModel):
    id: int
    site_id: str
    timestamp: datetime
    track_id: int
    vehicle_class: str
    direction: str
    plate: str
    confidence: float
    speed_px_s: Optional[float] = None
    model_config = {"from_attributes": True}


class CountSummaryItem(BaseModel):
    vehicle_class: str
    direction: str
    total: int


class TrafficEvent(BaseModel):
    type: str = "vehicle"
    site_id: str
    timestamp: datetime
    track_id: int
    vehicle_class: Optional[str] = None
    direction: str
    plate: str = "UNREAD"
    confidence: float = 0.0
    speed_px_s: Optional[float] = None
    thumb: Optional[str] = None

    model_config = {"populate_by_name": True}

    @classmethod
    def from_redis(cls, data: dict) -> "TrafficEvent":
        data = dict(data)
        if "class" in data:
            data["vehicle_class"] = data.pop("class")
        return cls(**data)
        return cls(**data)
