# API Configuration Setup

## Quick Setup

### Step 1: Create Your Config File

1. Copy `scripts/config-template.js`
2. Save it as `scripts/config.js`
3. Fill in your actual values

### Step 2: Get Your Google Apps Script URL

Follow the instructions in `GOOGLE_SHEET_SETUP.md` to deploy your Google Apps Script and get the Web App URL.

It will look like:
```
https://script.google.com/macros/s/AKfycby.../exec
```

### Step 3: Update config.js

Edit `scripts/config.js`:

```javascript
const APP_CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec',

    // Leave these empty if not using direct Sheets API
    GOOGLE_SHEETS_API_KEY: '',
    GOOGLE_SHEET_ID: '',

    // Set to false once your Google Apps Script is deployed
    USE_LOCAL_STORAGE: false,

    SITE_URL: 'https://norwicheventshub.com',

    SOCIAL_HANDLES: {
        instagram: '@norwicheventshub',
        facebook: 'norwicheventshub',
        twitter: '@norwicheventshub',
        tiktok: '@norwicheventshub'
    }
};
```

### Step 4: Include config.js in Your HTML Files

Add this line BEFORE the api.js script tag in all HTML files:

```html
<!-- Add this line -->
<script src="scripts/config.js"></script>
<!-- Before this line -->
<script src="scripts/api.js"></script>
```

Files to update:
- index.html
- today.html
- directory.html
- submit.html
- 404.html

## Development vs Production

### Development Mode (USE_LOCAL_STORAGE: true)
- Events are stored in browser's localStorage
- No backend required
- Good for testing layout and functionality
- Data is lost when browser cache is cleared

### Production Mode (USE_LOCAL_STORAGE: false)
- Events are stored in Google Sheets
- Requires Google Apps Script deployment
- Data persists across all users
- Events can be approved/rejected

## Testing Your Setup

### Test 1: Check Config Loads
1. Open your site in a browser
2. Open browser console (F12)
3. Type: `APP_CONFIG`
4. You should see your configuration object

### Test 2: Submit an Event
1. Go to the submit form
2. Fill out all fields
3. Click Submit
4. Check your Google Sheet for the new row
5. Check the email inbox for confirmation

### Test 3: View Events
1. Go to the directory page
2. Events with Status = "Approved" should appear
3. Try filtering by category

## Troubleshooting

### Config not loading
- Make sure `config.js` is loaded BEFORE `api.js`
- Check browser console for errors
- Verify the file path is correct: `scripts/config.js`

### Events not submitting
- Check `USE_LOCAL_STORAGE` is set correctly
- Verify Google Apps Script URL is correct
- Check browser console for network errors
- Make sure Google Apps Script is deployed with "Anyone" access

### Events not displaying
- Change Status to "Approved" in Google Sheet
- Check browser console for API errors
- Verify EVENTS_URL is set correctly

## Security Note

`scripts/config.js` is gitignored to protect your API keys. When deploying:

**Option 1: Environment Variables (Recommended for Cloudflare Pages)**
Set environment variables in Cloudflare Pages dashboard and inject them at build time.

**Option 2: Manual Upload**
After deploying, manually upload `config.js` to your server.

**Option 3: Cloudflare Workers**
Use Cloudflare Workers to proxy API requests and keep keys server-side.
