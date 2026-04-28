// Directory Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check for category filter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    if (categoryParam) {
        document.getElementById('categoryFilter').value = categoryParam;
    }

    // Load all events
    loadDirectoryEvents();

    // Filter event listeners
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('monthFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applySortAndFilters);
    document.getElementById('searchFilter').addEventListener('input', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

    // Quick filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            // Apply quick filter
            applyQuickFilter(this.dataset.filter);
        });
    });

    // Auto-reload events when updated
    window.addEventListener('eventsUpdated', function(e) {
        console.log('🔄 Events updated, reloading directory...', e.detail);
        loadDirectoryEvents();
    });
});

async function loadDirectoryEvents() {
    const eventsContainer = document.getElementById('directoryEvents');
    if (!eventsContainer) return;

    eventsContainer.innerHTML = '<div class="loading-directory" style="text-align: center; padding: 3rem; grid-column: 1/-1;"><div class="spinner" style="margin: 0 auto 1rem;"></div><p>Loading events directory...</p></div>';

    // Wait for events to load first
    if (window.eventsLoadedPromise) {
        await window.eventsLoadedPromise;
    }

    try {
        let allEvents = (window.eventsData || []);
        
        // Filter for approved and future events
        const filteredEvents = allEvents.filter(event => {
            const isApproved = event.status && event.status.toLowerCase() === 'approved';
            const hasDate = event.date;
            const isFuture = hasDate && window.isFutureEvent && window.isFutureEvent(event.date);
            return isApproved && isFuture;
        });

        console.log(`📊 Directory: ${filteredEvents.length} approved future events found out of ${allEvents.length} total.`);
        
        eventsContainer.innerHTML = '';
        
        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 4rem 2rem; grid-column: 1/-1; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                    <h3 style="color: #333; margin-bottom: 1rem;">No events found yet.</h3>
                    <p style="color: #666; margin-bottom: 2rem;">Check the full directory, this weekend’s events, or submit an event.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="this-weekend.html" class="btn btn-secondary">This Weekend</a>
                        <a href="submit.html" class="btn btn-primary">Submit Event</a>
                    </div>
                </div>
            `;
            return;
        }
        
        // Sort events by date
        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const dateA = window.parseEventDate ? window.parseEventDate(a.date) : new Date(a.date);
            const dateB = window.parseEventDate ? window.parseEventDate(b.date) : new Date(b.date);
            return dateA - dateB;
        });
        
        // Update window.eventsData with sorted/filtered events for consistency
        // Note: we keep the original window.eventsData for other filters
        
        sortedEvents.forEach(event => {
            const card = createEventCard(event);
            eventsContainer.appendChild(card);
        });

        // Update initial event count
        const eventCount = document.getElementById('eventCount');
        if (eventCount) {
            eventCount.textContent = sortedEvents.length;
        }

        applyFilters();
    } catch (error) {
        console.error('Error loading directory events:', error);
        eventsContainer.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                <p style="color: #E53935; font-size: 1.2rem;">We’re having trouble loading events right now. Please try again shortly.</p>
                <button onclick="loadDirectoryEvents()" class="btn btn-secondary" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    const eventsContainer = document.getElementById('directoryEvents');
    const noResults = document.getElementById('noResults');
    const eventCount = document.getElementById('eventCount');

    const cards = eventsContainer.querySelectorAll('.event-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const eventId = card.dataset.eventId;
        if (!eventId) {
            // If card has no eventId, hide it during filtering
            card.style.display = 'none';
            return;
        }

        const event = (window.eventsData || []).find(e => e.id === parseInt(eventId));
        if (!event) {
            card.style.display = 'none';
            return;
        }

        // Category filter
        const categoryMatch = categoryFilter === 'all' || event.category === categoryFilter;

        // Month filter - use getMonthNumber utility for proper parsing
        const eventMonth = event.date && window.getMonthNumber ? window.getMonthNumber(event.date) : null;
        const monthMatch = monthFilter === 'all' || (eventMonth && eventMonth === monthFilter);

        // Price filter
        let priceMatch = true;
        if (priceFilter === 'free') {
            priceMatch = !event.price || event.price === 'Free' || event.price === '0' || event.price === 0;
        } else if (priceFilter === 'paid') {
            priceMatch = event.price && event.price !== 'Free' && event.price !== '0' && event.price !== 0;
        }

        // Search filter - add null checks to prevent crashes
        const searchMatch = !searchFilter ||
            (event.name && event.name.toLowerCase().includes(searchFilter)) ||
            (event.description && event.description.toLowerCase().includes(searchFilter)) ||
            (event.location && event.location.toLowerCase().includes(searchFilter));

        if (categoryMatch && monthMatch && priceMatch && searchMatch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update event count
    if (eventCount) {
        eventCount.textContent = visibleCount;
    }

    // Show/hide no results message
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

function applyQuickFilter(filterType) {
    const now = new Date();
    const eventsContainer = document.getElementById('directoryEvents');
    const noResults = document.getElementById('noResults');
    const eventCount = document.getElementById('eventCount');
    const cards = eventsContainer.querySelectorAll('.event-card');
    let visibleCount = 0;

    // Reset other filters when using quick filters
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('monthFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('searchFilter').value = '';

    if (filterType === 'all') {
        // Show all events
        cards.forEach(card => {
            if (card.dataset.eventId) {
                card.style.display = 'block';
                visibleCount++;
            }
        });
    } else if (filterType === 'free') {
        // Show only free events
        document.getElementById('priceFilter').value = 'free';
        applyFilters();
        return;
    } else {
        cards.forEach(card => {
            const eventId = card.dataset.eventId;
            if (!eventId) {
                card.style.display = 'none';
                return;
            }

            const event = (window.eventsData || []).find(e => e.id === parseInt(eventId));
            if (!event || !event.date) {
                card.style.display = 'none';
                return;
            }

            const eventDate = new Date(event.date);
            let shouldShow = false;

            if (filterType === 'today') {
                // Show events happening today
                shouldShow = eventDate.toDateString() === now.toDateString();
            } else if (filterType === 'weekend') {
                // Show events this weekend (Saturday and Sunday)
                const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
                const thisSaturday = new Date(now);
                thisSaturday.setDate(now.getDate() + daysUntilSaturday);
                thisSaturday.setHours(0, 0, 0, 0);

                const thisSunday = new Date(thisSaturday);
                thisSunday.setDate(thisSaturday.getDate() + 1);

                const nextMonday = new Date(thisSunday);
                nextMonday.setDate(thisSunday.getDate() + 1);

                shouldShow = eventDate >= thisSaturday && eventDate < nextMonday;
            } else if (filterType === 'week') {
                // Show events in the next 7 days
                const nextWeek = new Date(now);
                nextWeek.setDate(now.getDate() + 7);
                shouldShow = eventDate >= now && eventDate <= nextWeek;
            }

            if (shouldShow) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Update event count
    if (eventCount) {
        eventCount.textContent = visibleCount;
    }

    // Show/hide no results message
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

function applySortAndFilters() {
    const sortValue = document.getElementById('sortFilter').value;
    const eventsContainer = document.getElementById('directoryEvents');

    // Get all visible event cards
    const cards = Array.from(eventsContainer.querySelectorAll('.event-card'));

    // Sort cards based on selection
    cards.sort((a, b) => {
        const eventIdA = a.dataset.eventId;
        const eventIdB = b.dataset.eventId;

        if (!eventIdA || !eventIdB) return 0;

        const eventA = (window.eventsData || []).find(e => e.id === parseInt(eventIdA));
        const eventB = (window.eventsData || []).find(e => e.id === parseInt(eventIdB));

        if (!eventA || !eventB) return 0;

        if (sortValue === 'date-asc') {
            return new Date(eventA.date) - new Date(eventB.date);
        } else if (sortValue === 'date-desc') {
            return new Date(eventB.date) - new Date(eventA.date);
        } else if (sortValue === 'name') {
            return (eventA.name || '').localeCompare(eventB.name || '');
        }

        return 0;
    });

    // Re-append cards in sorted order
    cards.forEach(card => eventsContainer.appendChild(card));

    // Apply filters after sorting
    applyFilters();
}

function clearAllFilters() {
    // Reset all filter controls
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('monthFilter').value = 'all';
    document.getElementById('priceFilter').value = 'all';
    document.getElementById('sortFilter').value = 'date-asc';
    document.getElementById('searchFilter').value = '';

    // Reset quick filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.filter === 'all') {
            chip.classList.add('active');
        }
    });

    // Re-apply default sorting and show all events
    applySortAndFilters();
}

// createEventCard is already defined in main.js and includes eventId

