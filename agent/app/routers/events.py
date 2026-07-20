from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from app.core.database import get_db
from app.core.schemas import EventCreate, EventOut, StatusUpdate
from app.models.event import Event
from datetime import datetime, date
import json

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=list[EventOut])
async def list_events(
    status: str = Query("approved"),
    category: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    venue_id: str | None = Query(None),
    featured: bool | None = Query(None),
    editors_choice: bool | None = Query(None),
    q: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event).where(Event.canonical == True)

    if status != "all":
        stmt = stmt.where(Event.status == status)
    if category:
        stmt = stmt.where(Event.category == category)
    if venue_id:
        stmt = stmt.where(Event.venue_id == venue_id)
    if featured is not None:
        stmt = stmt.where(Event.featured == featured)
    if editors_choice is not None:
        stmt = stmt.where(Event.editors_choice == editors_choice)
    if date_from:
        try:
            dt = datetime.fromisoformat(date_from)
            stmt = stmt.where(Event.start_datetime >= dt)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to)
            stmt = stmt.where(Event.start_datetime <= dt)
        except ValueError:
            pass
    if q:
        stmt = stmt.where(
            or_(
                Event.title.ilike(f"%{q}%"),
                Event.description.ilike(f"%{q}%"),
                Event.venue_name.ilike(f"%{q}%"),
            )
        )

    stmt = stmt.order_by(Event.start_datetime.asc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    events = result.scalars().all()

    return [_to_out(e) for e in events]


@router.get("/today", response_model=list[EventOut])
async def get_today_events(db: AsyncSession = Depends(get_db)):
    today = date.today()
    start = datetime(today.year, today.month, today.day, 0, 0, 0)
    end = datetime(today.year, today.month, today.day, 23, 59, 59)
    stmt = select(Event).where(
        Event.status == "approved",
        Event.canonical == True,
        Event.start_datetime >= start,
        Event.start_datetime <= end,
    ).order_by(Event.start_datetime.asc())
    result = await db.execute(stmt)
    return [_to_out(e) for e in result.scalars().all()]


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return _to_out(event)


@router.post("/", response_model=EventOut, status_code=201)
async def create_event(data: EventCreate, db: AsyncSession = Depends(get_db)):
    event = Event(
        **{k: (json.dumps(v) if isinstance(v, list) else v) for k, v in data.model_dump().items()}
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return _to_out(event)


@router.patch("/{event_id}/status")
async def update_status(event_id: str, body: StatusUpdate, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = body.status
    await db.commit()
    return {"success": True, "status": body.status}


@router.delete("/{event_id}")
async def delete_event(event_id: str, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()
    return {"success": True}


def _to_out(event: Event) -> dict:
    d = {c.name: getattr(event, c.name) for c in event.__table__.columns}
    for field in ("tags", "images"):
        raw = d.get(field, "[]")
        try:
            d[field] = json.loads(raw) if isinstance(raw, str) else raw
        except Exception:
            d[field] = []
    return d
