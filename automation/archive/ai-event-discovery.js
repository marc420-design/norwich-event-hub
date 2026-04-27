/**
 * Norwich Event Hub - AI Event Discovery System
 *
 * This script discovers events from multiple sources and adds them to Google Sheets
 * Sources:
 * - Social media APIs (Instagram, Facebook, Twitter)
 * - Venue websites and RSS feeds
 * - Eventbrite, Ticketmaster, etc.
 * - Local news sites
 *
 * SETUP:
 * 1. Deploy this as a Google Apps Script or Node.js service
 * 2. Set up API keys for social media platforms
 * 3. Schedule to run daily (or hourly for real-time updates)
 * 4. Events are auto-submitted to Google Sheets with 'AI-' prefix
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Google Sheets
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec',

  // Norwich venues to monitor
  VENUES: [
    { name: 'The Waterfront', url: 'https://www.waterfront.co.uk/', social: '@waterfrontnorwich' },
    { name: 'Norwich Arts Centre', url: 'https://www.norwichartscentre.co.uk/', social: '@norwichartscentre' },
    { name: 'The Forum', url: 'https://www.theforumnorwich.co.uk/', social: '@theforumnorwich' },
    { name: 'Norwich Playhouse', url: 'https://www.norwichplayhouse.co.uk/', social: '@norwichplayhouse' },
    { name: 'OPEN Norwich', url: 'https://opennorwich.co.uk/', social: '@opennorwich' },
    { name: 'Norwich Theatre Royal', url: 'https://www.norwichtheatre.org/', social: '@norwichtheatres' },
  ],

  // Keywords to detect events
  EVENT_KEYWORDS: [
    'gig', 'concert', 'live music', 'dj', 'club night',
    'theatre', 'play', 'comedy', 'stand-up',
    'market', 'fair', 'festival',
    'exhibition', 'gallery', 'art',
    'workshop', 'class', 'yoga',
    'quiz', 'trivia', 'pub quiz',
    'dance', 'salsa', 'bachata',
  ],

  // Category mapping
  CATEGORY_MAP: {
    'gig': 'gigs',
    'concert': 'gigs',
    'live music': 'gigs',
    'dj': 'nightlife',
    'club': 'nightlife',
    'theatre': 'theatre',
    'comedy': 'theatre',
    'market': 'markets',
    'exhibition': 'culture',
    'yoga': 'free',
    'quiz': 'community',
  }
};

// ============================================================================
// MAIN DISCOVERY FUNCTIONS
// ============================================================================

/**
 * Main discovery function - runs all sources
 */
async function discoverEvents() {
  console.log('🤖 AI Event Discovery - Starting...');

  const discoveredEvents = [];

  // 1. Scrape venue websites
  const venueEvents = await scrapeVenueWebsites();
  discoveredEvents.push(...venueEvents);

  // 2. Check social media
  const socialEvents = await monitorSocialMedia();
  discoveredEvents.push(...socialEvents);

  // 3. Check event platforms
  const platformEvents = await checkEventPlatforms();
  discoveredEvents.push(...platformEvents);

  // 4. Check local news
  const newsEvents = await scanLocalNews();
  discoveredEvents.push(...newsEvents);

  console.log(`✅ Discovered ${discoveredEvents.length} potential events`);

  // 5. Deduplicate and validate
  const uniqueEvents = deduplicateEvents(discoveredEvents);
  console.log(`🎯 After deduplication: ${uniqueEvents.length} unique events`);

  // 6. Submit to Google Sheets
  let submitted = 0;
  for (const event of uniqueEvents) {
    const success = await submitEventToGoogleSheets(event);
    if (success) submitted++;
  }

  console.log(`📊 Submitted ${submitted} events to Google Sheets`);

  return {
    discovered: discoveredEvents.length,
    unique: uniqueEvents.length,
    submitted: submitted
  };
}

/**
 * Scrape venue websites for events
 */
async function scrapeVenueWebsites() {
  console.log('🌐 Scraping venue websites...');
  const events = [];

  for (const venue of CONFIG.VENUES) {
    try {
      // This is a placeholder - actual implementation requires web scraping
      // You can use Puppeteer, Cheerio, or similar tools

      console.log(`  Checking ${venue.name}...`);

      // Example: Fetch venue page and parse events
      // const response = await fetch(venue.url);
      // const html = await response.text();
      // const parsedEvents = parseEventsFromHTML(html, venue.name);
      // events.push(...parsedEvents);

    } catch (error) {
      console.error(`  ❌ Error scraping ${venue.name}:`, error.message);
    }
  }

  return events;
}

/**
 * Monitor social media for event announcements
 */
async function monitorSocialMedia() {
  console.log('📱 Monitoring social media...');
  const events = [];

  // Example: Instagram Graph API
  // const instagramEvents = await searchInstagram('#norwichwevents');
  // events.push(...instagramEvents);

  // Example: Twitter API v2
  // const twitterEvents = await searchTwitter('Norwich events');
  // events.push(...twitterEvents);

  // Example: Facebook Events API
  // const facebookEvents = await searchFacebookEvents('Norwich');
  // events.push(...facebookEvents);

  return events;
}

/**
 * Check event platforms (Eventbrite, Ticketmaster, etc.)
 */
