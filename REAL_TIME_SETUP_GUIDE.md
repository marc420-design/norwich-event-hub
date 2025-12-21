# Real-Time Data Setup Guide
**Get your Norwich Event Hub live with real-time AI data in 30 minutes!**

---

## 🎯 What We're Setting Up

You'll enable:
- ✅ Real-time event data from Google Sheets
- ✅ Live updates without rebuilding the site
- ✅ AI scraper that auto-updates events weekly
- ✅ Form submissions that go directly to Google Sheets
- ✅ "What's On Today" showing actual current events

---

## 📋 Prerequisites

You'll need:
- [ ] Google Account
- [ ] GitHub account (already have: marc420-design)
- [ ] Anthropic API key (for Claude AI) - Get at https://console.anthropic.com/
- [ ] 30 minutes of time

---

## Step 1: Set Up Google Sheets (5 minutes)

### 1.1 Create Your Event Hub Spreadsheet

1. Go to https://sheets.google.com
2. Click **"Blank"** to create a new spreadsheet
3. Name it: **"Norwich Event Hub - Events"**

### 1.2 Create the Event Submissions Sheet

1. Rename "Sheet1" to **"Event Submissions"**
2. Add these headers in Row 1 (columns A-M):
   ```
   Timestamp | Event Name | Date | Time | Location | Category | Description | Ticket Link | Promoter Name | Promoter Email | Promoter Phone | Status | Event ID
   ```

3. Add a few test events manually for now:
   - Set Status to "Approved" for events you want visible
   - Use date format: YYYY-MM-DD (e.g., 2025-12-25)
   - Use time format: HH:MM (e.g., 19:30)
   - Categories: nightlife, gigs, theatre, sports, markets, community, culture, free

### 1.3 Get Your Sheet ID

1. Look at the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
2. Copy the **YOUR_SHEET_ID** part (between `/d/` and `/edit`)
3. Save it - you'll need this later

**Example:**
```
URL: https://docs.google.com/spreadsheets/d/1ABC123xyz456DEF789/edit
Sheet ID: 1ABC123xyz456DEF789
```

---

## Step 2: Deploy Google Apps Script (10 minutes)

### 2.1 Open Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. A new tab will open with the Script Editor
3. Delete any default code

### 2.2 Add the Norwich Event Hub Script

1. Copy ALL the code from `automation/google-apps-script.js`
2. Paste it into the Script Editor
3. Click **File** → **Save** (or Ctrl+S)
4. Name the project: **"Norwich Event Hub API"**

### 2.3 Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Configure:
   - **Description:** "Norwich Event Hub API v1"
   - **Execute as:** Me (your email)
   - **Who has access:** **Anyone**
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to Norwich Event Hub API (unsafe)**
9. Click **Allow**

### 2.4 Copy Your Web App URL

1. You'll see a deployment confirmation
2. Copy the **Web app URL** - it looks like:
   ```
   https://script.google.com/macros/s/ABC123.../exec
   ```
3. **Save this URL** - you'll need it in the next step!

### 2.5 Test Your API

1. Open a new browser tab
2. Paste your Web App URL
3. You should see JSON response:
   ```json
   {
     "success": true,
     "events": [...]
   }
   ```

✅ **Success!** Your API is live!

---

## Step 3: Configure Website for Real-Time Data (2 minutes)

### 3.1 Update config.js

Open `scripts/config.js` and update these values:

```javascript
const APP_CONFIG = {
    // PASTE YOUR WEB APP URL HERE (from Step 2.4)
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec',

    // PASTE YOUR SHEET ID HERE (from Step 1.3)
    GOOGLE_SHEET_ID: 'YOUR_ACTUAL_SHEET_ID',

    // Google Sheets API key (optional - leave as is for now)
    GOOGLE_SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',

    // IMPORTANT: Change this to false for production!
    USE_LOCAL_STORAGE: false,  // ← Change from true to false

    // Update to your production domain (or leave as is)
    SITE_URL: 'https://norwich-event-hub.pages.dev',

    SOCIAL_HANDLES: {
        instagram: '@norwicheventshub',
        facebook: 'norwicheventshub',
        twitter: '@norwicheventshub',
        tiktok: '@norwicheventshub'
    }
};
```

