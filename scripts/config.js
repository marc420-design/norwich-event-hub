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
    // Google Apps Script Web App URL
    // 📝 REPLACE THIS with your actual Web App URL from Google Apps Script
    // Get this from: Extensions > Apps Script > Deploy > New deployment > Web app
    // Example: 'https://script.google.com/macros/s/ABC123xyz.../exec'
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',

    // Google Sheet ID
    // 📝 REPLACE THIS with your actual Sheet ID
    // Find this in your sheet URL: .../spreadsheets/d/YOUR_SHEET_ID/edit
    GOOGLE_SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',

    // Google Sheets API Key (optional - not needed if using Apps Script)
    GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',

    // ⚠️ IMPORTANT: Set to false for production to enable real-time API!
    // true = Use local storage (development/offline mode)
    // false = Use Google Apps Script API (production mode with real-time data)
    USE_LOCAL_STORAGE: true,  // ← Change to false after setting up API

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
