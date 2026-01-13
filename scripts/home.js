// Homepage JavaScript - Load featured events

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏠 Homepage loading...');

    // Load all homepage sections in priority order
    await loadFeaturedThisWeek();
    await loadTonightEvents();
    await loadEditorsPicks();
    await loadThisWeekendEvents();
    await loadClubNightsEvents();
    await loadCultureEvents();
    await loadFreeEvents();

    // Initialize events from API if available
    if (typeof initializeEvents !== 'undefined') {
        await initializeEvents();
    }

    // Update event counter
    updateEventCounter();

    // Listen for events loaded event to update counter
    window.addEventListener('eventsLoaded', function(e) {
        console.log('📊 Events loaded event received:', e.detail);
        updateEventCounter();
    });

    // Listen for error events
    window.addEventListener('eventsLoadError', function(e) {
        console.error('Events load error:', e.detail);
        showErrorInContainer('featuredThisWeekEvents', e.detail);
        showErrorInContainer('tonightEvents', e.detail);
        showErrorInContainer('editorsPicksEvents', e.detail);
        showErrorInContainer('thisWeekendEvents', e.detail);
        showErrorInContainer('clubNightsEvents', e.detail);
        showErrorInContainer('cultureEvents', e.detail);
        showErrorInContainer('freeEvents', e.detail);
    });
});

// Update the event counter on homepage
function updateEventCounter() {
    const totalEventsElement = document.getElementById('totalEvents');
    if (totalEventsElement && window.eventsData) {
        const futureEvents = window.eventsData.filter(event =>
            event.date && window.isFutureEvent && window.isFutureEvent(event.date)
        );
        totalEventsElement.textContent = futureEvents.length;
        console.log(`📈 Updated event counter: ${futureEvents.length} events`);
    }
}

function showErrorInContainer(containerId, errorDetail) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Always show error, regardless of existing content
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 3rem 1rem; background: rgba(229, 57, 53, 0.1); border-radius: 12px; border: 1px solid rgba(229, 57, 53, 0.3);">
            <p style="font-size: 1.2rem; margin-bottom: 1rem; color: #E53935;">⚠️ ${errorDetail.message || 'Unable to load events'}</p>
            ${errorDetail.willRetry ? '<p style="color: #FFB74D;">Retrying automatically...</p>' : '<p style="color: rgba(255,255,255,0.7);">Please refresh the page or check your connection.</p>'}
            <p style="margin-top: 1.5rem;">
                <a href="submit.html" class="btn btn-primary" style="display: inline-block; padding: 0.75rem 1.5rem; background: var(--accent-color); color: white; text-decoration: none; border-radius: 8px;">Submit an Event</a>
            </p>
        </div>
    `;
}

// Helper function to wait for events to load - CRITICAL: Max 2 second wait
async function waitForEvents() {
    // CRITICAL: Always check if eventsData is already populated (from force-reload.js)
    if (window.eventsData && window.eventsData.length > 0) {
        console.log('✅ Events already loaded, using immediately');
        return true;
    }

    let eventsLoaded = false;
    if (window.eventsLoadedPromise) {
        try {
            // CRITICAL: Reduced timeout to 2 seconds - events should load faster now
            await Promise.race([
                window.eventsLoadedPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout: Events took too long to load')), 2000)
                )
            ]);
            eventsLoaded = true;
        } catch (error) {
            console.warn('Events load timeout, using available data:', error);
            // Even on timeout, use whatever data we have
            eventsLoaded = window.eventsData && window.eventsData.length > 0;
        }
    } else {
        // Wait max 2 seconds for promise to appear
        await new Promise(resolve => {
            let attempts = 0;
            const checkPromise = setInterval(() => {
                attempts++;
                if (window.eventsLoadedPromise) {
                    clearInterval(checkPromise);
                    window.eventsLoadedPromise.then(() => {
                        eventsLoaded = true;
                        resolve();
                    }).catch(() => {
                        eventsLoaded = window.eventsData && window.eventsData.length > 0;
                        resolve();
                    });
                } else if (window.eventsData && window.eventsData.length > 0) {
                    // Events already loaded
                    clearInterval(checkPromise);
                    eventsLoaded = true;
                    resolve();
                } else if (attempts >= 20) {
                    // 2 seconds max wait
                    clearInterval(checkPromise);
                    console.warn('⚠️ Events not loaded after 2s, proceeding with available data');
                    eventsLoaded = window.eventsData && window.eventsData.length > 0;
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
function populateEventContainer(container, events, emptyMessage = 'No events yet', maxEvents = 6) {
    container.innerHTML = '';

    // CRITICAL: Limit to max events per section (homepage restructure requirement)
    const displayEvents = events.slice(0, maxEvents);

    if (displayEvents.length === 0) {
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

    displayEvents.forEach(event => {
        const card = createEventCard(event);
        container.appendChild(card);
    });
}

// Load Featured This Week (events from next 7 days, featured or high priority)
async function loadFeaturedThisWeek() {
    const container = document.getElementById('featuredThisWeekEvents');
    if (!container) {
        console.warn('❌ featuredThisWeekEvents container not found');
        return;
    }

    console.log('⏳ Loading Featured This Week section...');
    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        console.log(`📊 Total events available: ${allEvents.length}`);

        const futureEvents = getFutureEvents(allEvents);
        console.log(`📅 Future events: ${futureEvents.length}`);

        // Get events from next 7 days, marked as featured or high priority
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const featuredWeekEvents = futureEvents
            .filter(event => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                const isInNextWeek = eventDate >= now && eventDate <= nextWeek;
                const isFeatured = event.featured || event.priority === 'high';
                return isInNextWeek && isFeatured;
            })
            .slice(0, 6);

        console.log(`⭐ Featured events this week: ${featuredWeekEvents.length}`);

        // If no featured events, show upcoming events from this week
        const displayEvents = featuredWeekEvents.length > 0
            ? featuredWeekEvents
            : futureEvents
                .filter(event => {
                    const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                    return eventDate >= now && eventDate <= nextWeek;
                })
                .slice(0, 6);

        console.log(`✅ Displaying ${displayEvents.length} events in Featured This Week`);
        if (displayEvents.length > 0) {
            console.log('First event:', displayEvents[0].name || displayEvents[0].eventname);
        }

        console.log(`🔥 Featured This Week: ${displayEvents.length} events`);
        populateEventContainer(container, displayEvents, 'No featured events this week', 6);
    } catch (error) {
        console.error('Error loading featured this week:', error);
        showErrorInContainer('featuredThisWeekEvents', { message: 'Something went wrong' });
    }
}

// Load Tonight events (events happening today)
async function loadTonightEvents() {
    const container = document.getElementById('tonightEvents');
    const section = document.getElementById('tonightSection');
    if (!container || !section) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);

        // Get events happening today
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const tonightEvents = futureEvents
            .filter(event => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                return eventDate >= todayStart && eventDate <= todayEnd;
            })
            .slice(0, 6);

        console.log(`🔴 Tonight: ${tonightEvents.length} events`);

        // Only show section if there are events tonight
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
        populateEventContainer(container, editorsPicksEvents, "No editor's picks yet", 6);
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
        populateEventContainer(container, weekendEvents, 'No weekend events yet', 6);
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
        populateEventContainer(container, clubEvents, 'No nightlife events yet', 6);
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
        populateEventContainer(container, cultureEvents, 'No culture events yet', 6);
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
        populateEventContainer(container, freeEvents, 'No free events yet', 6);
    } catch (error) {
        console.error('Error loading free events:', error);
        showErrorInContainer('freeEvents', { message: 'Something went wrong' });
    }
}

