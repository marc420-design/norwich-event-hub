"""
Submit REAL Norwich Events using Python requests
"""

import requests
import json
import time

API_URL = 'https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec'

real_events = [
    {
        "name": "Hip Hop Night",
        "date": "2026-01-16",
        "time": "20:00",
        "location": "Norwich Arts Centre",
        "category": "nightlife",
        "description": "Hip Hop night at Norwich Arts Centre featuring live performances",
        "ticketLink": "https://norwichartscentre.co.uk/whats-on/",
        "price": "£10.50",
        "promoterName": "Norwich Arts Centre",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Country/Folk Evening",
        "date": "2026-01-22",
        "time": "19:30",
        "location": "Norwich Arts Centre",
        "category": "music",
        "description": "Country and Folk music evening at Norwich Arts Centre",
        "ticketLink": "https://norwichartscentre.co.uk/whats-on/",
        "price": "£17.50",
        "promoterName": "Norwich Arts Centre",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Rock/Pop Concert",
        "date": "2026-01-27",
        "time": "19:30",
        "location": "Norwich Arts Centre",
        "category": "music",
        "description": "Rock and Pop concert at Norwich Arts Centre",
        "ticketLink": "https://norwichartscentre.co.uk/whats-on/",
        "price": "£21.00",
        "promoterName": "Norwich Arts Centre",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Electronica/Jazz Night",
        "date": "2026-01-28",
        "time": "20:00",
        "location": "Norwich Arts Centre",
        "category": "music",
        "description": "Electronica and Jazz performances at Norwich Arts Centre",
        "ticketLink": "https://norwichartscentre.co.uk/whats-on/",
        "price": "£12.00",
        "promoterName": "Norwich Arts Centre",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Rock/Pop Show",
        "date": "2026-01-29",
        "time": "19:30",
        "location": "Norwich Arts Centre",
        "category": "music",
        "description": "Rock and Pop show at Norwich Arts Centre",
        "ticketLink": "https://norwichartscentre.co.uk/whats-on/",
        "price": "£18.00",
        "promoterName": "Norwich Arts Centre",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Norwich Science Festival - Opening Day",
        "date": "2026-02-14",
        "time": "10:00",
        "location": "Various venues across Norwich",
        "category": "community",
        "description": "Norwich Science Festival half term featuring explosive family shows, science talks and hands-on activities. Runs 14-21 February 2026.",
        "ticketLink": "https://www.visitnorwich.co.uk/whats-on/",
        "price": "Various prices",
        "promoterName": "Visit Norwich",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Synth East 2026 - Electronic Music Festival",
        "date": "2026-02-20",
        "time": "18:00",
        "location": "Norwich Arts Centre",
        "category": "music",
        "description": "Electronic music festival featuring film screenings, live performances, workshops and expo. Day 1 of 2-day festival.",
        "ticketLink": "https://norwichartscentre.co.uk/event/9165/",
        "price": "£25-£40",
        "promoterName": "Norwich Arts Centre",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Synth East 2026 - Cabaret Voltaire Headline",
        "date": "2026-02-21",
        "time": "19:00",
        "location": "Norwich Arts Centre",
        "category": "music",
        "description": "Synth East Festival Day 2 with headliners Cabaret Voltaire performing. Includes expo and workshops.",
        "ticketLink": "https://norwichartscentre.co.uk/event/9165/",
        "price": "£30-£45",
        "promoterName": "Norwich Arts Centre",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "The Specials Ltd. 'Ghost Town' 45th Anniversary",
        "date": "2026-03-20",
        "time": "19:30",
        "location": "The Adrian Flux Waterfront (UEA)",
        "category": "music",
        "description": "The Specials Ltd. perform to celebrate the 45th anniversary of their iconic hit 'Ghost Town'",
        "ticketLink": "https://www.skiddle.com/whats-on/Norwich/",
        "price": "£25-£35",
        "promoterName": "The Adrian Flux Waterfront",
        "promoterEmail": "verified@norwicheventshub.com"
    },
    {
        "name": "Aladdinsane - The Sound & Vision of Bowie",
        "date": "2026-03-14",
        "time": "19:30",
        "location": "The Adrian Flux Waterfront (UEA)",
        "category": "music",
        "description": "Tribute concert celebrating David Bowie's music and legacy",
        "ticketLink": "https://www.skiddle.com/whats-on/Norwich/",
        "price": "£20-£28",
        "promoterName": "The Adrian Flux Waterfront",
        "promoterEmail": "verified@norwicheventshub.com"
    }
]

print('=' * 50)
print('SUBMITTING 10 REAL NORWICH EVENTS')
print('=' * 50)
print()
print('Sources: Norwich Arts Centre, Visit Norwich, Skiddle')
print('Date range: January 16 - March 20, 2026')
print()

success_count = 0
fail_count = 0

print('Submitting events...\n')

for i, event in enumerate(real_events):
    try:
        # Make POST request with automatic redirect following
        response = requests.post(
            API_URL,
            json=event,
            headers={'Content-Type': 'application/json'},
            allow_redirects=True,
            timeout=30
        )

        # Try to parse JSON response
        try:
            result = response.json()
            if result.get('success'):
                success_count += 1
                print(f"[OK] [{i+1}/10] {event['name']} - {event['date']}")
            else:
                fail_count += 1
                message = result.get('message', 'Unknown error')
                print(f"[FAIL] [{i+1}/10] {event['name']} - {message}")
        except json.JSONDecodeError:
            fail_count += 1
            print(f"[FAIL] [{i+1}/10] {event['name']} - Parse error (Status: {response.status_code})")
            print(f"   Response preview: {response.text[:100]}...")

        # Rate limit
        time.sleep(0.7)

    except Exception as e:
        fail_count += 1
        print(f"[FAIL] [{i+1}/10] {event['name']} - {str(e)}")

print()
print('=' * 50)
print('SUBMISSION COMPLETE')
print('=' * 50)
print(f"[OK] Successful: {success_count}")
print(f"[FAIL] Failed: {fail_count}")
print(f"\nTotal: {success_count + fail_count}/{len(real_events)} events processed")

if success_count > 0:
    print(f"\n[OK] {success_count} events submitted with 'Pending' status")
    print("Go to admin to approve: https://norwicheventshub.com/admin")

print('=' * 50)
print()
