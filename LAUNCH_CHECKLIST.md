# 🚀 Norwich Event Hub - Complete Launch Checklist

Your comprehensive guide to launching Norwich Event Hub.

---

## Phase 1: Backend Setup (Week 1)

### Google Sheets & Apps Script
- [ ] **Create Google Sheet**
  - See: `GOOGLE_SHEET_SETUP.md`
  - Name: "Norwich Event Hub"
  - Tab: "Event Submissions"
  - Add all 13 columns (A-M)

- [ ] **Deploy Google Apps Script**
  - Copy code from `automation/google-apps-script.js`
  - Deploy as Web App
  - Set access to "Anyone"
  - Copy Web App URL

- [ ] **Update API Configuration**
  - Copy `scripts/config-template.js` to `scripts/config.js`
  - Add your Google Apps Script URL
  - Set `USE_LOCAL_STORAGE: false`
  - See: `API_SETUP.md`

- [ ] **Test Backend**
  - Submit test event via form
  - Check Google Sheet for new row
  - Verify confirmation email sent
  - Approve event (change Status to "Approved")
  - Check website displays approved event

**Estimated time**: 2-3 hours

---

## Phase 2: Git & Deployment (Week 1)

### Version Control
- [x] **Git Repository Initialized** ✅ (Already done!)
- [ ] **Push to GitHub**
  - See: `GIT_SETUP.md`
  - Create GitHub repository
  - Push code: `git push origin main`

### Cloudflare Pages Deployment
- [ ] **Create Cloudflare Pages Project**
  - Connect GitHub repository
  - Build settings:
    - Build command: (empty)
    - Output directory: `/`
  - Deploy

- [ ] **Configure Custom Domain**
  - Add `norwicheventshub.com`
  - Add `www.norwicheventshub.com`
  - Wait for SSL (automatic)

- [ ] **Add Environment Variables** (Optional)
  - `GOOGLE_APPS_SCRIPT_URL`
  - `SITE_URL`

- [ ] **Test Deployment**
  - Visit deployed URL
  - Test all pages load
  - Test form submission
  - Test event display
  - Check mobile responsiveness

**Estimated time**: 1-2 hours

---

## Phase 3: Social Media Setup (Week 1-2)

### Create Accounts
- [ ] **Instagram**
  - Create business account
  - Username: @norwicheventshub
  - Connect to Facebook Page
  - Add bio and profile picture
  - Add website link

- [ ] **Facebook**
  - Create Page: "Norwich Event Hub"
  - Category: "Entertainment Website"
  - Add profile and cover photos
  - Add contact email and website
  - Enable messaging

- [ ] **Twitter/X**
  - Username: @norwicheventshub
  - Add bio (160 chars max)
  - Add website link
  - Add profile and banner images

- [ ] **TikTok** (Optional)
  - Username: @norwicheventshub
  - Add bio and profile picture

### Prepare Content
- [ ] **Design Graphics in Canva**
  - Launch announcement graphic
  - Mission statement graphic
  - Event submission instructions
  - Story templates
  - See: `LAUNCH_CONTENT.md`

- [ ] **Write Launch Posts**
  - All content prepared in `LAUNCH_CONTENT.md`
  - Customize if needed
  - Schedule for launch day

- [ ] **Create Canva Templates**
  - Event post template (1080x1080)
  - Daily roundup template (1080x1920)
  - Weekly roundup template (1080x1350)
  - See: `branding/social-templates.md`

**Estimated time**: 3-4 hours

---

## Phase 4: Automation Setup (Week 2)

### Make.com Workflows
- [ ] **Create Make.com Account**
  - Sign up (free tier for testing)
  - See: `MAKE_SETUP_GUIDE.md`

- [ ] **Scenario 1: Event Submission**
  - Webhook trigger
  - Add to Google Sheets
  - Send confirmation email
  - Test with sample submission

- [ ] **Scenario 2: Auto-Posting**
  - Watch Google Sheets for "Approved"
  - Generate social media posts
  - Post to Instagram, Facebook, Twitter
  - Send approval email

- [ ] **Scenario 3: Daily Roundup** (Optional)
  - Schedule trigger: 9 AM daily
  - Get today's events
  - Create graphic (Canva)
  - Post to Instagram Story

