# Real-Time AI Integration - Complete Guide

## 🎉 What's New

Your Norwich Event Hub now has **real-time AI event discovery**! The system automatically:

1. **Scrapes** events from multiple sources (Eventbrite, Skiddle, Norwich Council, Visit Norwich)
2. **Processes** them with Claude AI to extract and structure event data
3. **Validates** and scores events for quality
4. **Auto-approves** high-quality events (score ≥80)
5. **Updates** your Google Sheet twice daily
6. **Displays** new events on your website in real-time

## 🚀 How It Works

### The Flow

```
┌─────────────────────────────────────────────────────────────┐
│  AI EVENT AGGREGATOR (Runs twice daily via GitHub Actions) │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Scrapes events from multiple sources │
        │  • Eventbrite API                     │
        │  • Skiddle.com                        │
        │  • Norwich Council                    │
        │  • Visit Norwich                      │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Claude AI processes raw HTML/JSON   │
        │  • Extracts event details             │
        │  • Normalizes dates/times             │
        │  • Categorizes events                 │
        │  • Validates Norwich location         │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Quality scoring (0-100)              │
        │  • 80+: Auto-approved                 │
        │  • 50-79: Pending review              │
        │  • <50: Rejected                      │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Uploads to Google Sheets             │
        │  • Adds timestamp                     │
        │  • Sets status (Approved/Pending)     │
        │  • Generates AI-{date}-{id}           │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Google Apps Script API               │
        │  • Returns approved events            │
        │  • Marks AI-discovered with flag      │
        └──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Website (Auto-refresh every 5 min)   │
        │  • Fetches latest events              │
        │  • Shows "🤖 AI Discovered" badge     │
        │  • Notifies users of new events       │
        └──────────────────────────────────────┘
```

## ⚙️ Setup Required

### 1. Configure GitHub Secrets

Go to your repo Settings > Secrets and variables > Actions:

| Secret | Where to get it | Required? |
|--------|----------------|-----------|
| `CLAUDE_API_KEY` | https://console.anthropic.com/ | ✅ Yes |
| `GOOGLE_SHEET_ID` | Already have: `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU` | ✅ Yes |
| `GOOGLE_SHEETS_CREDENTIALS` | Google Cloud Console (see AI_SETUP_GUIDE.md) | ✅ Yes |
| `EVENTBRITE_API_KEY` | https://www.eventbrite.com/platform/api | ⚠️ Recommended |

### 2. Run the Workflow

**Manual test:**
1. Go to GitHub repo > Actions tab
2. Select "Daily AI Event Aggregation"
3. Click "Run workflow"
4. Wait 2-5 minutes
5. Check your Google Sheet for new events with Event IDs starting with `AI-`

**Automatic schedule:**
- Runs at 6:00 AM UTC daily
- Runs at 6:00 PM UTC daily

### 3. Approve Pending Events

1. Open your Google Sheet
2. Look for events with Status = "AI_Pending_Review"
3. Review the event details
4. Change Status to "Approved" if valid
5. Events will appear on website within 5 minutes

## 🎯 Features

### Auto-Refresh
- Website checks for new events every 5 minutes
- Shows notification when new events are added
- No manual refresh needed

### AI Discovery Badge
- Events discovered by AI show "🤖 AI Discovered" badge
- Builds trust and showcases automation
- Users can see which events are AI-found vs. user-submitted

### Quality Control
Events are scored on:
- Complete information (30 pts)
- Ticket link (20 pts)
- Trusted source (20 pts)
- Good description (15 pts)
- Has image (15 pts)

**Total score determines status:**
- 80-100: Auto-approved (live immediately)
- 50-79: Needs your review
- 0-49: Auto-rejected

### Deduplication
- Compares event name, date, and location
- Prevents duplicate entries
- Keeps your database clean

## 📊 Monitoring

### Check Workflow Status
1. Go to Actions tab in GitHub
2. Click on latest "Daily AI Event Aggregation" run
3. View logs for each step
4. Download artifacts to see raw event data

### View Console Logs (Website)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - `✅ Loaded X events from Google Sheets API`
   - `🔄 Auto-refreshing events from Google Sheets...`
   - `✨ New events detected! X → Y`

### Google Sheet
- AI events have Event ID format: `AI-YYYYMMDD-{number}`
- User-submitted events: `NEH-{timestamp}-{random}`
- Check Status column for approval state

## 🐛 Troubleshooting

### No AI events appearing

**Check 1: Workflow running?**
- Go to Actions tab
- Verify last run was successful
- Check logs for errors

**Check 2: Events approved?**
- Open Google Sheet
- Filter Status column for "Approved"
- Make sure AI events are approved

**Check 3: Website config correct?**
- Open `scripts/config.js`
- Verify `USE_LOCAL_STORAGE: false`
- Verify `GOOGLE_APPS_SCRIPT_URL` is correct

**Check 4: Google Apps Script deployed?**
- Open Google Apps Script editor
- Deploy > Manage Deployments
- Ensure latest version is active

### Workflow fails

**"CLAUDE_API_KEY not found"**
- Add secret in repo Settings > Secrets

**"Failed to upload to Google Sheets"**
- Check service account credentials are valid
- Verify Sheet is shared with service account email
- Ensure Sheet ID is correct

**"No events found"**
- This is normal if sources have no new events
- AI is working, just nothing new to add

### Events not showing real-time

**Check browser console:**
```javascript
// Should see this every 5 minutes:
🔄 Auto-refreshing events from Google Sheets...
✅ Events up to date
```

**Force refresh:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard reload page (Ctrl+Shift+R)

## 📈 Expected Results

After setup, you should see:

**Immediately:**
- Workflow runs successfully in GitHub Actions
- AI-discovered events added to Google Sheet

**Within 5 minutes:**
- Approved AI events appear on website
- "🤖 AI Discovered" badges visible

**Ongoing:**
- New events added twice daily
- Website auto-refreshes every 5 minutes
- Notification shown when new events detected

## 🎓 Tips

1. **Review AI events regularly** - Set Status to "Approved" for pending events
2. **Adjust quality thresholds** - Edit workflow environment variables if too strict/loose
3. **Monitor logs** - Check Actions tab after each run to spot issues
4. **Test manually** - Use "Run workflow" button to test before automatic schedule
5. **Customize scrapers** - Edit `automation/ai-event-aggregator.py` to add more sources

## 📚 Related Documentation

- `AI_SETUP_GUIDE.md` - Detailed setup instructions
- `AUDIT_REPORT_GEMINI.md` - Codebase overview
- `automation/ai-event-aggregator.py` - AI script source code
- `.github/workflows/scrape-events.yml` - Automation workflow

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Workflow runs automatically twice daily
- ✅ Google Sheet has events with `AI-` prefix
- ✅ Website shows AI-discovered events with badge
- ✅ Browser console shows auto-refresh messages
- ✅ Notification appears when new events are added

---

**Questions?** Check the logs, review the guides, or inspect the code!
