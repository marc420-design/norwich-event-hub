# GitHub Secrets - Complete Setup Guide
**Configure secrets for weekly AI event automation**

---

## 🎯 What Are GitHub Secrets?

GitHub Secrets are encrypted environment variables that you can use in GitHub Actions workflows. They keep sensitive data (like API keys) secure while allowing your automation to work.

---

## 📋 Required Secrets for Norwich Event Hub

You need to configure **3 required secrets** and **2 optional secrets**:

### ✅ Required Secrets

1. **CLAUDE_API_KEY** - Anthropic API key for AI event processing
2. **GOOGLE_SHEET_ID** - Your Google Sheets spreadsheet ID
3. **GOOGLE_SHEETS_CREDENTIALS** - Google service account JSON file

### ⭐ Optional Secrets

4. **EVENTBRITE_API_KEY** - For scraping Eventbrite events
5. **FACEBOOK_ACCESS_TOKEN** - For Facebook events (deprecated API)

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Claude API Key (2 minutes)

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Name it: "Norwich Event Hub"
6. **Copy the key** - it starts with `sk-ant-`
7. **Save it somewhere safe** - you won't see it again!

**Cost:** Pay-as-you-go, ~$0.50-2.00 per week for event scraping

---

### Step 2: Set Up Google Cloud Service Account (10 minutes)

#### 2.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Project name: **"Norwich Event Hub"**
4. Click **"Create"**
5. Wait for project creation (30 seconds)

#### 2.2 Enable Required APIs

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it → Click **"Enable"**
4. Go back to Library
5. Search for **"Google Drive API"**
6. Click on it → Click **"Enable"**

#### 2.3 Create Service Account

1. Go to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"Create Service Account"**
3. Service account details:
   - **Name:** Norwich Event Hub Bot
   - **ID:** norwich-event-hub-bot (auto-generated)
   - **Description:** Automated event scraper
4. Click **"Create and Continue"**
5. Grant role: **"Editor"**
6. Click **"Continue"** → Click **"Done"**

#### 2.4 Create Service Account Key

1. Click on your newly created service account
2. Go to the **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose format: **JSON**
5. Click **"Create"**
6. **A JSON file will download** - save it safely!

**File will look like:**
```json
{
  "type": "service_account",
  "project_id": "norwich-event-hub-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "norwich-event-hub-bot@norwich-event-hub-123456.iam.gserviceaccount.com",
  "client_id": "123456789...",
  ...
}
```

---

### Step 3: Share Google Sheet with Service Account (1 minute)

**CRITICAL STEP:** Your service account needs access to your Google Sheet!

1. Open the JSON file you just downloaded
2. Find the `client_email` field
3. Copy the email (e.g., `norwich-event-hub-bot@...iam.gserviceaccount.com`)
4. Go to your Norwich Event Hub Google Sheet
5. Click **"Share"** button (top right)
6. Paste the service account email
7. Give it **"Editor"** permissions
8. **Uncheck** "Notify people"
9. Click **"Share"**

✅ Now your automation can write to the sheet!

---

### Step 4: Add Secrets to GitHub (5 minutes)

1. Go to your repository: https://github.com/marc420-design/norwich-event-hub
2. Click **"Settings"** tab
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**

#### Add Secret 1: CLAUDE_API_KEY

- **Name:** `CLAUDE_API_KEY`
- **Value:** Your Anthropic API key from Step 1 (starts with `sk-ant-`)
- Click **"Add secret"**

#### Add Secret 2: GOOGLE_SHEET_ID

- **Name:** `GOOGLE_SHEET_ID`
- **Value:** Your Sheet ID from the URL
  ```
  URL: https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit
  Sheet ID: 1ABC123xyz456
  ```
- Click **"Add secret"**

#### Add Secret 3: GOOGLE_SHEETS_CREDENTIALS

- **Name:** `GOOGLE_SHEETS_CREDENTIALS`
- **Value:** **Entire contents** of the service account JSON file
- Open the JSON file in a text editor
- Copy **EVERYTHING** (all lines, including the `{` and `}`)
- Paste into the secret value field
- Click **"Add secret"**

