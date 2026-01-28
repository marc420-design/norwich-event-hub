# Audit Verification Tests - Norwich Event Hub
**Test plan for validating audit findings and fixes**

---

## Table of Contents
1. [Pre-Fix Baseline Tests](#1-pre-fix-baseline-tests)
2. [Post-Fix Verification Tests](#2-post-fix-verification-tests)
3. [Browser DevTools Checks](#3-browser-devtools-checks)
4. [Network Request Validation](#4-network-request-validation)
5. [Manual Smoke Tests](#5-manual-smoke-tests)
6. [Results Checklist](#6-results-checklist)

---

## 1. Pre-Fix Baseline Tests

**Purpose:** Document current state before making changes

### Test 1.1: CSP Violation Check
**Expected:** GA4 and newsletter requests blocked

**Steps:**
1. Open https://norwicheventshub.com
2. Open DevTools (F12) → Console tab
3. Look for errors

**Expected Results:**
```
❌ Refused to load the script 'https://www.googletagmanager.com/gtag/js?id=G-XXX' 
   because it violates the following Content Security Policy directive...

❌ Refused to connect to 'https://www.googletagmanager.com/...' 
   because it violates the following Content Security Policy directive...
```

**Actual Results:** _______________

**Status:** [ ] FAIL (as expected)

---

### Test 1.2: Event Data Freshness
**Expected:** Events dated Jan 7-18, 2026

**Steps:**
1. Open homepage
2. Check "Featured This Week" section
3. Note latest event date
4. Open `data/sample-events.json` in browser
5. Find latest date in JSON

**Expected Results:**
- Latest event: January 18, 2026
- Days until expiry: 12 days from Jan 6
- Status: ⚠️ Will expire soon

**Actual Results:** _______________

**Status:** [ ] PASS (data is current but expires soon)

---

### Test 1.3: Error State Rendering
**Expected:** No error message if section is empty

**Steps:**
1. Open DevTools → Network tab
2. Block: `script.google.com` and `*/sample-events.json`
3. Refresh homepage
4. Look at "Featured This Week" section

**Expected Results:**
- Section is empty (no placeholder card)
- No error message appears
- User sees blank space

**Actual Results:** _______________

**Status:** [ ] FAIL (poor UX, as expected)

---

### Test 1.4: Event Page Meta Tags
**Expected:** Generic meta tags, not event-specific

**Steps:**
1. Open: https://norwicheventshub.com/event-detail.html?id=evt-001
2. View page source (Ctrl+U)
3. Find `<meta name="description">`
4. Find `<meta property="og:description">`

**Expected Results:**
```html
<meta name="description" content="Event details - Norwich Event Hub">
<!-- Generic, not specific to the event -->
```

**Actual Results:** _______________

**Status:** [ ] FAIL (not optimized, as expected)

---

### Test 1.5: Venue Page Meta Tags
**Expected:** Generic meta tags

**Steps:**
1. Open: https://norwicheventshub.com/venue-detail.html?id=the-waterfront
2. View page source
3. Check meta tags

**Expected Results:**
- Generic title/description
- No venue-specific details

**Actual Results:** _______________

**Status:** [ ] FAIL (not optimized, as expected)

---

## 2. Post-Fix Verification Tests

**Purpose:** Validate fixes work correctly

### Test 2.1: CSP Fix - GA4 Loads
**Expected:** ✅ GA4 script loads without CSP errors

**Prerequisites:** CSP headers updated in `_headers`

**Steps:**
1. Deploy updated `_headers` to Cloudflare Pages
2. Wait 2 minutes for cache invalidation
3. Open homepage in incognito mode
4. Open DevTools → Network tab
5. Filter: "googletagmanager"
6. Refresh page

**Expected Results:**
```
✅ GET https://www.googletagmanager.com/gtag/js?id=G-XXX  Status: 200
✅ Console: "GA4 initialized with ID: G-XXXXXXXXXX" (if ID configured)
❌ Console: No CSP violation errors
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

**If FAIL, check:**
- [ ] `_headers` deployed correctly (check Cloudflare dashboard)
- [ ] Cache cleared (try Ctrl+Shift+R)
- [ ] Syntax correct (no typos in domains)

---

### Test 2.2: CSP Fix - Newsletter Works
**Expected:** ✅ Newsletter API calls not blocked

**Prerequisites:** 
- CSP headers updated
- `APP_CONFIG.NEWSLETTER_ENDPOINT` configured

**Steps:**
1. Open homepage (incognito)
2. Scroll to footer
3. Enter email: `test@example.com`
4. Open DevTools → Network tab
5. Click "Subscribe"

**Expected Results:**
```
✅ POST to newsletter endpoint - Status: 200 or 400 (not blocked)
❌ No CSP "connect-src" violation
✅ Console: No CSP errors
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL [ ] N/A (not configured)

---

### Test 2.3: AI Scraper Activated
**Expected:** ✅ Scraper runs and adds events to Sheet

**Prerequisites:** 
- GitHub Secrets added (GEMINI_API_KEY, GOOGLE_SHEET_ID, SERVICE_ACCOUNT_JSON)

**Steps:**
1. Go to GitHub → Actions tab
2. Select "AI Event Scraper" workflow
3. Click "Run workflow" → main branch
4. Wait for completion (2-5 minutes)
5. Check workflow log for errors
6. Open Google Sheet

**Expected Results:**
```
✅ Workflow: Green checkmark (success)
✅ Log: "Successfully scraped X events"
✅ Sheet: New rows added with today's date
✅ Events have: name, date, location, category
```

**Actual Results:** _______________

**Events Scraped:** _____  
**Quality Score Range:** _____  
**Status:** [ ] PASS [ ] FAIL

**If FAIL, check:**
- [ ] All 3 secrets added correctly
- [ ] Google Service Account has Sheet write access
- [ ] Gemini API key valid and has quota
- [ ] Workflow log for specific error messages

---

### Test 2.4: Fresh Event Data on Site
**Expected:** ✅ Website shows newly scraped events

**Prerequisites:** AI scraper ran successfully (Test 2.3)

**Steps:**
1. Wait 2-3 minutes after scraper completes
2. Open homepage (incognito to bypass cache)
3. Check "Featured This Week" section
4. Open one event detail page
5. Verify event is from scraper run (check Sheet timestamp)

**Expected Results:**
```
✅ Homepage shows events
✅ Events are future-dated
✅ At least some events match Sheet data
✅ No "Loading..." messages
```

**Actual Results:** _______________

**Events Displayed:** _____  
**Source:** [ ] Google Sheet [ ] Local JSON [ ] Both  
**Status:** [ ] PASS [ ] FAIL

---

### Test 2.5: Error State Rendering Fixed
**Expected:** ✅ Error message shows even when section is empty

**Prerequisites:** Updated `showErrorInContainer` function

**Steps:**
1. Open DevTools → Network tab
2. Right-click → "Block request URL" → Add `*sample-events.json*`
3. Right-click → "Block request URL" → Add `*script.google.com*`
4. Refresh homepage
5. Wait 15 seconds

**Expected Results:**
```
✅ "Featured This Week" section shows error message
✅ Error has warning icon (⚠️)
✅ Error has "Submit an Event" button
✅ No blank/empty sections
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

### Test 2.6: Dynamic Event Meta Tags
**Expected:** ✅ Event pages have event-specific meta

**Prerequisites:** `enhanceEventMeta` function added to `event-detail.js`

**Steps:**
1. Open: event-detail.html?id=evt-001
2. Wait for event to load
3. View page source (Ctrl+U)
4. Find `<title>`, `<meta name="description">`, `<meta property="og:title">`

**Expected Results:**
```html
✅ <title>Norwich Jazz Night - The Waterfront | Norwich Event Hub</title>
✅ <meta name="description" content="Norwich Jazz Night at The Waterfront on January 15, 2026...">
✅ <meta property="og:title" content="Norwich Jazz Night | Norwich Event Hub">
✅ <meta property="og:description" content="Live jazz performance...">
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

### Test 2.7: Social Media Sharing
**Expected:** ✅ Event preview shows event details

**Prerequisites:** Dynamic meta tags implemented (Test 2.6)

**Steps:**
1. Open event-detail.html?id=evt-001
2. Copy URL
3. Go to: https://www.opengraph.xyz/
4. Paste URL → Check preview
5. Try Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/

**Expected Results:**
```
✅ Title: Event name (not generic "Event Details")
✅ Description: Event description
✅ Image: Event image or default logo
✅ Preview looks professional
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

## 3. Browser DevTools Checks

### Test 3.1: Console Errors
**Expected:** ✅ No critical errors

**Steps:**
1. Open homepage
2. Open DevTools → Console
3. Refresh page
4. Review all messages

**Expected Results:**
```
✅ No red errors (exceptions allowed: analytics if not configured)
⚠️ Yellow warnings acceptable (e.g., "Newsletter endpoint not configured")
ℹ️ Blue info messages OK
```

**Actual Results:**

| Error Message | Severity | Acceptable? |
|---------------|----------|-------------|
| | | |

**Status:** [ ] PASS [ ] FAIL

---

### Test 3.2: Network Tab - API Calls
**Expected:** ✅ API calls succeed or fallback gracefully

**Steps:**
1. Open homepage
2. DevTools → Network tab
3. Filter: "XHR" and "Fetch"
4. Refresh page

**Expected Results:**
```
✅ Request to Google Apps Script URL (or sample-events.json)
✅ Status: 200 OK
✅ Response contains events array
⏱️ Response time: < 5 seconds
```

**Actual Results:**

| URL | Status | Time | Response |
|-----|--------|------|----------|
| | | | |

**Status:** [ ] PASS [ ] FAIL

---

### Test 3.3: Performance Tab
**Expected:** ✅ Fast load times

**Steps:**
1. Open homepage (incognito)
2. DevTools → Performance tab
3. Click Record
4. Refresh page
5. Stop recording after page loads
6. Check metrics

**Expected Results:**
```
✅ First Contentful Paint: < 2.5s
✅ Largest Contentful Paint: < 3.5s
✅ Total Load Time: < 4s
✅ No long tasks (> 50ms)
```

**Actual Results:**

| Metric | Value | Target | Pass? |
|--------|-------|--------|-------|
| FCP | | < 2.5s | |
| LCP | | < 3.5s | |
| TTI | | < 5s | |

**Status:** [ ] PASS [ ] FAIL

---

### Test 3.4: Application Tab - LocalStorage
**Expected:** ✅ Events cached properly (after smart cache fix)

**Steps:**
1. Open homepage
2. DevTools → Application → Local Storage
3. Expand: https://norwicheventshub.com
4. Check for keys

**Expected Results:**
```
✅ Key: norwichEvents (if configured to cache)
✅ Key: norwichEvents_timestamp (with smart cache)
✅ Value: Valid JSON array
✅ Timestamp: Recent (within last hour)
```

**Actual Results:**

| Key | Present? | Value Type | Age |
|-----|----------|------------|-----|
| norwichEvents | | | |
| norwichEvents_timestamp | | | |

**Status:** [ ] PASS [ ] FAIL [ ] N/A (if caching disabled)

---

## 4. Network Request Validation

### Test 4.1: Google Sheets API Call
**Expected:** ✅ Calls Google Apps Script, gets events

**Prerequisites:** `APP_CONFIG.USE_LOCAL_STORAGE = false`

**Steps:**
1. Temporarily set in `scripts/config.js`:
```javascript
USE_LOCAL_STORAGE: false,
GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ID/exec'
```
2. Deploy
3. Open homepage (incognito)
4. DevTools → Network
5. Find request to `script.google.com`

**Expected Results:**
```
✅ Request: GET https://script.google.com/macros/s/.../exec
✅ Status: 200
✅ Response: JSON with { success: true, events: [...] }
✅ Events array length: > 0
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL [ ] N/A (using local JSON)

---

### Test 4.2: Local JSON Fallback
**Expected:** ✅ Loads sample-events.json if API fails

**Steps:**
1. Open homepage
2. DevTools → Network
3. Find request to `data/sample-events.json`

**Expected Results:**
```
✅ Request: GET /data/sample-events.json
✅ Status: 200
✅ Response: JSON array with 15 events
✅ All events have: id, name, date, location, category
```

**Actual Results:**

| Field | Present in All? | Example Value |
|-------|-----------------|---------------|
| id | | |
| name | | |
| date | | |
| location | | |

**Status:** [ ] PASS [ ] FAIL

---

### Test 4.3: Analytics Tracking
**Expected:** ✅ GA4 tracking requests sent (if configured)

**Prerequisites:** 
- `APP_CONFIG.GA_MEASUREMENT_ID` set
- CSP allows googletagmanager

**Steps:**
1. Open homepage
2. DevTools → Network
3. Filter: "google-analytics" or "collect"
4. Navigate to different pages

**Expected Results:**
```
✅ Request to: https://region1.google-analytics.com/g/collect
✅ Params include: measurement_id, page_title, page_location
✅ No errors in Console
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL [ ] N/A (not configured)

---

### Test 4.4: Newsletter Submission
**Expected:** ✅ POST request to newsletter endpoint

**Prerequisites:** `APP_CONFIG.NEWSLETTER_ENDPOINT` configured

**Steps:**
1. Open homepage
2. DevTools → Network
3. Enter email in footer: `test@example.com`
4. Click "Subscribe"
5. Look for POST request

**Expected Results:**
```
✅ POST to newsletter endpoint
✅ Status: 200 (success) or 400 (validation error)
✅ Not blocked by CSP
✅ User sees success/error message
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL [ ] N/A (not configured)

---

## 5. Manual Smoke Tests

### Test 5.1: Homepage Load
**Expected:** ✅ All sections render

**Steps:**
1. Open: https://norwicheventshub.com
2. Wait for full load (no "Loading..." text)

**Expected Results:**
```
✅ Header with logo and nav
✅ Hero section
✅ "Tonight's Events" section (if applicable)
✅ "Featured This Week" section with events
✅ Category cards with descriptions
✅ "About" section
✅ Footer with newsletter form
✅ No blank/missing sections
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.2: Event Navigation
**Expected:** ✅ Can browse and view events

**Steps:**
1. From homepage, click any event card
2. Should navigate to event-detail.html?id=XXX
3. Event details should load
4. Click "Back" button
5. Try "Get Tickets" link (if present)

**Expected Results:**
```
✅ Event detail page loads
✅ Event name, date, time, location displayed
✅ Event description visible
✅ Countdown timer shows (if event is soon)
✅ "Event Snapshot" box with genre/vibe/crowd
✅ Back button returns to homepage
✅ Ticket link opens (in new tab)
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.3: Venue Pages
**Expected:** ✅ Venue detail pages work

**Steps:**
1. Open: venues.html
2. Click any venue card
3. Should navigate to venue-detail.html?id=XXX
4. Check venue information

**Expected Results:**
```
✅ Venue name and address displayed
✅ Description visible
✅ "Upcoming Events" section shows events at that venue
✅ Map or location info present
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.4: Category Pages
**Expected:** ✅ Category pages show filtered events

**Steps:**
1. Open: nightlife.html
2. Check events shown
3. Open: culture.html
4. Check events shown

**Expected Results:**
```
✅ Nightlife page: Only nightlife/gigs events
✅ Culture page: Only culture/theatre/arts events
✅ SEO content at top (description of category)
✅ Events are future-dated
```

**Actual Results:**

| Page | Events Shown | Correct Category? |
|------|--------------|-------------------|
| nightlife.html | | |
| culture.html | | |

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.5: This Weekend Page
**Expected:** ✅ Shows only weekend events

**Steps:**
1. Open: this-weekend.html
2. Check dates of events shown
3. Should be Sat-Sun of current/next weekend

**Expected Results:**
```
✅ Page title: "What's On This Weekend in Norwich"
✅ Events are Sat/Sun only
✅ Events are current or next weekend
✅ No weekday events shown
```

**Actual Results:** _______________

**Weekend Dates Shown:** _______________  
**Status:** [ ] PASS [ ] FAIL

---

### Test 5.6: Submit Event Form
**Expected:** ✅ Form validates and submits

**Steps:**
1. Open: submit.html
2. Fill out form with test data:
   - Event Name: "Test Event"
   - Date: (tomorrow's date)
   - Location: "Test Venue"
   - Category: "Community"
   - Description: "Test description"
3. Submit form

**Expected Results:**
```
✅ Form fields all present and labeled
✅ Required fields marked with *
✅ Date picker works
✅ Category dropdown has all options
✅ Submit button enabled
✅ On submit: Success message or redirect
✅ (Check Google Sheet for new row)
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.7: Mobile Responsiveness
**Expected:** ✅ Works on mobile viewport

**Steps:**
1. Open homepage
2. DevTools → Toggle device toolbar (Ctrl+Shift+M)
3. Select: iPhone 12 Pro
4. Test interactions

**Expected Results:**
```
✅ Mobile nav menu (hamburger icon)
✅ Event cards stack vertically
✅ Text is readable (not too small)
✅ Buttons are tappable (not too small)
✅ No horizontal scroll
✅ Images scale properly
```

**Actual Results:** _______________

**Status:** [ ] PASS [ ] FAIL

---

### Test 5.8: Cross-Browser Compatibility
**Expected:** ✅ Works in Chrome, Firefox, Safari

**Steps:**
1. Open homepage in each browser
2. Test basic functionality

**Expected Results:**

| Browser | Loads? | Events Show? | Styles OK? | JS Works? |
|---------|--------|--------------|------------|-----------|
| Chrome | | | | |
| Firefox | | | | |
| Safari | | | | |
| Edge | | | | |

**Status:** [ ] PASS [ ] FAIL

---

## 6. Results Checklist

### Critical Fixes (Must Pass)
- [ ] **CSP Fix:** GA4 loads without errors
- [ ] **CSP Fix:** Newsletter API not blocked
- [ ] **Data:** Events are future-dated (or scraper active)
- [ ] **Data:** Homepage shows events (not empty)

### High Priority (Should Pass)
- [ ] **Error States:** Show message even when section empty
- [ ] **Meta Tags:** Event pages have dynamic meta
- [ ] **Meta Tags:** Social sharing shows event details
- [ ] **AI Scraper:** Runs successfully and adds events to Sheet

### Medium Priority (Nice to Have)
- [ ] **Performance:** FCP < 2.5s, LCP < 3.5s
- [ ] **Caching:** Smart cache implemented (if configured)
- [ ] **Scraper:** Multiple sources yield events
- [ ] **SEO:** Sitemap submitted to search engines

### Overall Site Health
- [ ] All pages load without errors
- [ ] Navigation works (homepage → event → back)
- [ ] Forms validate and submit
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] No console errors (except known warnings)

---

## Test Results Summary

**Test Date:** _______________  
**Tested By:** _______________  
**Environment:** [ ] Local [ ] Staging [ ] Production

**Results:**
- Total Tests: 32
- Passed: _____
- Failed: _____
- N/A: _____

**Critical Issues Found:**

1. _______________
2. _______________
3. _______________

**Recommendation:**
- [ ] ✅ APPROVE for production
- [ ] ⚠️ APPROVE with minor issues (document below)
- [ ] ❌ DO NOT DEPLOY (fix critical issues first)

**Minor Issues to Address:**

1. _______________
2. _______________

**Sign-Off:**

**Developer:** _______________  
**QA:** _______________  
**Product Owner:** _______________  
**Date:** _______________

---

## Automated Testing (Future)

**Recommended Tools:**
- **Lighthouse CI:** Automated performance/SEO scoring
- **Playwright:** E2E testing for critical flows
- **Pa11y:** Automated accessibility testing
- **axe DevTools:** Accessibility audit

**Example Lighthouse CI Config:**
```json
{
  "ci": {
    "collect": {
      "url": ["https://norwicheventshub.com/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}],
        "categories:accessibility": ["error", {"minScore": 0.90}],
        "categories:seo": ["error", {"minScore": 0.90}]
      }
    }
  }
}
```

---

**Last Updated:** January 6, 2026  
**Document Version:** 1.0  
**See Also:** [Executive Summary](AUDIT_REPORT_EXECUTIVE_2026-01-06.md) | [Technical Report](AUDIT_REPORT_TECHNICAL_2026-01-06.md) | [Quick Wins](QUICK_WINS_CHECKLIST.md)

