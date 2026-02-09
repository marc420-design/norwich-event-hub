# 🚀 Purge Cloudflare Cache - IMMEDIATE ACTION

**Time Required:** 2 minutes
**Importance:** CRITICAL - New code won't load until cache is purged

---

## Quick Method: Cloudflare Dashboard (RECOMMENDED)

### Step 1: Log into Cloudflare
1. Go to https://dash.cloudflare.com
2. Log in with your Cloudflare account

### Step 2: Select Your Site
1. Click on **norwicheventshub.com** in the list

### Step 3: Purge Cache
1. Click **Caching** in the left sidebar
2. Click **Configuration** tab
3. Scroll down to **Purge Cache** section
4. Click the **Purge Everything** button
5. Confirm by clicking **Purge Everything** again

**That's it!** Cache will be purged in 30 seconds.

---

## Alternative: Using PowerShell Script

If you prefer to use the command line:

### Step 1: Get Cloudflare API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Click **Use template** next to "Edit zone DNS"
4. Under **Zone Resources**, select:
   - Include → **Specific zone** → **norwicheventshub.com**
5. Under **Account Resources**, select:
   - Include → **All accounts**
6. Click **Continue to summary**
7. Click **Create Token**
8. **COPY THE TOKEN** (you'll only see it once!)

### Step 2: Run the Purge Script
1. Open PowerShell as Administrator
2. Navigate to project:
```powershell
cd "C:\Users\marcc\Desktop\new company"
```

3. Run the script:
```powershell
.\purge-cache.ps1
```

4. When prompted, paste your API token
5. Press Enter

---

## After Purging Cache

### Verify the Cache is Cleared:

1. **Visit the site:**
   - Go to https://norwicheventshub.com
   - Do a hard refresh: **Ctrl + Shift + R**

2. **Check Console (F12):**
   - Look for script URLs with `?v=20260128`
   - Look for: "📊 Analytics: Initializing Google Analytics 4..."
   - Should **NOT** see CORS errors anymore

3. **Expected Console Output:**
```
🔄 Loading events from Google Sheets API...
✅ Loaded X events from Google Sheets API
📊 Sample event: {...}
🔄 Auto-refresh enabled
```

### If Still Seeing Old Version:

**Browser Cache Issue:**
1. Close ALL browser tabs/windows
2. Clear browser cache:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
3. Reopen browser and visit site

**Still Issues?**
1. Try incognito/private mode
2. Try a different browser
3. Wait 5 more minutes and try again

---

## What Changed After Deployment

Once cache is cleared, you'll see:

### ✅ Fixed Issues:
- **CORS Errors:** Gone! Events load from Google Sheets
- **Event Counter:** Shows correct count
- **Form Validation:** Real-time feedback on submit page
- **SEO:** All pages have canonical URLs
- **Scripts:** New version (v=20260128)

### 🆕 New Features:
- **Google Analytics 4:** Ready (needs Measurement ID)
- **Form Validation:** Red/green visual feedback
- **Better Documentation:** 3 new guide files

---

## Cloudflare Auto-Deploy

**Good News:** Your site is configured for auto-deploy!

Whenever you push to the `master` branch on GitHub, Cloudflare Pages will:
1. Detect the change
2. Build and deploy automatically
3. Update the live site
4. **Purge cache automatically after ~5 minutes**

But for immediate testing, manual cache purge is faster.

---

## Next Steps After Cache Clear

### 1. Verify Everything Works
- [ ] Visit https://norwicheventshub.com
- [ ] Check console for no CORS errors
- [ ] Check events are loading
- [ ] Test form validation on submit page

### 2. Set Up Google Analytics 4
- [ ] Create GA4 property
- [ ] Get Measurement ID
- [ ] Add to `scripts/config.js` line 39
- [ ] Commit and push

### 3. Monitor for 24 Hours
- [ ] Check for any errors
- [ ] Verify events are updating
- [ ] Test on mobile devices
- [ ] Check different browsers

---

## Support Resources

### Documentation:
- [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) - Full deployment details
- [FIXES_COMPLETED.md](./FIXES_COMPLETED.md) - All fixes documented
- [WEBSITE_AUDIT_REPORT.md](./WEBSITE_AUDIT_REPORT.md) - Original audit

### Need Help?
Check console errors and compare with expected output above.

---

## TL;DR - Fastest Method

1. Go to https://dash.cloudflare.com
2. Click **norwicheventshub.com**
3. Click **Caching** → **Configuration**
4. Click **Purge Everything**
5. Confirm
6. Wait 30 seconds
7. Visit https://norwicheventshub.com
8. Hard refresh: **Ctrl + Shift + R**

**Done!** 🎉

---

**Created:** January 28, 2026
**Priority:** CRITICAL
**Est. Time:** 2 minutes
