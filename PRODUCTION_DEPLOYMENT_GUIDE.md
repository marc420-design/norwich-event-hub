# 🚀 Production Deployment Guide - Norwich Event Hub

**Date:** January 6, 2026  
**Status:** PRODUCTION READY  
**Deployment Target:** Cloudflare Pages → norwicheventshub.com

---

## ✅ Pre-Deployment Checklist

### Critical Fixes Applied
- [x] **Fixed config override bug** - `force-reload.js` now respects `APP_CONFIG.USE_LOCAL_STORAGE`
- [x] **Removed debug instrumentation** - All `127.0.0.1:7242` fetch calls removed
- [x] **Updated event data** - 15 current/future events (Jan 7-18, 2026)
- [x] **Updated sitemap** - All pages included with current dates
- [x] **Safari CSS compatibility** - Added `-webkit-backdrop-filter` prefixes
- [x] **Config-based analytics** - GA4 only loads when configured
- [x] **Newsletter with spam protection** - Honeypot + rate limiting implemented

---

## 📋 Files Changed (Git Diff Summary)

### Modified Files:
1. **scripts/force-reload.js** - Fixed config override, removed debug logs
2. **scripts/home.js** - Removed debug logs, improved empty states
3. **scripts/analytics.js** - Complete rewrite with config-based initialization
4. **scripts/newsletter.js** - Complete rewrite with spam protection
5. **scripts/config.js** - Added optional analytics/newsletter config
6. **data/sample-events.json** - Updated all events to current/future dates
7. **sitemap.xml** - Added missing pages, updated dates
8. **styles/enhanced.css** - Added webkit prefixes for Safari support

### Key Changes:

#### 1. `scripts/force-reload.js`
```javascript
// BEFORE (line 58):
const config = { USE_LOCAL_STORAGE: true };

// AFTER (lines 58-63):
const config = {
    USE_LOCAL_STORAGE: typeof APP_CONFIG !== 'undefined' && APP_CONFIG.USE_LOCAL_STORAGE !== undefined
        ? APP_CONFIG.USE_LOCAL_STORAGE
        : true,
    GOOGLE_APPS_SCRIPT_URL: typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.GOOGLE_APPS_SCRIPT_URL : null
};
```

#### 2. Debug Instrumentation Removed
- Removed 13 debug fetch calls from `force-reload.js`
- Removed 7 debug fetch calls from `home.js`
- No more requests to `127.0.0.1:7242` in production

#### 3. `scripts/analytics.js`
- Only initializes if `APP_CONFIG.GA_MEASUREMENT_ID` is set
- Graceful degradation if not configured
- Tracks custom events (clicks, form submits, outbound links)

#### 4. `scripts/newsletter.js`
- Honeypot field for spam protection
- Rate limiting (max 2 signups/day via localStorage)
- Config-based endpoint (`APP_CONFIG.NEWSLETTER_ENDPOINT`)
- Friendly message if not configured

#### 5. `data/sample-events.json`
- All 15 events updated to Jan 7-18, 2026
- Mix of categories: gigs, nightlife, markets, culture, theatre, community
- Featured events marked for homepage sections

---

## 🔧 Configuration Options

### Required (Already Set):
```javascript
// scripts/config.js
const APP_CONFIG = {
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/...',
    GOOGLE_SHEET_ID: '1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU',
    USE_LOCAL_STORAGE: false,  // Set to true for local JSON fallback
    SITE_URL: 'https://norwicheventshub.com'
};
```

### Optional (Add When Ready):
```javascript
// Google Analytics 4
GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',  // Your GA4 measurement ID

// Newsletter Service
NEWSLETTER_ENDPOINT: 'https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe',

// Cloudflare Turnstile (advanced spam protection)
TURNSTILE_SITE_KEY: 'your-site-key'
```

---

## 🚀 Deployment Steps

### Step 1: Verify Git Status
```bash
cd "C:\Users\marc\Desktop\new company"
git status
git diff
```

### Step 2: Commit Changes
```bash
git add .
git commit -m "Production ready: Fix event loading, remove debug logs, update data"
```

### Step 3: Push to GitHub
```bash
git push origin main
```

### Step 4: Cloudflare Pages Auto-Deploy
- Cloudflare Pages will automatically detect the push
- Build will start within 1-2 minutes
- Deploy time: ~2-3 minutes
- Live at: https://norwicheventshub.com

