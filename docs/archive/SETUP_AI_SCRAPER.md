# 🤖 AI Event Scraper - Complete Setup Guide

**Goal:** Automatically scrape Norwich events 4 times daily and update your website with zero manual work.

**Time Required:** 30-45 minutes (one-time setup)  
**Cost:** FREE (Gemini API has generous free tier)

---

## 📋 Overview

This setup will:
1. ✅ Scrape events from Eventbrite, Skiddle, Norwich Council, and more
2. ✅ Use AI (Google Gemini) to extract and categorize events
3. ✅ Validate events are in Norwich with quality scoring
4. ✅ Upload to your Google Sheet automatically
5. ✅ Run 4 times per day via GitHub Actions (00:00, 06:00, 12:00, 18:00 UTC)
6. ✅ Your website displays updated events automatically

---

## 🚀 Setup Steps

### Step 1: Get Google Gemini API Key (5 minutes, FREE)

1. **Go to:** https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key"
4. **Copy** the key (starts with `AIza...`)
5. **Save it** securely - you'll need it for GitHub Secrets

**Cost:** FREE
- 60 requests per minute
- 1,500 requests per day
- More than enough for event scraping

---

### Step 2: Get Google Service Account (10 minutes)

You already have this set up! Use your existing service account:

1. **File location:** `automation/google-service-account.json`
2. **Already configured** for your Google Sheet
3. **Sheet ID:** `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`

If you need to regenerate it:
- Go to: https://console.cloud.google.com/
- Navigate to: IAM & Admin → Service Accounts
- Download JSON credentials

---

### Step 3: Configure GitHub Secrets (10 minutes)

GitHub Secrets keep your API keys secure and encrypted.

1. **Go to your repo:** https://github.com/marc420-design/norwich-event-hub

2. **Navigate to:** Settings → Secrets and variables → Actions

3. **Add these secrets** (click "New repository secret" for each):

#### Secret 1: `GEMINI_API_KEY`
- **Value:** Your Gemini API key from Step 1
- **Example:** `AIzaSyAbc123...`

#### Secret 2: `GOOGLE_SHEET_ID`
- **Value:** `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`
- (Your existing sheet ID)

#### Secret 3: `GOOGLE_SERVICE_ACCOUNT_JSON`
- **Value:** Contents of `automation/google-service-account.json`
- Open the file, copy ALL the JSON (including `{ }` brackets)
- Paste the entire JSON as the secret value

**Important:** Each secret should be added separately with exact name matching above.

---

### Step 4: Enable GitHub Actions (2 minutes)

1. **Go to:** Your repo → Actions tab
2. **If prompted:** Click "I understand my workflows, go ahead and enable them"
3. **Verify:** You should see "AI Event Scraper" workflow listed

That's it! The workflow will now run automatically every 6 hours.

---

### Step 5: Test It Manually (5 minutes)

Before waiting for the scheduled run, test it manually:

1. **Go to:** Actions tab
2. **Click:** "AI Event Scraper" workflow (left sidebar)
3. **Click:** "Run workflow" button (right side)
4. **Select:** Branch `main`
5. **Click:** "Run workflow" (green button)

**Watch the progress:**
- Takes 2-5 minutes typically
- You'll see each step execute in real-time
- Green checkmarks = success ✅
- Red X = error (check logs)

**Expected output:**
```
✅ Scraping Eventbrite...
✅ Scraping Skiddle...
✅ Found 87 raw events
🤖 Processing events with AI...
✅ 45 unique events after deduplication
📤 Uploading to Google Sheets...
✅ Event scraping complete!
```

---

### Step 6: Verify Events on Website (2 minutes)

After the workflow completes:

1. **Wait 2-3 minutes** for Cloudflare Pages to deploy
2. **Visit:** https://norwicheventshub.com
3. **Check:** Homepage should show newly scraped events
4. **Verify:** Events are current and relevant to Norwich

**If events don't appear:**
- Check your Google Sheet - do you see new rows?
- Verify `config.js` has `USE_LOCAL_STORAGE: false`
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors

---

## 📅 Schedule Details

