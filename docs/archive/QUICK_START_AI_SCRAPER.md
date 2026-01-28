# 🚀 Quick Start: AI Event Scraper

**Get automated event updates in 15 minutes!**

---

## Step 1: Get Gemini API Key (5 min, FREE)

1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

---

## Step 2: Add GitHub Secrets (5 min)

Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions

Click "New repository secret" and add these 3 secrets:

### Secret 1: `GEMINI_API_KEY`
Paste your key from Step 1

### Secret 2: `GOOGLE_SHEET_ID`
```
1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
```

### Secret 3: `GOOGLE_SERVICE_ACCOUNT_JSON`
Open `automation/google-service-account.json` and paste the entire JSON contents

---

## Step 3: Enable & Test (5 min)

1. Go to: Actions tab
2. Click "AI Event Scraper"
3. Click "Run workflow" → "Run workflow"
4. Wait 2-5 minutes
5. Check for green checkmark ✅

---

## ✅ Done!

Your site will now auto-update with scraped events **4 times per day**:
- 00:00 UTC (midnight)
- 06:00 UTC (6am)
- 12:00 UTC (noon)
- 18:00 UTC (6pm)

Visit https://norwicheventshub.com to see live events!

---

## 📖 Full Documentation

See `SETUP_AI_SCRAPER.md` for:
- Detailed troubleshooting
- Configuration options
- Monitoring & logs
- Advanced features

---

**Total Cost:** FREE  
**Maintenance:** None required  
**Updates:** Automatic

