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
    document.getElementById('searchFilter').addEventListener('input', applyFilters);

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
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    const eventsContainer = document.getElementById('directoryEvents');
    const noResults = document.getElementById('noResults');
    
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

        // Search filter - add null checks to prevent crashes
        const searchMatch = !searchFilter ||
            (event.name && event.name.toLowerCase().includes(searchFilter)) ||
            (event.description && event.description.toLowerCase().includes(searchFilter)) ||
            (event.location && event.location.toLowerCase().includes(searchFilter));
        
        if (categoryMatch && monthMatch && searchMatch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

// createEventCard is already defined in main.js and includes eventId

