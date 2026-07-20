// Event Detail Page JavaScript

document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdentifier = urlParams.get('id');

    if (!eventIdentifier) {
        showError('No event ID provided.');
        return;
    }

    try {
        if (window.eventsLoadedPromise) {
            await window.eventsLoadedPromise;
        }

        const event = findEventByIdentifier(eventIdentifier);
        if (!event) {
            showError('Event not found.');
            return;
        }

        displayEventDetail(event);
        loadRelatedEvents(event);
        updatePageMetadata(event);
        startCountdownTimer(event);
    } catch (error) {
        console.error('Error loading event detail:', error);
        showError('We’re having trouble loading this event right now. Please try again shortly.');
    }
});

function findEventByIdentifier(identifier) {
    const id = String(identifier);
    return (window.eventsData || []).find(event => String(event.id) === id || String(event.slug) === id);
}

function displayEventDetail(event) {
    const container = document.getElementById('eventDetailContent');
    const eventDate = event.date ? (window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date)) : null;
    const formattedDate = event.date ? window.formatDate(event.date) : 'Date TBA';
    const formattedTime = event.time && event.time !== 'Time TBC' ? window.formatTime(event.time) : 'Time TBC';
    const primaryUrl = window.chooseBestEventUrl ? window.chooseBestEventUrl(event) : '';
    const imageUrl = window.chooseBestImage ? window.chooseBestImage(event) : '';
    const fallbackLabel = window.getCategoryFallbackKey ? window.getCategoryFallbackKey(event.category || 'general') : 'norwich';
    const priceText = event.price || (event.isFree ? 'Free' : 'See website');

    container.innerHTML = `
        <div class="event-detail-header">
            <a href="directory.html" class="back-link">← Back to Events</a>
            <div class="event-detail-badge">${escapeHtml(event.category || 'Event')}</div>
        </div>

        <div class="event-detail-main">
            <div class="event-detail-image">
                ${imageUrl
                    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(event.name || 'Event')}" onerror="this.closest('.event-detail-image').innerHTML='<div class=&quot;event-image-placeholder&quot;>${escapeHtml(fallbackLabel)}</div>'">`
                    : `<div class="event-image-placeholder">${escapeHtml(fallbackLabel)}</div>`
                }
            </div>

            <div class="event-detail-info">
                <h1 class="event-detail-title">${escapeHtml(event.name || 'Untitled Event')}</h1>

                <div class="event-detail-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📅</span>
                        <div>
                            <strong>Date</strong>
                            <p>${escapeHtml(formattedDate)}</p>
                        </div>
                    </div>

                    <div class="meta-item">
                        <span class="meta-icon">⏰</span>
                        <div>
                            <strong>Time</strong>
                            <p>${escapeHtml(formattedTime)}</p>
                        </div>
                    </div>

                    <div class="meta-item">
                        <span class="meta-icon">📍</span>
                        <div>
                            <strong>Venue</strong>
                            <p>${escapeHtml(event.location || event.venue || 'Venue TBC')}</p>
                        </div>
                    </div>

                    <div class="meta-item">
                        <span class="meta-icon">💰</span>
                        <div>
                            <strong>Price</strong>
                            <p>${escapeHtml(priceText)}</p>
                        </div>
                    </div>
                </div>

                ${event.description ? `
                <div class="event-detail-description">
                    <h2>About This Event</h2>
                    <p>${escapeHtml(event.description)}</p>
                </div>
                ` : ''}

                ${eventDate && eventDate > new Date() ? `
                <div class="event-countdown" id="eventCountdown" style="display: none;">
                    <h3>⏰ Event Starts In</h3>
                    <div class="countdown-display" id="countdownDisplay"></div>
                </div>
                ` : ''}

                <div class="event-detail-actions">
                    <a href="${escapeHtml(getEventDetailUrl(event))}" class="btn btn-secondary btn-large">Copyable Event Page</a>
                    ${primaryUrl ? `<a href="${escapeHtml(primaryUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-large">${primaryUrl === (event.ticketLink || '') ? 'Tickets' : 'More Info'}</a>` : ''}
                    <button onclick="addToCalendar('${escapeJs(event.id)}')" class="btn btn-secondary btn-large">Add to Calendar</button>
                </div>

                <div class="event-share">
                    <h3>Share This Event</h3>
                    <div class="share-buttons">
                        <button onclick="shareWhatsApp('${escapeJs(event.id)}')" class="share-btn share-whatsapp">WhatsApp</button>
                        <button onclick="shareTwitter('${escapeJs(event.id)}')" class="share-btn share-twitter">Twitter</button>
                        <button onclick="shareFacebook('${escapeJs(event.id)}')" class="share-btn share-facebook">Facebook</button>
                        <button onclick="copyLink('${escapeJs(event.id)}')" class="share-btn share-copy">Copy Link</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadRelatedEvents(currentEvent) {
    const container = document.getElementById('relatedEvents');
    const relatedEvents = (window.eventsData || [])
        .filter(event => event.id !== currentEvent.id && event.category === currentEvent.category)
        .slice(0, 3);

    if (!relatedEvents.length) {
        container.innerHTML = '<p>No related events found.</p>';
        return;
    }

    container.innerHTML = '';
    relatedEvents.forEach(event => {
        container.appendChild(createEventCard(event));
    });
}

