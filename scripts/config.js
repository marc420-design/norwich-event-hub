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
    // Google Apps Script Web App URL - ✅ CONFIGURED (Version 9 - Real-time data)
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwf5RT8xXX03sYEsSf5w8mAe_34-cAjJuAYkoxQtNoImFOTtfMgbDxFDc-aQuiCUIbJ/exec',

    // Google Sheet ID - ✅ CONFIGURED
    GOOGLE_SHEET_ID: '1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU',

    // Google Sheets API Key (optional - not needed if using Apps Script)
    GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',

    // ✅ REAL-TIME MODE ENABLED - Fetching data from Google Sheets
    USE_LOCAL_STORAGE: false,  // Now using real-time Google Sheets data

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
