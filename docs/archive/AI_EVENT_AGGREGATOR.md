# AI Event Aggregator - System Design

Automated event discovery system that runs every Monday to find and add Norwich events.

## 🎯 Overview

**Goal**: Automatically discover, parse, and add Norwich events from multiple sources weekly.

**How it works**:
1. **Monday 6 AM**: System triggers
2. **Scrape**: Fetch events from multiple sources
3. **AI Processing**: Clean, categorize, and deduplicate
4. **Validation**: Check quality and relevance
5. **Add to Sheet**: Approved events added to Google Sheets
6. **Notify**: Summary email sent

---

## 📍 Data Sources

### 1. Facebook Events
**API**: Facebook Graph API
**Coverage**: Public events in Norwich
**Method**: API calls with location filter
**Update frequency**: Weekly
**Estimated events/week**: 50-100

### 2. Ticket Platforms

#### Skiddle
- **URL**: https://www.skiddle.com/whats-on/Norwich/
- **Method**: Web scraping + API (if available)
- **Coverage**: Nightlife, gigs, clubs
- **Estimated**: 20-40 events/week

#### Eventbrite
- **API**: Eventbrite API
- **Coverage**: All event types
- **Method**: API with location filter
- **Estimated**: 30-60 events/week

#### Dice
- **URL**: https://dice.fm/city/norwich
- **Method**: Web scraping
- **Coverage**: Live music, gigs
- **Estimated**: 10-20 events/week

#### See Tickets
- **URL**: seetickets.com (Norwich)
- **Method**: Web scraping
- **Coverage**: Various events
- **Estimated**: 10-20 events/week

### 3. Council & Official Sites

#### Norwich City Council
- **URL**: https://www.norwich.gov.uk/events
- **Method**: Web scraping
- **Coverage**: Community events, markets, official events
- **Estimated**: 5-15 events/week

#### Visit Norwich
- **URL**: https://www.visitnorwich.co.uk/whats-on/
- **Method**: Web scraping
- **Coverage**: Tourism events, attractions
- **Estimated**: 10-20 events/week

### 4. Venue Websites

Direct scraping from major venues:
- The Forum Norwich
- Norwich Arts Centre
- Waterfront Norwich
- Theatre Royal Norwich
- Norwich Playhouse
- Cinema City
- UEA venues

### 5. Other Sources
- Meetup.com (Norwich groups)
- Norwich University events
- Local Facebook groups (public posts)
- Norwich blogs and event aggregators

**Total estimated**: 150-300 events/week

---

## 🤖 AI Processing Pipeline

### Step 1: Data Collection
```
Sources → Raw HTML/JSON → Extract event data
```

### Step 2: AI Parsing (Claude/GPT)
```python
prompt = """
Extract event information from this text:

{raw_event_data}

Return JSON with:
- name: Event name
- date: YYYY-MM-DD format
- time: HH:MM format
- location: Venue name
- address: Full address
- category: One of [nightlife, gigs, theatre, sports, markets, community, culture, free]
- description: 1-2 sentence summary
- ticketLink: URL if available
- price: Free or price range
"""
```

### Step 3: Data Validation
- Check date is in future
- Verify location is in Norwich/Norfolk
- Ensure required fields present
- Validate URLs
- Check for duplicates

### Step 4: Quality Scoring
AI assigns quality score (0-100):
- Complete information: +30
- Official source: +20
- Ticket link present: +20
- Good description: +15
- High-quality image: +15

Only events with score > 50 are auto-approved.

### Step 5: Categorization
AI automatically categorizes using:
- Keyword matching
- Venue type
- Description analysis
- Historical patterns

### Step 6: Deduplication
- Check against existing events
- Match on: name + date + location
- AI identifies similar events
- Merge duplicate information

---

## 🛠️ Technical Architecture

### Option 1: Python + Cloudflare Workers (Recommended)

```
┌─────────────────────────────────────┐
│   Cloudflare Cron Trigger           │
│   (Every Monday 6 AM)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Cloudflare Worker                 │
│   - Triggers Python script          │
│   - Manages secrets/API keys        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Python Event Aggregator           │
│   (Runs on serverless platform)     │
│                                      │
│   ┌─────────────────────────────┐  │
│   │  Event Scrapers             │  │
│   │  - Facebook API             │  │
│   │  - Eventbrite API           │  │
│   │  - Web scrapers (Skiddle)   │  │
│   │  - Council sites            │  │
│   └─────────────────────────────┘  │
│                                      │
│   ┌─────────────────────────────┐  │
│   │  AI Processor (Claude API)  │  │
│   │  - Parse HTML → Events      │  │
│   │  - Clean data               │  │
│   │  - Categorize               │  │
│   │  - Validate                 │  │
│   └─────────────────────────────┘  │
│                                      │
│   ┌─────────────────────────────┐  │
│   │  Deduplication Engine       │  │
│   │  - Check existing events    │  │
│   │  - Fuzzy matching           │  │
│   └─────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Google Sheets API                 │
│   - Add approved events             │
│   - Update existing events          │
│   - Log scraping results            │
└─────────────────────────────────────┘
```

### Option 2: Make.com + AI Integration

```
┌─────────────────────────────────────┐
│   Make.com Schedule                 │
│   (Every Monday 6 AM)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   HTTP Requests (Parallel)          │
│   - Eventbrite API                  │
│   - Facebook Graph API              │
│   - Web scrapers via proxy          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Claude AI Module                  │
│   - Parse each response             │
│   - Extract event details           │
│   - Categorize events               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Data Transformer                  │
│   - Validate required fields        │
│   - Check for duplicates            │
│   - Format for Google Sheets        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Google Sheets                     │
│   - Add new events                  │
│   - Status: "AI_Pending_Review"     │
└─────────────────────────────────────┘
```

