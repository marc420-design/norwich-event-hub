"""
Norwich Event Hub - AI Event Aggregator (OpenAI Version)
Uses OpenAI GPT-4 for event parsing and categorization

Lighter alternative to the Claude version - uses your existing OpenAI key
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import re

try:
    import openai
    import requests
    from bs4 import BeautifulSoup
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install openai requests beautifulsoup4 python-dotenv")
    exit(1)

# Load environment variables
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EventAggregator:
    """Event aggregation with OpenAI"""

    def __init__(self):
        self.openai_key = os.environ.get('OPENAI_API_KEY')
        if not self.openai_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        openai.api_key = self.openai_key
        self.events = []
        self.categories = ['nightlife', 'gigs', 'theatre', 'sports', 'markets', 'community', 'culture', 'free']

    def run(self):
        """Main execution"""
        logger.info("🚀 Starting AI Event Aggregator (OpenAI)")

        try:
            # Scrape sources
            logger.info("📡 Scraping event sources...")
            self.scrape_all_sources()
            logger.info(f"✅ Found {len(self.events)} raw events")

            # Process with OpenAI
            logger.info("🤖 Processing with OpenAI GPT...")
            self.process_with_openai()

            # Validate
            logger.info("✔️ Validating...")
            self.validate_events()

            # Deduplicate
            logger.info("🔍 Deduplicating...")
            self.deduplicate()
            logger.info(f"✅ {len(self.events)} unique events")

            # Score
            logger.info("⭐ Scoring quality...")
            self.score_events()

            # Save results
            self.save_results()

            # Summary
            self.print_summary()

            logger.info("✅ Complete!")

        except Exception as e:
            logger.error(f"❌ Error: {e}")
            raise

    def scrape_all_sources(self):
        """Scrape all event sources"""
        # For demo: scrape Skiddle
        try:
            events = self.scrape_skiddle()
            if events:
                self.events.extend(events)
                logger.info(f"  Found {len(events)} events from Skiddle")
        except Exception as e:
            logger.warning(f"  Failed to scrape: {e}")

    def scrape_skiddle(self) -> List[Dict]:
        """Scrape Skiddle Norwich events"""
        events = []
        url = "https://www.skiddle.com/whats-on/Norwich/"

        try:
            response = requests.get(url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Simple extraction (adjust selectors as needed)
            # This is a basic example - you'll need to inspect the actual HTML
            event_links = soup.find_all('a', href=re.compile(r'/whats-on/'))

            for link in event_links[:20]:  # Limit to 20 for testing
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

    def process_with_openai(self):
        """Use OpenAI to parse events"""
        processed = []

        for i, event in enumerate(self.events[:10], 1):  # Process first 10 for demo
            logger.info(f"  Processing {i}/{min(10, len(self.events))}...")

            try:
                structured = self.parse_with_gpt(event)
                if structured:
                    processed.append(structured)
            except Exception as e:
                logger.warning(f"  Failed: {e}")

        self.events = processed

    def parse_with_gpt(self, raw_event: Dict) -> Optional[Dict]:
        """Use GPT to extract structured data"""

        prompt = f"""Extract event information from this text and return ONLY a JSON object.

Source: {raw_event.get('source')}
Text: {raw_event.get('raw_data')}
URL: {raw_event.get('url')}

Return JSON with these exact fields:
- name: Event name
- date: YYYY-MM-DD format
- time: HH:MM format (or null)
- location: Venue name
- address: Full address (or null)
- category: ONE of: {', '.join(self.categories)}
- description: 1-2 sentence summary
- ticketLink: URL (or null)
- price: "Free" or "£10" etc (or null)

Only include Norwich/Norfolk events. Return null if not relevant.

Example: {{"name":"Live Music Night","date":"2026-01-15","time":"20:00","location":"Waterfront","category":"gigs","description":"Live bands"}}"""

        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",  # Cheaper, faster model
                messages=[
                    {"role": "system", "content": "You extract event data and return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            result = response.choices[0].message.content.strip()

            # Extract JSON
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                event_data = json.loads(json_match.group())
                event_data['source'] = raw_event.get('source')
                event_data['sourceUrl'] = raw_event.get('url')
                event_data['scrapedAt'] = datetime.now().isoformat()
                return event_data

        except Exception as e:
            logger.error(f"OpenAI error: {e}")

        return None

    def validate_events(self):
        """Validate events"""
        valid = []
        for event in self.events:
            if event.get('name') and event.get('date') and event.get('location'):
                if event.get('category') in self.categories:
                    valid.append(event)
        self.events = valid

    def deduplicate(self):
        """Remove duplicates"""
        unique = []
        seen = set()

        for event in self.events:
            key = f"{event['name']}_{event['date']}_{event['location']}".lower()
            key = re.sub(r'[^\w]', '', key)

            if key not in seen:
                seen.add(key)
                unique.append(event)

        self.events = unique

    def score_events(self):
        """Score quality"""
        for event in self.events:
            score = 0

            # Complete data (30)
            if all(event.get(f) for f in ['name', 'date', 'time', 'location', 'description']):
                score += 30

            # Has ticket link (20)
            if event.get('ticketLink'):
                score += 20

            # Trusted source (20)
            if event.get('source') in ['Eventbrite', 'Norwich Council']:
                score += 20

            # Good description (15)
            desc = event.get('description', '')
            if 50 < len(desc) < 500:
                score += 15

            # Has image (15)
            if event.get('imageUrl'):
                score += 15

            event['qualityScore'] = score

            # Set status
            if score >= 80:
                event['status'] = 'Approved'
            elif score >= 50:
                event['status'] = 'Pending'
            else:
                event['status'] = 'Rejected'

    def save_results(self):
        """Save to JSON"""
        filename = f"events_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'total': len(self.events),
                'events': self.events
            }, f, indent=2, ensure_ascii=False)

        logger.info(f"  💾 Saved to {filename}")

    def print_summary(self):
        """Print summary"""
        approved = sum(1 for e in self.events if e.get('status') == 'Approved')
        pending = sum(1 for e in self.events if e.get('status') == 'Pending')

        print("\n" + "="*50)
        print("📊 SUMMARY")
        print("="*50)
        print(f"✅ Approved:  {approved}")
        print(f"⏳ Pending:   {pending}")
        print(f"📋 Total:     {len(self.events)}")
        print("="*50 + "\n")


def main():
    aggregator = EventAggregator()
    aggregator.run()


if __name__ == '__main__':
    main()
