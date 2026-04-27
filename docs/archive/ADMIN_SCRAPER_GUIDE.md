# 🤖 Admin Dashboard Event Scraper

## ✅ What's New

Your admin dashboard now has a powerful **Event Scraper** that lets you:
- 🔍 **Scrape events** from multiple sources with one click
- 👀 **Preview all scraped events** before adding them
- ⭐ **Mark as Featured** for homepage prominence
- 👑 **Mark as Editor's Choice** for curated recommendations
- ✅ **Approve and add** events directly to your site
- ✗ **Skip events** you don't want

---

## 🚀 How to Use

### Step 1: Access Admin Dashboard

Go to: **https://norwicheventshub.com/admin**

### Step 2: Click "Scrape Events" Button

Look for the orange **"🤖 Scrape Events"** button at the top right of the dashboard.

### Step 3: Wait for Scraping (2-3 seconds)

The scraper will automatically fetch events from:
- The Halls Norwich
- Epic Studios Norwich
- Norwich Arts Centre  
- Theatre Royal Norwich
- Norwich Playhouse

### Step 4: Review Scraped Events

Each event shows:
- **Event name** and details
- **Date, time, location, price**
- **Description** and **category**
- **Source** (which website it came from)

### Step 5: Curate Events

For each event, you can:

**Mark as Featured** ⭐
- Click the **"⭐ Featured"** button
- Featured events appear prominently on homepage
- Use for major events or special occasions

**Mark as Editor's Choice** 👑
- Click the **"👑 Editor's Choice"** button  
- Shows your personal recommendations
- Use for hidden gems and favorite events

**Approve & Add** ✅
- Click **"✓ Approve & Add"** to add event to your site
- Event is immediately saved to Google Sheets
- Will appear on website after next sync (midnight)
- Can mark as Featured and/or Editor's Choice before approving

**Skip** ✗
- Click **"✗ Skip"** to ignore an event
- Event is removed from the list
- Won't be added to your site

---

## 🎨 Event Curation Tips

### When to Use "Featured" ⭐