function updatePageMetadata(event) {
    const eventUrl = `https://norwicheventshub.com/${getEventDetailUrl(event)}`;
    const imageUrl = window.chooseBestImage ? window.chooseBestImage(event) : '';
    const primaryUrl = window.chooseBestEventUrl ? window.chooseBestEventUrl(event) : '';
    const formattedTime = event.time && event.time !== 'Time TBC' ? event.time : '00:00';

    document.getElementById('pageTitle').textContent = `${event.name || 'Event'} - Norwich Event Hub`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = event.description || `${event.name} at ${event.location || 'Norwich'}`;
    }

    updateOrCreateMeta('property', 'og:title', event.name || 'Event');
    updateOrCreateMeta('property', 'og:description', event.description || '');
    updateOrCreateMeta('property', 'og:url', eventUrl);
    updateOrCreateMeta('property', 'og:image', imageUrl || 'https://norwicheventshub.com/assets/logo-image.jpg');
    updateOrCreateMeta('name', 'twitter:title', event.name || 'Event');
    updateOrCreateMeta('name', 'twitter:description', event.description || '');
    updateOrCreateMeta('name', 'twitter:image', imageUrl || 'https://norwicheventshub.com/assets/logo-image.jpg');

    const startDate = event.date ? `${event.date}T${formattedTime}:00+01:00` : '';
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name || 'Event',
        description: event.description || '',
        startDate: startDate,
        location: {
            '@type': 'Place',
            name: event.location || 'Norwich',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Norwich',
                addressCountry: 'GB'
            }
        },
        image: imageUrl ? [imageUrl] : undefined
    };

    if (primaryUrl) {
        schema.offers = {
            '@type': 'Offer',
            url: primaryUrl,
            priceCurrency: 'GBP'
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
            <p>${escapeHtml(message)}</p>
            <a href="directory.html" class="btn btn-primary">Browse All Events</a>
        </div>
    `;
}

function getEventPageUrl(eventId) {
    const event = findEventByIdentifier(eventId);
    return event ? `${window.location.origin}/${getEventDetailUrl(event)}` : `${window.location.origin}/event-detail.html`;
}

function shareWhatsApp(eventId) {
    const event = findEventByIdentifier(eventId);
    if (!event) return;

    const url = getEventPageUrl(eventId);
    const text = `Check out this event: ${event.name || 'Event'} at ${event.location || 'Norwich'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
}

function shareTwitter(eventId) {
    const event = findEventByIdentifier(eventId);
    if (!event) return;

    const url = getEventPageUrl(eventId);
    const text = `${event.name || 'Event'} at ${event.location || 'Norwich'}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareFacebook(eventId) {
    const url = getEventPageUrl(eventId);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function copyLink(eventId) {
    const url = getEventPageUrl(eventId);
    const btn = document.querySelector('.share-copy');

    navigator.clipboard.writeText(url).then(() => {
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.backgroundColor = '#27AE60';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please copy manually: ' + url);
    });
}

function startCountdownTimer(event) {
    const countdownContainer = document.getElementById('eventCountdown');
    const countdownDisplay = document.getElementById('countdownDisplay');
    if (!countdownContainer || !countdownDisplay || !event.date) return;

    const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
    if (event.time && event.time !== 'Time TBC') {
        const timeParts = event.time.split(':');
        if (timeParts.length >= 2) {
            eventDate.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
        }
    }

    const hoursUntilEvent = (eventDate - new Date()) / (1000 * 60 * 60);
    if (hoursUntilEvent <= 0 || hoursUntilEvent > 24) return;

    countdownContainer.style.display = 'block';

    const updateCountdown = () => {
        const msUntilEvent = eventDate - new Date();
        if (msUntilEvent <= 0) {
            countdownDisplay.textContent = 'Event has started!';
            return;
        }

        const hours = Math.floor(msUntilEvent / (1000 * 60 * 60));
        const minutes = Math.floor((msUntilEvent % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msUntilEvent % (1000 * 60)) / 1000);
        countdownDisplay.innerHTML = `
            <div class="countdown-unit"><span class="countdown-number">${hours}</span><span class="countdown-label">Hours</span></div>
            <div class="countdown-unit"><span class="countdown-number">${minutes}</span><span class="countdown-label">Minutes</span></div>
            <div class="countdown-unit"><span class="countdown-number">${seconds}</span><span class="countdown-label">Seconds</span></div>
        `;
    };

    updateCountdown();
    const countdownInterval = setInterval(() => {
        updateCountdown();
        if (eventDate <= new Date()) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function addToCalendar(eventId) {
    const event = findEventByIdentifier(eventId);
    if (!event || !event.date) {
        alert('Event date not available');
        return;
    }

    const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
    if (event.time && event.time !== 'Time TBC') {
        const timeParts = event.time.split(':');
        if (timeParts.length >= 2) {
            eventDate.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
        }
    }

    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
    const startStamp = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endStamp = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = getEventPageUrl(eventId);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Norwich Event Hub//EN
BEGIN:VEVENT
UID:${event.id}@norwicheventshub.com
DTSTAMP:${startStamp}
DTSTART:${startStamp}
DTEND:${endStamp}
SUMMARY:${event.name || 'Event'}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || 'Norwich'}
URL:${url}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${(event.slug || event.name || 'event').replace(/[^a-z0-9-]/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function escapeJs(text) {
    return String(text || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
