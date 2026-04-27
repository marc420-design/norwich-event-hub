# Fix Google Apps Script CORS Issue

**Current Problem:** CORS error blocking API requests from norwicheventshub.com

```
Access to fetch at 'https://script.google.com/...' has been blocked by CORS policy
```

---

## 🎯 SOLUTION: Redeploy Google Apps Script

The issue is with how the Google Apps Script is deployed, NOT the code itself.

### Step 1: Open Your Google Sheet

1. Go to: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
2. Click **Extensions** → **Apps Script**

### Step 2: Create New Deployment

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**

### Step 3: Configure Deployment Settings

**CRITICAL SETTINGS:**

```
Description: Norwich Event Hub API v2
Execute as: Me (your email)
Who has access: Anyone  ← MUST BE "Anyone"
```

**Why "Anyone" is required:**
- Google Apps Script only allows CORS for public web apps
- "Anyone" means anyone with the URL can access
- The data is already public (event listings)

### Step 4: Deploy

1. Click **Deploy**
2. **IMPORTANT:** Click "Authorize access"
3. Select your Google account
4. Click "Advanced" → "Go to Norwich Event Hub (unsafe)" ← This is normal
5. Click "Allow"
6. Copy the **New** deployment URL

### Step 5: Update Your Config

1. Open `scripts/config.js` in your project
2. Replace the old URL with the new one:

```javascript
const APP_CONFIG = {
    USE_LOCAL_STORAGE: false,  // ← Make sure this is false
    GOOGLE_APPS_SCRIPT_URL: 'YOUR_NEW_URL_HERE'
};
```

3. Save and deploy the website

---

## Alternative: Keep Using Local JSON (Current Workaround)

If you can't fix the CORS issue right now, your site is currently working with local JSON (15 events).

**To keep using this:**

1. Set `USE_LOCAL_STORAGE: true` in `scripts/config.js`
2. Update `data/sample-events.json` regularly with your Google Sheets data

**To export from Google Sheets:**

```
Extensions → Apps Script → Run getAllEvents() → Copy output to sample-events.json
```

---

## Verifying the Fix

After redeploying, test with:

```bash
curl "YOUR_NEW_APPS_SCRIPT_URL"
```

Should return:
```json
{
  "success": true,
  "events": [...]
}
```

Then hard refresh your website and check console:
```
✅ Loaded 90 events from Google Sheets API
```

---

## Why This Happens

Google Apps Script CORS requirements:
- **Must be deployed as "Web app"** (not API executable)
- **Must have "Who has access: Anyone"** (not "Only myself")
- **Must be a NEW deployment** (not edited deployment)

Your current deployment probably has "Only myself" access, which triggers CORS.

---

## Need Help?

If you still get CORS errors after redeploying:

1. Make sure deployment is NEW (not updated)
2. Verify "Who has access: Anyone" is selected
3. Try incognito mode to rule out caching
4. Check the URL doesn't have `?action=getEvents` (we removed this)

---

**Summary:** Redeploy Apps Script with "Anyone" access to fix CORS.