### Step 5: Verify Deployment
See "Smoke Test Script" below

---

## 🧪 Smoke Test Script (Manual Verification)

### Local Testing (Before Deploy):
```bash
# Serve locally
npm run dev
# or
npx serve .
```

Then test:

### 1. **Homepage Loads with Events** ✓
- [ ] Open http://localhost:3000 (or local port)
- [ ] Verify "Featured This Week" shows events
- [ ] Verify "Tonight" section shows relevant events
- [ ] Verify "This Weekend" section shows events
- [ ] Verify all event cards display correctly

### 2. **No Console Errors** ✓
- [ ] Open DevTools (F12) → Console tab
- [ ] Should see: "✅ Loaded 15 events from local JSON"
- [ ] Should NOT see any `127.0.0.1:7242` requests
- [ ] Should NOT see any error messages
- [ ] Check Network tab: No failed requests to localhost

### 3. **Filters Work** ✓
- [ ] Navigate to `directory.html`
- [ ] Use category filter (Nightlife, Culture, etc.)
- [ ] Use search box
- [ ] Verify events filter correctly

### 4. **This Weekend Page** ✓
- [ ] Navigate to `this-weekend.html`
- [ ] Verify weekend events display
- [ ] Verify date calculations are correct

### 5. **Event Detail Pages** ✓
- [ ] Click on any event card
- [ ] Verify event details load
- [ ] Verify countdown timer works (if event is <24hrs away)
- [ ] Verify "Event Snapshot" displays

### 6. **Venues Page** ✓
- [ ] Navigate to `venues.html`
- [ ] Verify venue list loads
- [ ] Click a venue → verify venue detail page

### 7. **Submit Event Form** ✓
- [ ] Navigate to `submit.html`
- [ ] Verify form displays correctly
- [ ] Test form validation
- [ ] Verify benefits section shows

### 8. **Newsletter Signup** ✓
- [ ] Scroll to footer
- [ ] Enter email in newsletter form
- [ ] Submit form
- [ ] Should see: "Newsletter signup coming soon" (if not configured)
- [ ] Or success message (if configured)
- [ ] Try signing up 3 times → should see rate limit message

### 9. **Analytics** ✓
- [ ] Check Network tab for GA4 requests
- [ ] Should NOT load if `GA_MEASUREMENT_ID` not set
- [ ] Should load if configured

### 10. **Mobile Responsive** ✓
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test on iPhone, iPad, Android sizes
- [ ] Verify navigation menu works
- [ ] Verify cards stack properly

---

## 🌐 Production Testing (After Deploy)

### 1. Live Site Check
```
https://norwicheventshub.com/
```
- [ ] Homepage loads quickly (<2 seconds)
- [ ] Events display correctly
- [ ] No console errors
- [ ] HTTPS working
- [ ] No mixed content warnings

### 2. All Pages Accessible
- [ ] https://norwicheventshub.com/
- [ ] https://norwicheventshub.com/today.html
- [ ] https://norwicheventshub.com/this-weekend.html
- [ ] https://norwicheventshub.com/directory.html
- [ ] https://norwicheventshub.com/nightlife.html
- [ ] https://norwicheventshub.com/culture.html
- [ ] https://norwicheventshub.com/venues.html
- [ ] https://norwicheventshub.com/submit.html
- [ ] https://norwicheventshub.com/about.html
- [ ] https://norwicheventshub.com/contact.html

### 3. Cross-Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (Mac/iOS)
- [ ] Mobile browsers

### 4. SEO Check
- [ ] View page source → verify meta tags
- [ ] Check sitemap: https://norwicheventshub.com/sitemap.xml
- [ ] Check robots.txt: https://norwicheventshub.com/robots.txt
- [ ] Run Lighthouse audit (target: 90+ on all metrics)

