# ✅ Setup Using Your Existing API Keys

## 🎉 Good News!

I modified the AI aggregator to use **Gemini** (which you already have) instead of requiring a separate Claude API subscription!

---

## ⚠️ FIRST: Security Issue

**You accidentally posted your API keys publicly.** Before using them here, you MUST get fresh ones:

### 1. Revoke the Old Keys (Do This NOW)

#### Gemini Key
1. Go to: https://aistudio.google.com/app/apikey
2. Delete the old key
3. Create a new one
4. Copy it (keep it safe!)

#### OpenAI Keys
1. Go to: https://platform.openai.com/api-keys
2. Delete both old keys
3. Create 1 new key
4. Copy it

#### YouTube & Facebook (if using)
- Revoke those too from their respective consoles
- Not needed for the event aggregator, but revoke for security

---

## 🚀 Setup Steps (5 Minutes)

### Step 1: Create Google Service Account

1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Click **APIs & Services** → **Enable APIs**
4. Search and enable:
   - **Google Sheets API**
   - **Google Drive API**
5. Go to **IAM & Admin** → **Service Accounts**
6. Click **Create Service Account**
7. Name it: `norwich-events-bot`
8. Click **Create and Continue**
9. Skip roles, click **Done**
10. Click on the service account you just created
11. Go to **Keys** tab
12. Click **Add Key** → **Create new key** → **JSON**
13. Download the JSON file
14. **Important:** Open the JSON file and copy the `client_email` value

### Step 2: Share Your Google Sheet

1. Open: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
2. Click **Share**
3. Paste the `client_email` from the JSON (looks like `norwich-events-bot@...`)
4. Set permission to **Editor**
5. Uncheck "Notify people"
6. Click **Share**

### Step 3: Add GitHub Secrets

Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions

Add these 4 secrets:

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `GEMINI_API_KEY` | Your **NEW** Gemini key | https://aistudio.google.com/app/apikey |
| `GOOGLE_SHEETS_CREDENTIALS` | **Entire JSON content** from service account | Open the downloaded JSON file, copy ALL of it |
| `GOOGLE_SHEET_ID` | `1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU` | Already have it |
| `EVENTBRITE_API_KEY` | Your Eventbrite key (optional) | https://www.eventbrite.com/platform/api |

**Optional:** If you prefer OpenAI instead of Gemini, add `OPENAI_API_KEY` with your **NEW** OpenAI key. The system will use Gemini by default, but fall back to OpenAI if Gemini isn't set.

---

## 🎯 Test It

### Option 1: GitHub Actions (Recommended)
1. Go to: https://github.com/marc420-design/norwich-event-hub/actions
2. Click **Daily AI Event Aggregation**
3. Click **Run workflow**
4. Wait 2-5 minutes
5. Check logs for success
6. Check your Google Sheet for new `AI-` events

### Option 2: Local Test
```bash
cd "C:\Users\marc\Desktop\new company\automation"

# Install dependencies
pip install -r requirements.txt

# Set environment variables (Windows PowerShell)
$env:GEMINI_API_KEY="your-new-gemini-key"
$env:GOOGLE_SHEET_ID="1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU"
$env:GOOGLE_SHEETS_CREDENTIALS="path\to\your\service-account.json"

# Run the aggregator
python ai-event-aggregator.py
```

---

## 💰 Costs

### Gemini API (Google)
- **FREE tier**: 60 requests per minute
- **Cost**: FREE for your usage!
- **Perfect for:** Your event aggregator (runs twice daily)

### OpenAI (Backup option)
- **Cost**: ~$0.002 per request with GPT-3.5
- **Monthly**: ~$0.12 for twice-daily runs
- **Use only if:** Gemini doesn't work for some reason

### Google Sheets API
- **Cost**: FREE
- **Quota**: 300 requests per minute per project

---

## ✅ What Happens Next

Once you add the GitHub Secrets:

1. **Automatic runs** at 6 AM & 6 PM UTC daily
2. **AI discovers events** from Eventbrite, Skiddle, Norwich Council, Visit Norwich
3. **Gemini processes** the raw event data
4. **High-quality events** auto-approved
5. **Events appear** on your website with "🤖 AI Discovered" badge

**Total cost: $0** (using Gemini free tier)

---

## 🆘 Troubleshooting

### "GEMINI_API_KEY not found"
→ Make sure you added it exactly as `GEMINI_API_KEY` in GitHub Secrets

### "Failed to upload to Google Sheets"
→ Verify you shared the sheet with the service account email

### "Invalid authentication credentials"
→ Make sure you pasted the ENTIRE JSON content, not just the client_email

### Still stuck?
→ Run the local test first to see detailed error messages

---

## 🎉 Summary

**Before (what you thought you needed):**
- Pay for Claude API subscription
- Additional monthly cost

**After (what you actually use):**
- Your existing Gemini API (FREE!)
- Or your existing OpenAI API (pennies per month)
- $0 additional cost!

**All set up and ready to go!** Just add those GitHub Secrets and you're done! 🚀
