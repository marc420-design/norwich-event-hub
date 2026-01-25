"""
Approve the 10 newly submitted Norwich events
"""

import json
import requests
import time

API_URL = 'https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec'

# Read all events to find the ones we submitted
with open('data/all-events-latest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

events = data.get('events', [])

# Events we want to approve
target_events = [
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
print('APPROVING 10 REAL NORWICH EVENTS')
print('=' * 70)
print()

# Find events and their IDs
events_to_approve = []
for target_name in target_events:
    for event in events:
        name = event.get('name') or event.get('eventname', '')
        if target_name.lower() in name.lower():
            # Get the most recent one (last occurrence)
            events_to_approve.append({
                'name': name,
                'eventid': event.get('eventid', ''),
                'timestamp': event.get('timestamp', '')
            })
            break

# Group by name and take the most recent (latest timestamp)
unique_events = {}
for event in events_to_approve:
    name = event['name']
    if name not in unique_events or event['timestamp'] > unique_events[name]['timestamp']:
        unique_events[name] = event

print(f"Found {len(unique_events)} unique events to approve:\n")

# Unfortunately, the event IDs are empty, so we can't use the updateEventStatus API
# Instead, we'll need to manually approve them or fix the spreadsheet

for name, event in unique_events.items():
    eventid = event['eventid']
    print(f"  - {name}")
    print(f"    Event ID: '{eventid}' (EMPTY - cannot auto-approve)")
    print()

print('=' * 70)
print('ISSUE DETECTED')
print('=' * 70)
print()
print("The submitted events have empty Event IDs in the spreadsheet.")
print("This prevents automated approval via the API.")
print()
print("SOLUTION OPTIONS:")
print()
print("1. Manual Approval via Google Sheets:")
print("   - Open: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU")
print("   - Find the 10 events (timestamps: 2026-01-17 17:17-17:19)")
print("   - Change Status column from empty to 'Approved'")
print()
print("2. Update events via admin dashboard:")
print("   - Visit: https://norwicheventshub.com/admin")
print("   - Click Approve for each event")
print()
print("3. For now, use the 4 existing approved events on the site")
print("   - They're already live and working")
print()
print("=" * 70)
