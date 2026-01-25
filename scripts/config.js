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
    // Google Apps Script Web App URL - ✅ CONFIGURED (Version 9 - CLI Deployed)
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzkMEodkc2MbX11CvST83HhXBy0WcLMUHCvFOjbwhKfS1wC2MAapEsNGQZiArFPKTK3/exec',

    // Google Sheet ID - ✅ CONFIGURED
    GOOGLE_SHEET_ID: '1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU',

    // Google Sheets API Key (optional - not needed if using Apps Script)
    GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',

    // ✅ USING GOOGLE SHEETS FOR REAL-TIME DATA
    USE_LOCAL_STORAGE: false,  // Now fetching from Google Sheets API

    // Site configuration
    SITE_URL: 'https://norwicheventshub.com',  // Production domain

    // Social media handles
    SOCIAL_HANDLES: {
        instagram: '@norwicheventshub',
        facebook: 'norwicheventshub',
        twitter: '@norwicheventshub',
        tiktok: '@norwicheventshub'
    },

    // Analytics configuration (optional)
    // GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',  // Uncomment and add your GA4 ID

    // Newsletter configuration (optional)
    // NEWSLETTER_ENDPOINT: 'https://your-newsletter-service.com/api/subscribe',  // Uncomment and add endpoint

    // Cloudflare Turnstile (spam protection) - optional
    // TURNSTILE_SITE_KEY: 'your-site-key'  // Uncomment and add your site key
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}
