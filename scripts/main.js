// Main JavaScript - Navigation and Common Functions

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.navbar')) {
            if (navMenu) navMenu.classList.remove('active');
        }
    });
    
    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Event Data Structure (will be replaced with API/backend later)
// Load sample events from JSON file or use default
let eventsData = [];

// Try to load sample events from JSON file
async function loadSampleEvents() {
    try {
        const response = await fetch('data/sample-events.json');
        if (response.ok) {
            const data = await response.json();
            eventsData = data.events || [];
            return;
        }
    } catch (error) {
        console.log('Could not load sample events, using defaults');
    }
    
    // Fallback default events
    eventsData = [
        {
            id: 1,
            name: "Norwich Music Festival",
            date: "2026-06-15",
            time: "18:00",
            location: "The Forum, Millennium Plain",
            category: "gigs",
            description: "A celebration of local music talent featuring performances from Norwich's best artists.",
            ticketLink: "https://example.com/tickets",
            image: null,
            status: "approved"
        },
        {
            id: 2,
            name: "Norwich Night Market",
            date: "2026-07-20",
            time: "17:00",
            location: "Norwich Market",
            category: "markets",
            description: "Evening market with local vendors, food stalls, and live entertainment.",
            ticketLink: null,
            image: null,
            status: "approved"
        }
    ];
}

// Load sample events on page load and make sure it completes before other scripts
if (typeof window !== 'undefined') {
    // Make this globally available as a promise
    window.eventsLoadedPromise = loadSampleEvents();
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.category = event.category;
    if (event.id) {
        card.dataset.eventId = event.id;
    }
    
    const imageStyle = event.image 
        ? `background-image: url('${event.image}')`
        : 'background: linear-gradient(135deg, var(--color-electric-blue), var(--color-forest-green))';
    
    card.innerHTML = `
        <div class="event-image" style="${imageStyle}"></div>
        <div class="event-content">
            <span class="event-date">${formatDate(event.date)} at ${formatTime(event.time)}</span>
            <h3 class="event-title">${event.name}</h3>
            <p class="event-location">📍 ${event.location}</p>
            <p class="event-description">${event.description}</p>
            ${event.ticketLink ? `<a href="${event.ticketLink}" target="_blank" class="event-link">Get Tickets →</a>` : ''}
        </div>
    `;
    
    return card;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        eventsData,
        formatDate,
        formatTime,
        getTodayDateString,
        createEventCard
    };
}

