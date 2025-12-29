// Today's Events Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const todayDateElement = document.getElementById('todayDate');
    if (todayDateElement) {
        const today = new Date();
        todayDateElement.textContent = formatDate(getTodayDateString());
    }

    // Load today's events
    loadTodayEvents();

    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter events
            const filter = this.dataset.filter;
            filterEvents(filter);
        });
    });

    // Auto-reload events when updated
    window.addEventListener('eventsUpdated', function(e) {
        console.log('🔄 Events updated, reloading today\'s events...', e.detail);
        loadTodayEvents();
    });
});

async function loadTodayEvents() {
    const eventsContainer = document.getElementById('todayEvents');
    if (!eventsContainer) return;

    eventsContainer.innerHTML = '<div class="event-card placeholder"><div class="event-content"><span class="event-date">Loading...</span></div></div>';

    // Wait for events to load first
    if (window.eventsLoadedPromise) {
        await window.eventsLoadedPromise;
    }

    try {
        let todayEvents = [];

        // Use the loaded events data - Show ALL events for today
        const today = getTodayDateString();
        // Extract date portion from ISO timestamps (e.g., "2026-01-15T00:00:00.000Z" -> "2026-01-15")
        todayEvents = (window.eventsData || []).filter(event => {
            const eventDate = event.date ? event.date.split('T')[0] : '';
            return eventDate === today;
        });
        console.log(`📅 Today (${today}): Found ${todayEvents.length} events from ${window.eventsData?.length || 0} total`);
        
        eventsContainer.innerHTML = '';
        
        if (todayEvents.length === 0) {
            eventsContainer.innerHTML = `
                <div class="event-card placeholder">
                    <div class="event-image"></div>
                    <div class="event-content">
                        <span class="event-date">No events found for today</span>
                        <h3 class="event-title">Check back soon or submit your event!</h3>
                        <a href="submit.html" class="event-link">Submit an Event →</a>
                    </div>
                </div>
            `;
            return;
        }
        
        todayEvents.forEach(event => {
            const card = createEventCard(event);
            eventsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading today\'s events:', error);
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

function filterEvents(category) {
    const today = getTodayDateString();
    const eventsContainer = document.getElementById('todayEvents');
    const cards = eventsContainer.querySelectorAll('.event-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

