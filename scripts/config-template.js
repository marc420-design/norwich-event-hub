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
    // Google Apps Script Web App URL - Deploy Code.js and paste URL here
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',

    // Google Sheet ID - Get from your Google Sheet URL
    GOOGLE_SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',

    // Google Sheets API Key (optional - not needed if using Apps Script)
    GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',

    // Set to false for production (uses Google Sheets API)
    // Set to true for development (uses local JSON file)
    USE_LOCAL_STORAGE: true,  // Change to false when Google Sheets is configured

    // Site configuration
    SITE_URL: 'https://your-site.pages.dev',  // Update with your Cloudflare Pages URL

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
