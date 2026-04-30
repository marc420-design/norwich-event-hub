// Directory Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        document.getElementById('categoryFilter').value = categoryParam;
    }

    loadDirectoryEvents();

    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('monthFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applySortAndFilters);
    document.getElementById('searchFilter').addEventListener('input', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.filter-chip').forEach(button => button.classList.remove('active'));
            this.classList.add('active');
            applyQuickFilter(this.dataset.filter);
        });
    });

    window.addEventListener('eventsLoaded', loadDirectoryEvents);
    window.addEventListener('eventsUpdated', loadDirectoryEvents);
});

function getDirectoryEvents() {
    return (Array.isArray(window.eventsData) ? window.eventsData : [])
        .filter(event => window.isApprovedFutureEvent ? window.isApprovedFutureEvent(event) : true)
        .sort((left, right) => {
            const leftDate = window.parseEventDate ? window.parseEventDate(left.date) : new Date(left.date);
            const rightDate = window.parseEventDate ? window.parseEventDate(right.date) : new Date(right.date);
            return leftDate - rightDate;
        });
}

async function loadDirectoryEvents() {
    const eventsContainer = document.getElementById('directoryEvents');
    if (!eventsContainer) return;

    eventsContainer.innerHTML = '<div class="loading-directory" style="text-align: center; padding: 3rem; grid-column: 1/-1;"><div class="spinner" style="margin: 0 auto 1rem;"></div><p>Loading events directory...</p></div>';

    try {
        if (typeof window.getSafePublicEvents === 'function') {
            await window.getSafePublicEvents();
        }

        const events = getDirectoryEvents();
        eventsContainer.innerHTML = '';

        if (!events.length) {
            renderDirectoryEmptyState(eventsContainer);
            updateEventCount(0);
            toggleNoResults(false);
            return;
        }

        events.forEach(event => {
            eventsContainer.appendChild(createEventCard(event));
        });

        updateEventCount(events.length);
        applyFilters();
    } catch (error) {
        console.error('Error loading directory events:', error);
        eventsContainer.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                <p style="color: #E53935; font-size: 1.2rem;">We’re having trouble loading events right now. Please try again shortly.</p>
                <button onclick="loadDirectoryEvents()" class="btn btn-secondary" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
        updateEventCount(0);
        toggleNoResults(false);
    }
}

function renderDirectoryEmptyState(container) {
    container.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
            <h3 style="color: #333; margin-bottom: 1rem;">No events listed yet.</h3>
            <p style="color: #666; margin-bottom: 2rem;">No events listed for today yet. Check back soon, browse this weekend, or submit an event.</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="this-weekend.html" class="btn btn-secondary">This Weekend</a>
                <a href="submit.html" class="btn btn-primary">Submit Event</a>
            </div>
        </div>
    `;
}

function findEventByCard(card) {
    const eventId = card.dataset.eventId;
    if (!eventId) return undefined;
    return (window.eventsData || []).find(event => {
        const id = event.id || event.eventid || event.slug || `${event.name || ''}|${event.date || ''}`;
        return String(id) === String(eventId);
    });
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    const cards = document.querySelectorAll('#directoryEvents .event-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const event = findEventByCard(card);
        if (!event) {
            card.style.display = 'none';
            return;
        }

        const categoryMatch = categoryFilter === 'all' || event.category === categoryFilter;
        const eventMonth = event.date && window.getMonthNumber ? window.getMonthNumber(event.date) : null;
        const monthMatch = monthFilter === 'all' || (eventMonth && eventMonth === monthFilter);

        const normalizedPrice = String(event.price || '').toLowerCase();
        const isFree = normalizedPrice === 'free' || normalizedPrice === '£0' || normalizedPrice === '0' || !normalizedPrice;
        let priceMatch = true;
        if (priceFilter === 'free') priceMatch = isFree;
        if (priceFilter === 'paid') priceMatch = !isFree;

        const searchMatch = !searchFilter ||
            (event.name && event.name.toLowerCase().includes(searchFilter)) ||
            (event.description && event.description.toLowerCase().includes(searchFilter)) ||
            (event.location && event.location.toLowerCase().includes(searchFilter));

        const isVisible = categoryMatch && monthMatch && priceMatch && searchMatch;
        card.style.display = isVisible ? 'block' : 'none';
        if (isVisible) visibleCount++;
    });

    updateEventCount(visibleCount);
    toggleNoResults(visibleCount === 0 && cards.length > 0);
}

function applyQuickFilter(filterType) {
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('monthFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('searchFilter').value = '';

    if (filterType === 'free') {
        document.getElementById('priceFilter').value = 'free';
        applyFilters();
        return;
    }

    if (filterType === 'all') {
        applyFilters();
        return;
    }

    const cards = document.querySelectorAll('#directoryEvents .event-card');
    let visibleCount = 0;
    const now = new Date();

    cards.forEach(card => {
        const event = findEventByCard(card);
        if (!event || !event.date) {
            card.style.display = 'none';
            return;
        }

        const eventDate = window.parseEventDate ? window.parseEventDate(event.date) : new Date(event.date);
        let shouldShow = false;

        if (filterType === 'today') {
            shouldShow = window.isToday ? window.isToday(event.date) : false;
        } else if (filterType === 'weekend') {
            const saturday = new Date(now);
            const daysUntilSaturday = (6 - saturday.getDay() + 7) % 7 || 7;
            saturday.setDate(saturday.getDate() + daysUntilSaturday);
            saturday.setHours(0, 0, 0, 0);

            const monday = new Date(saturday);
            monday.setDate(monday.getDate() + 2);
            shouldShow = eventDate >= saturday && eventDate < monday;
        } else if (filterType === 'week') {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            shouldShow = eventDate >= now && eventDate <= nextWeek;
        }

        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) visibleCount++;
    });

    updateEventCount(visibleCount);
    toggleNoResults(visibleCount === 0 && cards.length > 0);
}

function applySortAndFilters() {
    const sortValue = document.getElementById('sortFilter').value;
    const eventsContainer = document.getElementById('directoryEvents');
    const cards = Array.from(eventsContainer.querySelectorAll('.event-card'));

    cards.sort((leftCard, rightCard) => {
        const left = findEventByCard(leftCard);
        const right = findEventByCard(rightCard);
        if (!left || !right) return 0;

        if (sortValue === 'date-desc') {
            return new Date(right.date) - new Date(left.date);
        }
        if (sortValue === 'name') {
            return (left.name || '').localeCompare(right.name || '');
        }
        return new Date(left.date) - new Date(right.date);
    });

    cards.forEach(card => eventsContainer.appendChild(card));
    applyFilters();
}

function clearAllFilters() {
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('monthFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('sortFilter').value = 'date-asc';
    document.getElementById('searchFilter').value = '';

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === 'all');
    });

    applySortAndFilters();
}

function updateEventCount(count) {
    const eventCount = document.getElementById('eventCount');
    if (eventCount) {
        eventCount.textContent = count;
    }
}

function toggleNoResults(show) {
    const noResults = document.getElementById('noResults');
    if (noResults) {
        if (show) {
            noResults.innerHTML = '<p>No events listed for your current filters. Try clearing filters, browse this weekend, or <a href="submit.html">submit an event</a>.</p>';
        }
        noResults.style.display = show ? 'block' : 'none';
    }
}
