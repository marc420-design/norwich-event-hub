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

// Date utility functions are now in date-utils.js
// Keeping these for backwards compatibility
function formatDate(dateString) {
    return window.formatDate ? window.formatDate(dateString) : dateString;
}

function formatTime(timeString) {
    return window.formatTime ? window.formatTime(timeString) : timeString;
}

function getTodayDateString() {
    return window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0];
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
    card.style.cursor = 'pointer';

    // Handle both property formats from API (eventname) and local (name)
    const name = event.name || event.eventname || 'Untitled Event';
    const date = event.date || '';
    const time = event.time || '';
    const location = event.location || 'Location TBA';
    const description = event.description || '';
    const category = event.category || 'general';
    const ticketLink = event.ticketLink || event.ticketlink || '';
    const image = event.image || event.imageurl || '';
    const eventId = event.id || event.eventid;

    card.dataset.category = escapeHtml(category);
    if (eventId) {
        card.dataset.eventId = eventId;
    }

    // Make card clickable to event detail page
    card.addEventListener('click', function(e) {
        // Don't navigate if clicking on links or buttons
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        if (eventId) {
            window.location.href = `event-detail.html?id=${eventId}`;
        }
    });

    // Get category-specific gradient or image
    const categoryGradients = {
        'nightlife': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gigs': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'theatre': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'sports': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'markets': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'community': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'culture': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'free': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'default': 'linear-gradient(135deg, var(--color-electric-blue), var(--color-forest-green))'
    };

    // Sanitize image URL or use category gradient
    const imageUrl = sanitizeUrl(image);
    const categoryGradient = categoryGradients[category] || categoryGradients['default'];
    const imageStyle = imageUrl
        ? `background-image: url('${imageUrl}')`
        : `background: ${categoryGradient}`;

    // Create elements safely to prevent XSS
    const eventImageDiv = document.createElement('div');
    eventImageDiv.className = 'event-image';

    // Lazy load images using data attributes and Intersection Observer
    if (imageUrl) {
        eventImageDiv.dataset.bgImage = imageUrl;
        eventImageDiv.classList.add('lazy-bg');
    } else {
        eventImageDiv.style.cssText = imageStyle;
    }

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

    // Add social share buttons
    const shareContainer = document.createElement('div');
    shareContainer.className = 'event-share';
    shareContainer.style.cssText = 'margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;';
    
    const shareUrl = encodeURIComponent(window.location.origin + window.location.pathname + '?event=' + (event.id || event.eventid || ''));
    const shareText = encodeURIComponent(`${name} - ${formatDate(date)} at ${location}`);
    
    // Twitter share
    const twitterShare = document.createElement('a');
    twitterShare.href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
    twitterShare.target = '_blank';
    twitterShare.rel = 'noopener noreferrer';
    twitterShare.className = 'share-button';
    twitterShare.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #1DA1F2; color: white; border-radius: 4px; text-decoration: none; font-size: 13px;';
    twitterShare.innerHTML = '🐦 Share';
    twitterShare.title = 'Share on Twitter';
    
    // Facebook share
    const facebookShare = document.createElement('a');
    facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    facebookShare.target = '_blank';
    facebookShare.rel = 'noopener noreferrer';
    facebookShare.className = 'share-button';
    facebookShare.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #1877F2; color: white; border-radius: 4px; text-decoration: none; font-size: 13px;';
    facebookShare.innerHTML = '📘 Share';
    facebookShare.title = 'Share on Facebook';
    
    // Copy link
    const copyLink = document.createElement('button');
    copyLink.className = 'share-button';
    copyLink.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;';
    copyLink.innerHTML = '🔗 Copy Link';
    copyLink.title = 'Copy event link';
    copyLink.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const urlToCopy = window.location.origin + window.location.pathname + '?event=' + (event.id || event.eventid || '');
        navigator.clipboard.writeText(urlToCopy).then(() => {
            const originalText = copyLink.innerHTML;
            copyLink.innerHTML = '✓ Copied!';
            copyLink.style.background = '#2B7A47';
            setTimeout(() => {
                copyLink.innerHTML = originalText;
                copyLink.style.background = '#666';
            }, 2000);
        }).catch(() => {
            alert('Could not copy link. Please copy manually: ' + urlToCopy);
        });
    };
    
    shareContainer.appendChild(twitterShare);
    shareContainer.appendChild(facebookShare);
    shareContainer.appendChild(copyLink);
    eventContentDiv.appendChild(shareContainer);

    // Add Schema.org structured data
    if (typeof document !== 'undefined') {
        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        
        // Parse date and time
        let startDate = '';
        if (date) {
            const dateStr = date.split('T')[0]; // Get date part if ISO format
            const [year, month, day] = dateStr.split('-');
            if (time) {
                const timeStr = time.includes('T') ? time.split('T')[1].split('.')[0] : time;
                const [hours, minutes] = timeStr.split(':');
                startDate = `${year}-${month}-${day}T${hours || '00'}:${minutes || '00'}:00`;
            } else {
                startDate = `${year}-${month}-${day}T00:00:00`;
            }
        }
        
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": escapeHtml(name),
            "startDate": startDate || date,
            "location": {
                "@type": "Place",
                "name": escapeHtml(location),
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Norwich",
                    "addressCountry": "GB"
                }
            },
            "description": escapeHtml(description),
            "image": imageUrl || undefined,
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
        };
        
        if (ticketLink) {
            schemaData.offers = {
                "@type": "Offer",
                "url": ticketUrl,
                "price": "0",
                "priceCurrency": "GBP",
                "availability": "https://schema.org/InStock"
            };
        }
        
        schemaScript.textContent = JSON.stringify(schemaData);
        card.appendChild(schemaScript);
    }

    card.appendChild(eventImageDiv);
    card.appendChild(eventContentDiv);

    return card;
}

// Lazy loading for background images using Intersection Observer
if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const lazyBackgroundObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lazyDiv = entry.target;
                const bgImage = lazyDiv.dataset.bgImage;

                if (bgImage) {
                    lazyDiv.style.backgroundImage = `url('${bgImage}')`;
                    lazyDiv.classList.remove('lazy-bg');
                    lazyDiv.classList.add('lazy-loaded');
                    lazyBackgroundObserver.unobserve(lazyDiv);
                }
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
    });

    // Observe all lazy background elements (existing and future)
    function observeLazyBackgrounds() {
        const lazyBackgrounds = document.querySelectorAll('.lazy-bg');
        lazyBackgrounds.forEach(bg => lazyBackgroundObserver.observe(bg));
    }

    // Initial observation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeLazyBackgrounds);
    } else {
        observeLazyBackgrounds();
    }

    // Re-observe when new events are loaded
    window.addEventListener('eventsLoaded', observeLazyBackgrounds);
    window.addEventListener('eventsUpdated', observeLazyBackgrounds);
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

