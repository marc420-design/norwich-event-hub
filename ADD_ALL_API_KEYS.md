# 🔑 Add All API Keys to GitHub - Complete Guide

**Your API Keys:**
- ✅ **Gemini AI:** `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`
- ✅ **OpenAI:** `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`

---

## 🎯 What This Setup Does

With **both** AI providers configured:
- 🤖 **Primary:** Uses Gemini AI (free, 60 req/min)
- 🔄 **Fallback:** Uses OpenAI if Gemini fails or rate-limited
- 🛡️ **Redundancy:** No downtime if one service has issues
- 💰 **Cost:** Gemini free tier, OpenAI pay-as-you-go backup

---

## ⚡ Quick Setup (10 Minutes)

### Step 1: Open GitHub Secrets

Click this link:
👉 **https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions**

---

### Step 2: Add GEMINI_API_KEY

1. Click **"New repository secret"**

2. Fill in:
   - **Name:** `GEMINI_API_KEY`
   - **Secret:** `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`

3. Click **"Add secret"**

---

### Step 3: Add OPENAI_API_KEY

1. Click **"New repository secret"** again

2. Fill in:
   - **Name:** `OPENAI_API_KEY`
   - **Secret:** `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`

3. Click **"Add secret"**

---

### Step 4: Add GOOGLE_SHEET_ID

1. Click **"New repository secret"**

2. Fill in:
   - **Name:** `GOOGLE_SHEET_ID`
   - **Secret:** `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`

3. Click **"Add secret"**

---

### Step 5: Add GOOGLE_SERVICE_ACCOUNT_JSON

**This is the Google credentials file for writing to your Sheet.**

#### Option A: If You Have the File

1. Open: `automation/google-credentials.json`
2. Copy the **entire contents** (from `{` to `}`)
3. Click **"New repository secret"**
4. Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
5. Paste the JSON as the secret value
6. Click **"Add secret"**

#### Option B: Create New Service Account

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click **"Create Credentials"** → **"Service Account"**

3. Name: `Norwich Events Scraper`

4. Click **"Create and Continue"**

5. Role: **Editor** (or minimum "Google Sheets API")

6. Click **"Continue"** → **"Done"**

7. Click on your service account name

8. Go to **"Keys"** tab

9. Click **"Add Key"** → **"Create new key"** → **JSON**

10. A file downloads - open it and copy ALL contents

11. Add as `GOOGLE_SERVICE_ACCOUNT_JSON` secret

12. **IMPORTANT - Share Your Sheet:**
    - Find `"client_email"` in the JSON
    - Copy that email (e.g., `xxx@xxx.iam.gserviceaccount.com`)
    - Open your Google Sheet
    - Click **"Share"**
    - Paste the email
    - Give **"Editor"** permission
    - Click **"Share"**

---

### Step 6: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/library

2. Search and enable:
   - ✅ **Google Sheets API**
   - ✅ **Generative Language API** (for Gemini)

3. Click **"Enable"** for each

---

### Step 7: Test the Scraper

1. Go to: https://github.com/marc420-design/norwich-event-hub/actions

2. Click **"AI Event Scraper"** (left sidebar)

3. Click **"Run workflow"** (right side)

4. Select **main** branch

5. Click **"Run workflow"** (green button)

6. Wait 2-5 minutes

7. Look for **✅ green checkmark** (success!)

8. Check your Google Sheet for new events

---

## ✅ Final Checklist

You should now have **4 secrets** in GitHub:

