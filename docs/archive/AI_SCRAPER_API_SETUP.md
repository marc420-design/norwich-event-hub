# 🤖 AI Event Scraper - API Integration Guide

## ✅ What We've Created

A simplified AI event aggregator that posts events directly to your API endpoint. This is **much simpler** than the original version and works perfectly with your system!

---

## 📁 Files Created

1. **`automation/ai-event-aggregator-api.py`** - Main scraper (API version)
2. **`automation/config.env.example`** - Configuration template

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd "c:\Users\marc\Desktop\new company\automation"

# Install required Python packages
pip install requests python-dotenv
```

### Step 2: Create Configuration File

```bash
# Copy the example config
copy config.env.example .env

# Edit .env with your API keys (optional for now)
notepad .env
```

**Minimal .env file:**
```env
NORWICH_API_URL=https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec
```

The API URL is already set as default, so you can even skip the .env file for testing!

### Step 3: Test It!

```bash
python ai-event-aggregator-api.py
```

**You should see:**
```
🚀 Norwich Event Hub - AI Aggregator (API Version)
============================================================
🌐 API: https://script.google.com/macros/s/AKfycbzZB...
✅ API connection successful
📤 Submitting 1 events...
✅ Submitted: AI Test Event - Live Music Night (ID: NEH-...)
============================================================
📊 SUMMARY
✅ Successfully submitted: 1
❌ Failed: 0
📝 Total processed: 1
============================================================
🎉 Events submitted! Check your Google Sheet
```

---

## 🔑 How It Works

### Simple Flow

```
1. Scraper finds events (web scraping, APIs, etc.)
   ↓
2. Formats event data as JSON
   ↓
3. POST to your API endpoint
   ↓
4. Google Apps Script receives event
   ↓
5. Saves to Google Sheets
   ↓
6. Automated sync updates website (midnight)
   ↓
7. Event appears on norwicheventshub.com ✅
```

### Code Example

```python
from ai_event_aggregator_api import NorwichEventAPI

# Initialize API client
api = NorwichEventAPI("YOUR_API_URL")

# Create event
event = {
    "name": "Norwich Jazz Night",
    "date": "2026-01-20",
    "time": "20:00",
    "location": "The Birdcage, Norwich",
    "category": "Gig",
    "description": "Amazing jazz from local musicians",
    "ticketLink": "https://example.com/tickets",
    "price": "£12",
    "flyer": "https://example.com/flyer.jpg",
    "vibe": "Chill",
    "crowd": "25-45",
    "bestFor": "Jazz lovers",
    "status": "approved"  # or "pending" for review
}

