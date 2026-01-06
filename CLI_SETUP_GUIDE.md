# 🖥️ CLI Setup Guide - Copy & Paste Commands

**This guide gives you exact commands to copy-paste into your terminal.**

---

## 📋 Prerequisites

You'll need:
- ✅ GitHub CLI installed
- ✅ Google Cloud CLI (gcloud) installed
- ✅ Authenticated to both

---

## 🚀 Part 1: Install Required Tools (if needed)

### Windows (PowerShell)

**Install GitHub CLI:**
```powershell
winget install --id GitHub.cli
```

**Install Google Cloud CLI:**
```powershell
# Download from: https://cloud.google.com/sdk/docs/install
# Or use Chocolatey:
choco install gcloudsdk
```

**Restart your terminal after installation**

---

### Verify Installations

```bash
# Check GitHub CLI
gh --version

# Check Google Cloud CLI
gcloud --version
```

---

## 🔐 Part 2: Authenticate

### GitHub Authentication

```bash
gh auth login
```

**Follow the prompts:**
1. Choose: GitHub.com
2. Choose: HTTPS
3. Choose: Login with a web browser
4. Copy the code shown
5. Press Enter to open browser
6. Paste code and authorize

**Verify:**
```bash
gh auth status
```

---

### Google Cloud Authentication

```bash
gcloud auth login
```

**This will:**
1. Open your browser
2. Ask you to sign in to Google
3. Grant permissions

**Verify:**
```bash
gcloud auth list
```

---

## 🔑 Part 3: Add GitHub Secrets (4 secrets)

### Set Your Repository

```bash
# Set variables (Windows PowerShell)
$REPO = "marc420-design/norwich-event-hub"

# Or for Git Bash / Linux / Mac:
# REPO="marc420-design/norwich-event-hub"
```

---

### Secret 1: GEMINI_API_KEY

```bash
gh secret set GEMINI_API_KEY --repo $REPO --body "AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs"
```

**Expected output:** `✓ Set secret GEMINI_API_KEY for marc420-design/norwich-event-hub`

---

### Secret 2: OPENAI_API_KEY

```bash
gh secret set OPENAI_API_KEY --repo $REPO --body "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"
```

**Expected output:** `✓ Set secret OPENAI_API_KEY for marc420-design/norwich-event-hub`

---

### Secret 3: GOOGLE_SHEET_ID

```bash
gh secret set GOOGLE_SHEET_ID --repo $REPO --body "1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU"
```

**Expected output:** `✓ Set secret GOOGLE_SHEET_ID for marc420-design/norwich-event-hub`

---

### Secret 4: GOOGLE_SERVICE_ACCOUNT_JSON (requires setup first)

**This one is more complex - see Part 4 below**

---

### Verify All Secrets

```bash
gh secret list --repo $REPO
```

**Expected output:**
```
GEMINI_API_KEY        Updated 2024-01-06
GOOGLE_SHEET_ID       Updated 2024-01-06
OPENAI_API_KEY        Updated 2024-01-06
GOOGLE_SERVICE_ACCOUNT_JSON  (we'll add this next)
```

---

## ☁️ Part 4: Create Google Service Account

### Step 1: Set Project ID

```bash
# List your projects
gcloud projects list

# Set your project (replace YOUR_PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID
```

---

### Step 2: Enable Required APIs

```bash
# Enable Google Sheets API
gcloud services enable sheets.googleapis.com

# Enable Generative Language API (Gemini)
gcloud services enable generativelanguage.googleapis.com
```

**Expected output:** `Operation "operations/..." finished successfully.`

---

### Step 3: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create norwich-events-scraper \
  --display-name="Norwich Events Scraper" \
  --description="AI scraper for Norwich Event Hub"
```

**Expected output:** `Created service account [norwich-events-scraper]`

---

### Step 4: Grant Permissions

```bash
# Get your project ID
$PROJECT_ID = gcloud config get-value project

