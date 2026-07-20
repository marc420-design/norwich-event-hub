document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const venueName = urlParams.get('name');

    if (!venueName) {
        showError('No venue specified.');
        return;
    }

    try {
        const allEvents = typeof window.getPublicEvents === 'function'
            ? await window.getPublicEvents()
            : (window.eventsData || []);

        const venueEvents = allEvents
            .filter((event) => window.isApprovedFutureEvent ? window.isApprovedFutureEvent(event) : true)
            .filter((event) => event.location && event.location.toLowerCase().trim() === venueName.toLowerCase().trim())
            .sort((a, b) => {
                const dateA = window.parseEventDate ? window.parseEventDate(a.date) : new Date(a.date);
                const dateB = window.parseEventDate ? window.parseEventDate(b.date) : new Date(b.date);
                return dateA - dateB;
            });

        if (venueEvents.length === 0) {
            showError('Venue not found or no upcoming events are listed.');
            return;
        }

        const venueInfo = {
            name: venueEvents[0].location,
            address: venueEvents[0].address || 'Address not available',
            events: venueEvents
        };

        displayVenueDetail(venueInfo);
        updatePageMetadata(venueInfo);
    } catch (error) {
        console.error('Venue detail load failed:', error);
        showError('Unable to load this venue right now.');
    }
});

function displayVenueDetail(venue) {
    const container = document.getElementById('venueDetailContent');
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}`)}`;

    container.innerHTML = `
        <header class="venue-header">
            <div class="container">
                <a href="venues.html" class="back-link" style="margin-bottom: 1rem; display: inline-block;">← Back to Venues</a>
                <h1 class="venue-title">${venue.name}</h1>
                <div class="venue-address">
                    <span>📍</span> ${venue.address}
                </div>

                <div class="venue-stats">
                    <div class="stat-item">
                        <div class="stat-value">${venue.events.length}</div>
                        <div class="stat-label">Upcoming Events</div>
                    </div>
                </div>

                <div class="venue-actions">
                    <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                        View on Map →
                    </a>
                </div>
            </div>
        </header>

        <div class="container">
            <div class="venue-map">
                <div style="width:100%; height:100%; background-color:#e0e0e0; display:flex; align-items:center; justify-content:center; flex-direction:column; color:#666;">
                    <p style="font-weight:bold; margin-bottom:10px;">Map View</p>
                    <p>${venue.address}</p>
                    <a href="${googleMapsLink}" target="_blank" style="margin-top:10px; color:var(--primary-color); text-decoration:underline;">Open in Google Maps</a>
                </div>
            </div>

            <section class="venue-events-section">
                <h2>Upcoming Events at ${venue.name}</h2>
                <div class="events-grid" id="venueEventsGrid"></div>
            </section>
        </div>
    `;

    const eventsGrid = document.getElementById('venueEventsGrid');
    if (eventsGrid) {
        venue.events.forEach((event) => {
            eventsGrid.appendChild(createEventCard(event));
        });
    }
}

function updatePageMetadata(venue) {
    document.getElementById('pageTitle').textContent = `${venue.name} - Events & Info | Norwich Event Hub`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = `Upcoming events and venue information for ${venue.name} in Norwich.`;
    }

    const venueUrl = `https://norwicheventshub.com/venue-detail.html?name=${encodeURIComponent(venue.name)}`;

    updateOrCreateMeta('property', 'og:title', `${venue.name} | Norwich Event Hub`);
    updateOrCreateMeta('property', 'og:description', `Upcoming events at ${venue.name}, Norwich`);
    updateOrCreateMeta('property', 'og:url', venueUrl);
    updateOrCreateMeta('property', 'og:type', 'place');
    updateOrCreateMeta('name', 'twitter:title', `${venue.name} | Norwich Event Hub`);
    updateOrCreateMeta('name', 'twitter:description', `Upcoming events at ${venue.name}, Norwich`);
}

function updateOrCreateMeta(attr, name, content) {
    if (!content) {
        return;
    }

    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

function showError(message) {
    const container = document.getElementById('venueDetailContent');
    container.innerHTML = `
        <div class="container" style="padding: 4rem 0; text-align: center;">
            <div class="error-message">
                <h2>Venue Not Found</h2>
                <p>${message}</p>
                <a href="venues.html" class="btn btn-primary" style="margin-top:1rem; display:inline-block;">Browse All Venues</a>
            </div>
        </div>
    `;
}
