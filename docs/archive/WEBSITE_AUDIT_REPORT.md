# Norwich Event Hub - Website Audit Report
**Date:** December 29, 2025
**Website:** https://norwicheventshub.com
**Audited By:** Claude Code

---

## Executive Summary

The Norwich Event Hub website has a **solid foundation** with good information architecture and user-friendly navigation. However, it suffers from **critical functionality issues** that prevent it from serving its core purpose: displaying events to users.

### Overall Grade: **C-** (Needs Improvement)

**Critical Issues:** 3 🔴
**High Priority:** 5 🟡
**Medium Priority:** 6 🟠
**Low Priority:** 4 🟢

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. **Events Not Displaying on Live Site**
**Status:** BROKEN
**Impact:** Site cannot fulfill core purpose
**Pages Affected:** Homepage, Today, Directory

**Findings:**
- Homepage shows perpetual "Loading events..." state
- Today's Events page shows "No events found for today"
- Directory shows "Events directory coming soon"
- No actual event data is rendering on the live site

**Root Cause Analysis:**
- ✅ Local code fixes completed (property mismatch, date comparison)
- ❌ Fixes NOT deployed to live site yet
- ❌ Google Sheets API may not be returning data
- ❌ Possible CORS or API authentication issues

**Action Required:**
1. Deploy latest commits to production (2 commits pending)
2. Test Google Apps Script endpoint directly
3. Check browser console for JavaScript errors
4. Verify Google Sheets has approved events with correct property names

---

### 2. **Missing Alt Text on Logo Image**
**Status:** ACCESSIBILITY VIOLATION
**Impact:** Screen reader users cannot identify site branding
**WCAG Level:** A (Critical)

**Current Code:**
```html
<img src="assets/logo-image.jpg" alt="" class="logo-image" />
```

**Fix Required:**
```html
<img src="assets/logo-image.jpg" alt="Norwich Event Hub Logo" class="logo-image" />
```

**Files to Update:** All HTML pages (index.html, today.html, directory.html, submit.html, 404.html)

---

### 3. **Email Protection Breaking Accessibility**
**Status:** USER EXPERIENCE ISSUE
**Impact:** Contact emails obfuscated, difficult for assistive technology

**Findings:**
- All contact emails use Cloudflare protection: `/cdn-cgi/l/email-protection`
- Screen readers may not interpret these correctly
- Copy-paste functionality broken for users

**Recommendation:**
- Use alternative spam protection (honeypot fields, rate limiting)
- Display actual email addresses for accessibility
- Or provide a working contact form instead

---

## 🟡 HIGH PRIORITY ISSUES

### 4. **No Analytics or Tracking**
**Status:** MISSING
**Impact:** Cannot measure success or user behavior

**Recommendation:**
- Add Google Analytics 4 or privacy-focused alternative (Plausible, Fathom)
- Track key metrics: page views, event clicks, form submissions
- Set up conversion goals for event submissions

**Estimated Setup Time:** 30 minutes

---

### 5. **Missing Structured Data (Schema.org)**
**Status:** SEO OPPORTUNITY MISSED
**Impact:** No rich snippets in search results

**What's Missing:**
- Event schema for individual events
- Organization schema for site identity
- LocalBusiness schema for Norwich focus

**Potential Benefit:**
- Rich event cards in Google Search
- Better local SEO visibility
- Enhanced click-through rates

**Example Implementation:**
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Event Name",
  "startDate": "2026-01-15T19:00",
  "location": {
    "@type": "Place",
    "name": "Venue Name",
    "address": "Norwich, UK"
  }
}
```

---

### 6. **No Mobile Testing Evidence**
**Status:** UNKNOWN
**Impact:** 60%+ of users likely on mobile

**Cannot Verify:**
- Touch target sizes (min 44x44px)
- Mobile navigation functionality
- Form usability on small screens
- Image sizing and performance

**Action Required:**
- Test on actual mobile devices (iOS, Android)
- Use Chrome DevTools mobile emulator
- Test with slow 3G connection

---

### 7. **Form Validation Not Visible**
**Status:** USER EXPERIENCE GAP
**Page:** submit.html

**Issues:**
- File upload says "max 5MB" but no client-side validation shown
- Required fields marked with * but no inline error messages
- No confirmation of successful submission visible
- No indication of review timeline

**Recommendations:**
- Add real-time validation feedback
- Show file size/type errors before submission
- Add submission confirmation page or modal
- Clarify "Your event will be reviewed within 24-48 hours"

---

### 8. **External Links Missing Security Attributes**
**Status:** SECURITY RISK (Low)
**Impact:** Potential tabnabbing vulnerability

**Current Social Links:**
```html
<a href="https://www.instagram.com/norwicheventshub" target="_blank">Instagram</a>
```

**Should Be:**
```html
<a href="https://www.instagram.com/norwicheventshub"
   target="_blank"
   rel="noopener noreferrer">Instagram</a>
