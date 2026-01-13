// Event Scraper for Admin Dashboard

let scrapedEvents = [];
let eventSourcesConfig = [];

// Initialize scraper
document.addEventListener('DOMContentLoaded', function() {
    const scrapeBtn = document.getElementById('scrapeEventsBtn');
    if (scrapeBtn) {
        scrapeBtn.addEventListener('click', openScraperModal);
    }
});

// Event sources configuration
const EVENT_SOURCES = [
    {
        name: "The Halls Norwich",
        url: "https://www.thehallsnorwich.co.uk/events",
        category: "Gig",
        enabled: true
    },
    {
        name: "Epic Studios Norwich",
        url: "https://www.epicstudiosnorwich.co.uk/events",
        category: "Nightlife",
        enabled: true
    },
    {
        name: "Norwich Arts Centre",
        url: "https://www.norwichartscentre.co.uk/events",
        category: "Culture",
        enabled: true
    },
    {
        name: "Theatre Royal Norwich",
        url: "https://www.theatreroyalnorwich.co.uk/whats-on",
        category: "Theatre",
        enabled: true
    },
    {
        name: "Norwich Playhouse",
        url: "https://www.norwichplayhouse.co.uk/whats-on",
        category: "Theatre",
        enabled: true
    }
];

function openScraperModal() {
    const modal = document.getElementById('scraperModal');
    const progress = document.getElementById('scraperProgress');
    const status = document.getElementById('scraperStatus');
    const list = document.getElementById('scrapedEventsList');
    
    // Reset modal
    modal.classList.add('active');
    progress.style.display = 'block';
    status.style.display = 'none';
    list.innerHTML = '';
    
    // Start scraping
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
    
    // Show mock events (replace with actual scraping)
    // For now, we'll generate sample events to demonstrate the UI
    setTimeout(() => {
        progress.style.display = 'none';
        status.style.display = 'block';
        
        // Generate mock events from sources
        scrapedEvents = generateMockEvents();
        
        status.innerHTML = `
            <strong>✅ Scraping Complete!</strong><br>
            Found <strong>${scrapedEvents.length}</strong> events from <strong>${EVENT_SOURCES.length}</strong> sources
        `;
        
        renderScrapedEvents();
    }, 2000);
}

function generateMockEvents() {
    const today = new Date();
    const mockEvents = [
        {
            name: "Live Jazz Night with The Norwich Quartet",
            date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "20:00",
            location: "The Halls, Norwich",
            category: "Gig",
            description: "An evening of smooth jazz featuring some of Norwich's finest musicians. Experience classic jazz standards and contemporary pieces in an intimate venue setting.",
            price: "£15",
            ticketLink: "https://www.thehallsnorwich.co.uk/tickets",
            source: "The Halls Norwich",
            flyer: "https://via.placeholder.com/400x600/3AB8FF/FFFFFF?text=Jazz+Night",
            vibe: "Chill",
            crowd: "25-55",
            bestFor: "Jazz enthusiasts, date night"
        },
        {
            name: "Saturday Night House Party",
            date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "22:00",
            location: "Epic Studios, Norwich",
            category: "Nightlife",
            description: "The biggest house party in Norwich! Featuring resident DJs spinning the best house, techno, and disco all night long. Three rooms, three vibes, one incredible night.",
            price: "£12",
            ticketLink: "https://www.epicstudiosnorwich.co.uk/tickets",
            source: "Epic Studios Norwich",
            flyer: "https://via.placeholder.com/400x600/FF5733/FFFFFF?text=House+Party",
            vibe: "Commercial",
            crowd: "18-30",
            bestFor: "Party lovers, house music fans"
        },
        {
            name: "Contemporary Art Exhibition Opening",
            date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "18:00",
            location: "Norwich Arts Centre",
            category: "Culture",
            description: "Opening night of our new contemporary art exhibition featuring local and international artists. Includes live music, refreshments, and meet-the-artist session.",
            price: "Free",
            ticketLink: "https://www.norwichartscentre.co.uk/events",
            source: "Norwich Arts Centre",
            flyer: "https://via.placeholder.com/400x600/9F7AEA/FFFFFF?text=Art+Exhibition",
            vibe: "Chill",
            crowd: "All ages",
            bestFor: "Art lovers, culture seekers"
        },
        {
            name: "Romeo and Juliet - Opening Night",
            date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "19:30",
            location: "Theatre Royal Norwich",
            category: "Theatre",
            description: "Shakespeare's timeless tragedy comes to life in this stunning new production. A tale of young love, family conflict, and destiny.",
            price: "£28",
            ticketLink: "https://www.theatreroyalnorwich.co.uk/book",
            source: "Theatre Royal Norwich",
            flyer: "https://via.placeholder.com/400x600/234F32/FFFFFF?text=Romeo+Juliet",
            vibe: "Chill",
            crowd: "All ages",
            bestFor: "Theatre lovers, couples"
        },
        {
            name: "Underground Drum & Bass Night",
            date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "22:30",
            location: "Epic Studios, Norwich",
            category: "Nightlife",
            description: "Heavy basslines and rolling breaks all night. Featuring special guest DJs from London's underground scene. This is not for the faint-hearted!",
            price: "£10",
            ticketLink: "https://www.epicstudiosnorwich.co.uk/tickets",
            source: "Epic Studios Norwich",
            flyer: "https://via.placeholder.com/400x600/C70039/FFFFFF?text=DnB+Night",
            vibe: "Heavy",
            crowd: "18-35",
            bestFor: "DnB heads, ravers"
        }
    ];
    
    return mockEvents;
}

