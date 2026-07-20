"""
ICS / iCalendar Connector
Parses .ics calendar feeds.
"""
from __future__ import annotations
from icalendar import Calendar
from app.connectors.base import BaseConnector
from app.workers.normaliser import normalise_raw


class ICSConnector(BaseConnector):
    connector_type = "ics"

    def __init__(self, source_id: str, url: str, name: str = ""):
        super().__init__(source_id, url)
        self.name = name or "ICS Connector"

    async def fetch(self) -> list[dict]:
        response = await self._get(self.url)
        cal = Calendar.from_ical(response.content)

        events = []
        for component in cal.walk():
            if component.name != "VEVENT":
                continue

            dtstart = component.get("DTSTART")
            dtend = component.get("DTEND")
            start = dtstart.dt if dtstart else None
            end = dtend.dt if dtend else None

            # Make datetime from date-only values
            from datetime import datetime, date
            if isinstance(start, date) and not isinstance(start, datetime):
                start = datetime(start.year, start.month, start.day)
                all_day = True
            else:
                all_day = False

            events.append({
                "title": str(component.get("SUMMARY", "")),
                "description": str(component.get("DESCRIPTION", "") or ""),
                "start_datetime": start.isoformat() if start else None,
                "end_datetime": end.isoformat() if end else None,
                "all_day": all_day,
                "venue_name": str(component.get("LOCATION", "") or ""),
                "ticket_url": str(component.get("URL", "") or "") or None,
                "source_url": self.url,
                "source_name": self.name,
                "confidence": 80,
            })

        return events

    async def extract(self, raw: dict) -> dict:
        return normalise_raw(raw)