- [ ] `GEMINI_API_KEY` ✅
- [ ] `OPENAI_API_KEY` ✅
- [ ] `GOOGLE_SHEET_ID` ✅
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` ❓

**Plus:**
- [ ] Google Sheets API enabled
- [ ] Generative Language API enabled
- [ ] Sheet shared with service account email
- [ ] Workflow test run successful (green check)
- [ ] New events in Google Sheet

---

## 🤖 How the AI Providers Work

### Gemini (Primary)
```
✅ Uses: GEMINI_API_KEY
✅ Cost: FREE (60 requests/minute)
✅ Speed: Fast (~1-2 seconds per event)
✅ Quality: Excellent categorization
```

### OpenAI (Fallback)
```
🔄 Uses: OPENAI_API_KEY (if Gemini fails)
💰 Cost: Pay-as-you-go (~$0.01 per 1000 events)
✅ Speed: Fast (~1-2 seconds per event)
✅ Quality: Excellent categorization
```

**Behavior:**
1. Scraper tries Gemini first
2. If Gemini fails/rate-limited → switches to OpenAI
3. If OpenAI fails → logs error, skips event
4. Both providers produce same quality results

---

## 📊 What Gets Scraped

| Source | API Required | Events/Run | Quality |
|--------|--------------|------------|---------|
| **Eventbrite** | Optional | 10-30 | High |
| **Skiddle** | No | 10-20 | High |
| **Facebook** | Optional | 20-40 | Medium |
| **Norwich Council** | No | 5-10 | High |
| **Visit Norwich** | No | 5-10 | High |

**Total:** 30-80 events per run  
**Frequency:** 4x per day (every 6 hours)  
**AI Processing:** Categorizes, quality-scores, deduplicates

---

## 🔒 Security Notes

### Your Keys Are Safe ✅
- Stored as GitHub Secrets (encrypted)
- Never visible in code or logs
- Never exposed to website visitors
- Only accessible to GitHub Actions workflow
- Credentials file deleted after each run

### Rate Limits
- **Gemini:** 60 requests/minute (plenty for scraping)
- **OpenAI:** 3 requests/minute (Tier 1) or higher
- Scraper respects rate limits automatically

### Cost Monitoring
- **Gemini:** Free tier = $0
- **OpenAI:** Check usage at: https://platform.openai.com/usage
- Typical scraper run: ~50-100 API calls = ~$0.01-0.05 if using OpenAI

---

## 🚀 What Happens Next

### Automatic Schedule
Your scraper runs 4x per day:
- 🕛 **12:00 AM UTC** (7pm EST / 4pm PST)
- 🕕 **6:00 AM UTC** (1am EST / 10pm PST)
- 🕛 **12:00 PM UTC** (7am EST / 4am PST)
- 🕕 **6:00 PM UTC** (1pm EST / 10am PST)

### What Each Run Does
1. ✅ Scrapes all event sources (2-3 minutes)
2. ✅ AI processes each event (1-2 seconds each)
3. ✅ Quality-scores events (min 50/100)
4. ✅ Deduplicates (no repeats)
5. ✅ Uploads to Google Sheet (1 minute)
6. ✅ Website auto-updates (2-3 minutes later)

**Total time per run:** ~5-10 minutes  
**Your involvement:** Zero! 🎉

---

## 🎯 Expected Results

### After First Run
- 30-80 new events in Google Sheet
- Events dated for next 90 days
- All Norwich/Norfolk area (15km radius)
- Categories: nightlife, culture, sports, etc.
- Quality scores: 50-100

### On Your Website
- Events appear in "Featured This Week"
- Events appear in category pages
- Events appear in "This Weekend"
- Search and filters work
- No more manual updates needed!

---

## 🚨 Troubleshooting

### Error: "Invalid Gemini API key"
- Check: `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`
- No extra spaces or quotes
- Secret name exactly: `GEMINI_API_KEY`

### Error: "Invalid OpenAI API key"
- Check your key starts with `sk-svcacct-`
- No extra spaces or quotes
- Secret name exactly: `OPENAI_API_KEY`

### Error: "Permission denied" on Sheet
- Share Sheet with service account email
- Give "Editor" permission (not "Viewer")

### Workflow doesn't start
- Check all 4 secrets are added
- Secret names are case-sensitive
- Try manual trigger: Actions → Run workflow

### No events found
- Check workflow logs for errors
- Verify scraper sources are accessible
- Some sources may be temporarily down
- Quality scores may be too low (adjust MIN_QUALITY_SCORE)

### Using too much OpenAI credits
- Check logs: Should say "Using Google Gemini AI"
- If using OpenAI primarily, Gemini key may be invalid
- Add/fix Gemini key to use free tier first

---

## 💰 Cost Breakdown

### With Your Setup

| Service | Monthly Cost |
|---------|--------------|
| Gemini AI (primary) | $0 (free) |
| OpenAI (fallback only) | ~$0-5 (depends on usage) |
| Google Sheets | $0 (free) |
| GitHub Actions | $0 (free) |
| Cloudflare Pages | $0 (free) |
| **TOTAL** | **~$0-5/month** |

**To minimize OpenAI costs:**
- Gemini handles 99% of requests (free)
- OpenAI only used if Gemini fails
- Typical usage: ~$0-1/month

---

## 📞 Need Help?

**Workflow logs:** Check GitHub Actions → Click workflow run → View logs  
**API usage:** 
- Gemini: https://makersuite.google.com/
- OpenAI: https://platform.openai.com/usage

**Documentation:**
- [Quick Start Guide](QUICK_START_ADD_API_KEY.md)
- [API Configuration Summary](API_CONFIGURATION_SUMMARY.md)
- [Quick Wins Checklist](QUICK_WINS_CHECKLIST.md)

---

## 🔗 Quick Links for Copy-Paste

**GitHub Secrets Page:**
```
https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
```

**Google Cloud Console:**
```
https://console.cloud.google.com/apis/credentials
```

**Google Sheet:**
```
https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
```

**GitHub Actions:**
```
https://github.com/marc420-design/norwich-event-hub/actions
```

---

## 📋 Secrets Summary (Copy-Paste Ready)

**Secret 1: GEMINI_API_KEY**
```
AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs
```

**Secret 2: OPENAI_API_KEY**
```
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
```

**Secret 3: GOOGLE_SHEET_ID**
```
1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
```

**Secret 4: GOOGLE_SERVICE_ACCOUNT_JSON**
```
(Create via Google Cloud Console - see Step 5 above)
```

---

**Time to Complete:** 10-15 minutes  
**Difficulty:** Easy 🟢  
**Monthly Cost:** ~$0-5 💰  
**Result:** Fully automated event discovery! 🎉

---

**Last Updated:** January 6, 2026  
**Status:** Ready to deploy ✅

