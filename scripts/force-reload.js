// Force reload events data - clears cache and reloads
// Initialize window.eventsData immediately
window.eventsData = window.eventsData || [];

// Clear old localStorage on page load to force fresh data
localStorage.removeItem('norwichEvents');

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

    const config = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { USE_LOCAL_STORAGE: true };

    // Try Google Sheets API first if not using local storage
    if (!config.USE_LOCAL_STORAGE && config.GOOGLE_APPS_SCRIPT_URL &&
        config.GOOGLE_APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {

        try {
            console.log('🔄 Loading events from Google Sheets API...');
            const cacheBuster = Date.now();
            const apiUrl = config.GOOGLE_APPS_SCRIPT_URL + '?action=getEvents&t=' + cacheBuster;

            const response = await fetch(apiUrl, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.events && result.events.length > 0) {
                // Set global eventsData
                window.eventsData = result.events;

                // Save to localStorage for offline access
                localStorage.setItem('norwichEvents', JSON.stringify(result.events));

                console.log(`✅ Loaded ${result.events.length} events from Google Sheets API`);
                console.log(`📊 Sample event:`, result.events[0]);
                console.log(`🕐 Last updated:`, result.lastUpdated || 'N/A');

                // Trigger event to notify other scripts
                window.dispatchEvent(new CustomEvent('eventsLoaded', {
                    detail: {
                        count: result.events.length,
                        source: 'api',
                        lastUpdated: result.lastUpdated
                    }
                }));

                return result.events;
            } else {
                console.warn('⚠️ API returned no events, falling back to local JSON');
                return await loadFromLocalJSON();
            }
        } catch (error) {
            console.error('❌ Failed to load from Google Sheets API:', error);
            console.log('⚠️ Falling back to local JSON file...');
            return await loadFromLocalJSON();
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
        const response = await fetch('data/sample-events.json?v=' + cacheBuster + '&nocache=' + Date.now(), {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.events) {
            // Set global eventsData
            window.eventsData = data.events;

            // Save to localStorage
            localStorage.setItem('norwichEvents', JSON.stringify(data.events));

            console.log(`✅ Loaded ${data.events.length} events from local JSON`);
            console.log(`📊 Sample event:`, data.events[0]);

            // Trigger event to notify other scripts
            window.dispatchEvent(new CustomEvent('eventsLoaded', {
                detail: {
                    count: data.events.length,
                    source: 'local'
                }
            }));

            return data.events;
        } else {
            console.error('❌ No events in JSON data');
            return [];
        }
    } catch (error) {
        console.error('❌ Failed to load events from local JSON:', error);
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

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                    }
                });

                if (response.ok) {
                    const result = await response.json();

                    if (result.success && result.events) {
                        const oldCount = window.eventsData?.length || 0;
                        const newCount = result.events.length;

                        if (newCount !== oldCount) {
                            window.eventsData = result.events;
                            localStorage.setItem('norwichEvents', JSON.stringify(result.events));

                            console.log(`✨ New events detected! ${oldCount} → ${newCount}`);

                            // Trigger event to notify other scripts
                            window.dispatchEvent(new CustomEvent('eventsUpdated', {
                                detail: {
                                    oldCount,
                                    newCount,
                                    source: 'auto-refresh'
                                }
                            }));

                            // Show notification to user
                            showUpdateNotification(newCount - oldCount);
                        } else {
                            console.log('✅ Events up to date');
                        }
                    }
                }
            } catch (error) {
                console.error('Auto-refresh error:', error);
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