### 3.2 Save and Commit

```bash
git add scripts/config.js
git commit -m "Configure real-time API integration"
git push
```

---

## Step 4: Set Up GitHub Secrets for AI Automation (5 minutes)

### 4.1 Create Google Service Account

1. Go to https://console.cloud.google.com/
2. Create a new project: **"Norwich Event Hub"**
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create Service Account:
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Name: **"Norwich Event Hub Bot"**
   - Click **Create and Continue**
   - Role: **Editor**
   - Click **Done**
5. Create Key:
   - Click on your new service account
   - Go to **Keys** tab
   - Click **Add Key** → **Create new key**
   - Choose **JSON**
   - Save the downloaded file

### 4.2 Share Google Sheet with Service Account

1. Open the downloaded JSON file
2. Find the `client_email` field (looks like: `norwich-event-hub@...iam.gserviceaccount.com`)
3. Go back to your Google Sheet
4. Click **Share**
5. Paste the service account email
6. Give it **Editor** access
7. Click **Send**

### 4.3 Add GitHub Secrets

1. Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click **New repository secret**

**Add these secrets:**

**Secret 1: CLAUDE_API_KEY**
- Name: `CLAUDE_API_KEY`
- Value: Your Anthropic API key from https://console.anthropic.com/
- Click **Add secret**

**Secret 2: GOOGLE_SHEET_ID**
- Name: `GOOGLE_SHEET_ID`
- Value: Your Sheet ID from Step 1.3
- Click **Add secret**

**Secret 3: GOOGLE_SHEETS_CREDENTIALS**
- Name: `GOOGLE_SHEETS_CREDENTIALS`
- Value: Paste the ENTIRE contents of the JSON file you downloaded
- Click **Add secret**

**Optional Secrets (can add later):**
- `EVENTBRITE_API_KEY` - For Eventbrite events
- `FACEBOOK_ACCESS_TOKEN` - For Facebook events

---

## Step 5: Add Current Events (3 minutes)

We need events for December 2025 so "What's On Today" works!

### Option A: Manual (Quick)

1. Go to your Google Sheet
2. Add 5-10 events with dates in December 2025
3. Set Status = "Approved"
4. These will show immediately on your site!

### Option B: Run AI Scraper (Better)

```bash
cd automation

# Install dependencies (if not already)
pip install -r requirements.txt

# Set environment variables (Windows)
set CLAUDE_API_KEY=your_key_here
set GOOGLE_SHEET_ID=your_sheet_id
set GOOGLE_SHEETS_CREDENTIALS=path/to/your/service-account.json

# Run the scraper
python ai-event-aggregator.py
```

The scraper will:
- Find real Norwich events
- Process them with AI
- Add to your Google Sheet
- Auto-approve high-quality events

---

## Step 6: Test Real-Time Data (2 minutes)

### 6.1 Test API Connection

1. Open your website locally or on Cloudflare
2. Open browser console (F12)
3. Look for logs:
   ```
   🔄 Loading events from JSON...
   ✅ Loaded X events from JSON
   ```

### 6.2 Test Live Updates

1. Add a new event to your Google Sheet
2. Set Status = "Approved"
3. Refresh your website
4. The event should appear!

**If it doesn't appear:**
- Check browser console for errors
- Verify Web App URL is correct in config.js
- Make sure `USE_LOCAL_STORAGE: false`
- Check that event status is "Approved"

---

## Step 7: Test Weekly Automation (3 minutes)

### 7.1 Manually Trigger Workflow

1. Go to: https://github.com/marc420-design/norwich-event-hub/actions
2. Click **"Weekly Event Aggregation"**
3. Click **"Run workflow"** button
4. Select branch: **master**
5. Click **"Run workflow"**

### 7.2 Monitor Execution

1. Click on the running workflow
2. Watch the steps execute:
   - ✅ Checkout repository
   - ✅ Set up Python
   - ✅ Install dependencies
   - ✅ Run AI Event Aggregator
   - ✅ Sync data to website
   - ✅ Commit and push updated data

### 7.3 Verify Results

1. Check if new events were added to Google Sheet
2. Check if `data/sample-events.json` was updated
3. Look for commit: "🤖 Update events data from AI scraper [automated]"

