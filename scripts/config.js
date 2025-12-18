/**
 * Norwich Event Hub - Configuration
 * Local Development Mode
 */

const APP_CONFIG = {
    // Google Apps Script Web App URL
    // Set to actual URL when ready for production
    GOOGLE_APPS_SCRIPT_URL: '',

    // Google Sheets (optional - for direct API access)
    GOOGLE_SHEETS_API_KEY: '',
    GOOGLE_SHEET_ID: '',

    // Development mode - Using local storage
    // Events are loaded from data/sample-events.json
    USE_LOCAL_STORAGE: true,

    // Site configuration
    SITE_URL: 'https://norwicheventshub.com',

    // Social media handles
    SOCIAL_HANDLES: {
        instagram: '@norwicheventshub',
        facebook: 'norwicheventshub',
        twitter: '@norwicheventshub',
        tiktok: '@norwicheventshub'
    },

    // Feature flags
    FEATURES: {
        enableAnalytics: false,
        enableSubmissions: true,
        enableSocialSharing: false
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
