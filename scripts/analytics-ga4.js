/**
 * Google Analytics 4 Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a GA4 property at https://analytics.google.com/
 * 2. Get your Measurement ID (format: G-XXXXXXXXXX)
 * 3. Add it to config.js: GA_MEASUREMENT_ID: 'G-XXXXXXXXXX'
 * 4. This script will automatically initialize if GA_MEASUREMENT_ID is set
 */

(function () {
    // Check if GA4 Measurement ID is configured
    const GA_ID = window.APP_CONFIG?.GA_MEASUREMENT_ID;

    if (!GA_ID || GA_ID === 'G-XXXXXXXXXX') {
        console.log('📊 Analytics: Not configured (no GA4 Measurement ID)');
        console.log('💡 To enable: Add GA_MEASUREMENT_ID to config.js');
        return;
    }

    console.log('📊 Analytics: Initializing Google Analytics 4...');

    // Load Google Analytics 4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
        'send_page_view': true,
        'anonymize_ip': true, // GDPR compliance
        'cookie_flags': 'SameSite=None;Secure'
    });

    console.log('✅ Analytics: Google Analytics 4 loaded');

    // Track custom events
    window.trackEvent = function (eventName, eventParams = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventParams);
            console.log('📊 Event tracked:', eventName, eventParams);
        }
    };

    // Track event submissions
    const originalSubmitEvent = window.submitEvent;
    if (typeof originalSubmitEvent === 'function') {
        window.submitEvent = function (...args) {
            trackEvent('event_submission', {
                event_category: 'engagement',
                event_label: 'Event Form Submission'
            });
            return originalSubmitEvent.apply(this, args);
        };
    }

    // Track newsletter subscriptions
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function () {
            trackEvent('newsletter_signup', {
                event_category: 'engagement',
                event_label: 'Newsletter Subscription'
            });
        });
    }

    // Track external link clicks
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (link && link.href) {
            const url = new URL(link.href, window.location.href);

            // Track external links
            if (url.hostname !== window.location.hostname) {
                trackEvent('outbound_click', {
                    event_category: 'engagement',
                    event_label: url.hostname,
                    link_url: url.href
                });
            }

            // Track social media clicks
            const socialDomains = ['instagram.com', 'facebook.com', 'twitter.com', 'tiktok.com'];
            if (socialDomains.some(domain => url.hostname.includes(domain))) {
                trackEvent('social_click', {
                    event_category: 'engagement',
                    event_label: url.hostname.replace('www.', ''),
                    link_url: url.href
                });
            }
        }
    });

    // Track search usage (if search is implemented)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 3) {
                    trackEvent('search', {
                        event_category: 'engagement',
                        search_term: this.value
                    });
                }
            }, 1000); // Debounce 1 second
        });
    }

    // Track filter usage
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            trackEvent('filter_click', {
                event_category: 'engagement',
                filter_type: this.getAttribute('data-filter')
            });
        });
    });

    // Track page engagement time
    let startTime = Date.now();
    let isActive = true;

    // User is active
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            isActive = true;
        }, { passive: true });
    });

    // Track engagement before page unload
    window.addEventListener('beforeunload', function () {
        if (isActive) {
            const engagementTime = Math.round((Date.now() - startTime) / 1000);
            if (engagementTime > 5) { // Only track if user stayed more than 5 seconds
                trackEvent('page_engagement', {
                    event_category: 'engagement',
                    engagement_time_seconds: engagementTime,
                    page_path: window.location.pathname
                });
            }
        }
    });

    // Check for inactivity every 30 seconds
    setInterval(() => {
        if (!isActive) {
            const engagementTime = Math.round((Date.now() - startTime) / 1000);
            trackEvent('user_inactive', {
                event_category: 'engagement',
                engagement_time_seconds: engagementTime
            });
        }
        isActive = false;
    }, 30000);

})();
