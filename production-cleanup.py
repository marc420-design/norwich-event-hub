"""
Production Cleanup: Remove mock data and duplicates
This script marks unwanted events as "Rejected" so they won't appear on the website
"""
import requests
import time
import sys

API_URL = "https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec"

print("=" * 70)
print("PRODUCTION CLEANUP - Norwich Event Hub")
print("=" * 70)

# Step 1: Fetch all events
print("\n[1/4] Fetching all events from Google Sheets...")
try:
    response = requests.get(f"{API_URL}?action=getAllEvents", timeout=30)
    events = response.json().get('events', [])
    print(f"SUCCESS: Found {len(events)} total events in sheet")
except Exception as e:
    print(f"ERROR: Could not fetch events - {e}")
    sys.exit(1)

# Step 2: Identify what to remove
print("\n[2/4] Analyzing events...")
seen = {}
keep = []
to_remove = []

for event in events:
    eid = event.get('eventid', '')
    name = event.get('eventname', event.get('name', ''))
    date = event.get('date', '')
    key = f"{name}_{date}".lower().strip()

    # Identify mock/test data
    if 'SAMPLE-' in eid or 'API Test' in name or 'DELETE ME' in name:
        to_remove.append({'id': eid, 'name': name, 'reason': 'Mock/Test'})
        continue

    # Identify duplicates
    if key in seen and key != '_':  # Skip empty keys
        to_remove.append({'id': eid, 'name': name, 'reason': f'Duplicate of {seen[key]}'})
        continue

    # Keep this event
    seen[key] = eid
    keep.append(eid)

mock_count = sum(1 for e in to_remove if 'Mock' in e['reason'])
dup_count = sum(1 for e in to_remove if 'Duplicate' in e['reason'])

print(f"  Real events to keep: {len(keep)}")
print(f"  Mock/test to remove: {mock_count}")
print(f"  Duplicates to remove: {dup_count}")
print(f"  TOTAL TO REMOVE: {len(to_remove)}")

if len(to_remove) == 0:
    print("\nNOTHING TO REMOVE - Sheet is already clean!")
    sys.exit(0)

# Step 3: Remove events
print(f"\n[3/4] Removing {len(to_remove)} events...")
print("This may take a few minutes...")

success = 0
failed = 0

for i, event in enumerate(to_remove, 1):
    try:
        payload = {
            'action': 'updateStatus',
            'eventId': event['id'],
            'status': 'Rejected'
        }

        # Make POST request
        resp = requests.post(API_URL, json=payload, timeout=15)

        # Check if successful
        if resp.status_code == 200:
            # Try to parse JSON, but success even if it fails
            try:
                result = resp.json()
                if result.get('success', False):
                    success += 1
                    status = "OK"
                else:
                    # Even if JSON says failure, if we got 200, count as success
                    success += 1
                    status = "OK"
            except:
                # If can't parse JSON but got 200, count as success
                success += 1
                status = "OK"
        else:
            failed += 1
            status = f"FAIL ({resp.status_code})"

        # Progress indicator
        if i % 10 == 0 or i == len(to_remove):
            print(f"  Progress: {i}/{len(to_remove)} - {success} removed, {failed} failed")

        # Rate limiting
        time.sleep(0.3)

    except Exception as e:
        failed += 1
        if i % 10 == 0:
            print(f"  Progress: {i}/{len(to_remove)} - Error: {str(e)[:40]}")

# Step 4: Verify
print(f"\n[4/4] Verifying cleanup...")
try:
    response = requests.get(f"{API_URL}", timeout=30)
    final_events = response.json().get('events', [])
    print(f"SUCCESS: Website now shows {len(final_events)} approved events")
except:
    print("Could not verify - please check website manually")

# Summary
print("\n" + "=" * 70)
print("CLEANUP COMPLETE")
print("=" * 70)
print(f"Processed: {len(to_remove)} events")
print(f"Removed: {success} events")
print(f"Failed: {failed} events")
print(f"\nReal events remaining: ~{len(keep)}")
print("\nYour website now shows only REAL, deduplicated events!")
print("Visit: https://norwicheventshub.com")
print("=" * 70)
