# AI Event Aggregator - Setup Guide

Complete guide to setting up automated event discovery for Norwich Event Hub.

---

## 🎯 What This Does

**Automatically finds and adds Norwich events every Monday**:
- Scrapes 150-300 events/week from multiple sources
- AI processes and categorizes each event
- Removes duplicates
- Scores quality (0-100)
- Auto-approves high-quality events (score > 80)
- Adds to Google Sheets for review/publishing

---

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Claude API key** from Anthropic
3. **Google Sheets** set up (from GOOGLE_SHEET_SETUP.md)
4. **API keys** for event platforms (optional but recommended)

---

## ⚡ Quick Setup (30 minutes)

### Step 1: Install Python Dependencies

```bash
cd automation
pip install -r requirements.txt
```

### Step 2: Get Claude API Key

1. Go to https://console.anthropic.com/
2. Sign up/log in
3. Go to "API Keys"
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-`)

**Cost**: ~$0.01-0.10 per week (very cheap!)

### Step 3: Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit .env file
# Add your Claude API key and Google Sheet ID
```

Your `.env` file should look like:
```bash
CLAUDE_API_KEY=sk-ant-api03-YOUR_ACTUAL_KEY_HERE
GOOGLE_SHEET_ID=YOUR_SHEET_ID_FROM_GOOGLE_SHEETS
GOOGLE_SHEETS_CREDENTIALS=./google-service-account.json
```

### Step 4: Set Up Google Service Account

1. Go to https://console.cloud.google.com/
2. Create new project: "Norwich Event Hub"
3. Enable Google Sheets API
4. Create Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name: "Event Aggregator"
   - Click "Create and Continue"
   - Role: "Editor"
   - Click "Done"
5. Create key:
   - Click on the service account
   - "Keys" tab > "Add Key" > "Create new key"
   - Choose JSON
   - Save as `google-service-account.json` in `automation/` folder
6. Share your Google Sheet with the service account email
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (ends with `@*.iam.gserviceaccount.com`)
   - Give "Editor" access

### Step 5: Test the Aggregator

```bash
python ai-event-aggregator.py
```

**First run**: Will take 10-15 minutes to scrape and process events.

**Expected output**:
```
🚀 Starting AI Event Aggregator
📡 Scraping event sources...
  Scraping Eventbrite...
  Scraping Skiddle...
  ...
✅ Found 127 raw events
🤖 Processing events with AI...
  Processing event 1/127...
  ...
✔️ Validating events...
  ✅ 98/127 events passed validation
🔍 Removing duplicates...
✅ 76 unique events after deduplication
⭐ Scoring event quality...
📤 Uploading to Google Sheets...
  ✅ Uploaded 45 approved and 31 pending events
```

---

## 🔑 Optional: Get Additional API Keys

### Eventbrite API (Recommended)

1. Go to https://www.eventbrite.com/platform/
2. Sign up for developer account
3. Create an app
4. Copy your API key
5. Add to `.env`:
   ```bash
   EVENTBRITE_API_KEY=YOUR_KEY_HERE
   ```

**Benefit**: Access to 30-60 curated events per week

### Facebook Graph API (Optional)

**Note**: Facebook deprecated public events API in 2018. Alternative methods:
- Scrape public pages/venues
- Use Facebook Marketing API (requires approval)
- Manual import from Facebook events

For now, skip this unless you have special access.

---

## 📅 Schedule Weekly Automation

### Option 1: Cloudflare Workers (Recommended)

1. **Create Cloudflare Worker**:
   - Go to Cloudflare Dashboard
   - Workers > Create a Service
   - Name: "event-aggregator"

2. **Deploy Python script**:
   - Use Workers + Python runtime
   - Or use Worker to trigger external Python service (AWS Lambda, Railway, etc.)

3. **Add Cron Trigger**:
   - Workers > Triggers > Cron Triggers
   - Add: `0 6 * * 1` (Every Monday at 6 AM)

4. **Add environment variables**:
   - Settings > Variables
   - Add all variables from `.env`

**Cost**: ~$5/month (Workers paid plan)

### Option 2: GitHub Actions (Free!)

1. **Create `.github/workflows/scrape-events.yml`**:

```yaml
name: Weekly Event Aggregation

on:
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 6 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  scrape-events:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          cd automation
          pip install -r requirements.txt

      - name: Run aggregator
        env:
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
          GOOGLE_SHEET_ID: ${{ secrets.GOOGLE_SHEET_ID }}
          GOOGLE_SHEETS_CREDENTIALS: ${{ secrets.GOOGLE_SHEETS_CREDENTIALS }}
          EVENTBRITE_API_KEY: ${{ secrets.EVENTBRITE_API_KEY }}
        run: |
          cd automation
          python ai-event-aggregator.py
```

2. **Add secrets to GitHub**:
   - Go to repo > Settings > Secrets and variables > Actions
   - Add all API keys as secrets

3. **Push to GitHub** - automation starts automatically!

**Cost**: FREE!

### Option 3: Your Local Computer (Windows Task Scheduler)

