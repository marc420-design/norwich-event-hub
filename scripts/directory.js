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

    eventsContainer.innerHTML = '<div class="event-card placeholder"><div class="event-content"><span class="event-date">Loading...</span></div></div>';

    // Wait for events to load first
    if (window.eventsLoadedPromise) {
        await window.eventsLoadedPromise;
    }

    try {
        let allEvents = [];

        // Use the loaded events data - Show ALL events
        allEvents = (window.eventsData || []);
        console.log(`📊 Loaded ${allEvents.length} events from window.eventsData`);
        
        eventsContainer.innerHTML = '';
        
        if (allEvents.length === 0) {
            eventsContainer.innerHTML = `
                <div class="event-card placeholder">
                    <div class="event-image"></div>
                    <div class="event-content">
                        <span class="event-date">No events found</span>
                        <h3 class="event-title">Events directory coming soon</h3>
                        <a href="submit.html" class="event-link">Submit an Event →</a>
                    </div>
                </div>
            `;
            return;
        }
        
        // Sort events by date
        const sortedEvents = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Update global eventsData for filtering
        window.eventsData = sortedEvents;
        
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
            <div class="event-card placeholder">
                <div class="event-image"></div>
                <div class="event-content">
                    <span class="event-date">Error loading events</span>
                    <h3 class="event-title">Please try again later</h3>
                </div>
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

