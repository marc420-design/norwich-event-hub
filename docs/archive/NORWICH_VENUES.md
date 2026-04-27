# Norwich Venues - Complete Reference

## 🎫 Skiddle Venue IDs

These are the official Skiddle venue IDs for Norwich's major event venues:

| Venue | Skiddle ID | API Endpoint |
|-------|------------|--------------|
| **UEA The LCR** | 9132 | https://www.skiddle.com/api/v1/venues/9132/events/ |
| **University of East Anglia** | 59737 | https://www.skiddle.com/api/v1/venues/59737/events/ |
| **Waterfront (Norwich)** | 2003 | https://www.skiddle.com/api/v1/venues/2003/events/ |
| **Gonzo's Two Room** | 112257 | https://www.skiddle.com/api/v1/venues/112257/events/ |
| **Epic Studios** | 46430 | https://www.skiddle.com/api/v1/venues/46430/events/ |
| **NORWICH EPIC STUDIOS** | 124745 | https://www.skiddle.com/api/v1/venues/124745/events/ |

## 📍 Venue Details

### UEA The LCR (9132)
- **Type:** Student Union venue
- **Capacity:** ~1,200
- **Events:** Club nights, live music, comedy
- **Skiddle:** https://www.skiddle.com/venues/uea-the-lcr-norwich/9132/

### Waterfront (2003)
- **Type:** Live music venue
- **Capacity:** ~900
- **Events:** Rock, indie, alternative, touring bands
- **Skiddle:** https://www.skiddle.com/venues/waterfront-norwich/2003/

### Epic Studios (46430)
- **Type:** Multi-room nightclub
- **Capacity:** ~600
- **Events:** DnB, house, techno, student nights
- **Skiddle:** https://www.skiddle.com/venues/epic-studios-norwich/46430/
- **Note:** Has duplicate listing (124745)

### Gonzo's Two Room (112257)
- **Type:** Club/bar venue
- **Capacity:** ~200
- **Events:** Underground nights, DnB, alternative
- **Skiddle:** https://www.skiddle.com/venues/gonzos-tea-room-norwich/112257/

## 🎵 Other Major Norwich Venues

### The Halls Norwich
- **Website:** https://www.thehallsnorwich.com/
- **Type:** Live music venue
- **Events:** Touring bands, comedy, club nights

### Norwich Arts Centre
- **Website:** https://www.norwichartscentre.co.uk/
- **Type:** Arts venue
- **Events:** Live music, comedy, spoken word, film

### Norwich Playhouse
- **Website:** https://www.norwichplayhouse.co.uk/
- **Type:** Theatre
- **Events:** Theatre, dance, music, comedy

### Theatre Royal Norwich
- **Website:** https://www.theatreroyalnorwich.co.uk/
- **Type:** Major theatre
- **Events:** West End shows, ballet, opera

## 🔧 How Scraper Uses This

### With Skiddle API Key (Best)
```python
# Queries each venue directly for events
for venue_id in [9132, 2003, 46430, 112257, 59737, 124745]:
    events = skiddle_api.get_venue_events(venue_id)
```

**Expected results:** 20-50 events per run

### Without API Key (Fallback)
```python
# Web scrapes venue pages
urls = [
    "https://www.skiddle.com/venues/uea-the-lcr-norwich/9132/",
    "https://www.skiddle.com/venues/waterfront-norwich/2003/",
    # etc...
]
```

**Expected results:** 10-20 events per run

## 📊 Event Volume Estimates

| Venue | Typical Events/Week | Event Types |
|-------|---------------------|-------------|
| UEA The LCR | 2-4 | Student nights, DnB, house |
| Waterfront | 3-5 | Live bands, metal, rock |
| Epic Studios | 4-6 | Club nights, DnB, techno |
| Gonzo's | 2-3 | Underground, alternative |
| The Halls | 2-4 | Touring acts, comedy |

**Total Expected:** 15-25 events per week across all venues

## 🎯 Scraper Integration Status

✅ **Implemented (Jan 6, 2026):**
- All 6 Skiddle venue IDs added to scraper
- API endpoint queries for each venue
- Location-based backup search (10km radius)
- Web scraping fallback for all venues
- Automatic deduplication

⚠️ **Needs:**
- Valid Skiddle API key (optional but recommended)
- OR: Will work with web scraping (less events)

## 🔑 Getting a Skiddle API Key

**Free Tier Available!**

1. Go to https://www.skiddle.com/api/
2. Register for API access
3. Get your API key
4. Add to GitHub:
```powershell
gh secret set SKIDDLE_API_KEY --repo marc420-design/norwich-event-hub
```
5. Update workflow file to include it in env vars

**With API key:** 30-50 events per run  
**Without API key:** 10-20 events per run (web scraping)

## 📅 Scraper Schedule

Currently runs **once daily at 6am UTC** via GitHub Actions.

With these venues configured, expect:
- **Daily:** 2-5 new events discovered
- **Weekly:** 15-30 events in database
- **Monthly:** 60-120 events total

## 🎉 Result

With proper API keys (OpenAI + Skiddle), your site will have:
- ✅ Comprehensive Norwich event coverage
- ✅ All major venues included
- ✅ Automated daily updates
- ✅ 50-100+ events in database within 2 weeks

---

**Last Updated:** January 6, 2026  
**Venue Count:** 6 Skiddle venues + 4 other major venues  
**Status:** Integrated and ready to use

