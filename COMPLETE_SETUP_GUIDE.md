# Complete Setup Guide - Norwich Event Hub
## Get Your Site 100% Production-Ready

**Current Status:** Site is live, code fixes deployed, events should appear soon
**Time to Complete All Three:** 20-30 minutes

---

# 1. Google Sheets API Setup (Real-Time Updates)

## Why You Need This
- Events automatically sync from Google Sheets to your website
- Easy to manage events through spreadsheet
- Form submissions saved to Google Sheets
- No need to edit JSON files manually

## Step-by-Step Setup

### Part A: Create Google Sheet (5 minutes)

1. **Go to Google Sheets**
   - Visit: https://sheets.google.com
   - Click "Blank" to create new spreadsheet
   - Name it: "Norwich Event Hub - Events Database"

2. **Import Your Events**
   - File → Import → Upload
   - Select: `events-import.csv` (I already created this for you)
   - Import location: "Replace current sheet"
   - Click "Import data"

   **Result:** You should see 82 events with columns: id, name, date, time, location, category, description, ticketLink, image, status

3. **Verify Data**
   - Check that status column = "approved" for all events
   - Sheet name should be "Sheet1" (check tab at bottom)
   - If not, right-click tab → Rename → "Sheet1"

### Part B: Deploy Apps Script (10 minutes)

4. **Open Apps Script Editor**
   - In your Google Sheet: Extensions → Apps Script
   - Delete any existing code in the editor

5. **Copy Apps Script Code**
   - Open: `C:\Users\marc\Desktop\new company\apps-script-deploy\Code.gs`
   - Copy ALL the code (Ctrl+A, Ctrl+C)
   - Paste into Apps Script editor

6. **Deploy as Web App**
   - Click "Deploy" button (top right)
   - Choose "New deployment"
   - Click gear icon ⚙️ → Select "Web app"
   - Settings:
     - Description: "Norwich Event Hub API"
     - Execute as: **Me** (important!)
     - Who has access: **Anyone** (important!)
   - Click "Deploy"

7. **Authorize the Script**
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to Norwich Event Hub API (unsafe)"
   - Click "Allow"

8. **Copy Web App URL**
   - After deployment, you'll see a URL like:
     `https://script.google.com/macros/s/AKfycbxXXXXXXXX/exec`
   - **Copy this URL!**

### Part C: Update Website Config (2 minutes)

9. **Update config.js**
   - Open: `C:\Users\marc\Desktop\new company\scripts\config.js`
   - Line 16: Replace the existing URL with YOUR new URL
   - Line 25: Change `USE_LOCAL_STORAGE: true` to `USE_LOCAL_STORAGE: false`
   - Save the file

10. **Test API Connection**
    - Open in browser: http://localhost:8080/test-api.html
    - Click "Test Google Sheets API"
    - Should show: "✅ API Connection Successful! 📊 Loaded 82 events"

11. **Deploy to Live Site**
    ```bash
    cd "C:\Users\marc\Desktop\new company"
    git add scripts/config.js
    git commit -m "Enable Google Sheets API integration"
    git push origin master
    ```

**✅ DONE!** Your site now loads events from Google Sheets in real-time!

---

# 2. Claude API Key Setup (AI Automation)

## Why You Need This
- Automated event discovery every Monday at 6 AM
- AI scrapes event websites and adds new events
- Keeps your event database fresh automatically
- Cost: ~$5-10 per YEAR

## Step-by-Step Setup

### Part A: Get Claude API Key (3 minutes)

1. **Create Anthropic Account**
   - Visit: https://console.anthropic.com/
   - Click "Sign Up" or "Log In"
   - Verify your email

2. **Add Payment Method**
   - Go to: Settings → Billing
   - Add credit card (required for API access)
   - Set spending limit: $10/month (optional but recommended)

3. **Create API Key**
   - Go to: Settings → API Keys
   - Click "Create Key"
   - Name: "Norwich Event Hub Automation"
   - Click "Create Key"
   - **Copy the key immediately** (starts with `sk-ant-`)
   - **Save it somewhere safe** - you can't see it again!

### Part B: Add to GitHub Secrets (2 minutes)

4. **Open GitHub Repository Secrets**
   - Visit: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
   - Click "New repository secret"

5. **Add CLAUDE_API_KEY**
   - Name: `CLAUDE_API_KEY`
   - Secret: Paste your API key (the one you copied)
   - Click "Add secret"

6. **Verify Secret Added**
   - You should see "CLAUDE_API_KEY" in the list
   - Value will show as "***" (hidden for security)

### Part C: Test Automation (5 minutes)

7. **Manually Trigger GitHub Action**
   - Visit: https://github.com/marc420-design/norwich-event-hub/actions
   - Click "Weekly Event Aggregation" workflow
   - Click "Run workflow" dropdown
   - Click green "Run workflow" button
   - Wait 5-10 minutes for completion

8. **Check Results**
   - Refresh the Actions page
   - Workflow should show green checkmark ✅
   - Click on the workflow run
   - Check "Jobs" → "aggregate-events"
   - Should see: "Successfully updated X events"

9. **Verify Events Updated**
   - Check your Google Sheet
   - Should have new events added
   - Cloudflare will auto-deploy the changes

