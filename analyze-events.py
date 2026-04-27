"""
Analyze events from Google Sheets
"""

import json

# Read all events
with open('data/all-events-latest.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

events = data.get('events', [])

# Count by status
status_counts = {}
for event in events:
    status = event.get('status', 'Unknown')
    status_counts[status] = status_counts.get(status, 0) + 1

# Count total
total = len(events)

print('=' * 60)
print('EVENT STATUS SUMMARY')
print('=' * 60)
print(f"\nTotal events in Google Sheets: {total}")
print(f"\nBreakdown by status:")
for status, count in sorted(status_counts.items()):
    print(f"  {status}: {count}")

# Show pending events
pending_events = [e for e in events if e.get('status', '').lower() == 'pending']
print(f"\n\nPENDING EVENTS ({len(pending_events)}):")
print('-' * 60)
for event in pending_events:
    name = event.get('name') or event.get('eventname', 'Unknown')
    date = event.get('date', 'No date')
    location = event.get('location', 'No location')
    print(f"  - {name}")
    print(f"    Date: {date} | Location: {location}")

# Show approved events
approved_events = [e for e in events if e.get('status', '').lower() == 'approved']
print(f"\n\nAPPROVED EVENTS ({len(approved_events)}):")
print('-' * 60)
for event in approved_events[:10]:  # Show first 10
    name = event.get('name') or event.get('eventname', 'Unknown')
    date = event.get('date', 'No date')
    print(f"  - {name} ({date})")

if len(approved_events) > 10:
    print(f"  ... and {len(approved_events) - 10} more")

print('\n' + '=' * 60)
print(f"\nREADY FOR PRODUCTION: {len(approved_events)} approved events")
print(f"PENDING REVIEW: {len(pending_events)} events")
print('=' * 60)
