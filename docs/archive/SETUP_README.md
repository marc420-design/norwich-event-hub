# 🚀 Automated Setup Scripts

I've created automated scripts to set up your API keys with minimal effort!

---

## 🎯 Choose Your Method

### Method 1: Double-Click Setup (Easiest) ⭐

**Just double-click this file:**
```
SETUP-QUICK.bat
```

**What it does:**
- ✅ Adds all 3 API keys to GitHub automatically
- ✅ Creates Google Service Account
- ✅ Generates credentials file
- ✅ Adds credentials to GitHub
- ✅ Copies service account email to clipboard
- ✅ Shows you what to do next

**Time:** 5 minutes  
**Requirements:** GitHub CLI and Google Cloud CLI installed

---

### Method 2: PowerShell Script

**Right-click PowerShell and "Run as Administrator", then:**
```powershell
cd "C:\Users\marc\Desktop\new company"
.\setup-secrets.ps1
```

**Same as Method 1, but run from PowerShell directly**

---

### Method 3: Manual CLI Commands

**Follow the guide:**
```
CLI_SETUP_GUIDE.md
```

**Copy-paste commands one by one from the guide**

---

## 📋 Prerequisites

### Check if You Have GitHub CLI

**Open PowerShell and run:**
```powershell
gh --version
```

**If not installed:**
```powershell
winget install --id GitHub.cli
```

Then restart PowerShell.

---

### Check if You Have Google Cloud CLI

**Open PowerShell and run:**
```powershell
gcloud --version
```

**If not installed:**
Download from: https://cloud.google.com/sdk/docs/install

Then restart PowerShell.

---

### Authenticate Both CLIs

**GitHub:**
```powershell
gh auth login
```
Follow the prompts (choose web browser login)

**Google Cloud:**
```powershell
gcloud auth login
```
This opens your browser to sign in

---

## 🎯 Quick Start (Easiest Path)

### Step 1: Install Tools (if needed)
```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate
```powershell
# Authenticate GitHub
gh auth login

# Authenticate Google Cloud
gcloud auth login

# Set your Google Cloud project
gcloud projects list
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Run Setup Script
**Just double-click:**
```
SETUP-QUICK.bat
```

**Or run in PowerShell:**
```powershell
.\setup-secrets.ps1
```

### Step 4: Share Google Sheet
The script will:
1. Copy the service account email to your clipboard
2. Show you the Google Sheet URL

Just:
1. Open the Sheet
2. Click "Share"
3. Paste (Ctrl+V) the email
4. Set permission to "Editor"
5. Click "Share"

### Step 5: Test
```powershell
# Run the workflow
gh workflow run "AI Event Scraper" --repo marc420-design/norwich-event-hub

# Watch it run
gh run watch --repo marc420-design/norwich-event-hub
```

---

## ✅ What Gets Set Up

### GitHub Secrets (4 total):
1. ✅ `GEMINI_API_KEY` - Primary AI (free)
2. ✅ `OPENAI_API_KEY` - Backup AI (minimal cost)
3. ✅ `GOOGLE_SHEET_ID` - Your Sheet
4. ✅ `GOOGLE_SERVICE_ACCOUNT_JSON` - Write access

### Google Cloud:
1. ✅ Google Sheets API enabled
2. ✅ Generative Language API enabled (Gemini)
3. ✅ Service Account created
4. ✅ Permissions granted

---

## 🚨 Troubleshooting

### Script says "GitHub CLI not found"
**Fix:**
```powershell
winget install --id GitHub.cli
```
Then restart PowerShell and run script again

---

### Script says "gcloud not found"
**Fix:**
1. Download from: https://cloud.google.com/sdk/docs/install
2. Install it
3. Restart PowerShell
4. Run script again

---

### Script says "You do not have an active account"
**Fix:**
```powershell
gh auth login
gcloud auth login
```

---

### Script says "No project selected"
**Fix:**
```powershell
# List projects
gcloud projects list

# Set one
gcloud config set project YOUR_PROJECT_ID
```

---

### Script fails with "Permission denied"
**Fix:**
```powershell
# Re-authenticate GitHub
gh auth logout
gh auth login

# Try again
.\setup-secrets.ps1
```

---

## 📊 What Happens After Setup

### Automatic Scraping Schedule:
- 🕛 **12:00 AM UTC** (7pm EST)
- 🕕 **6:00 AM UTC** (1am EST)
- 🕛 **12:00 PM UTC** (7am EST)
- 🕕 **6:00 PM UTC** (1pm EST)

### Each Run:
1. Scrapes 5+ event sources
2. Discovers 30-80 events
3. AI processes each event (Gemini first, OpenAI backup)
4. Quality-scores events (min 50/100)
5. Deduplicates
6. Uploads to Google Sheet
7. Website updates automatically (2-3 min)

### Cost:
- Gemini: $0/month (free tier)
- OpenAI: ~$0-1/month (only used as backup)
- **Total: ~$0-1/month**

---

## 🎉 Success Indicators

### ✅ All Secrets Added
```powershell
gh secret list --repo marc420-design/norwich-event-hub
```
Should show 4 secrets

### ✅ Workflow Runs
```powershell
gh workflow run "AI Event Scraper" --repo marc420-design/norwich-event-hub
gh run watch --repo marc420-design/norwich-event-hub
```
Should see green checkmark ✅

### ✅ Events in Sheet
Open: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit

Should see new rows with today's date

### ✅ Events on Website
Open: https://norwicheventshub.com

Wait 2-3 minutes after scraper completes  
Should see events in "Featured This Week"

---

## 📞 Still Need Help?

### Check Script Output
The script will tell you exactly what went wrong and how to fix it.

### Manual Setup
If scripts don't work, use: **[ADD_ALL_API_KEYS.md](ADD_ALL_API_KEYS.md)**

### CLI Guide
For step-by-step CLI commands: **[CLI_SETUP_GUIDE.md](CLI_SETUP_GUIDE.md)**

---

## 📁 Files Reference

| File | What It Does |
|------|--------------|
| `SETUP-QUICK.bat` | ⭐ Double-click to run setup |
| `setup-secrets.ps1` | PowerShell script (called by .bat) |
| `CLI_SETUP_GUIDE.md` | Manual CLI commands |
| `ADD_ALL_API_KEYS.md` | Web-based setup guide |
| `YOUR_API_KEYS_SUMMARY.md` | Quick reference of your keys |

---

**Recommended:** Start with `SETUP-QUICK.bat` (just double-click it!)

**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy (mostly automated)  
**Result:** Fully working AI event scraper! 🎉

