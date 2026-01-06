/**
 * Google Analytics 4 Integration
 * Config-based implementation - only loads if GA4 Measurement ID is provided
 */

(function() {
    'use strict';

    // Check if APP_CONFIG exists and has GA4 ID
    const GA4_MEASUREMENT_ID = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.GA_MEASUREMENT_ID) 
        ? APP_CONFIG.GA_MEASUREMENT_ID 
        : null;

    // Only initialize analytics if ID is configured
    if (!GA4_MEASUREMENT_ID || GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.log('📊 Analytics: Not configured (no GA4 Measurement ID)');
        return;
    }

    console.log('📊 Analytics: Initializing with ID:', GA4_MEASUREMENT_ID);

    // Load Google Analytics 4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=None;Secure'
    });

    // Make gtag available globally for custom events
    window.gtag = gtag;

    // Track custom events
    function trackEvent(eventName, eventParams) {
        if (window.gtag) {
            window.gtag('event', eventName, eventParams);
        }
    }

    // Track page views (for SPAs)
    function trackPageView(pagePath) {
        if (window.gtag) {
            window.gtag('config', GA4_MEASUREMENT_ID, {
                'page_path': pagePath
            });
        }
    }

    // Expose tracking functions
    window.trackEvent = trackEvent;
    window.trackPageView = trackPageView;

    // Track outbound links (ticket purchases, external venue links)
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href) {
            const isExternal = link.hostname !== window.location.hostname;
            const isTicketLink = link.classList.contains('btn-ticket') || link.href.includes('ticket');
            
            if (isExternal || isTicketLink) {
                trackEvent('click', {
                    'event_category': isTicketLink ? 'Ticket Link' : 'Outbound Link',
                    'event_label': link.href,
                    'transport_type': 'beacon'
                });
            }
        }
    });

    // Track event card clicks
    document.addEventListener('click', function(e) {
        const eventCard = e.target.closest('.event-card');
        if (eventCard) {
            const eventName = eventCard.querySelector('.event-title')?.textContent || 'Unknown';
            trackEvent('view_event', {
                'event_category': 'Event Interaction',
                'event_label': eventName
            });
        }
    });

    // Track form submissions
    document.addEventListener('submit', function(e) {
        const form = e.target;
        const formType = form.id || form.name || 'unknown_form';
        
        trackEvent('form_submit', {
            'event_category': 'Form',
            'event_label': formType
        });
    });

    // Track search queries (if search functionality exists)
    window.addEventListener('search', function(e) {
        if (e.detail && e.detail.query) {
            trackEvent('search', {
                'search_term': e.detail.query
            });
        }
    });

    console.log('✅ Analytics initialized successfully');

})();
