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

// Event Data Structure - Use window.eventsData set by force-reload.js
// This ensures all scripts share the same data
window.eventsData = window.eventsData || [];

// Alias for compatibility
let eventsData = window.eventsData;

// Note: Events are loaded by force-reload.js
// This script just provides utility functions

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

// HTML escape function to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate and sanitize URL
function sanitizeUrl(url) {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        // Only allow http and https protocols
        if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
            return url;
        }
    } catch (e) {
        // Invalid URL
    }
    return '';
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    // Handle both property formats from API (eventname) and local (name)
    const name = event.name || event.eventname || 'Untitled Event';
    const date = event.date || '';
    const time = event.time || '';
    const location = event.location || 'Location TBA';
    const description = event.description || '';
    const category = event.category || 'general';
    const ticketLink = event.ticketLink || event.ticketlink || '';
    const image = event.image || event.imageurl || '';

    card.dataset.category = escapeHtml(category);
    if (event.id || event.eventid) {
        card.dataset.eventId = event.id || event.eventid;
    }

    // Sanitize image URL
    const imageUrl = sanitizeUrl(image);
    const imageStyle = imageUrl
        ? `background-image: url('${imageUrl}')`
        : 'background: linear-gradient(135deg, var(--color-electric-blue), var(--color-forest-green))';

    // Create elements safely to prevent XSS
    const eventImageDiv = document.createElement('div');
    eventImageDiv.className = 'event-image';
    eventImageDiv.style.cssText = imageStyle;

    const eventContentDiv = document.createElement('div');
    eventContentDiv.className = 'event-content';

    const eventDateSpan = document.createElement('span');
    eventDateSpan.className = 'event-date';
    eventDateSpan.textContent = `${formatDate(date)} at ${formatTime(time)}`;

    const eventTitle = document.createElement('h3');
    eventTitle.className = 'event-title';
    eventTitle.textContent = name;

    // Add AI badge for AI-discovered events
    if (event.isAiDiscovered || event.isaidiscovered || (event.eventid && String(event.eventid).startsWith('AI-'))) {
        const aiBadge = document.createElement('span');
        aiBadge.className = 'ai-badge';
        aiBadge.style.cssText = `
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 8px;
            vertical-align: middle;
        `;
        aiBadge.textContent = '🤖 AI Discovered';
        aiBadge.title = 'This event was automatically discovered by our AI system';
        eventTitle.appendChild(aiBadge);
    }

    const eventLocationP = document.createElement('p');
    eventLocationP.className = 'event-location';
    eventLocationP.textContent = `📍 ${location}`;

    const eventDescriptionP = document.createElement('p');
    eventDescriptionP.className = 'event-description';
    eventDescriptionP.textContent = description;

    eventContentDiv.appendChild(eventDateSpan);
    eventContentDiv.appendChild(eventTitle);
    eventContentDiv.appendChild(eventLocationP);
    eventContentDiv.appendChild(eventDescriptionP);

    // Add ticket link if available
    if (ticketLink) {
        const ticketUrl = sanitizeUrl(ticketLink);
        if (ticketUrl) {
            const ticketLinkEl = document.createElement('a');
            ticketLinkEl.href = ticketUrl;
            ticketLinkEl.target = '_blank';
            ticketLinkEl.rel = 'noopener noreferrer'; // Security: prevent window.opener access
            ticketLinkEl.className = 'event-link';
            ticketLinkEl.textContent = 'Get Tickets →';
            eventContentDiv.appendChild(ticketLinkEl);
        }
    }

    card.appendChild(eventImageDiv);
    card.appendChild(eventContentDiv);

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

