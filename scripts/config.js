/**
 * Norwich Event Hub - Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Deploy automation/google-apps-script.js as Web App
 * 2. Copy the Web App URL and paste it below
 * 3. Get your Google Sheet ID from the sheet URL
 * 4. Set USE_LOCAL_STORAGE to false for production
 * 5. Update SITE_URL to your production domain
 *
 * See REAL_TIME_SETUP_GUIDE.md for detailed instructions
 */

const APP_CONFIG = {
    // Google Apps Script Web App URL - ✅ CONFIGURED
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyPZEGqmvDV_cJqNqGtkibUcxyPM3k24xx4HfCw7ZD6GzDmbYvNQ0rX5Z4BwthONc24/exec',

    // Google Sheet ID - Will be added for AI automation
    GOOGLE_SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',

    // Google Sheets API Key (optional - not needed if using Apps Script)
    GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',

    // 🔧 TEMPORARY: Local mode for testing (switch to false after Google Sheets setup)
    USE_LOCAL_STORAGE: true,  // Set to false after Google Sheets is configured

    // Site configuration
    // 📝 UPDATE THIS to your actual production URL
    SITE_URL: 'https://norwich-event-hub.pages.dev',  // Update when you have custom domain

    // Social media handles
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
