"""
Deduplication and JSON export for the Botasaurus scraper.
Maps scraper output onto the shared public event contract used by agent-bridge.js.
"""
import json
import pathlib
from datetime import datetime

from agent.app.workers.export_format import format_event_for_website


TODAY = datetime.utcnow().strftime("%Y-%m-%d")
EXPORTS_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "exports"
LOGS_DIR = EXPORTS_DIR / "logs"

TRUSTED_SOURCES = {
    "Visit Norwich",
    "Norwich Arts Centre",
    "Theatre Royal Norwich",
    "Norwich Playhouse",
    "The Halls Norwich",
    "The Forum Norwich",
    "UEA Waterfront",
    "Norwich Cathedral",
    "Norwich Castle Museum",
    "Epic Studios Norwich",
    "Open Norwich",
    "Norfolk Showground",
    "Norwich City Council Events",
    "UEA Events",
    "Norwich Puppet Theatre",
    "Norwich Science Festival",
    "Sainsbury Centre",
}


def deduplicate_and_export(events: list[dict]) -> dict:
    """Deduplicate, validate, and write exports/events.json plus review logs."""
    valid = [
        event for event in events
        if event.get("title") and event.get("date") and str(event.get("date", ""))[:10] >= TODAY
    ]

    adapted_events = [_adapt_scraper_event(event) for event in valid]

    seen_fingerprints: set[str] = set()
    exported: list[dict] = []
    review_queue: list[dict] = []
    duplicate_count = 0
    skipped_count = 0

    for item in adapted_events:
        public_event = format_event_for_website(item)
        if not public_event:
            review_queue.append({
                "reason": "missing_public_fields",
                "status": item["status"],
                "source": item.get("source_name"),
                "title": item.get("title"),
                "venue_name": item.get("venue_name"),
                "source_url": item.get("source_url"),
                "ticket_url": item.get("ticket_url"),
            })
            skipped_count += 1
            continue

        fingerprint = public_event["fingerprint"]
        if fingerprint in seen_fingerprints:
            duplicate_count += 1
            review_queue.append({
                "reason": "duplicate",
                "status": item["status"],
                "source": item.get("source_name"),
                "title": item.get("title"),
                "fingerprint": fingerprint,
            })
            continue

        seen_fingerprints.add(fingerprint)

        if item["status"] != "approved":
            review_queue.append({
                "reason": "needs_review",
                "status": item["status"],
                "source": item.get("source_name"),
                "title": item.get("title"),
                "fingerprint": fingerprint,
            })
            continue

        exported.append(public_event)

    exported.sort(key=lambda event: (event.get("date", ""), event.get("time", "")))

    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    payload = {
        "events": exported,
        "generated_at": datetime.utcnow().isoformat(),
        "count": len(exported),
    }
    (EXPORTS_DIR / "events.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    (LOGS_DIR / "scraper-review-queue.json").write_text(
        json.dumps(
            {
                "generated_at": datetime.utcnow().isoformat(),
                "count": len(review_queue),
                "events": review_queue,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    stats = {
        "raw_events": len(events),
        "valid_events": len(valid),
        "approved_exports": len(exported),
        "review_queue": len(review_queue),
        "duplicates": duplicate_count,
        "skipped": skipped_count,
    }

    print(
        f"\n[EXPORT] {stats['approved_exports']} approved events written to exports/events.json "
        f"(from {stats['raw_events']} raw, {stats['valid_events']} valid, "
        f"{stats['duplicates']} duplicates, {stats['review_queue']} queued for review)"
    )
    return stats


def _adapt_scraper_event(event: dict) -> dict:
    title = (event.get("title") or event.get("name") or "").strip()
    date = str(event.get("date", ""))[:10]
    time = _normalise_time(event.get("time"))
    end_time = _normalise_time(event.get("end_time"))
    venue_name = (event.get("venue") or event.get("location") or "").strip()
    address = (event.get("address") or "").strip() or None
    source_name = event.get("source", "")
    source_url = (event.get("source_url") or "").strip()
    ticket_url = (event.get("ticket_url") or event.get("ticketLink") or "").strip()
    official_url = (event.get("official_url") or "").strip()
    image_url = (event.get("image_url") or event.get("image") or "").strip()

    start_datetime = f"{date}T{time or '00:00'}:00" if date else None
    end_datetime = f"{date}T{end_time}:00" if date and end_time else None
    primary_url = ticket_url or official_url or source_url

    return {
        "id": event.get("id") or _build_event_id(title, date, venue_name),
        "title": title,
        "description": (event.get("description") or "").strip(),
        "start_datetime": start_datetime,
        "end_datetime": end_datetime,
        "venue_name": venue_name,
        "address": address,
        "source_url": source_url or primary_url,
        "ticket_url": ticket_url or official_url,
        "images": [image_url] if image_url else [],
        "tags": event.get("tags") or [],
        "category": (event.get("category") or "general").lower(),
        "featured": bool(event.get("featured")),
        "editors_choice": bool(event.get("editorsChoice") or event.get("editors_choice")),
        "is_free": _is_free(event.get("price")),
        "age_restriction": event.get("age_restriction"),
        "status": "approved" if source_name in TRUSTED_SOURCES else "pending",
        "source_name": source_name,
        "price_min": _extract_price_min(event.get("price")),
        "price_max": _extract_price_max(event.get("price")),
    }


def _build_event_id(title: str, date: str, venue_name: str) -> str:
    safe_title = "-".join(part for part in title.lower().split() if part) or "event"
    safe_venue = "-".join(part for part in venue_name.lower().split() if part) or "venue"
    return f"scraper-{safe_title[:40]}-{date}-{safe_venue[:24]}"


def _normalise_time(value: str | None) -> str | None:
    if not value:
        return None
    value = str(value).strip()
    if not value or value.lower() in {"tba", "time tbc"}:
        return None
    if "T" in value and len(value) >= 16:
        return value[11:16]
    if ":" in value:
        parts = value.split(":")
        hour = parts[0].strip().zfill(2)
        minute = parts[1].strip()[:2].zfill(2)
        return f"{hour}:{minute}"
    return None


def _is_free(price: str | None) -> bool:
    if not price:
        return False
    return "free" in str(price).strip().lower()


def _extract_price_min(price: str | None) -> float | None:
    numbers = _extract_price_numbers(price)
    return numbers[0] if numbers else None


def _extract_price_max(price: str | None) -> float | None:
    numbers = _extract_price_numbers(price)
    if not numbers:
        return None
    return numbers[-1]


def _extract_price_numbers(price: str | None) -> list[float]:
    if not price:
        return []
    text = str(price).replace("£", "").replace(",", " ")
    values: list[float] = []
    for token in text.replace("-", " ").split():
        try:
            values.append(float(token))
        except ValueError:
            continue
    return values
