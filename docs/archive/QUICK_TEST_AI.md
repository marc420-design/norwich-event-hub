# 🚀 Quick Test - AI Event Aggregator

Test the AI system in 5 minutes!

---

## Option 1: Test with OpenAI (Recommended - You Have the Key!)

### Step 1: Install Dependencies (2 min)
```bash
cd automation
pip install openai requests beautifulsoup4 python-dotenv
```

### Step 2: Test Run (3 min)
```bash
python ai-aggregator-openai.py
```

**What it does:**
- Scrapes Skiddle for 20 Norwich events
- Uses OpenAI GPT to parse and structure
- Validates and scores each event
- Saves results to JSON file

**Expected output:**
```
🚀 Starting AI Event Aggregator (OpenAI)
📡 Scraping event sources...
  Found 15 events from Skiddle
🤖 Processing with OpenAI GPT...
  Processing 1/10...
  Processing 2/10...
  ...
✔️ Validating...
🔍 Deduplicating...
✅ 8 unique events
⭐ Scoring quality...
💾 Saved to events_20251205_120000.json

📊 SUMMARY
==================================================
✅ Approved:  4
⏳ Pending:   4
📋 Total:     8
==================================================
```

### Step 3: Check Results
Open the generated JSON file to see the structured events!

**Cost**: ~$0.01-0.02 per run (very cheap!)

---

## Option 2: Test Scraping Only (No AI)

Just test if scraping works:

```python
python
>>> import requests
>>> from bs4 import BeautifulSoup
>>>
>>> url = "https://www.skiddle.com/whats-on/Norwich/"
>>> response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
>>> soup = BeautifulSoup(response.text, 'html.parser')
>>> print(f"Page loaded: {len(soup.text)} characters")
>>> print(f"Found {len(soup.find_all('a'))} links")
```

If this works, scraping is functional!

---

## What You Get

After running the test, you'll have:
- JSON file with structured Norwich events
- Each event with:
  - Name, date, time, location
  - Category (nightlife, gigs, culture, etc.)
  - Description
  - Quality score (0-100)
  - Status (Approved/Pending/Rejected)

---

## Next Steps

1. **✅ Test works?** → Set up Google Sheets integration
2. **✅ Results good?** → Schedule weekly automation
3. **✅ Ready?** → Follow `AI_AGGREGATOR_SETUP.md` for full setup

---

## Troubleshooting

**"OPENAI_API_KEY not found"**
- Check `.env` file exists in `automation/` folder
- Verify key is correct in the file

**"Module not found"**
- Run: `pip install openai requests beautifulsoup4 python-dotenv`

**"No events found"**
- Check internet connection
- Skiddle may have changed their HTML structure
- Try different source (Eventbrite, Council sites)

---

## Ready to Test?

```bash
cd automation
python ai-aggregator-openai.py
```

Takes 2-3 minutes, costs $0.01, shows you exactly what the system can do!
