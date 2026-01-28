# GitHub Secrets Quick Setup Guide

## 🔐 Required Secrets for Weekly Automation

Your GitHub Actions workflow needs these secrets to automatically scrape Norwich events every week.

## Step-by-Step Setup

### 1. Go to GitHub Settings
1. Open: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click "New repository secret" for each secret below

---

### 2. Add These Secrets

#### **CLAUDE_API_KEY** (REQUIRED)
- **Value**: Your Anthropic API key
- **Get it from**: https://console.anthropic.com/settings/keys
- **Format**: `sk-ant-...`
- **Cost**: ~$0.05-0.15 per week (~$5-10/year)

#### **GOOGLE_SHEET_ID** (REQUIRED)
- **Value**: `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`
- **Note**: This is your Event Submissions sheet ID (already configured)

#### **GOOGLE_SHEETS_CREDENTIALS** (REQUIRED)
- **Value**: Your Google Service Account JSON (entire file contents)
- **How to get**:
  1. Go to: https://console.cloud.google.com/
  2. Create a project: "Norwich Event Hub"
  3. Enable "Google Sheets API"
  4. Go to "Credentials" → "Create Credentials" → "Service Account"
  5. Name it "Event Automation"
  6. Click "Create and Continue" → "Done"
  7. Click on the service account email
  8. Go to "Keys" tab → "Add Key" → "Create new key" → "JSON"
  9. Download the JSON file
  10. **IMPORTANT**: Share your Google Sheet with the service account email (found in the JSON)
     - Example: `event-automation@norwich-event-hub.iam.gserviceaccount.com`
     - Give it "Editor" permission
  11. Copy the ENTIRE contents of the JSON file and paste as secret value

#### **EVENTBRITE_API_KEY** (OPTIONAL)
- **Value**: Your Eventbrite API key
- **Get it from**: https://www.eventbrite.com/platform/api-keys
- **Note**: Increases event discovery by 20-30 events/week

#### **FACEBOOK_ACCESS_TOKEN** (OPTIONAL)
- **Value**: Facebook Graph API token
- **Get it from**: https://developers.facebook.com/tools/explorer/
- **Note**: Adds events from Facebook public pages

---

## 3. Verify Secrets

After adding all secrets, you should see:
- ✅ CLAUDE_API_KEY
- ✅ GOOGLE_SHEET_ID
- ✅ GOOGLE_SHEETS_CREDENTIALS
- ✅ EVENTBRITE_API_KEY (optional)
- ✅ FACEBOOK_ACCESS_TOKEN (optional)

---

## 4. Test the Workflow

### Manual Test:
1. Go to: https://github.com/marc420-design/norwich-event-hub/actions/workflows/scrape-events.yml
2. Click "Run workflow" → "Run workflow"
3. Wait 2-5 minutes
4. Check "Actions" tab for results
5. If successful, check your Google Sheet for new events!

### Automatic Schedule:
- Runs every **Monday at 6:00 AM UTC**
- Scrapes 50-100 Norwich events
- Auto-approves high-quality events (score > 80)
- Manual review needed for events with score 50-79

---

## What the Automation Does

1. **Scrapes Events** from multiple sources:
   - Eventbrite (Norwich area, 15km radius)
   - Skiddle (Norwich nightlife & gigs)
   - Norwich Council (official events)
   - Visit Norwich (tourism & culture)

2. **AI Processing** with Claude:
   - Parses messy HTML into structured data
   - Normalizes dates to YYYY-MM-DD format
   - Assigns correct categories
   - Scores quality (0-100)
   - Deduplicates events

3. **Auto-Approval**:
   - Score ≥ 80 → "Approved" (appears on site immediately)
   - Score 50-79 → "Pending" (needs manual review)
   - Score < 50 → Rejected (not added)

4. **Updates Website**:
   - Syncs to `data/sample-events.json`
   - Commits and pushes to GitHub
   - Cloudflare Pages auto-deploys
   - **Your site updates automatically!** 🎉

---

## Troubleshooting

### Workflow fails with "CLAUDE_API_KEY not found":
- Make sure you added the secret exactly as `CLAUDE_API_KEY` (case-sensitive)
- Check your API key is valid at https://console.anthropic.com/

### Workflow fails with "Permission denied" on Google Sheets:
- Make sure you shared the Google Sheet with the service account email
- Email format: `your-service-account@project-id.iam.gserviceaccount.com`
- Give it "Editor" permission

### No events are being added:
- Check the workflow logs in GitHub Actions
- Look for "Found X raw events" in the output
- If 0 events found, check if the scraping sources are still active

### Events are "Pending" instead of "Approved":
- This means quality score is 50-79 (needs review)
- Lower the `AUTO_APPROVE_THRESHOLD` in `.github/workflows/scrape-events.yml` to 70
- Or manually review and approve in Google Sheets

---

## Cost Estimate

**With automation:**
- Claude API: ~$5-10/year
- Google Sheets: FREE
- GitHub Actions: FREE
- **Total: ~$10/year**

**Without automation:**
- Manual event entry: 5-10 hours/week
- **Time saved: 250-500 hours/year** 🎉

---

## Next Steps

1. ✅ Add GitHub Secrets (above)
2. ✅ Test workflow manually
3. ✅ Verify events appear in Google Sheet
4. ✅ Check that approved events show on website
5. 🎉 Enjoy automatic event updates every week!
