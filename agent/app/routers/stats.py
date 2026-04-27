from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.event import Event
from app.models.venue import Venue
from app.models.source import Source
from app.models.review import ReviewQueueItem
from app.models.job import Job
from datetime import date, datetime

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/")
async def get_stats(db: AsyncSession = Depends(get_db)):
    today = date.today()
    today_start = datetime(today.year, today.month, today.day)

    total_events = (await db.execute(select(func.count()).select_from(Event))).scalar()
    approved = (await db.execute(
        select(func.count()).select_from(Event).where(Event.status == "approved")
    )).scalar()
    pending = (await db.execute(
        select(func.count()).select_from(Event).where(Event.status == "pending")
    )).scalar()
    review_queue = (await db.execute(
        select(func.count()).select_from(ReviewQueueItem).where(ReviewQueueItem.status == "pending")
    )).scalar()
    venues = (await db.execute(select(func.count()).select_from(Venue).where(Venue.active == True))).scalar()
    sources = (await db.execute(select(func.count()).select_from(Source).where(Source.active == True))).scalar()
    today_events = (await db.execute(
        select(func.count()).select_from(Event).where(
            Event.status == "approved",
            Event.start_datetime >= today_start,
        )
    )).scalar()

    # Last 5 jobs
    jobs_result = await db.execute(
        select(Job).order_by(Job.created_at.desc()).limit(5)
    )
    recent_jobs = [
        {c.name: getattr(j, c.name) for c in j.__table__.columns}
        for j in jobs_result.scalars().all()
    ]

    return {
        "total_events": total_events,
        "approved_events": approved,
        "pending_events": pending,
        "review_queue": review_queue,
        "venues": venues,
        "sources": sources,
        "today_events": today_events,
        "recent_jobs": recent_jobs,
    }
