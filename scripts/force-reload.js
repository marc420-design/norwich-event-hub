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

// Load immediately and make promise available
window.eventsLoadedPromise = forceLoadEvents();
