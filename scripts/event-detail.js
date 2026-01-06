// Event Detail Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        showError('No event ID provided');
        return;
    }

    // Wait for events to load
    if (window.eventsLoadedPromise) {
        await window.eventsLoadedPromise;
    }

    // Find the event
    const event = (window.eventsData || []).find(e => e.id === parseInt(eventId));

    if (!event) {
        showError('Event not found');
        return;
    }

    // Display event details
    displayEventDetail(event);

    // Load related events
    loadRelatedEvents(event);

    // Update page metadata
    updatePageMetadata(event);
});

function displayEventDetail(event) {
    const container = document.getElementById('eventDetailContent');

    // Format date
    const eventDate = event.date ? new Date(event.date) : null;
    const formattedDate = eventDate ? eventDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Date TBA';

    const formattedTime = eventDate ? eventDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    // Determine price display
    const priceDisplay = !event.price || event.price === 'Free' || event.price === '0'
        ? 'Free Event'
        : `£${event.price}`;

    // Category badge color
    const categoryColors = {
        'nightlife': '#FF6B9D',
        'gigs': '#9B59B6',
        'theatre': '#E74C3C',
        'culture': '#F39C12',
        'community': '#2ECC71',
        'markets': '#3498DB',
        'sports': '#E67E22',
        'free': '#27AE60'
    };
    const categoryColor = categoryColors[event.category] || '#3AB8FF';

    // Build event detail HTML
    container.innerHTML = `
        <div class="event-detail-header">
            <a href="directory.html" class="back-link">← Back to Events</a>
            <div class="event-detail-badge" style="background-color: ${categoryColor}">
                ${event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'Event'}
            </div>
        </div>

        <div class="event-detail-main">
            <div class="event-detail-image">
                ${event.image
                    ? `<img src="${event.image}" alt="${event.name || 'Event'}" onerror="this.src='assets/placeholder-event.jpg'">`
                    : '<div class="event-image-placeholder"></div>'
                }
            </div>

            <div class="event-detail-info">
                <h1 class="event-detail-title">${event.name || 'Untitled Event'}</h1>

                <div class="event-detail-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📅</span>
                        <div>
                            <strong>Date</strong>
                            <p>${formattedDate}${formattedTime ? ' at ' + formattedTime : ''}</p>
                        </div>
                    </div>

                    ${event.location ? `
                    <div class="meta-item">
                        <span class="meta-icon">📍</span>
                        <div>
                            <strong>Location</strong>
                            <p>${event.location}</p>
                        </div>
                    </div>
                    ` : ''}

                    <div class="meta-item">
                        <span class="meta-icon">💰</span>
                        <div>
                            <strong>Price</strong>
                            <p>${priceDisplay}</p>
                        </div>
                    </div>
                </div>

                ${event.description ? `
                <div class="event-detail-description">
                    <h2>About This Event</h2>
                    <p>${event.description}</p>
                </div>
                ` : ''}

                <div class="event-detail-actions">
                    ${event.ticketLink ? `
                    <a href="${event.ticketLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-large">
                        Get Tickets
                    </a>
                    ` : ''}
                    <button onclick="addToCalendar(${event.id})" class="btn btn-secondary btn-large">
                        Add to Calendar
                    </button>
                </div>

                <div class="event-share">
                    <h3>Share This Event</h3>
                    <div class="share-buttons">
                        <button onclick="shareWhatsApp(${event.id})" class="share-btn share-whatsapp">
                            WhatsApp
                        </button>
                        <button onclick="shareTwitter(${event.id})" class="share-btn share-twitter">
                            Twitter
                        </button>
                        <button onclick="shareFacebook(${event.id})" class="share-btn share-facebook">
                            Facebook
                        </button>
                        <button onclick="copyLink(${event.id})" class="share-btn share-copy">
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadRelatedEvents(currentEvent) {
    const container = document.getElementById('relatedEvents');
    const allEvents = window.eventsData || [];

    // Find related events (same category, excluding current event)
    const relatedEvents = allEvents
        .filter(e => e.id !== currentEvent.id && e.category === currentEvent.category)
        .slice(0, 3);

    // If less than 3, fill with other events
    if (relatedEvents.length < 3) {
        const otherEvents = allEvents
            .filter(e => e.id !== currentEvent.id && !relatedEvents.includes(e))
            .slice(0, 3 - relatedEvents.length);
        relatedEvents.push(...otherEvents);
    }

    if (relatedEvents.length === 0) {
        container.innerHTML = '<p>No related events found</p>';
        return;
    }

    container.innerHTML = '';
    relatedEvents.forEach(event => {
        const card = createEventCard(event);
        container.appendChild(card);
    });
}

function updatePageMetadata(event) {
    // Update page title
    document.getElementById('pageTitle').textContent = `${event.name || 'Event'} - Norwich Event Hub`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = event.description || `${event.name} at ${event.location || 'Norwich'}`;
    }

    // Update Open Graph meta tags
    const eventUrl = `https://norwicheventshub.com/event-detail.html?id=${event.id}`;

    updateOrCreateMeta('property', 'og:title', event.name || 'Event');
    updateOrCreateMeta('property', 'og:description', event.description || '');
    updateOrCreateMeta('property', 'og:url', eventUrl);
    updateOrCreateMeta('property', 'og:image', event.image || 'https://norwicheventshub.com/assets/logo-image.jpg');

    // Update Twitter meta tags
    updateOrCreateMeta('name', 'twitter:title', event.name || 'Event');
    updateOrCreateMeta('name', 'twitter:description', event.description || '');
    updateOrCreateMeta('name', 'twitter:image', event.image || 'https://norwicheventshub.com/assets/logo-image.jpg');

    // Update Schema.org markup
    const eventDate = event.date ? new Date(event.date) : null;
    const schema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.name || "Event",
        "description": event.description || "",
        "startDate": eventDate ? eventDate.toISOString() : "",
        "location": {
            "@type": "Place",
            "name": event.location || "Norwich",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Norwich",
                "addressCountry": "GB"
            }
        },
        "image": event.image || "https://norwicheventshub.com/assets/logo-image.jpg",
        "organizer": {
            "@type": "Organization",
            "name": "Norwich Event Hub",
            "url": "https://norwicheventshub.com"
        }
    };

    if (event.price && event.price !== 'Free' && event.price !== '0') {
        schema.offers = {
            "@type": "Offer",
            "price": event.price,
            "priceCurrency": "GBP",
            "url": event.ticketLink || eventUrl
        };
    }

    document.getElementById('eventSchema').textContent = JSON.stringify(schema, null, 2);
}

