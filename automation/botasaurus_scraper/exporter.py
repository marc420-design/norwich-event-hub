"""
Deduplication and JSON export.
Takes the combined list of raw events, deduplicates, validates, and writes
exports/events.json in the format agent-bridge.js expects.
"""
import json
import pathlib
from datetime import datetime


TODAY = datetime.utcnow().strftime("%Y-%m-%d")
# Resolve exports/ relative to the project root (two levels up from this file)
EXPORTS_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "exports"


def deduplicate_and_export(events: list[dict]) -> int:
    """Deduplicate, validate, sort, and write exports/events.json. Returns event count."""

    # 1. Filter: must have title + date, and must be a future event
    valid = [
        e for e in events
        if e.get("title") and e.get("date") and str(e.get("date", ""))[:10] >= TODAY
    ]

    # 2. Deduplicate by (normalised title, date, venue)
    seen: set = set()
    unique: list[dict] = []
    for e in valid:
        title = e.get("title", "").strip().lower()
        date = str(e.get("date", ""))[:10]
        venue = (e.get("venue") or e.get("location") or "").strip().lower()
        
        key = (title, date, venue)
        if key not in seen:
            seen.add(key)
            unique.append(_format_for_frontend(e))

    # 3. Sort by date ascending
    unique.sort(key=lambda e: e.get("date", ""))

    # 4. Write JSON
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = {
        "events": unique,
        "generated_at": datetime.utcnow().isoformat(),
        "count": len(unique),
    }
    (EXPORTS_DIR / "events.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))

    print(
        f"\n[EXPORT] {len(unique)} unique future events written to exports/events.json"
        f" (from {len(events)} raw, {len(valid)} valid)"
    )
    return len(unique)


def _format_for_frontend(e: dict) -> dict:
    """Map scraper event dict → shape that agent-bridge.js normaliseSingle() expects."""
    return {
        "name": e.get("title", ""),
        "eventname": e.get("title", ""),   # legacy compat
        "date": str(e.get("date", ""))[:10],
        "time": e.get("time") or "TBA",
        "location": e.get("venue") or e.get("address") or "",
        "venue": e.get("venue") or "",
        "address": e.get("address") or "",
        "description": e.get("description") or "",
        "ticketLink": e.get("ticket_url") or "",
        "price": e.get("price") or "See website",
        "image": e.get("image_url") or "",
        "category": (e.get("category") or "general").lower(),
        "tags": e.get("tags") or [],
        "source": e.get("source", ""),
        "sourceUrl": e.get("source_url", ""),
        "isAiDiscovered": True,
        "status": "approved",
        "featured": False,
    }
