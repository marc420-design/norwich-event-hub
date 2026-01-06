# Quick Wins Checklist - Norwich Event Hub
**Prioritized fixes you can implement right now**

---

## 5-Minute Fixes ⚡ (Do Immediately)

### 1. Fix CSP to Allow GA4 & Newsletter (5 min)

**Priority:** 🔴 CRITICAL - Blocks analytics and newsletter

**File:** `_headers`  
**Line:** 14

**Find this line:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://script.google.com https://script.googleusercontent.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://script.google.com https://script.googleusercontent.com; frame-ancestors 'none';
```

**Replace with:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://script.google.com https://script.googleusercontent.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://script.google.com https://script.googleusercontent.com https://www.googletagmanager.com https://region1.google-analytics.com https://api.convertkit.com https://api.mailchimp.com; frame-ancestors 'none';
```

**Changes:**
- Added `https://www.googletagmanager.com` to `script-src`
- Added `https://www.googletagmanager.com https://region1.google-analytics.com` to `connect-src`
- Added `https://api.convertkit.com https://api.mailchimp.com` to `connect-src` (for newsletter)

**Test:**
1. Deploy changes
2. Open homepage
3. Open DevTools → Network tab
4. Filter by "googletagmanager"
5. Should see successful requests (not blocked)

**Impact:** ✅ Enables analytics and newsletter signup

---

## 15-Minute Fixes 📋 (Do Today)

### 2. Activate AI Scraper (15 min)

**Priority:** 🟡 HIGH - Prevents data staleness

**Steps:**

#### Step 1: Get Gemini API Key (2 min)
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

#### Step 2: Add GitHub Secrets (10 min)
1. Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click "New repository secret" for each:

**Secret 1: `GEMINI_API_KEY`**
- Name: `GEMINI_API_KEY` (exact, case-sensitive)
- Value: Your key from Step 1

**Secret 2: `GOOGLE_SHEET_ID`**
- Name: `GOOGLE_SHEET_ID`
- Value: `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`

**Secret 3: `GOOGLE_SERVICE_ACCOUNT_JSON`**
- Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
- Value: Open `automation/google-service-account.json`, copy entire JSON (including `{ }` brackets)

#### Step 3: Test Workflow (3 min)
1. Go to: Actions tab
2. Click "AI Event Scraper" in left sidebar
3. Click "Run workflow" button (right side)
4. Select branch: `main`
5. Click "Run workflow" (green button)
6. Wait 2-5 minutes for completion
7. Look for green checkmark ✅

**Test Results:**
- Open your Google Sheet
- Should see new rows with scraped events
- Check website - new events should appear within 2-3 min

**Impact:** ✅ Fully automated event updates 4x per day

---

### 3. Refresh Sample Events (10 min - Alternative to #2)

**Priority:** 🟡 HIGH - Only if NOT activating AI scraper

**File:** `data/sample-events.json`

**Current:** Events dated Jan 7-18, 2026 (expires in 12 days)

**Option A: Quick Refresh (copy-paste)**
Update dates to Feb-March 2026:
- Change `"date": "2026-01-07"` to `"date": "2026-02-07"`
- Change `"date": "2026-01-08"` to `"date": "2026-02-08"`
- etc. for all 15 events

**Option B: Generate New Events**
Use AI to generate 30-50 realistic Norwich events for next 90 days

**Test:**
1. Open homepage
2. Verify "Featured This Week" shows events
3. Check "This Weekend" page
4. Verify all dates are future

**Impact:** ✅ Site stays fresh through March 2026

---

## 30-Minute Fixes 🔧 (Do This Week)

### 4. Fix Error State Rendering (30 min)

**Priority:** 🟡 MEDIUM - Improves UX in failure scenarios

**File:** `scripts/home.js`  
**Lines:** 31-48

**Find:**
```javascript
function showErrorInContainer(containerId, errorDetail) {
    const container = document.getElementById(containerId);
    if (container && container.querySelector('.event-card.placeholder')) {
        container.innerHTML = `
            <div class="event-card placeholder">
                <div class="event-image"></div>
                <div class="event-content">
                    <span class="event-date">Unable to load events</span>
                    <h3 class="event-title">${errorDetail.message || 'Please try again later'}</h3>
                    <p style="margin-top: 10px; color: #666;">
                        ${errorDetail.willRetry !== false ? 'Retrying automatically...' : 'Please refresh the page or check your connection.'}
                    </p>
                    <a href="submit.html" class="event-link" style="margin-top: 15px; display: inline-block;">Submit an Event →</a>
                </div>
            </div>
        `;
    }
}
```

