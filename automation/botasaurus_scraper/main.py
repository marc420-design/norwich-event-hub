"""
Norwich Events Hub scraper.
Scrapes Norwich event sources, normalises with Gemini AI, and exports canonical events.json.

Usage:
    cd automation/botasaurus_scraper
    GEMINI_API_KEY=xxx python main.py
"""
import concurrent.futures
import json
import os
import pathlib
import sys
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(__file__))

from exporter import deduplicate_and_export
from normaliser import normalise_with_gemini
from sources import SOURCES


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
    """Strip nav/footer/scripts and return readable text."""
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
            response = requests.get(url, headers=HEADERS, timeout=25, allow_redirects=True)
            if response.status_code == 200:
                text = _clean_html(response.text)
                if len(text) > 200:
                    print(f"[OK]   {name}: {len(text)} chars")
                    return {"source": name, "url": url, "text": text}
                print(f"[SKIP] {name}: too little content ({len(text)} chars)")
                return None

            print(f"[HTTP] {name}: status {response.status_code}")
            if attempt < 2:
                time.sleep(2)
        except requests.exceptions.Timeout:
            print(f"[TIMEOUT] {name} (attempt {attempt + 1})")
            if attempt < 2:
                time.sleep(3)
        except Exception as error:
            print(f"[FAIL] {name}: {error}")
            return None

    print(f"[GIVE UP] {name}: all attempts failed")
    return None


def main() -> None:
    if not os.environ.get("GEMINI_API_KEY"):
        print("[ERROR] GEMINI_API_KEY environment variable is not set.")
        sys.exit(1)

    start_time = datetime.now()
    run_id = start_time.strftime("%Y-%m-%d-%H%M")

    print(f"\n=== Norwich Events Scraper (Run: {run_id}) ===")
    print(f"Sources: {len(SOURCES)}\n")

    raw_results: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(scrape_source, source): source for source in SOURCES}
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                raw_results.append(result)

    print(f"\n--- Scraped {len(raw_results)}/{len(SOURCES)} sources successfully ---\n")

    if not raw_results:
        print("[ERROR] No sources scraped. Exiting.")
        sys.exit(1)

    all_events: list[dict] = []
    errors = 0
    for index, raw in enumerate(raw_results, 1):
        try:
            print(f"[AI] Normalising {index}/{len(raw_results)}: {raw['source']}")
            events = normalise_with_gemini(raw["text"], raw["url"], raw["source"])
            all_events.extend(events)
            if index < len(raw_results):
                time.sleep(0.5)
        except Exception as error:
            print(f"[AI ERROR] {raw['source']}: {error}")
            errors += 1

    print(f"\n--- Gemini extracted {len(all_events)} raw events ---\n")

    export_stats = deduplicate_and_export(all_events)

    end_time = datetime.now()
    log = {
        "run_id": run_id,
        "started_at": start_time.isoformat(),
        "finished_at": end_time.isoformat(),
        "duration_seconds": (end_time - start_time).total_seconds(),
        "sources_total": len(SOURCES),
        "sources_scraped": len(raw_results),
        "raw_events_extracted": len(all_events),
        "valid_events": export_stats["valid_events"],
        "approved_exports": export_stats["approved_exports"],
        "review_queue": export_stats["review_queue"],
        "duplicates": export_stats["duplicates"],
        "skipped": export_stats["skipped"],
        "errors": errors,
        "status": "completed" if export_stats["approved_exports"] > 0 else "failed",
    }

    log_dir = pathlib.Path(__file__).resolve().parent.parent.parent / "exports" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    (log_dir / f"run-{run_id}.json").write_text(json.dumps(log, indent=2), encoding="utf-8")
    (log_dir / "latest-run.json").write_text(json.dumps(log, indent=2), encoding="utf-8")

    if export_stats["approved_exports"] == 0:
        print("[INFO] No events auto-published. All scraped events are queued for manual approval.")
        print("Review queue file: exports/logs/scraper-review-queue.json")
        return

    print(f"\nDone. {export_stats['approved_exports']} events written to exports/events.json")
    print(f"Review queue: {export_stats['review_queue']} events written to exports/logs/scraper-review-queue.json")
    print(f"Log written to exports/logs/run-{run_id}.json")


if __name__ == "__main__":
    main()
