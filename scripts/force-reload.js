// Force reload events data - clears cache and reloads
(function() {
    // Clear old localStorage
    localStorage.removeItem('norwichEvents');

    // Force reload events immediately
    async function forceLoadEvents() {
        try {
            const response = await fetch('data/sample-events.json?t=' + Date.now());
            const data = await response.json();

            if (data && data.events) {
                // Set global eventsData
                window.eventsData = data.events;

                // Save to localStorage
                localStorage.setItem('norwichEvents', JSON.stringify(data.events));

                console.log(`✅ Loaded ${data.events.length} events from JSON`);

                // Trigger event to notify other scripts
                window.dispatchEvent(new CustomEvent('eventsLoaded', {
                    detail: { count: data.events.length }
                }));

                return data.events;
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        }
        return [];
    }

    // Load immediately
    window.eventsLoadedPromise = forceLoadEvents();
})();