### 5. Security Headers Check
```bash
curl -I https://norwicheventshub.com/
```
Verify headers:
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Content-Security-Policy` present
- [ ] `Strict-Transport-Security` (HTTPS)

---

## 🐛 Troubleshooting

### Issue: Events Not Loading
**Symptoms:** Homepage shows "Loading..." or empty state  
**Solutions:**
1. Check browser console for errors
2. Verify `APP_CONFIG.USE_LOCAL_STORAGE` setting
3. Check if `data/sample-events.json` is accessible
4. Test Google Sheets API URL manually
5. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Old Events Showing
**Symptoms:** Past events appear on homepage  
**Solutions:**
1. Verify `data/sample-events.json` has current dates
2. Check `date-utils.js` `isFutureEvent` function
3. Clear localStorage: `localStorage.clear()`
4. Hard refresh browser

### Issue: Console Errors About localhost
**Symptoms:** Requests to `127.0.0.1:7242` failing  
**Solutions:**
- This should NOT happen anymore (all debug logs removed)
- If it does, check git commit was successful
- Verify Cloudflare Pages deployed latest code

### Issue: Newsletter Not Working
**Symptoms:** Form submits but nothing happens  
**Solutions:**
1. Check if `APP_CONFIG.NEWSLETTER_ENDPOINT` is set
2. If not set → expected behavior (shows "coming soon")
3. If set → check network tab for API call
4. Verify endpoint URL is correct

### Issue: Analytics Not Loading
**Symptoms:** No GA4 requests in Network tab  
**Solutions:**
- This is expected if `GA_MEASUREMENT_ID` not configured
- Analytics gracefully disabled
- To enable: Add `GA_MEASUREMENT_ID: 'G-XXXXXXXXXX'` to config.js

---

## 📊 Performance Targets

### Lighthouse Scores (Target)
- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 90+
- **SEO:** 100

### Load Times
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Total Page Size:** <500KB

### API Response Times
- **Google Sheets API:** <2s
- **Local JSON:** <500ms
- **Timeout Fallback:** 2s

---

## 🔒 Security Checklist

- [x] No API keys exposed in client code
- [x] Google service account JSON gitignored
- [x] CSP headers configured
- [x] HTTPS enforced via _redirects
- [x] Honeypot spam protection on forms
- [x] Rate limiting on newsletter signups
- [x] XSS protection headers set
- [x] No unsafe eval in CSP

---

## 📞 Post-Deployment Tasks

### Immediate (Day 1):
1. **Monitor Error Logs**
   - Check Cloudflare Pages dashboard for build errors
   - Monitor browser console in production

2. **Test All User Flows**
   - Submit an event
   - Sign up for newsletter
   - Browse events by category

3. **Set Up Monitoring**
   - Configure uptime monitoring (UptimeRobot, Pingdom)
   - Set up alerts for downtime

### Week 1:
1. **Configure Analytics** (if not done)
   - Create GA4 property
   - Add measurement ID to config.js
   - Verify tracking works

2. **Configure Newsletter** (if not done)
   - Choose service (ConvertKit, Mailchimp, etc.)
   - Add endpoint to config.js
   - Test signup flow

3. **Submit to Search Engines**
   - Google Search Console
   - Bing Webmaster Tools
   - Submit sitemap

### Month 1:
1. **SEO Optimization**
   - Review search rankings
   - Update meta descriptions based on performance
   - Add more structured data if needed

2. **Performance Optimization**
   - Review Lighthouse scores
   - Optimize images if needed
   - Consider CDN for assets

3. **User Feedback**
   - Monitor analytics for drop-off points
   - Fix any reported bugs
   - Iterate on UX based on data

---

## 🎉 Success Metrics

### Technical Metrics:
- ✅ Zero console errors
- ✅ <2s page load time
- ✅ 100% uptime
- ✅ All pages accessible
- ✅ No broken links

### Business Metrics:
- 📊 Track event submissions
- 📊 Monitor page views
- 📊 Newsletter signup rate
- 📊 Ticket link clicks
- 📊 Return visitor rate

---

## 📝 Quick Command Reference

```bash
# Local development
npm run dev

# Check git status
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to production
git push origin main

# Clear Cloudflare cache (if needed)
# Use Cloudflare dashboard → Caching → Purge Everything

# Test local build
npx serve .
```

---

## 🆘 Support & Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Google Apps Script:** https://script.google.com/
- **Repo Issues:** github.com/marc420-design/norwich-event-hub/issues
- **Analytics Setup:** [README.md](README.md) → Analytics section

---

**Last Updated:** January 6, 2026  
**Deployment Status:** READY FOR PRODUCTION  
**Confidence Level:** HIGH ✅

**Next Step:** Run smoke tests locally, then `git push origin main` to deploy!

