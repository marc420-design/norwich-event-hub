# Google Gemini API Setup Guide

Get your FREE Google Gemini API key to power the AI Event Aggregator.

## Why Gemini?

- **FREE Tier:** 60 requests per minute at no cost
- **Powerful:** Google's latest AI model
- **Easy Setup:** Get a key in 2 minutes
- **No Credit Card Required** (for free tier)

---

## Step-by-Step Setup

### Step 1: Go to Google AI Studio

Open your browser and visit:
```
https://makersuite.google.com/app/apikey
```

Or go to: https://aistudio.google.com/ and click "Get API key"

### Step 2: Sign In

- Sign in with your Google account
- You may need to agree to Terms of Service

### Step 3: Create API Key

1. Click **"Create API Key"** or **"Get API Key"**
2. You'll see a dialog with options:
   - **Option 1:** "Create API key in new project"
   - **Option 2:** "Create API key in existing project"
3. For simplicity, choose: **"Create API key in new project"**
4. Click **"Create API key"**

### Step 4: Copy Your API Key

1. You'll see your new API key (starts with something like: `AIza...`)
2. Click the **copy** icon or select and copy the entire key
3. **IMPORTANT:** Keep this key secret! Don't share it publicly.

### Step 5: Add to Your .env File

1. Open `automation/.env` in a text editor
2. Find the line that says:
   ```env
   GEMINI_API_KEY=
   ```
3. Paste your API key after the `=`:
   ```env
   GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Save the file

---

## Verify Your Setup

Your `.env` file should now look like this:

```env
# AI Provider
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Sheets
GOOGLE_SHEET_ID=1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
GOOGLE_SHEETS_CREDENTIALS=automation/google-credentials.json

# Configuration
SCRAPE_DAYS_AHEAD=90
MIN_QUALITY_SCORE=50
AUTO_APPROVE_THRESHOLD=80
NORWICH_RADIUS_KM=15
```

---

## Free Tier Limits

The Gemini API free tier includes:

- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

For the Norwich Event Hub aggregator, this is MORE than enough!

If you scrape 50 events, that's about 50 API calls. Well within the free limits.

---

## Alternative: Use OpenAI Instead

If you prefer to use OpenAI (ChatGPT) instead:

1. Go to: https://platform.openai.com/api-keys
2. Create an account and add payment info (OpenAI charges per request)
3. Create an API key
4. In your `.env` file, use:
   ```env
   OPENAI_API_KEY=sk-...
   ```
5. Leave `GEMINI_API_KEY` empty

**Note:** OpenAI is not free, but pricing is very low for typical usage (~$0.002 per event).

---

## Security Best Practices

### ✅ DO:
- Keep your API key in the `.env` file
- Add `.env` to `.gitignore` (already done)
- Rotate your key if you suspect it's compromised

### ❌ DON'T:
- Commit your API key to GitHub
- Share your API key publicly
- Include it in screenshots or documentation

---

## Troubleshooting

### Error: "API key not valid"
- Double-check you copied the entire key (no spaces)
- Make sure you enabled the Generative AI API in Google Cloud Console
- Try creating a new API key

### Error: "Quota exceeded"
- You've hit the free tier limit
- Wait for the quota to reset (daily limits reset at midnight Pacific Time)
- Consider upgrading to paid tier if needed (though unlikely for this use case)

### API Key Compromised?
1. Go back to: https://makersuite.google.com/app/apikey
2. Delete the old key
3. Create a new key
4. Update your `.env` file

---

## Next Steps

Now that you have your Gemini API key:

1. ✅ Complete Google Service Account setup (see GOOGLE_CREDENTIALS_SETUP.md)
2. ✅ Run the AI aggregator: `python automation/ai-event-aggregator.py`
3. ✅ Watch as AI discovers Norwich events automatically!

---

## Cost Estimate

**With Gemini Free Tier:**
- **Cost:** $0 per month
- **Can scrape:** ~1,500 events per day
- **Perfect for:** Norwich Event Hub (you'll scrape maybe 50-100 events per run)

**You're all set!** The free tier is more than enough for this project.
