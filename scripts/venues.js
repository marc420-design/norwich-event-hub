// Venues Directory Script

document.addEventListener('DOMContentLoaded', async function() {
    const venuesGrid = document.getElementById('venuesGrid');
    const loadingEl = document.getElementById('loadingVenues');

    // Wait for events to load
    if (window.eventsLoadedPromise) {
        await window.eventsLoadedPromise;
    } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!window.eventsData) {
            await initializeEvents();
        }
    }

    const allEvents = window.eventsData || [];

    if (allEvents.length === 0) {
        loadingEl.innerHTML = '<p>No venues found.</p>';
        return;
    }

    // Extract unique venues
    const venuesMap = new Map();

    allEvents.forEach(event => {
        if (!event.location) return;

        const venueName = event.location.trim();
        
        if (!venuesMap.has(venueName)) {
            venuesMap.set(venueName, {
                name: venueName,
                address: event.address || 'Norwich',
                eventCount: 0,
                nextEventDate: null
            });
        }

        const venue = venuesMap.get(venueName);
        venue.eventCount++;
        
        // Track next event date
        if (event.date) {
            const eventDate = new Date(event.date);
            if (!venue.nextEventDate || eventDate < venue.nextEventDate) {
                // Only consider future events for "next event" if possible, or just sorting logic
                // For now, simple logic
                if (eventDate >= new Date().setHours(0,0,0,0)) {
                    venue.nextEventDate = eventDate;
                }
            }
        }
    });

    // Convert to array and sort
    const venues = Array.from(venuesMap.values()).sort((a, b) => {
        // Sort by number of events (descending), then name
        if (b.eventCount !== a.eventCount) return b.eventCount - a.eventCount;
        return a.name.localeCompare(b.name);
    });

    loadingEl.style.display = 'none';
    renderVenues(venues, venuesGrid);
});

function renderVenues(venues, container) {
    container.innerHTML = venues.map(venue => {
        const encodedName = encodeURIComponent(venue.name);
        return `
        <article class="venue-card">
            <div class="venue-card-header">
                <h2 class="venue-card-title">${venue.name}</h2>
            </div>
            <div class="venue-card-body">
                <div class="venue-card-address">
                    <span>📍</span>
                    <span>${venue.address}</span>
                </div>
                <div class="venue-event-count">
                    ${venue.eventCount} Upcoming Event${venue.eventCount !== 1 ? 's' : ''}
                </div>
                ${venue.nextEventDate ? `
                <div style="font-size:0.9rem; color:#666;">
                    Next event: ${venue.nextEventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                ` : ''}
            </div>
            <div class="venue-card-footer">
                <a href="venue-detail.html?name=${encodedName}" class="btn btn-outline btn-full">View Details & Events</a>
            </div>
        </article>
        `;
    }).join('');
}
