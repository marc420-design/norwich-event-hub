# 🏗️ Norwich Event Hub - System Architecture

## 🎯 Overview

Your Norwich Event Hub is a **hybrid static/dynamic system** that combines the speed of static sites with the power of API-driven content management.

---

## 📊 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
└─────────────────────────────────────────────────────────────────┘
              │                │                 │
              │                │                 │
      ┌───────▼──────┐  ┌─────▼──────┐  ┌──────▼───────┐
      │  AI Scraper  │  │Public Form │  │Manual Entry  │
      │              │  │            │  │              │
      │ Python/Node  │  │  Browser   │  │ Google UI    │
      └──────┬───────┘  └─────┬──────┘  └──────┬───────┘
             │                │                 │
             └────────┬───────┴─────────────────┘
                      │ POST /exec
                      │ (CORS: ✅ Works!)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE APPS SCRIPT API                        │
│  URL: script.google.com/macros/s/.../exec                       │
│  ─────────────────────────────────────────────────────────      │
│  doPost()  : Handle submissions & admin actions  ✅             │
│  doGet()   : Return events (CORS blocked in browser) ❌         │
│  doOptions(): Handle CORS preflight ⚠️                          │
│                                                                 │
│  Functions:                                                     │
│  • submitEvent()      - Add new event                           │
│  • updateEventStatus()- Approve/reject                          │
│  • getAllEvents()     - Export all events                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Read/Write
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS DATABASE                       │
│  Sheet Name: "Events" (or your sheet name)                      │
│  ─────────────────────────────────────────────────────────      │
│  Columns:                                                       │
│  • ID, Timestamp, Name, Date, Time, Location                    │
│  • Category, Description, Price, Flyer, Ticket Link            │
│  • Status (pending/approved/rejected)                           │
│  • Vibe, Crowd Type, Best For                                   │
│  • Promoter Name, Email, Phone                                  │
│                                                                 │
│  Benefits:                                                      │
│  ✅ Easy to view and edit                                       │
│  ✅ No database setup needed                                    │
│  ✅ Familiar interface                                          │
│  ✅ Can handle thousands of events                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Export (manual or automated)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSITE REPOSITORY (GitHub)                  │
│  ─────────────────────────────────────────────────────────      │
│  data/sample-events.json  ← Exported from Google Sheets         │
│  • Contains only approved events                                │
│  • Updated weekly/daily                                         │
│  • Version controlled with git                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Push to deploy
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE PAGES (Hosting)                    │
│  URL: norwicheventshub.com                                      │
│  ─────────────────────────────────────────────────────────      │
│  • Automatic deployment on git push                             │
│  • Global CDN (fast worldwide)                                  │
│  • Free SSL certificate                                         │
│  • Unlimited bandwidth (free tier)                              │
│  • Deploy time: ~1-2 minutes                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Serve static files
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WEBSITE                                 │
│  https://norwicheventshub.com                                   │
│  ─────────────────────────────────────────────────────────      │
│  Pages:                                                         │
│  • index.html         - Homepage with featured events           │
│  • today.html         - Events today                            │
│  • this-weekend.html  - Weekend events                          │
│  • venues.html        - Venue directory                         │
│  • submit.html        - Event submission form  ✅               │
│  • admin.html         - Admin dashboard  ✅                     │
│  • event-detail.html  - Individual event pages                  │
│  • venue-detail.html  - Individual venue pages                  │
│                                                                 │
│  JavaScript:                                                    │
│  • scripts/config.js      - API URL configuration               │
│  • scripts/api.js         - API integration functions           │
│  • scripts/force-reload.js- Event loading (from JSON)           │
│  • scripts/submit.js      - Form submission logic               │
│  • scripts/admin.js       - Admin dashboard logic               │
│  • scripts/home.js        - Homepage functionality              │
│                                                                 │
│  Data Source:                                                   │
│  • data/sample-events.json  ← Read by all pages  ✅             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ View in browser
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                          VISITORS                               │
│  • Browse events  ✅                                            │
│  • Submit events  ✅                                            │
│  • Search & filter  ✅                                          │
│  • View venues  ✅                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Scenarios

