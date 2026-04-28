/**
 * Agent Bridge — Norwich Events Hub
 *
 * Fetches real-time event data from either:
 *   1. The local Agent API  (http://localhost:8000/api/v1)
 *   2. The exported events.json  (exports/events.json)
 *   3. Google Apps Script (existing fallback)
 *
 * Normalises ALL sources into the window.eventsData format that
 * home.js / today.js / directory.js already consume.
 *
 * Add to your HTML BEFORE main.js / home.js:
 *   <script src="scripts/agent-bridge.js"></script>
 */

(function () {
  // ──────────────────────────────────────────────────────────────
  // Configuration – edit these to match your deployment
  // ──────────────────────────────────────────────────────────────
  var isLocal        = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  var AGENT_API      = 'http://localhost:8000/api/v1';   // local dev
  var EXPORTS_JSON   = 'exports/events.json';             // static export (Mode A) - No leading slash for relative path
  var USE_AGENT_API  = isLocal;   // ONLY use local API if on localhost to prevent production CSP errors
  var USE_EXPORTS    = true;   // set false to skip static JSON
  var CACHE_TTL_MS   = 5 * 60 * 1000; // 5 minutes client-side cache

  // ──────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────
  function normaliseSingle(e) {
    // Accept both agent API format and legacy Google Sheets format
    var name  = e.name || e.title || e.eventname || '';
    var date  = e.date || e.eventdate || '';
    var time  = e.time || (e.start_datetime ? e.start_datetime.slice(11,16) : '');
    var loc   = e.location || e.venue_name || e.venue || '';
    var cat   = (e.category || 'general').toLowerCase();
    var price = e.price;

    if (!price) {
      if (e.is_free) {
        price = 'Free';
      } else if (e.price_min !== undefined && e.price_min !== null) {
        price = e.price_max && e.price_max !== e.price_min
          ? '£' + e.price_min + '–£' + e.price_max
          : '£' + e.price_min;
      } else {
        price = 'See website';
      }
    }

    // Normalise date to YYYY-MM-DD
    if (date && date.length > 10) date = date.slice(0, 10);

    return {
      id:          e.id || '',
      name:        name,
      eventname:   name,   // legacy compat
      date:        date,
      time:        time || 'TBA',
      location:    loc,
      venue:       loc,    // legacy compat
      category:    cat,
      description: e.description || '',
      ticketLink:  e.ticketLink || e.ticket_url || '',
      ticketlink:  e.ticketLink || e.ticket_url || '',   // legacy compat
      price:       price,
      image:       e.image || (Array.isArray(e.images) ? e.images[0] : '') || '',
      featured:    !!(e.featured),
      editorsChoice: !!(e.editorsChoice || e.editors_choice),
      status:      (e.status || 'approved').toLowerCase(),
      source:      e.source || e.source_name || '',
      tags:        Array.isArray(e.tags) ? e.tags : [],
    };
  }

  function normaliseAll(arr) {
    return (arr || [])
      .filter(function(e) { return e && (e.name || e.title || e.eventname); })
      .map(normaliseSingle)
      .filter(function(e) { return e.status === 'approved'; });
  }

  // ──────────────────────────────────────────────────────────────
  // Cache
  // ──────────────────────────────────────────────────────────────
  function cacheKey(source) { return 'neh_cache_' + source; }

  function readCache(source) {
    try {
      var raw = sessionStorage.getItem(cacheKey(source));
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.ts > CACHE_TTL_MS) return null;
      return obj.data;
    } catch (e) { return null; }
  }

  function writeCache(source, data) {
    try {
      sessionStorage.setItem(cacheKey(source), JSON.stringify({ts: Date.now(), data: data}));
    } catch (e) {}
  }

  // ──────────────────────────────────────────────────────────────
  // Fetchers
  // ──────────────────────────────────────────────────────────────
  function fetchJSON(url, timeout) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      var timer = setTimeout(function() { xhr.abort(); reject(new Error('timeout')); }, timeout || 8000);
      xhr.open('GET', url);
      xhr.onload = function() {
        clearTimeout(timer);
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch(e) { reject(e); }
        } else { reject(new Error('HTTP ' + xhr.status)); }
      };
      xhr.onerror = function() { clearTimeout(timer); reject(new Error('network error')); };
      xhr.send();
    });
  }

  async function tryAgentApi() {
    var cached = readCache('agent');
    if (cached) return cached;
    var data = await fetchJSON(AGENT_API + '/events/?status=approved&limit=500', 10000);
    var events = normaliseAll(Array.isArray(data) ? data : (data.events || []));
    if (events.length) writeCache('agent', events);
    return events;
  }

  async function tryExportsJson() {
    var cached = readCache('exports');
    if (cached) return cached;
    var data = await fetchJSON(EXPORTS_JSON, 8000);
    // Capture freshness metadata and broadcast to any listening UI components
    if (data && data.generated_at) {
      window.eventsLastUpdated = data.generated_at;
      window.dispatchEvent(new CustomEvent('eventsMetadata', {
        detail: { generated_at: data.generated_at, source: 'static-json' }
      }));
    }
    var events = normaliseAll(Array.isArray(data) ? data : (data.events || []));
    if (events.length) writeCache('exports', events);
    return events;
  }

  async function tryGoogleSheets() {
    if (typeof window.APP_CONFIG === 'undefined') return [];
    var url = window.APP_CONFIG.GOOGLE_APPS_SCRIPT_URL;
    if (!url || url.includes('YOUR_')) return [];
    var data = await fetchJSON(url + '?action=getApprovedEvents', 12000);
    if (data && data.success && data.events) {
      return normaliseAll(data.events);
    }
    return [];
  }

  // ──────────────────────────────────────────────────────────────
  // Main loader — resolves the promise the website waits on
  // ──────────────────────────────────────────────────────────────
  var resolveLoaded, rejectLoaded;
  window.eventsLoadedPromise = new Promise(function(res, rej) {
    resolveLoaded = res;
    rejectLoaded  = rej;
  });

  async function loadEvents() {
    var events = [];

    // 1. Try Agent API (real-time)
    if (USE_AGENT_API) {
      try {
        events = await tryAgentApi();
        if (events.length) {
          console.log('[AgentBridge] Loaded ' + events.length + ' events from Agent API');
        }
      } catch (e) {
        console.warn('[AgentBridge] Agent API unavailable:', e.message);
      }
    }

    // 2. Try static JSON export
    if (!events.length && USE_EXPORTS) {
      try {
        events = await tryExportsJson();
        if (events.length) {
          console.log('[AgentBridge] Loaded ' + events.length + ' events from exports/events.json');
        }
      } catch (e) {
        console.warn('[AgentBridge] exports/events.json unavailable:', e.message);
      }
    }

    // 3. Fallback to Google Sheets (existing system)
    if (!events.length) {
      try {
        events = await tryGoogleSheets();
        if (events.length) {
          console.log('[AgentBridge] Loaded ' + events.length + ' events from Google Sheets');
        }
      } catch (e) {
        console.warn('[AgentBridge] Google Sheets unavailable:', e.message);
      }
    }

    window.eventsData = events;
    window.dispatchEvent(new CustomEvent('eventsLoaded', {detail: {count: events.length}}));
    resolveLoaded(events);

    if (!events.length) {
      console.warn('[AgentBridge] No events found from any source');
      window.dispatchEvent(new CustomEvent('eventsLoadError', {detail: {message: 'No events available'}}));
    }
  }

  // Start loading immediately
  loadEvents().catch(function(e) {
    console.error('[AgentBridge] Fatal error:', e);
    window.eventsData = [];
    rejectLoaded(e);
  });

})();