function updateOrCreateMeta(attr, value, content) {
    let meta = document.querySelector(`meta[${attr}="${value}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, value);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

function showError(message) {
    const container = document.getElementById('eventDetailContent');
    container.innerHTML = `
        <div class="error-message">
            <h2>Oops!</h2>
            <p>${message}</p>
            <a href="directory.html" class="btn btn-primary">Browse All Events</a>
        </div>
    `;
}

// Social sharing functions
function shareWhatsApp(eventId) {
    const event = (window.eventsData || []).find(e => e.id === eventId);
    if (!event) return;

    const url = `${window.location.origin}/event-detail.html?id=${eventId}`;
    const text = `Check out this event: ${event.name || 'Event'} at ${event.location || 'Norwich'}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
}

function shareTwitter(eventId) {
    const event = (window.eventsData || []).find(e => e.id === eventId);
    if (!event) return;

    const url = `${window.location.origin}/event-detail.html?id=${eventId}`;
    const text = `${event.name || 'Event'} at ${event.location || 'Norwich'}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
}

function shareFacebook(eventId) {
    const url = `${window.location.origin}/event-detail.html?id=${eventId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
}

function copyLink(eventId) {
    const url = `${window.location.origin}/event-detail.html?id=${eventId}`;
    navigator.clipboard.writeText(url).then(() => {
        // Show success message
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.backgroundColor = '#27AE60';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please copy manually: ' + url);
    });
}

function addToCalendar(eventId) {
    const event = (window.eventsData || []).find(e => e.id === eventId);
    if (!event || !event.date) {
        alert('Event date not available');
        return;
    }

    const eventDate = new Date(event.date);

    // Format for .ics file
    const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; // +2 hours

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Norwich Event Hub//EN
BEGIN:VEVENT
UID:${eventId}@norwicheventshub.com
DTSTAMP:${startDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.name || 'Event'}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || 'Norwich'}
URL:${window.location.origin}/event-detail.html?id=${eventId}
END:VEVENT
END:VCALENDAR`;

    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(event.name || 'event').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
