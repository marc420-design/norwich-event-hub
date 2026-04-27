"""
Norwich Events Hub — Botasaurus scraper
Scrapes 20+ Norwich event sources, normalises with Claude AI, exports events.json.

Usage:
    cd automation/botasaurus_scraper
    ANTHROPIC_API_KEY=sk-... python main.py

Or from project root:
    ANTHROPIC_API_KEY=sk-... python automation/botasaurus_scraper/main.py
"""
import sys
import os

# Allow imports from this folder regardless of working directory
sys.path.insert(0, os.path.dirname(__file__))

from botasaurus.request import request, AntiDetectRequests
from botasaurus.browser import browser, AntiDetectDriver
from bs4 import BeautifulSoup

from sources import SOURCES
from normaliser import normalise_with_gemini
from exporter import deduplicate_and_export


# ── Helpers ───────────────────────────────────────────────────────────────────

def _clean_html(html: str) -> str:
    """Strip nav/footer/scripts and return readable text (max 8000 chars)."""
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["nav", "footer", "script", "style", "aside", "header"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)[:8000]


# ── Botasaurus scrapers ────────────────────────────────────────────────────────

@request(
    cache=True,          # cache raw HTML — fast re-runs while developing
    parallel=5,          # scrape 5 request-mode sources simultaneously
    output=None,         # don't write Botasaurus default output files
    raise_exception=False,
)
def scrape_with_requests(req: AntiDetectRequests, source: dict) -> dict | None:
    """Fast HTTP scrape for sources that don't need JavaScript."""
    try:
        resp = req.get(source["url"], timeout=20)
        text = _clean_html(resp.text)
        print(f"[REQ]  {source['name']}: {len(text)} chars")
        return {"source": source["name"], "url": source["url"], "text": text}
    except Exception as err:
        print(f"[FAIL] {source['name']}: {err}")
        return None


@browser(
    cache=True,
    parallel=2,           # 2 headless browsers at once — enough for JS-heavy sites
    output=None,
    headless=True,
    block_images=True,    # faster page loads
    raise_exception=False,
)
def scrape_with_browser(driver: AntiDetectDriver, source: dict) -> dict | None:
    """Headless Chromium scrape for JavaScript-heavy aggregator pages."""
    try:
        driver.get(source["url"])
        driver.scroll_to_bottom()           # trigger lazy-load
        text = _clean_html(driver.page_source)
        print(f"[BRW]  {source['name']}: {len(text)} chars")
        return {"source": source["name"], "url": source["url"], "text": text}
    except Exception as err:
        print(f"[FAIL] {source['name']}: {err}")
        return None


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    if not os.environ.get("GEMINI_API_KEY"):
        print("[ERROR] GEMINI_API_KEY environment variable is not set.")
        sys.exit(1)

    request_sources = [s for s in SOURCES if s["type"] == "request"]
    browser_sources  = [s for s in SOURCES if s["type"] == "browser"]

    print(f"\n=== Norwich Events Scraper ===")
    print(f"Sources: {len(request_sources)} request + {len(browser_sources)} browser\n")

    # 1. Scrape
    raw_results: list[dict] = []

    if request_sources:
        results = scrape_with_requests(request_sources)
        raw_results += [r for r in (results if isinstance(results, list) else [results]) if r]

    if browser_sources:
        results = scrape_with_browser(browser_sources)
        raw_results += [r for r in (results if isinstance(results, list) else [results]) if r]

    print(f"\n--- Scraped {len(raw_results)} sources successfully ---\n")

    # 2. Normalise with Claude AI
    all_events: list[dict] = []
    for raw in raw_results:
        if not raw or not raw.get("text"):
            continue
        events = normalise_with_gemini(raw["text"], raw["url"], raw["source"])
        all_events.extend(events)

    print(f"\n--- Claude extracted {len(all_events)} raw events ---\n")

    # 3. Deduplicate and export
    count = deduplicate_and_export(all_events)

    if count == 0:
        print("[WARN] No events exported — check source scraping and Claude responses.")
        sys.exit(1)  # non-zero exit so GitHub Actions can detect failure
    else:
        print(f"\n✓ Done. {count} events written to exports/events.json")


if __name__ == "__main__":
    main()
