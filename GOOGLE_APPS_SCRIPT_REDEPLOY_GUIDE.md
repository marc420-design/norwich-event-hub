# Google Apps Script Redeploy Guide

## CRITICAL FIX: CORS Headers Added

The `Code.js` file has been updated with proper CORS headers to fix the API connection issues. You MUST redeploy the Google Apps Script for changes to take effect.

## Steps to Redeploy

### Method 1: Using clasp (Command Line) - RECOMMENDED

1. **Install clasp if not already installed:**
```bash
npm install -g @google/clasp
```

2. **Navigate to your project directory:**
```bash
cd "C:\Users\marcc\Desktop\new company"
```

3. **Login to Google (if not already logged in):**
```bash
clasp login
```

4. **Push the updated Code.js:**
```bash
clasp push
```

5. **Deploy a new version:**
```bash
clasp deploy --description "Fixed CORS headers for API access"
```

6. **Get the new deployment URL:**
```bash
clasp deployments
```

7. **Update config.js with the new deployment URL if it changed**

### Method 2: Using Google Apps Script Editor (Manual)

1. **Open your Google Sheet:**
   - Go to: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit

2. **Open Apps Script Editor:**
   - Click Extensions → Apps Script

3. **Replace Code.js:**
   - Select all content in Code.js
   - Delete it
   - Copy the entire content from `C:\Users\marcc\Desktop\new company\Code.js`
   - Paste it into the Apps Script editor

4. **Save the file:**
   - Click File → Save (or Ctrl+S)

5. **Deploy new version:**
   - Click Deploy → Manage deployments
   - Click "Edit" (pencil icon) on the active deployment
   - Under "Version", select "New version"
   - Add description: "Fixed CORS headers for API access"
   - Click Deploy

6. **The Web App URL should remain the same:**
   ```
   https://script.google.com/macros/s/AKfycbz3eV1FnzzihDKv1Mx8rPD7I55oJK2sFFVRDt6a1DC9PSu49VPIdm7Iu00rsfT55S2z/exec
   ```

## What Was Fixed

### CORS Headers Added to All Responses

**Before (causing errors):**
```javascript
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  return output;
}
```

**After (fixed):**
```javascript
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);

  // Add CORS headers
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma');
  output.addHeader('Access-Control-Max-Age', '86400');

  return output;
}
```

**CORS headers added to:**
- ✅ `doOptions()` - Preflight requests
- ✅ `doPost()` - Event submissions (success & error)
- ✅ `doGet()` - Event retrieval (success & error)
- ✅ `getAllEvents()` - Admin dashboard (success & error)
- ✅ All error responses

## Testing After Deployment

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or use Incognito/Private mode

2. **Test the API directly:**
```bash
curl -X GET "https://script.google.com/macros/s/AKfycbz3eV1FnzzihDKv1Mx8rPD7I55oJK2sFFVRDt6a1DC9PSu49VPIdm7Iu00rsfT55S2z/exec"
```

3. **Check for CORS headers in response:**
   - Open DevTools → Network tab
   - Visit https://norwicheventshub.com
   - Look for the Google Sheets API request
   - Check Response Headers for:
     - `access-control-allow-origin: *`
     - `access-control-allow-methods: GET, POST, OPTIONS`

4. **Verify events are loading:**
   - Open https://norwicheventshub.com
   - Check Console (F12) for:
     - ✅ "Loaded X events from Google Sheets API"
     - ❌ NO "Failed to load from Google Sheets API" errors

## Troubleshooting

### If CORS errors still occur:

1. **Make sure you deployed a NEW version (not just saved)**
   - Saving doesn't update the Web App
   - You must create a new deployment version

2. **Check the deployment settings:**
   - Execute as: Me (your account)
   - Who has access: Anyone
   - Version: Should be v10 or higher

3. **Clear all caches:**
   - Browser cache
   - Cloudflare cache (if using)
   - Service worker cache

4. **Test with a new deployment:**
   - Create a completely new deployment (not edit existing)
   - Update the URL in config.js
   - Deploy to production

### If events still show as 0:

1. **Check if there are approved events in the sheet:**
   - Open the Google Sheet
   - Look for events with Status = "Approved"
   - Events must be approved to appear on site

2. **Test the API response:**
   - Visit the Web App URL directly in browser
   - Should return JSON with `{"success":true,"events":[...]}`

3. **Check the network request:**
   - Open DevTools → Network
   - Find the request to script.google.com
   - Check if status is 200 and response contains events

## After Successful Deployment

You should see in the browser console:
```
🔄 Loading events from Google Sheets API...
✅ Loaded X events from Google Sheets API
📊 Sample event: {...}
🕐 Last updated: 2026-01-28T...
🔄 Auto-refresh enabled (checks every 5 minutes)
```

## Current Configuration

- **Sheet ID:** 1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
- **Current Web App URL:** https://script.google.com/macros/s/AKfycbz3eV1FnzzihDKv1Mx8rPD7I55oJK2sFFVRDt6a1DC9PSu49VPIdm7Iu00rsfT55S2z/exec
- **Site URL:** https://norwicheventshub.com
- **USE_LOCAL_STORAGE:** false (using Google Sheets)

## Next Steps After CORS Fix

Once the API is working:
1. ✅ Approve some events in the Google Sheet
2. ✅ Test event submission form
3. ✅ Verify auto-refresh works
4. ✅ Monitor for any errors
5. ✅ Proceed with other fixes (canonical URLs, analytics, etc.)
