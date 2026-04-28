let todayEvents = [];
let activeTodayFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    const todayDateElement = document.getElementById('todayDate');
    if (todayDateElement) {
        todayDateElement.textContent = formatDate(getTodayDateString());
    }

    bindTodayFilters();
    loadTodayEvents();

    window.addEventListener('eventsUpdated', () => loadTodayEvents());
    window.addEventListener('eventsLoadError', (event) => renderTodayError(event.detail));
});

function bindTodayFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeTodayFilter = button.dataset.filter || 'all';
            filterButtons.forEach((entry) => entry.classList.remove('active'));
            button.classList.add('active');
            renderTodayEvents();
        });
    });
}

async function loadTodayEvents() {
    const eventsContainer = document.getElementById('todayEvents');
    if (!eventsContainer) {
        return;
    }

    eventsContainer.innerHTML = '<div class="loading-today" style="text-align: center; padding: 3rem;"><div class="spinner" style="margin: 0 auto 1rem;"></div><p>Checking today\'s events...</p></div>';

    try {
        const allEvents = typeof window.getPublicEvents === 'function'
            ? await window.getPublicEvents()
            : (window.eventsData || []);

        todayEvents = (allEvents || [])
            .filter((event) => window.isApprovedFutureEvent ? window.isApprovedFutureEvent(event) : true)
            .filter((event) => event.date && window.isToday && window.isToday(event.date));

        renderTodayEvents();
    } catch (error) {
        console.error('Error loading today\'s events:', error);
        renderTodayError({ message: 'We are having trouble loading today\'s events.' });
    }
}

function renderTodayEvents() {
    const eventsContainer = document.getElementById('todayEvents');
    if (!eventsContainer) {
        return;
    }

    eventsContainer.innerHTML = '';

    if (todayEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem 2rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                <h3 style="color: #333; margin-bottom: 1rem;">No events listed for today yet.</h3>
                <p style="color: #666; margin-bottom: 2rem;">Looking for something soon? View this weekend's events or browse the full directory.</p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="this-weekend.html" class="btn btn-secondary">This Weekend</a>
                    <a href="directory.html" class="btn btn-secondary">Full Directory</a>
                    <a href="submit.html" class="btn btn-primary">Submit Event</a>
                </div>
            </div>
        `;
        return;
    }

    const filteredEvents = todayEvents.filter((event) => matchesTodayFilter(event, activeTodayFilter));

    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 3rem 2rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                <h3 style="color: #333; margin-bottom: 1rem;">No ${activeTodayFilter} events found for today.</h3>
                <p style="color: #666;">Try a different filter or browse the full directory.</p>
            </div>
        `;
        return;
    }

    filteredEvents.forEach((event) => {
        eventsContainer.appendChild(createEventCard(event));
    });
}

function matchesTodayFilter(event, filter) {
    if (filter === 'all') {
        return true;
    }

    if (filter === 'free') {
        return event.isFree === true || (event.price || '').trim().toLowerCase() === 'free';
    }

    return (event.category || '').trim().toLowerCase() === filter;
}

function renderTodayError(detail = {}) {
    const eventsContainer = document.getElementById('todayEvents');
    if (!eventsContainer) {
        return;
    }

    eventsContainer.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 3rem;">
            <p style="color: #E53935; font-size: 1.2rem;">${detail.message || 'Unable to load events right now.'}</p>
            <p style="margin-top: 0.75rem; color: #666;">Please try again shortly.</p>
            <button onclick="loadTodayEvents()" class="btn btn-secondary" style="margin-top: 1rem;">Retry</button>
        </div>
    `;
}