# Submit to API
result = api.submit_event(event)
print(result)
# {"success": true, "eventId": "NEH-1768291748258-227"}
```

---

## 🎯 Integration Options

### Option 1: Manual Run (Simplest)

Run the scraper whenever you want:
```bash
python ai-event-aggregator-api.py
```

### Option 2: Scheduled Task (Windows)

Run daily at 9am:

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Norwich Event Scraper"
4. Trigger: Daily at 9:00 AM
5. Action: Start a program
   - Program: `python`
   - Arguments: `c:\Users\marc\Desktop\new company\automation\ai-event-aggregator-api.py`
6. Finish

### Option 3: GitHub Action (Cloud)

Add to `.github/workflows/scrape-events.yml`:

```yaml
name: Scrape Norwich Events

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9am UTC
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install requests python-dotenv
      
      - name: Run scraper
        env:
          NORWICH_API_URL: ${{ secrets.NORWICH_API_URL }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          cd automation
          python ai-event-aggregator-api.py
```

---

## 🔌 Connecting Your Existing Scraper

If you already have a scraper that finds events, here's how to connect it:

### Method 1: Import the API Client

```python
from ai_event_aggregator_api import NorwichEventAPI

# Your existing scraper code
events = your_scraper.scrape_all_sources()

# Initialize API
api = NorwichEventAPI("YOUR_API_URL")

# Submit each event
for event in events:
    result = api.submit_event(event)
    if result.get('success'):
        print(f"✅ Submitted: {event['name']}")
```

### Method 2: Direct API Calls

```python
import requests

API_URL = "https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec"

def submit_event(event_data):
    response = requests.post(
        API_URL,
        json=event_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    return response.json()

# Use it
result = submit_event({
    "name": "Event Name",
    "date": "2026-01-20",
    "time": "19:00",
    "location": "Venue, Norwich",
    "category": "Nightlife",
    "description": "Description",
    "ticketLink": "https://...",
    "price": "£10",
    "flyer": "https://image.jpg",
    "promoterName": "AI Scraper",
    "promoterEmail": "ai@norwicheventshub.com",
    "status": "approved"
})
```

---

## 📋 Event Data Format

### Required Fields

```python
{
    "name": str,        # Event name
    "date": str,        # YYYY-MM-DD format
    "time": str,        # HH:MM format
    "location": str,    # Venue name, Norwich
    "category": str,    # See categories below
    "description": str, # Event description
}
```

### Optional Fields

```python
{
    "ticketLink": str,     # URL to buy tickets
    "price": str,          # "£10" or "Free"
    "flyer": str,          # Image URL
    "vibe": str,           # "Underground", "Commercial", "Chill", "Heavy"
    "crowd": str,          # "18-30", "All ages", etc.
    "bestFor": str,        # "Party lovers", "Families", etc.
    "promoterName": str,   # Your scraper name
    "promoterEmail": str,  # Contact email
    "status": str,         # "approved" or "pending"
}
```

### Valid Categories

- `Nightlife`
- `Gig`
- `Theatre`
- `Culture`
- `Community`
- `Market`
- `Sport`
- `Free Event`

---

## 🎨 Event Vibe Options

- **Underground** - Alternative, edgy, niche audience
- **Commercial** - Mainstream, broad appeal
- **Chill** - Relaxed, laid-back atmosphere
- **Heavy** - Intense, high-energy, loud

---

## 🔍 Where to Scrape Events

### Local Norwich Sources

1. **Venue Websites**
   - The Halls Norwich
   - Epic Studios
   - Norwich Arts Centre
   - Theatre Royal
   - Norwich Playhouse
   - The Birdcage
   - Gonzo's Tea Room
   - The Waterfront

2. **Event Platforms**
   - Skiddle.com (Norwich filter)
   - Eventbrite (Norwich)
   - Ents24
   - Facebook Events

3. **Social Media**
   - Instagram hashtags (#NorwichEvents)
   - Facebook event pages
   - Twitter @norwichevents

4. **Local Media**
   - Eastern Daily Press events
   - Norwich Evening News
   - BBC Norfolk

---

## 🛠️ Customizing the Scraper

### Add Your Own Event Sources

Edit `ai-event-aggregator-api.py`:

```python
# Add to sources list
sources = [
    {
        "name": "Your Venue",
        "url": "https://venue-website.com/events",
        "category": "Nightlife",
        "scraper": your_custom_scraper_function
    },
    # ... more sources
]
```

### Implement Web Scraping

```python
from bs4 import BeautifulSoup
import requests

def scrape_venue(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    events = []
    for event_div in soup.find_all('div', class_='event-card'):
        event = {
            "name": event_div.find('h3').text,
            "date": event_div.find('span', class_='date').text,
            "location": event_div.find('span', class_='venue').text,
            # ... extract more fields
        }
        events.append(event)
    
    return events
```

---

## 📊 Monitoring & Logs

### Check Scraper Logs

The scraper logs everything:
```
2026-01-13 10:30:15 - INFO - 🚀 Norwich Event Hub - AI Aggregator
2026-01-13 10:30:16 - INFO - ✅ API connection successful
2026-01-13 10:30:17 - INFO - ✅ Submitted: Jazz Night (ID: NEH-123)
2026-01-13 10:30:18 - INFO - ✅ Submitted: Comedy Show (ID: NEH-124)
```

### Check Google Sheet

Events appear immediately in your Google Sheet after submission.

### Check Website

Events appear on website after midnight sync (or manual sync).

---

## 🔧 Troubleshooting

### API Connection Failed

**Solution:**
```bash
# Test API manually
curl -X POST "YOUR_API_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","date":"2026-01-20","time":"19:00","location":"Test","category":"Nightlife"}'
```

### Event Not Appearing on Website

**Check:**
1. Is event in Google Sheet? (Should be immediate)
2. Is status "approved"? (Only approved events sync)
3. Did nightly sync run? (Check GitHub Actions)
4. Hard refresh website (Ctrl+Shift+R)

### Duplicate Events

**Add deduplication:**
```python
seen_events = set()

def is_duplicate(event):
    key = f"{event['name']}_{event['date']}"
    if key in seen_events:
        return True
    seen_events.add(key)
    return False
```

---

## 🎯 Complete Workflow

```
┌─────────────────────────────────────────┐
│  1. AI SCRAPER RUNS                     │
│     (Manual, scheduled, or automated)   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. FINDS EVENTS                        │
│     • Web scraping                      │
│     • API calls                         │
│     • Social media                      │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. FORMATS & VALIDATES                 │
│     • Cleans data                       │
│     • Fills missing fields              │
│     • Validates format                  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  4. SUBMITS TO API (POST)               │
│     ✅ No CORS issues                   │
│     ✅ Same as form submissions         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  5. GOOGLE SHEETS                       │
│     • Event saved immediately           │
│     • Status: "approved" or "pending"   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  6. AUTOMATED SYNC (Midnight UTC)       │
│     • GitHub Action runs                │
│     • Fetches approved events           │
│     • Updates sample-events.json        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  7. WEBSITE UPDATES                     │
│     • Cloudflare auto-deploys           │
│     • New events appear (1-2 min)       │
│     ✅ norwicheventshub.com             │
└─────────────────────────────────────────┘
```

---

## 🎉 You're Ready!

Your AI scraper is now connected to your API!

**What to do next:**
1. Test the basic script: `python ai-event-aggregator-api.py`
2. Check Google Sheet for test event
3. Customize with your event sources
4. Set up scheduled runs (optional)
5. Let it run automatically!

---

## 📚 Related Documentation

- `README_START_HERE.md` - Main setup guide
- `API_SUCCESS_SUMMARY.md` - API details
- `AUTOMATED_SYNC_SETUP.md` - Auto-sync guide
- `COMPLETE_WORKFLOW_GUIDE.md` - Full workflow

---

**Happy scraping! 🤖🎉**
