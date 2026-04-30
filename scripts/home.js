let homepageEvents = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        homepageEvents = typeof window.getSafePublicEvents === 'function'
            ? await window.getSafePublicEvents()
            : (window.eventsData || []);

        await Promise.all([
            loadFeaturedThisWeek(),
            loadTonightEvents(),
            loadEditorsPicks(),
            loadThisWeekendEvents(),
            loadClubNightsEvents(),
            loadCultureEvents(),
            loadFreeEvents()
        ]);
    } catch (error) {
        console.error('Homepage load error:', error);
    } finally {
        updateEventCounter();
    }

    window.addEventListener('eventsLoaded', async () => {
        homepageEvents = typeof window.getSafePublicEvents === 'function'
            ? await window.getSafePublicEvents()
            : (window.eventsData || []);
        updateEventCounter();
    });

    window.addEventListener('eventsUpdated', async () => {
        homepageEvents = typeof window.getSafePublicEvents === 'function'
            ? await window.getSafePublicEvents()
            : (window.eventsData || []);
        updateEventCounter();
    });

    window.addEventListener('eventsLoadError', (event) => {
        showErrorInContainer('featuredThisWeekEvents', event.detail);
        showErrorInContainer('tonightEvents', event.detail);
        showErrorInContainer('editorsPicksEvents', event.detail);
        showErrorInContainer('thisWeekendEvents', event.detail);
        showErrorInContainer('clubNightsEvents', event.detail);
        showErrorInContainer('cultureEvents', event.detail);
        showErrorInContainer('freeEvents', event.detail);
    });
});

function updateEventCounter() {
    const totalEventsElement = document.getElementById('totalEvents');
    if (!totalEventsElement) {
        return;
    }

    if (homepageEvents.length === 0) {
        totalEventsElement.textContent = '...';
        return;
    }

    const futureEvents = homepageEvents.filter((event) =>
        window.isApprovedFutureEvent ? window.isApprovedFutureEvent(event) : true
    );

    totalEventsElement.textContent = futureEvents.length > 0 ? futureEvents.length : homepageEvents.length;
}

function showErrorInContainer(containerId, errorDetail = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 3rem 1rem; background: rgba(229, 57, 53, 0.1); border-radius: 12px; border: 1px solid rgba(229, 57, 53, 0.3);">
            <p style="font-size: 1.2rem; margin-bottom: 1rem; color: #E53935;">${errorDetail.message || 'Unable to load events'}</p>
            <p style="color: #666;">Please refresh the page or try again shortly.</p>
            <p style="margin-top: 1.5rem;">
                <a href="submit.html" class="btn btn-primary" style="display: inline-block; padding: 0.75rem 1.5rem; background: var(--accent-color); color: white; text-decoration: none; border-radius: 8px;">Submit an Event</a>
            </p>
        </div>
    `;
}

function getFutureEvents(allEvents = homepageEvents) {
    return allEvents
        .filter((event) => window.isApprovedFutureEvent ? window.isApprovedFutureEvent(event) : true)
        .sort((a, b) => {
            const dateA = window.parseEventDate ? window.parseEventDate(a.date) : new Date(a.date);
            const dateB = window.parseEventDate ? window.parseEventDate(b.date) : new Date(b.date);
            return dateA - dateB;
        });
}

function populateEventContainer(container, events, emptyMessage = 'No events yet', maxEvents = 6, sectionId = null) {
    container.innerHTML = '';

    const displayEvents = events.slice(0, maxEvents);

    if (displayEvents.length === 0) {
        const section = sectionId ? document.getElementById(sectionId) : container.closest('section');
        if (section) section.style.display = 'block';
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 2rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                <p style="color: #666; margin-bottom: 1rem;">${emptyMessage}</p>
                <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                    <a href="this-weekend.html" class="btn btn-secondary">This Weekend</a>
                    <a href="submit.html" class="btn btn-primary">Submit Event</a>
                </div>
            </div>
        `;
        return;
    }

    const section = container.closest('section');
    if (section) {
        section.style.display = 'block';
    }

    displayEvents.forEach((event) => {
        container.appendChild(createEventCard(event));
    });
}

async function loadFeaturedThisWeek() {
    const container = document.getElementById('featuredThisWeekEvents');
    if (!container) {
        return;
    }

    try {
        const futureEvents = getFutureEvents();
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const featuredWeekEvents = futureEvents.filter((event) => {
            const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
            const isInNextWeek = eventDate >= now && eventDate <= nextWeek;
            return isInNextWeek && (event.featured || event.editorsChoice === true);
        });

        const displayEvents = featuredWeekEvents.length > 0
            ? featuredWeekEvents
            : futureEvents.filter((event) => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                return eventDate >= now && eventDate <= nextWeek;
            });

        populateEventContainer(container, displayEvents, 'No featured events this week', 6);
    } catch (error) {
        console.error('Error loading featured this week:', error);
    }
}

async function loadTonightEvents() {
    const container = document.getElementById('tonightEvents');
    const section = document.getElementById('tonightSection');
    if (!container || !section) {
        return;
    }

    try {
        const tonightEvents = getFutureEvents().filter((event) => event.date && window.isToday && window.isToday(event.date));

        if (tonightEvents.length > 0) {
            section.style.display = 'block';
            populateEventContainer(container, tonightEvents, 'No events tonight', 6);
        } else {
            section.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading tonight events:', error);
        section.style.display = 'none';
    }
}

async function loadEditorsPicks() {
    const container = document.getElementById('editorsPicksEvents');
    if (!container) {
        return;
    }

    try {
        const editorsPicksEvents = getFutureEvents().filter((event) => event.featured || event.editorsChoice === true);
        populateEventContainer(container, editorsPicksEvents, "No editor's picks yet", 6);
    } catch (error) {
        console.error("Error loading editor's picks:", error);
    }
}

async function loadThisWeekendEvents() {
    const container = document.getElementById('thisWeekendEvents');
    if (!container) {
        return;
    }

    try {
        const { start, end } = getWeekendDateRangeUK();
        const weekendEvents = getFutureEvents().filter((event) => {
            const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
            return eventDate >= start && eventDate <= end;
        });

        populateEventContainer(container, weekendEvents, 'No weekend events yet', 6);
    } catch (error) {
        console.error('Error loading weekend events:', error);
    }
}

async function loadClubNightsEvents() {
    const container = document.getElementById('clubNightsEvents');
    if (!container) {
        return;
    }

    try {
        const clubEvents = getFutureEvents().filter((event) => event.category === 'nightlife');
        populateEventContainer(container, clubEvents, 'No nightlife events yet', 6);
    } catch (error) {
        console.error('Error loading club nights:', error);
    }
}

async function loadCultureEvents() {
    const container = document.getElementById('cultureEvents');
    if (!container) {
        return;
    }

    try {
        const cultureEvents = getFutureEvents().filter((event) =>
            event.category === 'culture' || event.category === 'theatre'
        );
        populateEventContainer(container, cultureEvents, 'No culture events yet', 6);
    } catch (error) {
        console.error('Error loading culture events:', error);
    }
}

async function loadFreeEvents() {
    const container = document.getElementById('freeEvents');
    if (!container) {
        return;
    }

    try {
        const freeEvents = getFutureEvents().filter((event) =>
            event.isFree === true || (event.price && event.price.toLowerCase() === 'free')
        );
        populateEventContainer(container, freeEvents, 'No free events yet', 6);
    } catch (error) {
        console.error('Error loading free events:', error);
    }
}