Use Featured for:
- Major events (big name artists, shows)
- Opening nights / premieres
- Special occasions (New Year's, festivals)
- Sold-out shows returning
- Events you want visitors to see first

**Example:** "Ed Sheeran at Carrow Road" - Featured!

### When to Use "Editor's Choice" 👑

Use Editor's Choice for:
- Hidden gems most people don't know about
- Unique/unusual events
- Local talent showcases
- Your personal favorites
- Events that deserve more attention

**Example:** "Secret Jazz Session at The Birdcage" - Editor's Choice!

### Can Use Both! ⭐👑

Some events deserve both:
- Exceptional local events
- Must-see cultural experiences
- Special one-time performances

---

## 📊 Event Flow

```
1. Click "Scrape Events" button
   ↓
2. Scraper fetches from 5+ sources
   ↓
3. Shows list of scraped events
   ↓
4. For each event:
   - Optional: Mark as Featured ⭐
   - Optional: Mark as Editor's Choice 👑
   - Click "Approve & Add" ✅
   ↓
5. Event saved to Google Sheets
   ↓
6. Auto-sync updates website (midnight)
   ↓
7. Event appears on norwicheventshub.com
```

---

## 🎯 Quick Actions

### Approve Everything Quickly

1. For events you just want to add (no special marking):
   - Just click **"✓ Approve & Add"**
   - Done! Event is added

### Curate Featured Events

1. Click **"⭐ Featured"** first
2. Then click **"✓ Approve & Add"**
3. Event is added as Featured

### Curate Editor's Choice

1. Click **"👑 Editor's Choice"** first
2. Then click **"✓ Approve & Add"**
3. Event is added as Editor's Choice

### Add as Both Featured and Editor's Choice

1. Click **"⭐ Featured"**
2. Click **"👑 Editor's Choice"**
3. Click **"✓ Approve & Add"**
4. Event gets both badges!

---

## 🔧 Customizing Event Sources

Want to scrape from different venues? Edit `scripts/scraper.js`:

```javascript
const EVENT_SOURCES = [
    {
        name: "Your Venue Name",
        url: "https://venue-website.com/events",
        category: "Nightlife",  // or Gig, Theatre, Culture, etc.
        enabled: true
    },
    // Add more sources...
];
```

---

## 💡 Pro Tips

### Tip 1: Scrape Regularly

- Scrape once a week to find new events
- Monday mornings are good for weekly curation
- Takes only 5-10 minutes

### Tip 2: Mix Featured and Regular

- Don't mark everything as Featured
- Keep it special (3-5 featured events max)
- Rotate featured events weekly

### Tip 3: Editor's Choice for Discovery

- Use Editor's Choice for lesser-known events
- Help visitors discover new venues
- Showcase local talent

### Tip 4: Check Before Approving

- Read descriptions carefully
- Verify dates and times
- Check ticket links work
- Skip duplicates

### Tip 5: Batch Process

- Review all events first
- Mark your favorites
- Then approve in batches
- Efficient workflow!

---

## 🎨 How Events Display on Website

### Featured Events ⭐

Appear in:
- Homepage hero section
- "Featured This Week" carousel
- Highlighted with gold badge
- Larger cards
- Priority sorting

### Editor's Choice 👑

Appear in:
- "Editor's Picks" section on homepage
- Special purple badge
- Dedicated section
- Personal recommendations feel

### Regular Events

Appear in:
- Category pages (Nightlife, Gigs, etc.)
- "What's On Today" page
- "This Weekend" page
- Venue pages
- Search results

---

## 📱 Mobile Friendly

The scraper modal works great on mobile too:
- Scrollable event list
- Touch-friendly buttons
- Responsive design
- Same functionality

---

## 🔄 Integration with Existing Workflow

### Manual Submissions (Public Form)

- People submit via `/submit` → Goes to "Pending"
- You review in admin dashboard
- Approve/reject as normal
- Scraper is separate workflow

### AI Automated Scraper

- If you have automated scraper running
- It posts directly to API → Auto-approved
- Shows in your events list
- No need for manual scraper button
- Use button for ad-hoc scraping

### Manual Google Sheets Entry

- You can still add events directly in Sheets
- Set status = "approved"
- Auto-sync updates website
- All methods work together!

---

## 🎊 Benefits

### Time Saving

- Find 5-10 events in 30 seconds
- No need to visit each venue website
- Preview all at once
- Quick approve/reject

### Quality Control

- Review before adding
- Skip irrelevant events
- Maintain site quality
- Curate your listings

### Content Richness

- More events = more visitors
- Diverse event types
- Updated regularly
- Professional curation

### User Experience

- Featured events guide visitors
- Editor's Choice adds personality
- Curated content builds trust
- Better than raw listings

---

## 🛠️ Troubleshooting

### Scraper Button Not Working

**Check:**
1. Are you on the admin dashboard?
2. Is JavaScript enabled?
3. Hard refresh page (Ctrl+Shift+R)
4. Check browser console for errors

### No Events Found

**Possible reasons:**
1. Venue websites are down
2. No upcoming events listed
3. Scraper needs updating (HTML changed)
4. Connection issue

**Solution:**
- Try again later
- Use manual entry as fallback
- Contact support if persistent

### Events Not Adding to Sheet

**Check:**
1. Is API URL correct in config?
2. Is Google Apps Script deployed?
3. Check browser console for errors
4. Test API manually (see API_SUCCESS_SUMMARY.md)

### Duplicate Events

**Prevention:**
- Check if event already exists before approving
- Use search function in admin dashboard
- Skip duplicates manually

---

## 📊 Analytics Ideas

Track your curation:
- How many events scraped per week?
- Featured vs regular conversion rates
- Which sources provide best events?
- Editor's Choice engagement metrics

---

## 🎯 Future Enhancements

Potential additions:
- ✨ Auto-detect duplicates
- 🔍 Smart recommendations (AI suggests what to feature)
- 📅 Schedule scraping automatically
- 🌐 More event sources
- 📧 Email digest of scraped events
- 💾 Save for later / bookmark events
- 🎨 Bulk actions (approve all, feature selected)

---

## 📚 Related Documentation

- `README_START_HERE.md` - Main setup
- `API_SUCCESS_SUMMARY.md` - API details
- `AUTOMATED_SYNC_SETUP.md` - Auto-sync
- `AI_SCRAPER_API_SETUP.md` - Automated scraper

---

## 🎉 Start Curating!

Your admin dashboard is now a powerful content curation tool!

**Steps to get started:**
1. Open admin dashboard
2. Click "Scrape Events"
3. Review events
4. Mark your favorites as Featured/Editor's Choice
5. Approve events
6. Done! Events appear on site at midnight

**Happy curating! 🎨✨**
