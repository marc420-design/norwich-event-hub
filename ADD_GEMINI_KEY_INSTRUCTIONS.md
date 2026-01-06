# 🔑 Add Gemini API Key to GitHub - Step-by-Step

**Your Gemini API Key:** `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`

---

## Step 1: Go to GitHub Secrets

1. Open your browser and go to:
   ```
   https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
   ```

2. If prompted, sign in to GitHub

---

## Step 2: Add GEMINI_API_KEY

1. Click the **"New repository secret"** button (green button, top right)

2. In the **Name** field, enter exactly:
   ```
   GEMINI_API_KEY
   ```
   ⚠️ **IMPORTANT:** Must be exactly `GEMINI_API_KEY` (all caps, underscores, no spaces)

3. In the **Secret** field, paste:
   ```
   AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs
   ```

4. Click **"Add secret"** button

5. ✅ You should see "GEMINI_API_KEY" in your list of secrets

---

## Step 3: Add GOOGLE_SHEET_ID (Already Known)

1. Click **"New repository secret"** again

2. In the **Name** field, enter:
   ```
   GOOGLE_SHEET_ID
   ```

3. In the **Secret** field, paste:
   ```
   1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
   ```

4. Click **"Add secret"**

5. ✅ You should now have 2 secrets

---

## Step 4: Add GOOGLE_SERVICE_ACCOUNT_JSON

**This is the Google credentials JSON file that allows the scraper to write to your Sheet.**

### Option A: If you have the credentials file

1. Open the file: `automation/google-credentials.json` (if it exists in your project)

2. Copy the **entire contents** (it should start with `{` and end with `}`)

3. Click **"New repository secret"**

4. Name: `GOOGLE_SERVICE_ACCOUNT_JSON`

5. Paste the entire JSON into the **Secret** field

6. Click **"Add secret"**

### Option B: If you DON'T have the credentials file yet

You need to create a Google Service Account:

1. Go to: https://console.cloud.google.com/

2. Select your project (or create one)

3. Go to: **APIs & Services** → **Credentials**

4. Click **"Create Credentials"** → **"Service Account"**

5. Give it a name: `Norwich Events Scraper`

6. Click **"Create and Continue"**

7. Grant role: **Editor** (or at minimum, Google Sheets API access)

8. Click **"Continue"** → **"Done"**

9. Click on the service account you just created

10. Go to **"Keys"** tab

11. Click **"Add Key"** → **"Create new key"**

12. Choose **JSON** format

13. Click **"Create"** (a JSON file will download)

14. Open the downloaded JSON file

15. Copy the **entire contents**

16. Go back to GitHub Secrets and add it as `GOOGLE_SERVICE_ACCOUNT_JSON`

---

## Step 5: Enable Google Sheets API

1. Go to: https://console.cloud.google.com/apis/library

2. Search for: **Google Sheets API**

3. Click on it

4. Click **"Enable"**

5. Search for: **Google Gemini API** (or **Generative Language API**)

6. Click **"Enable"**

---

## Step 6: Share Google Sheet with Service Account

1. Open your downloaded JSON file from Step 4

2. Find the line that says `"client_email"`, it will look like:
   ```json
   "client_email": "norwich-events-scraper@your-project.iam.gserviceaccount.com"
   ```

3. Copy that email address

4. Open your Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
   ```

5. Click the **"Share"** button (top right)

6. Paste the service account email

7. Give it **"Editor"** permissions

8. Uncheck "Notify people" (it's a bot, not a person)

9. Click **"Share"**

---

## Step 7: Test the AI Scraper

1. Go to your GitHub repository

2. Click the **"Actions"** tab (top menu)

3. In the left sidebar, click **"AI Event Scraper"**

4. Click **"Run workflow"** button (right side)

5. Select branch: **main**

6. Click **"Run workflow"** (green button)

7. Wait 2-5 minutes

8. Look for a **green checkmark** ✅ (success) or **red X** ❌ (error)

9. Click on the workflow run to see logs

10. If successful, check your Google Sheet for new events!

---

## ✅ Verification Checklist

After completing all steps, you should have:

- [ ] 3 GitHub Secrets added:
  - [ ] `GEMINI_API_KEY`
  - [ ] `GOOGLE_SHEET_ID`
  - [ ] `GOOGLE_SERVICE_ACCOUNT_JSON`

- [ ] Google Sheets API enabled in Google Cloud Console

- [ ] Google Generative Language API (Gemini) enabled

- [ ] Google Sheet shared with service account email (Editor access)

- [ ] Workflow test run completed successfully (green checkmark)

- [ ] New events appear in Google Sheet after test run

- [ ] Website shows new events (wait 2-3 minutes after scraper runs)

---

## 🚨 Troubleshooting

### Error: "Invalid API key"
- Check that `GEMINI_API_KEY` is exactly: `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`
- Make sure there are no extra spaces or quotes

### Error: "Permission denied" on Google Sheet
- Verify you shared the Sheet with the service account email
- Check that the service account has "Editor" permissions

### Error: "API not enabled"
- Make sure both Google Sheets API and Gemini API are enabled in Google Cloud Console

### Workflow doesn't run
- Check that all 3 secrets are added
- Make sure secret names are exact (case-sensitive)
- Try running manually via "Run workflow" button

### No events found
- Check the workflow logs for errors
- Verify the scraper is finding events (check log output)
- If quality scores are too low, events might be rejected (min score: 50)

---

## 📊 What Happens Next

Once configured:
1. ✅ Scraper runs automatically 4 times per day (00:00, 06:00, 12:00, 18:00 UTC)
2. ✅ Discovers 30-80 events per run from multiple sources
3. ✅ AI categorizes and quality-scores each event
4. ✅ Events with score ≥50 are added to Google Sheet
5. ✅ Website auto-updates within 2-3 minutes
6. ✅ Zero manual work required! 🎉

**Cost:** $0/month (Gemini free tier: 60 requests/minute, plenty for scraping)

---

## 🎯 Quick Summary

**What you need to do:**
1. Add 3 secrets to GitHub (Steps 2-4)
2. Enable 2 APIs in Google Cloud (Step 5)
3. Share Sheet with service account (Step 6)
4. Test the workflow (Step 7)

**Time required:** 10-15 minutes

**Result:** Fully automated event discovery! 🚀

---

**Need help?** Check the workflow logs in GitHub Actions for specific error messages.

**Last Updated:** January 6, 2026  
**Your Gemini Key:** `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs` ✅

