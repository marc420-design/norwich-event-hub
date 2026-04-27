from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.schemas import VenueCreate, VenueOut
from app.models.venue import Venue
import re

router = APIRouter(prefix="/venues", tags=["venues"])


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return s


@router.get("/", response_model=list[VenueOut])
async def list_venues(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    stmt = select(Venue)
    if active_only:
        stmt = stmt.where(Venue.active == True)
    result = await db.execute(stmt.order_by(Venue.name))
    return result.scalars().all()


@router.get("/{venue_id}", response_model=VenueOut)
async def get_venue(venue_id: str, db: AsyncSession = Depends(get_db)):
    venue = await db.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue


@router.post("/", response_model=VenueOut, status_code=201)
async def create_venue(data: VenueCreate, db: AsyncSession = Depends(get_db)):
    slug = data.slug or slugify(data.name)
    # ensure unique slug
    existing = await db.execute(select(Venue).where(Venue.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{len(slug)}"
    venue = Venue(**data.model_dump(exclude={"slug"}), slug=slug)
    db.add(venue)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.patch("/{venue_id}")
async def update_venue(venue_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    venue = await db.get(Venue, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    for k, v in data.items():
        if hasattr(venue, k):
            setattr(venue, k, v)
    await db.commit()
    return {"success": True}