---

## 💻 Implementation

### Core Python Script Structure

**File**: `automation/ai-event-aggregator.py`

```python
import os
import json
from datetime import datetime, timedelta
import anthropic  # Claude API
import requests
from bs4 import BeautifulSoup
import gspread
from oauth2client.service_account import ServiceAccountCredentials

class EventAggregator:
    def __init__(self):
        self.claude = anthropic.Anthropic(api_key=os.environ['CLAUDE_API_KEY'])
        self.events = []

    def scrape_all_sources(self):
        """Scrape events from all sources"""
        self.scrape_facebook()
        self.scrape_eventbrite()
        self.scrape_skiddle()
        self.scrape_council()
        # ... more sources

    def scrape_facebook(self):
        """Use Facebook Graph API"""
        # Implementation

    def scrape_eventbrite(self):
        """Use Eventbrite API"""
        # Implementation

    def scrape_skiddle(self):
        """Web scraping with AI parsing"""
        # Implementation

    def process_with_ai(self, raw_data):
        """Use Claude to parse and structure data"""
        # Implementation

    def deduplicate(self):
        """Remove duplicate events"""
        # Implementation

    def validate_events(self):
        """Check quality and relevance"""
        # Implementation

    def upload_to_sheets(self):
        """Add events to Google Sheets"""
        # Implementation

    def run(self):
        """Main execution"""
        self.scrape_all_sources()
        self.process_with_ai()
        self.deduplicate()
        self.validate_events()
        self.upload_to_sheets()
```

---

## 🔑 API Keys Required

1. **Claude API** (Anthropic)
   - For AI parsing and categorization
   - Cost: ~$0.01-0.10 per week

2. **Facebook Graph API**
   - For Facebook events
   - Free tier available

3. **Eventbrite API**
   - For Eventbrite events
   - Free tier available

4. **Google Sheets API**
   - For adding events
   - Free

5. **Proxies** (optional)
   - For web scraping
   - ~$5-10/month

---

## 📊 Data Flow Example

### Input (Raw HTML from Skiddle):
```html
<div class="event">
  <h3>Live Music Night at Waterfront</h3>
  <p>Friday 15th December, 8:00 PM</p>
  <p>Waterfront Norwich, King Street</p>
  <p>£12.50</p>
</div>
```

### AI Processing (Claude):
```json
{
  "name": "Live Music Night at Waterfront",
  "date": "2025-12-15",
  "time": "20:00",
  "location": "Waterfront Norwich",
  "address": "King Street, Norwich",
  "category": "gigs",
  "description": "Live music event featuring local bands at Waterfront Norwich",
  "ticketLink": "https://skiddle.com/...",
  "price": "£12.50",
  "source": "Skiddle",
  "confidence": 95
}
```

### Output (Google Sheets Row):
```
| Timestamp | Event Name | Date | Time | Location | Category | ... | Status |
| 2025-12-05 | Live Music Night | 2025-12-15 | 20:00 | Waterfront Norwich | gigs | ... | AI_Pending |
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# API Keys
CLAUDE_API_KEY=sk-ant-...
FACEBOOK_ACCESS_TOKEN=...
EVENTBRITE_API_KEY=...
GOOGLE_SHEETS_CREDENTIALS=...

# Settings
SCRAPE_DAYS_AHEAD=90  # Look 90 days into future
MIN_QUALITY_SCORE=50   # Minimum score for auto-approval
AUTO_APPROVE_THRESHOLD=80  # Auto-approve if score > 80
NORWICH_RADIUS_KM=15   # Include events within 15km
```

---

## 🚀 Deployment Options

### Option A: Cloudflare Workers + Python (Recommended)
- **Cost**: ~$5/month
- **Pros**: Integrated, fast, reliable
- **Cons**: Requires Cloudflare Pages Pro

### Option B: Make.com + Custom API
- **Cost**: ~$10/month
- **Pros**: Visual workflow, easy to modify
- **Cons**: Limited execution time

### Option C: AWS Lambda
- **Cost**: ~$2/month (free tier)
- **Pros**: Powerful, scalable
- **Cons**: More complex setup

### Option D: Zapier + Code by Zapier
- **Cost**: ~$20/month
- **Pros**: Easy setup
- **Cons**: Expensive, limited

---

## 📈 Expected Results

### Per Week:
- **Events discovered**: 150-300
- **After AI filtering**: 80-150
- **After deduplication**: 50-100
- **Auto-approved (high quality)**: 30-60
- **Pending review**: 20-40

### Quality Breakdown:
- **Excellent** (score 80-100): 30%
- **Good** (score 60-79): 50%
- **Fair** (score 50-59): 15%
- **Rejected** (score < 50): 5%

---

## 🔄 Weekly Workflow

**Monday 6:00 AM**:
1. ✅ System starts scraping
2. ⏱️ Takes 10-15 minutes
3. 🤖 AI processes all events
4. ✅ High-quality events auto-approved
5. 📧 Email summary sent
6. ⏸️ Lower-quality events await manual review

**Monday 9:00 AM**:
- You receive summary email
- Review pending events
- Approve/reject as needed

**Monday 10:00 AM**:
- Approved events go live on website
- Social media posts triggered (if automated)

---

## 🎯 Next Steps

1. Choose deployment option
2. Set up API keys
3. Deploy Python aggregator script
4. Test with single source first
5. Expand to all sources
6. Schedule weekly automation
7. Monitor and optimize

Would you like me to implement this system?
