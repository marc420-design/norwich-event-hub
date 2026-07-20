/**
 * Agent Bridge - Norwich Events Hub
 *
 * Canonical public data flow:
 *   agent API (local dev) -> exports/events.json (production) -> Apps Script fallback
 */

(function () {
  var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  var AGENT_API = 'http://localhost:8000/api/v1';
  var EXPORTS_JSON = 'exports/events.json';
  var USE_AGENT_API = isLocal;
  var USE_EXPORTS = true;
  var CACHE_TTL_MS = 5 * 60 * 1000;

  var CATEGORY_FALLBACKS = {
    nightlife: 'nightlife',
    gigs: 'music',
    music: 'music',
    theatre: 'stage',
    comedy: 'stage',
    markets: 'market',
    food: 'market',
    family: 'family',
    sports: 'sport',
    exhibitions: 'arts',
    culture: 'arts',
    community: 'norwich',
    general: 'norwich'
  };

  function cacheKey(source) {
    return 'neh_cache_' + source;
  }

  function readCache(source) {
    try {
      var raw = sessionStorage.getItem(cacheKey(source));
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (error) {
      return null;
    }
  }

  function writeCache(source, data) {
    try {
      sessionStorage.setItem(cacheKey(source), JSON.stringify({ ts: Date.now(), data: data }));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    try {
      var parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch (error) {
      return '';
    }
    return '';
  }

  function getCategoryFallbackKey(category) {
    return CATEGORY_FALLBACKS[(category || 'general').toLowerCase()] || 'norwich';
  }

  function chooseBestEventUrl(event) {
    return sanitizeUrl(
      event.primaryUrl ||
      event.ticketLink ||
      event.ticketlink ||
      event.ticket_url ||
      event.officialUrl ||
      event.official_url ||
      event.sourceUrl ||
      event.source_url
    );
  }

  function chooseBestImage(event) {
    var explicit = sanitizeUrl(
      event.image ||
      event.image_url ||
      event.imageUrl ||
      (Array.isArray(event.images) ? event.images[0] : '')
    );

    if (explicit) {
      return explicit;
    }

    return '';
  }

  function formatPrice(event) {
    if (event.price) return String(event.price);
    if (event.isFree || event.is_free) return 'Free';
    if (event.price_min !== undefined && event.price_min !== null) {
      if (event.price_max !== undefined && event.price_max !== null && event.price_max !== event.price_min) {
        return '£' + event.price_min + '-£' + event.price_max;
      }
      return '£' + event.price_min;
    }
    return '';
  }

  function normaliseSingle(event) {
    var name = event.name || event.title || event.eventname || '';
    var date = event.date || event.eventdate || (event.start_datetime ? String(event.start_datetime).slice(0, 10) : '');
    var time = event.time || (event.start_datetime ? String(event.start_datetime).slice(11, 16) : '');
    var endTime = event.endTime || event.end_time || (event.end_datetime ? String(event.end_datetime).slice(11, 16) : '');
    var venue = event.venue || event.venue_name || event.location || '';
    var category = (event.category || 'general').toLowerCase();
    var sourceUrl = sanitizeUrl(event.sourceUrl || event.source_url || '');
    var ticketLink = sanitizeUrl(event.ticketLink || event.ticketlink || event.ticket_url || '');
    var officialUrl = sanitizeUrl(event.officialUrl || event.official_url || '');
    var primaryUrl = chooseBestEventUrl({
      primaryUrl: event.primaryUrl,
      ticketLink: ticketLink,
      officialUrl: officialUrl,
      sourceUrl: sourceUrl
    });
    var image = chooseBestImage(event);
    var id = event.id != null ? String(event.id) : '';
    var slug = event.slug || (name && date ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + date : id);

    return {
      id: id,
      slug: slug,
      fingerprint: event.fingerprint || [name.trim().toLowerCase(), date, venue.trim().toLowerCase()].join('|'),
      name: name,
      eventname: name,
      date: date,
      time: time || 'Time TBC',
      endTime: endTime || '',
      venue: venue,
      location: venue,
      address: event.address || '',
      category: category,
      description: event.description || '',
      price: formatPrice(event),
      image: image,
      imageFallback: getCategoryFallbackKey(category),
      hasFlyer: Boolean(event.hasFlyer || image),
      imageStatus: event.imageStatus || (image ? 'available' : 'fallback'),
      ticketLink: ticketLink,
      ticketlink: ticketLink,
      officialUrl: officialUrl,
      sourceUrl: sourceUrl,
      primaryUrl: primaryUrl,
      linkStatus: event.linkStatus || (primaryUrl ? 'verified' : 'missing'),
      featured: Boolean(event.featured),
      editorsChoice: Boolean(event.editorsChoice || event.editors_choice),
      status: String(event.status || 'approved').toLowerCase(),
      source: event.source || event.source_name || '',
      tags: Array.isArray(event.tags) ? event.tags : [],
      isFree: Boolean(event.isFree || event.is_free),
      ageRestriction: event.ageRestriction || event.age_restriction || ''
    };
  }

  function normaliseAll(events) {
    var seen = new Set();

    return (events || [])
      .filter(function (event) {
        return event && (event.name || event.title || event.eventname);
      })
      .map(normaliseSingle)
      .filter(function (event) {
        if (event.status !== 'approved') return false;
        if (!event.date || !event.name || !event.primaryUrl) return false;
        if (seen.has(event.fingerprint)) return false;
        seen.add(event.fingerprint);
        return true;
      });
  }

  function fetchJSON(url, timeout) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var timer = setTimeout(function () {
        xhr.abort();
        reject(new Error('timeout'));
      }, timeout || 8000);

      xhr.open('GET', url);
      xhr.onload = function () {
        clearTimeout(timer);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (error) {
            reject(error);
          }
          return;
        }

        reject(new Error('HTTP ' + xhr.status));
      };
      xhr.onerror = function () {
        clearTimeout(timer);
        reject(new Error('network error'));
      };
      xhr.send();
    });
  }

  async function tryAgentApi() {
    var cached = readCache('agent');
    if (cached) return cached;

    var data = await fetchJSON(AGENT_API + '/events/?status=approved&limit=500', 10000);
    var events = normaliseAll(Array.isArray(data) ? data : (data.events || []));
    writeCache('agent', events);
    return events;
  }

  async function tryExportsJson() {
    var cached = readCache('exports');
    if (cached) return cached;

    var data = await fetchJSON(EXPORTS_JSON, 8000);
    if (data && data.generated_at) {
      window.eventsLastUpdated = data.generated_at;
      window.dispatchEvent(new CustomEvent('eventsMetadata', {
        detail: {
          generated_at: data.generated_at,
          count: data.count || 0,
          source: 'exports'
        }
      }));
    }

    var events = normaliseAll(Array.isArray(data) ? data : (data.events || []));
    writeCache('exports', events);
    return events;
  }

  async function tryGoogleSheets() {
    if (typeof window.APP_CONFIG === 'undefined') return [];
    var url = window.APP_CONFIG.GOOGLE_APPS_SCRIPT_URL;
    if (!url || url.indexOf('YOUR_') !== -1) return [];

    var data = await fetchJSON(url + '?action=getApprovedEvents', 12000);
    if (data && data.success && data.events) {
      return normaliseAll(data.events);
    }

    return [];
  }

  var resolveLoaded;
  var rejectLoaded;
  window.eventsLoadedPromise = new Promise(function (resolve, reject) {
    resolveLoaded = resolve;
    rejectLoaded = reject;
  });

  window.getPublicEvents = async function () {
    if (Array.isArray(window.eventsData) && window.eventsData.length) {
      return window.eventsData.slice();
    }

    try {
      var loaded = await window.eventsLoadedPromise;
      return Array.isArray(loaded) ? loaded.slice() : [];
    } catch (error) {
      return Array.isArray(window.eventsData) ? window.eventsData.slice() : [];
    }
  };
  window.chooseBestEventUrl = chooseBestEventUrl;
  window.chooseBestImage = chooseBestImage;
  window.getCategoryFallbackKey = getCategoryFallbackKey;

  async function loadEvents() {
    var events = [];
    var source = 'none';

    if (USE_AGENT_API) {
      try {
        events = await tryAgentApi();
        source = events.length ? 'agent-api' : source;
      } catch (error) {
        console.warn('[AgentBridge] Agent API unavailable:', error.message);
      }
    }

    if (!events.length && USE_EXPORTS) {
      try {
        events = await tryExportsJson();
        source = events.length ? 'exports' : source;
      } catch (error) {
        console.warn('[AgentBridge] exports/events.json unavailable:', error.message);
      }
    }

    if (!events.length) {
      try {
        events = await tryGoogleSheets();
        source = events.length ? 'google-sheets' : source;
      } catch (error) {
        console.warn('[AgentBridge] Google Sheets unavailable:', error.message);
      }
    }

    window.eventsData = events;
    window.dispatchEvent(new CustomEvent('eventsLoaded', {
      detail: {
        count: events.length,
        source: source
      }
    }));

    resolveLoaded(events);

  }

  loadEvents().catch(function (error) {
    console.error('[AgentBridge] Fatal error:', error);
    window.eventsData = [];
    window.dispatchEvent(new CustomEvent('eventsLoadError', {
      detail: {
        message: 'We’re having trouble loading events right now. Please try again shortly.',
        source: 'bridge',
        willRetry: false
      }
    }));
    rejectLoaded(error);
  });
})();
