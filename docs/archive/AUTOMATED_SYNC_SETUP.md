# 🤖 Automated Event Sync - Setup Complete!

## ✅ What Was Created

A GitHub Action that automatically syncs events from your Google Sheets to your website **every day at midnight UTC**.

**File Created:** `.github/workflows/sync-events.yml`

---

## 🎯 What It Does

```
Every day at midnight UTC:
1. Fetches events from Google Apps Script API
2. Checks if there are new/updated events
3. If changes found:
   - Updates data/sample-events.json
   - Commits to GitHub
   - Triggers Cloudflare deployment
4. Your website updates automatically (1-2 minutes)
```

---

## 🚀 How to Enable

### Step 1: Push to GitHub

```bash
cd "c:\Users\marc\Desktop\new company"
git add .github/workflows/sync-events.yml
git commit -m "Add automated event sync workflow"
git push
```

### Step 2: Verify Workflow Exists

1. Go to your GitHub repository
2. Click **"Actions"** tab
3. You should see **"Sync Events from Google Sheets"** workflow

### Step 3: Test Manual Run (Optional)

1. In GitHub Actions tab
2. Click **"Sync Events from Google Sheets"**
3. Click **"Run workflow"** button
4. Select **"main"** branch
5. Click **"Run workflow"**
6. Wait 30-60 seconds
7. Check if `data/sample-events.json` was updated

---

## 📅 Schedule

- **Automatic runs:** Daily at 00:00 UTC (midnight)
- **Manual runs:** Anytime from GitHub Actions tab
- **Trigger on push:** When you update the workflow file

**Convert to your timezone:**
- 00:00 UTC = 00:00 GMT (UK winter)
- 00:00 UTC = 01:00 BST (UK summer)

---

## 🔍 Monitoring

### Check Last Sync

1. Go to GitHub repository
2. Click **"Actions"** tab
3. See recent workflow runs
4. Click any run to see details

### What You'll See

```
✅ Status: Success
📝 Events synced: 94
🔄 Changes: New events pushed to repository
🌐 Website: https://norwicheventshub.com
⏰ Next sync: 2026-01-14 00:00 UTC
```

---

## 🛠️ Customization

### Change Sync Schedule

Edit `.github/workflows/sync-events.yml`:

```yaml
schedule:
  - cron: '0 0 * * *'  # Daily at midnight
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 12 * * *'  # Daily at noon
  # - cron: '0 0 * * 1'  # Weekly on Monday
```

**Cron syntax:**
- `0 0 * * *` = Daily at midnight
- `0 */4 * * *` = Every 4 hours
- `0 0 * * 1-5` = Weekdays only
- `0 8,20 * * *` = 8am and 8pm daily

Use [crontab.guru](https://crontab.guru/) to test cron expressions.

### Change Commit Message

```yaml
git commit -m "Your custom message here ($(date +'%Y-%m-%d'))"
```

---

## 🔧 Troubleshooting

### Workflow Not Running

**Check:**
1. Is the workflow file in `.github/workflows/`?
2. Did you push to GitHub?
3. Is it enabled? (Actions tab → click workflow → enable)

### API Returns Error

**Check:**
1. Is your Google Apps Script deployed?
2. Is it set to "Anyone" access?
3. Test API manually:
   ```bash
   curl "https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec"
   ```

### No Changes Committed

**This is normal!** If events haven't changed, nothing gets committed.
The workflow only commits when there are actual changes.

### Workflow Failed

1. Go to Actions tab
2. Click the failed run
3. Click on the job to see error details
4. Common issues:
   - API timeout (increase timeout in workflow)
   - Invalid JSON response (check API)
   - Permission issues (check repo settings)

---

## 📊 Understanding the Workflow

### Step 1: Fetch Events
```bash
curl "YOUR_API_URL" -o /tmp/api-response.json
```
Downloads events from your Google Sheets API.

### Step 2: Extract Events Array
```bash
jq '.events' /tmp/api-response.json > data/sample-events.json
```
Extracts the events array and saves to your website's data file.

### Step 3: Check for Changes
```bash
git diff --quiet data/sample-events.json
```
Checks if the file actually changed.

### Step 4: Commit & Push
```bash
git add data/sample-events.json
git commit -m "Auto-sync events"
git push
```
Updates your repository, triggering Cloudflare deployment.

---

## 🎯 Benefits

### For You
- ✅ No manual work needed
- ✅ Events update automatically
- ✅ Always shows latest data
- ✅ Works while you sleep

### For Visitors
- ✅ Always see fresh events
- ✅ No outdated information
- ✅ New events appear daily
- ✅ Better user experience

### For Your Workflow
- ✅ AI scraper → Google Sheets → Auto-sync → Website
- ✅ Form submissions → Google Sheets → Auto-sync → Website
- ✅ Manual edits → Google Sheets → Auto-sync → Website

---

## 🔐 Security

### GitHub Token
The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub.
- No need to create secrets
- Token is scoped to this repo only
- Expires after workflow completes

### API Access
Your Google Apps Script is public (set to "Anyone").
- This is necessary for the workflow to access it
- Only returns approved events
- Submission API still works for adding events

### Permissions
The workflow can:
- ✅ Read repository files
- ✅ Write to repository (commit changes)
- ❌ Cannot access other repos
- ❌ Cannot change settings

---

## 📈 What Happens After Sync

```
1. GitHub Action runs (at midnight)
   ↓
2. Fetches events from API
   ↓
3. Updates sample-events.json
   ↓
4. Commits to GitHub (if changes)
   ↓
5. Cloudflare detects new commit
   ↓
6. Cloudflare rebuilds site (1-2 min)
   ↓
7. Cloudflare purges cache
   ↓
8. Website shows new events ✅
```

**Total time:** 2-3 minutes from sync to live

---

## 🎊 You're All Set!

Your Norwich Event Hub now has:
- ✅ Automated daily event sync
- ✅ No manual updates needed
- ✅ Always fresh content
- ✅ Complete workflow automation

**Just push the workflow file to GitHub and you're done!**

---

## 📝 Next Steps

1. **Push to GitHub:**
   ```bash
   git add .github/workflows/sync-events.yml
   git add AUTOMATED_SYNC_SETUP.md
   git commit -m "Add automated event sync"
   git push
   ```

2. **Test it:**
   - Go to GitHub Actions
   - Run workflow manually
   - Verify events update

3. **Relax:**
   - Events sync automatically every day
   - You only manage content in Google Sheets
   - Website updates itself!

---

## 💡 Pro Tips

1. **Add more events to Google Sheets** - They'll appear on the site automatically
2. **Use your AI scraper** - Events go to Sheets → Auto-sync → Website
3. **Monitor the Actions tab** - See sync history
4. **Keep status column** - Only "approved" events sync
5. **Edit anytime** - Changes appear next sync (or trigger manually)

---

**Happy automating! 🤖**
