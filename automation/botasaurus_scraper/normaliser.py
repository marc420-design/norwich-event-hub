"""
Gemini AI event normaliser.
Sends cleaned page text to Gemini Flash and gets back a structured list of events.
Tries multiple model names in order so the first available one is used.
"""
import json
import os
from datetime import datetime

from google import genai

_client = None
_working_model = None

CANDIDATE_MODELS = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
]


def get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


def get_working_model() -> str:
    global _working_model
    if _working_model:
        return _working_model
    client = get_client()
    for model in CANDIDATE_MODELS:
        try:
            client.models.generate_content(model=model, contents="Reply with the word OK")
            _working_model = model
            print(f"[MODEL] Using Gemini model: {model}")
            return model
        except Exception as error:
            print(f"[MODEL] {model} unavailable: {error}")
    raise RuntimeError("No working Gemini model found for this API key.")


TODAY = datetime.utcnow().strftime("%Y-%m-%d")

PROMPT_TEMPLATE = """You are an event data extractor for Norwich, UK.
Extract ALL events from the webpage text below and return ONLY a valid JSON array with no markdown and no explanation.

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
  "official_url": "string or null",
  "image_url": "string or null",
  "price": "string e.g. Free / £10 / £5-£15",
  "category": "one of: nightlife | gigs | theatre | markets | exhibitions | festivals | workshops | community | sports | culture | comedy | family | general",
  "tags": ["tag1", "tag2"]
}}

Rules:
- Only include FUTURE events (today is {today}). Skip anything before this date.
- Never invent or hallucinate data. If a field is genuinely unknown, use null.
- Prefer a direct event or ticket page in "ticket_url" when present.
- Use "official_url" for the best venue page or canonical event page when no ticket link is available.
- The "venue" field should be the named venue, not just "Norwich", unless the source genuinely gives no better venue.
- If no events are found, return an empty array: []
- Return ONLY the JSON array, starting with [ and ending with ]

Source: {source_name}
URL: {source_url}

{text}"""


def normalise_with_gemini(text: str, source_url: str, source_name: str) -> list[dict]:
    """Send page text to Gemini and return a list of parsed event dicts."""
    if not text or len(text.strip()) < 100:
        return []

    prompt = PROMPT_TEMPLATE.format(
        today=TODAY,
        source_name=source_name,
        source_url=source_url,
        text=text[:8000],
    )

    try:
        model = get_working_model()
        response = get_client().models.generate_content(model=model, contents=prompt)
        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        events = json.loads(raw)
        if not isinstance(events, list):
            print(f"[WARN] {source_name}: Gemini returned non-list")
            return []

        for event in events:
            event["source"] = source_name
            event["source_url"] = source_url
            event["isAiDiscovered"] = True
            event["status"] = "pending"

        print(f"[OK]   {source_name}: {len(events)} events extracted")
        return events

    except json.JSONDecodeError as error:
        print(f"[WARN] {source_name}: JSON parse error - {error}")
        return []
    except RuntimeError as error:
        print(f"[ERROR] {error}")
        raise
    except Exception as error:
        print(f"[WARN] {source_name}: Gemini failed - {error}")
        return []
