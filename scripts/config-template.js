/**
 * Norwich Event Hub - Configuration Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to: config.js
 * 2. Fill in your actual URLs and API keys below
 * 3. Update your HTML files to include config.js before api.js:
 *    <script src="scripts/config.js"></script>
 *    <script src="scripts/api.js"></script>
 *
 * NOTE: config.js is gitignored to protect your API keys
 */

const APP_CONFIG = {
    // Google Apps Script Web App URL
    // Get this from: Extensions > Apps Script > Deploy > Web app
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',

    // Google Sheets (optional - for direct API access)
    GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
    GOOGLE_SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',

    // Development mode
    // Set to true to use local storage instead of API
    USE_LOCAL_STORAGE: true,

    // Site configuration
    SITE_URL: 'https://norwicheventshub.com',

    // Social media (optional - for sharing features)
    SOCIAL_HANDLES: {
        instagram: '@norwicheventshub',
        facebook: 'norwicheventshub',
        twitter: '@norwicheventshub',
        tiktok: '@norwicheventshub'
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}
