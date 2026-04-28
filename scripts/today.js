// Today's Events Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
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
        button.addEventListener('click', function () {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter events
            const filter = this.dataset.filter;
            filterEvents(filter);
        });
    });

    // Auto-reload events when updated
    window.addEventListener('eventsUpdated', function (e) {
        console.log('🔄 Events updated, reloading today\'s events...', e.detail);
        loadTodayEvents();
    });

    // Listen for error events
    window.addEventListener('eventsLoadError', function (e) {
        console.error('Events load error:', e.detail);
        const eventsContainer = document.getElementById('todayEvents');
        if (eventsContainer) {
            eventsContainer.innerHTML = `
                <div class="event-card placeholder">
                    <div class="event-image"></div>
                    <div class="event-content">
                        <span class="event-date">Unable to load events</span>
                        <h3 class="event-title">${e.detail.message || 'Please try again later'}</h3>
                        <p style="margin-top: 10px; color: #666;">
                            ${e.detail.willRetry !== false ? 'Retrying automatically...' : 'Please refresh the page or check your connection.'}
                        </p>
                        <a href="submit.html" class="event-link" style="margin-top: 15px; display: inline-block;">Submit an Event →</a>
                    </div>
                </div>
            `;
        }
    });
});

async function loadTodayEvents() {
    const eventsContainer = document.getElementById('todayEvents');
    if (!eventsContainer) return;

    eventsContainer.innerHTML = '<div class="event-card placeholder"><div class="event-content"><span class="event-date">Loading...</span></div></div>';

    // Wait for events to load first (with 5-second timeout)
    if (window.eventsLoadedPromise) {
        try {
            await Promise.race([
                window.eventsLoadedPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout: Events took too long to load')), 5000)
                )
            ]);
        } catch (error) {
            console.error('Events load timeout:', error);
        }
    }

    try {
        let todayEvents = [];

        todayEvents = (window.eventsData || []).filter(event => {
            return event.date && window.isToday && window.isToday(event.date);
        });
        const today = window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0];
        console.log(`📅 Today (${today}): Found ${todayEvents.length} events from ${window.eventsData?.length || 0} total`);

        eventsContainer.innerHTML = '';

        if (todayEvents.length === 0) {
            eventsContainer.innerHTML = `
                <div class="event-card placeholder">
                    <div class="event-image"></div>
                    <div class="event-content">
                        <span class="event-date">No events listed for today yet</span>
                        <h3 class="event-title">Looking for something soon?</h3>
                        <p style="margin: 0.5rem 0; color: rgba(255,255,255,0.7);">
                            <a href="this-weekend.html" style="color: var(--color-electric-blue, #3AB8FF);">View this weekend's events</a>
                            or <a href="directory.html" style="color: var(--color-electric-blue, #3AB8FF);">browse the full directory</a>.
                        </p>
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
                    <span class="event-date">Unable to load events</span>
                    <h3 class="event-title">We're having trouble loading events right now. Please try again shortly.</h3>
                    <a href="directory.html" class="event-link" style="margin-top: 15px; display: inline-block;">Browse Full Directory →</a>
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

