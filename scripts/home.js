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
    
    try {
        // Try to load from API
        let events = [];
        if (typeof getEventsFromAPI !== 'undefined') {
            events = await getEventsFromAPI({ status: 'approved' });
            // Get upcoming events (next 6)
            const today = getTodayDateString();
            events = events
                .filter(event => event.date >= today)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 6);
        } else {
            // Fallback to sample data
            events = eventsData.filter(event => {
                const eventDate = new Date(event.date);
                const today = new Date();
                return eventDate >= today;
            }).slice(0, 6);
        }
        
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

