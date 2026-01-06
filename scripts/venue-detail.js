// Venue Detail Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Get venue name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const venueName = urlParams.get('name'); // Use 'name' instead of ID since we don't have venue IDs yet

    if (!venueName) {
        showError('No venue specified');
        return;
    }

    // Wait for events to load
    if (window.eventsLoadedPromise) {
        await window.eventsLoadedPromise;
    } else {
        // Fallback if promise not exposed
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!window.eventsData) {
            await initializeEvents();
        }
    }

    const allEvents = window.eventsData || [];
    
    // Find events for this venue (case insensitive match)
    const venueEvents = allEvents.filter(e => 
        e.location && e.location.toLowerCase().trim() === venueName.toLowerCase().trim()
    );

    if (venueEvents.length === 0) {
        // Try to find venue in any event location even if no exact match (partial match)
        // or maybe the user navigated here but there are no *active* events?
        // We should still try to show venue info if possible, but we don't have a separate venues DB.
        // So for now, if no events, we can't show details.
        showError('Venue not found or no upcoming events listed.');
        return;
    }

    // Extract venue details from the first event found
    // In a real app, we'd have a separate venues database
    const venueInfo = {
        name: venueEvents[0].location,
        address: venueEvents[0].address || 'Address not available',
        events: venueEvents
    };

    // Sort events by date
    venueInfo.events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Display venue details
    displayVenueDetail(venueInfo);

    // Update page metadata
    updatePageMetadata(venueInfo);
});

function displayVenueDetail(venue) {
    const container = document.getElementById('venueDetailContent');
    const upcomingEventsCount = venue.events.filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0)).length;

    // Generate Map URL (Google Maps Embed)
    const mapQuery = encodeURIComponent(`${venue.name}, ${venue.address}`);
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${mapQuery}`; 
    // Note: Since we don't have a real API key in this static demo, we'll use a placeholder or a simple link
    // For the purpose of this demo, we'll use an iframe with a simple query if allowed, or just a link.
    // Actually, Google Maps Embed requires an API key. 
    // Let's use OpenStreetMap for a free alternative in this demo, or just a link to Google Maps.
    
    // OpenStreetMap Embed
    // We would need coordinates for a proper embed. 
    // Since we only have address string, we'll use a link to Google Maps for now in a nice button/display.
    // OR we can use a static map image placeholder.
    
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

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
                        <div class="stat-value">${upcomingEventsCount}</div>
                        <div class="stat-label">Upcoming Events</div>
                    </div>
                     <div class="stat-item">
                        <div class="stat-value">${venue.events.length}</div>
                        <div class="stat-label">Total Listed</div>
                    </div>
                </div>

                <div class="venue-actions">
                     <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                        View on Map ↗
                    </a>
                </div>
            </div>
        </header>

        <div class="container">
            <div class="venue-map">
                 <!-- Placeholder for map since we don't have geocoding in frontend without API key -->
                 <div style="width:100%; height:100%; background-color:#e0e0e0; display:flex; align-items:center; justify-content:center; flex-direction:column; color:#666;">
                    <p style="font-weight:bold; margin-bottom:10px;">Map View</p>
                    <p>${venue.address}</p>
                    <a href="${googleMapsLink}" target="_blank" style="margin-top:10px; color:var(--primary-color); text-decoration:underline;">Open in Google Maps</a>
                 </div>
            </div>

            <section class="venue-events-section">
                <h2>Upcoming Events at ${venue.name}</h2>
                <div class="events-grid">
                    ${venue.events.length > 0 ? venue.events.map(event => createEventCardHTML(event)).join('') : '<p>No upcoming events listed.</p>'}
                </div>
            </section>
        </div>
    `;
}

// Helper to create event card HTML (simplified version of main.js logic if needed, 
// but we should check if createEventCard is available globally or we need to recreate it)
// Checking main.js, createEventCard returns a DOM element. We need HTML string here or append elements.
// Let's reuse the global logic if possible, or rewrite a simple version.

function createEventCardHTML(event) {
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const timeStr = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    // Determine image
    const imageUrl = event.image || 'assets/logo-image.jpg';
    
    return `
    <article class="event-card">
        <div class="event-card-image">
            <img src="${imageUrl}" alt="${event.name}" loading="lazy" onerror="this.src='assets/logo-image.jpg'">
            <div class="event-date-badge">
                <span class="date-day">${eventDate.getDate()}</span>
                <span class="date-month">${eventDate.toLocaleString('default', { month: 'short' })}</span>
            </div>
            ${event.category ? `<span class="category-tag">${event.category}</span>` : ''}
        </div>
        <div class="event-card-content">
            <h3 class="event-title"><a href="event-detail.html?id=${event.id}">${event.name}</a></h3>
            <div class="event-meta">
                <div class="event-time">⏰ ${timeStr}</div>
                <div class="event-location">📍 ${event.location}</div>
                <div class="event-price">💰 ${event.price === '0' || event.price === 'Free' ? 'Free' : event.price}</div>
            </div>
            <a href="event-detail.html?id=${event.id}" class="btn btn-outline btn-sm">View Details</a>
        </div>
    </article>
    `;
}

function updatePageMetadata(venue) {
    // Update page title
    document.getElementById('pageTitle').textContent = `${venue.name} - Events & Info | Norwich Event Hub`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const description = venue.description 
            ? `${venue.description.substring(0, 150)}... Find upcoming events at ${venue.name} in Norwich.`
            : `Upcoming events and tickets for ${venue.name} in Norwich. Find out what's on at ${venue.name}.`;
        metaDesc.content = description;
    }
    
    // Update Open Graph tags
    const venueUrl = `https://norwicheventshub.com/venue-detail.html?id=${venue.id}`;
    
    updateOrCreateMeta('property', 'og:title', `${venue.name} | Norwich Event Hub`);
    updateOrCreateMeta('property', 'og:description', venue.description || `Events at ${venue.name}, Norwich`);
    updateOrCreateMeta('property', 'og:url', venueUrl);
    updateOrCreateMeta('property', 'og:type', 'place');
    
    // Update Twitter Card tags
    updateOrCreateMeta('name', 'twitter:title', `${venue.name} | Norwich Event Hub`);
    updateOrCreateMeta('name', 'twitter:description', venue.description || `Events at ${venue.name}, Norwich`);
}

function updateOrCreateMeta(attr, name, content) {
    if (!content) return;
    
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
