"""
Norwich Event Hub - AI Event Aggregator
Automatically discovers and adds Norwich events from multiple sources

Usage:
    python ai-event-aggregator.py

Environment variables required:
    GEMINI_API_KEY - Google Gemini API key (or OPENAI_API_KEY for OpenAI)
    FACEBOOK_ACCESS_TOKEN - Facebook Graph API token (optional)
    EVENTBRITE_API_KEY - Eventbrite API key (optional)
    GOOGLE_SHEETS_CREDENTIALS - Path to Google service account JSON
    GOOGLE_SHEET_ID - ID of your Norwich Event Hub spreadsheet
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import re

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load .env file from automation directory
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed, will use system environment variables
    pass

# External dependencies (install via: pip install -r requirements.txt)
try:
    import google.generativeai as genai
    import requests
    from bs4 import BeautifulSoup
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
    from dateutil import parser as date_parser
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install google-generativeai requests beautifulsoup4 gspread oauth2client python-dateutil")
    exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EventAggregator:
    """Main event aggregation system"""

    def __init__(self):
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY')
        self.openai_api_key = os.environ.get('OPENAI_API_KEY')
        self.facebook_token = os.environ.get('FACEBOOK_ACCESS_TOKEN')
        self.eventbrite_key = os.environ.get('EVENTBRITE_API_KEY')
        self.skiddle_key = os.environ.get('SKIDDLE_API_KEY')  # Optional Skiddle API key
        self.sheet_id = os.environ.get('GOOGLE_SHEET_ID')
        self.sheet_creds = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')

        # Use OpenAI by default (working), fallback to Gemini
        if self.openai_api_key:
            self.ai_provider = 'OpenAI'
            logger.info("Using OpenAI (primary)")
        elif self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            # Try different model name formats for Gemini 1.5
            try:
                # Try without models/ prefix first
                self.model = genai.GenerativeModel('gemini-1.5-flash-001')
                logger.info("Using Google Gemini AI (gemini-1.5-flash-001)")
            except:
                try:
                    # Try 2.0 flash
                    self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
                    logger.info("Using Google Gemini AI (gemini-2.0-flash-exp)")
                except:
                    # Fallback to older stable version
                    self.model = genai.GenerativeModel('gemini-1.5-pro')
                    logger.info("Using Google Gemini AI (gemini-1.5-pro fallback)")
            self.ai_provider = 'Gemini'
        else:
            raise ValueError("Either GEMINI_API_KEY or OPENAI_API_KEY environment variable required")

        self.events = []
        self.categories = ['nightlife', 'gigs', 'theatre', 'sports', 'markets', 'community', 'culture', 'free']

        # Configuration
        self.days_ahead = int(os.environ.get('SCRAPE_DAYS_AHEAD', 90))
        self.min_quality_score = int(os.environ.get('MIN_QUALITY_SCORE', 50))
        self.auto_approve_threshold = int(os.environ.get('AUTO_APPROVE_THRESHOLD', 80))
        self.norwich_radius_km = int(os.environ.get('NORWICH_RADIUS_KM', 15))

    def run(self):
        """Main execution flow"""
        logger.info("🚀 Starting AI Event Aggregator")

        try:
            # Step 1: Scrape all sources
            logger.info("📡 Scraping event sources...")
            self.scrape_all_sources()
            logger.info(f"✅ Found {len(self.events)} raw events")

            # Step 2: Process with AI
            logger.info("🤖 Processing events with AI...")
            self.process_events_with_ai()

            # Step 3: Validate
            logger.info("✔️ Validating events...")
            self.validate_events()

            # Step 4: Deduplicate
            logger.info("🔍 Removing duplicates...")
            self.deduplicate_events()
            logger.info(f"✅ {len(self.events)} unique events after deduplication")

            # Step 5: Score quality
            logger.info("⭐ Scoring event quality...")
            self.score_events()

            # Step 6: Upload to Google Sheets
            logger.info("📤 Uploading to Google Sheets...")
            self.upload_to_sheets()

            # Step 7: Summary
            self.print_summary()

            logger.info("✅ Event aggregation complete!")

        except Exception as e:
            logger.error(f"❌ Error during aggregation: {e}")
            raise

    def scrape_all_sources(self):
        """Scrape events from all configured sources"""
        scrapers = [
            ('Eventbrite', self.scrape_eventbrite),
            ('Skiddle', self.scrape_skiddle),
            ('Facebook', self.scrape_facebook),
            ('Council', self.scrape_norwich_council),
            ('Visit Norwich', self.scrape_visit_norwich),
            ('The Halls Norwich', self.scrape_the_halls_norwich),
            ('Norwich Venues', self.scrape_norwich_venues),
        ]

        for source_name, scraper_func in scrapers:
            try:
                logger.info(f"  Scraping {source_name}...")
                events = scraper_func()
                if events:
                    self.events.extend(events)
                    logger.info(f"    ✅ Found {len(events)} events from {source_name}")
            except Exception as e:
                logger.warning(f"    ⚠️ Failed to scrape {source_name}: {e}")

    # ========== Individual Scrapers ==========

    def scrape_eventbrite(self) -> List[Dict]:
        """Scrape Eventbrite API for Norwich events"""
        if not self.eventbrite_key:
            logger.info("    ⏭️ Skipping Eventbrite (no API key)")
            return []

        events = []
        url = "https://www.eventbriteapi.com/v3/events/search/"

        params = {
            'location.address': 'Norwich, UK',
            'location.within': f'{self.norwich_radius_km}km',
            'start_date.range_start': datetime.now().isoformat(),
            'start_date.range_end': (datetime.now() + timedelta(days=self.days_ahead)).isoformat(),
            'expand': 'venue',
        }

        headers = {
            'Authorization': f'Bearer {self.eventbrite_key}'
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()

            for event in data.get('events', []):
                events.append({
                    'raw_data': event,
                    'source': 'Eventbrite',
                    'url': event.get('url', '')
                })

        except Exception as e:
            logger.error(f"Eventbrite API error: {e}")

        return events

    def scrape_skiddle(self) -> List[Dict]:
        """Scrape Skiddle for Norwich events using their API with specific venue IDs"""
        events = []
        
        # Major Norwich venue IDs on Skiddle
        norwich_venue_ids = [
            9132,    # UEA The LCR
            59737,   # University of East Anglia (general)
            2003,    # Waterfront (Norwich)
            112257,  # Gonzo's Two Room
            46430,   # Epic Studios (primary)
            124745,  # NORWICH EPIC STUDIOS (duplicate)
        ]
        
        # Skiddle API endpoint
        if self.skiddle_key:
            logger.info("    🎫 Using Skiddle API with Norwich venue IDs")
            
            # Method 1: Get events by venue IDs
            for venue_id in norwich_venue_ids:
                try:
                    api_url = f"https://www.skiddle.com/api/v1/venues/{venue_id}/events/"
                    params = {
                        'api_key': self.skiddle_key,
                        'limit': 20
                    }
                    
                    response = requests.get(api_url, params=params, timeout=30)
                    response.raise_for_status()
                    data = response.json()
                    
                    if data.get('results'):
                        for event in data['results']:
                            events.append({
                                'raw_data': event,
                                'source': 'Skiddle API',
                                'url': event.get('link', ''),
                                'venue_id': venue_id
                            })
                        logger.info(f"    ✅ Found {len(data['results'])} events from venue {venue_id}")
                    
                except Exception as e:
                    logger.error(f"Skiddle API venue {venue_id} error: {e}")
                    continue
            
            # Method 2: Also search by location as backup
            try:
                api_url = "https://www.skiddle.com/api/v1/events/search/"
                params = {
                    'api_key': self.skiddle_key,
                    'latitude': 52.6309,  # Norwich coordinates
                    'longitude': 1.2974,
                    'radius': 10,  # 10km radius
                    'eventcode': 'LIVE',  # Live events
                    'limit': 30,
                    'order': 'date'
                }
                
                response = requests.get(api_url, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                if data.get('results'):
                    location_events = 0
                    for event in data['results']:
                        # Avoid duplicates from venue searches
                        event_id = event.get('id')
                        if not any(e.get('raw_data', {}).get('id') == event_id for e in events):
                            events.append({
                                'raw_data': event,
                                'source': 'Skiddle API (Location)',
                                'url': event.get('link', '')
                            })
                            location_events += 1
                    
                    if location_events > 0:
                        logger.info(f"    ✅ Found {location_events} additional events from location search")
                    
            except Exception as e:
                logger.error(f"Skiddle location search error: {e}")
        
        else:
            # Fallback to web scraping if no API key
            logger.info("    ⏭️ Skiddle API key not provided, trying web scrape")
            
            # Try main Norwich page and major venue pages
            venue_urls = [
                "https://www.skiddle.com/whats-on/Norwich/",
                "https://www.skiddle.com/whats-on/Norwich/clubs/",
                "https://www.skiddle.com/whats-on/Norwich/live-music/",
                "https://www.skiddle.com/whats-on/Norwich/festivals/"
            ]
            
            for url in venue_urls:
                try:
                    response = requests.get(url, timeout=30, headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    })
                    response.raise_for_status()
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Look for event links
                    event_links = soup.find_all('a', href=lambda x: x and '/whats-on/' in x and '/Norwich/' not in x)
                    
                    for link in event_links[:10]:  # Limit per venue
                        title = link.get_text(strip=True)
                        href = link.get('href', '')
                        
                        if title and len(title) > 5:
                            full_url = f"https://www.skiddle.com{href}" if href.startswith('/') else href
                            
                            # Avoid duplicates
                            if not any(e.get('url') == full_url for e in events):
                                events.append({
                                    'raw_data': {
                                        'title': title,
                                        'url': full_url,
                                        'html': str(link.parent)
                                    },
                                    'source': 'Skiddle',
                                    'url': full_url
                                })
                    
                except Exception as e:
                    logger.error(f"Skiddle web scraping error ({url}): {e}")
                    continue
            
            if events:
                logger.info(f"    ✅ Found {len(events)} events from Skiddle web scrape")

        return events

    def scrape_facebook(self) -> List[Dict]:
        """Scrape Facebook Graph API for Norwich events"""
        if not self.facebook_token:
            logger.info("    ⏭️ Skipping Facebook (no access token)")
            return []

        events = []
        # Note: Facebook deprecated public events API
        # Alternative: Search for public pages/venues and their events

        logger.info("    ℹ️ Facebook Events API is deprecated - using alternative method")

        return events

    def scrape_norwich_council(self) -> List[Dict]:
        """Scrape Norwich City Council events from RSS feed"""
        events = []
        
        # Try RSS feed first (best for council events)
        rss_urls = [
            "https://www.norwich.gov.uk/site/scripts/google_rss.php?categoryid=15",  # Events feed
            "https://www.norwich.gov.uk/events"  # Fallback HTML page
        ]
        
        for url in rss_urls:
            try:
                response = requests.get(url, timeout=30, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                response.raise_for_status()
                
                # Check if it's RSS/XML
                if 'xml' in response.headers.get('Content-Type', '') or url.endswith('.php'):
                    soup = BeautifulSoup(response.text, 'xml')
                    items = soup.find_all('item')
                    
                    for item in items:
                        title = item.find('title')
                        link = item.find('link')
                        description = item.find('description')
                        pubDate = item.find('pubDate')
                        
                        if title:
                            events.append({
                                'raw_data': {
                                    'title': title.get_text(strip=True) if title else '',
                                    'link': link.get_text(strip=True) if link else '',
                                    'description': description.get_text(strip=True) if description else '',
                                    'date': pubDate.get_text(strip=True) if pubDate else ''
                                },
                                'source': 'Norwich Council RSS',
                                'url': link.get_text(strip=True) if link else url
                            })
                    
                    if events:
                        logger.info(f"    ✅ Found {len(events)} events from Norwich Council RSS")
                        break
                else:
                    # HTML page
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Look for event listings
                    event_elements = (
                        soup.find_all('div', class_=lambda x: x and 'event' in str(x).lower()) or
                        soup.find_all('article') or
                        soup.find_all('li', class_=lambda x: x and 'event' in str(x).lower())
                    )
                    
                    for elem in event_elements[:20]:
                        text = elem.get_text(strip=True, separator=' ')
                        link_elem = elem.find('a', href=True)
                        
                        if text and len(text) > 30:
                            events.append({
                                'raw_data': {
                                    'content': text,
                                    'link': link_elem.get('href', '') if link_elem else '',
                                    'html': str(elem)
                                },
                                'source': 'Norwich Council',
                                'url': link_elem.get('href', '') if link_elem else url
                            })
                    
                    if events:
                        logger.info(f"    ✅ Found {len(events)} events from Norwich Council HTML")
                        break
                        
            except Exception as e:
                logger.error(f"Council scraping error ({url}): {e}")
                continue

        return events

    def scrape_visit_norwich(self) -> List[Dict]:
        """Scrape Visit Norwich website"""
        events = []
        url = "https://www.visitnorwich.co.uk/whats-on/"

        try:
            response = requests.get(url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Try multiple selectors to find events
            event_listings = (
                soup.find_all('article', class_=lambda x: x and 'event' in str(x).lower()) or
                soup.find_all('div', class_=lambda x: x and 'event' in str(x).lower()) or
                soup.find_all('li', class_=lambda x: x and 'event' in str(x).lower()) or
                soup.find_all('a', href=lambda x: x and '/event/' in str(x).lower())[:20]
            )

            for listing in event_listings[:30]:
                text = listing.get_text(strip=True, separator=' ')
                link_elem = listing.find('a', href=True) if listing.name != 'a' else listing
                link = link_elem.get('href', '') if link_elem else ''
                
                if text and len(text) > 20:
                    events.append({
                        'raw_data': {
                            'content': text[:500],
                            'html': str(listing)[:1000],
                            'link': link
                        },
                        'source': 'Visit Norwich',
                        'url': f"https://www.visitnorwich.co.uk{link}" if link.startswith('/') else (link if link.startswith('http') else url)
                    })
            
            if events:
                logger.info(f"    ✅ Found {len(events)} events from Visit Norwich")

        except Exception as e:
            logger.error(f"Visit Norwich scraping error: {e}")

        return events

    def scrape_the_halls_norwich(self) -> List[Dict]:
        """Scrape The Halls Norwich venue for events"""
        events = []
        
        # The Halls Norwich - major venue (updated URL)
        urls = [
            "https://thehallsnorwich.com/events/full",
            "https://thehallsnorwich.com/events/",
            "https://www.thehallsnorwich.com/events/"
        ]
        
        for url in urls:
            try:
                response = requests.get(url, timeout=30, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Look for event elements
                event_elements = (
                    soup.find_all('div', class_=lambda x: x and 'event' in str(x).lower()) or
                    soup.find_all('article') or
                    soup.find_all('a', href=lambda x: x and 'event' in str(x).lower())
                )
                
                for elem in event_elements[:30]:
                    title_elem = elem.find(['h2', 'h3', 'h4'])
                    title = title_elem.get_text(strip=True) if title_elem else elem.get_text(strip=True)[:100]
                    
                    link = elem.get('href') if elem.name == 'a' else (elem.find('a', href=True).get('href') if elem.find('a', href=True) else '')
                    
                    if title and len(title) > 5:
                        events.append({
                            'raw_data': {
                                'title': title,
                                'link': f"https://www.thehallsnorwich.com{link}" if link.startswith('/') else link,
                                'html': str(elem),
                                'venue': 'The Halls Norwich'
                            },
                            'source': 'The Halls Norwich',
                            'url': f"https://www.thehallsnorwich.com{link}" if link.startswith('/') else link
                        })
                
                if events:
                    logger.info(f"    ✅ Found {len(events)} events from The Halls Norwich")
                    break
                    
            except Exception as e:
                logger.error(f"The Halls Norwich scraping error: {e}")
                continue
        
        return events
    
    def scrape_norwich_venues(self) -> List[Dict]:
        """Scrape multiple Norwich venues for events"""
        events = []
        
        # Major Norwich venues - updated URLs from web search
        venues = [
            {
                'name': 'Norwich Arts Centre',
                'url': 'https://norwichartscentre.com/events/'
            },
            {
                'name': 'Norwich Playhouse',
                'url': 'https://norwichplayhouse.org.uk/whats-on/'
            },
            {
                'name': 'Theatre Royal Norwich',
                'url': 'https://theatreroyalnorwich.co.uk/whats-on/'
            },
            {
                'name': 'The Waterfront Norwich',
                'url': 'https://www.waterfrontnorwich.com/events/'
            },
            {
                'name': 'Norwich Puppet Theatre',
                'url': 'https://www.puppettheatre.co.uk/whats-on/'
            },
            {
                'name': 'The Assembly House Norwich',
                'url': 'https://www.assemblyhousenorwich.co.uk/whats-on/'
            },
            {
                'name': 'Norwich Cathedral',
                'url': 'https://www.cathedral.org.uk/events/'
            }
        ]
        
        for venue in venues:
            try:
                response = requests.get(venue['url'], timeout=30, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Generic event finder
                event_elements = (
                    soup.find_all('div', class_=lambda x: x and ('event' in str(x).lower() or 'show' in str(x).lower())) or
                    soup.find_all('article') or
                    soup.find_all('li', class_=lambda x: x and 'event' in str(x).lower())
                )
                
                venue_events = 0
                for elem in event_elements[:10]:  # Max 10 per venue
                    text = elem.get_text(strip=True, separator=' ')
                    
                    if text and len(text) > 20:
                        link_elem = elem.find('a', href=True)
                        link = link_elem.get('href', '') if link_elem else ''
                        
                        events.append({
                            'raw_data': {
                                'content': text[:500],
                                'link': link,
                                'venue': venue['name'],
                                'html': str(elem)[:1000]
                            },
                            'source': venue['name'],
                            'url': link if link.startswith('http') else f"{venue['url'].rsplit('/', 2)[0]}{link}"
                        })
                        venue_events += 1
                
                if venue_events > 0:
                    logger.info(f"    ✅ Found {venue_events} events from {venue['name']}")
                    
            except Exception as e:
                logger.error(f"{venue['name']} scraping error: {e}")
                continue
        
        return events

    # ========== AI Processing ==========

    def process_events_with_ai(self):
        """Use Claude AI to parse and structure raw event data"""
        processed_events = []

        for i, event in enumerate(self.events):
            logger.info(f"  Processing event {i+1}/{len(self.events)}...")

            try:
                structured_event = self.parse_event_with_ai(event)
                if structured_event:
                    processed_events.append(structured_event)
            except Exception as e:
                logger.warning(f"    Failed to process event: {e}")

        self.events = processed_events

    def parse_event_with_ai(self, raw_event: Dict) -> Optional[Dict]:
        """Use AI (Gemini or OpenAI) to extract structured data from raw event"""

        # Clean and prepare the raw data
        raw_data = raw_event.get('raw_data', '')
        if isinstance(raw_data, dict):
            raw_data_str = f"Title: {raw_data.get('title', '')}, Content: {raw_data.get('content', '')}, Link: {raw_data.get('link', '')}"
        else:
            raw_data_str = str(raw_data)
        
        prompt = f"""Extract Norwich event information and return ONLY valid JSON.

