"""
Norwich Events Hub — Events scraper
Scrapes 20+ Norwich event sources, normalises with Gemini AI, exports events.json.

Usage:
    cd automation/botasaurus_scraper
    GEMINI_API_KEY=xxx python main.py
"""
import sys
import os
import time
import concurrent.futures

import requests
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(__file__))

from sources import SOURCES
from normaliser import normalise_with_gemini
from exporter import deduplicate_and_export


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
}


def _clean_html(html: str) -> str:
    """Strip nav/footer/scripts and return readable text (max 8000 chars)."""
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["nav", "footer", "script", "style", "aside", "header"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)[:8000]


def scrape_source(source: dict) -> dict | None:
    """Scrape a single source with requests + retries."""
    url = source["url"]
    name = source["name"]
    for attempt in range(3):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=25, allow_redirects=True)
            if resp.status_code == 200:
                text = _clean_html(resp.text)
                if len(text) > 200:
                    print(f"[OK]   {name}: {len(text)} chars")
                    return {"source": name, "url": url, "text": text}
                else:
                    print(f"[SKIP] {name}: too little content ({len(text)} chars)")
                    return None
            else:
                print(f"[HTTP] {name}: status {resp.status_code}")
                if attempt < 2:
                    time.sleep(2)
        except requests.exceptions.Timeout:
            print(f"[TIMEOUT] {name} (attempt {attempt + 1})")
            if attempt < 2:
                time.sleep(3)
        except Exception as err:
            print(f"[FAIL] {name}: {err}")
            return None
    print(f"[GIVE UP] {name}: all attempts failed")
    return None


def main() -> None:
    if not os.environ.get("GEMINI_API_KEY"):
        print("[ERROR] GEMINI_API_KEY environment variable is not set.")
        sys.exit(1)

    print(f"\n=== Norwich Events Scraper ===")
    print(f"Sources: {len(SOURCES)}\n")

    # 1. Scrape all sources in parallel (max 8 at once)
    raw_results: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(scrape_source, s): s for s in SOURCES}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                raw_results.append(result)

    print(f"\n--- Scraped {len(raw_results)}/{len(SOURCES)} sources successfully ---\n")

    if not raw_results:
        print("[ERROR] No sources scraped. Exiting.")
        sys.exit(1)

    # 2. Normalise with Gemini AI (sequential to respect rate limits)
    all_events: list[dict] = []
    for i, raw in enumerate(raw_results, 1):
        print(f"[AI] Normalising {i}/{len(raw_results)}: {raw['source']}")
        events = normalise_with_gemini(raw["text"], raw["url"], raw["source"])
        all_events.extend(events)
        # Small delay between API calls
        if i < len(raw_results):
            time.sleep(0.5)

    print(f"\n--- Gemini extracted {len(all_events)} raw events ---\n")

    # 3. Deduplicate and export
    count = deduplicate_and_export(all_events)

    if count == 0:
        print("[WARN] No events exported — check source scraping and Gemini responses.")
        sys.exit(1)
    else:
        print(f"\n✓ Done. {count} events written to exports/events.json")


if __name__ == "__main__":
    main()
