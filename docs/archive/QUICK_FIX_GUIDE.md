# 🚀 Quick Fix Guide - Get Events Showing NOW!

**Problem:** Website shows 0 events even though configuration is correct.

**Root Cause:** Google Sheet is empty - no approved events to display.

**Solution:** Follow these 3 steps to fix it in 5 minutes!

---

## ✅ Step 1: Update Google Apps Script (2 minutes)

Your Google Apps Script needs an update to handle event data properly.

1. **Open your Google Sheet:**
   - Go to: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU

2. **Open Apps Script:**
   - Click **Extensions** → **Apps Script**

3. **Replace the code:**
   - Select ALL existing code (Ctrl+A / Cmd+A)
   - Delete it
   - Open `automation/google-apps-script-v2.js` from this project
   - Copy ALL the code
   - Paste it into the Apps Script editor

4. **Deploy the new version:**
   - Click **Deploy** → **Manage deployments**
   - Click the **Edit** icon (pencil) on your existing deployment
   - Click **New Version**
   - Click **Deploy**
   - ✅ Your URL stays the same!

---

## ✅ Step 2: Populate Google Sheet with Sample Events (2 minutes)

Now let's add your 15 sample events to the Google Sheet.

### Option A: Browser Console Method (Easiest)

1. **Open your live site:**
   - Go to: https://norwicheventshub.com

2. **Open browser console:**
   - Press `F12` or right-click → Inspect
   - Click the **Console** tab

3. **Load the populator script:**
   ```javascript
   // Paste this entire block into the console:

   const script = document.createElement('script');
   script.src = 'https://norwicheventshub.com/automation/populate-google-sheets.js';
   document.head.appendChild(script);
   ```

4. **Wait 2 seconds, then run:**
   ```javascript
   await populateGoogleSheets()
   ```

5. **Watch the magic:**
   - You'll see: "✅ Uploading events..."
   - After ~10 seconds: "✨ Upload complete!"

### Option B: Manual Copy-Paste Method

1. Open your Google Sheet
2. Open `data/sample-events.json` from this project
3. Manually add events following the header format:
   - Timestamp | Event Name | Date | Time | Location | Category | Description | Ticket Link | Promoter Name | Promoter Email | Promoter Phone | **Status** | Event ID

⚠️ **IMPORTANT:** Set the **Status** column to **"Approved"** for events to show!

---

## ✅ Step 3: Approve Events & Test (1 minute)

1. **Check your Google Sheet:**
   - You should see 15 new rows with events
   - Make sure **Status** column says **"Approved"**

2. **If status is "Pending", run this script:**
   - Go back to Apps Script editor
   - Click **Run** → Select `approveAllPendingEvents`
   - Click **Run**
   - All events will be approved automatically!

3. **Test the API:**
   - Open this URL in your browser:
     ```
     https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec
     ```
   - You should see JSON with your 15 events!

4. **Refresh your website:**
   - Go to: https://norwicheventshub.com
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - 🎉 **Events should now appear!**

---

## 🔍 Troubleshooting

### Events still not showing?

**Check the browser console:**
1. Open your site: https://norwicheventshub.com
2. Press F12 → Console tab
3. Look for these messages:

✅ **Good:**
```
✅ Loaded 15 events from Google Sheets API
```

❌ **Bad:**
```
⚠️ API returned success but no events
```

**If you see "no events":**
- Check Google Sheet - are there rows?
- Check Status column - is it "Approved"? (capital A)
- Run `approveAllPendingEvents()` in Apps Script

**If you see API errors:**
- Check Google Apps Script deployment is "Anyone" can access
- Verify the URL in `scripts/config.js` matches your Web App URL

---

## 🤖 Next: Add AI Event Discovery (Optional)

Once events are showing, enable AI discovery:

1. **Set up Eventbrite API:**
   - Get API key: https://www.eventbrite.com/platform/
   - Add to environment: `EVENTBRITE_API_KEY=your_key`

2. **Deploy AI discovery:**
   - Option 1: Run locally: `node automation/ai-event-discovery.js`
   - Option 2: Deploy to Cloudflare Workers (see below)
   - Option 3: Use Google Apps Script triggers

3. **Schedule daily runs:**
   - Discovers new events from Eventbrite, social media, venues
   - Auto-submits to Google Sheets with "AI-" prefix
   - Requires manual approval before showing on site

See `AI_SETUP_GUIDE.md` for full details.

---

## 📊 Expected Results

After completing all steps:

- ✅ Google Sheet has 15 approved events
- ✅ API returns events when accessed directly
- ✅ Website shows events in all sections
- ✅ Event count shows "15 Events Listed"
- ✅ Filters work correctly
- ✅ Auto-refresh checks for updates daily

---

## 🎯 Quick Command Reference

**Approve all events (in Apps Script):**
```javascript
approveAllPendingEvents()
```

**Test API (in browser):**
```
https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec
```

**Populate events (in browser console):**
```javascript
await populateGoogleSheets()
```

**Check events loaded (in browser console on your site):**
```javascript
console.log(window.eventsData)
```

---

## ✅ Success Checklist

- [ ] Updated Google Apps Script to V2
- [ ] Deployed new version
- [ ] Populated Google Sheet with sample events
- [ ] Verified Status = "Approved" for all events
- [ ] Tested API URL - returns events
- [ ] Refreshed website - events appear
- [ ] Event count shows 15+
- [ ] Filters work correctly

---

## 🚨 Still Need Help?

Check these files:
- `COMPREHENSIVE_AUDIT_2026-01-06.md` - Full technical audit
- `AI_SETUP_GUIDE.md` - AI integration details (create next)
- `REAL_TIME_SETUP_GUIDE.md` - Original setup guide

Or check browser console for specific error messages!
