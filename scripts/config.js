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
    // Google Apps Script Web App URL - ✅ CONFIGURED (Version 36 - Removed addHeader() bug 2026-05-27)
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxZ3PpsET6WuxSRQzKwqKQDbY9jWCvcvtVKDnfQ4-cBE-G9qNM_d4N_LCN_TR7UcwdC/exec',

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

    // Analytics configuration
    GA_MEASUREMENT_ID: 'G-K998PWHHE4',  // ✅ GA4 Configured - Norwich Event Hub

    // Newsletter configuration (optional)
    // NEWSLETTER_ENDPOINT: 'https://your-newsletter-service.com/api/subscribe',  // Uncomment and add endpoint

    // Cloudflare Turnstile (spam protection) - optional
    // TURNSTILE_SITE_KEY: 'your-site-key'  // Uncomment and add your site key

    // Admin client-side password hash (SHA-256 of admin password)
    // Generate in browser console: crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
    //   .then(b => Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''))
    // REQUIRED: Client-side admin access is blocked until this is set
    ADMIN_PW_HASH: '4bd619d1f71b384be7ca9b535db031b8a9642a4ea727a0fe55f69751125589f8'
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}