- [ ] **Scenario 4: Weekly Newsletter** (Optional)
  - Schedule trigger: Monday 10 AM
  - Get week's events
  - Format HTML email
  - Send to subscribers

### API Connections
- [ ] **Instagram Business API**
  - Connect via Facebook Business
  - Get access token
  - Test posting

- [ ] **Facebook Pages API**
  - Connect Make.com to Page
  - Test posting

- [ ] **Twitter API**
  - Create developer account
  - Get API keys
  - Connect to Make.com

- [ ] **Canva API** (Optional)
  - Canva Pro required
  - Connect to Make.com
  - Link templates

**Estimated time**: 4-6 hours

---

## Phase 5: Content Population (Week 2-3)

### Add Initial Events
- [ ] **Research Norwich Events**
  - Check Skiddle, Eventbrite, Dice
  - Visit venue websites
  - Check Facebook events
  - Contact local promoters

- [ ] **Manual Event Entry**
  - Add 20-30 real events
  - Cover all categories:
    - Nightlife
    - Gigs
    - Theatre
    - Sports
    - Markets
    - Community
    - Free events
  - Set Status to "Approved"

- [ ] **Test Event Display**
  - Check events appear on directory
  - Test filtering by category
  - Test search functionality
  - Verify "What's On Today" works

**Estimated time**: 3-5 hours

---

## Phase 6: Pre-Launch Testing (Week 3)

### Technical Testing
- [ ] **Cross-Browser Testing**
  - Chrome
  - Firefox
  - Safari
  - Edge

- [ ] **Mobile Testing**
  - iOS Safari
  - Android Chrome
  - Test all pages
  - Test form submission

- [ ] **Performance Testing**
  - Page load speed
  - Image optimization
  - Mobile performance
  - Lighthouse score (aim for 90+)

### Functional Testing
- [ ] **Event Submission Flow**
  - Fill form completely
  - Submit
  - Check Google Sheet
  - Verify email received
  - Approve event
  - Check website displays event

- [ ] **Navigation**
  - Test all menu links
  - Test mobile menu
  - Test footer links

- [ ] **Event Filtering**
  - Filter by category
  - Filter by month
  - Search by keyword
  - Verify results correct

- [ ] **Error Handling**
  - Test 404 page
  - Try invalid form data
  - Check error messages

**Estimated time**: 2-3 hours

---

## Phase 7: Marketing & Outreach (Week 3-4)

### Build Partnerships
- [ ] **Contact Venues**
  - The Forum
  - Norwich Arts Centre
  - Waterfront Norwich
  - Theatre Royal
  - Local pubs/clubs
  - Offer free event listings

- [ ] **Contact Promoters**
  - Event organizers
  - Festival directors
  - Community groups
  - Sports clubs

- [ ] **Contact Press**
  - Email: press@norwicheventshub.com
  - Local newspapers (EDP, Norwich Evening News)
  - Radio (BBC Radio Norfolk, Future Radio)
  - Norwich blogs and websites

### Create Press Kit
- [ ] **Write Press Release**
  - Announce launch
  - Highlight benefits
  - Include quotes
  - Add contact info

- [ ] **Prepare Media Pack**
  - High-res logo
  - Screenshots
  - Fact sheet
  - Founder bio (if applicable)

**Estimated time**: 3-4 hours

---

## Phase 8: Launch Day! 🎉

### Morning (9:00 AM)
- [ ] **Final Checks**
  - Website loads correctly
  - All links work
  - Google Sheet connected
  - At least 20 events listed

- [ ] **Post Launch Announcement**
  - Instagram feed post
  - Facebook post
  - Twitter post
  - Instagram Story
  - See: `LAUNCH_CONTENT.md`

### Throughout the Day
- [ ] **Engage on Social Media**
  - Respond to comments
  - Answer DMs
  - Share to Stories
  - Thank supporters

- [ ] **Monitor Analytics**
  - Website traffic
  - Social engagement
  - Event submissions
  - Any errors or bugs

### Evening (6:00 PM)
- [ ] **Evening Post**
  - "Thank you" post
  - Share first day stats
  - Highlight top events
  - Encourage submissions

---

## Phase 9: First Week Operations

### Daily Tasks
- [ ] **Morning (9:00 AM)**
  - Check event submissions
  - Approve/reject new events
  - Post "What's On Today"
  - Respond to messages