# Grant Editor role (Windows PowerShell)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:norwich-events-scraper@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"
```

---

### Step 5: Create and Download Key

```bash
# Create key and save to file (Windows PowerShell)
gcloud iam service-accounts keys create google-credentials.json `
  --iam-account="norwich-events-scraper@$PROJECT_ID.iam.gserviceaccount.com"

# For Git Bash / Linux / Mac:
# gcloud iam service-accounts keys create google-credentials.json \
#   --iam-account="norwich-events-scraper@$PROJECT_ID.iam.gserviceaccount.com"
```

**Expected output:** `created key [...] of type [json] as [google-credentials.json]`

**This creates a file: `google-credentials.json` in your current directory**

---

### Step 6: Add JSON as GitHub Secret

**Windows PowerShell:**
```powershell
# Read the JSON file and add as secret
$JSON_CONTENT = Get-Content google-credentials.json -Raw
gh secret set GOOGLE_SERVICE_ACCOUNT_JSON --repo $REPO --body $JSON_CONTENT
```

**Git Bash / Linux / Mac:**
```bash
# Read the JSON file and add as secret
gh secret set GOOGLE_SERVICE_ACCOUNT_JSON --repo $REPO < google-credentials.json
```

**Expected output:** `✓ Set secret GOOGLE_SERVICE_ACCOUNT_JSON for marc420-design/norwich-event-hub`

---

### Step 7: Get Service Account Email

```bash
# Windows PowerShell
$SERVICE_ACCOUNT_EMAIL = "norwich-events-scraper@$PROJECT_ID.iam.gserviceaccount.com"
echo $SERVICE_ACCOUNT_EMAIL

# Copy this email - you'll need it for the next step!
```

---

### Step 8: Share Google Sheet with Service Account

**Option A: Using gcloud (if Drive API enabled)**
```bash
# This might not work if Drive API isn't enabled
# If it fails, use Option B below
```

**Option B: Manual (EASIEST)**

1. Copy the service account email from Step 7
2. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
3. Click "Share" button (top right)
4. Paste the service account email
5. Change permission to "Editor"
6. Uncheck "Notify people"
7. Click "Share"

**That's it! Sheet is now accessible to the scraper.**

---

### Step 9: Clean Up Local Credentials File

```bash
# Delete the local credentials file (it's now in GitHub Secrets)
rm google-credentials.json

# Verify it's gone
ls google-credentials.json
# Should show: "cannot find path..."
```

---

## ✅ Part 5: Verify All Secrets

```bash
# List all secrets
gh secret list --repo $REPO
```

**Expected output (should show 4 secrets):**
```
GEMINI_API_KEY              Updated 2024-01-06
GOOGLE_SERVICE_ACCOUNT_JSON Updated 2024-01-06
GOOGLE_SHEET_ID             Updated 2024-01-06
OPENAI_API_KEY              Updated 2024-01-06
```

---

## 🧪 Part 6: Test the Workflow

### Trigger Workflow Manually

```bash
# Trigger the AI Event Scraper workflow
gh workflow run "AI Event Scraper" --repo $REPO
```

**Expected output:** `✓ Created workflow_dispatch event for scrape-events.yml at main`

---

### Watch Workflow Progress

```bash
# Watch workflow runs in real-time
gh run watch --repo $REPO
```

**Or view in browser:**
```bash
gh run list --repo $REPO --limit 1
```

**Or open in browser:**
```bash
# Windows
start https://github.com/marc420-design/norwich-event-hub/actions

# Mac/Linux
open https://github.com/marc420-design/norwich-event-hub/actions
```

---

### Check Workflow Logs

```bash
# Get the latest run ID
gh run list --repo $REPO --limit 1 --json databaseId --jq '.[0].databaseId'

# View logs (replace RUN_ID with the number from above)
gh run view RUN_ID --repo $REPO --log
```

---

## 🎉 Success Indicators

### ✅ Secrets Added Successfully
```bash
gh secret list --repo $REPO
# Shows 4 secrets
```

