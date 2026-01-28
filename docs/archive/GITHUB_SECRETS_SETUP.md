# GitHub Secrets Setup Guide

## Required Secrets for Automated Weekly Event Updates

To enable the automated AI event scraping that runs every Monday at 6:00 AM UTC, you need to add the following secrets to your GitHub repository.

---

## How to Add Secrets

1. Go to your GitHub repository: `https://github.com/marc420-design/norwich-event-hub`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## Required Secrets

### 1. `CLAUDE_API_KEY` (Required)

**What it is:** API key for Claude AI to process and categorize events

**How to get it:**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

**Cost:** ~$0.05-0.15 per week (~$5-10/year)

**Example:**
```
sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 2. `GOOGLE_SHEET_ID` (Optional but recommended)

**What it is:** The ID of your Google Sheet where events are stored

**How to get it:**
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Copy the `{SHEET_ID}` part

**Example:**
```
1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

### 3. `GOOGLE_SHEETS_CREDENTIALS` (Optional but recommended)

**What it is:** Service account credentials for accessing Google Sheets

**How to get it:**
1. Go to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable **Google Sheets API**
4. Create **Service Account**
5. Download JSON credentials file
6. Copy the **entire JSON content** as the secret value

**Example:**
```json
{
  "type": "service_account",
  "project_id": "norwich-events-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "norwich-events@project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

---

### 4. `EVENTBRITE_API_KEY` (Optional)

**What it is:** API key to scrape Eventbrite events

**How to get it:**
1. Go to https://www.eventbrite.com/platform/
2. Sign up for developer account
3. Create an app
4. Get your API key

**Cost:** Free for public events

**Example:**
```
ABC123XYZ456
```

---

### 5. `FACEBOOK_ACCESS_TOKEN` (Optional)

**What it is:** Access token to scrape Facebook events

**How to get it:**
1. Go to https://developers.facebook.com/
2. Create an app
3. Get User Access Token with `events` permission

**Note:** Facebook has restricted public event access, so this is optional and may not work for all events.

---

## What Happens When Secrets Are Set?

1. **Every Monday at 6:00 AM UTC**, GitHub Actions will:
   - Run the AI event scraper
   - Discover 50-100 new Norwich events
   - Use Claude AI to clean and categorize them
   - Remove duplicates
   - Auto-approve high-quality events
   - Update `data/sample-events.json`
   - Commit changes back to the repository
   - Trigger Cloudflare Pages rebuild (if connected)

2. **Your website automatically updates** with new events!

---

## Testing the Workflow

Once secrets are added, you can test manually:

1. Go to **Actions** tab in GitHub
2. Click **Weekly Event Aggregation**
3. Click **Run workflow**
4. Select branch: `master`
5. Click **Run workflow**

Watch the workflow run in real-time and check if events are updated!

---

## Minimum Setup (Just to Test)

If you want to test the automation without setting up all the services:

**Only add:**
- `CLAUDE_API_KEY` (required)

**Leave empty/skip:**
- All other secrets

The scraper will still work but will:
- Only scrape web sources (Skiddle, Norwich Council, Visit Norwich)
- Save results to JSON file
- Not sync to Google Sheets
- Still update the website

---

## Cost Summary

| Service | Cost | Required? |
|---------|------|-----------|
| Claude API | $5-10/year | ✅ Yes |
| Google Sheets | FREE | ⚠️ Optional |
| Eventbrite API | FREE | ⚠️ Optional |
| Facebook API | FREE | ⚠️ Optional |
| GitHub Actions | FREE | ✅ Yes |
| **Total** | **~$10/year** | |

---

## Troubleshooting

**Workflow not running?**
- Check if secrets are added correctly
- Verify workflow file is in `.github/workflows/`
- Check Actions tab for error messages

**Events not updating on website?**
- Check workflow logs in Actions tab
- Verify `data/sample-events.json` was updated
- Check if Cloudflare Pages is set to auto-deploy

**Need help?**
- Check workflow logs in GitHub Actions
- Review `AI_AGGREGATOR_SETUP.md` for detailed setup
- See `AI_SYSTEM_SUMMARY.md` for system overview

---

## Status: Ready to Configure

Your workflow is ready! Just add the secrets above and the automation will start working.

**Priority: Add `CLAUDE_API_KEY` first** - that's the only one you need to get started!