### Scenario 1: User Submits Event via Form

```
1. User fills form at norwicheventshub.com/submit
   ↓
2. JavaScript validates input (client-side)
   ↓
3. POST request sent to Google Apps Script
   • URL: /exec
   • Method: POST
   • Body: JSON with event data
   • CORS: ✅ Headers present, works!
   ↓
4. Apps Script receives request
   • doPost() function executes
   • Validates data (server-side)
   • Generates event ID (NEH-timestamp-random)
   ↓
5. Save to Google Sheets
   • Opens sheet by ID
   • Appends new row
   • Sets status = "pending"
   ↓
6. Return success response
   • JSON: {success: true, eventId: "..."}
   ↓
7. User sees confirmation message
   • "Event submitted successfully!"
   • "You'll receive email when approved"
   ↓
8. You review in admin dashboard or Google Sheets
   ↓
9. Approve or reject
   ↓
10. Export to sample-events.json
    ↓
11. Event appears on website
```

### Scenario 2: AI Scraper Adds Events

```
1. AI scraper runs (scheduled, e.g. daily)
   ↓
2. Scrapes events from:
   • Facebook Events
   • Eventbrite
   • Local venue websites
   • Instagram posts
   ↓
3. For each event found:
   • Extract data (name, date, venue, etc.)
   • Format as JSON
   • POST to Google Apps Script API
   ↓
4. Apps Script saves to Google Sheets
   • Status: "approved" (auto-approve scraped events)
   • Or "pending" (if you want to review)
   ↓
5. Daily export to sample-events.json
   ↓
6. Website updates automatically
```

### Scenario 3: You Manually Add Event

```
1. Open Google Sheets directly
   ↓
2. Add new row with event data
   ↓
3. Set status = "approved"
   ↓
4. Weekly export to sample-events.json
   ↓
5. Git commit and push
   ↓
6. Cloudflare auto-deploys
   ↓
7. Event appears on website (1-2 minutes)
```

### Scenario 4: Visitor Browses Website

```
1. Visitor goes to norwicheventshub.com
   ↓
2. Cloudflare serves static HTML/CSS/JS
   • Cached at edge (ultra-fast)
   • No server processing needed
   ↓
3. JavaScript loads sample-events.json
   • Local file, no API call
   • No CORS issues
   • Instant loading
   ↓
4. JavaScript filters & displays events
   • By date (today, this weekend, etc.)
   • By category (nightlife, culture, etc.)
   • By venue
   • By search query
   ↓
5. Visitor clicks event
   ↓
6. Event detail page shows
   • All event info
   • Ticket link
   • Venue info
   • Similar events
```

---

## 🔐 Security & Access Control

### Public Access
- ✅ View website (anyone)
- ✅ Submit events (anyone, requires approval)
- ✅ Search & browse (anyone)

### Admin Access
- 🔒 Admin dashboard (password protected - you need to add auth)
- 🔒 Google Sheets (your Google account)
- 🔒 Google Apps Script (your Google account)
- 🔒 GitHub repo (your account)
- 🔒 Cloudflare Pages (your account)

### API Access
- ✅ POST /exec (anyone - for submissions)
- ✅ GET /exec (anyone - but CORS blocks browser)
- 🔐 Admin actions (should add auth)

---

## ⚡ Performance Characteristics

### Website Loading
- **First load:** ~500ms (HTML + CSS + JS)
- **Events data:** ~100ms (local JSON file)
- **Images:** ~200-500ms each (external URLs)
- **Total:** ~1-2 seconds for full page

### API Response Times
- **Event submission:** ~1-2 seconds
- **Status update:** ~1-2 seconds
- **Fetch all events:** ~2-3 seconds

### Deployment
- **Git push to live:** ~1-2 minutes
- **Cache invalidation:** Instant (Cloudflare)