### Default Schedule:
The scraper runs **4 times per day** at:
- **00:00 UTC** (midnight UK time)
- **06:00 UTC** (6am UK time)
- **12:00 UTC** (noon UK time)
- **18:00 UTC** (6pm UK time)

### To Change Schedule:
Edit `.github/workflows/scrape-events.yml`:

```yaml
schedule:
  # Every 6 hours (current):
  - cron: '0 0,6,12,18 * * *'
  
  # Every 12 hours (alternative):
  # - cron: '0 0,12 * * *'
  
  # Once daily at 9am UTC:
  # - cron: '0 9 * * *'
  
  # Every hour (if you want frequent updates):
  # - cron: '0 * * * *'
```

**Cron Format:** `minute hour day month day-of-week`
**Tool to help:** https://crontab.guru/

---

## 🔧 Configuration Options

### Quality Thresholds

Edit in `.github/workflows/scrape-events.yml` under `env:` section:

```yaml
env:
  SCRAPE_DAYS_AHEAD: 90          # Scrape events up to 90 days ahead
  MIN_QUALITY_SCORE: 50          # Minimum score to keep (0-100)
  AUTO_APPROVE_THRESHOLD: 80     # Auto-approve high-quality events
  NORWICH_RADIUS_KM: 15          # Only events within 15km of Norwich
```

**Quality Score Factors:**
- Has complete information (name, date, location, description)
- Location verified as Norwich/nearby
- Date is valid and in the future
- Category correctly identified
- Contact/ticket information available

**Recommendations:**
- `MIN_QUALITY_SCORE: 50` - Balanced (default)
- `MIN_QUALITY_SCORE: 70` - Stricter (fewer but better events)
- `MIN_QUALITY_SCORE: 30` - Looser (more events, may need review)

---

## 🧪 Local Testing (Optional)

To test the scraper on your local machine:

### 1. Install Python 3.11+
```bash
python --version
# Should show 3.11 or higher
```

### 2. Install Dependencies
```bash
cd automation
pip install -r requirements.txt
```

### 3. Create .env File
```bash
cp .env.example .env
# Edit .env with your actual keys
```

### 4. Run Scraper
```bash
python ai-event-aggregator.py
```

**Expected output:**
```
🚀 Starting AI Event Aggregator
📡 Scraping event sources...
  Scraping Eventbrite...
    ✅ Found 23 events from Eventbrite
  Scraping Skiddle...
    ✅ Found 19 events from Skiddle
  ...
✅ Event aggregation complete!
```

---

## 📊 Monitoring & Logs

### Check GitHub Actions Logs:

1. **Go to:** Actions tab
2. **Click:** Any workflow run
3. **View:** Detailed logs for each step
4. **Download:** Logs button (top right) for offline analysis

### Check Google Sheet:

Your Google Sheet will have new rows added:
- **Columns:** Event name, date, time, location, category, status, etc.
- **Status values:** `pending`, `approved`, `rejected`
- **Quality score:** 0-100 rating

### Monitor Website:

- Events with `status: approved` appear immediately
- Events with `status: pending` can be manually reviewed in Sheet
- Low-quality events (`< MIN_QUALITY_SCORE`) are filtered out

---

## 🐛 Troubleshooting

### Issue: Workflow Fails with "Missing GEMINI_API_KEY"

**Solution:**
1. Verify secret name is exactly `GEMINI_API_KEY` (case-sensitive)
2. Check secret was added at repository level (not environment level)
3. Re-run workflow after adding secret

### Issue: "Permission denied" for Google Sheets

