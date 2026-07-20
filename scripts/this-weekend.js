// This Weekend Page JavaScript

let weekendEventsCache = [];

document.addEventListener('DOMContentLoaded', async function () {
    updateWeekendDates();

    await loadWeekendEvents();

    window.addEventListener('eventsLoaded', loadWeekendEvents);
    window.addEventListener('eventsUpdated', loadWeekendEvents);
    window.addEventListener('eventsLoadError', function () {
        renderWeekendError();
    });
});

function getWeekendDateRange() {
    const now = new Date();
    const saturday = new Date(now);
    const daysUntilSaturday = (6 - saturday.getDay() + 7) % 7 || 7;
    saturday.setDate(saturday.getDate() + daysUntilSaturday);
    saturday.setHours(0, 0, 0, 0);

    const sunday = new Date(saturday);
    sunday.setDate(sunday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);

    return {
        start: saturday,
        end: sunday
    };
}

function updateWeekendDates() {
    const weekend = getWeekendDateRange();
    const saturdayFormatted = weekend.start.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    const sundayFormatted = weekend.end.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const weekendDateRange = document.getElementById('weekendDateRange');
    const saturdayDate = document.getElementById('saturdayDate');
    const sundayDate = document.getElementById('sundayDate');

    if (weekendDateRange) weekendDateRange.textContent = `${saturdayFormatted} & ${sundayFormatted}`;
    if (saturdayDate) saturdayDate.textContent = saturdayFormatted;
    if (sundayDate) sundayDate.textContent = sundayFormatted;
}

function getWeekendEvents() {
    const weekend = getWeekendDateRange();
    return weekendEventsCache
        .filter(event => window.isApprovedFutureEvent ? window.isApprovedFutureEvent(event) : true)
        .filter(event => {
            const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
            return eventDate >= weekend.start && eventDate <= weekend.end;
        })
        .sort((left, right) => {
            const leftDate = window.parseEventDate ? window.parseEventDate(left.date) : new Date(left.date);
            const rightDate = window.parseEventDate ? window.parseEventDate(right.date) : new Date(right.date);
            return leftDate - rightDate;
        });
}

async function loadWeekendEvents() {
    try {
        const allEvents = typeof window.getSafePublicEvents === 'function'
            ? await window.getSafePublicEvents()
            : (window.eventsData || []);
        weekendEventsCache = Array.isArray(allEvents) ? allEvents : [];
        renderWeekendPage();
    } catch (error) {
        console.error('Weekend events failed to load:', error);
        renderWeekendError();
    }
}

function renderWeekendPage() {
    const weekendEvents = getWeekendEvents();
    const saturdayEvents = weekendEvents.filter(event => {
        const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
        return eventDate.getDay() === 6;
    });
    const sundayEvents = weekendEvents.filter(event => {
        const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
        return eventDate.getDay() === 0;
    });
    const featuredEvents = weekendEvents.filter(event => event.featured || event.editorsChoice).slice(0, 6);

    populateEventContainer('dontMissEvents', featuredEvents, 'No featured events this weekend yet.');
    populateEventContainer('saturdayEvents', saturdayEvents, 'No events listed for Saturday yet.');
    populateEventContainer('sundayEvents', sundayEvents, 'No events listed for Sunday yet.');
    populateEventContainer('allWeekendEvents', weekendEvents, 'No events listed for this weekend yet. Browse all upcoming events or submit one.');
}

function populateEventContainer(containerId, events, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    if (!events.length) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem; background: #f9fafb; border-radius: 8px; border: 1px dashed #ddd; width: 100%; grid-column: 1/-1;">
                <p style="color: #666; margin-bottom: 1rem;">${emptyMessage}</p>
                <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                    <a href="directory.html" class="btn btn-secondary">Browse all upcoming events</a>
                    <a href="submit.html" class="btn btn-primary">Submit Event</a>
                </div>
            </div>
        `;
        return;
    }

    events.forEach(event => {
        container.appendChild(createEventCard(event));
    });
}

function renderWeekendError() {
    ['dontMissEvents', 'saturdayEvents', 'sundayEvents', 'allWeekendEvents'].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                <p style="color: #E53935; font-size: 1.2rem;">We’re having trouble loading events right now. Please try again shortly.</p>
            </div>
        `;
    });
}
