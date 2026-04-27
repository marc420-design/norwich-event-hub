from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.review import ReviewQueueItem
from app.models.event import Event
from app.core.schemas import ReviewAction
from datetime import datetime

router = APIRouter(prefix="/review", tags=["review"])


@router.get("/")
async def list_review_queue(status: str = "pending", db: AsyncSession = Depends(get_db)):
    stmt = select(ReviewQueueItem).where(ReviewQueueItem.status == status).order_by(ReviewQueueItem.created_at)
    result = await db.execute(stmt)
    items = result.scalars().all()

    out = []
    for item in items:
        event = await db.get(Event, item.event_id)
        out.append({
            "queue_id": item.id,
            "reason": item.reason,
            "notes": item.notes,
            "duplicate_candidate_id": item.duplicate_candidate_id,
            "duplicate_score": item.duplicate_score,
            "created_at": item.created_at,
            "event": {c.name: getattr(event, c.name) for c in event.__table__.columns} if event else None,
        })
    return out


@router.post("/{queue_id}/action")
async def take_action(queue_id: str, body: ReviewAction, db: AsyncSession = Depends(get_db)):
    item = await db.get(ReviewQueueItem, queue_id)
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")

    event = await db.get(Event, item.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if body.action == "approve":
        event.status = "approved"
    elif body.action == "reject":
        event.status = "rejected"
    elif body.action == "merge" and body.merge_into_id:
        # Mark this event as a duplicate of the canonical one
        event.canonical = False
        event.duplicate_of = body.merge_into_id
        event.status = "merged"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    item.status = "resolved"
    item.resolved_at = datetime.utcnow()
    if body.notes:
        item.notes = body.notes

    await db.commit()
    return {"success": True, "action": body.action}


@router.get("/stats")
async def review_stats(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    pending = await db.execute(
        select(func.count()).select_from(ReviewQueueItem).where(ReviewQueueItem.status == "pending")
    )
    resolved = await db.execute(
        select(func.count()).select_from(ReviewQueueItem).where(ReviewQueueItem.status == "resolved")
    )
    return {
        "pending": pending.scalar(),
        "resolved": resolved.scalar(),
    }