### Scalability
- **Website:** Unlimited visitors (Cloudflare CDN)
- **Google Sheets:** 5 million cells (~100,000+ events)
- **Apps Script:** 20,000+ API calls/day (free tier)

---

## 💰 Cost Breakdown

### Free Forever ✅
- **Cloudflare Pages:** Free tier (unlimited requests)
- **Google Apps Script:** Free (20k calls/day)
- **Google Sheets:** Free (storage limits very high)
- **GitHub:** Free (public repos)

### You Pay For
- **Domain name:** ~£10-15/year (norwicheventshub.com)

### Optional Upgrades (Not Needed)
- **Cloudflare Pro:** £20/month (not needed for your use case)
- **Google Workspace:** £4.60/month (not needed, free Sheets is fine)

---

## 🔧 Tech Stack Summary

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Functionality
- **No frameworks** - Fast, simple, maintainable

### Backend
- **Google Apps Script** - API & logic
- **Google Sheets** - Database
- **Node.js** (optional) - Build tools

### Hosting
- **Cloudflare Pages** - Website hosting
- **GitHub** - Version control
- **Git** - Deployment pipeline

### External Services
- **Google Apps Script API** - Event submissions
- **External image URLs** - Event flyers
- **(Optional) Google Analytics** - Visitor tracking

---

## 🎯 Why This Architecture?

### Pros ✅
1. **Free hosting** - No server costs
2. **Fast loading** - Static files on CDN
3. **Easy management** - Google Sheets is familiar
4. **Scalable** - Handles thousands of events
5. **No CORS issues** - Events served locally
6. **Simple deployment** - Git push = live
7. **Reliable** - Cloudflare + Google = 99.99% uptime
8. **SEO-friendly** - Static HTML pages
9. **No backend code** - Less complexity
10. **Easy backups** - Everything in git + Google Sheets

### Cons ❌
1. **Manual export** - Need to update JSON weekly (unless automated)
2. **GET CORS blocked** - Can't fetch events directly in browser
3. **No real-time updates** - Website shows snapshot
4. **Limited auth** - Admin dashboard needs authentication added

### Trade-offs 🤔
- **Real-time vs Speed:** Chose speed (static JSON)
- **Dynamic vs Cost:** Chose cost (free hosting)
- **Complex vs Simple:** Chose simple (Google Sheets)

---

## 🚀 Future Enhancements (Optional)

### Short Term
1. **Automated export** - GitHub Action (daily sync)
2. **Admin auth** - Password protection
3. **Email notifications** - On new submissions
4. **Image hosting** - Cloudflare Images
5. **Analytics** - Google Analytics integration

### Medium Term
6. **Social sharing** - Open Graph tags
7. **Event recommendations** - "You might also like"
8. **Venue profiles** - Enhanced venue pages
9. **Calendar export** - iCal/Google Calendar
10. **Mobile app** - PWA or native

### Long Term
11. **User accounts** - Saved favorites
12. **Ticket integration** - Sell tickets directly
13. **Payment processing** - Paid listings
14. **AI recommendations** - Personalized events
15. **Multi-city** - Expand beyond Norwich

---

## 📊 Monitoring & Maintenance

### Daily
- Check event submissions (if any)
- Approve/reject pending events

### Weekly
- Export events to JSON
- Review analytics
- Check for broken links/images

### Monthly
- Review popular events
- Update venue information
- Check API quota usage
- Monitor site speed

### Quarterly
- Review and update design
- Add new features based on feedback
- Backup Google Sheets
- Review and optimize images

---

## 🎓 Key Learnings

1. **CORS is tricky** - POST works, GET doesn't
2. **Static is fast** - Local JSON beats API calls
3. **Google Sheets is powerful** - Great as a simple database
4. **Free tiers are generous** - Can run this site forever free
5. **Hybrid approach works** - Best of static + dynamic

---

**Built with ❤️ for the Norwich community**
