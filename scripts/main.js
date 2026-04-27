// Main JavaScript - Navigation and Common Functions

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
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

    const observer = new IntersectionObserver(function (entries) {
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
// These are loaded from date-utils.js and available on window object
// No need for wrapper functions - date-utils.js is always loaded first

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

// Calculate urgency for an event based on date/time
function getEventUrgency(dateString, timeString) {
    if (!dateString) {
        return { urgencyBadge: null, urgencyLevel: 'none', badgeColor: '#666' };
    }

    const eventDate = window.parseEventDate ? window.parseEventDate(dateString) : new Date(dateString);

    // Parse time if available
    if (timeString) {
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
            eventDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
        }
    }

    const now = new Date();
    const msUntilEvent = eventDate - now;
    const hoursUntilEvent = msUntilEvent / (1000 * 60 * 60);
    const daysUntilEvent = msUntilEvent / (1000 * 60 * 60 * 24);

    // Check if event is today
    const isToday = eventDate.toDateString() === now.toDateString();

    // Check if event is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

    // Check if event is this weekend (Sat/Sun)
    const dayOfWeek = eventDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isThisWeekend = isWeekend && daysUntilEvent >= 0 && daysUntilEvent <= 7;

    // Determine urgency level and badge
    if (hoursUntilEvent < 0) {
        // Event has passed
        return { urgencyBadge: null, urgencyLevel: 'past', badgeColor: '#999' };
    } else if (hoursUntilEvent <= 6) {
        // Starting very soon
        const hours = Math.floor(hoursUntilEvent);
        return {
            urgencyBadge: `Starts in ${hours}h`,
            urgencyLevel: 'immediate',
            badgeColor: '#E53935'
        };
    } else if (isToday) {
        // Today
        return {
            urgencyBadge: '🔴 Tonight',
            urgencyLevel: 'today',
            badgeColor: '#FF5722'
        };
    } else if (isTomorrow) {
        // Tomorrow
        return {
            urgencyBadge: 'Tomorrow',
            urgencyLevel: 'tomorrow',
            badgeColor: '#FF9800'
        };
    } else if (isThisWeekend && daysUntilEvent <= 3) {
        // This weekend
        return {
            urgencyBadge: 'This Weekend',
            urgencyLevel: 'weekend',
            badgeColor: '#FFA726'
        };
    } else if (daysUntilEvent <= 7) {
        // This week
        return {
            urgencyBadge: 'This Week',
            urgencyLevel: 'week',
            badgeColor: '#66BB6A'
        };
    } else {
        // No urgency indicator
        return { urgencyBadge: null, urgencyLevel: 'none', badgeColor: '#666' };
    }
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

    // Sanitize URLs at the top so they're available throughout the function
    const imageUrl = sanitizeUrl(image);
    const ticketUrl = sanitizeUrl(ticketLink);

    card.dataset.category = escapeHtml(category);
    if (eventId) {
        card.dataset.eventId = eventId;
    }

    // Make card clickable to event detail page
    card.addEventListener('click', function (e) {
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

    // Use sanitized image URL or category gradient
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

    // Add urgency indicator
    const urgencyInfo = getEventUrgency(date, time);

    const eventDateSpan = document.createElement('span');
    eventDateSpan.className = 'event-date';

    if (urgencyInfo.urgencyBadge) {
        const urgencyBadge = document.createElement('span');
        urgencyBadge.className = `urgency-badge urgency-${urgencyInfo.urgencyLevel}`;

        // Enhanced styling for better visibility
        const isImmediate = urgencyInfo.urgencyLevel === 'immediate' || urgencyInfo.urgencyLevel === 'today';
        const badgeStyle = isImmediate ? `
            display: inline-block;
            background: ${urgencyInfo.badgeColor};
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            margin-right: 10px;
            vertical-align: middle;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            animation: ${isImmediate ? 'pulse 2s infinite' : 'none'};
        ` : `
            display: inline-block;
            background: ${urgencyInfo.badgeColor};
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 11px;
            font-weight: 700;
            margin-right: 8px;
            vertical-align: middle;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;

        urgencyBadge.style.cssText = badgeStyle;
        urgencyBadge.textContent = urgencyInfo.urgencyBadge;
        eventDateSpan.appendChild(urgencyBadge);

        // Add countdown timer for events starting soon (<6 hours)
        if (urgencyInfo.urgencyLevel === 'immediate' && time) {
            const countdownSpan = document.createElement('span');
            countdownSpan.className = 'countdown-timer';
            countdownSpan.style.cssText = `
                display: inline-block;
                margin-left: 8px;
                font-size: 11px;
                font-weight: 600;
                color: ${urgencyInfo.badgeColor};
            `;

            // Calculate and update countdown
            const updateCountdown = () => {
                const eventDate = window.parseEventDate ? window.parseEventDate(date) : new Date(date);
                if (time) {
                    const timeParts = time.split(':');
                    if (timeParts.length >= 2) {
                        eventDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
                    }
                }
                const now = new Date();
                const msUntilEvent = eventDate - now;
                const hoursUntilEvent = msUntilEvent / (1000 * 60 * 60);

                if (hoursUntilEvent > 0 && hoursUntilEvent <= 6) {
                    const hours = Math.floor(hoursUntilEvent);
                    const minutes = Math.floor((hoursUntilEvent - hours) * 60);
                    countdownSpan.textContent = `⏰ ${hours}h ${minutes}m`;
                } else {
                    countdownSpan.textContent = '';
                }
            };

            updateCountdown();
            const countdownInterval = setInterval(() => {
                updateCountdown();
                const eventDate = window.parseEventDate ? window.parseEventDate(date) : new Date(date);
                if (time) {
                    const timeParts = time.split(':');
                    if (timeParts.length >= 2) {
                        eventDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
                    }
                }
                if (eventDate < new Date()) {
                    clearInterval(countdownInterval);
                    countdownSpan.textContent = '';
                }
            }, 60000); // Update every minute

            eventDateSpan.appendChild(countdownSpan);
        }
    }

    const dateText = document.createTextNode(`${window.formatDate(date)} at ${window.formatTime(time)}`);
    eventDateSpan.appendChild(dateText);

    const eventTitle = document.createElement('h3');
    eventTitle.className = 'event-title';
    eventTitle.textContent = name;

    // Add editorial curation badges
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'event-badges';
    badgesContainer.style.cssText = 'margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;';

    // Editor's Pick badge - Enhanced for prominence
    if (event.featured) {
        const featuredBadge = document.createElement('span');
        featuredBadge.className = 'editorial-badge featured-badge';
        featuredBadge.style.cssText = `
            display: inline-block;
            background: linear-gradient(135deg, #D6A72B 0%, #F4C430 100%);
            color: #000;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            vertical-align: middle;
            box-shadow: 0 2px 6px rgba(214, 167, 43, 0.3);
        `;
        featuredBadge.textContent = "⭐ Editor's Pick";
        featuredBadge.title = "Hand-picked by our editorial team";
        badgesContainer.appendChild(featuredBadge);
    }

    // Don't Miss This badge - Enhanced for prominence
    if (event.priority === 'high') {
        const priorityBadge = document.createElement('span');
        priorityBadge.className = 'editorial-badge priority-badge';
        priorityBadge.style.cssText = `
            display: inline-block;
            background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            vertical-align: middle;
            box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
        `;
        priorityBadge.textContent = "🔥 Don't Miss";
        priorityBadge.title = "Essential Norwich event";
        badgesContainer.appendChild(priorityBadge);
    }

    // Sold Out Soon badge - Enhanced for prominence
    if (event.soldOutSoon) {
        const soldOutBadge = document.createElement('span');
        soldOutBadge.className = 'editorial-badge soldout-badge';
        soldOutBadge.style.cssText = `
            display: inline-block;
            background: linear-gradient(135deg, #E53935 0%, #D32F2F 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            vertical-align: middle;
            box-shadow: 0 2px 8px rgba(229, 57, 53, 0.4);
            animation: pulse 2s infinite;
        `;
        soldOutBadge.textContent = "⚡ Selling Fast";
        soldOutBadge.title = "Limited tickets remaining";
        badgesContainer.appendChild(soldOutBadge);
    }

    // Add AI badge for AI-discovered events
    if (event.isAiDiscovered || event.isaidiscovered || (event.eventid && String(event.eventid).startsWith('AI-'))) {
        const aiBadge = document.createElement('span');
        aiBadge.className = 'ai-badge';
        aiBadge.style.cssText = `
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            vertical-align: middle;
        `;
        aiBadge.textContent = '🤖 AI Discovered';
        aiBadge.title = 'This event was automatically discovered by our AI system';
        badgesContainer.appendChild(aiBadge);
    }

    if (badgesContainer.children.length > 0) {
        eventTitle.appendChild(badgesContainer);
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
    if (ticketUrl) {
        const ticketLinkEl = document.createElement('a');
        ticketLinkEl.href = ticketUrl;
        ticketLinkEl.target = '_blank';
        ticketLinkEl.rel = 'noopener noreferrer'; // Security: prevent window.opener access
        ticketLinkEl.className = 'event-link';
        ticketLinkEl.textContent = 'Get Tickets →';
        eventContentDiv.appendChild(ticketLinkEl);
    }

    // Add social share buttons
    const shareContainer = document.createElement('div');
    shareContainer.className = 'event-share';
    shareContainer.style.cssText = 'margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;';

    const shareUrl = encodeURIComponent(window.location.origin + window.location.pathname + '?event=' + (event.id || event.eventid || ''));
    const shareText = encodeURIComponent(`${name} - ${window.formatDate(date)} at ${location}`);

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
    copyLink.onclick = function (e) {
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

    // Add to Calendar Button
    try {
        const calStartDate = date.replace(/-/g, '') + (time ? 'T' + time.replace(/:/g, '') + '00' : '');
        // Default to one hour duration if time provided, or next day if all day
        let calEndDate = '';
        if (time) {
            const startHour = parseInt(time.split(':')[0]);
            const endHour = (startHour + 2) % 24; // 2 hours duration
            const endHourStr = endHour.toString().padStart(2, '0');
            calEndDate = date.replace(/-/g, '') + 'T' + endHourStr + time.split(':')[1] + '00';
        } else {
            // Next day for all day event
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            calEndDate = nextDay.toISOString().split('T')[0].replace(/-/g, '');
        }

        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&dates=${calStartDate}/${calEndDate}&details=${encodeURIComponent(description + '\n\nFull details: ' + window.location.origin + window.location.pathname + '?event=' + eventId)}&location=${encodeURIComponent(location)}`;

        const calButton = document.createElement('a');
        calButton.href = googleCalUrl;
        calButton.target = '_blank';
        calButton.rel = 'noopener noreferrer';
        calButton.className = 'share-button';
        calButton.style.cssText = 'display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; color: #333; border: 1px solid #ddd; border-radius: 4px; text-decoration: none; font-size: 13px; margin-left: auto;'; // margin-left: auto pushes it to the right
        calButton.innerHTML = '📅 Add to Cal';
        calButton.title = 'Add to Google Calendar';

        shareContainer.appendChild(calButton);
    } catch (e) {
        console.warn('Error creating calendar link', e);
    }

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

