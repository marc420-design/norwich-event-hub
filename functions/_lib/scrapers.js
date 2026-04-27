/**
 * Individual event scrapers for Cloudflare Pages Functions
 * Scrapes events from various Norwich event sources
 */

import { parseDate, parseTime } from './date-parser.js';

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Scrape Skiddle Norwich events
 * @returns {Promise<Array>} - Array of event objects
 */
export async function scrapeSkiddle() {
  try {
    const response = await fetchWithTimeout('https://www.skiddle.com/whats-on/Norwich/', 8000);
    const html = await response.text();

    const events = [];

    // Extract event cards using regex
    const cardRegex = /<div[^>]*class="[^"]*CardGrid_card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/a>/gi;
    const cards = [...html.matchAll(cardRegex)];

    for (const card of cards.slice(0, 8)) {
      const cardHtml = card[1];

      // Extract title
      const titleMatch = cardHtml.match(/<h3[^>]*class="[^"]*EventCard_title[^"]*"[^>]*>([^<]+)<\/h3>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract venue
      const venueMatch = cardHtml.match(/<span[^>]*class="[^"]*EventCard_venue[^"]*"[^>]*>([^<]+)<\/span>/i);
      const venue = venueMatch ? venueMatch[1].trim() : 'Norwich';

      // Extract date
      const dateMatch = cardHtml.match(/<time[^>]*datetime="([^"]+)"[^>]*>/i);
      const date = dateMatch ? parseDate(dateMatch[1]) : parseDate('next week');

      // Extract link
      const linkMatch = card[0].match(/<a[^>]*href="([^"]+)"/i);
      const link = linkMatch ? `https://www.skiddle.com${linkMatch[1]}` : '';

      if (title) {
        events.push({
          name: title,
          date: date,
          time: '19:00', // Default time
          location: venue,
          category: 'Nightlife',
          description: `${title} at ${venue}`,
          ticketLink: link,
          price: 'TBC',
          source: 'Skiddle',
          vibe: '🎉 Lively',
          crowd: 'Mixed crowd',
          bestFor: 'Night out'
        });
      }
    }

    return events;

  } catch (error) {
    console.error('Skiddle scraper error:', error.message);
    return [];
  }
}

/**
 * Scrape Ents24 Norwich events
 * @returns {Promise<Array>} - Array of event objects
 */
export async function scrapeEnts24() {
  try {
    const response = await fetchWithTimeout('https://www.ents24.com/uk/norwich/events', 8000);
    const html = await response.text();

    const events = [];

    // Extract event items using regex
    const itemRegex = /<article[^>]*class="[^"]*event-item[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    const items = [...html.matchAll(itemRegex)];

    for (const item of items.slice(0, 8)) {
      const itemHtml = item[1];

      // Extract title
      const titleMatch = itemHtml.match(/<h3[^>]*class="[^"]*event-title[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract venue
      const venueMatch = itemHtml.match(/<p[^>]*class="[^"]*event-venue[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
      const venue = venueMatch ? venueMatch[1].trim() : 'Norwich';

      // Extract date
      const dateMatch = itemHtml.match(/<time[^>]*datetime="([^"]+)"[^>]*>/i);
      const date = dateMatch ? parseDate(dateMatch[1]) : parseDate('next week');

      // Extract link
      const linkMatch = itemHtml.match(/<a[^>]*href="([^"]+)"[^>]*class="[^"]*event-link[^"]*"/i);
      const link = linkMatch ? `https://www.ents24.com${linkMatch[1]}` : '';

      // Extract category
      const categoryMatch = itemHtml.match(/<span[^>]*class="[^"]*event-type[^"]*"[^>]*>([^<]+)<\/span>/i);
      const category = categoryMatch ? categoryMatch[1].trim() : 'Music';

      if (title) {
        events.push({
          name: title,
          date: date,
          time: '20:00', // Default time
          location: venue,
          category: category,
          description: `${title} at ${venue}`,
          ticketLink: link,
          price: 'TBC',
          source: 'Ents24',
          vibe: '🎵 Musical',
          crowd: 'Music lovers',
          bestFor: 'Live music'
        });
      }
    }

    return events;

  } catch (error) {
    console.error('Ents24 scraper error:', error.message);
    return [];
  }
}

/**
 * Scrape Theatre Royal Norwich events
 * @returns {Promise<Array>} - Array of event objects
 */
export async function scrapeTheatreRoyal() {
  try {
    const response = await fetchWithTimeout('https://www.theatreroyalnorwich.co.uk/whats-on/', 8000);
    const html = await response.text();

    const events = [];

    // Extract show cards using regex
    const cardRegex = /<div[^>]*class="[^"]*show-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/a>/gi;
    const cards = [...html.matchAll(cardRegex)];

    for (const card of cards.slice(0, 5)) {
      const cardHtml = card[1];

      // Extract title
      const titleMatch = cardHtml.match(/<h3[^>]*class="[^"]*show-title[^"]*"[^>]*>([^<]+)<\/h3>/i);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // Extract date
      const dateMatch = cardHtml.match(/<div[^>]*class="[^"]*show-date[^"]*"[^>]*>([^<]+)<\/div>/i);
      const date = dateMatch ? parseDate(dateMatch[1]) : parseDate('next week');

      // Extract link
      const linkMatch = card[0].match(/<a[^>]*href="([^"]+)"/i);
      const link = linkMatch ? `https://www.theatreroyalnorwich.co.uk${linkMatch[1]}` : '';

      if (title) {
        events.push({
          name: title,
          date: date,
          time: '19:30', // Default theatre time
          location: 'Theatre Royal Norwich',
          category: 'Theatre',
          description: `${title} at Theatre Royal Norwich`,
          ticketLink: link,
          price: 'TBC',
          source: 'Theatre Royal',
          vibe: '🎭 Theatrical',
          crowd: 'Theatre lovers',
          bestFor: 'Theatre'
        });
      }
    }

    return events;

  } catch (error) {
    console.error('Theatre Royal scraper error:', error.message);
    return [];
  }
}
