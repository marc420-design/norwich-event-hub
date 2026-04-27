"""
Event Normalisation Engine
Takes raw extracted data and returns a canonical Event-compatible dict.
Uses Claude AI for intelligent parsing.
"""
import hashlib
import json
import re
from datetime import datetime
from typing import Any
import anthropic
from app.core.config import settings


_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


CATEGORY_MAP = {
    "nightlife": ["club", "rave", "dj", "techno", "house", "drum", "bass", "disco", "dance night"],
    "gigs": ["gig", "live music", "band", "concert", "jazz", "rock", "folk", "acoustic", "open mic"],
    "theatre": ["theatre", "theater", "play", "musical", "performance", "opera", "pantomime"],
    "markets": ["market", "fair", "stall", "craft", "antique", "car boot", "food market"],
    "exhibitions": ["exhibition", "gallery", "art show", "display", "museum"],
    "festivals": ["festival", "fest", "carnival", "fete"],
    "workshops": ["workshop", "class", "course", "training", "session", "seminar", "lecture"],
    "community": ["community", "charity", "volunteer", "fundraiser", "local"],
    "sports": ["sport", "football", "rugby", "cricket", "running", "race", "match"],
    "culture": ["culture", "heritage", "history", "tour", "walk"],
    "comedy": ["comedy", "stand-up", "standup", "improv", "open mic comedy"],
    "family": ["family", "children", "kids", "child"],
}


def detect_category(title: str, description: str = "") -> str:
    text = (title + " " + description).lower()
    for cat, keywords in CATEGORY_MAP.items():
        if any(k in text for k in keywords):
            return cat
    return "general"


def parse_price(price_str: str) -> tuple[float | None, float | None, bool]:
    """Returns (price_min, price_max, is_free)."""
    if not price_str:
        return None, None, False
    low = price_str.lower().strip()
    if any(w in low for w in ["free", "no charge", "£0", "0.00"]):
        return 0.0, 0.0, True
    nums = re.findall(r"\d+\.?\d*", price_str)
    if not nums:
        return None, None, False
    floats = [float(n) for n in nums]
    return min(floats), max(floats), False


def make_content_hash(title: str, start: str, venue: str) -> str:
    raw = f"{title.lower().strip()}|{start}|{venue.lower().strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()


async def normalise_with_ai(raw_text: str, source_url: str) -> dict[str, Any]:
    """Use Claude to extract structured event data from raw HTML/text."""
    prompt = f"""Extract event information from the following text and return ONLY a valid JSON object.

Source URL: {source_url}

Text:
{raw_text[:6000]}

Return JSON with these fields (use null for missing):
{{
  "title": "Full event name",
  "description": "1-3 sentence description",
  "start_datetime": "YYYY-MM-DDTHH:MM:SS or null",
  "end_datetime": "YYYY-MM-DDTHH:MM:SS or null",
  "all_day": false,
  "venue_name": "Venue name",
  "ticket_url": "URL or null",
  "price_text": "e.g. £12 or Free or £10-£20 or null",
  "age_restriction": "18+ or null",
  "category": "one of: nightlife/gigs/theatre/markets/exhibitions/festivals/workshops/community/sports/culture/comedy/family/general",
  "tags": ["tag1", "tag2"],
  "images": ["url1"],
  "confidence": 0-100
}}

Only return the JSON object, no explanation."""

    try:
        client = get_client()
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        text = msg.content[0].text.strip()
        # Strip markdown code blocks if present
        text = re.sub(r"^```json\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        data = json.loads(text)
        return _post_process(data)
    except Exception as e:
        return {"error": str(e), "confidence": 0}


def _post_process(data: dict) -> dict:
    """Clean and enrich AI output."""
    price_min, price_max, is_free = parse_price(data.get("price_text", "") or "")
    data["price_min"] = price_min
    data["price_max"] = price_max
    data["is_free"] = is_free

    # Validate/parse datetimes
    for field in ("start_datetime", "end_datetime"):
        raw = data.get(field)
        if raw:
            try:
                parsed = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
                data[field] = parsed.isoformat()
            except ValueError:
                data[field] = None

    # Ensure lists
    for field in ("tags", "images"):
        if not isinstance(data.get(field), list):
            data[field] = []

    # Auto-detect category if not set or generic
    if not data.get("category") or data["category"] == "general":
        data["category"] = detect_category(
            data.get("title", ""),
            data.get("description", "") or "",
        )

    return data


def normalise_raw(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalise a pre-structured dict (e.g. from API connector)."""
    price_min, price_max, is_free = parse_price(str(raw.get("price", "") or ""))
    tags = raw.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]

    return {
        "title": raw.get("title") or raw.get("name") or "",
        "description": raw.get("description") or "",
        "start_datetime": raw.get("start_datetime") or raw.get("start") or raw.get("date"),
        "end_datetime": raw.get("end_datetime") or raw.get("end"),
        "all_day": raw.get("all_day", False),
        "venue_name": raw.get("venue_name") or raw.get("venue") or raw.get("location") or "",
        "ticket_url": raw.get("ticket_url") or raw.get("url") or raw.get("ticketLink"),
        "price_min": price_min,
        "price_max": price_max,
        "is_free": is_free,
        "age_restriction": raw.get("age_restriction"),
        "category": raw.get("category") or detect_category(
            raw.get("title") or raw.get("name") or "",
            raw.get("description") or "",
        ),
        "tags": tags if isinstance(tags, list) else [],
        "images": raw.get("images", []) or (
            [raw["image"]] if raw.get("image") else []
        ),
        "confidence": raw.get("confidence", 60),
        "source_url": raw.get("source_url") or raw.get("url") or "",
        "source_name": raw.get("source_name") or "",
    }
