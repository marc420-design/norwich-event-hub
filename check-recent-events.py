"""
Check recently submitted events
"""

import json
from datetime import datetime

# Read all events
with open('data/all-events-latest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

events = data.get('events', [])

# Events we submitted
submitted_names = [
    "Hip Hop Night",
    "Country/Folk Evening",
    "Rock/Pop Concert",
    "Electronica/Jazz Night",
    "Rock/Pop Show",
    "Norwich Science Festival - Opening Day",
    "Synth East 2026 - Electronic Music Festival",
    "Synth East 2026 - Cabaret Voltaire Headline",
    "The Specials Ltd. 'Ghost Town' 45th Anniversary",
    "Aladdinsane - The Sound & Vision of Bowie"
]

print('=' * 70)
print('CHECKING FOR NEWLY SUBMITTED EVENTS')
print('=' * 70)

found_count = 0

for submitted_name in submitted_names:
    found = False
    for event in events:
        name = event.get('name') or event.get('eventname', '')
        if submitted_name.lower() in name.lower():
            found = True
            found_count += 1
            status = event.get('status', 'EMPTY')
            eventid = event.get('eventid', 'N/A')
            timestamp = event.get('timestamp', 'N/A')
            date = event.get('date', 'N/A')

            print(f"\n[FOUND] {submitted_name}")
            print(f"  Event ID: {eventid}")
            print(f"  Status: '{status}'")
            print(f"  Timestamp: {timestamp}")
            print(f"  Event Date: {date}")
            break

    if not found:
        print(f"\n[NOT FOUND] {submitted_name}")

print('\n' + '=' * 70)
print(f"Found {found_count} out of {len(submitted_names)} submitted events")
print('=' * 70)

# Check events with empty status
empty_status_events = [e for e in events if e.get('status', '') == '']
print(f"\n\nEVENTS WITH EMPTY STATUS: {len(empty_status_events)}")
print('-' * 70)
print("Showing last 15 events with empty status:")
for event in empty_status_events[-15:]:
    name = event.get('name') or event.get('eventname', 'Unknown')
    eventid = event.get('eventid', 'N/A')
    timestamp = event.get('timestamp', 'N/A')
    print(f"  - {name} (ID: {eventid}, Time: {timestamp})")