function renderScrapedEvents() {
    const list = document.getElementById('scrapedEventsList');
    
    list.innerHTML = scrapedEvents.map((event, index) => `
        <div class="scraped-event-card" data-event-index="${index}">
            <div class="scraped-event-header">
                <div class="scraped-event-info">
                    <h3>${event.name}</h3>
                    <div class="scraped-event-meta">
                        <span>📅 ${formatDate(event.date)}</span>
                        <span>🕐 ${event.time}</span>
                        <span>📍 ${event.location}</span>
                        <span>💰 ${event.price}</span>
                    </div>
                    <div class="event-badges">
                        <span class="event-badge badge-source">${event.source}</span>
                        <span class="event-badge" style="background: #3AB8FF; color: white;">${event.category}</span>
                    </div>
                </div>
            </div>
            <div class="scraped-event-description">
                ${event.description}
            </div>
            <div class="scraped-event-actions">
                <button class="btn-approve" onclick="approveEvent(${index})">
                    ✓ Approve & Add
                </button>
                <button class="btn-featured" id="featured-${index}" onclick="toggleFeatured(${index})">
                    ⭐ Featured
                </button>
                <button class="btn-editors" id="editors-${index}" onclick="toggleEditors(${index})">
                    👑 Editor's Choice
                </button>
                <button class="btn-reject" onclick="rejectEvent(${index})">
                    ✗ Skip
                </button>
            </div>
        </div>
    `).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function toggleFeatured(index) {
    const btn = document.getElementById(`featured-${index}`);
    const event = scrapedEvents[index];
    
    if (!event.featured) {
        event.featured = true;
        btn.classList.add('active');
        btn.innerHTML = '⭐ Featured ✓';
    } else {
        event.featured = false;
        btn.classList.remove('active');
        btn.innerHTML = '⭐ Featured';
    }
}

function toggleEditors(index) {
    const btn = document.getElementById(`editors-${index}`);
    const event = scrapedEvents[index];
    
    if (!event.editorsChoice) {
        event.editorsChoice = true;
        btn.classList.add('active');
        btn.innerHTML = '👑 Editor\'s Choice ✓';
    } else {
        event.editorsChoice = false;
        btn.classList.remove('active');
        btn.innerHTML = '👑 Editor\'s Choice';
    }
}

async function approveEvent(index) {
    const event = scrapedEvents[index];
    const card = document.querySelector(`[data-event-index="${index}"]`);
    
    // Show loading state
    card.style.opacity = '0.6';
    card.style.pointerEvents = 'none';
    
    // Prepare event data for API
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
        promoterEmail: "scraper@norwicheventshub.com",
        status: "approved",
        featured: event.featured || false,
        editorsChoice: event.editorsChoice || false
    };
    
    try {
        // Submit to API
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success - remove from list
            card.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #f0fff4; border-radius: 8px;">
                    <h3 style="color: #48BB78; margin: 0;">✅ Event Added Successfully!</h3>
                    <p style="margin: 0.5rem 0 0 0;">Event ID: ${result.eventId || 'N/A'}</p>
                    ${event.featured ? '<p style="margin: 0.5rem 0 0 0;">⭐ Marked as Featured</p>' : ''}
                    ${event.editorsChoice ? '<p style="margin: 0.5rem 0 0 0;">👑 Marked as Editor\'s Choice</p>' : ''}
                </div>
            `;
            
            // Remove from scraped events after delay
            setTimeout(() => {
                card.style.display = 'none';
                scrapedEvents.splice(index, 1);
            }, 3000);
            
            // Reload main events list
            if (typeof loadEvents === 'function') {
                loadEvents();
            }
        } else {
            throw new Error(result.message || 'Failed to add event');
        }
    } catch (error) {
        console.error('Error adding event:', error);
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        
        // Show error
        alert(`Error adding event: ${error.message}\n\nPlease try again.`);
    }
}

function rejectEvent(index) {
    const card = document.querySelector(`[data-event-index="${index}"]`);
    
    // Animate out
    card.style.transition = 'all 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        card.remove();
        scrapedEvents.splice(index, 1);
        
        // Check if all events processed
        if (scrapedEvents.length === 0) {
            document.getElementById('scrapedEventsList').innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h3>✨ All events processed!</h3>
                    <p>You can close this window or scrape again.</p>
                    <button onclick="scrapeEvents()" style="padding: 0.75rem 2rem; background: #3AB8FF; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem;">
                        🔄 Scrape Again
                    </button>
                </div>
            `;
        }
    }, 300);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('scraperModal');
    if (e.target === modal) {
        closeScraperModal();
    }
});
