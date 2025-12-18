// Force reload events data - clears cache and reloads
// Initialize window.eventsData immediately
window.eventsData = window.eventsData || [];

// Clear old localStorage
localStorage.removeItem('norwichEvents');

// Force reload events immediately with aggressive cache busting
async function forceLoadEvents() {
    try {
        console.log('🔄 Loading events from JSON...');
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

            console.log(`✅ Loaded ${data.events.length} events from JSON`);
            console.log(`📊 Sample event:`, data.events[0]);

            // Trigger event to notify other scripts
            window.dispatchEvent(new CustomEvent('eventsLoaded', {
                detail: { count: data.events.length }
            }));

            return data.events;
        } else {
            console.error('❌ No events in JSON data');
            return [];
        }
    } catch (error) {
        console.error('❌ Failed to load events:', error);
        return [];
    }
}

// Load immediately and make promise available
window.eventsLoadedPromise = forceLoadEvents();
