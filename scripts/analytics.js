// Analytics Integration for Norwich Event Hub
// Placeholder for Google Analytics, Plausible, or other analytics tools

// Google Analytics 4 (GA4) - Uncomment and add your Measurement ID
/*
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA4 Measurement ID
*/

// Plausible Analytics - Uncomment and add your domain
/*
<script defer data-domain="norwicheventshub.com" src="https://plausible.io/js/script.js"></script>
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