**Replace with:**
```javascript
function showErrorInContainer(containerId, errorDetail) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Always show error, regardless of existing content
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 3rem 1rem; background: rgba(229, 57, 53, 0.1); border-radius: 12px; border: 1px solid rgba(229, 57, 53, 0.3);">
            <p style="font-size: 1.2rem; margin-bottom: 1rem; color: #E53935;">⚠️ ${errorDetail.message || 'Unable to load events'}</p>
            ${errorDetail.willRetry ? '<p style="color: #FFB74D;">Retrying automatically...</p>' : '<p style="color: rgba(255,255,255,0.7);">Please refresh the page or check your connection.</p>'}
            <p style="margin-top: 1.5rem;">
                <a href="submit.html" class="btn btn-primary" style="display: inline-block;">Submit an Event</a>
            </p>
        </div>
    `;
}
```

**Changes:**
- Removed check for existing placeholder card
- Always renders error message
- Improved styling for better visibility
- Clearer CTA to submit events

**Test:**
1. Disconnect from internet
2. Load homepage
3. Should see styled error message in each section
4. Click "Submit an Event" → should navigate to submit page

**Impact:** ✅ Better UX when APIs fail

---

### 5. Add Dynamic Meta Tags for Event Pages (30 min)

**Priority:** 🟡 MEDIUM - Improves SEO and social sharing

**File:** `scripts/event-detail.js`

**Add this function after `updatePageMetadata` (around line 270):**
```javascript
function enhanceEventMeta(event) {
    if (!event) return;
    
    // Update page title with event name
    document.title = `${event.name} - ${event.location || 'Norwich'} | Norwich Event Hub`;
    
    // Format date for meta
    const formattedDate = event.date ? formatDate(event.date) : '';
    const eventTime = event.time ? ` at ${event.time}` : '';
    
    // Update meta description with event details
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const desc = `${event.name} at ${event.location || 'Norwich'} on ${formattedDate}${eventTime}. ${event.description || ''} ${event.price ? 'Tickets: ' + event.price : ''}`;
        metaDesc.content = desc.substring(0, 160); // Keep under 160 chars
    }
    
    // Update or create OG tags
    updateOrCreateMeta('property', 'og:title', `${event.name} | Norwich Event Hub`);
    updateOrCreateMeta('property', 'og:description', event.description || `${event.name} at ${event.location}`);
    updateOrCreateMeta('property', 'og:image', event.image || 'https://norwicheventshub.com/assets/logo-image.jpg');
    updateOrCreateMeta('property', 'og:url', window.location.href);
    updateOrCreateMeta('property', 'og:type', 'event');
    
    // Update Twitter card
    updateOrCreateMeta('name', 'twitter:title', `${event.name} | Norwich Event Hub`);
    updateOrCreateMeta('name', 'twitter:description', event.description || `${event.name} at ${event.location}`);
    updateOrCreateMeta('name', 'twitter:image', event.image || 'https://norwicheventshub.com/assets/logo-image.jpg');
}

