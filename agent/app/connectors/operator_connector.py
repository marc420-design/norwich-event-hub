"""
Operator Connector (Playwright-based)
For JavaScript-heavy sites that can't be scraped with simple HTTP.
Uses a persistent browser profile. NEVER stores passwords.
"""
from __future__ import annotations
import os
import json
from pathlib import Path
from datetime import datetime
from app.connectors.base import BaseConnector
from app.workers.normaliser import normalise_with_ai
from app.core.config import settings


PROFILE_DIR = Path(__file__).parent.parent.parent / "playwright_profile"


class OperatorConnector(BaseConnector):
    """
    Browser-automation connector using Playwright.
    Only runs on manual trigger.
    """
    connector_type = "operator"

    def __init__(self, source_id: str, url: str, name: str = ""):
        super().__init__(source_id, url)
        self.name = name or "Operator Connector"

    async def fetch(self) -> list[dict]:
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            raise ImportError("playwright not installed. Run: playwright install chromium")

        PROFILE_DIR.mkdir(parents=True, exist_ok=True)

        async with async_playwright() as p:
            browser = await p.chromium.launch_persistent_context(
                user_data_dir=str(PROFILE_DIR),
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox"],
            )
            page = await browser.new_page()
            await page.goto(self.url, wait_until="networkidle", timeout=60000)

            # Save screenshot as evidence
            screenshot_path = (
                Path(settings.evidence_dir) / f"operator_{self.source_id}_{int(datetime.utcnow().timestamp())}.png"
            )
            screenshot_path.parent.mkdir(parents=True, exist_ok=True)
            await page.screenshot(path=str(screenshot_path), full_page=True)

            # Extract visible text
            content = await page.evaluate("() => document.body.innerText")

            await browser.close()

        return [{"_text": content, "_url": self.url, "_screenshot": str(screenshot_path)}]

    async def extract(self, raw: dict) -> dict:
        text = raw.get("_text", "")
        url = raw.get("_url", self.url)
        extracted = await normalise_with_ai(text, url)
        extracted["screenshot_path"] = raw.get("_screenshot")
        return extracted

    async def run(self) -> list[dict]:
        raw_list = await self.fetch()
        results = []
        for raw in raw_list:
            extracted = await self.extract(raw)
            if extracted.get("title"):
                extracted.setdefault("source_url", self.url)
                extracted.setdefault("source_name", self.name)
                results.append(extracted)
        return results