### ✅ APIs Enabled
```bash
gcloud services list --enabled | grep -E "(sheets|generativelanguage)"
# Shows both APIs enabled
```

### ✅ Workflow Runs Successfully
```bash
gh run list --repo $REPO --limit 1
# Shows green checkmark ✓ or "completed"
```

### ✅ Events in Google Sheet
- Open: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
- Should see new rows with today's date

### ✅ Events on Website
- Open: https://norwicheventshub.com
- Wait 2-3 minutes after scraper completes
- Should see events in "Featured This Week"

---

## 📋 Complete Command Checklist

Copy and run these in order:

```powershell
# 1. Set repo variable
$REPO = "marc420-design/norwich-event-hub"

# 2. Add Gemini key
gh secret set GEMINI_API_KEY --repo $REPO --body "AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs"

# 3. Add OpenAI key
gh secret set OPENAI_API_KEY --repo $REPO --body "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"

# 4. Add Sheet ID
gh secret set GOOGLE_SHEET_ID --repo $REPO --body "1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU"

# 5. Set GCP project (REPLACE with your project ID)
gcloud config set project YOUR_PROJECT_ID

# 6. Enable APIs
gcloud services enable sheets.googleapis.com
gcloud services enable generativelanguage.googleapis.com

# 7. Create service account
gcloud iam service-accounts create norwich-events-scraper --display-name="Norwich Events Scraper"

# 8. Grant permissions
$PROJECT_ID = gcloud config get-value project
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:norwich-events-scraper@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/editor"

# 9. Create key file
gcloud iam service-accounts keys create google-credentials.json --iam-account="norwich-events-scraper@$PROJECT_ID.iam.gserviceaccount.com"

# 10. Add JSON as secret
$JSON_CONTENT = Get-Content google-credentials.json -Raw
gh secret set GOOGLE_SERVICE_ACCOUNT_JSON --repo $REPO --body $JSON_CONTENT

# 11. Get service account email (copy this for sharing Sheet)
$SERVICE_ACCOUNT_EMAIL = "norwich-events-scraper@$PROJECT_ID.iam.gserviceaccount.com"
echo $SERVICE_ACCOUNT_EMAIL

# 12. Manually share Google Sheet with the email above (see Step 8 Part 4)

# 13. Clean up local file
rm google-credentials.json

# 14. Verify secrets
gh secret list --repo $REPO

# 15. Run workflow
gh workflow run "AI Event Scraper" --repo $REPO

# 16. Watch workflow
gh run watch --repo $REPO
```

---

## 🚨 Troubleshooting

### Error: "gh: command not found"
```bash
# Install GitHub CLI (see Part 1)
winget install --id GitHub.cli
# Then restart terminal
```

### Error: "gcloud: command not found"
```bash
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install
# Then restart terminal
```

### Error: "You do not currently have an active account"
```bash
# Authenticate to gcloud
gcloud auth login
```

### Error: "Permission denied" when running workflow
```bash
# Re-authenticate to GitHub
gh auth login
```

### Error: "Project not found"
```bash
# List your projects
gcloud projects list

# Set the correct project
gcloud config set project YOUR_PROJECT_ID
```

### Error: "Service account already exists"
```bash
# That's OK! Just continue to the next step (create key)
```

---

## 📞 Need Help?

If any command fails:
1. Copy the error message
2. Check the troubleshooting section above
3. Make sure you're authenticated: `gh auth status` and `gcloud auth list`
4. Verify you're in the correct GCP project: `gcloud config get-value project`

---

## ⏱️ Estimated Time

- Part 1 (Install): 5 minutes (if not installed)
- Part 2 (Auth): 2 minutes
- Part 3 (GitHub Secrets): 2 minutes
- Part 4 (Service Account): 5 minutes
- Part 5 (Verify): 1 minute
- Part 6 (Test): 5 minutes

**Total: 15-20 minutes** (faster if tools already installed)

---

**Last Updated:** January 6, 2026  
**Platform:** Windows PowerShell (commands included for Mac/Linux too)