function updateOrCreateMeta(attr, name, content) {
    if (!content) return;
    
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}
```

**Then call it in `displayEventDetail` (around line 200):**
```javascript
// After building the HTML, add:
enhanceEventMeta(event);
```

**Test:**
1. Open event-detail.html?id=evt-001
2. View page source
3. Check meta tags have event-specific data
4. Share on Facebook/Twitter → preview should show event details

**Impact:** ✅ Better SEO and social sharing

---

### 6. Add Dynamic Meta for Venue Pages (20 min)

**File:** `scripts/venue-detail.js`

**Similar to #5 above, add:**
```javascript
function enhanceVenueMeta(venue) {
    if (!venue) return;
    
    document.title = `${venue.name} - Events & Info | Norwich Event Hub`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = `Discover upcoming events at ${venue.name} in Norwich. ${venue.description || ''} Address: ${venue.address || 'Norwich'}`;
    }
    
    updateOrCreateMeta('property', 'og:title', `${venue.name} | Norwich Event Hub`);
    updateOrCreateMeta('property', 'og:description', venue.description || `Events at ${venue.name}, Norwich`);
    updateOrCreateMeta('property', 'og:url', window.location.href);
}
```

**Call in your venue display function**

**Impact:** ✅ Better venue page SEO

---

## 1-Hour Fixes 🏗️ (Do This Week)

### 7. Set Up Build/Minification (1 hour)

**Priority:** 🟢 LOW - Performance optimization

**Create:** `build.sh` or add to `package.json`

```json
{
  "scripts": {
    "build": "npm run minify-css && npm run minify-js",
    "minify-css": "npx lightningcss --minify styles/*.css --output-dir dist/styles",
    "minify-js": "npx terser scripts/*.js --compress --mangle --output-dir dist/scripts"
  },
  "devDependencies": {
    "lightningcss-cli": "^1.22.0",
    "terser": "^5.26.0"
  }
}
```

**Update Cloudflare Pages:**
- Build command: `npm run build`
- Output directory: `dist`

**Impact:** ✅ ~40KB smaller, faster loads

---

### 8. Verify Scraper Selectors (1-2 hours)

**Priority:** 🟢 MEDIUM - Only matters if AI scraper active

**File:** `automation/ai-event-aggregator.py`

**Test each source:**

#### Skiddle (Lines 188-214)
1. Visit: https://www.skiddle.com/whats-on/Norwich/
2. Inspect HTML structure
3. Update selector on Line 202:
```python
# Current (placeholder):
event_cards = soup.find_all('div', class_='card')

# Update to actual selector (example):
event_cards = soup.find_all('article', class_='EventCard')
```

#### Norwich Council (Lines 230-256)
1. Visit: https://www.norwich.gov.uk/events
2. Inspect HTML structure
3. Update selector on Line 244:
```python
# Current (placeholder):
event_items = soup.find_all('div', class_='event-item')

# Update to actual selector
```

#### Visit Norwich (Lines 258-289)
1. Visit: https://www.visitnorwich.co.uk/whats-on/
2. Inspect HTML
3. Update selectors accordingly

**Test:**
```bash
cd automation
python ai-event-aggregator.py
```

Check output for successful event extraction

**Impact:** ✅ Higher event yield from scraping

---

## Copy-Paste Ready Code Snippets

### Snippet 1: Enhanced Error Function
**Location:** `scripts/home.js` (replace existing `showErrorInContainer`)

```javascript
function showErrorInContainer(containerId, errorDetail) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 3rem 1rem; background: rgba(229, 57, 53, 0.1); border-radius: 12px; border: 1px solid rgba(229, 57, 53, 0.3);">
            <p style="font-size: 1.2rem; margin-bottom: 1rem; color: #E53935;">⚠️ ${errorDetail.message || 'Unable to load events'}</p>
            ${errorDetail.willRetry ? '<p style="color: #FFB74D;">Retrying automatically...</p>' : '<p style="color: rgba(255,255,255,0.7);">Please refresh the page or check your connection.</p>'}
            <p style="margin-top: 1.5rem;">
                <a href="submit.html" class="btn btn-primary" style="display: inline-block;">Submit an Event</a>
            </p>
        </div>
    `;
}
```

### Snippet 2: Dynamic Event Meta
**Location:** `scripts/event-detail.js` (add after line 270)

```javascript
function enhanceEventMeta(event) {
    if (!event) return;
    
    document.title = `${event.name} - ${event.location || 'Norwich'} | Norwich Event Hub`;
    
    const formattedDate = event.date ? formatDate(event.date) : '';
    const eventTime = event.time ? ` at ${event.time}` : '';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const desc = `${event.name} at ${event.location || 'Norwich'} on ${formattedDate}${eventTime}. ${event.description || ''} ${event.price ? 'Tickets: ' + event.price : ''}`;
        metaDesc.content = desc.substring(0, 160);
    }
    
    updateOrCreateMeta('property', 'og:title', `${event.name} | Norwich Event Hub`);
    updateOrCreateMeta('property', 'og:description', event.description || `${event.name} at ${event.location}`);
    updateOrCreateMeta('property', 'og:image', event.image || 'https://norwicheventshub.com/assets/logo-image.jpg');
    updateOrCreateMeta('property', 'og:url', window.location.href);
    
    updateOrCreateMeta('name', 'twitter:title', `${event.name} | Norwich Event Hub`);
    updateOrCreateMeta('name', 'twitter:description', event.description || `${event.name} at ${event.location}`);
    updateOrCreateMeta('name', 'twitter:image', event.image || 'https://norwicheventshub.com/assets/logo-image.jpg');
}

function updateOrCreateMeta(attr, name, content) {
    if (!content) return;
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

// Call this in displayEventDetail:
// enhanceEventMeta(event);
```

