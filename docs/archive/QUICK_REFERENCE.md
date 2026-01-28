# 📋 QUICK REFERENCE - Norwich Event Hub

## 🚀 Deploy to Production
```bash
git add .
git commit -m "update: sync events"
git push origin master
```
**Result**: Live in 2 minutes at https://norwicheventshub.com

---

## 🔄 Update Events (Daily)
```bash
# Full update (scrape + sync)
run-full-update.bat

# OR just sync from Google Sheets
node update-events.js
```

---

## 🤖 Run AI Scraper
```bash
cd automation
python norwich-intelligence-agent.py
```
**Result**: New events added to Google Sheets as "Pending"

---

## 🎨 Approve Events
1. Go to: https://norwicheventshub.com/admin
2. Click "Approve" or "Reject" for pending events
3. Events instantly update in Google Sheets

---

## 🔗 Important URLs

### Production
- **Website**: https://norwicheventshub.com
- **Admin**: https://norwicheventshub.com/admin
- **Submit**: https://norwicheventshub.com/submit

### Backend
- **Google Sheets**: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
- **API**: https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec

---

## 📊 Current Status (Jan 17, 2026)

### Events in System
- **Approved**: 4 events (live on website)
- **Pending**: 4 events (Epic Studios club nights)
- **Data File**: `data/sample-events.json` (populated ✅)

### Scrapers
- ✅ Python Intelligence Agent (Norwich Arts Centre, Theatre Royal, Epic Studios)
- ✅ Cloudflare Pages Function (Skiddle, Ents24, Theatre Royal)
- ⚠️ Run daily for fresh events

### API Status
- ✅ Google Apps Script responding
- ✅ Returns approved events in JSON
- ✅ Admin endpoints working

---

## 🛠️ Troubleshooting

### No Events Showing
```bash
# 1. Check data file
cat data/sample-events.json

# 2. Test API
curl https://script.google.com/.../exec

# 3. Update events
node update-events.js

# 4. Deploy
git push
```

### Scraper Errors
```bash
# 1. Check Python dependencies
pip install requests beautifulsoup4

# 2. Run scraper
cd automation
python norwich-intelligence-agent.py

# 3. Check Google Sheets for new events
```

### Admin Dashboard Issues
```bash
# 1. Check scripts/config.js
# 2. Verify USE_LOCAL_STORAGE: false
# 3. Test API in browser console
# 4. Clear browser cache (Ctrl+Shift+R)
```

---

## 📂 Key Files

### Data
- `data/sample-events.json` - Events displayed on website
- `events.json` / `events-final.json` - Historical data

### Scripts
- `scripts/config.js` - API configuration
- `scripts/force-reload.js` - Event loading logic
- `scripts/admin.js` - Admin dashboard

### Automation
- `automation/norwich-intelligence-agent.py` - AI scraper
- `update-events.js` - Sync from Google Sheets
- `run-full-update.bat` - Full update workflow

### Backend
- `Code.js` - Google Apps Script (deployed as Web App)
- `functions/scrape-events.js` - Cloudflare Pages Function

---

## 🎯 Daily Workflow

**Morning**: Run scraper (`python norwich-intelligence-agent.py`)
**Afternoon**: Approve events (admin dashboard)
**Evening**: Sync & deploy (`node update-events.js && git push`)

---

## 🔐 Access

### Admin Dashboard
- No password set yet (public access)
- Recommend adding authentication

### Google Sheets
- Your Google account only
- Contains ALL events (pending/approved/rejected)

### GitHub
- Your account only
- Push to deploy

---

## 📈 Next Steps

1. ✅ Deploy to production (NOW!)
2. ⏳ Approve pending Epic Studios events
3. ⏳ Set up daily automation (optional)
4. ⏳ Build additional pages
5. ⏳ Add more event sources

---

**Need Help?** Check these docs:
- `TONIGHT_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `COMPLETE_SETUP_TONIGHT.md` - Architecture overview
- `ARCHITECTURE.md` - System diagram

**Ready to launch! 🚀**
