"""
Ingestion Runner
Orchestrates the full ingestion pipeline for a single source.
"""
from __future__ import annotations
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.source import Source
from app.models.event import Event
from app.models.review import ReviewQueueItem
from app.connectors import get_connector
from app.workers.deduplicator import check_and_handle_duplicate
from app.workers.change_detector import record_observation, compute_hash
from app.core.config import settings
from rich.console import Console

console = Console()


async def run_source(source_id: str, db: AsyncSession) -> dict:
    """Run the full ingestion pipeline for one source."""
    source = await db.get(Source, source_id)
    if not source:
        raise ValueError(f"Source {source_id} not found")

    stats = {"found": 0, "added": 0, "updated": 0, "queued": 0, "errors": 0}

    try:
        connector = get_connector(
            connector_type=source.connector_type,
            source_id=source.id,
            url=source.url,
            name=source.name,
        )

        events_data = await connector.run()
        stats["found"] = len(events_data)

        for event_data in events_data:
            try:
                await _ingest_event(event_data, source, db, stats)
            except Exception as e:
                console.log(f"[{source.name}] ingest error: {e}")
                stats["errors"] += 1

        # Update source metadata
        source.last_run = datetime.utcnow()
        source.last_success = datetime.utcnow()
        source.events_found_last_run = stats["found"]
        source.error_streak = 0
        await db.commit()

    except Exception as e:
        source.last_run = datetime.utcnow()
        source.error_streak = (source.error_streak or 0) + 1
        await db.commit()
        raise

    return stats


async def _ingest_event(event_data: dict, source: Source, db: AsyncSession, stats: dict):
    """Process one normalised event dict."""
    title = event_data.get("title", "").strip()
    if not title:
        return

    # Check if we've seen this URL before (change detection)
    ticket_url = event_data.get("ticket_url") or event_data.get("source_url")
    content_hash = compute_hash(event_data)

    existing = None
    if ticket_url:
        result = await db.execute(
            select(Event).where(Event.ticket_url == ticket_url, Event.canonical == True)
        )
        existing = result.scalar_one_or_none()

    if existing:
        # Check for changes
        changed = await record_observation(
            event=existing,
            source_url=event_data.get("source_url", source.url),
            raw_data=json.dumps(event_data),
            extracted=event_data,
            db=db,
        )
        if changed:
            stats["updated"] += 1
        return

    # New event — create it
    confidence = int(event_data.get("confidence", 60))
    auto_approve = confidence >= settings.auto_approve_threshold and source.source_type in ("venue", "council")

    tags = event_data.get("tags", [])
    images = event_data.get("images", [])

    event = Event(
        title=title,
        description=event_data.get("description"),
        start_datetime=_parse_dt(event_data.get("start_datetime")),
        end_datetime=_parse_dt(event_data.get("end_datetime")),
        all_day=event_data.get("all_day", False),
        venue_name=event_data.get("venue_name"),
        ticket_url=ticket_url,
        price_min=event_data.get("price_min"),
        price_max=event_data.get("price_max"),
        is_free=event_data.get("is_free", False),
        age_restriction=event_data.get("age_restriction"),
        tags=json.dumps(tags) if isinstance(tags, list) else "[]",
        images=json.dumps(images) if isinstance(images, list) else "[]",
        category=event_data.get("category", "general"),
        confidence_score=confidence,
        source_id=source.id,
        source_url=event_data.get("source_url"),
        source_name=source.name,
        status="approved" if auto_approve else "pending",
        content_hash=content_hash,
    )
    db.add(event)
    await db.flush()  # get ID before dedup check

    # Deduplication
    is_dup, canonical_id = await check_and_handle_duplicate(event, db)
    if is_dup:
        pass  # merged, not counted as new
    elif event.status == "pending" and confidence < settings.min_quality_score:
        # Queue low-confidence events for review
        q = ReviewQueueItem(
            event_id=event.id,
            reason="low_confidence",
            notes=f"Confidence: {confidence}",
        )
        db.add(q)
        stats["queued"] += 1
    else:
        stats["added"] += 1

    # Record observation (evidence)
    from app.models.event import EventObservation
    obs = EventObservation(
        event_id=event.id,
        source_id=source.id,
        source_url=event_data.get("source_url", source.url),
        extracted_json=json.dumps(event_data)[:50000],
        content_hash=content_hash,
    )
    db.add(obs)
    await db.commit()


def _parse_dt(val) -> datetime | None:
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val).replace("Z", "+00:00"))
    except Exception:
        return None