```

**Status in Codebase:** ✅ Already fixed in local code, needs deployment

---

## 🟠 MEDIUM PRIORITY ISSUES

### 9. **No Loading States or Error Handling**
**Impact:** Poor user experience when APIs fail

**Current Behavior:**
- Infinite "Loading events..." if API fails
- No retry mechanism
- No user-friendly error messages

**Recommendation:**
```javascript
// Show error after timeout
setTimeout(() => {
  if (eventsStillLoading) {
    showErrorMessage("Unable to load events. Please try again later.");
  }
}, 10000); // 10 seconds
```

---

### 10. **No Favicon Detected**
**Impact:** Unprofessional appearance in browser tabs

**Current Status:** Logo exists (`assets/logo-image.jpg`) but no favicon configured

**Files Needed:**
- favicon.ico (16x16, 32x32)
- favicon.svg (vector, modern browsers)
- apple-touch-icon.png (180x180, iOS)

**Add to HTML:**
```html
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
```

---

### 11. **Category Filter Functionality Unclear**
**Page:** directory.html

**Issues:**
- 8 category options but no indication of counts per category
- No "active" state visible on filters
- Unknown if filters work (no events to test)

**Recommendation:**
- Add event counts: "Nightlife (12)"
- Show active filter with visual indicator
- Allow multiple category selection

---

### 12. **No Date Range Picker**
**Page:** directory.html

**Current:** Month-by-month dropdown
**Better UX:** Calendar date range picker

**Recommendation:**
- Add start/end date pickers
- Show "This Weekend", "Next Week" quick filters
- Default to "Upcoming Events"

---

### 13. **Performance Not Optimized**
**Observations:**
- Multiple script files loading synchronously
- No lazy loading for images
- No asset minification visible

**Recommendations:**
- Defer non-critical JavaScript
- Lazy load event images
- Minify CSS/JS for production
- Consider CDN for static assets

---

### 14. **No Social Sharing Features**
**Impact:** Reduced viral growth potential

**Missing:**
- Share buttons for individual events
- "Share this event" functionality
- Twitter/Facebook meta tags (may exist, not visible in audit)

**Recommendation:**
- Add social share buttons to event cards
- Generate unique URLs for events
- Implement Open Graph tags for previews

---

## 🟢 LOW PRIORITY ISSUES

### 15. **No Search Functionality on Homepage**
**Impact:** Users must navigate to directory to search

**Recommendation:**
- Add search bar to homepage hero section
- Implement instant search suggestions
- Search by event name, venue, or keyword

---

### 16. **Limited Category Icons**
**Current:** Emoji icons (🌙, 🎭, 🤝, etc.)
**Better:** Custom SVG icons for brand consistency

**Recommendation:**
- Design custom icon set
- Match Norwich Event Hub brand colors
- Improve visual hierarchy

---

### 17. **No Newsletter Signup**
**Impact:** Cannot build email list for marketing

**Recommendation:**
- Add email signup form in footer
- Offer "Weekly Events Digest"
- Integrate with Mailchimp or similar

---

### 18. **404 Page Lacks Helpful Navigation**
**Current:** Generic error message
**Better:** Suggest popular pages, search, recent events

**Recommendation:**
- Show top 3 upcoming events
- Add search bar
- Link to popular categories

---

## ✅ WHAT'S WORKING WELL

### Strong Points:

1. **✅ Clean Information Architecture**
   - Clear navigation hierarchy
   - Logical page structure
   - Intuitive user flows

2. **✅ Good Visual Design Foundation**
   - Professional color scheme
   - Readable typography
   - Consistent branding

3. **✅ Comprehensive Form Design**
   - All necessary fields present
   - Clear submission guidelines
   - Multiple contact options

4. **✅ Multiple Event Discovery Paths**
   - Today's events
   - Full directory
   - Category browsing
   - Venue filtering

5. **✅ Mobile Menu Implementation**
   - Hamburger menu toggle
   - Responsive navigation

6. **✅ Security Awareness**
   - HTTPS in use (assumed)
   - Email obfuscation (though over-aggressive)
   - Cloudflare protection

7. **✅ AI Integration Ready**
   - Automated event aggregation configured
   - AI badge system implemented
   - Twice-daily scraping scheduled

8. **✅ Code Quality**
   - XSS prevention (HTML escaping)
   - URL sanitization
   - Proper security attributes on links

---

## 📊 PRIORITY ACTION PLAN

### Week 1: Critical Fixes
1. **Deploy pending commits** to production (bug fixes)
2. **Debug why events aren't showing** on live site
3. **Add alt text** to all images
4. **Test API endpoint** directly in browser
5. **Verify Google Sheets** has approved events

### Week 2: High Priority
6. **Set up analytics** (Google Analytics 4)
7. **Add structured data** for events
8. **Mobile device testing** across 3+ devices
9. **Improve form validation** with error messages
10. **Add favicon** and touch icons

### Week 3: Medium Priority
11. **Implement error handling** with user-friendly messages
12. **Optimize performance** (minify, defer scripts)
13. **Add social sharing** buttons
14. **Improve category filters** with counts
15. **Add loading states** throughout site

### Week 4: Enhancement
16. **Add newsletter signup**
17. **Implement search** on homepage
18. **Create custom icon set**
19. **Enhance 404 page**
20. **Monitor analytics** and iterate

---

## 🎯 IMMEDIATE NEXT STEPS

### **Step 1: Deploy Your Fixes**
```bash
git push origin master
```
Your local code has critical bug fixes that aren't live yet!

### **Step 2: Test the API Directly**
Visit this URL in your browser:
```
https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec?action=getEvents
```
Should return JSON with events. If not, debug the Apps Script.

### **Step 3: Check Browser Console**
1. Open norwicheventshub.com
2. Press F12 (Developer Tools)
3. Check Console tab for JavaScript errors
4. Check Network tab for failed API calls

### **Step 4: Verify Google Sheets**
1. Open your Google Sheet
2. Confirm "status" column has "approved" events
3. Check property names match: `eventname`, `date`, `time`, etc.
4. Ensure at least 1 event has date >= today

---

## 📈 SUCCESS METRICS TO TRACK

Once analytics are set up, monitor:

**Engagement:**
- Average session duration (target: >2 minutes)
- Pages per session (target: >2.5)
- Bounce rate (target: <60%)

**Conversions:**
- Event submissions per week (target: 5+)
- Click-through rate on event links (target: >15%)
- Social media follows from site (track via UTM)

**Performance:**
- Page load time (target: <3 seconds)
- Core Web Vitals (all green)
- Mobile usability score (target: 90+)

---

## 🔧 TECHNICAL DEBT TO ADDRESS

1. **Consolidate JavaScript files** - Too many separate scripts
2. **Implement build process** - Webpack/Vite for optimization
3. **Add TypeScript** - Better type safety for event objects
4. **Create component system** - Reusable event card, filter, etc.
5. **Set up CI/CD** - Automated testing and deployment
6. **Add unit tests** - Test event filtering, date parsing, etc.

---

## 💡 FEATURE SUGGESTIONS

**Short Term:**
- "Save event" / "Add to calendar" buttons
- Email notifications for new events in favorite categories
- Venue pages with all upcoming events

**Long Term:**
- User accounts and event RSVPs
- Venue partner portal for direct event submission
- Mobile app (React Native)
- Integration with Eventbrite/Ticketmaster APIs
- AI-powered event recommendations

---

## 📝 CONCLUSION

Norwich Event Hub has **strong potential** but needs immediate attention to its core functionality. The website's foundation is solid, with good UX design and thoughtful information architecture. However, **users cannot currently see any events**, which is a critical failure.

**Priority 1:** Deploy your bug fixes and get events displaying.
**Priority 2:** Add analytics to understand user behavior.
**Priority 3:** Improve accessibility and SEO for long-term growth.

The automated AI event aggregation system is a **unique differentiator** that can set this apart from other event listings. Once the technical issues are resolved, focus on growing event submissions and building a community around Norwich events.

---

**Questions or need help implementing these fixes?** Let me know which items you'd like to tackle first!