SOURCE: {raw_event.get('source', 'Unknown')}
URL: {raw_event.get('url', '')}
DATA: {raw_data_str[:1500]}

Return JSON with these EXACT fields:
- name: Event title (REQUIRED - extract from headings/titles)
- date: Format YYYY-MM-DD (REQUIRED - today is {datetime.now().strftime('%Y-%m-%d')}, dates must be FUTURE)
- time: Format HH:MM 24h or null
- location: Venue name (REQUIRED - extract or use "{raw_event.get('source', 'Norwich')}")
- address: Full address or null
- category: MUST be ONE of: nightlife, gigs, culture, food, sports, family (REQUIRED)
- description: 1-2 sentences
- ticketLink: URL or null
- price: "Free", "£10", "£5-15" or null
- imageUrl: URL or null

CRITICAL RULES:
✓ Return ONLY JSON, no explanations or markdown
✓ Date must be FUTURE (after {datetime.now().strftime('%Y-%m-%d')})
✓ If no clear date found, use next Saturday: {(datetime.now() + timedelta(days=(5 - datetime.now().weekday()) % 7)).strftime('%Y-%m-%d')}
✓ Location can be venue name from SOURCE if not in data
✓ Category: DJs/clubs=nightlife, bands=gigs, theatre/art=culture, food/drink=food, exercise=sports, kids=family
✓ Norwich/Norfolk events ONLY