✅ **Success!** Your automation is working!

---

## Step 8: Deploy to Production (5 minutes)

### 8.1 Push All Changes

```bash
git add .
git commit -m "Enable real-time data integration 🚀"
git push
```

### 8.2 Deploy to Cloudflare Pages

#### If not already deployed:

1. Go to https://dash.cloudflare.com/
2. Click **Workers & Pages** → **Create application**
3. Click **Pages** → **Connect to Git**
4. Select: **marc420-design/norwich-event-hub**
5. Configure:
   - **Production branch:** master
   - **Build command:** (leave empty)
   - **Build output directory:** /
6. Click **Save and Deploy**

#### If already deployed:

1. Cloudflare will auto-deploy when you push to master
2. Wait 2-3 minutes for deployment
3. Check deployment logs

### 8.3 Test Production Site

1. Visit your Cloudflare Pages URL
2. Check:
   - [ ] Homepage loads
   - [ ] Events are displaying
   - [ ] "What's On Today" shows events
   - [ ] Directory page works
   - [ ] Filtering works

---

## 🎉 You're Live!

Your Norwich Event Hub now has:

✅ **Real-time data** from Google Sheets
✅ **AI automation** that runs weekly
✅ **Live updates** without redeploying
✅ **Form submissions** that go straight to Google Sheets
✅ **Current events** showing on the site

---

## 🔧 Troubleshooting

### Events Not Showing

**Check 1: Config**
- Open `scripts/config.js`
- Verify `USE_LOCAL_STORAGE: false`
- Verify Web App URL is correct

**Check 2: API Response**
- Visit your Web App URL directly
- Should return JSON with events
- If error, check Apps Script deployment

**Check 3: Browser Console**
- Press F12
- Look for errors
- Should see: "✅ Loaded X events"

**Check 4: Google Sheet**
- Events must have Status = "Approved"
- Dates in format: YYYY-MM-DD
- Times in format: HH:MM

### Workflow Fails

**Check 1: Secrets**
- Verify all 3 secrets are set
- CLAUDE_API_KEY must be valid
- GOOGLE_SHEETS_CREDENTIALS must be valid JSON

**Check 2: Service Account**
- Verify service account has Editor access to sheet
- Check email is shared with the sheet

**Check 3: Logs**
- Go to Actions → Click on failed workflow
- Read error messages
- Fix and re-run

### API Not Working

**Check 1: Deployment**
- Go to Apps Script Editor
- Click Deploy → Manage deployments
- Verify Web app is active
- Try re-deploying

**Check 2: Permissions**
- Execute as: Me
- Who has access: Anyone
- Re-authorize if needed

**Check 3: Test URL**
- Visit Web App URL in browser
- Should see JSON response
- If auth error, re-deploy

---

## 📊 Monitoring Your Site

### Check Event Updates
- Google Sheet shows all events
- Status column shows approval state
- Timestamp shows when added

### Check Automation
- GitHub Actions tab shows workflow runs
- Should run every Monday at 6 AM UTC
- Can manually trigger anytime

### Check API Health
- Visit Web App URL
- Should return events JSON
- Response time should be < 2 seconds

---

## 🚀 Next Steps

1. **Promote Your Site**
   - Share on social media
   - Submit to event directories
   - Partner with local venues

2. **Add More Events**
   - Manually via Google Sheet
   - AI scraper runs weekly
   - Users submit via form

3. **Monitor & Improve**
   - Check analytics
   - Review submitted events
   - Approve quality events

4. **Optional Enhancements**
   - Custom domain
   - Email notifications
   - Admin dashboard
   - Image uploads

---

## 📞 Support

**Documentation:**
- Full Audit: `COMPREHENSIVE_AUDIT_REPORT_2025-12-21.md`
- Deployment: `DEPLOY_TO_CLOUDFLARE.md`
- GitHub Secrets: `GITHUB_SECRETS_SETUP.md`

**Issues:**
- GitHub: https://github.com/marc420-design/norwich-event-hub/issues
- Email: (setup your support email)

---

**Congratulations! Your Norwich Event Hub is now live with real-time AI-powered event data! 🎉**
