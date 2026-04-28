"""
Deduplication and JSON export.
Takes the combined list of raw events, deduplicates, validates, and writes
exports/events.json in the format agent-bridge.js expects.
"""
import json
import pathlib
from datetime import datetime, timezone


TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")
# Resolve exports/ relative to the project root (two levels up from this file)
EXPORTS_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "exports"


def deduplicate_and_export(events: list[dict]) -> int:
    """Deduplicate, validate, sort, and write exports/events.json. Returns event count."""
    run_started = datetime.now(timezone.utc).isoformat()

    # 1. Filter: must have title + future date + source_url (no link = don't publish)
    valid = [
        e for e in events
        if e.get("title")
        and e.get("date")
        and str(e.get("date", ""))[:10] >= TODAY
        and e.get("source_url")
    ]
    skipped_no_link = len(events) - len([e for e in events if e.get("source_url")])

    # 2. Deduplicate by (normalised title, date, venue) for better accuracy
    seen: set = set()
    unique: list[dict] = []
    for e in valid:
        key = (
            e["title"].strip().lower(),
            str(e["date"])[:10],
            (e.get("venue") or "").strip().lower(),
        )
        if key not in seen:
            seen.add(key)
            unique.append(_format_for_frontend(e))

    duplicates_skipped = len(valid) - len(unique)

    # 3. Sort by date ascending
    unique.sort(key=lambda e: e.get("date", ""))

    # 4. Write events JSON
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    run_finished = datetime.now(timezone.utc).isoformat()
    out = {
        "events": unique,
        "generated_at": run_finished,
        "count": len(unique),
    }
    (EXPORTS_DIR / "events.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))

    # 5. Write scraper run log
    log = {
        "run_id": run_started,
        "finished_at": run_finished,
        "raw_events": len(events),
        "valid_events": len(valid),
        "unique_events": len(unique),
        "duplicates_skipped": duplicates_skipped,
        "skipped_no_source_url": skipped_no_link,
        "status": "completed",
    }
    (EXPORTS_DIR / "scrape_log.json").write_text(json.dumps(log, indent=2))

    print(
        f"\n[EXPORT] {len(unique)} unique future events written to exports/events.json"
        f" (from {len(events)} raw, {len(valid)} valid, {duplicates_skipped} duplicates,"
        f" {skipped_no_link} skipped — no source URL)"
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
