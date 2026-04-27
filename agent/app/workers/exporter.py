"""
JSON Exporter
Generates events.json and venues.json for website consumption (Mode A).
Also optionally syncs to Google Sheets.
"""
from __future__ import annotations
import json
import os
from datetime import datetime
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.event import Event
from app.models.venue import Venue
from app.core.config import settings
from rich.console import Console

console = Console()
EXPORTS_DIR = Path(settings.exports_dir)


async def run_export(db: AsyncSession) -> dict:
    """Export all approved events and venues to JSON files."""
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # Export events
    result = await db.execute(
        select(Event)
        .where(Event.status == "approved", Event.canonical == True)
        .order_by(Event.start_datetime.asc())
    )
    events = result.scalars().all()

    events_data = []
    for e in events:
        d = {c.name: getattr(e, c.name) for c in e.__table__.columns}
        for field in ("tags", "images"):
            raw = d.get(field, "[]")
            try:
                d[field] = json.loads(raw) if isinstance(raw, str) else raw
            except Exception:
                d[field] = []
        # Convert datetimes
        for field in ("start_datetime", "end_datetime", "created_at", "updated_at"):
            if d.get(field) and isinstance(d[field], datetime):
                d[field] = d[field].isoformat()
        # Format for website compatibility
        events_data.append({
            "id": d["id"],
            "name": d["title"],
            "date": d["start_datetime"][:10] if d.get("start_datetime") else None,
            "time": d["start_datetime"][11:16] if d.get("start_datetime") and len(d["start_datetime"]) > 10 else None,
            "endDate": d["end_datetime"][:10] if d.get("end_datetime") else None,
            "location": d.get("venue_name"),
            "category": d.get("category", "general"),
            "description": d.get("description"),
            "ticketLink": d.get("ticket_url"),
            "price": _format_price(d),
            "image": (d.get("images") or [""])[0] if d.get("images") else None,
            "tags": d.get("tags", []),
            "featured": d.get("featured", False),
            "editorsChoice": d.get("editors_choice", False),
            "isFree": d.get("is_free", False),
            "ageRestriction": d.get("age_restriction"),
            "status": d.get("status"),
            "source": d.get("source_name"),
        })

    events_path = EXPORTS_DIR / "events.json"
    with open(events_path, "w", encoding="utf-8") as f:
        json.dump({"events": events_data, "generated_at": datetime.utcnow().isoformat(), "count": len(events_data)}, f, indent=2)

    # Export venues
    result = await db.execute(select(Venue).where(Venue.active == True).order_by(Venue.name))
    venues = result.scalars().all()
    venues_data = [
        {
            "id": v.id,
            "name": v.name,
            "slug": v.slug,
            "category": v.category,
            "address": v.address,
            "postcode": v.postcode,
            "lat": v.lat,
            "lng": v.lng,
            "website": v.website,
        }
        for v in venues
    ]

    venues_path = EXPORTS_DIR / "venues.json"
    with open(venues_path, "w", encoding="utf-8") as f:
        json.dump({"venues": venues_data, "generated_at": datetime.utcnow().isoformat()}, f, indent=2)

    console.log(f"Exported {len(events_data)} events and {len(venues_data)} venues")

    # Optionally sync to Google Sheets
    if settings.google_apps_script_url and settings.google_apps_script_url != "":
        await _sync_to_google_sheets(events_data)

    return {"events": len(events_data), "venues": len(venues_data)}


def _format_price(d: dict) -> str:
    if d.get("is_free"):
        return "Free"
    pmin = d.get("price_min")
    pmax = d.get("price_max")
    if pmin is not None and pmax is not None and pmin != pmax:
        return f"£{pmin:.0f}-£{pmax:.0f}"
    if pmin is not None:
        return f"£{pmin:.0f}"
    return "See website"


async def _sync_to_google_sheets(events_data: list[dict]):
    """Push approved events to Google Sheets via Apps Script."""
    import httpx
    url = settings.google_apps_script_url
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            for event in events_data[:50]:  # batch
                await client.post(url, json={
                    "action": "syncEvent",
                    **event,
                    "status": "Approved",
                    "promoterName": f"AgentBot - {event.get('source', '')}",
                    "promoterEmail": "agent@norwicheventshub.com",
                })
        console.log("Synced events to Google Sheets")
    except Exception as e:
        console.log(f"Google Sheets sync failed: {e}")
