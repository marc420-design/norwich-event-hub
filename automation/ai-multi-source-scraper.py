"""
Norwich Event Hub - Multi-Source AI Scraper
Scrapes 6+ Norwich event sources to get 50-100 events

Sources:
- Skiddle (40+ events)
- Visit Norwich
- Norwich Theatre Royal
- Norwich Arts Centre
- The Halls
- Norfolk Museums
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import re
import time

try:
    import openai
    import requests
    from bs4 import BeautifulSoup
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install openai requests beautifulsoup4 python-dotenv")
    exit(1)

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MultiSourceScraper:
    """Enhanced multi-source event scraper"""

    def __init__(self):
        self.openai_key = os.environ.get('OPENAI_API_KEY')
        if not self.openai_key:
            raise ValueError("OPENAI_API_KEY not found")

        openai.api_key = self.openai_key
        self.raw_events = []
        self.processed_events = []
        self.categories = ['nightlife', 'gigs', 'theatre', 'sports', 'markets', 'community', 'culture', 'free']

        # User agent for web scraping
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

    def run(self):
        """Main execution"""
        logger.info("🚀 Multi-Source AI Event Scraper")
        logger.info("📍 Target: 50-100 Norwich events\n")

        try:
            # Step 1: Scrape all sources
            logger.info("="*60)
            logger.info("STEP 1: SCRAPING EVENT SOURCES")
            logger.info("="*60)
            self.scrape_all_sources()
            logger.info(f"\n✅ Total raw events collected: {len(self.raw_events)}\n")

            # Step 2: Process with AI (in batches)
            logger.info("="*60)
            logger.info("STEP 2: AI PROCESSING")
            logger.info("="*60)
            self.process_with_ai()
            logger.info(f"\n✅ Processed events: {len(self.processed_events)}\n")

            # Step 3: Validate
            logger.info("="*60)
            logger.info("STEP 3: VALIDATION")
            logger.info("="*60)
            self.validate_events()
            logger.info(f"✅ Valid events: {len(self.processed_events)}\n")

            # Step 4: Deduplicate
            logger.info("="*60)
            logger.info("STEP 4: DEDUPLICATION")
            logger.info("="*60)
            original_count = len(self.processed_events)
            self.deduplicate()
            duplicates_removed = original_count - len(self.processed_events)
            logger.info(f"✅ Unique events: {len(self.processed_events)} (removed {duplicates_removed} duplicates)\n")

            # Step 5: Score quality
            logger.info("="*60)
            logger.info("STEP 5: QUALITY SCORING")
            logger.info("="*60)
            self.score_events()

            # Step 6: Filter future events only
            logger.info("="*60)
            logger.info("STEP 6: FILTERING FUTURE EVENTS")
            logger.info("="*60)
            self.filter_future_events()

            # Step 7: Save
            logger.info("="*60)
            logger.info("STEP 7: SAVING RESULTS")
            logger.info("="*60)
            self.save_results()

            # Step 8: Update website data
            logger.info("="*60)
            logger.info("STEP 8: UPDATING WEBSITE")
            logger.info("="*60)
            self.update_website_data()

            # Final summary
            self.print_summary()

            logger.info("\n✅ COMPLETE! Your website is loaded with real events!")

        except Exception as e:
            logger.error(f"❌ Error: {e}")
            raise

    def scrape_all_sources(self):
        """Scrape all event sources"""

        # 1. Skiddle (expect 40+ events)
        logger.info("\n📡 Source 1: Skiddle")
        try:
            events = self.scrape_skiddle()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 2. Visit Norwich
        logger.info("\n📡 Source 2: Visit Norwich")
        try:
            events = self.scrape_visit_norwich()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 3. Theatre Royal
        logger.info("\n📡 Source 3: Theatre Royal Norwich")
        try:
            events = self.scrape_theatre_royal()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 4. Norwich Arts Centre
        logger.info("\n📡 Source 4: Norwich Arts Centre")
        try:
            events = self.scrape_arts_centre()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 5. The Halls
        logger.info("\n📡 Source 5: The Halls")
        try:
            events = self.scrape_the_halls()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 6. Eventbrite Norwich
        logger.info("\n📡 Source 6: Eventbrite Norwich")
        try:
            events = self.scrape_eventbrite()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 7. Waterfront Norwich
        logger.info("\n📡 Source 7: Waterfront Norwich")
        try:
            events = self.scrape_waterfront()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 8. Norwich Playhouse
        logger.info("\n📡 Source 8: Norwich Playhouse")
        try:
            events = self.scrape_playhouse()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 9. Maddermarket Theatre
        logger.info("\n📡 Source 9: Maddermarket Theatre")
        try:
            events = self.scrape_maddermarket()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 10. Norwich Cathedral
        logger.info("\n📡 Source 10: Norwich Cathedral")
        try:
            events = self.scrape_cathedral()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 11. Norwich Castle
        logger.info("\n📡 Source 11: Norwich Castle Museum")
        try:
            events = self.scrape_castle()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

        # 12. Cinema City
        logger.info("\n📡 Source 12: Cinema City Norwich")
        try:
            events = self.scrape_cinema_city()
            self.raw_events.extend(events)
            logger.info(f"   ✅ Found {len(events)} events")
        except Exception as e:
            logger.warning(f"   ⚠️ Failed: {e}")

    def scrape_skiddle(self) -> List[Dict]:
        """Scrape Skiddle - expect 40+ events"""
        events = []
        url = "https://www.skiddle.com/whats-on/Norwich/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Get all event links (increased limit to 50)
            event_links = soup.find_all('a', href=re.compile(r'/whats-on/'))

            for link in event_links[:50]:
                event_text = link.get_text(strip=True)
                event_url = 'https://www.skiddle.com' + link.get('href', '')

                if event_text and len(event_text) > 10:
                    events.append({
                        'raw_data': event_text,
                        'source': 'Skiddle',
                        'url': event_url
                    })

        except Exception as e:
            logger.error(f"Skiddle error: {e}")

        return events

    def scrape_visit_norwich(self) -> List[Dict]:
        """Scrape Visit Norwich events"""
        events = []
        url = "https://www.visitnorwich.co.uk/whats-on/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Generic event extraction
            for item in soup.find_all(['article', 'div'], class_=re.compile(r'event|listing'), limit=30):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 20:
                    events.append({
                        'raw_data': text,
                        'source': 'Visit Norwich',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Visit Norwich error: {e}")

        return events

    def scrape_theatre_royal(self) -> List[Dict]:
        """Scrape Theatre Royal Norwich"""
        events = []
        url = "https://www.theatreroyalnorwich.co.uk/whats-on/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Look for show/event listings
            for item in soup.find_all(['div', 'article', 'li'], class_=re.compile(r'show|event|performance'), limit=25):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 15:
                    events.append({
                        'raw_data': text,
                        'source': 'Theatre Royal Norwich',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Theatre Royal error: {e}")

        return events

    def scrape_arts_centre(self) -> List[Dict]:
        """Scrape Norwich Arts Centre"""
        events = []
        url = "https://www.norwichartscentre.co.uk/whats-on/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article'], class_=re.compile(r'event|gig|show'), limit=20):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 15:
                    events.append({
                        'raw_data': text,
                        'source': 'Norwich Arts Centre',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Arts Centre error: {e}")

        return events

    def scrape_the_halls(self) -> List[Dict]:
        """Scrape The Halls Norwich"""
        events = []
        url = "https://www.openorchestra.co.uk/the-halls"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article'], limit=15):
                text = item.get_text(strip=True)

                if 'hall' in text.lower() or 'event' in text.lower():
                    if len(text) > 20:
                        events.append({
                            'raw_data': text,
                            'source': 'The Halls',
                            'url': url
                        })

        except Exception as e:
            logger.error(f"The Halls error: {e}")

        return events

    def scrape_eventbrite(self) -> List[Dict]:
        """Scrape Eventbrite Norwich (public pages)"""
        events = []
        url = "https://www.eventbrite.co.uk/d/united-kingdom--norwich/events/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Eventbrite has dynamic loading, so we get what we can
            for item in soup.find_all('div', class_=re.compile(r'event-card|search-event-card'), limit=25):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 20:
                    events.append({
                        'raw_data': text,
                        'source': 'Eventbrite',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Eventbrite error: {e}")

        return events

    def scrape_waterfront(self) -> List[Dict]:
        """Scrape Waterfront Norwich music venue"""
        events = []
        url = "https://www.ueanorwich.co.uk/waterfront"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article', 'li'], class_=re.compile(r'event|gig|show|listing'), limit=30):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 15:
                    events.append({
                        'raw_data': text,
                        'source': 'Waterfront Norwich',
                        'url': 'https://www.ueanorwich.co.uk' + link['href'] if link and link.get('href', '').startswith('/') else url
                    })

        except Exception as e:
            logger.error(f"Waterfront error: {e}")

        return events

    def scrape_playhouse(self) -> List[Dict]:
        """Scrape Norwich Playhouse"""
        events = []
        url = "https://www.norwichplayhouse.co.uk/whats-on/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article'], class_=re.compile(r'event|show|performance'), limit=25):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 15:
                    events.append({
                        'raw_data': text,
                        'source': 'Norwich Playhouse',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Playhouse error: {e}")

        return events

    def scrape_maddermarket(self) -> List[Dict]:
        """Scrape Maddermarket Theatre"""
        events = []
        url = "https://maddermarket.co.uk/whats-on/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article', 'li'], class_=re.compile(r'production|show|event'), limit=20):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 15:
                    events.append({
                        'raw_data': text,
                        'source': 'Maddermarket Theatre',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Maddermarket error: {e}")

        return events

    def scrape_cathedral(self) -> List[Dict]:
        """Scrape Norwich Cathedral events"""
        events = []
        url = "https://cathedral.org.uk/visit/whats-on/"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article'], class_=re.compile(r'event|concert|service'), limit=20):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 20:
                    events.append({
                        'raw_data': text,
                        'source': 'Norwich Cathedral',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Cathedral error: {e}")

        return events

    def scrape_castle(self) -> List[Dict]:
        """Scrape Norwich Castle Museum"""
        events = []
        url = "https://www.museums.norfolk.gov.uk/norwich-castle/whats-on"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article'], class_=re.compile(r'event|exhibition|activity'), limit=20):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 20:
                    events.append({
                        'raw_data': text,
                        'source': 'Norwich Castle Museum',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Castle error: {e}")

        return events

    def scrape_cinema_city(self) -> List[Dict]:
        """Scrape Cinema City Norwich"""
        events = []
        url = "https://www.picturehouses.com/cinema/cinema-city"

        try:
            response = requests.get(url, timeout=30, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            for item in soup.find_all(['div', 'article'], class_=re.compile(r'film|movie|screening|event'), limit=25):
                text = item.get_text(strip=True)
                link = item.find('a')

                if text and len(text) > 15 and 'norwich' in text.lower():
                    events.append({
                        'raw_data': text,
                        'source': 'Cinema City Norwich',
                        'url': link['href'] if link and link.get('href') else url
                    })

        except Exception as e:
            logger.error(f"Cinema City error: {e}")

        return events

    def process_with_ai(self):
        """Process events with OpenAI in batches"""
        processed = []
        total = len(self.raw_events)

        # Process in batches of 10 to manage API costs
        batch_size = 10
        max_events = min(total, 100)  # Process up to 100 events max
        for i in range(0, max_events, batch_size):
            batch = self.raw_events[i:i+batch_size]
            logger.info(f"\n🤖 Processing batch {i//batch_size + 1} ({len(batch)} events)...")

            for j, event in enumerate(batch, 1):
                logger.info(f"   Processing {i+j}/{max_events}...")

                try:
                    structured = self.parse_with_gpt(event)
                    if structured:
                        processed.append(structured)
                    time.sleep(0.5)  # Rate limiting
                except Exception as e:
                    logger.warning(f"   Failed: {e}")

        self.processed_events = processed

    def parse_with_gpt(self, raw_event: Dict) -> Optional[Dict]:
        """Use GPT to extract structured data"""

        prompt = f"""Extract event information from this text and return ONLY a JSON object.

