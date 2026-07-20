"""
Deduplication and JSON export for the Botasaurus scraper.
Maps scraper output onto the shared public event contract used by agent-bridge.js.
"""
import json
import os
import pathlib
import sys
from urllib.parse import urlparse
from datetime import datetime

import requests

# Ensure the project root is on sys.path so 'agent' package is importable
# regardless of the working directory the script is launched from.
_PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

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

VENUE_FALLBACK_IMAGES = {
    "the waterfront": "assets/fallback-live-music.svg",
    "norwich arts centre": "assets/fallback-culture.svg",
    "the halls norwich": "assets/fallback-general.svg",
    "the forum": "assets/fallback-markets.svg",
    "norwich cathedral": "assets/fallback-culture.svg",
}

CATEGORY_FALLBACK_IMAGES = {
    "nightlife": "assets/fallback-nightlife.svg",
    "gigs": "assets/fallback-live-music.svg",
    "music": "assets/fallback-live-music.svg",
    "theatre": "assets/fallback-theatre.svg",
    "markets": "assets/fallback-markets.svg",
    "market": "assets/fallback-markets.svg",
    "family": "assets/fallback-family.svg",
    "sports": "assets/fallback-sports.svg",
    "sport": "assets/fallback-sports.svg",
    "culture": "assets/fallback-culture.svg",
    "arts": "assets/fallback-culture.svg",
}


def _validate_url(url: str, *, timeout: int = 8) -> str:
    if not url:
        return "missing"
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return "broken"
    try:
        response = requests.head(url, allow_redirects=True, timeout=timeout)
        if response.status_code >= 400 or response.status_code == 405:
            response = requests.get(url, allow_redirects=True, timeout=timeout, stream=True)
        return "verified" if response.status_code < 400 else "broken"
    except Exception:
        return "broken"


def _resolve_fallback_image(venue_name: str, category: str) -> str:
    venue_key = (venue_name or "").strip().lower()
    if venue_key in VENUE_FALLBACK_IMAGES:
        return VENUE_FALLBACK_IMAGES[venue_key]
    return CATEGORY_FALLBACK_IMAGES.get((category or "").lower(), "assets/fallback-general.svg")


def _mark_title_date_mismatch(events: list[dict]) -> None:
    by_source_url: dict[str, tuple[str, str]] = {}
    for event in events:
        source_url = (event.get("source_url") or "").strip()
        title = (event.get("title") or "").strip().lower()
        date = (event.get("date") or "").strip()
        if not source_url or not title or not date:
            continue
        existing = by_source_url.get(source_url)
        if existing and existing != (title, date):
            event["_title_date_mismatch"] = True
        else:
            by_source_url[source_url] = (title, date)


def _event_public_url(event: dict) -> str:
    return (
        event.get("primaryUrl")
        or event.get("ticketLink")
        or event.get("ticketlink")
        or event.get("officialUrl")
        or event.get("sourceUrl")
        or event.get("source_url")
        or ""
    )


def _public_event_fingerprint(event: dict) -> str:
    name = event.get("name") or event.get("title") or event.get("eventname") or ""
    date = event.get("date") or str(event.get("start_datetime") or "")[:10]
    venue = event.get("venue") or event.get("location") or event.get("venue_name") or ""
    return event.get("fingerprint") or f"{name.strip().lower()}|{date}|{venue.strip().lower()}"


def _load_existing_public_events() -> list[dict]:
    export_path = EXPORTS_DIR / "events.json"
    if not export_path.exists():
        return []

    try:
        payload = json.loads(export_path.read_text(encoding="utf-8"))
    except Exception:
        return []

    events = payload if isinstance(payload, list) else payload.get("events", [])
    if not isinstance(events, list):
        return []

    retained: list[dict] = []
    for event in events:
        if not isinstance(event, dict):
            continue
        name = event.get("name") or event.get("title") or event.get("eventname")
        date = event.get("date") or str(event.get("start_datetime") or "")[:10]
        status = str(event.get("status") or "approved").lower()
        if name and date >= TODAY and status == "approved" and _event_public_url(event):
            event["status"] = "approved"
            event["fingerprint"] = _public_event_fingerprint(event)
            retained.append(event)

    return retained


def deduplicate_and_export(events: list[dict]) -> dict:
    """Deduplicate, validate, and write exports/events.json plus review logs."""
    _mark_title_date_mismatch(events)

    valid = [
        event for event in events
        if event.get("title") and event.get("date") and str(event.get("date", ""))[:10] >= TODAY
    ]

    adapted_events = [_adapt_scraper_event(event) for event in valid]

    existing_public_events = _load_existing_public_events()
    seen_fingerprints: set[str] = {_public_event_fingerprint(event) for event in existing_public_events}
    exported: list[dict] = existing_public_events[:]
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
    source_status = _validate_url(source_url)
    ticket_status = _validate_url(ticket_url) if ticket_url else "missing"
    image_status = _validate_url(image_url) if image_url else "missing"
    needs_flyer = image_status != "verified"

    resolved_image = image_url if image_status == "verified" else _resolve_fallback_image(venue_name, event.get("category") or "general")
    resolved_image_status = image_status if image_status == "verified" else "fallback_assigned"

    has_title_date_mismatch = bool(event.get("_title_date_mismatch"))
    auto_approval_allowed = source_status == "verified" and not has_title_date_mismatch
    # Events from a verified source with no title/date mismatch publish automatically;
    # everything else still needs a human to look at it.
    status = "approved" if auto_approval_allowed else "pending_review"
    review_notes = []
    if source_status == "broken":
        review_notes.append("broken_source_link")
    if has_title_date_mismatch:
        review_notes.append("title_date_mismatch")
    if not auto_approval_allowed and not review_notes:
        review_notes.append("manual_review_required")
    if auto_approval_allowed and not review_notes:
        review_notes.append("auto_approved")

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
        "images": [resolved_image] if resolved_image else [],
        "tags": event.get("tags") or [],
        "category": (event.get("category") or "general").lower(),
        "featured": bool(event.get("featured")),
        "editors_choice": bool(event.get("editorsChoice") or event.get("editors_choice")),
        "is_free": _is_free(event.get("price")),
        "age_restriction": event.get("age_restriction"),
        "status": status,
        "source_name": source_name,
        "link_status": source_status,
        "ticket_status": ticket_status,
        "image_status": resolved_image_status,
        "needs_flyer": needs_flyer,
        "review_notes": review_notes,
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
