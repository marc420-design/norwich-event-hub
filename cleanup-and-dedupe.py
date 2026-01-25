"""
Clean up mock data and remove duplicates from Google Sheets
"""
import json
import requests
from collections import defaultdict
import sys
import io

# Set UTF-8 encoding for console output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# API endpoint
API_URL = "https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec"

print("Cleaning up mock data and removing duplicates...")
print("=" * 60)

# Fetch all events
print("\n[FETCH] Fetching all events from Google Sheets...")
response = requests.get(API_URL)
data = response.json()
events = data.get('events', [])

print(f" Found {len(events)} total events")

# Identify what to remove
mock_events = []
test_events = []
duplicates = []
keep_events = []

# Track unique events by name
seen_events = {}

for event in events:
    event_id = event.get('eventid', '')
    event_name = event.get('eventname', event.get('name', ''))
    event_date = event.get('date', '')

    # Create unique key for deduplication
    unique_key = f"{event_name}_{event_date}".lower().strip()

    # Check if it's mock/test data
    if 'SAMPLE-' in event_id:
        mock_events.append(event_name)
        continue
    elif 'API Test Event' in event_name or 'DELETE ME' in event_name:
        test_events.append(event_name)
        continue

    # Check for duplicates
    if unique_key in seen_events:
        duplicates.append(f"{event_name} (duplicate of event {seen_events[unique_key]})")
        continue

    # Keep this event
    seen_events[unique_key] = event_id
    keep_events.append(event)

# Summary
print("\n" + "=" * 60)
print(" ANALYSIS COMPLETE")
print("=" * 60)
print(f"\n  Mock/Sample Events to Remove: {len(mock_events)}")
for i, name in enumerate(mock_events[:10], 1):
    print(f"   {i}. {name}")
if len(mock_events) > 10:
    print(f"   ... and {len(mock_events) - 10} more")

print(f"\n Test Events to Remove: {len(test_events)}")
for name in test_events:
    print(f"   - {name}")

print(f"\n Duplicate Events Found: {len(duplicates)}")
for i, dup in enumerate(duplicates[:10], 1):
    print(f"   {i}. {dup}")
if len(duplicates) > 10:
    print(f"   ... and {len(duplicates) - 10} more")

print(f"\n Real Events to Keep: {len(keep_events)}")
print("\nSample of events being kept:")
for i, event in enumerate(keep_events[:15], 1):
    event_name = event.get('eventname', event.get('name', ''))
    event_id = event.get('eventid', '')
    print(f"   {i}. {event_name} ({event_id})")

print("\n" + "=" * 60)
print(f" BEFORE: {len(events)} events")
print(f" AFTER:  {len(keep_events)} events")
print(f"  REMOVED: {len(events) - len(keep_events)} events")
print("=" * 60)

print("\n  NOTE: This script only analyzes the data.")
print("   To actually remove the mock/duplicate events, you need to:")
print("   1. Open your Google Sheet manually")
print("   2. Delete rows with IDs starting with 'SAMPLE-'")
print("   3. Delete the 'API Test Event - DELETE ME' row")
print("   4. Delete duplicate event rows")
print("\n   OR run: python cleanup-sheet.py --execute")
