// Force reload events data - clears cache and reloads
// Initialize window.eventsData immediately
window.eventsData = window.eventsData || [];

// Clear old localStorage on page load to force fresh data
localStorage.removeItem('norwichEvents');

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
    // Wait for config to be available (max 2 seconds)
    await new Promise(resolve => {
        if (typeof APP_CONFIG !== 'undefined') {
            resolve();
            return;
        }

        let attempts = 0;
        const maxAttempts = 20; // 20 attempts * 100ms = 2 seconds max

        const checkConfig = setInterval(() => {
            attempts++;
            if (typeof APP_CONFIG !== 'undefined') {
                clearInterval(checkConfig);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkConfig);
                console.warn('⚠️ Config not loaded after 2s, using defaults');
                resolve();
            }
        }, 100);
    });

    // FORCE LOCAL STORAGE MODE - Always use local JSON until explicitly configured otherwise
    const config = { USE_LOCAL_STORAGE: true };

    // Try Google Sheets API first if not using local storage
    if (!config.USE_LOCAL_STORAGE && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.GOOGLE_APPS_SCRIPT_URL &&
        APP_CONFIG.GOOGLE_APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {

        try {
            console.log('🔄 Loading events from Google Sheets API...');
            const cacheBuster = Date.now();
            const apiUrl = config.GOOGLE_APPS_SCRIPT_URL + '?action=getEvents&t=' + cacheBuster;

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
                // Set global eventsData (even if empty array)
                window.eventsData = result.events || [];

                // Save to localStorage for offline access
                localStorage.setItem('norwichEvents', JSON.stringify(result.events || []));

                if (result.events.length > 0) {
                    console.log(`✅ Loaded ${result.events.length} events from Google Sheets API`);
                    console.log(`📊 Sample event:`, result.events[0]);
                    console.log(`🕐 Last updated:`, result.lastUpdated || 'N/A');
                } else {
                    console.warn('⚠️ API returned success but no events');
                }

                // Trigger event to notify other scripts (even if empty)
                window.dispatchEvent(new CustomEvent('eventsLoaded', {
                    detail: {
                        count: result.events.length || 0,
                        source: 'api',
                        lastUpdated: result.lastUpdated,
                        success: true
                    }
                }));

                // If no events, try fallback but don't wait for it
                if (result.events.length === 0) {
                    console.warn('⚠️ API returned no events, trying local JSON fallback...');
                    loadFromLocalJSON().catch(err => {
                        console.error('Fallback also failed:', err);
                        // Trigger error event
                        window.dispatchEvent(new CustomEvent('eventsLoadError', {
                            detail: {
                                message: 'No events available. Please try again later or submit an event.',
                                source: 'api'
                            }
                        }));
                    });
                }

                return result.events || [];
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
        // Use local JSON file
        console.log('🔄 Using local storage mode...');
        return await loadFromLocalJSON();
    }
}

// Fallback function to load from local JSON file
async function loadFromLocalJSON() {
    try {
        console.log('📁 Loading events from local JSON file...');
        // Aggressive cache busting with multiple parameters
        const cacheBuster = Date.now() + Math.random();
        const jsonUrl = 'data/sample-events.json?v=' + cacheBuster + '&nocache=' + Date.now();
        
        // Use fetchWithTimeout for local JSON as well
        const response = await fetchWithTimeout(jsonUrl, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        }, 5000); // 5 second timeout for local file

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.events) {
            // Set global eventsData
            window.eventsData = data.events || [];

            // Save to localStorage
            localStorage.setItem('norwichEvents', JSON.stringify(data.events || []));

            if (data.events.length > 0) {
                console.log(`✅ Loaded ${data.events.length} events from local JSON`);
                console.log(`📊 Sample event:`, data.events[0]);
            } else {
                console.warn('⚠️ Local JSON contains no events');
            }

            // Trigger event to notify other scripts
            window.dispatchEvent(new CustomEvent('eventsLoaded', {
                detail: {
                    count: data.events.length || 0,
                    source: 'local',
                    success: true
                }
            }));

            return data.events || [];
        } else {
            console.error('❌ No events in JSON data');
            window.dispatchEvent(new CustomEvent('eventsLoadError', {
                detail: {
                    message: 'No events found in data file',
                    source: 'local'
                }
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

// Auto-refresh events once a day for AI updates
function setupAutoRefresh() {
    const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours (once a day)

    setInterval(async () => {
        const config = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { USE_LOCAL_STORAGE: true };

        // Only auto-refresh if using Google Sheets (not local storage)
        if (!config.USE_LOCAL_STORAGE && config.GOOGLE_APPS_SCRIPT_URL) {
            console.log('🔄 Auto-refreshing events from Google Sheets...');

            try {
                const cacheBuster = Date.now();
                const apiUrl = config.GOOGLE_APPS_SCRIPT_URL + '?action=getEvents&t=' + cacheBuster;

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
    console.log('🔄 Auto-refresh enabled (checks once per day)');
});
// Force CDN cache clear Mon, Dec 29, 2025 11:02:31 PM
