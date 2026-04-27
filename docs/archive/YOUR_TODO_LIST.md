# ✅ Your Quick To-Do List

## ✅ DONE (By Claude)
- ✅ Updated GitHub Actions workflow (runs twice daily)
- ✅ Added auto-refresh to website (checks every 5 minutes)
- ✅ Added AI event badges to frontend
- ✅ Added sorting functions to Code.js
- ✅ Added custom menu to Google Sheets
- ✅ Created all documentation
- ✅ Committed and pushed to GitHub

**Status:** All code changes are live on GitHub! 🎉

---

## 🔴 YOU NEED TO DO (2 Quick Steps)

### Step 1: Update Your Google Apps Script (2 minutes)

1. **Open your Google Sheet:**
   https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU

2. **Click:** Extensions → Apps Script

3. **Select all code** in the editor (Ctrl+A)

4. **Open this file on your computer:**
   `C:\Users\marc\Desktop\new company\Code.js`

5. **Copy everything** from that file

6. **Paste it** in the Apps Script editor (replaces all code)

7. **Click Save** (💾 icon)

8. **Close the Apps Script tab**

9. **Refresh your Google Sheet** (F5)

**You'll now see:** "📊 Event Management" menu with sorting options!

---

### Step 2: Set Up AI Integration (5 minutes)

**Go to:** https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions

**Add these 2 secrets:**

#### Secret 1: `CLAUDE_API_KEY`
1. Go to: https://console.anthropic.com/
2. Login or sign up
3. Click "API Keys"
4. Create new key
5. Copy it (starts with `sk-ant-`)
6. Paste as secret value

#### Secret 2: `GOOGLE_SHEETS_CREDENTIALS`
1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable "Google Sheets API"
4. Go to: IAM & Admin → Service Accounts
5. Create Service Account
6. Download JSON credentials file
7. Open the JSON file in Notepad
8. Copy **ENTIRE** JSON content
9. Paste as secret value
10. **Important:** Share your Google Sheet with the email from the JSON (look for `client_email`)

#### Secret 3 (Optional): `EVENTBRITE_API_KEY`
1. Go to: https://www.eventbrite.com/platform/api
2. Create app
3. Copy private token
4. Paste as secret value

---

## 🎯 Test It Works

### Test the Sorting (Right Now)
1. Open your Google Sheet
2. Click "📊 Event Management"
3. Click "📅 Sort by Date"
4. Your events should reorganize!

### Test the AI Integration (After Step 2)
1. Go to: https://github.com/marc420-design/norwich-event-hub/actions
2. Click "Daily AI Event Aggregation"
3. Click "Run workflow"
4. Wait 2-5 minutes
5. Check your Google Sheet for new events with ID starting with `AI-`

### Test the Website Auto-Refresh
1. Open your website: https://norwich-event-hub.pages.dev/directory.html
2. Open browser DevTools (F12) → Console
3. You should see: `🔄 Auto-refresh enabled (checks every 5 minutes)`
4. Wait 5 minutes, you'll see: `🔄 Auto-refreshing events from Google Sheets...`

---

## 📊 What You'll See When It's Working

### In Google Sheets:
- "📊 Event Management" menu at the top
- Click it to sort your events instantly
- New AI events with IDs like: `AI-20250115-1`

### On Your Website:
- AI events show "🤖 AI Discovered" badge
- Console logs auto-refresh messages every 5 minutes
- Popup notification when new events are added

### On GitHub:
- Workflow runs automatically at 6 AM & 6 PM UTC
- Green checkmarks in Actions tab
- New events added to your sheet automatically

---

## 🆘 Need Help?

**Sorting not working?**
→ Make sure you updated the Apps Script (Step 1)

**AI integration not working?**
→ Check you added both GitHub Secrets (Step 2)

**Website not showing AI events?**
→ Make sure events are "Approved" in Google Sheet

**Still stuck?**
→ Check the detailed guides:
- `AI_SETUP_GUIDE.md` - Full setup instructions
- `SORTING_GUIDE.md` - Sorting help
- `REAL_TIME_AI_INTEGRATION.md` - How everything works

---

## ⏱️ Time Estimate

- **Step 1 (Google Apps Script):** 2 minutes
- **Step 2 (GitHub Secrets):** 5-10 minutes (first time)
- **Testing:** 5 minutes

**Total:** ~15 minutes to full automation! 🚀

---

## 🎉 After You're Done

Your system will:
- ✅ Discover events automatically twice daily
- ✅ Validate and score them with AI
- ✅ Add high-quality events to your sheet
- ✅ Update your website in real-time
- ✅ Show notifications to users
- ✅ Let you sort with one click

**All automated. Zero maintenance.** 🎯
