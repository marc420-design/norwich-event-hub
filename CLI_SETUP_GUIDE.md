# CLI Setup Guide - Google Service Account

## 🚀 Automated Setup (One Command!)

I created scripts that do everything automatically via CLI.

---

## Option 1: Windows (PowerShell)

### Step 1: Install Google Cloud CLI

**Quick Install:**
```powershell
winget install Google.CloudSDK
```

**Or download:**
https://cloud.google.com/sdk/docs/install

### Step 2: Run the Setup Script

```powershell
cd "C:\Users\marc\Desktop\new company"
.\setup-google-service-account.ps1
```

**That's it!** The script will:
- ✅ Login to Google Cloud
- ✅ Create/select project
- ✅ Enable Google Sheets & Drive APIs
- ✅ Create service account
- ✅ Generate JSON credentials
- ✅ Share your Google Sheet automatically
- ✅ Display the credentials to copy

---

## Option 2: macOS/Linux (Bash)

### Step 1: Install Google Cloud CLI

**macOS:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Step 2: Run the Setup Script

```bash
cd ~/Desktop/new\ company/
chmod +x setup-google-service-account.sh
./setup-google-service-account.sh
```

---

## What the Script Does

1. **Logs you in** to Google Cloud
2. **Creates a project** (or uses existing)
3. **Enables APIs**:
   - Google Sheets API
   - Google Drive API
4. **Creates service account**: `norwich-events-bot`
5. **Generates JSON key**: Saved to `google-service-account.json`
6. **Shares your Google Sheet** with the service account automatically
7. **Displays credentials** ready to paste into GitHub Secrets

---

## After the Script Runs

You'll see output like this:

```
✅ Setup Complete!
================================================

📋 Next Steps:

1. Add to GitHub Secrets:
   URL: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions

   Secret: GOOGLE_SHEETS_CREDENTIALS
   Value:

{
  "type": "service_account",
  "project_id": "norwich-event-hub-1234",
  "private_key_id": "...",
  "private_key": "...",
  ...
}
```

### Copy the JSON and add it to GitHub Secrets

1. Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click **New repository secret**
3. Name: `GOOGLE_SHEETS_CREDENTIALS`
4. Value: Paste the entire JSON
5. Click **Add secret**

---

## Manual Commands (If You Prefer)

If you want to run commands individually:

```bash
# 1. Login
gcloud auth login

# 2. Set project
gcloud config set project YOUR_PROJECT_ID

# 3. Enable APIs
gcloud services enable sheets.googleapis.com
gcloud services enable drive.googleapis.com

# 4. Create service account
gcloud iam service-accounts create norwich-events-bot \
  --display-name="Norwich Event Hub Bot"

# 5. Create key
gcloud iam service-accounts keys create google-service-account.json \
  --iam-account=norwich-events-bot@YOUR_PROJECT_ID.iam.gserviceaccount.com

# 6. Share sheet (requires Python script - use the automated script instead)
```

---

## Troubleshooting

### "gcloud: command not found"
→ Install Google Cloud CLI first (see Step 1 above)

### "API enablement failed - billing required"
→ You need to enable billing for your Google Cloud project
→ Go to: https://console.cloud.google.com/billing
→ Add a billing account (Google Sheets API is FREE, but billing must be enabled)

### "Permission denied when sharing sheet"
→ Make sure you're logged in with the Google account that owns the spreadsheet
→ Run: `gcloud auth login` and select the correct account

### Script fails on Windows
→ Make sure you're running PowerShell (not Command Prompt)
→ You may need to enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Security Notes

- 🔒 The `google-service-account.json` file contains sensitive credentials
- ❌ **NEVER** commit it to git (already in .gitignore)
- ✅ Only use it in GitHub Secrets
- ✅ Keep the downloaded file secure

---

## What's Next?

After running the script and adding `GOOGLE_SHEETS_CREDENTIALS` to GitHub Secrets, also add:

1. **GEMINI_API_KEY** - Get from: https://aistudio.google.com/app/apikey
2. **GOOGLE_SHEET_ID** - Use: `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`

Then test the workflow:
https://github.com/marc420-design/norwich-event-hub/actions

---

## Time Estimate

- ⏱️ **Total time**: 3-5 minutes
- ⏱️ **Actual work**: 1 minute (the script does the rest!)

**Much faster than the manual web console method!** 🚀
