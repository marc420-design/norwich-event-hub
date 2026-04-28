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

    eventsContainer.innerHTML = '<div class="loading-today" style="text-align: center; padding: 3rem;"><div class="spinner" style="margin: 0 auto 1rem;"></div><p>Checking today\'s events...</p></div>';

    // Wait for events to load first (with timeout)
    if (window.eventsLoadedPromise) {
        try {
            await Promise.race([
                window.eventsLoadedPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                )
            ]);
        } catch (error) {
            console.warn('Events load timeout for today page');
        }
    }

    try {
        const allEvents = window.eventsData || [];
        
        // Filter for approved and today's events
        const todayEvents = allEvents.filter(event => {
            const isApproved = event.status && event.status.toLowerCase() === 'approved';
            const isToday = event.date && window.isToday && window.isToday(event.date);
            return isApproved && isToday;
        });

        console.log(`📅 Today: Found ${todayEvents.length} approved events out of ${allEvents.length} total.`);

        eventsContainer.innerHTML = '';

        if (todayEvents.length === 0) {
            eventsContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 4rem 2rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #e5e7eb;">
                    <h3 style="color: #333; margin-bottom: 1rem;">No events listed for today yet.</h3>
                    <p style="color: #666; margin-bottom: 2rem;">Looking for something soon? View this weekend’s events or browse the full directory.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="this-weekend.html" class="btn btn-secondary">This Weekend</a>
                        <a href="directory.html" class="btn btn-secondary">Full Directory</a>
                        <a href="submit.html" class="btn btn-primary">Submit Event</a>
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
            <div class="error-state" style="text-align: center; padding: 3rem;">
                <p style="color: #E53935; font-size: 1.2rem;">We’re having trouble loading events right now. Please try again shortly.</p>
                <button onclick="loadTodayEvents()" class="btn btn-secondary" style="margin-top: 1rem;">Retry</button>
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

