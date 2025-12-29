// Homepage JavaScript - Load featured events

document.addEventListener('DOMContentLoaded', async function() {
    // Load featured events
    await loadFeaturedEvents();
    
    // Initialize events from API if available
    if (typeof initializeEvents !== 'undefined') {
        await initializeEvents();
    }
});

async function loadFeaturedEvents() {
    const featuredContainer = document.getElementById('featuredEvents');
    if (!featuredContainer) return;

    // Wait for events to load first (with timeout)
    if (window.eventsLoadedPromise) {
        await window.eventsLoadedPromise;
    } else {
        // Wait up to 3 seconds for eventsLoadedPromise to exist
        await new Promise(resolve => {
            let attempts = 0;
            const checkPromise = setInterval(() => {
                attempts++;
                if (window.eventsLoadedPromise) {
                    clearInterval(checkPromise);
                    window.eventsLoadedPromise.then(resolve);
                } else if (attempts >= 30) { // 30 * 100ms = 3 seconds
                    clearInterval(checkPromise);
                    console.warn('⚠️ Events not loaded after 3s');
                    resolve();
                }
            }, 100);
        });
    }

    try {
        // Use loaded events
        let events = (window.eventsData || []);
        const today = getTodayDateString();

        // Get upcoming events (next 6)
        // Extract date portion from ISO timestamps (e.g., "2026-01-15T00:00:00.000Z" -> "2026-01-15")
        events = events
            .filter(event => {
                const eventDate = event.date ? event.date.split('T')[0] : '';
                return eventDate >= today;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 6);

        console.log(`🏠 Homepage showing ${events.length} upcoming events from ${window.eventsData?.length || 0} total`);
        
        featuredContainer.innerHTML = '';
        
        if (events.length === 0) {
            featuredContainer.innerHTML = `
                <div class="event-card placeholder">
                    <div class="event-image"></div>
                    <div class="event-content">
                        <span class="event-date">No featured events yet</span>
                        <h3 class="event-title">Check back soon or submit your event!</h3>
                        <a href="submit.html" class="event-link">Submit an Event →</a>
                    </div>
                </div>
            `;
            return;
        }
        
        events.forEach(event => {
            const card = createEventCard(event);
            featuredContainer.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading featured events:', error);
        // Show fallback message
        featuredContainer.innerHTML = `
            <div class="event-card placeholder">
                <div class="event-image"></div>
                <div class="event-content">
                    <span class="event-date">Loading events...</span>
                    <h3 class="event-title">Events coming soon</h3>
                </div>
            </div>
        `;
    }
}

