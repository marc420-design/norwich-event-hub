// This Weekend Page - Bookmark-worthy page that auto-updates

document.addEventListener('DOMContentLoaded', async function() {
    // Update date displays
    updateWeekendDates();
    
    // Load all weekend sections
    await loadDontMissEvents();
    await loadSaturdayEvents();
    await loadSundayEvents();
    await loadAllWeekendEvents();
    
    // Listen for error events
    window.addEventListener('eventsLoadError', function(e) {
        console.error('Events load error:', e.detail);
        showErrorInContainer('dontMissEvents', e.detail);
        showErrorInContainer('saturdayEvents', e.detail);
        showErrorInContainer('sundayEvents', e.detail);
        showErrorInContainer('allWeekendEvents', e.detail);
    });
});

function updateWeekendDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Calculate days until Saturday
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);
    
    // Format dates
    const saturdayFormatted = nextSaturday.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    
    const sundayFormatted = nextSunday.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    
    // Update page elements
    const weekendDateRange = document.getElementById('weekendDateRange');
    const saturdayDate = document.getElementById('saturdayDate');
    const sundayDate = document.getElementById('sundayDate');
    
    if (weekendDateRange) {
        weekendDateRange.textContent = `${saturdayFormatted} & ${sundayFormatted}`;
    }
    if (saturdayDate) {
        saturdayDate.textContent = saturdayFormatted;
    }
    if (sundayDate) {
        sundayDate.textContent = sundayFormatted;
    }
}

function showErrorInContainer(containerId, errorDetail) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="event-card placeholder">
                <div class="event-content">
                    <span class="event-date">Unable to load events</span>
                    <h3 class="event-title">${errorDetail.message || 'Please try again later'}</h3>
                </div>
            </div>
        `;
    }
}

// Helper function to wait for events to load
async function waitForEvents() {
    if (window.eventsData && window.eventsData.length > 0) {
        return true;
    }

    if (window.eventsLoadedPromise) {
        try {
            await Promise.race([
                window.eventsLoadedPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 2000)
                )
            ]);
            return true;
        } catch (error) {
            return window.eventsData && window.eventsData.length > 0;
        }
    }
    
    // Wait max 2 seconds
    await new Promise(resolve => {
        let attempts = 0;
        const checkPromise = setInterval(() => {
            attempts++;
            if (window.eventsData && window.eventsData.length > 0) {
                clearInterval(checkPromise);
                resolve();
            } else if (attempts >= 20) {
                clearInterval(checkPromise);
                resolve();
            }
        }, 100);
    });
    
    return window.eventsData && window.eventsData.length > 0;
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

// Get weekend date range
function getWeekendDateRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(0, 0, 0, 0);

    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSaturday.getDate() + 1);
    nextSunday.setHours(23, 59, 59, 999);

    return { start: nextSaturday, end: nextSunday };
}

// Load Don't Miss events (high priority or featured)
async function loadDontMissEvents() {
    const container = document.getElementById('dontMissEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);
        const { start, end } = getWeekendDateRange();

        const dontMissEvents = futureEvents
            .filter(event => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                const isInWeekend = eventDate >= start && eventDate <= end;
                const isPriority = event.priority === 'high' || event.featured;
                return isInWeekend && isPriority;
            })
            .slice(0, 6);

        console.log(`🔥 Don't Miss: ${dontMissEvents.length} events`);
        populateEventContainer(container, dontMissEvents, 'No featured events this weekend', 6);
    } catch (error) {
        console.error('Error loading don\'t miss events:', error);
        showErrorInContainer('dontMissEvents', { message: 'Something went wrong' });
    }
}

// Load Saturday events
async function loadSaturdayEvents() {
    const container = document.getElementById('saturdayEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);
        const { start } = getWeekendDateRange();
        const saturdayEnd = new Date(start);
        saturdayEnd.setHours(23, 59, 59, 999);

        const saturdayEvents = futureEvents
            .filter(event => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                return eventDate >= start && eventDate <= saturdayEnd;
            })
            .slice(0, 12);

        console.log(`📅 Saturday: ${saturdayEvents.length} events`);
        populateEventContainer(container, saturdayEvents, 'No events on Saturday', 12);
    } catch (error) {
        console.error('Error loading Saturday events:', error);
        showErrorInContainer('saturdayEvents', { message: 'Something went wrong' });
    }
}

// Load Sunday events
async function loadSundayEvents() {
    const container = document.getElementById('sundayEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);
        const { end } = getWeekendDateRange();
        const sundayStart = new Date(end);
        sundayStart.setHours(0, 0, 0, 0);

        const sundayEvents = futureEvents
            .filter(event => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                return eventDate >= sundayStart && eventDate <= end;
            })
            .slice(0, 12);

        console.log(`📅 Sunday: ${sundayEvents.length} events`);
        populateEventContainer(container, sundayEvents, 'No events on Sunday', 12);
    } catch (error) {
        console.error('Error loading Sunday events:', error);
        showErrorInContainer('sundayEvents', { message: 'Something went wrong' });
    }
}

// Load all weekend events
async function loadAllWeekendEvents() {
    const container = document.getElementById('allWeekendEvents');
    if (!container) return;

    await waitForEvents();

    try {
        const allEvents = window.eventsData || [];
        const futureEvents = getFutureEvents(allEvents);
        const { start, end } = getWeekendDateRange();

        const weekendEvents = futureEvents
            .filter(event => {
                const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
                return eventDate >= start && eventDate <= end;
            })
            .slice(0, 18);

        console.log(`🎉 All Weekend: ${weekendEvents.length} events`);
        populateEventContainer(container, weekendEvents, 'No events this weekend', 18);
    } catch (error) {
        console.error('Error loading all weekend events:', error);
        showErrorInContainer('allWeekendEvents', { message: 'Something went wrong' });
    }
}

