# Google Sheets Real-Time Data Setup

## Current Status

✅ **Google Apps Script URL configured:** Your script is deployed and responding
❌ **Google Sheet not connected:** The script can't find the data sheet

---

## Quick Setup (5 minutes)

### Option 1: Use Your Existing Events Data (Recommended)

1. **Create a new Google Sheet:**
   - Go to https://sheets.google.com
   - Click "Blank" to create new sheet
   - Name it: "Norwich Event Hub - Events"

2. **Import your events data:**
   - In the sheet, go to File → Import
   - Choose "Upload" tab
   - Upload `data/sample-events.json` (you'll need to convert to CSV first, see below)

3. **OR Manually create the sheet structure:**

   Create these columns in row 1:
   ```
   eventid | eventname | date | time | location | category | description | ticketlink | status
   ```

   Example row 2:
   ```
   1 | Comedy Night | 2026-01-15 | 20:00 | The Playhouse | comedy | Stand-up comedy show | https://... | approved
   ```

4. **Important:** Make sure:
   - ✅ Column headers match exactly (lowercase, no spaces)
   - ✅ Status column = "approved" for events to show
   - ✅ Sheet is named "Sheet1" (or update Code.gs line 1)

5. **Connect the Apps Script:**
   - In your Google Sheet, go to Extensions → Apps Script
   - Delete any existing code
   - Copy the contents of `apps-script-deploy/Code.gs`
   - Paste it into the Apps Script editor
   - Click "Deploy" → "New Deployment"
   - Choose type: "Web app"
   - Settings:
     - Execute as: **Me**
     - Who has access: **Anyone**
   - Click "Deploy"
   - Copy the new Web App URL
   - Update `scripts/config.js` line 16 with the new URL

---

### Option 2: Quick Test with Empty Sheet

1. **Create Google Sheet** (see step 1 above)
2. **Add column headers** (see step 3 above)
3. **Add 2-3 test events** with status="approved"
4. **Connect Apps Script** (see step 5 above)

---

## Converting JSON to CSV

To upload your existing events from `data/sample-events.json`:

### Using Python (Quick):

```bash
cd "C:\Users\marc\Desktop\new company"
python -c "import json, csv
with open('data/sample-events.json') as f:
    data = json.load(f)
    events = data['events']
with open('events-import.csv', 'w', newline='', encoding='utf-8') as f:
    if events:
        writer = csv.DictWriter(f, fieldnames=events[0].keys())
        writer.writeheader()
        writer.writerows(events)
print('✅ Created events-import.csv')
"
```

Then import `events-import.csv` into your Google Sheet.

---

## Testing the Connection

Once set up:

1. **Open test page:** http://localhost:8000/test-api.html
2. **Click "Test Google Sheets API"**
3. **You should see:** ✅ Events loaded from Google Sheets

---

## Alternative: Use Local Mode for Now

If you want to launch quickly without Google Sheets:

1. **Edit `scripts/config.js` line 25:**
   ```javascript
   USE_LOCAL_STORAGE: true,  // Change false to true
   ```

2. **This will:**
   - ✅ Load events from `data/sample-events.json`
   - ✅ Site will work immediately
   - ❌ No real-time updates from Google Sheets
   - ❌ Form submissions won't be saved

You can switch to Google Sheets later without any code changes.

---

## Troubleshooting

**Error: "Sheet not found"**
- Make sure the sheet name is "Sheet1" (case sensitive)
- Or update `Code.gs` line 1: `const SHEET_NAME = 'YourSheetName';`

**Error: "Cannot read properties of null"**
- The Apps Script isn't bound to a spreadsheet
- Redeploy from within the Google Sheet (Extensions → Apps Script)

**No events returned**
- Check that events have `status` column = "approved" (lowercase)
- Verify column names match (eventid, eventname, date, time, location, category, description, ticketlink, status)

**CORS errors**
- Normal for Google Apps Script
- They handle CORS automatically
- If persists, check deployment settings (Anyone can access)

---

## Next Steps

After Google Sheets is connected:

1. ✅ Test API connection works
2. ✅ Verify events display on website
3. ✅ Deploy to Cloudflare Pages
4. ✅ Set up AI automation to update Google Sheets weekly

---

**Need Help?**
The test page at http://localhost:8000/test-api.html will show you exactly what's happening with detailed error messages.
