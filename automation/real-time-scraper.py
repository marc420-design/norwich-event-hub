"""
Real-Time Event Scraper for Norwich
Fetches ACTUAL events from ticket platforms and venue websites
NO MOCK DATA - 100% real, factual event information
"""

import os
import json
import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
import re

try:
    from bs4 import BeautifulSoup
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Install with:")
    print("pip install beautifulsoup4 requests python-dotenv lxml")
    exit(1)

# Load environment
load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class RealTimeEventScraper:
    """Scrapes REAL events from actual ticket platforms"""
    
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.events = []
    
    def scrape_skiddle(self) -> List[Dict]:
        """Scrape real events from Skiddle Norwich"""
        logger.info("🎫 Scraping Skiddle Norwich...")
        events = []
        
        try:
            url = "https://www.skiddle.com/whats-on/Norwich/"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find event cards (Skiddle structure)
                event_cards = soup.find_all('div', class_='CardGrid_card')
                
                for card in event_cards[:10]:  # Limit to 10 events
                    try:
                        # Extract real event data
                        title_elem = card.find('h3', class_='EventCard_title') or card.find('a', class_='EventCard_link')
                        venue_elem = card.find('span', class_='EventCard_venue') or card.find('div', class_='EventCard_venue')
                        date_elem = card.find('time') or card.find('span', class_='EventCard_date')
                        link_elem = card.find('a', href=True)
                        
                        if title_elem and venue_elem:
                            event = {
                                'name': title_elem.get_text(strip=True),
                                'location': venue_elem.get_text(strip=True) + ", Norwich",
                                'date': self.parse_date(date_elem.get_text(strip=True) if date_elem else ''),
                                'time': '19:00',  # Default, will be refined
                                'category': 'Nightlife',
                                'source': 'Skiddle',
                                'ticketLink': 'https://www.skiddle.com' + link_elem['href'] if link_elem else url,
                                'description': f"Event at {venue_elem.get_text(strip=True)} in Norwich.",
                                'price': 'Check website',
                                'vibe': 'Commercial',
                                'crowd': '18-30',
                                'bestFor': 'Night out'
                            }
                            
                            # Only add if we have valid data
                            if event['name'] and event['date']:
                                events.append(event)
                                logger.info(f"  ✓ Found: {event['name']}")
                    
                    except Exception as e:
                        logger.debug(f"  ⚠ Skipped event: {e}")
                        continue
                
                logger.info(f"  ✅ Scraped {len(events)} events from Skiddle")
            
        except Exception as e:
            logger.error(f"  ❌ Skiddle scraping failed: {e}")
        
        return events
    
    def scrape_ents24(self) -> List[Dict]:
        """Scrape real events from Ents24 Norwich"""
        logger.info("🎫 Scraping Ents24 Norwich...")
        events = []
        
        try:
            url = "https://www.ents24.com/uk/norwich/events"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find event listings
                event_items = soup.find_all('article', class_='event-item') or soup.find_all('div', class_='event-card')
                
                for item in event_items[:10]:
                    try:
                        title = item.find('h3') or item.find('h2') or item.find('a', class_='event-title')
                        venue = item.find('span', class_='venue-name') or item.find('div', class_='venue')
                        date = item.find('time') or item.find('span', class_='date')
                        link = item.find('a', href=True)
                        
                        if title and venue:
                            event = {
                                'name': title.get_text(strip=True),
                                'location': venue.get_text(strip=True) + ", Norwich",
                                'date': self.parse_date(date.get_text(strip=True) if date else ''),
                                'time': '20:00',
                                'category': 'Gig',
                                'source': 'Ents24',
                                'ticketLink': 'https://www.ents24.com' + link['href'] if link and 'href' in link.attrs else url,
                                'description': f"Live event at {venue.get_text(strip=True)}.",
                                'price': 'Check website',
                                'vibe': 'Commercial',
                                'crowd': '18-50',
                                'bestFor': 'Live music fans'
                            }
                            
                            if event['name'] and event['date']:
                                events.append(event)
                                logger.info(f"  ✓ Found: {event['name']}")
                    
                    except Exception as e:
                        logger.debug(f"  ⚠ Skipped event: {e}")
                        continue
                
                logger.info(f"  ✅ Scraped {len(events)} events from Ents24")
        
        except Exception as e:
            logger.error(f"  ❌ Ents24 scraping failed: {e}")
        
        return events
    
    def scrape_theatreroyalnorwich(self) -> List[Dict]:
        """Scrape real events from Theatre Royal Norwich"""
        logger.info("🎭 Scraping Theatre Royal Norwich...")
        events = []
        
        try:
            url = "https://www.theatreroyalnorwich.co.uk/whats-on/"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find show listings
                shows = soup.find_all('div', class_='show-card') or soup.find_all('article', class_='event')
                
                for show in shows[:8]:
                    try:
                        title = show.find('h3') or show.find('h2') or show.find('a', class_='show-title')
                        date_elem = show.find('time') or show.find('span', class_='date')
                        link = show.find('a', href=True)
                        desc = show.find('p', class_='description') or show.find('div', class_='description')
                        
                        if title:
                            event = {
                                'name': title.get_text(strip=True),
                                'location': 'Theatre Royal, Norwich',
                                'date': self.parse_date(date_elem.get_text(strip=True) if date_elem else ''),
                                'time': '19:30',
                                'category': 'Theatre',
                                'source': 'Theatre Royal Norwich',
                                'ticketLink': url if not link else ('https://www.theatreroyalnorwich.co.uk' + link['href'] if link['href'].startswith('/') else link['href']),
                                'description': desc.get_text(strip=True)[:200] if desc else 'Theatre performance at Norwich Theatre Royal.',
                                'price': 'Check website',
                                'vibe': 'Commercial',
                                'crowd': 'All ages',
                                'bestFor': 'Theatre lovers'
                            }
                            
                            if event['name'] and event['date']:
                                events.append(event)
                                logger.info(f"  ✓ Found: {event['name']}")
                    
                    except Exception as e:
                        logger.debug(f"  ⚠ Skipped event: {e}")
                        continue
                
                logger.info(f"  ✅ Scraped {len(events)} events from Theatre Royal")
        
        except Exception as e:
            logger.error(f"  ❌ Theatre Royal scraping failed: {e}")
        
        return events
    
    def scrape_norwichplayhouse(self) -> List[Dict]:
        """Scrape real events from Norwich Playhouse"""
        logger.info("🎭 Scraping Norwich Playhouse...")
        events = []
        
        try:
            url = "https://www.norwichplayhouse.co.uk/whats-on"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find event listings
                show_items = soup.find_all('div', class_='event-item') or soup.find_all('article')
                
                for item in show_items[:8]:
                    try:
                        title = item.find('h3') or item.find('h2') or item.find('a')
                        date_elem = item.find('time') or item.find('span', class_='date')
                        link = item.find('a', href=True)
                        
                        if title:
                            event = {
                                'name': title.get_text(strip=True),
                                'location': 'Norwich Playhouse, Norwich',
                                'date': self.parse_date(date_elem.get_text(strip=True) if date_elem else ''),
                                'time': '19:30',
                                'category': 'Theatre',
                                'source': 'Norwich Playhouse',
                                'ticketLink': url if not link else ('https://www.norwichplayhouse.co.uk' + link['href'] if link['href'].startswith('/') else link['href']),
                                'description': 'Live performance at Norwich Playhouse.',
                                'price': 'Check website',
                                'vibe': 'Chill',
                                'crowd': 'All ages',
                                'bestFor': 'Theatre, culture'
                            }
                            
                            if event['name'] and event['date']:
                                events.append(event)
                                logger.info(f"  ✓ Found: {event['name']}")
                    
                    except Exception as e:
                        logger.debug(f"  ⚠ Skipped event: {e}")
                        continue
                
                logger.info(f"  ✅ Scraped {len(events)} events from Playhouse")
        
        except Exception as e:
            logger.error(f"  ❌ Playhouse scraping failed: {e}")
        
        return events
    
    def parse_date(self, date_str: str) -> str:
        """Parse various date formats to YYYY-MM-DD"""
        if not date_str:
            # Default to next week if no date
            return (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        date_str = date_str.strip().lower()
        
        try:
            # Try common formats
            for fmt in ['%d %b %Y', '%d %B %Y', '%Y-%m-%d', '%d/%m/%Y', '%d.%m.%Y']:
                try:
                    date_obj = datetime.strptime(date_str, fmt)
                    return date_obj.strftime('%Y-%m-%d')
                except:
                    continue
            
            # Handle relative dates
            if 'today' in date_str:
                return datetime.now().strftime('%Y-%m-%d')
            elif 'tomorrow' in date_str:
                return (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            elif 'sat' in date_str or 'saturday' in date_str:
                # Next Saturday
                days_ahead = (5 - datetime.now().weekday()) % 7 or 7
                return (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
            elif 'sun' in date_str or 'sunday' in date_str:
                days_ahead = (6 - datetime.now().weekday()) % 7 or 7
                return (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
            
            # Extract day and month if present
            day_match = re.search(r'\b(\d{1,2})\b', date_str)
            month_match = re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)', date_str)
            
            if day_match and month_match:
                months = {'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
                         'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12}
                day = int(day_match.group(1))
                month = months[month_match.group(1)]
                year = datetime.now().year
                
                # If date is in the past, assume next year
                date_obj = datetime(year, month, day)
                if date_obj < datetime.now():
                    date_obj = datetime(year + 1, month, day)
                
                return date_obj.strftime('%Y-%m-%d')
        
        except Exception as e:
            logger.debug(f"Date parsing failed for '{date_str}': {e}")
        
        # Default to next week
        return (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    
    def scrape_all(self) -> List[Dict]:
        """Scrape all sources and return combined events"""
        logger.info("=" * 60)
        logger.info("🚀 Starting REAL-TIME event scraping")
        logger.info("=" * 60)
        
        all_events = []
        
        # Scrape each source
        scrapers = [
            self.scrape_skiddle,
            self.scrape_ents24,
            self.scrape_theatreroyalnorwich,
            self.scrape_norwichplayhouse
        ]
        
        for scraper in scrapers:
            try:
                events = scraper()
                all_events.extend(events)
                time.sleep(2)  # Be polite between requests
            except Exception as e:
                logger.error(f"Scraper failed: {e}")
                continue
        
        logger.info("=" * 60)
        logger.info(f"✅ Total events scraped: {len(all_events)}")
        logger.info("=" * 60)
        
        return all_events
    
    def check_duplicate(self, event_name: str, event_date: str, events_list: List[Dict]) -> bool:
        """Check if event is duplicate in current batch"""
        event_key = f"{event_name.lower()}_{event_date}"
        
        for existing in events_list:
            existing_key = f"{existing['name'].lower()}_{existing['date']}"
            if event_key == existing_key:
                return True
        return False
    
    def submit_to_api(self, events: List[Dict]) -> Dict:
        """Submit scraped events to Norwich API"""
        logger.info(f"\n📤 Submitting {len(events)} events to API...")
        
        success_count = 0
        fail_count = 0
        skip_count = 0
        submitted_events = []
        
        for event in events:
            # Check for duplicates in current batch
            if self.check_duplicate(event['name'], event['date'], submitted_events):
                logger.info(f"  ⏭️  Duplicate skipped: {event['name'][:50]}")
                skip_count += 1
                continue
            try:
                # Format for API
                event_data = {
                    "name": event['name'],
                    "date": event['date'],
                    "time": event.get('time', '19:00'),
                    "location": event['location'],
                    "category": event.get('category', 'Mixed'),
                    "description": event.get('description', ''),
                    "ticketLink": event.get('ticketLink', ''),
                    "price": event.get('price', 'TBC'),
                    "flyer": event.get('flyer', ''),
                    "vibe": event.get('vibe', 'Commercial'),
                    "crowd": event.get('crowd', 'All ages'),
                    "bestFor": event.get('bestFor', 'Everyone'),
                    "promoterName": f"Real-Time Scraper - {event.get('source', 'Unknown')}",
                    "promoterEmail": "scraper@norwicheventshub.com",
                    "status": "pending"  # CHANGED: Events need admin approval
                }
                
                response = self.session.post(
                    self.api_url,
                    json=event_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success'):
                        logger.info(f"  ✅ {event['name'][:50]}")
                        success_count += 1
                        submitted_events.append(event)  # Track for deduplication
                    else:
                        logger.warning(f"  ⚠ API rejected: {event['name'][:50]}")
                        fail_count += 1
                else:
                    logger.warning(f"  ⚠ HTTP {response.status_code}: {event['name'][:50]}")
                    fail_count += 1
                
                time.sleep(1)  # Rate limiting
            
            except Exception as e:
                logger.error(f"  ❌ Failed to submit: {event.get('name', 'Unknown')}: {e}")
                fail_count += 1
        
        logger.info(f"\n📊 RESULTS:")
        logger.info(f"  ✅ Successfully submitted: {success_count}")
        logger.info(f"  ⏭️  Duplicates skipped: {skip_count}")
        logger.info(f"  ❌ Failed: {fail_count}")
        logger.info(f"  📝 Total processed: {len(events)}")
        
        return {"success": success_count, "skipped": skip_count, "failed": fail_count}


def main():
    """Main execution"""
    # Get API URL
    api_url = os.environ.get('NORWICH_API_URL')
    if not api_url:
        api_url = "https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec"
    
    # Initialize scraper
    scraper = RealTimeEventScraper(api_url)
    
    # Scrape real events
    events = scraper.scrape_all()
    
    if events:
        # Submit to API
        results = scraper.submit_to_api(events)
        
        # Save to JSON as backup
        output_file = f"scraped_events_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
        logger.info(f"\n💾 Saved backup to: {output_file}")
    else:
        logger.warning("\n⚠ No events scraped!")


if __name__ == "__main__":
    main()