### Snippet 3: Smart Cache Strategy
**Location:** `scripts/force-reload.js` (replace line 6)

```javascript
// Instead of always clearing:
// localStorage.removeItem('norwichEvents');

// Smart cache with timestamp:
const CACHE_TTL = 3600000; // 1 hour
const cachedData = localStorage.getItem('norwichEvents');
const cacheTimestamp = localStorage.getItem('norwichEvents_timestamp');
const cacheAge = Date.now() - (parseInt(cacheTimestamp) || 0);

// Only clear if cache is stale
if (cacheAge > CACHE_TTL) {
    localStorage.removeItem('norwichEvents');
    localStorage.removeItem('norwichEvents_timestamp');
} else {
    console.log(`Using cached events (age: ${Math.floor(cacheAge / 1000)}s)`);
}
```

**Then update localStorage save (around line 204):**
```javascript
localStorage.setItem('norwichEvents', JSON.stringify(data.events || []));
localStorage.setItem('norwichEvents_timestamp', Date.now().toString());
```

---

## Verification Checklist

### After Fix #1 (CSP Update):
- [ ] Deploy changes to Cloudflare Pages
- [ ] Open homepage in incognito mode
- [ ] Open DevTools → Network tab
- [ ] Look for `googletagmanager` requests
- [ ] Should see: Status 200 (not blocked)
- [ ] Check Console: No CSP violation errors
- [ ] Test newsletter form → Check for API POST request

### After Fix #2 (AI Scraper):
- [ ] Check GitHub Actions → Workflow run succeeded (green)
- [ ] Open Google Sheet → New rows added
- [ ] Wait 2-3 minutes
- [ ] Refresh homepage → New events should appear
- [ ] Check "Featured This Week" → Should have fresh events

### After Fix #3 (Event Data Refresh):
- [ ] Open homepage
- [ ] Verify all sections show events
- [ ] Check dates → All should be future
- [ ] Open "This Weekend" page → Should show weekend events
- [ ] Navigate to individual event → Should load correctly

### After Fix #4 (Error States):
- [ ] Disconnect from internet (or block API in DevTools)
- [ ] Load homepage
- [ ] Should see styled error messages in each section
- [ ] Error should have "Submit an Event" button
- [ ] Click button → Should navigate to submit page
- [ ] Reconnect → Page should auto-retry if configured

### After Fix #5 (Dynamic Meta):
- [ ] Open event-detail.html?id=evt-001
- [ ] View page source (Ctrl+U)
- [ ] Check `<title>` → Should have event name
- [ ] Check meta description → Should have event details
- [ ] Share URL on Facebook → Preview should show event info
- [ ] Share on Twitter → Card should show event details

---

## Time Investment Summary

| Fix | Priority | Time | Impact |
|-----|----------|------|--------|
| 1. CSP Headers | Critical | 5 min | High - Unblocks features |
| 2. AI Scraper | High | 15 min | High - Auto-updates |
| 3. Event Data | High | 10 min | High - Prevents staleness |
| 4. Error States | Medium | 30 min | Medium - Better UX |
| 5. Event Meta | Medium | 30 min | Medium - Better SEO |
| 6. Venue Meta | Medium | 20 min | Medium - Better SEO |
| 7. Minification | Low | 60 min | Low - Performance |
| 8. Scrapers | Low | 120 min | Low - Higher yield |

**Total Critical + High:** 30 minutes  
**Total All Fixes:** ~5 hours

---

## Ready-to-Deploy Checklist

Before `git push`:
- [ ] CSP headers updated in `_headers`
- [ ] All debug logs removed (already done ✅)
- [ ] Event data current (expires >7 days out)
- [ ] Sitemap updated (already done ✅)
- [ ] No linter errors
- [ ] Local test passed (`npm run dev`)

After deploy:
- [ ] Site loads at https://norwicheventshub.com
- [ ] Events display on homepage
- [ ] No console errors
- [ ] GA4 loads (if configured)
- [ ] Newsletter form works (if configured)
- [ ] Mobile responsive
- [ ] All pages accessible

---

**Last Updated:** January 6, 2026  
**Document Version:** 1.0  
**See Also:** [Executive Summary](AUDIT_REPORT_EXECUTIVE_2026-01-06.md) | [Verification Tests](AUDIT_VERIFICATION_TESTS.md)

