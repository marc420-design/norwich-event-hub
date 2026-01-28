# 🚀 Deploy Google Apps Script with CORS Fix - URGENT

## ❌ Current Problem

Your website shows **0 events** because:
- Google Apps Script is **blocking CORS requests**
- Website can't fetch events from Google Sheets
- Falls back to old local JSON with 4 expired events

## ✅ The Fix

I've updated `Code.js` with proper CORS headers. You just need to deploy it!

---

## 📋 Step-by-Step Deployment (5 minutes)

### Step 1: Open Google Apps Script Editor

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
2. Click **Extensions** → **Apps Script**
3. Wait for the editor to load

### Step 2: Replace the Code

1. In the Apps Script editor, you'll see `Code.gs` in the left sidebar
2. Click on `Code.gs` to open it
3. Press **Ctrl+A** (or Cmd+A on Mac) to select all code
4. Press **Delete** to clear it
5. Open the file `Code.js` from your project folder (`c:\Users\marcc\Desktop\new company\Code.js`)
6. Press **Ctrl+A** to select all the updated code
7. Press **Ctrl+C** to copy it
8. Go back to the Apps Script editor
9. Press **Ctrl+V** to paste the new code
10. Press **Ctrl+S** (or click the disk icon) to save

### Step 3: Deploy the Updated Script

1. Click the **Deploy** button (top right)
2. Select **Manage deployments**
3. Click the **pencil icon** (✏️) next to your existing deployment
4. Under "Version", click the dropdown and select **New version**
5. (Optional) Add description: "Added CORS headers for real-time event loading"
6. Click **Deploy**
7. Click **Done**

---

## 🎉 That's It!

Once deployed, your website will:
- ✅ Load events from Google Sheets in real-time
- ✅ Display all AI-scraped events
- ✅ Update automatically when new events are added
- ✅ No more CORS errors!

---

## 🧪 Test It

1. Go to your website: https://norwicheventshub.com
2. Open browser console (F12)
3. Refresh the page
4. You should see:
   - ✅ `Loaded X events from Google Sheets API`
   - ✅ Events displayed on the homepage
   - ❌ No more CORS errors!

---

## 🆘 Troubleshooting

### Still seeing CORS errors?
- Make sure you clicked "New version" (not just "Deploy")
- Wait 1-2 minutes for the deployment to propagate
- Hard refresh your website (Ctrl+Shift+R)

### Can't find the Deploy button?
- Make sure you're in the Apps Script editor (not the Google Sheet)
- Look in the top right corner

### Code won't save?
- Make sure there are no syntax errors (red underlines)
- Try refreshing the Apps Script editor page

---

## 📝 What Changed?

The updated `Code.js` adds these CORS headers to ALL responses:

```javascript
output.setHeader('Access-Control-Allow-Origin', '*');
output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

Plus a new `doOptions()` function to handle CORS preflight requests.

---

**Need help?** The code is already updated in `Code.js` - you just need to copy/paste it into the Apps Script editor and deploy!
