"""
Gemini AI event normaliser.
Sends cleaned page text to Gemini Flash and gets back a structured list of events.
"""
import json
import os
from datetime import datetime

from google import genai

_client = None


def get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


TODAY = datetime.utcnow().strftime("%Y-%m-%d")

PROMPT_TEMPLATE = """You are an event data extractor for Norwich, UK.
Extract ALL events from the webpage text below and return ONLY a valid JSON array — no markdown, no explanation.

Each event object must use this exact shape:
{{
  "title": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM or null",
  "end_time": "HH:MM or null",
  "venue": "string",
  "address": "string or null",
  "description": "string",
  "ticket_url": "string or null",
  "image_url": "string or null",
  "price": "string e.g. Free / £10 / £5-£15",
  "category": "one of: nightlife | gigs | theatre | markets | exhibitions | festivals | workshops | community | sports | culture | comedy | family | general",
  "tags": ["tag1", "tag2"]
}}

Rules:
- Only include FUTURE events (today is {today}). Skip anything before this date.
- Never invent or hallucinate data. If a field is genuinely unknown, use null.
- If no events are found, return an empty array: []
- Return ONLY the JSON array, starting with [ and ending with ]

Source: {source_name}
URL: {source_url}

{text}"""


def normalise_with_gemini(text: str, source_url: str, source_name: str) -> list[dict]:
    """Send page text to Gemini Flash and return a list of parsed event dicts."""
    if not text or len(text.strip()) < 100:
        return []

    # Trim to token budget
    trimmed = text[:8000]

    prompt = PROMPT_TEMPLATE.format(
        today=TODAY,
        source_name=source_name,
        source_url=source_url,
        text=trimmed,
    )

    try:
        resp = get_client().models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        raw = resp.text.strip()

        # Strip any accidental markdown fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        events = json.loads(raw)
        if not isinstance(events, list):
            print(f"[WARN] {source_name}: Gemini returned non-list")
            return []

        # Stamp provenance on every event
        for e in events:
            e["source"] = source_name
            e["source_url"] = source_url
            e["isAiDiscovered"] = True
            e["status"] = "approved"

        print(f"[OK]   {source_name}: {len(events)} events extracted")
        return events

    except json.JSONDecodeError as err:
        print(f"[WARN] {source_name}: JSON parse error — {err}")
        return []
    except Exception as err:
        print(f"[WARN] {source_name}: Gemini failed — {err}")
        return []
