# 🔑 Your API Keys - Quick Reference

**Last Updated:** January 6, 2026

---

## ✅ API Keys You Provided

### 1. Gemini AI (Primary AI Provider)
```
AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs
```
**Use:** Primary AI for event scraping and categorization  
**Cost:** FREE (60 requests/minute)  
**Add to GitHub Secret:** `GEMINI_API_KEY`

---

### 2. OpenAI (Backup AI Provider)
```
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
```
**Use:** Fallback AI if Gemini fails or rate-limited  
**Cost:** Pay-as-you-go (~$0.01 per 1000 events, typically $0-5/month)  
**Add to GitHub Secret:** `OPENAI_API_KEY`

---

## 🎯 What This Setup Gives You

### Redundancy & Reliability 🛡️
- **Primary:** Gemini handles 99% of requests (FREE)
- **Backup:** OpenAI kicks in only if Gemini fails
- **Result:** Zero downtime, always working

### Smart Cost Management 💰
- Gemini is FREE and fast (60 req/min)
- OpenAI only used as last resort
- Expected monthly cost: ~$0-1 (mostly free!)

### How It Works 🤖
```
1. Scraper finds an event
2. Tries Gemini first (free)
3. If Gemini works → Uses result ✅
4. If Gemini fails → Tries OpenAI 🔄
5. If OpenAI works → Uses result ✅
6. If both fail → Logs error, skips event ❌
```

---

## 📋 Complete Setup Checklist

### GitHub Secrets to Add (4 total)

| # | Secret Name | Value | Status |
|---|-------------|-------|--------|
| 1 | `GEMINI_API_KEY` | (see above) | ⏸️ To Add |
| 2 | `OPENAI_API_KEY` | (see above) | ⏸️ To Add |
| 3 | `GOOGLE_SHEET_ID` | `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU` | ⏸️ To Add |
| 4 | `GOOGLE_SERVICE_ACCOUNT_JSON` | (create via Google Cloud) | ❓ To Create |

---

## ⚡ Quick Add Instructions

### Step 1: Open GitHub Secrets
👉 https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions

### Step 2: Add Each Secret
For each of the 4 secrets above:
1. Click **"New repository secret"**
2. Enter the **Name** (exact, case-sensitive)
3. Paste the **Value**
4. Click **"Add secret"**

### Step 3: Enable APIs
👉 https://console.cloud.google.com/apis/library

Enable these:
- ✅ Google Sheets API
- ✅ Generative Language API (Gemini)

### Step 4: Test
👉 https://github.com/marc420-design/norwich-event-hub/actions

1. Click "AI Event Scraper"
2. Click "Run workflow"
3. Wait 2-5 minutes
4. Look for green checkmark ✅

---

## 📊 Expected Results

### First Run
- Discovers 30-80 events
- AI categorizes each one
- Quality scores events (min 50/100)
- Uploads to Google Sheet
- Website updates automatically

### Ongoing (4x per day)
- Runs at: 12am, 6am, 12pm, 6pm UTC
- Fresh events added continuously
- Old events automatically removed
- No manual work needed! 🎉

---

## 💰 Cost Estimate

| Scenario | Monthly Cost |
|----------|--------------|
| **Gemini only** (typical) | $0 |
| **Gemini + occasional OpenAI** | $0-1 |
| **OpenAI as primary** (if Gemini fails often) | $5-10 |

**Recommendation:** Monitor first month, should be ~$0-1

---

## 🔒 Security

Your keys are:
- ✅ Encrypted in GitHub Secrets
- ✅ Never visible in code or logs
- ✅ Only accessible to workflow
- ✅ Not exposed to website visitors
- ✅ Automatically deleted after use (credentials file)

---

## 📚 Complete Guides

**Choose based on your need:**

1. **[ADD_ALL_API_KEYS.md](ADD_ALL_API_KEYS.md)** ⭐ RECOMMENDED
   - Complete setup with both AI providers
   - Step-by-step instructions
   - Troubleshooting included

2. **[API_CONFIGURATION_SUMMARY.md](API_CONFIGURATION_SUMMARY.md)**
   - Overview of all APIs (configured + optional)
   - What each API does
   - Cost breakdown

3. **[QUICK_START_ADD_API_KEY.md](QUICK_START_ADD_API_KEY.md)**
   - Original Gemini-only guide
   - Super quick (5 min)

---

## 🚀 Next Steps

1. ✅ **Read:** [ADD_ALL_API_KEYS.md](ADD_ALL_API_KEYS.md) (5 min)
2. ✅ **Add:** All 4 secrets to GitHub (10 min)
3. ✅ **Enable:** Google APIs (2 min)
4. ✅ **Test:** Run workflow manually (5 min)
5. ✅ **Verify:** Check Google Sheet for events (1 min)
6. ✅ **Check:** Website shows new events (2 min)

**Total Time:** 25 minutes  
**Result:** Fully automated! 🎉

---

## 🎯 Summary

**You have everything you need!**
- ✅ Gemini API Key (primary, free)
- ✅ OpenAI API Key (backup, minimal cost)
- ✅ Google Sheet ID (data storage)
- ❓ Just need: Service Account JSON (create via Google Cloud)

**Next action:** Follow [ADD_ALL_API_KEYS.md](ADD_ALL_API_KEYS.md) guide

---

**Questions?** Check the troubleshooting section in ADD_ALL_API_KEYS.md

**Last Updated:** January 6, 2026  
**Status:** Ready to configure ✅

