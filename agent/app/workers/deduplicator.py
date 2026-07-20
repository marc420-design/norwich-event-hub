"""
Deduplication Engine
Score-based merge system with fuzzy matching.
"""
from __future__ import annotations
from datetime import datetime, timedelta
from rapidfuzz import fuzz
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.event import Event
from app.models.review import ReviewQueueItem
from app.core.config import settings

# Score thresholds
AUTO_MERGE_THRESHOLD = 92
REVIEW_THRESHOLD = 70


def score_pair(a: Event, b: Event) -> int:
    """Score similarity between two events. 0-100."""
    score = 0

    # Exact ticket URL match = definitive duplicate
    if a.ticket_url and b.ticket_url and a.ticket_url == b.ticket_url:
        return 100

    # Same venue
    venue_a = (a.venue_name or "").lower().strip()
    venue_b = (b.venue_name or "").lower().strip()
    if venue_a and venue_b:
        venue_sim = fuzz.token_sort_ratio(venue_a, venue_b)
        if venue_sim > 80:
            score += 25

    # Same day
    if a.start_datetime and b.start_datetime:
        same_day = (
            a.start_datetime.date() == b.start_datetime.date()
        )
        if same_day:
            score += 20
            # Within 2 hours
            diff = abs((a.start_datetime - b.start_datetime).total_seconds())
            if diff <= 7200:
                score += 10

    # Title fuzzy similarity
    title_sim = fuzz.token_sort_ratio(
        (a.title or "").lower(), (b.title or "").lower()
    )
    score += int(title_sim * 0.45)  # max 45 points

    return min(score, 100)


def merge_events(canonical: Event, duplicate: Event) -> Event:
    """
    Fill gaps in the canonical event using data from the duplicate.
    Priority: canonical keeps its own data unless a field is empty.
    """
    if not canonical.description and duplicate.description:
        canonical.description = duplicate.description
    if not canonical.ticket_url and duplicate.ticket_url:
        canonical.ticket_url = duplicate.ticket_url
    if not canonical.venue_name and duplicate.venue_name:
        canonical.venue_name = duplicate.venue_name
    if canonical.price_min is None and duplicate.price_min is not None:
        canonical.price_min = duplicate.price_min
        canonical.price_max = duplicate.price_max
    if not canonical.images or canonical.images == "[]":
        canonical.images = duplicate.images

    # Merge tags
    try:
        import json
        tags_a = json.loads(canonical.tags or "[]")
        tags_b = json.loads(duplicate.tags or "[]")
        merged = list(dict.fromkeys(tags_a + tags_b))
        canonical.tags = json.dumps(merged)
    except Exception:
        pass

    # Keep highest confidence score
    if (duplicate.confidence_score or 0) > (canonical.confidence_score or 0):
        canonical.confidence_score = duplicate.confidence_score

    return canonical


async def check_and_handle_duplicate(
    new_event: Event,
    db: AsyncSession,
) -> tuple[bool, str | None]:
    """
    Check if new_event is a duplicate of an existing event.
    Returns (is_duplicate, canonical_event_id).
    If auto-merged, marks new_event as non-canonical.
    If ambiguous, queues for review.
    """
    # Only compare against approved + pending canonical events
    stmt = select(Event).where(
        Event.canonical == True,
        Event.id != new_event.id,
    )
    result = await db.execute(stmt)
    candidates = result.scalars().all()

    best_score = 0
    best_match: Event | None = None

    for candidate in candidates:
        s = score_pair(new_event, candidate)
        if s > best_score:
            best_score = s
            best_match = candidate

    if best_score >= AUTO_MERGE_THRESHOLD and best_match:
        # Auto-merge: mark new event as non-canonical
        merged = merge_events(best_match, new_event)
        new_event.canonical = False
        new_event.duplicate_of = best_match.id
        new_event.status = "merged"
        db.add(merged)
        return True, best_match.id

    if best_score >= REVIEW_THRESHOLD and best_match:
        # Queue for manual review
        queue_item = ReviewQueueItem(
            event_id=new_event.id,
            reason="possible_duplicate",
            duplicate_candidate_id=best_match.id,
            duplicate_score=best_score,
        )
        db.add(queue_item)
        new_event.status = "pending"
        return False, None

    return False, None


async def run_deduplication_pass(db: AsyncSession) -> dict:
    """Full deduplication pass on all pending events."""
    stmt = select(Event).where(Event.status == "pending", Event.canonical == True)
    result = await db.execute(stmt)
    events = result.scalars().all()

    merged = 0
    queued = 0
    for event in events:
        is_dup, canonical_id = await check_and_handle_duplicate(event, db)
        if is_dup:
            merged += 1
        elif event.status == "pending":
            queued += 1

    await db.commit()
    return {"checked": len(events), "merged": merged, "queued_for_review": queued}
