// Homepage JavaScript - Load featured events

document.addEventListener('DOMContentLoaded', async function() {
    // Load all homepage sections
    await loadEditorsPicks();
    await loadThisWeekendEvents();
    await loadClubNightsEvents();
    await loadCultureEvents();
    await loadFreeEvents();

    // Initialize events from API if available
    if (typeof initializeEvents !== 'undefined') {
        await initializeEvents();
    }

    // Listen for error events
    window.addEventListener('eventsLoadError', function(e) {
        console.error('Events load error:', e.detail);
        showErrorInContainer('editorsPicksEvents', e.detail);
        showErrorInContainer('thisWeekendEvents', e.detail);
        showErrorInContainer('clubNightsEvents', e.detail);
        showErrorInContainer('cultureEvents', e.detail);
        showErrorInContainer('freeEvents', e.detail);
    });
});

function showErrorInContainer(containerId, errorDetail) {
    const container = document.getElementById(containerId);
    if (container && container.querySelector('.event-card.placeholder')) {
        container.innerHTML = `
            <div class="event-card placeholder">
                <div class="event-image"></div>
                <div class="event-content">
                    <span class="event-date">Unable to load events</span>
                    <h3 class="event-title">${errorDetail.message || 'Please try again later'}</h3>
                    <p style="margin-top: 10px; color: #666;">
                        ${errorDetail.willRetry !== false ? 'Retrying automatically...' : 'Please refresh the page or check your connection.'}
                    </p>
                    <a href="submit.html" class="event-link" style="margin-top: 15px; display: inline-block;">Submit an Event →</a>
                </div>
            </div>
        `;
    }
}

// Helper function to wait for events to load
async function waitForEvents() {
    let eventsLoaded = false;
    if (window.eventsLoadedPromise) {
        try {
            await Promise.race([
                window.eventsLoadedPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout: Events took too long to load')), 12000)
                )
            ]);
            eventsLoaded = true;
        } catch (error) {
            console.error('Events load timeout:', error);
        }
    } else {
        await new Promise(resolve => {
            let attempts = 0;
            const checkPromise = setInterval(() => {
                attempts++;
                if (window.eventsLoadedPromise) {
                    clearInterval(checkPromise);
                    window.eventsLoadedPromise.then(() => {
                        eventsLoaded = true;
                        resolve();
                    }).catch(() => resolve());
                } else if (attempts >= 30) {
                    clearInterval(checkPromise);
                    console.warn('⚠️ Events not loaded after 3s');
                    resolve();
                }
            }, 100);
        });
    }
    return eventsLoaded;
}

// Helper function to get future events sorted by date
function getFutureEvents(allEvents) {
    return allEvents
        .filter(event => event.date && window.isFutureEvent && window.isFutureEvent(event.date))
        .sort((a, b) => {
            const dateA = window.parseEventDate ? window.parseEventDate(a.date) : new Date(a.date);
            const dateB = window.parseEventDate ? window.parseEventDate(b.date) : new Date(b.date);
            return dateA - dateB;
        });
}

// Helper function to populate a container with events
function populateEventContainer(container, events, emptyMessage = 'No events yet') {
    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = `
            <div class="event-card placeholder">
                <div class="event-image"></div>
                <div class="event-content">
                    <span class="event-date">${emptyMessage}</span>
                    <h3 class="event-title">Check back soon or submit your event!</h3>
                    <a href="submit.html" class="event-link">Submit an Event →</a>
                </div>
            </div>
        `;
        return;
    }

    events.forEach(event => {
        const card = createEventCard(event);
        container.appendChild(card);
    });
}

// Load Editor's Picks (featured events)
async function loadEditorsPicks() {
    const container = document.getElementById('editorsPicksEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);

        // Get events marked as featured or priority, limit to 6
        const editorsPicksEvents = futureEvents
            .filter(event => event.featured || event.priority === 'high')
            .slice(0, 6);

        console.log(`⭐ Editor's Picks: ${editorsPicksEvents.length} events`);
        populateEventContainer(container, editorsPicksEvents, "No editor's picks yet");
    } catch (error) {
        console.error('Error loading editor\'s picks:', error);
        showErrorInContainer('editorsPicksEvents', { message: 'Something went wrong' });
    }
}

// Load This Weekend events
async function loadThisWeekendEvents() {
    const container = document.getElementById('thisWeekendEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);

        // Get upcoming weekend events, limit to 6
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
        const nextSaturday = new Date(now);
        nextSaturday.setDate(now.getDate() + daysUntilSaturday);
        nextSaturday.setHours(0, 0, 0, 0);

        const nextSunday = new Date(nextSaturday);
        nextSunday.setDate(nextSaturday.getDate() + 1);
        nextSunday.setHours(23, 59, 59, 999);

        const weekendEvents = futureEvents
            .filter(event => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                return eventDate >= nextSaturday && eventDate <= nextSunday;
            })
            .slice(0, 6);

        console.log(`🔥 This Weekend: ${weekendEvents.length} events`);
        populateEventContainer(container, weekendEvents, 'No weekend events yet');
    } catch (error) {
        console.error('Error loading weekend events:', error);
        showErrorInContainer('thisWeekendEvents', { message: 'Something went wrong' });
    }
}

// Load Club Nights & Nightlife
async function loadClubNightsEvents() {
    const container = document.getElementById('clubNightsEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);

        const clubEvents = futureEvents
            .filter(event => event.category === 'nightlife')
            .slice(0, 6);

        console.log(`🌙 Club Nights: ${clubEvents.length} events`);
        populateEventContainer(container, clubEvents, 'No nightlife events yet');
    } catch (error) {
        console.error('Error loading club nights:', error);
        showErrorInContainer('clubNightsEvents', { message: 'Something went wrong' });
    }
}

// Load Culture & Arts
async function loadCultureEvents() {
    const container = document.getElementById('cultureEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);

        const cultureEvents = futureEvents
            .filter(event => event.category === 'culture' || event.category === 'theatre')
            .slice(0, 6);

        console.log(`🎭 Culture: ${cultureEvents.length} events`);
        populateEventContainer(container, cultureEvents, 'No culture events yet');
    } catch (error) {
        console.error('Error loading culture events:', error);
        showErrorInContainer('cultureEvents', { message: 'Something went wrong' });
    }
}

// Load Free Events
async function loadFreeEvents() {
    const container = document.getElementById('freeEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);

        const freeEvents = futureEvents
            .filter(event => event.price && event.price.toLowerCase() === 'free')
            .slice(0, 6);

        console.log(`🆓 Free Events: ${freeEvents.length} events`);
        populateEventContainer(container, freeEvents, 'No free events yet');
    } catch (error) {
        console.error('Error loading free events:', error);
        showErrorInContainer('freeEvents', { message: 'Something went wrong' });
    }
}

