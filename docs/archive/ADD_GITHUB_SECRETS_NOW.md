# 🚀 Add GitHub Secrets - Complete Guide

**Time required:** 10-15 minutes  
**What you'll do:** Add 3 secrets to GitHub to activate the AI event scraper

---

## ⚠️ Security: Never Paste Real Keys Into Docs

**Do not** put your real `GOOGLE_SERVICE_ACCOUNT_JSON` (especially the `private_key`) into this file or any file in the repo. Store it only in GitHub Secrets.

**If a key was ever in a doc or committed to git:** treat it as compromised. In [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) → your service account → **Keys** → delete the old key, create a new JSON key, and set the `GOOGLE_SERVICE_ACCOUNT_JSON` secret in GitHub to the new JSON.

---

## Step 1: Open GitHub Secrets Page

**Click this link:** https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions

(You may need to log in to GitHub first)

---

## Step 2: Add Secret #1 - GEMINI_API_KEY

### Get Your API Key First:
1. Open: https://aistudio.google.com/app/apikey (or https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (it starts with `AIza...`)

### Add to GitHub:
1. On the GitHub secrets page, click **"New repository secret"**
2. **Name:** `GEMINI_API_KEY`
3. **Value:** Paste your API key from above
4. Click **"Add secret"**

✅ Secret 1 of 3 added!

---

## Step 3: Add Secret #2 - GOOGLE_SHEET_ID

1. Click **"New repository secret"**
2. **Name:** `GOOGLE_SHEET_ID`
3. **Value:** Copy and paste this exactly:

```
1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
```

4. Click **"Add secret"**

✅ Secret 2 of 3 added!

---

## Step 4: Add Secret #3 - GOOGLE_SERVICE_ACCOUNT_JSON

**Where to get the JSON (never paste from this guide):**

- **Option A:** If you have a `google-service-account.json` (or similar) that you downloaded from Google Cloud when creating a service account key, open it in a text editor and copy the **entire** contents.
- **Option B:** In [Google Cloud Console](https://console.cloud.google.com/) → **IAM & Admin** → **Service Accounts** → select your service account (e.g. `norwich-events-bot`) → **Keys** → **Add Key** → **Create new key** → **JSON**. Use the downloaded file’s full contents.

**Add to GitHub:**
1. Click **"New repository secret"**
2. **Name:** `GOOGLE_SERVICE_ACCOUNT_JSON`
3. **Value:** Paste the **entire** JSON (from `{` to `}`, including braces). It must include `type`, `project_id`, `private_key_id`, `private_key`, `client_email`, and the usual `*_uri` fields.
4. Click **"Add secret"**

**Example structure only (do not use this as the value):**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/...",
  "universe_domain": "googleapis.com"
}
```

✅ Secret 3 of 3 added!

---

## Step 5: Verify All Secrets Are Added

You should now see all 3 secrets on the page:
- ✅ GEMINI_API_KEY
- ✅ GOOGLE_SHEET_ID
- ✅ GOOGLE_SERVICE_ACCOUNT_JSON

Each should show "Updated X seconds/minutes ago"

---

## Step 6: Test the AI Scraper

Now that all secrets are added, let's test it:

1. Go to: https://github.com/marc420-design/norwich-event-hub/actions
2. Click on **"Scrape Real-Time Events"** in the left sidebar
3. Click the **"Run workflow"** button (top right, next to the search box)
4. Click the green **"Run workflow"** button in the dropdown
5. Wait 2-3 minutes for it to complete
6. Click on the workflow run to see the logs
7. Check your Google Sheet for new events!

**Your Google Sheet:** https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit

---

## 🎉 Success!

If everything worked:
- ✅ The workflow shows a green checkmark
- ✅ New events appear in your Google Sheet
- ✅ Events are marked as "approved" or "pending" based on quality score
- ✅ The scraper will now run automatically every day at 6:00 AM UTC

---

## 🆘 Troubleshooting

### Workflow fails with "API key not found"
- Double-check that `GEMINI_API_KEY` is added correctly
- Make sure there are no extra spaces before or after the key

### Workflow fails with "Permission denied"
- Verify the entire JSON was copied (starts with `{` and ends with `}`)
- Check that the service account has edit access to your Google Sheet

### No events appear in Google Sheet
- Check the workflow logs for specific errors
- Some event sources may be temporarily down (this is normal)
- The scraper filters out low-quality events (score < 50)
- Try running the workflow again

### Workflow runs but shows errors
- Click on the failed workflow run
- Expand the "Run AI event aggregator" step
- Look for specific error messages
- Common issues:
  - API rate limits (wait a few minutes and try again)
  - Invalid credentials (re-add the JSON secret)
  - Network timeouts (try again later)

---

## 📞 Need Help?

If you're still having issues:
1. Check the workflow logs for detailed error messages
2. Verify all 3 secrets are present and correct
3. Make sure your Google Sheet is **shared (Editor)** with the **client_email** from your service account JSON (e.g. `your-bot@your-project.iam.gserviceaccount.com`)

---

## ⏰ Automated Schedule

Once working, the scraper will run automatically:
- **Daily at 6:00 AM UTC** (6:00 AM UK time in winter, 7:00 AM in summer)
- **Manual trigger** available anytime from the Actions tab

**Estimated events per day:** 10-50 events (varies by source availability)

---

**That's it! You're all set! 🎉**
