// Analytics Integration for Norwich Event Hub
// Supports Google Analytics 4, Plausible, or Cloudflare Analytics

// ============================================
// SETUP INSTRUCTIONS
// ============================================
// 
// GOOGLE ANALYTICS 4:
// 1. Go to https://analytics.google.com
// 2. Create a new GA4 property
// 3. Copy your Measurement ID (format: G-XXXXXXXXXX)
// 4. Uncomment the GA4 code below and replace G-XXXXXXXXXX with your ID
// 5. Add the gtag script to your HTML files (see instructions in HTML)
//
// PLAUSIBLE ANALYTICS:
// 1. Sign up at https://plausible.io
// 2. Add your domain (norwicheventshub.com)
// 3. Add this script tag to your HTML <head>:
//    <script defer data-domain="norwicheventshub.com" src="https://plausible.io/js/script.js"></script>
//
// CLOUDFLARE ANALYTICS:
// 1. Enable Web Analytics in Cloudflare Dashboard
// 2. Add the provided script tag to your HTML
// ============================================

// Google Analytics 4 (GA4) - Uncomment and configure
/*
(function() {
    // Add this script tag to your HTML <head> section:
    // <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    
    // Replace G-XXXXXXXXXX with your GA4 Measurement ID
    const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
    gtag('config', GA4_MEASUREMENT_ID, {
        'page_title': document.title,
        'page_location': window.location.href
    });
    
    // Make gtag available globally
    window.gtag = gtag;
})();
*/

// Custom Event Tracking
function trackEvent(category, action, label) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Plausible
    if (typeof plausible !== 'undefined') {
        plausible(action, { props: { category: category, label: label } });
    }
    
    // Console log for development
    console.log('Event tracked:', { category, action, label });
}

// Track form submissions
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            trackEvent('Form', 'Submit', form.id || 'unknown');
        });
    });
    
    // Track external links
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('Outbound', 'Click', this.href);
        });
    });
    
    // Track event card clicks
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('click', function() {
            const eventTitle = this.querySelector('.event-title')?.textContent || 'Unknown';
            trackEvent('Event', 'View', eventTitle);
        });
    });
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.trackEvent = trackEvent;
}

