# Google Sheet Setup - Step by Step Guide

## Quick Setup Instructions

### Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it: **Norwich Event Hub**
4. Rename the first tab to: **Event Submissions**

### Step 2: Add Column Headers

In row 1, add these columns (A through M):

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Event Name | Date | Time | Location | Category | Description | Ticket Link | Promoter Name | Promoter Email | Promoter Phone | Status | Event ID |

**Formatting (Optional):**
- Make row 1 bold
- Background color: #3AB8FF (Electric Blue)
- Text color: White

### Step 3: Deploy Google Apps Script

1. In your Google Sheet, click **Extensions > Apps Script**
2. Delete any default code
3. Copy the entire contents of `automation/google-apps-script.js`
4. Paste it into the script editor
5. Click the **Save** icon (disk icon) or press Ctrl+S
6. Name the project: **Norwich Event Hub API**

### Step 4: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the **gear icon** next to "Select type"
3. Choose **Web app**
4. Configure settings:
   - **Description**: "Norwich Event Hub API"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** > **Go to Norwich Event Hub API (unsafe)**
9. Click **Allow**
10. **COPY THE WEB APP URL** - it looks like:
    ```
    https://script.google.com/macros/s/AKfycby.../exec
    ```

### Step 5: Update API Configuration

Open `scripts/api.js` in your project and update lines 6-7:

**Before:**
```javascript
SUBMISSION_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
EVENTS_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
```

**After:**
```javascript
SUBMISSION_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec',
EVENTS_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec',
```

Also change line 14:
```javascript
USE_LOCAL_STORAGE: false
```

### Step 6: Test the Setup

1. Open the Web App URL in your browser
2. You should see a JSON response:
   ```json
   {"success":true,"events":[]}
   ```
3. If you see this, it's working!

### Step 7: Test Form Submission

1. Open `submit.html` in a browser (or your deployed site)
2. Fill out the event submission form
3. Click Submit
4. Check your Google Sheet - a new row should appear!
5. Check the promoter email - they should receive a confirmation

## Troubleshooting

### Error: "Script function not found: doPost"
- Make sure you saved the Apps Script
- Redeploy the web app

### Error: "Authorization required"
- You need to authorize the script
- Go back to Step 4 and complete the authorization

### Form submissions not appearing
- Check the Web App URL is correct in `scripts/api.js`
- Check browser console for errors (F12)
- Verify `USE_LOCAL_STORAGE` is set to `false`

### Email not sending
- Gmail might block the emails initially
- Check the Apps Script execution log:
  - Go to Apps Script editor
  - Click **Executions** on the left
  - Look for errors

## Manual Event Approval

To approve events manually:

1. Open your Google Sheet
2. Find the event row
3. Change the **Status** column (L) from "Pending" to "Approved"
4. The event will now appear on the website
5. The promoter will receive an approval email

## Sheet ID (for reference)

Your Google Sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

Save this ID for future integrations.

## Next Steps

Once Google Sheets is working:
1. ✅ Test form submissions
2. ✅ Verify emails are sending
3. ⏭️ Set up Make.com automation workflows
4. ⏭️ Create Canva templates
5. ⏭️ Connect social media accounts