**Solution:**
1. Verify service account email has "Editor" access to your Google Sheet
2. Check `GOOGLE_SERVICE_ACCOUNT_JSON` secret contains complete JSON
3. Ensure JSON is valid (paste into https://jsonlint.com/)

### Issue: No Events Found

**Possible causes:**
1. Websites changed their structure (scraper needs update)
2. All events filtered out due to quality/location
3. Rate limiting from source websites

**Solutions:**
- Lower `MIN_QUALITY_SCORE` temporarily
- Increase `NORWICH_RADIUS_KM`
- Check workflow logs for specific errors
- Wait 1 hour and retry (rate limits reset)

### Issue: Duplicate Events

The scraper has deduplication logic, but if you see duplicates:
1. They might be genuinely different events (same name, different dates)
2. Sources list the same event with slight variations
3. Adjust deduplication threshold in code if needed

### Issue: Workflow Doesn't Run on Schedule

**Solutions:**
1. Verify repository is not a fork (forks have Actions disabled by default)
2. Check Actions are enabled: Settings → Actions → Allow all actions
3. Wait up to 15 minutes after scheduled time (GitHub Actions queue)
4. Manually trigger to verify workflow works

---

## 💰 Cost Breakdown

### FREE Services:
- ✅ **Google Gemini API:** 1,500 requests/day free
- ✅ **GitHub Actions:** 2,000 minutes/month free (you'll use ~20 min/month)
- ✅ **Google Sheets:** Free with Google account
- ✅ **Cloudflare Pages:** Free tier more than sufficient

### Optional Paid Services (Not Required):
- Eventbrite API: Free for public events
- Facebook Graph API: Requires app review (complex, skip for now)

**Total Monthly Cost:** $0 🎉

---

## 🎯 Expected Results

After setup completes, you should see:

### Daily:
- **4 scraping runs** (00:00, 06:00, 12:00, 18:00 UTC)
- **30-80 new events** discovered per run
- **15-40 events** added to Google Sheet (after filtering)
- **Website auto-updates** within 2-3 minutes

### Weekly:
- **100-200 quality events** in your database
- **Mix of categories:** nightlife, culture, markets, gigs, theatre, sports
- **Date range:** Current to 90 days ahead
- **Coverage:** Norwich + 15km radius

### Quality:
- Events have complete information
- Correct categorization (AI-powered)
- Norwich-specific (not London or other cities)
- Valid dates and times
- Contact/ticket information when available

---

## 🔄 Maintenance

### Monthly Tasks:
1. **Review event quality** - Check Google Sheet for any low-quality entries
2. **Adjust thresholds** - Tweak `MIN_QUALITY_SCORE` if needed
3. **Check workflow logs** - Verify no persistent errors

### Quarterly Tasks:
1. **Update scraper code** - Websites change, scrapers need updates
2. **Review categories** - Add new categories if needed
3. **Optimize performance** - Reduce API calls if hitting limits

### When Needed:
- **Website structure changes** - Update scraper for that source
- **New event sources** - Add new scrapers to `ai-event-aggregator.py`
- **API key renewal** - Gemini keys don't expire, but check if limited

---

## 📞 Support & Resources

### Documentation:
- **Full audit:** `COMPREHENSIVE_AUDIT_2026-01-06.md`
- **Deployment guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **AI setup:** `AI_AGGREGATOR_QUICKSTART.md`

### External Resources:
- **Gemini API Docs:** https://ai.google.dev/
- **GitHub Actions Docs:** https://docs.github.com/actions
- **Cron Schedule Help:** https://crontab.guru/

### Issues:
- **GitHub Repo:** github.com/marc420-design/norwich-event-hub/issues
- **Review workflow logs** for specific error messages
- **Check discussion boards** for similar issues

---

## ✅ Final Checklist

Before going live, verify:

- [ ] Gemini API key added to GitHub Secrets
- [ ] Google Sheet ID added to GitHub Secrets
- [ ] Service account JSON added to GitHub Secrets
- [ ] GitHub Actions enabled on repo
- [ ] Manual test run completed successfully
- [ ] Events appear in Google Sheet
- [ ] Website shows scraped events
- [ ] No errors in workflow logs
- [ ] Schedule is set correctly (4x daily)

---

## 🎉 Success!

Once setup is complete, your website will:
- ✅ Automatically discover new Norwich events
- ✅ Update 4 times per day
- ✅ Maintain 90 days of future events
- ✅ Filter out low-quality/irrelevant events
- ✅ Require zero manual intervention

**Next Steps:**
1. Monitor for first few days
2. Adjust quality thresholds as needed
3. Consider adding more event sources
4. Share your automated event platform with Norwich!

---

**Last Updated:** January 6, 2026  
**Setup Time:** 30-45 minutes  
**Maintenance:** <1 hour/month  
**Cost:** FREE forever 🎉

