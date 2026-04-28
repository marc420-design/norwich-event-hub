"""
JSON Exporter
Generates events.json and venues.json for website consumption (Mode A).
Also optionally syncs to Google Sheets.
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.event import Event
from app.models.venue import Venue
from app.workers.export_format import format_event_for_website
from rich.console import Console

console = Console()
EXPORTS_DIR = Path(settings.exports_dir)


async def run_export(db: AsyncSession) -> dict:
    """Export all approved events and venues to JSON files."""
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

    result = await db.execute(
        select(Event)
        .where(Event.status == "approved", Event.canonical == True)
        .order_by(Event.start_datetime.asc())
    )
    events = result.scalars().all()

    events_data = []
    seen_fingerprints: set[str] = set()
    for event in events:
        data = {column.name: getattr(event, column.name) for column in event.__table__.columns}
        for field in ("tags", "images"):
            raw = data.get(field, "[]")
            try:
                data[field] = json.loads(raw) if isinstance(raw, str) else raw
            except Exception:
                data[field] = []

        for field in ("start_datetime", "end_datetime", "created_at", "updated_at"):
            if data.get(field) and isinstance(data[field], datetime):
                data[field] = data[field].isoformat()

        event_export = format_event_for_website(data)
        if not event_export:
            continue

        fingerprint = event_export["fingerprint"]
        if fingerprint in seen_fingerprints:
            continue

        seen_fingerprints.add(fingerprint)
        events_data.append(event_export)

    with open(EXPORTS_DIR / "events.json", "w", encoding="utf-8") as handle:
        json.dump({
            "events": events_data,
            "generated_at": datetime.utcnow().isoformat(),
            "count": len(events_data)
        }, handle, indent=2)

    result = await db.execute(select(Venue).where(Venue.active == True).order_by(Venue.name))
    venues = result.scalars().all()
    venues_data = [
        {
            "id": venue.id,
            "name": venue.name,
            "slug": venue.slug,
            "category": venue.category,
            "address": venue.address,
            "postcode": venue.postcode,
            "lat": venue.lat,
            "lng": venue.lng,
            "website": venue.website,
        }
        for venue in venues
    ]

    with open(EXPORTS_DIR / "venues.json", "w", encoding="utf-8") as handle:
        json.dump({
            "venues": venues_data,
            "generated_at": datetime.utcnow().isoformat()
        }, handle, indent=2)

    console.log(f"Exported {len(events_data)} events and {len(venues_data)} venues")

    if settings.google_apps_script_url:
        await _sync_to_google_sheets(events_data)

    return {"events": len(events_data), "venues": len(venues_data)}


async def _sync_to_google_sheets(events_data: list[dict]):
    """Push approved events to Google Sheets via Apps Script."""
    import httpx

    url = settings.google_apps_script_url
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            for event in events_data[:50]:
                await client.post(url, json={
                    "action": "syncEvent",
                    **event,
                    "status": "Approved",
                    "promoterName": f"AgentBot - {event.get('source', '')}",
                    "promoterEmail": "agent@norwicheventshub.com",
                })
        console.log("Synced events to Google Sheets")
    except Exception as error:
        console.log(f"Google Sheets sync failed: {error}")
