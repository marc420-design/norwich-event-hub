from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class VenueCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    category: str = "general"
    address: Optional[str] = None
    postcode: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    website: Optional[str] = None
    inside_norwich: bool = True
    allowed_outside_boundary: bool = False


class VenueOut(VenueCreate):
    id: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SourceCreate(BaseModel):
    name: str
    url: str
    connector_type: str  # api/html/ics/pdf/operator
    source_type: str     # venue/council/platform/aggregator
    priority: int = 3
    schedule: str = "daily"
    notes: Optional[str] = None


class SourceOut(SourceCreate):
    id: str
    active: bool
    last_run: Optional[datetime]
    error_streak: int
    events_found_last_run: int
    created_at: datetime

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    all_day: bool = False
    venue_id: Optional[str] = None
    venue_name: Optional[str] = None
    ticket_url: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    is_free: bool = False
    age_restriction: Optional[str] = None
    tags: list[str] = []
    images: list[str] = []
    category: str = "general"
    featured: bool = False
    editors_choice: bool = False
    source_url: Optional[str] = None
    source_name: Optional[str] = None


class EventOut(EventCreate):
    id: str
    status: str
    confidence_score: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EventFilter(BaseModel):
    category: Optional[str] = None
    status: Optional[str] = "approved"
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    venue_id: Optional[str] = None
    featured: Optional[bool] = None
    q: Optional[str] = None


class ReviewAction(BaseModel):
    action: str  # approve/reject/merge
    merge_into_id: Optional[str] = None
    notes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None
