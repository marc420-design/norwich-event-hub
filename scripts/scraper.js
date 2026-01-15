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
    // Major Ticket Platforms
    {
        name: "Skiddle - Norwich",
        url: "https://www.skiddle.com/whats-on/Norwich/",
        category: "Mixed",
        type: "platform",
        enabled: true,
        priority: 1
    },
    {
        name: "Eventbrite - Norwich",
        url: "https://www.eventbrite.co.uk/d/united-kingdom--norwich/events/",
        category: "Mixed",
        type: "platform",
        enabled: true,
        priority: 1
    },
    {
        name: "Ents24 - Norwich",
        url: "https://www.ents24.com/uk/norwich/",
        category: "Mixed",
        type: "platform",
        enabled: true,
        priority: 1
    },
    {
        name: "SeeTickets - Norwich",
        url: "https://www.seetickets.com/search?q=norwich",
        category: "Mixed",
        type: "platform",
        enabled: true,
        priority: 1
    },
    {
        name: "Ticketmaster - Norwich",
        url: "https://www.ticketmaster.co.uk/browse/all-categories/music/all/?city=Norwich",
        category: "Mixed",
        type: "platform",
        enabled: true,
        priority: 1
    },
    {
        name: "Dice - Norwich",
        url: "https://dice.fm/city/norwich",
        category: "Nightlife",
        type: "platform",
        enabled: true,
        priority: 1
    },
    {
        name: "Resident Advisor - Norwich",
        url: "https://ra.co/events/uk/norwich",
        category: "Nightlife",
        type: "platform",
        enabled: true,
        priority: 2
    },
    {
        name: "Songkick - Norwich",
        url: "https://www.songkick.com/metro-areas/24852-uk-norwich",
        category: "Gig",
        type: "platform",
        enabled: true,
        priority: 2
    },
    
    // Local Venues
    {
        name: "The Halls Norwich",
        url: "https://www.thehallsnorwich.co.uk/events",
        category: "Gig",
        type: "venue",
        enabled: true,
        priority: 2
    },
    {
        name: "Epic Studios Norwich",
        url: "https://www.epicstudiosnorwich.co.uk/events",
        category: "Nightlife",
        type: "venue",
        enabled: true,
        priority: 2
    },
    {
        name: "Norwich Arts Centre",
        url: "https://www.norwichartscentre.co.uk/events",
        category: "Culture",
        type: "venue",
        enabled: true,
        priority: 2
    },
    {
        name: "Theatre Royal Norwich",
        url: "https://www.theatreroyalnorwich.co.uk/whats-on",
        category: "Theatre",
        type: "venue",
        enabled: true,
        priority: 2
    },
    {
        name: "Norwich Playhouse",
        url: "https://www.norwichplayhouse.co.uk/whats-on",
        category: "Theatre",
        type: "venue",
        enabled: true,
        priority: 2
    },
    {
        name: "The Waterfront Norwich",
        url: "https://www.uea.su/venues/waterfront",
        category: "Gig",
        type: "venue",
        enabled: true,
        priority: 2
    },
    {
        name: "Open Norwich",
        url: "https://opennorwich.co.uk/events",
        category: "Culture",
        type: "venue",
        enabled: true,
        priority: 3
    },
    {
        name: "Norwich Cathedral",
        url: "https://www.cathedral.org.uk/visit/events",
        category: "Culture",
        type: "venue",
        enabled: true,
        priority: 3
    },
    {
        name: "Norwich Castle",
        url: "https://www.museums.norfolk.gov.uk/norwich-castle/events",
        category: "Culture",
        type: "venue",
        enabled: true,
        priority: 3
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

    // REAL-TIME SCRAPING INSTRUCTIONS
    // The Python scraper needs to run server-side for security and to avoid CORS

    progress.style.display = 'none';
    status.style.display = 'block';

    status.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🤖 Real-Time Event Scraper</h3>
            <p style="margin: 0 0 1rem 0; opacity: 0.95;">To fetch REAL events from ticket platforms and venue websites, run the automated scraper:</p>

            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; font-family: monospace; margin: 1rem 0;">
                <strong>Windows:</strong><br>
                <code style="color: #FFD700;">cd automation && python real-time-scraper.py</code><br><br>
                <strong>Or use the quick script:</strong><br>
                <code style="color: #FFD700;">run-scraper.bat</code>
            </div>

            <p style="margin: 1rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                ✅ Scraped events will be posted directly to Google Sheets<br>
                ✅ They'll appear in your "Pending" tab for review<br>
                ✅ Approve the ones you want to publish<br>
                ✅ Automated daily scraping via GitHub Actions (see below)
            </p>
        </div>

        <div style="background: #f0f8ff; border-left: 4px solid #3AB8FF; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h4 style="margin: 0 0 1rem 0; color: #2563eb;">📅 Setup Automated Daily Scraping</h4>
            <p style="margin: 0 0 0.5rem 0; color: #1e40af;">Your GitHub Action is ready! It will scrape events automatically every day at 6 AM.</p>
            <p style="margin: 0; color: #475569; font-size: 0.9rem;">
                Check: <code>.github/workflows/scrape-events.yml</code><br>
                Events will flow automatically: Scraper → Google Sheets → Your Website (real-time)
            </p>
        </div>

        <div style="text-align: center; padding: 1rem;">
            <button onclick="closeScraperModal()" style="padding: 0.75rem 2rem; background: #3AB8FF; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-right: 1rem;">
                Got It!
            </button>
            <a href="https://github.com/${getGithubRepo()}/actions" target="_blank" style="padding: 0.75rem 2rem; background: #6B46C1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block;">
                View GitHub Actions
            </a>
        </div>
    `;

    // Optional: Show demo events if user wants to see the UI
    // Uncomment the line below to show mock events for UI demonstration
    // scrapedEvents = generateMockEvents();
    // renderScrapedEvents();
}

// Helper to get GitHub repo from current URL or config
function getGithubRepo() {
    // Try to extract from deployment or return placeholder
    return 'your-username/norwich-event-hub';
}

function generateMockEvents() {
    const today = new Date();
    const mockEvents = [
        // From Skiddle
        {
            name: "Norwich Comedy Festival 2026",
            date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "19:00",
            location: "Various Venues, Norwich",
            category: "Culture",
            description: "A week-long celebration of comedy featuring stand-up, improv, and sketch shows from the UK's best comedians. Multiple venues across Norwich city centre.",
            price: "£18-£35",
            ticketLink: "https://www.skiddle.com/norwich-comedy-festival",
            source: "Skiddle - Norwich",
            flyer: "https://via.placeholder.com/400x600/FF6B6B/FFFFFF?text=Comedy+Festival",
            vibe: "Chill",
            crowd: "18-60",
            bestFor: "Comedy fans, night out with friends"
        },
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
        // From Eventbrite
        {
            name: "Norwich Vegan Food Market",
            date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "10:00",
            location: "Norwich Market Place",
            category: "Market",
            description: "Discover delicious plant-based food from local vendors. Try vegan burgers, cakes, smoothies, and more. Live music and sustainability workshops throughout the day.",
            price: "Free Entry",
            ticketLink: "https://www.eventbrite.co.uk/norwich-vegan-market",
            source: "Eventbrite - Norwich",
            flyer: "https://via.placeholder.com/400x600/4ECDC4/FFFFFF?text=Vegan+Market",
            vibe: "Chill",
            crowd: "All ages",
            bestFor: "Food lovers, families, vegans"
        },
        // From Ents24
        {
            name: "Indie Rock Night: The Strokes Tribute",
            date: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "20:00",
            location: "The Waterfront, Norwich",
            category: "Gig",
            description: "The UK's premier Strokes tribute band delivers all the hits. Expect Last Nite, Reptilia, and more indie anthems that'll have you dancing all night.",
            price: "£14",
            ticketLink: "https://www.ents24.com/uk/norwich/strokes-tribute",
            source: "Ents24 - Norwich",
            flyer: "https://via.placeholder.com/400x600/E94B3C/FFFFFF?text=Indie+Rock",
            vibe: "Underground",
            crowd: "18-35",
            bestFor: "Indie fans, rock lovers"
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
        // From Ticketmaster
        {
            name: "West End Musical: Hamilton",
            date: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "19:30",
            location: "Theatre Royal Norwich",
            category: "Theatre",
            description: "The award-winning Broadway sensation comes to Norwich! Experience the revolutionary story of America's founding father with the show that's making history.",
            price: "£45-£95",
            ticketLink: "https://www.ticketmaster.co.uk/hamilton-norwich",
            source: "Ticketmaster - Norwich",
            flyer: "https://via.placeholder.com/400x600/2C3E50/FFFFFF?text=Hamilton",
            vibe: "Commercial",
            crowd: "All ages",
            bestFor: "Theatre lovers, families"
        },
        // From Dice
        {
            name: "Techno Tuesday: Underground Warehouse",
            date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "23:00",
            location: "Secret Location, Norwich",
            category: "Nightlife",
            description: "Location revealed 24h before. Dark techno and minimal sounds in an industrial warehouse setting. Berlin vibes in Norwich. Bring your dancing shoes.",
            price: "£8",
            ticketLink: "https://dice.fm/event/norwich-techno",
            source: "Dice - Norwich",
            flyer: "https://via.placeholder.com/400x600/1A1A1A/FFFFFF?text=Techno",
            vibe: "Underground",
            crowd: "20-35",
            bestFor: "Techno heads, ravers"
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
        // From Resident Advisor
        {
            name: "Jungle & Breakbeat: Rupture",
            date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "22:00",
            location: "Epic Studios, Norwich",
            category: "Nightlife",
            description: "Cutting-edge jungle and breakbeat from UK's finest selectors. Expect rolling breaks, heavy bass, and high-energy vibes until 4am.",
            price: "£10",
            ticketLink: "https://ra.co/events/norwich-rupture",
            source: "Resident Advisor - Norwich",
            flyer: "https://via.placeholder.com/400x600/00D9FF/000000?text=Rupture",
            vibe: "Heavy",
            crowd: "18-30",
            bestFor: "Jungle fans, ravers"
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
        // From Songkick
        {
            name: "Arctic Monkeys Tribute Night",
            date: new Date(today.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "20:30",
            location: "The Waterfront, Norwich",
            category: "Gig",
            description: "The ultimate Arctic Monkeys tribute experience. All the hits from AM, Whatever People Say I Am, and more. Plus support from local indie bands.",
            price: "£12",
            ticketLink: "https://www.songkick.com/norwich-arctic-monkeys",
            source: "Songkick - Norwich",
            flyer: "https://via.placeholder.com/400x600/8B4513/FFFFFF?text=Arctic+Monkeys",
            vibe: "Commercial",
            crowd: "18-40",
            bestFor: "Rock fans, indie lovers"
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
        },
        // From SeeTickets
        {
            name: "Norwich Food & Drink Festival",
            date: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "11:00",
            location: "Norwich Forum & Surrounding Streets",
            category: "Market",
            description: "Three days of food stalls, drink tastings, live cooking demos, and street food from around the world. Local producers, craft beers, and family entertainment.",
            price: "Free Entry",
            ticketLink: "https://www.seetickets.com/norwich-food-festival",
            source: "SeeTickets - Norwich",
            flyer: "https://via.placeholder.com/400x600/FFA500/FFFFFF?text=Food+Festival",
            vibe: "Chill",
            crowd: "All ages",
            bestFor: "Foodies, families, everyone!"
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
