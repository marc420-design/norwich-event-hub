# 🔑 API Configuration Summary - Norwich Event Hub

**Last Updated:** January 6, 2026

---

## ✅ Currently Configured

### 1. Google Apps Script URL
**Status:** ✅ CONFIGURED  
**Location:** `scripts/config.js` (line 16)  
**Value:** `https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec`  
**Purpose:** Loads events from Google Sheets to website  
**Cost:** Free

---

### 2. Google Sheet ID
**Status:** ✅ CONFIGURED  
**Location:** `scripts/config.js` (line 19)  
**Value:** `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU`  
**Purpose:** Identifies which Google Sheet contains event data  
**Cost:** Free

---

### 3. Gemini AI API Key
**Status:** ✅ PROVIDED (needs to be added to GitHub Secrets)  
**Location:** GitHub Repository Secrets (not in code)  
**Secret Name:** `GEMINI_API_KEY`  
**Value:** `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`  
**Purpose:** Powers AI event scraping and categorization (primary)  
**Cost:** Free (60 requests/min limit)

**Action Required:**
1. Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GEMINI_API_KEY`
4. Value: `AIzaSyAh3DODANtBIinTFvR8x_rQn10JqR0tUUs`
5. Click "Add secret"

---

### 4. OpenAI API Key
**Status:** ✅ PROVIDED (needs to be added to GitHub Secrets)  
**Location:** GitHub Repository Secrets (not in code)  
**Secret Name:** `OPENAI_API_KEY`  
**Value:** `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`  
**Purpose:** Fallback AI provider if Gemini fails or rate-limited  
**Cost:** Pay-as-you-go (~$0.01 per 1000 events, typically $0-5/month)

**Action Required:**
1. Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Click "New repository secret"
3. Name: `OPENAI_API_KEY`
4. Value: (see above)
5. Click "Add secret"

**See:** [ADD_ALL_API_KEYS.md](ADD_ALL_API_KEYS.md) for complete setup with both AI providers

---

## ⏸️ Not Yet Configured (Optional)

### 5. Google Analytics 4 Measurement ID
**Status:** ⏸️ NOT CONFIGURED  
**Location:** `scripts/config.js` (line 39 - commented out)  
**Format:** `G-XXXXXXXXXX`  
**Purpose:** Track website traffic, user behavior, conversions  
**Cost:** Free

**To Configure:**
1. Create GA4 property at: https://analytics.google.com/
2. Copy Measurement ID (format: `G-XXXXXXXXXX`)
3. Edit `scripts/config.js`, line 39:
   ```javascript
   GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',  // Uncomment and add your ID
   ```
4. Update `_headers` file to allow GA4 (already documented in Quick Wins)

---

### 6. Newsletter Service Endpoint
**Status:** ⏸️ NOT CONFIGURED  
**Location:** `scripts/config.js` (line 42 - commented out)  
**Format:** `https://api.yourservice.com/subscribe`  
**Purpose:** Collect email signups from footer form  
**Cost:** Varies by provider (most have free tiers)

**Popular Options:**
- **ConvertKit:** `https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe`
- **Mailchimp:** `https://YOUR_DC.api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members`
- **Buttondown:** `https://api.buttondown.email/v1/subscribers`
- **EmailOctopus:** `https://emailoctopus.com/api/1.6/lists/YOUR_LIST_ID/contacts`

**To Configure:**
1. Sign up for a newsletter service
2. Get API endpoint and credentials
3. Edit `scripts/config.js`, line 42:
   ```javascript
   NEWSLETTER_ENDPOINT: 'https://your-endpoint.com/subscribe',
   ```
4. Update `_headers` file to allow your endpoint domain

---

### 7. Cloudflare Turnstile Site Key
**Status:** ⏸️ NOT CONFIGURED  
**Location:** `scripts/config.js` (line 45 - commented out)  
**Format:** `0x4AAAAAAA...`  
**Purpose:** Spam protection for forms (CAPTCHA alternative)  
**Cost:** Free (10M requests/month)

**To Configure:**
1. Go to: https://dash.cloudflare.com/
2. Select your site
3. Go to: Turnstile
4. Create a widget
5. Copy Site Key
6. Edit `scripts/config.js`, line 45:
   ```javascript
   TURNSTILE_SITE_KEY: '0x4AAAAAAA...',
   ```

---

## 🔐 GitHub Secrets Checklist

These should be added to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions

| Secret Name | Status | Required For | Have Value? |
|-------------|--------|--------------|-------------|
| `GEMINI_API_KEY` | ⏸️ To Add | AI Scraper (primary) | ✅ Yes |
| `OPENAI_API_KEY` | ⏸️ To Add | AI Scraper (fallback) | ✅ Yes |
| `GOOGLE_SHEET_ID` | ⏸️ To Add | AI Scraper | ✅ Yes |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ⏸️ To Add | AI Scraper | ❓ Need to create |

**Next Steps:**
1. ✅ Add `GEMINI_API_KEY` (you have it)
2. ✅ Add `OPENAI_API_KEY` (you have it - for fallback)
3. ✅ Add `GOOGLE_SHEET_ID` (you have it)
4. ❓ Create Service Account and add `GOOGLE_SERVICE_ACCOUNT_JSON`

