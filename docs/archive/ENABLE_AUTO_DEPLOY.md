# 🔄 Enable Automatic Cloudflare Deployments

## What Just Happened

✅ **Manually deployed via Wrangler CLI** - Your site is now live with admin dashboard!

But right now, **Git integration is disabled** (shows "No" in Wrangler project list).

---

## Enable Auto-Deploy on Git Push

To make Cloudflare automatically deploy when you push to GitHub:

### Option 1: Via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**:
   - Visit: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **norwich-event-hub**

2. **Connect to GitHub**:
   - Click **Settings** tab
   - Scroll to **Source** section
   - Click **Connect to Git** button

3. **Authorize GitHub**:
   - Select your GitHub account
   - Choose repository: `marc420-design/norwich-event-hub`
   - Select branch: **`master`**
   - Click **Save**

4. **Configure Build Settings**:
   - Build command: (leave empty)
   - Build output directory: `/`
   - Root directory: `/`
   - Click **Save and Deploy**

### Option 2: Via Wrangler CLI

```powershell
# Link to GitHub repo
wrangler pages project create norwich-event-hub `
  --production-branch=master `
  --repo=marc420-design/norwich-event-hub
```

---

## Verify Auto-Deploy Works

1. Make a small change to any file:
   ```powershell
   echo "<!-- Updated -->" >> index.html
   git add index.html
   git commit -m "test: verify auto-deploy"
   git push origin master
   ```

2. Check Cloudflare:
   ```powershell
   wrangler pages deployment list --project-name=norwich-event-hub
   ```

3. You should see a new deployment triggered automatically!

---

## Current Status

✅ **Admin dashboard deployed**: https://norwicheventshub.com/admin.html
✅ **Preview URL**: https://e55d9dde.norwich-event-hub.pages.dev/admin.html
⚠️ **Auto-deploy**: Not enabled yet (manual deployments only)

---

## Quick Deploy Command (for now)

Until you enable Git integration, use this to deploy:

```powershell
cd "C:\Users\marc\Desktop\new company"
wrangler pages deploy . --project-name=norwich-event-hub --branch=master
```

---

**Next Step**: Go to Cloudflare Dashboard and enable Git integration (Option 1) so you don't have to manually deploy every time! 🚀

