let scrapedEvents = [];

document.addEventListener('DOMContentLoaded', () => {
    const scrapeBtn = document.getElementById('scrapeEventsBtn');
    if (scrapeBtn) {
        scrapeBtn.addEventListener('click', openScraperModal);
    }
});

function openScraperModal() {
    const modal = document.getElementById('scraperModal');
    const progress = document.getElementById('scraperProgress');
    const status = document.getElementById('scraperStatus');
    const list = document.getElementById('scrapedEventsList');

    modal.classList.add('active');
    progress.style.display = 'block';
    status.style.display = 'none';
    list.innerHTML = '';
    scrapeEvents();
}

function closeScraperModal() {
    const modal = document.getElementById('scraperModal');
    modal.classList.remove('active');
}

async function scrapeEvents() {
    const progress = document.getElementById('scraperProgress');
    const status = document.getElementById('scraperStatus');
    const list = document.getElementById('scrapedEventsList');

    progress.style.display = 'block';
    status.style.display = 'block';
    status.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Scraping events from ticket platforms...</p>';
    list.innerHTML = '';

    try {
        const response = await fetch('/scrape-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        progress.style.display = 'none';

        if (data.success && data.events && data.events.length > 0) {
            scrapedEvents = data.events;
            status.innerHTML = `
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="margin: 0 0 0.5rem 0;">Found ${data.stats.total} Events</h3>
                    <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">
                        ${Object.entries(data.stats.bySource || {}).map(([source, count]) => count > 0 ? `${source}: ${count}` : '').filter(Boolean).join(' • ')}
                    </p>
                </div>
            `;
            renderScrapedEvents();
            return;
        }

        if (data.success && data.events.length === 0) {
            status.innerHTML = `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5rem; border-radius: 8px;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #92400e;">No Events Found</h4>
                    <p style="margin: 0; color: #78350f;">The scraper did not find any new events at this time.</p>
                </div>
            `;
            return;
        }

        throw new Error(data.message || 'Failed to scrape events');
    } catch (error) {
        console.error('Scraping error:', error);
        progress.style.display = 'none';
        status.innerHTML = `
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #991b1b;">Scraping Failed</h4>
                <p style="margin: 0; color: #7f1d1d;">${error.message || 'Unable to connect to scraping service'}</p>
            </div>
        `;
    }
}

function renderScrapedEvents() {
    const list = document.getElementById('scrapedEventsList');

    list.innerHTML = scrapedEvents.map((event, index) => `
        <div class="scraped-event-card" data-event-index="${index}">
            <div class="scraped-event-header">
                <div class="scraped-event-info">
                    <h3>${event.name}</h3>
                    <div class="scraped-event-meta">
                        <span>${formatScrapedDate(event.date)}</span>
                        <span>${event.time}</span>
                        <span>${event.location}</span>
                        <span>${event.price}</span>
                    </div>
                    <div class="event-badges">
                        <span class="event-badge badge-source">${event.source}</span>
                        <span class="event-badge" style="background: #3AB8FF; color: white;">${event.category}</span>
                    </div>
                </div>
            </div>
            <div class="scraped-event-description">${event.description}</div>
            <div class="scraped-event-actions">
                <button class="btn-approve" onclick="approveScrapedEvent(${index})">Approve & Add</button>
                <button class="btn-featured" id="featured-${index}" onclick="toggleFeatured(${index})">Featured</button>
                <button class="btn-editors" id="editors-${index}" onclick="toggleEditors(${index})">Editor's Choice</button>
                <button class="btn-reject" onclick="rejectScrapedEvent(${index})">Skip</button>
            </div>
        </div>
    `).join('');
}

function formatScrapedDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function toggleFeatured(index) {
    const button = document.getElementById(`featured-${index}`);
    const event = scrapedEvents[index];
    event.featured = !event.featured;
    button.classList.toggle('active', event.featured);
    button.textContent = event.featured ? 'Featured ✓' : 'Featured';
}

function toggleEditors(index) {
    const button = document.getElementById(`editors-${index}`);
    const event = scrapedEvents[index];
    event.editorsChoice = !event.editorsChoice;
    button.classList.toggle('active', event.editorsChoice);
    button.textContent = event.editorsChoice ? "Editor's Choice ✓" : "Editor's Choice";
}

async function approveScrapedEvent(index) {
    const event = scrapedEvents[index];
    const card = document.querySelector(`[data-event-index="${index}"]`);
    card.style.opacity = '0.6';
    card.style.pointerEvents = 'none';

    const eventData = {
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        description: event.description,
        ticketLink: event.ticketLink,
        price: event.price,
        flyer: event.flyer || '',
        vibe: event.vibe,
        crowd: event.crowd,
        bestFor: event.bestFor,
        promoterName: `AI Scraper - ${event.source}`,
        promoterEmail: 'scraper@norwicheventshub.com',
        status: 'approved',
        featured: event.featured || false,
        editorsChoice: event.editorsChoice || false
    };

    try {
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to add event');
        }

        card.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #f0fff4; border-radius: 8px;">
                <h3 style="color: #48BB78; margin: 0;">Event Added Successfully</h3>
                <p style="margin: 0.5rem 0 0 0;">Event ID: ${result.eventId || 'N/A'}</p>
            </div>
        `;

        setTimeout(() => {
            card.style.display = 'none';
            scrapedEvents.splice(index, 1);
        }, 3000);

        if (typeof loadEvents === 'function') {
            loadEvents();
        }
    } catch (error) {
        console.error('Error adding event:', error);
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        alert(`Error adding event: ${error.message}`);
    }
}

function rejectScrapedEvent(index) {
    const card = document.querySelector(`[data-event-index="${index}"]`);
    card.style.transition = 'all 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateX(-20px)';

    setTimeout(() => {
        card.remove();
        scrapedEvents.splice(index, 1);
        if (scrapedEvents.length === 0) {
            document.getElementById('scrapedEventsList').innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h3>All events processed</h3>
                    <p>You can close this window or scrape again.</p>
                    <button onclick="scrapeEvents()" style="padding: 0.75rem 2rem; background: #3AB8FF; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem;">
                        Scrape Again
                    </button>
                </div>
            `;
        }
    }, 300);
}

document.addEventListener('click', (event) => {
    const modal = document.getElementById('scraperModal');
    if (event.target === modal) {
        closeScraperModal();
    }
});