Source: {raw_event.get('source')}
Text: {raw_event.get('raw_data')}
URL: {raw_event.get('url')}

Return JSON with these exact fields:
- name: Event name (string)
- date: YYYY-MM-DD format (string)
- time: HH:MM format (string or null)
- location: Venue name (string)
- address: Full address (string or null)
- category: ONE of: nightlife, gigs, theatre, sports, markets, community, culture, free
- description: 1-2 sentence summary (string)
- ticketLink: Full URL (string or null)
- price: "Free" or "£10" etc (string or null)

Rules:
- Only Norwich/Norfolk events
- Date must be future date
- Category must match one of the options exactly
- Return null if not a valid event

Example: {{"name":"Live Music Night","date":"2026-01-15","time":"20:00","location":"Waterfront","category":"gigs","description":"Live bands perform.","ticketLink":"https://example.com","price":"£15"}}"""

        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You extract event data and return only valid JSON. No markdown, no code blocks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            result = response.choices[0].message.content.strip()

            # Extract JSON (remove markdown if present)
            result = result.replace('```json', '').replace('```', '')
            json_match = re.search(r'\{.*\}', result, re.DOTALL)

            if json_match:
                event_data = json.loads(json_match.group())

                # Add metadata
                event_data['source'] = raw_event.get('source')
                event_data['sourceUrl'] = raw_event.get('url')
                event_data['scrapedAt'] = datetime.now().isoformat()

                return event_data

        except Exception as e:
            logger.debug(f"OpenAI error: {e}")

        return None

    def validate_events(self):
        """Validate events have required fields"""
        valid = []

        for event in self.processed_events:
            # Must have core fields
            if not all([event.get('name'), event.get('date'), event.get('location')]):
                continue

            # Must have valid category
            if event.get('category') not in self.categories:
                continue

            # Date format check
            try:
                datetime.strptime(event['date'], '%Y-%m-%d')
            except:
                continue

            valid.append(event)

        self.processed_events = valid

    def filter_future_events(self):
        """Keep only future events"""
        today = datetime.now().date()
        future = []

        for event in self.processed_events:
            try:
                event_date = datetime.strptime(event['date'], '%Y-%m-%d').date()
                if event_date >= today:
                    future.append(event)
            except:
                pass

        past_events = len(self.processed_events) - len(future)
        self.processed_events = future
        logger.info(f"✅ Kept {len(future)} future events (removed {past_events} past events)")

    def deduplicate(self):
        """Remove duplicate events"""
        unique = []
        seen = set()

        for event in self.processed_events:
            # Create key from name, date, location
            key = f"{event['name']}_{event['date']}_{event['location']}".lower()
            key = re.sub(r'[^\w]', '', key)

            if key not in seen:
                seen.add(key)
                unique.append(event)

        self.processed_events = unique

    def score_events(self):
        """Score event quality (0-100)"""
        for event in self.processed_events:
            score = 0

            # Core completeness (40 points)
            if all(event.get(f) for f in ['name', 'date', 'time', 'location', 'description']):
                score += 40

            # Has ticket link (20 points)
            if event.get('ticketLink'):
                score += 20

            # Trusted source (15 points)
            trusted = ['Eventbrite', 'Theatre Royal Norwich', 'Visit Norwich', 'Norwich Arts Centre']
            if event.get('source') in trusted:
                score += 15

            # Good description (15 points)
            desc = event.get('description', '')
            if 50 < len(desc) < 500:
                score += 15

            # Has price info (10 points)
            if event.get('price'):
                score += 10

            event['qualityScore'] = min(score, 100)

            # Set status based on score
            if score >= 70:
                event['status'] = 'Approved'
            elif score >= 50:
                event['status'] = 'Pending'
            else:
                event['status'] = 'Rejected'

        # Log quality distribution
        approved = sum(1 for e in self.processed_events if e['status'] == 'Approved')
        pending = sum(1 for e in self.processed_events if e['status'] == 'Pending')
        rejected = sum(1 for e in self.processed_events if e['status'] == 'Rejected')

        logger.info(f"✅ Quality scores assigned:")
        logger.info(f"   Approved (70+): {approved}")
        logger.info(f"   Pending (50-69): {pending}")
        logger.info(f"   Rejected (<50): {rejected}")

    def save_results(self):
        """Save to JSON file"""
        filename = f"events_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'total': len(self.processed_events),
                'events': self.processed_events
            }, f, indent=2, ensure_ascii=False)

        logger.info(f"💾 Saved to {filename}")

    def update_website_data(self):
        """Update sample-events.json with new events"""
        data_file = '../data/sample-events.json'

        try:
            # Read existing
            with open(data_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)

            # Get approved/pending events
            new_events = [e for e in self.processed_events if e['status'] in ['Approved', 'Pending']]

            # Convert to website format and add IDs
            next_id = max([e.get('id', 0) for e in existing_data.get('events', [])], default=100) + 1

            for event in new_events:
                website_event = {
                    'id': next_id,
                    'name': event['name'],
                    'date': event['date'],
                    'time': event.get('time'),
                    'location': event['location'],
                    'category': event['category'],
                    'description': event['description'],
                    'ticketLink': event.get('ticketLink'),
                    'image': None,
                    'status': 'approved' if event['status'] == 'Approved' else 'pending'
                }

                # Check for duplicates
                is_duplicate = False
                for existing in existing_data['events']:
                    if (existing['name'].lower() == event['name'].lower() and
                        existing['date'] == event['date']):
                        is_duplicate = True
                        break

                if not is_duplicate:
                    existing_data['events'].append(website_event)
                    next_id += 1

            # Update metadata
            existing_data['lastUpdated'] = datetime.now().isoformat()
            existing_data['aiScraped'] = True
            existing_data['realEvents'] = sum(1 for e in existing_data['events'] if e['id'] >= 101)

            # Save
            with open(data_file, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, indent=2, ensure_ascii=False)

            logger.info(f"✅ Updated website data: {len(existing_data['events'])} total events")

        except Exception as e:
            logger.error(f"Failed to update website: {e}")

    def print_summary(self):
        """Print final summary"""
        approved = sum(1 for e in self.processed_events if e['status'] == 'Approved')
        pending = sum(1 for e in self.processed_events if e['status'] == 'Pending')

        # Category breakdown
        categories = {}
        for event in self.processed_events:
            cat = event.get('category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1

        print("\n" + "="*60)
        print("🎉 FINAL SUMMARY")
        print("="*60)
        print(f"✅ Approved:  {approved}")
        print(f"⏳ Pending:   {pending}")
        print(f"📋 Total:     {len(self.processed_events)}")
        print("\n📊 By Category:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"   {cat}: {count}")
        print("="*60)
        print("\n✅ Your website is now loaded with real Norwich events!")
        print("🌐 View at: http://localhost:8080/directory.html")
        print("="*60 + "\n")


def main():
    scraper = MultiSourceScraper()
    scraper.run()


if __name__ == '__main__':
    main()
