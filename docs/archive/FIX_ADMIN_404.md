# 🔧 Fix Admin Dashboard 404

## The Problem
Admin dashboard (`admin.html`) returns 404 because Cloudflare Pages is deploying from the **wrong branch**.

## Root Cause
- **Your Git branch**: `master`
- **Cloudflare is watching**: `main` (by default)
- **Result**: Cloudflare never sees your latest commits!

## Solution: Update Cloudflare Branch Settings

### Method 1: Via Cloudflare Dashboard (FASTEST - 2 minutes)

1. **Go to Cloudflare Dashboard**:
   - Visit: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **norwich-event-hub**

2. **Update Production Branch**:
   - Click **Settings** tab
   - Scroll to **Build & deployments** section
   - Find **Production branch**: currently shows `main`
   - Change it to: **`master`**
   - Click **Save**

3. **Trigger Deployment**:
   - Go to **Deployments** tab
   - Click **Create deployment**
   - Select branch: `master`
   - Click **Deploy**

4. **Wait 2-3 Minutes**:
   - Watch the build log
   - When complete, visit: https://norwicheventshub.com/admin.html

### Method 2: Manual Redeploy (Alternative)

If you want to keep `main` as the production branch, you can rename your branch:

```powershell
# Rename local branch
git branch -m master main

# Update remote
git push origin -u main

# Delete old master branch (optional)
git push origin --delete master
```

Then Cloudflare will automatically deploy from `main`.

---

## Verification Checklist

After updating the branch in Cloudflare:

- [ ] Go to Cloudflare → Deployments
- [ ] See a new deployment triggered for `master` branch
- [ ] Build completes successfully (green checkmark)
- [ ] Visit https://norwicheventshub.com/admin.html
- [ ] Admin dashboard loads with events ✅

---

## Quick Test URLs

Once deployed, test these URLs:

1. **Direct**: https://norwicheventshub.com/admin.html
2. **Redirect**: https://norwicheventshub.com/admin
3. **Alternative**: https://norwicheventshub.com/dashboard

All three should work after Cloudflare deploys from `master`.

---

## Why This Happened

Cloudflare Pages defaults to `main` branch, but Git repos created before 2020 use `master`. The `cloudflare-pages.json` config file was set to `main`, which doesn't exist in your repo.

**Solution**: Updated `cloudflare-pages.json` to use `master` branch, **BUT** Cloudflare might not read this file automatically. You need to manually update it in the dashboard (Method 1 above).

---

## Need Help?

If admin dashboard is still 404 after following Method 1:

1. Check Cloudflare build logs for errors
2. Verify `admin.html` exists in your repo: https://github.com/marc420-design/norwich-event-hub/blob/master/admin.html
3. Try a hard refresh: `Ctrl + Shift + R`
4. Check Cloudflare Pages deployment status

---

**TL;DR**: Go to Cloudflare Dashboard → Settings → Change production branch from `main` to `master` → Save → Redeploy.

