document.addEventListener('DOMContentLoaded', async () => {
    const venuesGrid = document.getElementById('venuesGrid');
    const loadingEl = document.getElementById('loadingVenues');

    if (!venuesGrid || !loadingEl) {
        return;
    }

    try {
        const allEvents = typeof window.getSafePublicEvents === 'function'
            ? await window.getSafePublicEvents()
            : (window.eventsData || []);

        const publicEvents = allEvents.filter((event) =>
            window.isApprovedFutureEvent ? window.isApprovedFutureEvent(event) : true
        );

        const venuesMap = new Map();

        publicEvents.forEach((event) => {
            if (!event.location || event.location === 'Venue TBA') {
                return;
            }

            const venueName = event.location.trim();
            const venueKey = venueName.toLowerCase();
            const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);

            if (!venuesMap.has(venueKey)) {
                venuesMap.set(venueKey, {
                    name: venueName,
                    address: event.address || 'Norwich',
                    eventCount: 0,
                    nextEventDate: null
                });
            }

            const venue = venuesMap.get(venueKey);
            venue.eventCount += 1;

            if (event.date && (!venue.nextEventDate || eventDate < venue.nextEventDate)) {
                venue.nextEventDate = eventDate;
            }
        });

        const venues = Array.from(venuesMap.values()).sort((a, b) => {
            if (b.eventCount !== a.eventCount) {
                return b.eventCount - a.eventCount;
            }
            return a.name.localeCompare(b.name);
        });

        loadingEl.style.display = 'none';

        if (venues.length === 0) {
            renderStarterVenues(venuesGrid);
        } else {
            renderVenues(venues, venuesGrid);
        }
    } catch (error) {
        console.error('Unable to load venues:', error);
        loadingEl.style.display = 'none';
        venuesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 2rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb; margin-bottom: 1.5rem;">
                <h3 style="margin-bottom: 0.5rem;">Venue listings are updating</h3>
                <p style="color: #666;">We could not load live venue data right now, so we are showing trusted starter venues.</p>
            </div>
        `;
        renderStarterVenues(venuesGrid);
    }
});

const STARTER_VENUES = [
    { name: 'The Forum', address: 'Millennium Plain, Norwich NR2 1TF', url: 'https://www.theforumnorwich.co.uk' },
    { name: 'Norwich Arts Centre', address: 'St Benedicts Street, Norwich NR2 4PG', url: 'https://www.norwichartscentre.co.uk' },
    { name: 'UEA Waterfront', address: 'University of East Anglia, Norwich NR4 7TJ', url: 'https://www.uea.su/venues/waterfront' },
    { name: 'Theatre Royal Norwich', address: 'Theatre Street, Norwich NR2 1RL', url: 'https://www.theatreroyalnorwich.co.uk' },
    { name: 'Norwich Playhouse', address: '42-58 St Georges Street, Norwich NR3 1AB', url: 'https://www.norwichplayhouse.co.uk' },
    { name: 'Epic Studios', address: 'Magdalen Street, Norwich NR3 1JE', url: 'https://www.epicstudios.co.uk' },
    { name: 'The Brickmakers', address: 'Sprowston Road, Norwich NR3 4JR', url: 'https://www.brickmakers.co.uk' },
    { name: 'Carrow Road', address: 'Norwich City Football Club, Norwich NR1 1JE', url: 'https://www.canaries.co.uk' },
];

function renderStarterVenues(container) {
    container.innerHTML = STARTER_VENUES.map((venue) => {
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
                <div style="margin-top:0.5rem;">
                    <a href="${venue.url}" target="_blank" rel="noopener noreferrer" style="color:#3AB8FF;font-size:0.9rem;">Visit venue website →</a>
                </div>
            </div>
            <div class="venue-card-footer">
                <a href="venue-detail.html?name=${encodedName}" class="btn btn-outline btn-full">View Details & Events</a>
            </div>
        </article>
        `;
    }).join('');
}

function renderVenues(venues, container) {
    container.innerHTML = venues.map((venue) => {
        const encodedName = encodeURIComponent(venue.name);
        const nextEvent = venue.nextEventDate
            ? formatDate(getDateString(venue.nextEventDate))
            : '';

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
                ${nextEvent ? `
                <div style="font-size:0.9rem; color:#666;">
                    Next event: ${nextEvent}
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
