"""
API Connector
Supports paginated JSON APIs (Eventbrite, Skiddle, etc.)
"""
from __future__ import annotations
from app.connectors.base import BaseConnector
from app.workers.normaliser import normalise_raw
import httpx


class SkiddleConnector(BaseConnector):
    """Skiddle public API connector."""
    connector_type = "api"

    def __init__(self, source_id: str, api_key: str = ""):
        url = "https://www.skiddle.com/api/v1/events/search/"
        super().__init__(source_id, url)
        self.name = "Skiddle"
        self.api_key = api_key

    async def fetch(self) -> list[dict]:
        events = []
        offset = 0
        limit = 50

        while True:
            params = {
                "api_key": self.api_key,
                "town": "Norwich",
                "limit": limit,
                "offset": offset,
                "order": "date",
                "description": 1,
            }
            try:
                resp = await self._get(self.url + "?" + "&".join(f"{k}={v}" for k, v in params.items()))
                data = resp.json()
                batch = data.get("results", [])
                if not batch:
                    break
                events.extend(batch)
                if len(batch) < limit:
                    break
                offset += limit
            except Exception:
                break

        return events

    async def extract(self, raw: dict) -> dict:
        return normalise_raw({
            "title": raw.get("eventname"),
            "description": raw.get("description") or raw.get("entrydetails"),
            "start_datetime": raw.get("date"),
            "venue_name": raw.get("venue", {}).get("name") if isinstance(raw.get("venue"), dict) else raw.get("venue"),
            "ticket_url": raw.get("link"),
            "price_text": str(raw.get("entryprice", "") or ""),
            "images": [raw["largeimageurl"]] if raw.get("largeimageurl") else [],
            "category": raw.get("genreid", "general"),
            "source_url": self.url,
            "source_name": self.name,
            "confidence": 75,
        })


class EventbriteConnector(BaseConnector):
    """Eventbrite API connector."""
    connector_type = "api"

    def __init__(self, source_id: str, api_key: str = ""):
        url = "https://www.eventbriteapi.com/v3/events/search/"
        super().__init__(source_id, url)
        self.name = "Eventbrite"
        self.api_key = api_key

    async def fetch(self) -> list[dict]:
        events = []
        page = 1
        headers = {"Authorization": f"Bearer {self.api_key}"}

        while True:
            params = {
                "location.address": "Norwich, UK",
                "location.within": "10km",
                "expand": "venue",
                "page": page,
            }
            try:
                url = self.url + "?" + "&".join(f"{k}={v}" for k, v in params.items())
                resp = await self._get(url, headers=headers)
                data = resp.json()
                batch = data.get("events", [])
                if not batch:
                    break
                events.extend(batch)
                if not data.get("pagination", {}).get("has_more_items"):
                    break
                page += 1
            except Exception:
                break

        return events

    async def extract(self, raw: dict) -> dict:
        venue = raw.get("venue") or {}
        start = raw.get("start", {})
        end = raw.get("end", {})
        return normalise_raw({
            "title": (raw.get("name") or {}).get("text", ""),
            "description": (raw.get("description") or {}).get("text", ""),
            "start_datetime": start.get("local") or start.get("utc"),
            "end_datetime": end.get("local") or end.get("utc"),
            "venue_name": venue.get("name"),
            "ticket_url": raw.get("url"),
            "is_free": raw.get("is_free", False),
            "images": [raw["logo"]["url"]] if raw.get("logo") else [],
            "source_url": raw.get("url", self.url),
            "source_name": self.name,
            "confidence": 80,
        })
