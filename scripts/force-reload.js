// Force reload events data - with smart caching
// Initialize window.eventsData immediately
window.eventsData = window.eventsData || [];

// Smart cache management: Only clear if cache is older than 1 hour
const CACHE_TTL = 3600000; // 1 hour in milliseconds
const cachedTimestamp = localStorage.getItem('norwichEvents_timestamp');
const cacheAge = cachedTimestamp ? Date.now() - parseInt(cachedTimestamp) : CACHE_TTL + 1;

if (cacheAge > CACHE_TTL) {
    console.log('🗑️ Cache expired, clearing old data');
    localStorage.removeItem('norwichEvents');
    localStorage.removeItem('norwichEvents_timestamp');
} else {
    console.log(`✅ Cache still valid (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
}

// Helper function to add timeout to fetch requests
function fetchWithTimeout(url, options = {}, timeout = 10000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout: API did not respond within 10 seconds')), timeout)
        )
    ]);
}

// Force reload events from Google Sheets API or fallback to local JSON
async function forceLoadEvents() {
    // FIXED: Don't pre-load local JSON - prioritize API data for real-time updates
    // Only use local JSON if API genuinely fails

    // Wait for config to be available (max 1 second - reduced from 2)
    await new Promise(resolve => {
        if (typeof APP_CONFIG !== 'undefined') {
            resolve();
            return;
        }

        let attempts = 0;
        const maxAttempts = 10; // 10 attempts * 100ms = 1 second max

        const checkConfig = setInterval(() => {
            attempts++;
            if (typeof APP_CONFIG !== 'undefined') {
                clearInterval(checkConfig);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkConfig);
                console.warn('⚠️ Config not loaded after 1s, using defaults');
                resolve();
            }
        }, 100);
    });

    // Use APP_CONFIG if available, otherwise default to local storage mode
    const config = {
        USE_LOCAL_STORAGE: typeof APP_CONFIG !== 'undefined' && APP_CONFIG.USE_LOCAL_STORAGE !== undefined
            ? APP_CONFIG.USE_LOCAL_STORAGE
            : true,
        GOOGLE_APPS_SCRIPT_URL: typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.GOOGLE_APPS_SCRIPT_URL : null
    };

    // Try Google Sheets API first if not using local storage
    if (!config.USE_LOCAL_STORAGE && config.GOOGLE_APPS_SCRIPT_URL &&
        APP_CONFIG.GOOGLE_APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {

        try {
            console.log('🔄 Loading events from Google Sheets API...');
            const cacheBuster = Date.now();
            const apiUrl = config.GOOGLE_APPS_SCRIPT_URL + '?t=' + cacheBuster;

            // Use fetchWithTimeout to prevent hanging
            const response = await fetchWithTimeout(apiUrl, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            }, 10000); // 10 second timeout

            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.events) {
                // Filter to only approved future events from the API
                const apiEvents = filterApprovedFutureEvents(result.events || []);

                // If the API returned events but none are approved future events,
                // fall back to scraper exports which have real data
                if (apiEvents.length === 0 && (result.events || []).length > 0) {
                    console.warn('⚠️ API returned events but none are approved future events, trying exports...');
                    return await loadFromLocalJSON();
                }

                window.eventsData = apiEvents;

                localStorage.setItem('norwichEvents', JSON.stringify(apiEvents));
                localStorage.setItem('norwichEvents_timestamp', Date.now().toString());

                if (apiEvents.length > 0) {
                    console.log(`✅ Loaded ${apiEvents.length} approved future events from Google Sheets API`);
                    console.log(`🕐 Last updated:`, result.lastUpdated || 'N/A');
                } else {
                    console.warn('⚠️ API returned success but no approved future events — trying fallback');
                    return await loadFromLocalJSON();
                }

                window.dispatchEvent(new CustomEvent('eventsLoaded', {
                    detail: {
                        count: apiEvents.length,
                        source: 'api',
                        lastUpdated: result.lastUpdated,
                        success: true
                    }
                }));

                return apiEvents;
            } else {
                console.warn('⚠️ API returned unexpected format, falling back to local JSON');
                return await loadFromLocalJSON();
            }
        } catch (error) {
            console.error('❌ Failed to load from Google Sheets API:', error);
            console.log('⚠️ Falling back to local JSON file...');

            // Trigger error event for UI to handle
            window.dispatchEvent(new CustomEvent('eventsLoadError', {
                detail: {
                    message: error.message || 'Failed to load events from server',
                    source: 'api',
                    willRetry: true
                }
            }));

            try {
                return await loadFromLocalJSON();
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
                // Trigger final error event
                window.dispatchEvent(new CustomEvent('eventsLoadError', {
                    detail: {
                        message: 'Unable to load events. Please check your connection and try again.',
                        source: 'both',
                        willRetry: false
                    }
                }));
                return [];
            }
        }
    } else {
        // FIXED: Only use local JSON if USE_LOCAL_STORAGE is explicitly true
        // This is for development/offline mode only
        console.log('🔄 Using local storage mode (development/offline only)...');
        console.warn('⚠️ Real-time data disabled - enable by setting USE_LOCAL_STORAGE: false in config.js');
        return await loadFromLocalJSON();
    }
}

// Filter events to only show approved future events
function filterApprovedFutureEvents(events) {
    const todayStr = new Date().toISOString().split('T')[0];
    return events.filter(e => {
        const status = (e.status || '').toLowerCase();
        const dateStr = e.date ? String(e.date).substring(0, 10) : '';
        return status === 'approved' && dateStr >= todayStr;
    });
}

// Load from scraper exports (exports/events.json — real scraped future events)
async function loadFromExports() {
    try {
        console.log('📦 Loading events from scraper exports...');
        const cacheBuster = Date.now();
        const response = await fetchWithTimeout(
            'exports/events.json?v=' + cacheBuster,
            { cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } },
            5000
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const rawEvents = data.events || [];
        const events = filterApprovedFutureEvents(rawEvents);

        window.eventsData = events;
        localStorage.setItem('norwichEvents', JSON.stringify(events));
        localStorage.setItem('norwichEvents_timestamp', Date.now().toString());

        console.log(`✅ Loaded ${events.length} approved future events from exports (${rawEvents.length} raw)`);

        window.dispatchEvent(new CustomEvent('eventsLoaded', {
            detail: { count: events.length, source: 'exports', success: true }
        }));

        return events;
    } catch (error) {
        console.error('❌ Failed to load from exports:', error);
        return null; // null signals caller to try next fallback
    }
}

// Fallback function to load from local JSON file
async function loadFromLocalJSON() {
    // First try the scraper exports which have real future events
    const exportsEvents = await loadFromExports();
    if (exportsEvents !== null) return exportsEvents;

    try {
        console.log('📁 Loading events from local JSON file...');
        const cacheBuster = Date.now() + Math.random();
        const jsonUrl = 'data/sample-events.json?v=' + cacheBuster + '&nocache=' + Date.now();

        const response = await fetchWithTimeout(jsonUrl, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }, 2000);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.events) {
            const events = filterApprovedFutureEvents(data.events);
            window.eventsData = events;

            localStorage.setItem('norwichEvents', JSON.stringify(events));
            localStorage.setItem('norwichEvents_timestamp', Date.now().toString());

            console.log(`✅ Loaded ${events.length} events from local JSON`);

            window.dispatchEvent(new CustomEvent('eventsLoaded', {
                detail: { count: events.length, source: 'local', success: true }
            }));

            return events;
        } else {
            console.error('❌ No events in JSON data');
            window.dispatchEvent(new CustomEvent('eventsLoadError', {
                detail: { message: 'No events found in data file', source: 'local' }
            }));
            return [];
        }
    } catch (error) {
        console.error('❌ Failed to load events from local JSON:', error);
        window.dispatchEvent(new CustomEvent('eventsLoadError', {
            detail: {
                message: error.message || 'Failed to load events from local file',
                source: 'local'
            }
        }));
        return [];
    }
}

// Auto-refresh events every 5 minutes for real-time AI updates
function setupAutoRefresh() {
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes for real-time updates

    setInterval(async () => {
        const config = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { USE_LOCAL_STORAGE: true };

        // Only auto-refresh if using Google Sheets (not local storage)
        if (!config.USE_LOCAL_STORAGE && config.GOOGLE_APPS_SCRIPT_URL) {
            console.log('🔄 Auto-refreshing events from Google Sheets...');

            try {
                const cacheBuster = Date.now();
                const apiUrl = config.GOOGLE_APPS_SCRIPT_URL + '?t=' + cacheBuster;

                // Use fetchWithTimeout for auto-refresh as well
                const response = await fetchWithTimeout(apiUrl, {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                    }
                }, 10000); // 10 second timeout

                if (response.ok) {
                    const result = await response.json();

                    if (result.success && result.events) {
                        const oldCount = window.eventsData?.length || 0;
                        const newCount = result.events.length || 0;

                        if (newCount !== oldCount) {
                            window.eventsData = result.events || [];
                            localStorage.setItem('norwichEvents', JSON.stringify(result.events || []));
                            localStorage.setItem('norwichEvents_timestamp', Date.now().toString());

                            console.log(`✨ New events detected! ${oldCount} → ${newCount}`);

                            // Trigger event to notify other scripts
                            window.dispatchEvent(new CustomEvent('eventsUpdated', {
                                detail: {
                                    oldCount,
                                    newCount,
                                    source: 'auto-refresh'
                                }
                            }));

                            // Show notification to user only if there are new events
                            if (newCount > oldCount) {
                                showUpdateNotification(newCount - oldCount);
                            }
                        } else {
                            console.log('✅ Events up to date');
                        }
                    }
                }
            } catch (error) {
                console.error('Auto-refresh error:', error);
                // Don't show error to user for background refresh failures
            }
        }
    }, REFRESH_INTERVAL);
}

// Show notification when new events are available
function showUpdateNotification(difference) {
    // Only show if there are new events
    if (difference <= 0) return;

    // Create notification banner
    const notification = document.createElement('div');
    notification.id = 'event-update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--color-electric-blue, #3AB8FF), var(--color-forest-green, #2B7A47));
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        cursor: pointer;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;

    notification.innerHTML = `
        <strong>🎉 ${difference} New Event${difference > 1 ? 's' : ''} Available!</strong>
        <p style="margin: 8px 0 0 0; font-size: 14px;">Click to refresh the page</p>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    notification.onclick = () => {
        window.location.reload();
    };

    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 10000);
}

// Load immediately and make promise available
window.eventsLoadedPromise = forceLoadEvents();

// Set up auto-refresh after initial load
window.eventsLoadedPromise.then(() => {
    setupAutoRefresh();
    console.log('🔄 Auto-refresh enabled (checks every 5 minutes for real-time updates)');
});
// Force CDN cache clear Mon, Dec 29, 2025 11:02:31 PM
