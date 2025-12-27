#!/usr/bin/env python3
"""
Convert sample-events.json to CSV for Google Sheets import
"""

import json
import csv
import os

def convert_events_to_csv():
    # Read JSON file
    json_path = 'data/sample-events.json'
    csv_path = 'events-import.csv'

    print(f"Reading {json_path}...")

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    events = data.get('events', [])

    if not events:
        print("No events found in JSON file")
        return

    print(f"Found {len(events)} events")

    # Prepare CSV with specific column order for Google Sheets
    fieldnames = [
        'id',
        'name',
        'date',
        'time',
        'location',
        'category',
        'description',
        'ticketLink',
        'image',
        'status'
    ]

    # Ensure all events have all fields
    for event in events:
        for field in fieldnames:
            if field not in event:
                event[field] = ''

    # Write CSV
    print(f"Writing to {csv_path}...")

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(events)

    print(f"Successfully created {csv_path}")
    print(f"Total events: {len(events)}")
    print(f"\nNext steps:")
    print(f"1. Go to Google Sheets: https://sheets.google.com")
    print(f"2. Create a new blank sheet")
    print(f"3. File -> Import -> Upload -> {csv_path}")
    print(f"4. Make sure to import to 'Replace current sheet'")
    print(f"5. Rename Sheet1 to 'Sheet1' if not already")
    print(f"6. Follow GOOGLE_SHEETS_SETUP.md for Apps Script setup")

if __name__ == '__main__':
    try:
        convert_events_to_csv()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print(f"Make sure you're running this from the project root directory")
    except Exception as e:
        print(f"Error: {e}")
