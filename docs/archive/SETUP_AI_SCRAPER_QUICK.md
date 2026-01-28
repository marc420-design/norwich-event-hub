# AI Event Scraper - Quick Setup Guide

## Overview

The AI Event Scraper automatically discovers and adds Norwich events from multiple sources (Eventbrite, Skiddle, Norwich Council, Visit Norwich) using Google Gemini AI to parse and structure the data.

**Status:** ⏸️ Currently inactive (missing GitHub Secrets)  
**Time to activate:** ~15 minutes  
**Cost:** £0/month (free tier)

---

## Required GitHub Secrets

You need to add 3 secrets to your GitHub repository:

### 1. GEMINI_API_KEY

**What it is:** Google Gemini AI API key for parsing event data

**How to get it:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

**How to add it:**
1. Go to https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GEMINI_API_KEY`
4. Value: Paste your API key
5. Click "Add secret"

---

### 2. GOOGLE_SHEET_ID

**What it is:** The ID of your Google Sheet database

**How to get it:**
Your Google Sheet URL looks like:
```
https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your GOOGLE_SHEET_ID
```

**Your Sheet ID:** `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`

**How to add it:**
1. Go to https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GOOGLE_SHEET_ID`
4. Value: `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`
5. Click "Add secret"

---

### 3. GOOGLE_SERVICE_ACCOUNT_JSON

**What it is:** Google service account credentials for accessing your Google Sheet

**How to get it:**
You already have this file in your project: `automation/google-service-account.json`

**How to add it:**
1. Open `automation/google-service-account.json` in a text editor
2. Copy the **entire contents** of the file (it's a JSON object)
3. Go to https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
4. Click "New repository secret"
5. Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
6. Value: Paste the entire JSON content
7. Click "Add secret"

**Example of what it should look like:**
```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  ...
}
```

---

## Testing the Scraper

Once all 3 secrets are added:

1. Go to https://github.com/marc420-design/norwich-event-hub/actions
2. Click on "Scrape Real-Time Events" workflow
3. Click "Run workflow" button (top right)
4. Click the green "Run workflow" button
5. Wait 2-3 minutes for it to complete
6. Check your Google Sheet for new events

---

## Automated Schedule

Once activated, the scraper will run automatically:
- **Daily at 6:00 AM UTC** (6:00 AM UK time in winter, 7:00 AM in summer)
- **Manual trigger** available anytime from GitHub Actions

---

## What the Scraper Does

1. **Scrapes** events from multiple sources
2. **Parses** raw HTML/JSON using Gemini AI
3. **Validates** event data (date, location, category)
4. **Scores** quality (0-100)
5. **Deduplicates** to avoid duplicates
6. **Uploads** to Google Sheets:
   - Quality score ≥ 80: Auto-approved
   - Quality score 50-79: Pending review
   - Quality score < 50: Discarded

---

## Troubleshooting

### Workflow fails with "API key not found"
- Check that `GEMINI_API_KEY` secret is added correctly
- Make sure there are no extra spaces in the key

### Workflow fails with "Permission denied"
- Check that `GOOGLE_SERVICE_ACCOUNT_JSON` is the complete JSON file
- Verify the service account has edit access to your Google Sheet

### No events appear in Google Sheet
- Check the workflow logs for errors
- Verify the sheet ID is correct
- Check that sources are returning data (some may be down)

---

## Next Steps

After activation:
1. Monitor the first few runs to ensure it's working
2. Review pending events in your admin dashboard
3. Adjust quality thresholds if needed (in `.github/workflows/scrape-events.yml`)
4. Add more event sources if desired

---

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all 3 secrets are added correctly
3. Test manually first before relying on automated schedule

**Estimated events per day:** 10-50 (varies by source availability)