- [ ] **Afternoon (2:00 PM)**
  - Feature an event
  - Engage with followers
  - Check analytics

- [ ] **Evening (6:00 PM)**
  - Evening event reminder
  - Schedule next day content

### Weekly Tasks (Monday)
- [ ] **Weekly Roundup**
  - Post "This Week in Norwich"
  - Send newsletter (if set up)
  - Review last week's analytics
  - Plan content for the week

---

## Phase 10: Growth & Optimization (Ongoing)

### Month 1
- [ ] **Achieve Milestones**
  - 100+ events listed
  - 500+ social followers
  - 50+ event submissions
  - 1,000+ website visitors

- [ ] **Gather Feedback**
  - User surveys
  - Promoter feedback
  - Venue partnerships
  - Feature requests

- [ ] **Optimize**
  - Improve based on analytics
  - Fix any issues
  - Enhance UX
  - Add requested features

### Month 2-3
- [ ] **Expand Features**
  - Mobile app (optional)
  - Email newsletter
  - Featured promoter profiles
  - Venue spotlight series

- [ ] **Monetization** (Optional)
  - Sponsored listings
  - Featured posts
  - Affiliate ticketing
  - Venue subscriptions

---

## 📊 Success Metrics

### Launch Week Goals
- [ ] 20+ events listed
- [ ] 100+ website visitors
- [ ] 250+ social media followers
- [ ] 10+ event submissions
- [ ] 5+ venue partnerships

### Month 1 Goals
- [ ] 100+ events listed
- [ ] 1,000+ website visitors
- [ ] 500+ social followers
- [ ] 50+ submissions
- [ ] 10+ venues featured

### Month 3 Goals
- [ ] 300+ events listed
- [ ] 5,000+ website visitors
- [ ] 2,000+ social followers
- [ ] 150+ submissions
- [ ] 25+ venue partnerships

---

## 🆘 Emergency Contacts & Resources

### Technical Issues
- **Cloudflare Support**: https://support.cloudflare.com/
- **Make.com Support**: https://community.make.com/
- **Google Workspace Support**: https://support.google.com/

### Documentation
- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `GOOGLE_SHEET_SETUP.md` - Backend setup
- `API_SETUP.md` - API configuration
- `MAKE_SETUP_GUIDE.md` - Automation setup
- `LAUNCH_CONTENT.md` - Social media content
- `GIT_SETUP.md` - Version control

### Useful Links
- Website: norwicheventshub.com
- GitHub: [your-repo-url]
- Cloudflare Dashboard: dash.cloudflare.com
- Make.com Dashboard: make.com/scenarios
- Google Sheet: [your-sheet-url]

---

## ✅ Launch Readiness Score

Count your checkmarks and calculate:

**Phase 1 (Backend)**: ___ / 4 items = ___ %
**Phase 2 (Deployment)**: ___ / 6 items = ___ %
**Phase 3 (Social)**: ___ / 8 items = ___ %
**Phase 4 (Automation)**: ___ / 10 items = ___ % (optional)
**Phase 5 (Content)**: ___ / 3 items = ___ %
**Phase 6 (Testing)**: ___ / 10 items = ___ %

**TOTAL READY**: ___ %

### Minimum to Launch: 70%
### Recommended to Launch: 85%
### Fully Optimized: 95%+

---

## 🎯 Your Launch Timeline

**Recommended Schedule**:

| Week | Focus | Hours | Status |
|------|-------|-------|--------|
| 1 | Backend + Deployment | 5-7 hrs | [ ] |
| 2 | Social Media + Automation | 7-10 hrs | [ ] |
| 3 | Content + Testing | 5-8 hrs | [ ] |
| 4 | Marketing + Launch | 3-5 hrs | [ ] |

**Total Time to Launch**: 20-30 hours over 4 weeks

---

## 🚀 Ready to Launch?

Once you've completed all critical items:

1. ✅ Website deployed and tested
2. ✅ Google Sheets backend working
3. ✅ Social media accounts created
4. ✅ 20+ events listed
5. ✅ Launch content prepared

**You're ready to go live!**

### Launch Day Command:
```bash
# Post this everywhere at 9 AM on launch day:
"🎉 NORWICH EVENT HUB IS LIVE! 🎉"
```

---

**Good luck! You've got this! 💙**

For questions: info@norwicheventshub.com
