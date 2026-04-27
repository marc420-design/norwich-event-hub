"""
HTML Calendar Connector
Parses venue "What's On" pages using BeautifulSoup + Claude AI.
"""
from __future__ import annotations
from bs4 import BeautifulSoup
from app.connectors.base import BaseConnector
from app.workers.normaliser import normalise_with_ai


class HTMLConnector(BaseConnector):
    connector_type = "html"

    def __init__(self, source_id: str, url: str, name: str = ""):
        super().__init__(source_id, url)
        self.name = name or "HTML Connector"

    async def fetch(self) -> list[dict]:
        response = await self._get(self.url)
        html = response.text
        return [{"_html": html, "_url": self.url}]

    async def extract(self, raw: dict) -> dict:
        html = raw.get("_html", "")
        url = raw.get("_url", self.url)

        soup = BeautifulSoup(html, "lxml")
        # Remove nav, footer, scripts to reduce noise
        for tag in soup.find_all(["nav", "footer", "script", "style", "aside"]):
            tag.decompose()
        clean_text = soup.get_text(separator=" ", strip=True)

        # Use AI to extract events from the clean text
        extracted = await normalise_with_ai(clean_text, url)
        if "error" in extracted:
            return {}

        # HTMLConnector may return multiple events from one page
        # We return the first hit here; multi_extract below handles many
        return extracted

    async def multi_extract(self) -> list[dict]:
        """
        For pages with multiple event listings, try to extract each listing
        separately by finding event-like containers.
        """
        response = await self._get(self.url)
        soup = BeautifulSoup(response.text, "lxml")

        # Common event container patterns
        SELECTORS = [
            "article",
            "[class*='event']",
            "[class*='listing']",
            "[class*='card']",
            "li[class*='event']",
        ]

        containers = []
        for sel in SELECTORS:
            found = soup.select(sel)
            if len(found) > 2:
                containers = found
                break

        if not containers:
            # Fall back to single full-page extract
            return await self.run()

        events = []
        for container in containers[:30]:  # cap at 30
            text = container.get_text(separator=" ", strip=True)
            if len(text) < 30:
                continue
            extracted = await normalise_with_ai(text, self.url)
            if extracted.get("title"):
                extracted["source_url"] = self.url
                extracted["source_name"] = self.name
                events.append(extracted)

        return events

    async def run(self) -> list[dict]:
        return await self.multi_extract()
