/**
 * Cloudflare Pages Function - Event Scraping Endpoint
 * Orchestrates parallel scraping from multiple sources
 */

import { corsHeaders, handleCORS } from './_lib/cors.js';
import { scrapeSkiddle, scrapeEnts24, scrapeTheatreRoyal } from './_lib/scrapers.js';

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * Handle POST requests - Main scraping endpoint
 */
export async function onRequestPost(context) {
  const startTime = Date.now();

  try {
    // Create timeout promise (25 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Overall timeout exceeded')), 25000);
    });

    // Run all scrapers in parallel
    const scrapingPromise = Promise.allSettled([
      scrapeSkiddle(),
      scrapeEnts24(),
      scrapeTheatreRoyal()
    ]);

    // Race between scraping and timeout
    let results;
    try {
      results = await Promise.race([scrapingPromise, timeoutPromise]);
    } catch (error) {
      // Timeout occurred, return what we have so far
      console.error('Timeout occurred, returning partial results');
      results = await scrapingPromise; // Get whatever completed
    }

    // Process results
    const allEvents = [];
    const stats = {
      total: 0,
      bySource: {
        Skiddle: 0,
        Ents24: 0,
        'Theatre Royal': 0
      },
      errors: [],
      duration: 0
    };

    // Extract events from successful scrapes
    results.forEach((result, index) => {
      const sources = ['Skiddle', 'Ents24', 'Theatre Royal'];
      const sourceName = sources[index];

      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        const events = result.value;
        allEvents.push(...events);
        stats.bySource[sourceName] = events.length;
      } else if (result.status === 'rejected') {
        stats.errors.push({
          source: sourceName,
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    // Calculate stats
    stats.total = allEvents.length;
    stats.duration = Date.now() - startTime;

    // Remove duplicates (by name + date)
    const uniqueEvents = [];
    const seen = new Set();

    for (const event of allEvents) {
      const key = `${event.name.toLowerCase()}_${event.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEvents.push(event);
      }
    }

    stats.total = uniqueEvents.length;

    // Sort by date (earliest first)
    uniqueEvents.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // Return response
    return new Response(JSON.stringify({
      success: true,
      events: uniqueEvents,
      stats: stats,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Scraping endpoint error:', error);

    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Failed to scrape events',
      events: [],
      stats: {
        total: 0,
        errors: [error.message],
        duration: Date.now() - startTime
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}
