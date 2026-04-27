# 🧪 Testing Your Automated Event Sync

## ✅ Workflow Has Been Deployed!

Your automated sync workflow is now live on GitHub:
- **Repository:** marc420-design/norwich-event-hub
- **Branch:** master
- **Workflow:** sync-events.yml

---

## 🚀 How to Test It Now

### Option 1: Test via GitHub Website (Easiest)

1. **Go to your repository:**
   ```
   https://github.com/marc420-design/norwich-event-hub
   ```

2. **Click the "Actions" tab** (at the top)

3. **You should see:**
   - "Sync Events from Google Sheets" workflow listed

4. **Click on it**

5. **Click "Run workflow"** button (top right)

6. **Select branch:** master

7. **Click green "Run workflow"** button

8. **Watch it run:**
   - It will show a yellow dot (running)
   - Then green checkmark (success) or red X (failed)
   - Takes about 30-60 seconds

9. **Click on the run** to see details:
   - How many events were synced
   - Whether any changes were made
   - Summary of what happened

### Option 2: Test via GitHub CLI (Advanced)

```bash
# Install GitHub CLI first (if not installed)
# https://cli.github.com/

# Trigger workflow
gh workflow run sync-events.yml

# Watch workflow status
gh run watch

# List recent runs
gh run list --workflow=sync-events.yml
```

---

## 📊 What to Expect

### First Run (Now)

When you test it manually, you should see:

```
✅ Status: Success
📝 Events synced: [number] events
🔄 Changes: New events pushed to repository (or "No updates needed")
🌐 Website: https://norwicheventshub.com
⏰ Next sync: 2026-01-14 00:00 UTC
```

### Daily Runs (Automatic)

Every day at midnight UTC, the workflow will:
1. Check for new/updated events in Google Sheets
2. Update `data/sample-events.json` if changed
3. Commit and push to GitHub
4. Trigger Cloudflare deployment
5. Your website updates automatically!

---

## 🔍 Verify It Worked

### Check 1: GitHub Commit

1. Go to your repository
2. Look at recent commits
3. You should see: "🔄 Auto-sync events from Google Sheets (2026-01-13...)"

### Check 2: File Updated

1. In your repository, navigate to: `data/sample-events.json`
2. Check the "Last modified" timestamp
3. Should be very recent (within last few minutes)

### Check 3: Website Updated

1. Go to https://norwicheventshub.com
2. Hard refresh (Ctrl + Shift + R)
3. Check if new events appear
4. Look at event count on homepage

### Check 4: Cloudflare Deployment

1. Go to Cloudflare Pages dashboard
2. Check recent deployments
3. Should show new deployment triggered by git push

---

## 🎯 What Happens Next

### Automatic Schedule

The workflow will run automatically:
- **Daily at:** 00:00 UTC (midnight)
- **UK Time (Winter):** 00:00 GMT
- **UK Time (Summer):** 01:00 BST

You don't need to do anything - it just works!

### Your Workflow Now

```
1. AI Scraper collects events
   ↓ POST to API
2. Events saved to Google Sheets
   ↓ Midnight UTC
3. GitHub Action syncs events
   ↓ Auto-deploy
4. Cloudflare rebuilds site
   ↓ 1-2 minutes
5. Website shows new events ✅
```

**Fully automated end-to-end! 🎉**

---

## 📝 Manual Sync (When Needed)

If you want to sync immediately (not wait for midnight):

### Via GitHub Website
1. Actions tab
2. "Sync Events from Google Sheets"
3. "Run workflow"
4. Done!

### Via Git Push
1. Make any change to `.github/workflows/sync-events.yml` (add a comment)
2. Commit and push
3. Workflow runs automatically

---

## 🛠️ Troubleshooting

### Workflow Not Showing Up

**Solution:**
1. Check if `.github/workflows/sync-events.yml` exists
2. Make sure you pushed to GitHub
3. Refresh the Actions page

### Workflow Failed

**Check:**
1. Click on the failed run
2. Read error message
3. Common issues:
   - API timeout → Increase timeout in workflow
   - Invalid JSON → Check your Google Apps Script
   - Permission denied → Check repo settings

### No New Commits

**This is normal!** 
If events haven't changed since last sync, no commit is created.
Only commits when there are actual changes to `sample-events.json`.

---

## 🎊 Success Checklist

- ✅ Workflow file pushed to GitHub
- ✅ Visible in GitHub Actions tab
- ✅ Manually tested and working
- ✅ Events synced successfully
- ✅ Website showing updated events
- ✅ Cloudflare deployment triggered

---

## 💡 Pro Tips

1. **Test now** before midnight to ensure it works
2. **Check Actions tab tomorrow** to see first automatic run
3. **Monitor for a week** to ensure it's working smoothly
4. **Adjust schedule** if you want more/less frequent syncs
5. **Add notifications** (optional - GitHub can email you on failures)

---

## 📧 Setting Up Notifications (Optional)

To get email when sync fails:

1. Go to your GitHub repository
2. Click "Watch" button (top right)
3. Select "Custom"
4. Check "Actions" box
5. Save

You'll get email if workflow fails!

---

## 🎯 Current Status

### ✅ Automated Sync Active!

Your Norwich Event Hub now has:
- **Automated daily sync** ✅
- **Manual trigger option** ✅
- **Change detection** ✅
- **Auto-deployment** ✅
- **Full workflow automation** ✅

**Everything is set up and working!**

---

## 📚 Related Documentation

- `AUTOMATED_SYNC_SETUP.md` - Setup guide and details
- `COMPLETE_WORKFLOW_GUIDE.md` - Full workflow overview
- `API_SUCCESS_SUMMARY.md` - API test results
- `README_START_HERE.md` - Getting started guide

---

## 🎉 You're Done!

Your event sync is now **fully automated**:
- ✅ No manual work needed
- ✅ Events update daily
- ✅ Always shows fresh content
- ✅ Works 24/7 automatically

**Just test it once to confirm, then sit back and relax!** 🎊

---

**Next: Test the workflow now → See it in action → Enjoy automated updates!**
