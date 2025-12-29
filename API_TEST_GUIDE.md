# API Testing Guide

## Quick Test Steps

### Step 1: Verify Headers in Google Sheet

1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit`
2. Make sure Row 1 has these headers (in order):
   - Timestamp
   - Event Name
   - Date
   - Time
   - Location
   - Category
   - Description
   - Ticket Link
   - Promoter Name
   - Promoter Email
   - Promoter Phone
   - Status
   - Event ID

**If headers are missing or wrong:**
1. Open Apps Script: https://script.google.com/home/projects/1zAyT9QofIXnD6QAh6C1A-mndLkpRpNvVRApUth9WWD6CeN9l3nT2UZLr/edit
2. Select function: `setupHeaders`
3. Click Run (▶️)
4. Authorize if needed
5. You'll see a success message!

---

### Step 2: Add Test Event to Google Sheet

1. Open your Google Sheet
2. Add a test event in Row 2:
   - **Event Name**: Test Event
   - **Date**: 2026-01-15
   - **Time**: 19:00
   - **Location**: Test Venue
   - **Category**: Music
   - **Description**: This is a test event
   - **Ticket Link**: https://example.com
   - **Promoter Name**: Test Promoter
   - **Promoter Email**: test@example.com
   - **Promoter Phone**: 01234567890
   - **Status**: approved (lowercase!)
   - **Event ID**: NEH-1234567890-123

**Important:** Status must be exactly "approved" (lowercase) for the event to appear!

---

### Step 3: Test API Connection

#### Option A: Using test-api-direct.html (Local)

1. Open `test-api-direct.html` in your browser
2. Click "Test GET (Fetch Events)"
3. You should see the test event in the response!

#### Option B: Direct URL Test

Open this URL in your browser:
```
https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec?debug=true
```

You should see JSON with:
- `success: true`
- `debug: true`
- `totalRows: 2` (header + 1 event)
- `headers: [...]`
- `firstDataRow: [...]`

#### Option C: Test from Website

1. Open `directory.html` in your browser
2. Events should load automatically from Google Sheets
3. Your test event should appear!

---

### Step 4: Test Form Submission

1. Open `submit.html` in your browser
2. Fill out the form with test data
3. Submit the form
4. Check your Google Sheet - a new row should appear!
5. Check the email address you entered - you should receive a confirmation email

---

## Troubleshooting

### API Returns Empty Events Array

**Problem:** `{"success": true, "events": []}`

**Solutions:**
1. ✅ Check that Status column is exactly "approved" (lowercase)
2. ✅ Verify headers are correct (run `setupHeaders()`)
3. ✅ Make sure there's at least one row with data below the header
4. ✅ Check that date format matches (YYYY-MM-DD)

### CORS Error

**Problem:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solutions:**
1. ✅ Make sure Apps Script deployment is set to:
   - Execute as: **Me**
   - Who has access: **Anyone**
2. ✅ Redeploy the Apps Script (create new version)
3. ✅ Update the URL in `config.js` if the deployment URL changed

### Headers Not Found

**Problem:** `Sheet not found` or headers are wrong

**Solutions:**
1. ✅ Run `setupHeaders()` function in Apps Script
2. ✅ Verify sheet name is exactly "Event Submissions"
3. ✅ Check that Sheet ID in `Code.js` matches your Google Sheet

### Form Submission Fails

**Problem:** Form shows error or doesn't submit

**Solutions:**
1. ✅ Check browser console for errors
2. ✅ Verify `config.js` has the correct API URL
3. ✅ Make sure Apps Script deployment allows POST requests
4. ✅ Check that all required fields are filled

---

## API Endpoints

### GET - Fetch Events
```
GET https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "timestamp": "2025-12-28T10:00:00.000Z",
      "eventname": "Test Event",
      "date": "2026-01-15",
      "time": "19:00",
      "location": "Test Venue",
      "category": "Music",
      "description": "This is a test event",
      "ticketlink": "https://example.com",
      "promotername": "Test Promoter",
      "promoteremail": "test@example.com",
      "promoterphone": "01234567890",
      "status": "approved",
      "eventid": "NEH-1234567890-123"
    }
  ]
}
```

### GET - Debug Mode
```
GET https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec?debug=true
```

**Response:**
```json
{
  "success": true,
  "debug": true,
  "totalRows": 2,
  "headers": ["Timestamp", "Event Name", ...],
  "firstDataRow": ["2025-12-28", "Test Event", ...]
}
```

### POST - Submit Event
```
POST https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec
Content-Type: application/json

{
  "name": "New Event",
  "date": "2026-02-01",
  "time": "20:00",
  "location": "Venue Name",
  "category": "Music",
  "description": "Event description",
  "ticketLink": "https://tickets.com",
  "promoterName": "Promoter Name",
  "promoterEmail": "promoter@example.com",
  "promoterPhone": "01234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event submitted successfully",
  "eventId": "NEH-1735392000000-456"
}
```

---

## Next Steps After Testing

1. ✅ **API Working?** → Move to deployment
2. ✅ **Form Submissions Working?** → Ready for launch
3. ✅ **Events Displaying?** → Add real events to Google Sheet
4. ✅ **All Tests Pass?** → Set up GitHub Secrets for automation

---

## Quick Checklist

- [ ] Headers set up correctly in Google Sheet
- [ ] At least one test event with Status = "approved"
- [ ] GET request returns events
- [ ] POST request creates new row in sheet
- [ ] Confirmation email received
- [ ] Events display on directory.html
- [ ] Form submission works end-to-end

**All checked? You're ready to deploy! 🚀**