async function checkEventPlatforms() {
  console.log('🎫 Checking event platforms...');
  const events = [];

  // Example: Eventbrite API
  try {
    // const eventbriteEvents = await searchEventbrite({
    //   location: 'Norwich, UK',
    //   start_date: new Date().toISOString(),
    //   end_date: addDays(new Date(), 30).toISOString()
    // });
    // events.push(...eventbriteEvents);
  } catch (error) {
    console.error('  ❌ Eventbrite error:', error.message);
  }

  // Example: Ticketmaster API
  try {
    // const ticketmasterEvents = await searchTicketmaster({
    //   city: 'Norwich',
    //   countryCode: 'GB'
    // });
    // events.push(...ticketmasterEvents);
  } catch (error) {
    console.error('  ❌ Ticketmaster error:', error.message);
  }

  return events;
}

/**
 * Scan local news sites for event announcements
 */
async function scanLocalNews() {
  console.log('📰 Scanning local news...');
  const events = [];

  const newsSources = [
    'https://www.edp24.co.uk/things-to-do/whats-on-norwich',
    'https://www.eveningnews24.co.uk/things-to-do/',
  ];

  for (const source of newsSources) {
    try {
      // Fetch and parse news articles
      // const articles = await fetchAndParseNews(source);
      // events.push(...articles);
    } catch (error) {
      console.error(`  ❌ Error scanning ${source}:`, error.message);
    }
  }

  return events;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Deduplicate events by name, date, and location
 */
function deduplicateEvents(events) {
  const seen = new Set();
  const unique = [];

  for (const event of events) {
    const key = `${event.name}|${event.date}|${event.location}`.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(event);
    }
  }

  return unique;
}

/**
 * Validate event data
 */
function validateEvent(event) {
  return (
    event.name &&
    event.date &&
    event.location &&
    event.category
  );
}

/**
 * Categorize event based on keywords
 */
function categorizeEvent(text) {
  const lowerText = text.toLowerCase();

  for (const [keyword, category] of Object.entries(CONFIG.CATEGORY_MAP)) {
    if (lowerText.includes(keyword)) {
      return category;
    }
  }

  return 'community'; // Default category
}

/**
 * Submit discovered event to Google Sheets
 */
async function submitEventToGoogleSheets(event) {
  try {
    // Generate AI event ID
    const eventId = `AI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Prepare event data
    const eventData = {
      eventId: eventId,
      name: event.name,
      date: event.date,
      time: event.time || '19:00',
      location: event.location,
      category: event.category || 'community',
      description: event.description || '',
      ticketLink: event.ticketLink || event.url || '',
      promoterName: 'AI Discovery Bot',
      promoterEmail: 'ai@norwicheventshub.com',
      promoterPhone: '',
      status: 'Pending', // Requires manual approval
      price: event.price || '',
      address: event.address || '',
      vibe: event.vibe || '',
      bestFor: event.bestFor || '',
      featured: 'No',
      priority: 'medium',
      image: event.image || ''
    };

    // Submit to Google Sheets
    const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();

    if (result.success) {
      console.log(`  ✅ Submitted: ${event.name}`);
      return true;
    } else {
      console.error(`  ❌ Failed: ${event.name} - ${result.message}`);
      return false;
    }

  } catch (error) {
    console.error(`  ❌ Error submitting event:`, error.message);
    return false;
  }
}

// ============================================================================
// EXAMPLE: EVENTBRITE API INTEGRATION
// ============================================================================

/**
 * Search Eventbrite for Norwich events
 * Requires: EVENTBRITE_API_KEY environment variable
 */
async function searchEventbrite(params) {
  const API_KEY = process.env.EVENTBRITE_API_KEY;

  if (!API_KEY) {
    console.warn('⚠️ Eventbrite API key not set');
    return [];
  }

  try {
    const queryParams = new URLSearchParams({
      'location.address': params.location,
      'start_date.range_start': params.start_date,
      'start_date.range_end': params.end_date,
      expand: 'venue'
    });

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const data = await response.json();

    return data.events.map(event => ({
      name: event.name.text,
      date: event.start.local.split('T')[0],
      time: event.start.local.split('T')[1].substring(0, 5),
      location: event.venue?.name || 'TBA',
      address: event.venue?.address?.localized_address_display || '',
      category: categorizeEvent(event.name.text + ' ' + event.description.text),
      description: event.description.text,
      ticketLink: event.url,
      price: event.is_free ? 'Free' : 'Check website',
      image: event.logo?.url || '',
      source: 'Eventbrite'
    }));

  } catch (error) {
    console.error('Eventbrite API error:', error);
    return [];
  }
}

// ============================================================================
// SCHEDULING (for automated runs)
// ============================================================================

/**
 * Run discovery on a schedule
 * Example: Every 6 hours
 */
function scheduleDiscovery() {
  const INTERVAL_HOURS = 6;

  console.log(`⏰ Scheduling discovery every ${INTERVAL_HOURS} hours`);

  setInterval(async () => {
    console.log('\n🕐 Scheduled run starting...');
    await discoverEvents();
  }, INTERVAL_HOURS * 60 * 60 * 1000);

  // Run immediately on start
  discoverEvents();
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    discoverEvents,
    scheduleDiscovery,
    searchEventbrite,
    submitEventToGoogleSheets
  };
}

// For Google Apps Script
if (typeof global !== 'undefined' && global.doGet) {
  global.discoverEvents = discoverEvents;
}

console.log('✅ AI Event Discovery System loaded!');
console.log('📖 Run: await discoverEvents()');
