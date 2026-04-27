"""
Automatically clean up mock data and duplicates by rejecting them via API
"""
import json
import requests
import time

# API endpoint
API_URL = "https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec"

print("AUTO-CLEANUP: Removing mock data and duplicates")
print("=" * 60)

# Fetch all events
print("\n[1/3] Fetching all events...")
response = requests.get(API_URL)
data = response.json()
events = data.get('events', [])
print(f"Found {len(events)} total events")

# Identify events to remove
to_remove = []
seen_events = {}

for event in events:
    event_id = event.get('eventid', '')
    event_name = event.get('eventname', event.get('name', ''))
    event_date = event.get('date', '')

    unique_key = f"{event_name}_{event_date}".lower().strip()

    # Mark for removal if it's mock/test data
    if 'SAMPLE-' in event_id or 'API Test Event' in event_name or 'DELETE ME' in event_name:
        to_remove.append({
            'id': event_id,
            'name': event_name,
            'reason': 'Mock/Test Data'
        })
        continue

    # Mark duplicates for removal
    if unique_key in seen_events:
        to_remove.append({
            'id': event_id,
            'name': event_name,
            'reason': f'Duplicate of {seen_events[unique_key]}'
        })
        continue

    seen_events[unique_key] = event_id

print(f"\n[2/3] Identified {len(to_remove)} events to remove:")
print(f"  - {sum(1 for e in to_remove if 'Mock' in e['reason'])} mock/test events")
print(f"  - {sum(1 for e in to_remove if 'Duplicate' in e['reason'])} duplicates")

# Remove events by updating status to "Rejected"
print(f"\n[3/3] Removing events via API...")
success_count = 0
fail_count = 0

for event in to_remove:
    try:
        # Update status to Rejected
        payload = {
            'action': 'updateStatus',
            'eventId': event['id'],
            'status': 'Rejected'
        }

        response = requests.post(API_URL, json=payload, timeout=10)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                success_count += 1
                print(f"  [OK] Removed: {event['name'][:50]}...")
            else:
                fail_count += 1
                print(f"  [FAIL] {event['name'][:50]}: {result.get('message', 'Unknown error')}")
        else:
            fail_count += 1
            print(f"  [FAIL] HTTP {response.status_code} for: {event['name'][:50]}")

        time.sleep(0.5)  # Rate limiting

    except Exception as e:
        fail_count += 1
        print(f"  [ERROR] {event['name'][:50]}: {e}")

print("\n" + "=" * 60)
print("CLEANUP COMPLETE")
print("=" * 60)
print(f"SUCCESS: {success_count} events removed")
print(f"FAILED:  {fail_count} events")
print(f"\nREAL EVENTS REMAINING: {len(events) - len(to_remove)} events")
print("\nThese real events are now live on your website!")
print("Visit: https://norwicheventshub.com")
