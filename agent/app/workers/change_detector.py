"""
Change Detection Engine
Detects when events are updated (time/price/cancellation changes).
"""
import hashlib
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event, EventObservation


def compute_hash(event_data: dict) -> str:
    """Stable hash of key event fields for change detection."""
    key_fields = {
        "title": event_data.get("title", ""),
        "start_datetime": str(event_data.get("start_datetime", "")),
        "venue_name": event_data.get("venue_name", ""),
        "ticket_url": event_data.get("ticket_url", ""),
        "price_min": str(event_data.get("price_min", "")),
    }
    raw = json.dumps(key_fields, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()


async def record_observation(
    event: Event,
    source_url: str,
    raw_data: str,
    extracted: dict,
    db: AsyncSession,
    screenshot_path: str | None = None,
) -> bool:
    """
    Record an observation and detect if the event has changed.
    Returns True if a change was detected.
    """
    new_hash = compute_hash(extracted)
    changed = event.content_hash != new_hash

    obs = EventObservation(
        event_id=event.id,
        source_url=source_url,
        raw_data=raw_data[:50000] if raw_data else None,
        extracted_json=json.dumps(extracted)[:50000],
        content_hash=new_hash,
        screenshot_path=screenshot_path,
    )
    db.add(obs)

    if changed and event.content_hash is not None:
        # Detect what changed
        _apply_changes(event, extracted)
        event.content_hash = new_hash
        event.updated_at = datetime.utcnow()

    elif event.content_hash is None:
        event.content_hash = new_hash

    return changed


def _apply_changes(event: Event, new_data: dict):
    """Apply detected changes to the event record."""
    # Time change
    new_start = new_data.get("start_datetime")
    if new_start and str(new_start) != str(event.start_datetime):
        event.start_datetime = new_start

    # Price change
    new_price_min = new_data.get("price_min")
    if new_price_min is not None and new_price_min != event.price_min:
        event.price_min = new_price_min
        event.price_max = new_data.get("price_max")

    # Cancellation detection
    title_lower = (event.title or "").lower()
    desc_lower = (new_data.get("description") or "").lower()
    if any(w in title_lower or w in desc_lower for w in ["cancelled", "canceled", "postponed", "sold out"]):
        event.status = "cancelled"
