# AI Event Aggregator Setup Guide

## Overview
The AI Event Aggregator automatically discovers Norwich events from multiple sources using Claude AI, validates them, and adds them to your Google Sheets database in real-time.

## Features
- 🤖 AI-powered event parsing with Claude
- 🔄 Runs automatically twice daily (6 AM & 6 PM UTC)
- 📊 Quality scoring and auto-approval
- 🎯 Scrapes: Eventbrite, Skiddle, Norwich Council, Visit Norwich
- ✅ Deduplication and validation

## Setup Steps

### 1. Get Required API Keys

#### Claude API Key (Required)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

#### Eventbrite API Key (Optional but Recommended)
1. Go to https://www.eventbrite.com/platform/api
2. Create an account and app
3. Copy your Private Token

#### Google Service Account (Required)
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google Sheets API
4. Go to IAM & Admin > Service Accounts
5. Create Service Account
6. Download JSON credentials file
7. Share your Google Sheet with the service account email

### 2. Configure GitHub Secrets

Go to your repository Settings > Secrets and variables > Actions, and add:

| Secret Name | Description | Required |
|------------|-------------|----------|
| `CLAUDE_API_KEY` | Your Anthropic API key | ✅ Yes |
| `GOOGLE_SHEET_ID` | Your Google Sheet ID | ✅ Yes |
| `GOOGLE_SHEETS_CREDENTIALS` | Full JSON content of service account credentials | ✅ Yes |
| `EVENTBRITE_API_KEY` | Eventbrite API token | ⚠️ Recommended |
| `FACEBOOK_ACCESS_TOKEN` | Facebook Graph API token (deprecated) | ❌ Optional |

**How to add `GOOGLE_SHEETS_CREDENTIALS`:**
1. Open your service account JSON file
2. Copy the ENTIRE contents (it's one big JSON object)
3. Paste it as the secret value

### 3. Test the Workflow

#### Manual Run
1. Go to Actions tab in GitHub
2. Select "Daily AI Event Aggregation"
3. Click "Run workflow"
4. Monitor the progress

#### View Results
- Check the "Artifacts" section for generated event files
- Check your Google Sheet for new AI-discovered events
- Events with Status "Approved" will show on your website
- Events with Status "AI_Pending_Review" need manual approval

### 4. Local Testing (Optional)

Create `.env` file in the `automation/` directory:

```bash
CLAUDE_API_KEY=sk-ant-xxx
GOOGLE_SHEET_ID=1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
GOOGLE_SHEETS_CREDENTIALS=./google-service-account.json
EVENTBRITE_API_KEY=your_eventbrite_key
SCRAPE_DAYS_AHEAD=90
MIN_QUALITY_SCORE=50
AUTO_APPROVE_THRESHOLD=80
NORWICH_RADIUS_KM=15
```

Install and run:
```bash
cd automation
pip install -r requirements.txt
python ai-event-aggregator.py
```

## Configuration Options

Environment variables to customize behavior:

| Variable | Default | Description |
|----------|---------|-------------|
| `SCRAPE_DAYS_AHEAD` | 90 | How many days ahead to scrape events |
| `MIN_QUALITY_SCORE` | 50 | Minimum score to not reject (0-100) |
| `AUTO_APPROVE_THRESHOLD` | 80 | Score needed for auto-approval (0-100) |
| `NORWICH_RADIUS_KM` | 15 | Distance from Norwich to include events |

## Quality Scoring

Events are scored out of 100 points:
- ✅ All required fields (name, date, time, location, description): 30 points
- 🎫 Ticket link provided: 20 points
- 🏢 From trusted source (Eventbrite, Council, Visit Norwich): 20 points
- 📝 Good description (50-500 chars): 15 points
- 🖼️ Has image: 15 points

**Status Assignment:**
- Score ≥ 80: Auto-approved (appears immediately on website)
- Score 50-79: Pending review (requires manual approval)
- Score < 50: Rejected (not added to sheet)

## Troubleshooting

### Workflow fails with "CLAUDE_API_KEY not found"
- Ensure you added the secret in GitHub repo settings
- Check the secret name matches exactly (case-sensitive)

### "Failed to upload to Google Sheets"
- Verify service account JSON is valid
- Ensure Google Sheet is shared with service account email
- Check Sheet ID is correct

### No events found
- Check the scraper websites are accessible
- Increase `SCRAPE_DAYS_AHEAD` value
- Lower `MIN_QUALITY_SCORE` temporarily for testing

### Events not showing on website
- Check event Status is "Approved" in Google Sheet
- Verify `USE_LOCAL_STORAGE: false` in `scripts/config.js`
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check Google Apps Script is deployed correctly

## Schedule

The AI aggregator runs automatically:
- **6:00 AM UTC** (early morning)
- **6:00 PM UTC** (evening)

You can trigger it manually anytime via GitHub Actions.

## Next Steps

1. ✅ Set up all GitHub Secrets
2. ✅ Run the workflow manually to test
3. ✅ Review AI-discovered events in Google Sheets
4. ✅ Approve pending events
5. ✅ Check events appear on your website

## Support

- Check workflow logs in GitHub Actions for errors
- Review `AUDIT_REPORT_GEMINI.md` for codebase overview
- Events are saved to JSON files in artifacts if upload fails
