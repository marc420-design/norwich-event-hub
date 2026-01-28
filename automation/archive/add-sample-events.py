"""
Quick script to add sample Norwich events to Google Sheets
Run this to populate your sheet with real events
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

try:
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
except ImportError:
    print("Dependencies already installed from requirements.txt")
    exit(1)

# Configuration
SHEET_ID = os.environ.get('GOOGLE_SHEET_ID')
CREDS_PATH = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')

# Sample real Norwich events for 2026
SAMPLE_EVENTS = [
    {
        'name': 'Norwich City FC vs Sheffield United',
        'date': '2026-01-10',
        'time': '15:00',
        'location': 'Carrow Road',
        'category': 'sports',
        'description': 'The Canaries host Sheffield United in this exciting Championship clash. On The Ball City!',
        'ticketLink': 'https://www.canaries.co.uk/',
        'price': '£30-£45'
    },
    {
        'name': 'Live Jazz Night at The Birdcage',
        'date': '2026-01-11',
        'time': '20:00',
        'location': 'The Birdcage',
        'category': 'gigs',
        'description': 'Enjoy an evening of live jazz with local and touring musicians. Intimate venue, great atmosphere.',
        'ticketLink': '',
        'price': '£8'
    },
    {
        'name': 'Norwich Market - Saturday Trading',
        'date': '2026-01-11',
        'time': '08:00',
        'location': 'Norwich Market',
        'category': 'markets',
        'description': 'One of the largest and oldest markets in the UK. Fresh produce, crafts, street food and more.',
        'ticketLink': '',
        'price': 'Free'
    },
    {
        'name': 'Cinderella Pantomime',
        'date': '2026-01-12',
        'time': '14:30',
        'location': 'Theatre Royal Norwich',
        'category': 'theatre',
        'description': 'Classic family pantomime featuring local stars. Oh yes it is!',
        'ticketLink': 'https://www.theatreroyalnorwich.co.uk/',
        'price': '£18-£35'
    },
    {
        'name': 'Sunday Yoga in the Park',
        'date': '2026-01-12',
        'time': '10:00',
        'location': 'Eaton Park',
        'category': 'free',
        'description': 'Free community yoga session for all levels. Bring your own mat. Weather permitting.',
        'ticketLink': '',
        'price': 'Free'
    },
    {
        'name': '90s Throwback Night',
        'date': '2026-01-17',
        'time': '21:00',
        'location': 'OPEN Norwich',
        'category': 'nightlife',
        'description': 'Relive the 90s with classic hits, retro vibes, and throwback drinks specials.',
        'ticketLink': '',
        'price': '£5'
    },
    {
        'name': 'Norwich Arts Centre: Indie Showcase',
        'date': '2026-01-18',
        'time': '19:30',
        'location': 'Norwich Arts Centre',
        'category': 'gigs',
        'description': 'Three up-and-coming indie bands performing live. Support local music!',
        'ticketLink': 'https://www.norwichartscentre.co.uk/',
        'price': '£12'
    },
    {
        'name': 'Winter Food & Drink Festival',
        'date': '2026-01-24',
        'time': '10:00',
        'location': 'The Forum Norwich',
        'category': 'culture',
        'description': 'Celebrate local food and drink producers. Tastings, workshops, and market stalls.',
        'ticketLink': '',
        'price': '£3 entry'
    },
    {
        'name': 'Saturday Night Comedy Club',
        'date': '2026-01-25',
        'time': '20:00',
        'location': 'Gonzo\'s Tea Room',
        'category': 'culture',
        'description': 'Stand-up comedy featuring touring comics and local talent. 18+ event.',
        'ticketLink': '',
        'price': '£10'
    },
    {
        'name': 'Community Litter Pick',
        'date': '2026-01-26',
        'time': '10:00',
        'location': 'Chapelfield Gardens',
        'category': 'community',
        'description': 'Help keep Norwich beautiful! Equipment provided. All ages welcome.',
        'ticketLink': '',
        'price': 'Free'
    }
]

def add_events():
    """Add sample events to Google Sheets"""
    print("[*] Adding sample Norwich events to Google Sheets...")

    try:
        # Authorize
        scope = ['https://spreadsheets.google.com/feeds',
                 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDS_PATH, scope)
        client = gspread.authorize(creds)

        # Open sheet
        spreadsheet = client.open_by_key(SHEET_ID)
        worksheet = spreadsheet.worksheet('Event Submissions')

        print(f"[OK] Connected to Google Sheets")

        # Add each event
        for i, event in enumerate(SAMPLE_EVENTS, 1):
            row = [
                datetime.now().isoformat(),  # Timestamp
                event['name'],
                event['date'],
                event['time'],
                event['location'],
                event['category'],
                event['description'],
                event['ticketLink'],
                'Norwich Event Hub',  # Promoter Name
                'events@norwicheventshub.com',  # Promoter Email
                '',  # Promoter Phone
                'Approved',  # Status - automatically approved
                f'SAMPLE-{datetime.now().strftime("%Y%m%d")}-{i:03d}'  # Event ID
            ]

            worksheet.append_row(row)
            print(f"  [+] Added: {event['name']}")

        print(f"\n[SUCCESS] Added {len(SAMPLE_EVENTS)} events!")
        print(f"\nView your events at: https://norwicheventshub.com")
        print(f"View Google Sheet: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit")

    except Exception as e:
        print(f"[ERROR] {e}")
        print("\nMake sure:")
        print("1. Google credentials file exists at: automation/google-credentials.json")
        print("2. The service account has been shared with your Google Sheet")
        print("3. The 'Event Submissions' sheet exists")

if __name__ == '__main__':
    add_events()