**✅ DONE!** AI automation is now active! Events update every Monday 6 AM automatically.

---

# 3. Custom Domain SSL Setup

## Why You Need This
- Professional URL: norwicheventshub.com instead of xxx.pages.dev
- Free SSL certificate (HTTPS)
- Better SEO ranking
- Builds trust with users

## Prerequisites
- Domain registered (you have norwicheventshub.com)
- Domain nameservers pointed to Cloudflare

## Step-by-Step Setup

### Part A: Verify Domain (2 minutes)

1. **Check Domain Status**
   - Visit: https://dash.cloudflare.com/
   - You should see "norwicheventshub.com" in your domains list
   - Status should be "Active"
   - If not active, follow Cloudflare's instructions to change nameservers

### Part B: Connect Domain to Pages (5 minutes)

2. **Open Your Pages Project**
   - Go to: Workers & Pages
   - Click your project (norwich-event-hub or similar)
   - Click "Custom domains" tab

3. **Add Custom Domain**
   - Click "Set up a custom domain"
   - Enter: `norwicheventshub.com`
   - Click "Continue"

4. **Add www Subdomain**
   - Cloudflare will ask about www
   - Choose "Add www.norwicheventshub.com"
   - Click "Activate domain"

5. **Wait for DNS Propagation**
   - Cloudflare automatically creates DNS records
   - SSL certificate provisioned automatically
   - Status will show "Active" when ready (usually 2-5 minutes)

### Part C: Update Website Config (2 minutes)

6. **Update SITE_URL in config.js**
   - Open: `C:\Users\marc\Desktop\new company\scripts\config.js`
   - Line 29: Change to:
     ```javascript
     SITE_URL: 'https://norwicheventshub.com',
     ```

7. **Update Meta Tags in HTML Files**
   - Open: index.html, today.html, directory.html, submit.html
   - Find lines with `og:url` and `twitter:url`
   - Change from `.pages.dev` to `norwicheventshub.com`

8. **Commit and Deploy**
   ```bash
   cd "C:\Users\marc\Desktop\new company"
   git add scripts/config.js *.html
   git commit -m "Update to custom domain norwicheventshub.com"
   git push origin master
   ```

### Part D: Test Custom Domain (3 minutes)

9. **Test Both Domains**
   - Visit: https://norwicheventshub.com
   - Visit: https://www.norwicheventshub.com
   - Both should load your site with HTTPS (🔒 padlock)

10. **Verify SSL Certificate**
    - Click the 🔒 padlock in browser
    - Should say "Connection is secure"
    - Certificate issued by Cloudflare

11. **Test Old Domain Redirects**
    - Visit your old .pages.dev URL
    - Should redirect to norwicheventshub.com

**✅ DONE!** Your custom domain is live with free SSL!

---

# Quick Commands Cheat Sheet

## Deploy Changes to Live Site
```bash
cd "C:\Users\marc\Desktop\new company"
git add .
git commit -m "Your commit message"
git push origin master
```

## Test API Connection Locally
```bash
# Open in browser:
http://localhost:8080/test-api.html
```

## Check Cloudflare Deployment Status
```bash
# Visit:
https://dash.cloudflare.com/ → Workers & Pages → Your Project → Deployments
```

## Manually Trigger Event Aggregation
```bash
# Visit:
https://github.com/marc420-design/norwich-event-hub/actions
# Click "Weekly Event Aggregation" → "Run workflow"
```

---

# Troubleshooting

## Google Sheets API Not Working
- Check Web App URL in config.js is correct
- Verify Apps Script deployment: "Execute as: Me" + "Who has access: Anyone"
- Test URL directly in browser - should return JSON
- Check Google Sheet name is "Sheet1"
- Verify events have status="approved"

## Claude API Automation Failed
- Check API key is correct in GitHub Secrets
- Verify you have billing set up on Anthropic account
- Check GitHub Actions logs for error messages
- Ensure you haven't exceeded API rate limits

## Custom Domain Not Working
- Wait 10-15 minutes for DNS propagation
- Check domain nameservers point to Cloudflare
- Verify DNS records created in Cloudflare DNS tab
- Clear browser cache (Ctrl+Shift+R)
- Try incognito/private browsing mode

## Events Not Showing on Live Site
- Check browser console (F12) for errors
- Verify data/sample-events.json exists
- Test API connection with test-api.html
- Check config.js USE_LOCAL_STORAGE setting
- Force refresh (Ctrl+Shift+R)

---

# Success Checklist

After completing all three setups, verify:

- [ ] Google Sheets has 82 events imported
- [ ] Apps Script deployed and URL in config.js
- [ ] USE_LOCAL_STORAGE set to false
- [ ] Test API shows events loading from Google Sheets
- [ ] Claude API key added to GitHub Secrets
- [ ] GitHub Actions workflow runs successfully
- [ ] Custom domain shows as "Active" in Cloudflare
- [ ] norwicheventshub.com loads with HTTPS
- [ ] www.norwicheventshub.com also works
- [ ] Events displaying on live site
- [ ] All pages work (home, today, directory, submit)

---

**Total Time:** ~25 minutes
**Result:** Fully automated, production-ready event hub! 🚀

---

**Need Help?** Check the troubleshooting section or run the test pages.