See: [ADD_ALL_API_KEYS.md](ADD_ALL_API_KEYS.md) for complete guide with both AI providers

---

## 🌐 CSP (Content Security Policy) Updates Needed

**Current Status:** ⚠️ CSP blocks some external services

**File:** `_headers` (line 14)

**Required Updates:**

### For Google Analytics (when configured):
Add to CSP:
- `script-src`: Add `https://www.googletagmanager.com`
- `connect-src`: Add `https://www.googletagmanager.com https://region1.google-analytics.com`

### For Newsletter (when configured):
Add to CSP:
- `connect-src`: Add your newsletter endpoint domain

**Example Updated CSP:**
```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline' 
    https://script.google.com 
    https://script.googleusercontent.com 
    https://www.googletagmanager.com; 
  connect-src 'self' 
    https://script.google.com 
    https://script.googleusercontent.com 
    https://www.googletagmanager.com 
    https://region1.google-analytics.com 
    https://api.convertkit.com; 
  style-src 'self' 'unsafe-inline' 
    https://fonts.googleapis.com; 
  font-src 'self' 
    https://fonts.gstatic.com; 
  img-src 'self' data: https:; 
  frame-ancestors 'none';
```

**See:** [QUICK_WINS_CHECKLIST.md](QUICK_WINS_CHECKLIST.md) → Fix #1 for exact instructions

---

## 📊 Configuration Status Overview

```
Event Loading:           ✅ WORKING (Google Sheets → Website)
AI Event Scraping:       ⏸️ READY (needs 3 GitHub Secrets)
Analytics:               ⏸️ NOT CONFIGURED (optional)
Newsletter:              ⏸️ NOT CONFIGURED (optional)
Spam Protection:         ⏸️ NOT CONFIGURED (optional)
```

---

## 🚀 Priority Order

### Immediate (Do Now):
1. ✅ Add Gemini API Key to GitHub Secrets (5 min)
2. ✅ Add Google Sheet ID to GitHub Secrets (1 min)
3. ❓ Create & add Service Account JSON to GitHub Secrets (10 min)
4. ✅ Test AI Scraper workflow (5 min)

**Total Time:** 20 minutes  
**Result:** Fully automated event discovery!

### Optional (Later):
5. Add Google Analytics (10 min) - for traffic tracking
6. Add Newsletter service (15 min) - for email list
7. Add Turnstile (10 min) - for spam protection

---

## 🎯 What Each API Does

| API | What It Does | When It Runs | Visible To Users? |
|-----|--------------|--------------|-------------------|
| **Google Apps Script** | Serves events from Sheet to website | Every page load | No (behind the scenes) |
| **Gemini AI** | Scrapes & categorizes events (primary) | 4x per day (cron) | No (backend only) |
| **OpenAI** | Scrapes & categorizes events (fallback) | Only if Gemini fails | No (backend only) |
| **Google Sheets** | Stores event data | When scraper runs | No (data source) |
| **Google Analytics** | Tracks visitors, conversions | Every page load | No (analytics only) |
| **Newsletter API** | Saves email signups | When user subscribes | Yes (form submission) |
| **Turnstile** | Prevents spam bots | When user submits form | Yes (CAPTCHA widget) |

---

## 💰 Cost Breakdown

| Service | Tier | Monthly Cost | Limit |
|---------|------|--------------|-------|
| Cloudflare Pages | Free | $0 | Unlimited requests |
| Google Sheets API | Free | $0 | 100 reads/100 seconds/user |
| Gemini AI (primary) | Free | $0 | 60 requests/minute |
| OpenAI (fallback) | Pay-as-you-go | ~$0-5 | Depends on usage |
| Google Analytics | Free | $0 | 10M events/month |
| Newsletter | Free* | $0 | 500-1000 subscribers* |
| Turnstile | Free | $0 | 10M requests/month |

**Total:** ~$0-5/month 🎉 (mostly $0 if Gemini handles everything)

*Most newsletter services have free tiers for small lists

---

## 🔗 Quick Links

- **GitHub Secrets:** https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
- **Google Cloud Console:** https://console.cloud.google.com/
- **Google Analytics:** https://analytics.google.com/
- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Gemini API Keys:** https://makersuite.google.com/app/apikey

---

## 📞 Need Help?

**For AI Scraper Setup:** See [ADD_GEMINI_KEY_INSTRUCTIONS.md](ADD_GEMINI_KEY_INSTRUCTIONS.md)  
**For Quick Fixes:** See [QUICK_WINS_CHECKLIST.md](QUICK_WINS_CHECKLIST.md)  
**For Testing:** See [AUDIT_VERIFICATION_TESTS.md](AUDIT_VERIFICATION_TESTS.md)  
**For Overview:** See [AUDIT_REPORT_EXECUTIVE_2026-01-06.md](AUDIT_REPORT_EXECUTIVE_2026-01-06.md)

---

**Last Updated:** January 6, 2026  
**Next Action:** Add Gemini API Key to GitHub Secrets (5 minutes)

