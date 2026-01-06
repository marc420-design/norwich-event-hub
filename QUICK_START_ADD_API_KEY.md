# ⚡ Quick Start: Add Your Gemini API Key (5 Minutes)

**Your API Key:** `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs` ✅

---

## 🎯 What This Does

Adding this key enables your AI scraper to:
- 🤖 Automatically discover 30-80 events per day
- 🏷️ Categorize events (nightlife, culture, sports, etc.)
- ✅ Quality-score events (reject low-quality)
- 📤 Upload to Google Sheets
- 🌐 Auto-update your website every 6 hours
- 💰 Cost: $0/month (free tier)

---

## 📋 3 Simple Steps

### Step 1: Open GitHub Secrets Page (30 seconds)

Click this link (opens in new tab):

👉 **https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions**

Sign in if prompted.

---

### Step 2: Add GEMINI_API_KEY (2 minutes)

1. Click the green **"New repository secret"** button

2. Fill in the form:

   **Name field:**
   ```
   GEMINI_API_KEY
   ```
   
   **Secret field:**
   ```
   AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs
   ```

3. Click **"Add secret"** button

4. ✅ Done! You should see "GEMINI_API_KEY" in your list

---

### Step 3: Add Two More Secrets (2 minutes)

Repeat Step 2 for these:

**Second Secret:**
- Name: `GOOGLE_SHEET_ID`
- Value: `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`

**Third Secret:**
- Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
- Value: (You need to create this - see below)

---

## 🔑 Getting the Service Account JSON

**Option A: If you already have it**
- Open `automation/google-credentials.json` in your project
- Copy the entire contents
- Paste as the secret value

**Option B: Create new credentials**

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click **"Create Credentials"** → **"Service Account"**

3. Name it: `Norwich Events Scraper`

4. Click **"Create and Continue"**

5. Role: Select **"Editor"** (or "Google Sheets API" access minimum)

6. Click **"Continue"** → **"Done"**

7. Click on your new service account name

8. Go to **"Keys"** tab

9. Click **"Add Key"** → **"Create new key"** → **"JSON"**

10. A JSON file downloads

11. Open it and copy ALL the contents (including `{ }` brackets)

12. Paste it as the `GOOGLE_SERVICE_ACCOUNT_JSON` secret

13. **IMPORTANT:** Share your Google Sheet with the email from the JSON:
    - Find the `"client_email"` line in the JSON
    - Copy that email (looks like: `xxx@xxx.iam.gserviceaccount.com`)
    - Open your Google Sheet
    - Click "Share"
    - Paste the email
    - Give "Editor" permission
    - Click "Share"

---

## 🧪 Test It (1 minute)

1. Go to: https://github.com/marc420-design/norwich-event-hub/actions

2. Click **"AI Event Scraper"** in left sidebar

3. Click **"Run workflow"** (right side)

4. Select **main** branch

5. Click **"Run workflow"** (green button)

6. Wait 2-5 minutes

7. Look for green checkmark ✅ = success!

8. Open your Google Sheet - you should see new events!

---

## ✅ Success Checklist

After completing, you should have:

- [x] `GEMINI_API_KEY` added to GitHub Secrets ✅
- [ ] `GOOGLE_SHEET_ID` added to GitHub Secrets
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` added to GitHub Secrets
- [ ] Google Sheet shared with service account email
- [ ] Workflow test run completed (green checkmark)
- [ ] New events in Google Sheet

---

## 🎉 What Happens Next

Your AI scraper will now:
- ✅ Run automatically 4x per day: 12am, 6am, 12pm, 6pm UTC
- ✅ Scrape events from: Eventbrite, Skiddle, Council, Visit Norwich
- ✅ AI processes and categorizes each event
- ✅ Only events with quality score ≥50 are added
- ✅ Events appear on your website within 2-3 minutes
- ✅ Zero manual work required!

**Next scraper run:** Check cron schedule in workflow file (every 6 hours)

---

## 🚨 Having Issues?

### "Invalid API key"
- Make sure you copied the full key: `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`
- No extra spaces or quotes
- Secret name is exactly `GEMINI_API_KEY` (all caps)

### "Permission denied"
- Share your Google Sheet with the service account email
- Give "Editor" permission (not "Viewer")

### Workflow fails
- Check all 3 secrets are added
- View workflow logs for specific error

---

## 📚 More Help

- **Full Guide:** [ADD_GEMINI_KEY_INSTRUCTIONS.md](ADD_GEMINI_KEY_INSTRUCTIONS.md)
- **All APIs:** [API_CONFIGURATION_SUMMARY.md](API_CONFIGURATION_SUMMARY.md)
- **Quick Fixes:** [QUICK_WINS_CHECKLIST.md](QUICK_WINS_CHECKLIST.md)

---

**Your Key (for reference):**
```
AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs
```

**Sheet ID:**
```
1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
```

**GitHub Secrets URL:**
```
https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
```

---

**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy 🟢  
**Cost:** $0/month 💰  
**Result:** Fully automated events! 🎉

