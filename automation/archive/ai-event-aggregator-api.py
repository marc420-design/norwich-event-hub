"""
Norwich Event Hub - AI Event Aggregator (API Version)
Uses the Google Apps Script API for event submission

This version posts events directly to your API endpoint instead of 
writing to Google Sheets directly. Better for consistency and avoids 
authentication complexity.

Usage:
    python ai-event-aggregator-api.py

Environment variables required:
    GEMINI_API_KEY or OPENAI_API_KEY - AI API key for event extraction
    NORWICH_API_URL - Your Google Apps Script API endpoint
    
Optional:
    FACEBOOK_ACCESS_TOKEN - Facebook Graph API token
    EVENTBRITE_API_KEY - Eventbrite API key
    SKIDDLE_API_KEY - Skiddle API key
"""

import os
import json
import logging
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time

# Load environment variables
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(env_path)
except ImportError:
    pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class NorwichEventAPI:
    """API client for Norwich Event Hub"""
    
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
    
    def submit_event(self, event: Dict) -> Dict:
        """Submit an event to the API"""
        try:
            # Format event data for API
            event_data = {
                "name": event.get('name', ''),
                "date": event.get('date', ''),
                "time": event.get('time', '19:00'),
                "location": event.get('location', ''),
                "category": event.get('category', 'Nightlife'),
                "description": event.get('description', ''),
                "ticketLink": event.get('ticketLink', event.get('url', '')),
                "price": event.get('price', 'TBC'),
                "flyer": event.get('flyer', event.get('image', '')),
                "vibe": event.get('vibe', 'Commercial'),
                "crowd": event.get('crowd', 'All ages'),
                "bestFor": event.get('bestFor', 'Everyone'),
                "promoterName": "AI Event Aggregator",
                "promoterEmail": "ai@norwicheventshub.com",
                "status": event.get('status', 'approved')  # Auto-approve AI events
            }
            
            response = self.session.post(self.api_url, json=event_data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    logger.info(f"✅ Submitted: {event['name']} (ID: {result.get('eventId', 'N/A')})")
                    return result
                else:
                    logger.error(f"❌ API error: {result.get('message', 'Unknown error')}")
                    return {"success": False, "message": result.get('message')}
            else:
                logger.error(f"❌ HTTP {response.status_code}: {response.text[:200]}")
                return {"success": False, "message": f"HTTP {response.status_code}"}
                
        except requests.exceptions.Timeout:
            logger.error(f"⏱️ Timeout submitting: {event.get('name', 'Unknown')}")
            return {"success": False, "message": "Timeout"}
        except Exception as e:
            logger.error(f"❌ Error submitting {event.get('name', 'Unknown')}: {e}")
            return {"success": False, "message": str(e)}
    
    def test_connection(self) -> bool:
        """Test if API is accessible"""
        try:
            response = self.session.get(self.api_url, timeout=5)
            if response.status_code in [200, 405]:  # 405 = Method not allowed (GET), but API is up
                logger.info("✅ API connection successful")
                return True
            else:
                logger.warning(f"⚠️ API returned status {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Cannot connect to API: {e}")
            return False


class SimpleEventScraper:
    """Simple web scraper for Norwich events"""
    
    def __init__(self):
        self.sources = [
            {
                "name": "Norwich Theatre Royal",
                "url": "https://www.theatreroyalnorwich.co.uk/whats-on",
                "category": "Theatre"
            },
            {
                "name": "The Halls Norwich", 
                "url": "https://www.thehallsnorwich.co.uk/events",
                "category": "Gig"
            },
            {
                "name": "Epic Studios Norwich",
                "url": "https://www.epicstudiosnorwich.co.uk/events",
                "category": "Nightlife"
            },
            # Add more venues as needed
        ]
    
    def scrape_all(self) -> List[Dict]:
        """Scrape events from all sources"""
        all_events = []
        
        for source in self.sources:
            logger.info(f"🔍 Scraping: {source['name']}")
            events = self.scrape_source(source)
            all_events.extend(events)
            time.sleep(2)  # Be polite
        
        return all_events
    
    def scrape_source(self, source: Dict) -> List[Dict]:
        """Scrape events from a single source"""
        try:
            # This is a placeholder - you'd implement actual scraping here
            # For now, return empty list (implement based on your existing scraper)
            return []
        except Exception as e:
            logger.error(f"❌ Error scraping {source['name']}: {e}")
            return []


def main():
    """Main execution"""
    logger.info("🚀 Norwich Event Hub - AI Aggregator (API Version)")
    logger.info("=" * 60)
    
    # Get API URL from environment
    api_url = os.environ.get('NORWICH_API_URL')
    if not api_url:
        # Default to your deployed API
        api_url = "https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec"
        logger.info(f"📍 Using default API URL")
    
    logger.info(f"🌐 API: {api_url[:50]}...")
    
    # Initialize API client
    api = NorwichEventAPI(api_url)
    
    # Test connection
    if not api.test_connection():
        logger.error("❌ Cannot connect to API. Exiting.")
        return
    
    # Example: Submit test events (replace with your scraper)
    test_events = [
        {
            "name": "AI Test Event - Live Music Night",
            "date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
            "time": "20:00",
            "location": "The Waterfront, Norwich",
            "category": "Gig",
            "description": "Test event submitted by AI aggregator. Amazing live music from local bands!",
            "ticketLink": "https://example.com/tickets",
            "price": "£12",
            "flyer": "https://via.placeholder.com/400x600/FF5733/FFFFFF?text=Live+Music+Night",
            "vibe": "Underground",
            "crowd": "18-30",
            "bestFor": "Music lovers",
            "status": "approved"
        }
    ]
    
    # Submit events
    logger.info(f"\n📤 Submitting {len(test_events)} events...")
    success_count = 0
    fail_count = 0
    
    for event in test_events:
        result = api.submit_event(event)
        if result.get('success'):
            success_count += 1
        else:
            fail_count += 1
        time.sleep(1)  # Rate limiting
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 SUMMARY")
    logger.info(f"✅ Successfully submitted: {success_count}")
    logger.info(f"❌ Failed: {fail_count}")
    logger.info(f"📝 Total processed: {len(test_events)}")
    logger.info("=" * 60)
    
    if success_count > 0:
        logger.info("\n🎉 Events submitted! Check your Google Sheet:")
        logger.info("   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID")
        logger.info("\n💡 Events will appear on website after next sync (midnight UTC)")


if __name__ == "__main__":
    main()