**Example (don't use this - use your actual file):**
```json
{
  "type": "service_account",
  "project_id": "norwich-event-hub-123456",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...",
  "client_email": "norwich-event-hub-bot@norwich-event-hub-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

### Step 5: Optional Secrets (Can Skip for Now)

#### EVENTBRITE_API_KEY (Optional)

1. Go to: https://www.eventbrite.com/platform/api
2. Create account → Create app
3. Get your API key
4. Add as secret: `EVENTBRITE_API_KEY`

#### FACEBOOK_ACCESS_TOKEN (Optional - Not Recommended)

Facebook has deprecated public event APIs. Skip this unless you have specific access.

---

## ✅ Verify Your Secrets

After adding all secrets, you should see:

```
CLAUDE_API_KEY           *** (hidden)
GOOGLE_SHEET_ID          *** (hidden)
GOOGLE_SHEETS_CREDENTIALS *** (hidden)
```

You can't view the secret values after creating them, but you can:
- Update them
- Delete them
- See when they were last updated

---

## 🧪 Test Your Setup

### Manual Workflow Trigger

1. Go to: https://github.com/marc420-design/norwich-event-hub/actions
2. Click **"Weekly Event Aggregation"** workflow
3. Click **"Run workflow"** button (right side)
4. Select branch: **master**
5. Click green **"Run workflow"** button

### Monitor Execution

1. Click on the running workflow
2. Click on the job: **"aggregate-events"**
3. Watch the steps execute:
   - ✅ Checkout repository
   - ✅ Set up Python
   - ✅ Install dependencies
   - ✅ Create Google credentials file
   - ✅ Run AI Event Aggregator
   - ✅ Sync data to website
   - ✅ Commit and push updated data

### Expected Output

If successful, you'll see:
```
🚀 Starting AI Event Aggregator
📡 Scraping event sources...
  Scraping Eventbrite...
  Scraping Skiddle...
  Scraping Norwich Council...
  ✅ Found X raw events
🤖 Processing events with AI...
  Processing event 1/X...
✔️ Validating events...
🔍 Removing duplicates...
⭐ Scoring event quality...
📤 Uploading to Google Sheets...
  ✅ Uploaded Y approved and Z pending events
✅ Event aggregation complete!
```

### Check Results

1. **Google Sheet:** New events should appear
2. **Repository:** New commit: "🤖 Update events data from AI scraper [automated]"
3. **Website:** Events should update when deployed

---

## 🚨 Troubleshooting

### Error: "CLAUDE_API_KEY is not defined"

**Solution:**
- Check secret name is exactly `CLAUDE_API_KEY` (case-sensitive)
- Verify you added it to Repository secrets (not Environment secrets)
- Make sure the key starts with `sk-ant-`

### Error: "Failed to authorize Google Sheets"

**Solution:**
- Verify you enabled Google Sheets API and Google Drive API
- Check that service account JSON is valid
- Make sure entire JSON file was copied (including `{` and `}`)
- Verify you shared the sheet with the service account email

### Error: "Permission denied" on Google Sheet

**Solution:**
- Open your Google Sheet
- Click Share
- Verify the service account email is listed
- Make sure it has "Editor" permissions (not just "Viewer")

### Error: "Invalid JSON" in credentials

**Solution:**
- Re-copy the entire JSON file
- Make sure no extra characters or line breaks
- Use a text editor (not Word) to copy
- The JSON should be one continuous block

### Workflow doesn't run

**Solution:**
- Check that workflow file exists: `.github/workflows/scrape-events.yml`
- Verify you're on the master branch
- Check Actions are enabled: Settings → Actions → Allow all actions

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep your service account JSON file secure (don't commit to git)
- Use different service accounts for different projects
- Rotate API keys every 6-12 months
- Give service accounts minimum required permissions
- Review GitHub Actions logs for sensitive data before sharing

### ❌ DON'T:
- Commit API keys or service account JSON to git
- Share screenshots with visible secrets
- Give service accounts more permissions than needed
- Use personal Google account credentials
- Hard-code secrets in your code

---

## 📊 Monitor Usage

### Claude API Usage

1. Go to: https://console.anthropic.com/settings/usage
2. View:
   - Total API calls
   - Tokens used
   - Cost this month
3. Set budget alerts if needed

**Expected Usage:**
- ~10-50 events per week
- ~1,000-5,000 tokens per run
- ~$0.50-2.00 per week

### Google Cloud Usage

1. Go to: https://console.cloud.google.com/billing
2. View:
   - API calls
   - Storage used
3. Set budget alerts

**Expected Usage:**
- Google Sheets API: ~100-500 calls/week
- Google Drive API: ~10-50 calls/week
- **Cost:** Free (well within free tier limits)

---

## 🔄 Weekly Automation Schedule

Your workflow runs:
- **Automatically:** Every Monday at 6:00 AM UTC (6:00 AM GMT / 7:00 AM BST)
- **Manually:** Anytime you trigger it via GitHub Actions

**What it does:**
1. Scrapes events from multiple sources
2. Processes with Claude AI
3. Adds to Google Sheet with status "Approved" or "AI_Pending_Review"
4. Updates `data/sample-events.json`
5. Commits and pushes to GitHub
6. Cloudflare auto-deploys the update

---

## 🎯 Success Checklist

After setup, verify:

- [ ] All 3 required secrets are added to GitHub
- [ ] Google Sheets API is enabled
- [ ] Google Drive API is enabled
- [ ] Service account has Editor access to Google Sheet
- [ ] Manual workflow trigger succeeds
- [ ] Events appear in Google Sheet
- [ ] Data file is updated in repository
- [ ] Website shows updated events

---

## 📞 Getting Help

**Common Issues:**
- Check secret names are EXACTLY correct (case-sensitive)
- Verify JSON file is complete and valid
- Make sure service account has sheet access
- Review workflow logs for specific errors

**Resources:**
- GitHub Actions Docs: https://docs.github.com/en/actions
- Google Cloud Docs: https://cloud.google.com/docs
- Anthropic API Docs: https://docs.anthropic.com/

---

## 🎉 You're All Set!

Once configured, your Norwich Event Hub will:
- ✅ Automatically discover new events every week
- ✅ Process them with AI for quality
- ✅ Add them to your Google Sheet
- ✅ Update your website
- ✅ All without manual intervention!

**Next Steps:**
1. Review submitted events in Google Sheet weekly
2. Approve pending events
3. Monitor for duplicate or low-quality events
4. Adjust automation settings if needed

---

**Last Updated:** December 21, 2025