1. **Create batch file** (`run-aggregator.bat`):
```batch
@echo off
cd "C:\Users\marc\Desktop\new company\automation"
python ai-event-aggregator.py
```

2. **Open Task Scheduler**:
   - Search "Task Scheduler" in Windows
   - Create Basic Task
   - Name: "Norwich Event Aggregator"
   - Trigger: Weekly, Monday, 6:00 AM
   - Action: Start a program
   - Program: `C:\path\to\run-aggregator.bat`

**Cost**: FREE (but computer must be on)

### Option 4: Make.com Webhook

1. **Create Make.com scenario**:
   - Schedule trigger: Every Monday 6 AM
   - HTTP module: Call your Python script endpoint
   - Or use "Run Python Code" module

2. **Host Python script**:
   - Use Railway.app (free tier)
   - Or Heroku
   - Or AWS Lambda

**Cost**: ~$10/month

---

## 🧪 Testing

### Test Individual Scrapers

```python
python
>>> from ai_event_aggregator import EventAggregator
>>> agg = EventAggregator()
>>> events = agg.scrape_eventbrite()
>>> print(f"Found {len(events)} events from Eventbrite")
```

### Test AI Processing

```python
>>> raw_event = {
...     'raw_data': '<div>Concert at Waterfront - Dec 15, 8pm</div>',
...     'source': 'Test',
...     'url': 'http://test.com'
... }
>>> structured = agg.parse_event_with_claude(raw_event)
>>> print(structured)
```

### Dry Run (Don't Upload)

Temporarily comment out `self.upload_to_sheets()` in the `run()` method to test without uploading.

---

## 📊 Monitoring

### Check Logs

```bash
# Run with verbose logging
python ai-event-aggregator.py 2>&1 | tee aggregator.log
```

### Review Google Sheet

After running, check your Google Sheet:
- **Status = "Approved"**: Auto-approved (high quality, ready to publish)
- **Status = "AI_Pending_Review"**: Needs your review
- **Status = "Rejected"**: Low quality (not added)

### Email Notifications (Optional)

Add email sending to `print_summary()`:

```python
import smtplib
from email.mime.text import MIMEText

def send_summary_email(summary_text):
    msg = MIMEText(summary_text)
    msg['Subject'] = 'Weekly Event Aggregation Summary'
    msg['From'] = 'events@norwicheventshub.com'
    msg['To'] = 'your-email@example.com'

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('events@norwicheventshub.com', 'your-app-password')
        server.send_message(msg)
```

---

## 🎯 Expected Results

### First Run:
- **Events found**: 100-200
- **After filtering**: 60-120
- **Auto-approved**: 30-60
- **Pending review**: 20-40
- **Time**: 10-15 minutes

### Weekly (after first run):
- **New events**: 50-100
- **Duplicates filtered**: 20-40
- **Auto-approved**: 20-40
- **Pending review**: 10-30
- **Time**: 5-10 minutes

---

## 🐛 Troubleshooting

### "CLAUDE_API_KEY not found"
- Check `.env` file exists
- Check key is correct (starts with `sk-ant-`)
- Load env vars: `export $(cat .env | xargs)` (Linux/Mac)

### "Failed to upload to Google Sheets"
- Check service account JSON file exists
- Verify Sheet ID is correct
- Ensure service account has Editor access to sheet

### "No events found"
- Check internet connection
- Some sites may block scrapers (normal)
- Try different User-Agent in requests headers

### "Rate limited"
- Add delays between requests
- Use proxies (optional)
- Reduce number of events scraped

### Events not in Norwich
- Adjust `NORWICH_RADIUS_KM` in `.env`
- AI should filter by location, but may miss some

---

## 💰 Cost Breakdown

### Minimum (DIY):
- **Claude API**: ~$0.05-0.15/week
- **Google Sheets**: FREE
- **Hosting**: FREE (GitHub Actions)
- **Total**: ~$5-10/year

### With Premium APIs:
- **Claude API**: ~$0.15/week
- **Eventbrite API**: FREE
- **Hosting**: ~$5/month (Cloudflare Workers)
- **Total**: ~$60/year

---

## 🚀 Launch Checklist

- [ ] Python dependencies installed
- [ ] Claude API key obtained
- [ ] `.env` file configured
- [ ] Google service account created
- [ ] Service account added to Google Sheet
- [ ] Test run successful
- [ ] Weekly automation scheduled
- [ ] Email notifications set up (optional)
- [ ] Monitoring in place

---

## 📈 Next Steps

1. **Run first aggregation** (now!)
2. **Review events in Google Sheet**
3. **Approve pending events**
4. **Schedule weekly automation**
5. **Monitor for a few weeks**
6. **Optimize**:
   - Adjust quality thresholds
   - Add more sources
   - Improve AI prompts
   - Fine-tune categories

---

## 🎉 You're Done!

Your AI event aggregator is now set up and will automatically discover Norwich events every week!

**Next Monday at 6 AM**: System will run automatically and add 50-100 new events to your platform.

Questions? Check `AI_EVENT_AGGREGATOR.md` for architecture details.