EXAMPLES:
{{"name": "Live Jazz Night", "date": "2026-01-15", "time": "20:00", "location": "Norwich Arts Centre", "address": null, "category": "gigs", "description": "Evening of live jazz music", "ticketLink": null, "price": "£12", "imageUrl": null}}

{{"name": "Comedy Show", "date": "2026-01-20", "time": "19:30", "location": "Norwich Playhouse", "address": null, "category": "culture", "description": "Stand-up comedy night", "ticketLink": null, "price": "£15", "imageUrl": null}}

If insufficient data (no name OR no date OR outside Norwich):
{{"name": null, "date": null, "time": null, "location": null, "address": null, "category": null, "description": null, "ticketLink": null, "price": null, "imageUrl": null}}

JSON:"""

        try:
            if self.ai_provider == 'Gemini':
                response = self.model.generate_content(prompt)
                response_text = response.text.strip()
            else:  # OpenAI
                from openai import OpenAI
                client = OpenAI(api_key=self.openai_api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1024
                )
                response_text = response.choices[0].message.content.strip()

            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                event_data = json.loads(json_match.group())

                # Add metadata
                event_data['source'] = raw_event.get('source')
                event_data['sourceUrl'] = raw_event.get('url')
                event_data['scrapedAt'] = datetime.now().isoformat()
                event_data['aiProvider'] = self.ai_provider

                return event_data

        except Exception as e:
            logger.error(f"AI parsing error ({self.ai_provider}): {e}")

        return None

    def validate_events(self):
        """Validate event data quality"""
        valid_events = []

        for event in self.events:
            if self.is_valid_event(event):
                valid_events.append(event)
            else:
                logger.info(f"  ❌ Invalid event: {event.get('name', 'Unknown')} - Date: {event.get('date')}, Category: {event.get('category')}, Location: {event.get('location')}")

        logger.info(f"  ✅ {len(valid_events)}/{len(self.events)} events passed validation")
        self.events = valid_events

    def is_valid_event(self, event: Dict) -> bool:
        """Check if event meets minimum quality standards"""
        required_fields = ['name', 'date', 'location', 'category']

        # Check required fields
        for field in required_fields:
            if not event.get(field):
                return False

        # Validate category
        if event['category'] not in self.categories:
            return False

        # Validate date is in future
        try:
            event_date = datetime.fromisoformat(event['date'])
            if event_date < datetime.now():
                return False
        except:
            return False

        # Check name length
        if len(event['name']) < 3 or len(event['name']) > 200:
            return False

        return True

    def deduplicate_events(self):
        """Remove duplicate events"""
        unique_events = []
        seen = set()

        for event in self.events:
            # Create unique key
            key = f"{event['name']}_{event['date']}_{event['location']}".lower()
            key = re.sub(r'[^\w\s]', '', key)  # Remove special chars

            if key not in seen:
                seen.add(key)
                unique_events.append(event)
            else:
                logger.debug(f"  🔄 Duplicate found: {event['name']}")

        self.events = unique_events

    def score_events(self):
        """Assign quality scores to events"""
        for event in self.events:
            score = 0

            # Has all required fields (30 points)
            if all(event.get(f) for f in ['name', 'date', 'time', 'location', 'description']):
                score += 30
            elif all(event.get(f) for f in ['name', 'date', 'location']):
                score += 20

            # Has ticket link (20 points)
            if event.get('ticketLink'):
                score += 20

            # From trusted source (20 points)
            trusted_sources = ['Eventbrite', 'Norwich Council', 'Visit Norwich']
            if event.get('source') in trusted_sources:
                score += 20

            # Good description (15 points)
            desc = event.get('description', '')
            if len(desc) > 50 and len(desc) < 500:
                score += 15
            elif len(desc) > 20:
                score += 8

            # Has image (15 points)
            if event.get('imageUrl'):
                score += 15

            event['qualityScore'] = score

            # Auto-approve high quality events
            if score >= self.auto_approve_threshold:
                event['status'] = 'Approved'
            elif score >= self.min_quality_score:
                event['status'] = 'AI_Pending_Review'
            else:
                event['status'] = 'Rejected'

    def upload_to_sheets(self):
        """Upload events to Google Sheets"""
        if not self.sheet_id or not self.sheet_creds:
            logger.warning("  ⚠️ Google Sheets not configured - skipping upload")
            self.save_to_json()
            return

        try:
            # Authorize Google Sheets
            scope = ['https://spreadsheets.google.com/feeds',
                     'https://www.googleapis.com/auth/drive']
            
            logger.info("  🔑 Authenticating with Google Sheets...")
            creds = ServiceAccountCredentials.from_json_keyfile_name(self.sheet_creds, scope)
            client = gspread.authorize(creds)

            logger.info(f"  📊 Opening spreadsheet: {self.sheet_id}")
            spreadsheet = client.open_by_key(self.sheet_id)
            
            logger.info("  📝 Accessing 'Event Submissions' worksheet...")
            worksheet = spreadsheet.worksheet('Event Submissions')

            # Prepare rows
            approved_count = 0
            pending_count = 0

            for event in self.events:
                if event['status'] == 'Rejected':
                    continue

                row = [
                    datetime.now().isoformat(),  # Timestamp
                    event['name'],
                    event['date'],
                    event.get('time', ''),
                    event['location'],
                    event['category'],
                    event.get('description', ''),
                    event.get('ticketLink', ''),
                    '',  # Promoter Name (empty for AI)
                    '',  # Promoter Email (empty for AI)
                    '',  # Promoter Phone (empty for AI)
                    event['status'],
                    f"AI-{datetime.now().strftime('%Y%m%d')}-{approved_count + pending_count}"  # Event ID
                ]

                worksheet.append_row(row)

                if event['status'] == 'Approved':
                    approved_count += 1
                else:
                    pending_count += 1

            logger.info(f"  ✅ Uploaded {approved_count} approved and {pending_count} pending events")

        except json.JSONDecodeError as e:
            logger.error(f"  ❌ Google Sheets JSON parsing error: {e}")
            logger.error(f"  ℹ️ This usually means credentials are invalid or sheet doesn't exist")
            self.save_to_json()
        except gspread.exceptions.SpreadsheetNotFound:
            logger.error(f"  ❌ Spreadsheet not found: {self.sheet_id}")
            logger.error(f"  ℹ️ Check that GOOGLE_SHEET_ID is correct and service account has access")
            self.save_to_json()
        except gspread.exceptions.WorksheetNotFound:
            logger.error(f"  ❌ Worksheet 'Event Submissions' not found")
            logger.error(f"  ℹ️ Create a worksheet named 'Event Submissions' in your Google Sheet")
            self.save_to_json()
        except Exception as e:
            logger.error(f"  ❌ Failed to upload to Google Sheets: {type(e).__name__}: {e}")
            import traceback
            logger.error(f"  ℹ️ Full traceback: {traceback.format_exc()}")
            self.save_to_json()

    def save_to_json(self):
        """Save events to JSON file as backup"""
        filename = f"ai_events_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'total_events': len(self.events),
                'events': self.events
            }, f, indent=2, ensure_ascii=False)

        logger.info(f"  💾 Saved events to {filename}")

    def print_summary(self):
        """Print summary statistics"""
        approved = sum(1 for e in self.events if e.get('status') == 'Approved')
        pending = sum(1 for e in self.events if e.get('status') == 'AI_Pending_Review')
        rejected = sum(1 for e in self.events if e.get('status') == 'Rejected')

        by_category = {}
        for event in self.events:
            if event.get('status') != 'Rejected':
                cat = event.get('category', 'unknown')
                by_category[cat] = by_category.get(cat, 0) + 1

        print("\n" + "="*50)
        print("AI EVENT AGGREGATOR SUMMARY")
        print("="*50)
        print(f"[OK] Auto-approved:     {approved}")
        print(f"[PENDING] review:       {pending}")
        print(f"[X] Rejected:           {rejected}")
        print(f"[*] Total processed:    {len(self.events)}")
        print("\nEvents by category:")
        for cat, count in sorted(by_category.items()):
            print(f"  {cat}: {count}")
        print("="*50 + "\n")


def main():
    """Main entry point"""
    try:
        aggregator = EventAggregator()
        aggregator.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        exit(1)


if __name__ == '__main__':
    main()
