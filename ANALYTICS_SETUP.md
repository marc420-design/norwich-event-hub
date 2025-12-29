# Analytics Setup Guide - Norwich Event Hub

This guide will help you set up analytics tracking for your website.

## Quick Setup Options

### Option 1: Google Analytics 4 (Recommended - Free)

**Time Required:** 10 minutes

1. **Create GA4 Property**
   - Go to https://analytics.google.com
   - Click "Admin" → "Create Property"
   - Enter property name: "Norwich Event Hub"
   - Select timezone and currency
   - Click "Create"

2. **Get Your Measurement ID**
   - In your new property, go to "Admin" → "Data Streams"
   - Click "Web" → "Add stream"
   - Enter website URL: `https://norwicheventshub.com`
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

3. **Add to Your Website**
   - Open `scripts/analytics.js`
   - Uncomment the GA4 section (lines starting with `/*`)
   - Replace `G-XXXXXXXXXX` with your actual Measurement ID
   - Add this script tag to the `<head>` section of all HTML files:
     ```html
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
     ```
   - Replace `G-XXXXXXXXXX` with your actual ID

4. **Test**
   - Deploy changes
   - Visit your website
   - Check GA4 Real-Time reports to see your visit

**What You'll Track:**
- Page views
- Event clicks
- Form submissions
- External link clicks
- User demographics (if enabled)

---

### Option 2: Plausible Analytics (Privacy-Focused - Paid)

**Time Required:** 5 minutes  
**Cost:** $9/month (or $99/year)

1. **Sign Up**
   - Go to https://plausible.io
   - Create account and add your domain: `norwicheventshub.com`

2. **Add Script**
   - Copy the script tag from Plausible dashboard
   - Add to `<head>` section of all HTML files:
     ```html
     <script defer data-domain="norwicheventshub.com" src="https://plausible.io/js/script.js"></script>
     ```

3. **Test**
   - Deploy changes
   - Visit your website
   - Check Plausible dashboard for real-time stats

**Benefits:**
- Privacy-friendly (GDPR compliant)
- No cookie banners needed
- Simple, clean interface
- No data processing agreements required

---

### Option 3: Cloudflare Web Analytics (Free if using Cloudflare)

**Time Required:** 2 minutes

1. **Enable in Cloudflare**
   - Log into Cloudflare Dashboard
   - Go to your domain → "Analytics" → "Web Analytics"
   - Click "Add a site"
   - Copy the provided script tag

2. **Add Script**
   - Add the script tag to `<head>` section of all HTML files

**Benefits:**
- Free if you're already using Cloudflare
- Privacy-focused
- No JavaScript required (works via Cloudflare's network)

---

## What's Already Tracked

The `analytics.js` file automatically tracks:

- ✅ **Form Submissions** - All form submissions
- ✅ **External Link Clicks** - Outbound links
- ✅ **Event Card Views** - When users view event details
- ✅ **Page Views** - Via analytics platform integration

## Custom Event Tracking

You can track custom events in your JavaScript:

```javascript
// Track a custom event
trackEvent('Category', 'Action', 'Label');

// Examples:
trackEvent('Event', 'TicketClick', 'New Year Party');
trackEvent('Navigation', 'CategoryFilter', 'Nightlife');
```

## Testing Your Setup

1. **Deploy your changes**
2. **Visit your website**
3. **Check your analytics dashboard:**
   - GA4: Real-Time → Overview
   - Plausible: Dashboard shows live visitors
   - Cloudflare: Web Analytics dashboard

## Next Steps

Once analytics is set up, monitor:
- **Traffic Sources** - Where visitors come from
- **Popular Events** - Which events get most clicks
- **Conversion Rate** - Form submission rate
- **User Behavior** - Which pages are most popular

---

**Need Help?** Check the analytics platform documentation or review `scripts/analytics.js` for implementation details.

