# ⚠️ CORS STILL BLOCKED - Final Fix Required

## 🔴 Current Problem

Even though the API works directly (`https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec`), CORS is blocking requests from `norwicheventshub.com`.

**Error:**
```
Access to fetch at '...' from origin 'https://norwicheventshub.com' has been blocked by CORS policy
```

---

## 🔍 Root Cause

Google Apps Script deployments have TWO access levels that must BOTH be set correctly:

1. **Deployment Access** - Must be "Anyone"
2. **Script Permissions** - Must authorize the domain

**The issue:** Your deployment might be set to "Only myself" OR the script needs explicit domain authorization.

---

## ✅ SOLUTION: Re-check Deployment Settings

### Step 1: Open Google Apps Script

1. Go to: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
2. Click **Extensions** → **Apps Script**

### Step 2: Check CURRENT Deployment

1. Click **Deploy** → **Manage deployments**
2. Look at the ACTIVE deployment
3. Check "Who has access" - if it says **"Only myself"** that's the problem!

### Step 3: If "Only myself" - Create NEW Deployment

**If the current deployment shows "Only myself":**

1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ → **Web app**
3. Settings:
   ```
   Description: Norwich Event Hub API v18 - Public Access
   Execute as: Me (your email)
   Who has access: Anyone  ← MUST BE "Anyone"!
   ```
4. Click **Deploy**
5. **Authorize** → Allow all permissions
6. **COPY THE NEW URL**

### Step 4: Update Config with NEW URL

If you get a new URL, update `scripts/config.js`:

```javascript
GOOGLE_APPS_SCRIPT_URL: 'YOUR_NEW_URL_HERE',
```

Then redeploy:
```bash
wrangler pages deploy . --project-name=norwich-event-hub
```

---

## 🔧 Alternative: Check Deployment Details

In Google Apps Script:

1. Click **Deploy** → **Manage deployments**
2. Click the **pencil icon** (edit) on your active deployment
3. Verify:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← CRITICAL!

If "Who has access" is NOT "Anyone", change it:
1. Select **Anyone**
2. Click **Deploy**
3. This will create a NEW VERSION with a NEW URL
4. Copy the NEW URL
5. Update `scripts/config.js`
6. Redeploy site

---

## 🎯 Why This Happens

Google Apps Script has strict CORS policies:

- **"Anyone" access** → CORS enabled for all domains
- **"Only myself" access** → CORS blocked for all external domains
- **"Anyone with link"** → NOT sufficient for web apps!

You MUST use **"Anyone"** (not "Anyone with link").

---

## 🧪 How to Test If It's Fixed

After redeploying with correct settings:

1. Visit: `https://norwicheventshub.com`
2. Open Browser Console (F12)
3. Look for:
   ```
   ✅ Loaded 90 events from Google Sheets API
   📊 Total events available: 90
   ```

**NO MORE:**
```
❌ Failed to load from Google Sheets API: CORS error
```

---

## 📋 Quick Checklist

- [ ] Open Google Apps Script editor
- [ ] Click Deploy → Manage deployments
- [ ] Check current deployment settings
- [ ] Verify "Who has access: Anyone"
- [ ] If not "Anyone", create NEW deployment
- [ ] Copy new URL
- [ ] Update scripts/config.js
- [ ] Redeploy with wrangler
- [ ] Test on norwicheventshub.com

---

## 🆘 If Still Not Working

If CORS persists after setting "Anyone":

**Temporary Workaround:**
Your site currently falls back to local JSON (15 events) which works fine.

To expand local events:
1. Run your AI scraper to update `data/sample-events.json`
2. Redeploy site

This gives you 90+ events without the API!

---

**Next Step:** Please check your Google Apps Script deployment settings and verify "Who has access: Anyone"!
