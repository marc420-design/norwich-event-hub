"""
Base Connector class.
All connectors must implement: discover(), fetch(), extract(), normalize().
"""
from __future__ import annotations
import asyncio
import time
import httpx
from abc import ABC, abstractmethod
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.config import settings
from app.workers.normaliser import normalise_raw, normalise_with_ai
from rich.console import Console

console = Console()


class ConnectorError(Exception):
    pass


class BaseConnector(ABC):
    name: str = "base"
    connector_type: str = "html"  # api / html / ics / pdf / operator

    def __init__(self, source_id: str, url: str):
        self.source_id = source_id
        self.url = url
        self._last_request_time = 0.0

    def _throttle(self):
        elapsed = time.time() - self._last_request_time
        if elapsed < settings.request_delay:
            time.sleep(settings.request_delay - elapsed)
        self._last_request_time = time.time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, ConnectorError)),
        reraise=True,
    )
    async def _get(self, url: str, headers: dict | None = None) -> httpx.Response:
        self._throttle()
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            response = await client.get(url, headers=headers or {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            })
            response.raise_for_status()
            return response

    @abstractmethod
    async def fetch(self) -> list[dict]:
        """Fetch raw event data from the source. Returns list of raw dicts."""
        ...

    async def extract(self, raw: dict) -> dict:
        """Transform raw dict into normalised event dict."""
        return normalise_raw(raw)

    async def run(self) -> list[dict]:
        """Full pipeline: fetch → extract → list of normalised events."""
        raw_events = await self.fetch()
        console.log(f"[{self.name}] fetched {len(raw_events)} raw events")
        normalised = []
        for raw in raw_events:
            try:
                event = await self.extract(raw)
                if event.get("title"):
                    event.setdefault("source_url", self.url)
                    event.setdefault("source_name", self.name)
                    normalised.append(event)
            except Exception as e:
                console.log(f"[{self.name}] extract error: {e}")
        console.log(f"[{self.name}] normalised {len(normalised)} events")
        return normalised
