# 🧪 Testing Event Submission API

## Current Setup

Your website has:
- ✅ Event submission form at `/submit.html`
- ✅ API module (`scripts/api.js`) configured
- ✅ Google Apps Script with `doPost()` function
- ✅ Deployment URL: `https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec`

## Why POST Might Work (Even Though GET Doesn't)

POST requests with JSON body don't trigger CORS preflight in the same way as GET:
- **GET with custom headers** → Triggers OPTIONS preflight → CORS blocked ❌
- **POST with simple JSON** → May bypass preflight → Could work ✅

## Testing Plan

### Test 1: Direct API POST Test (PowerShell)

```powershell
$url = "https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec"
$testData = @{
    name = "Test Event"
    date = "2026-01-15"
    time = "19:00"
    location = "Test Venue, Norwich"
    category = "Nightlife"
    description = "This is a test event submission"
    ticketLink = "https://test.com"
    price = "£10"
    flyer = "https://test.com/flyer.jpg"
    vibe = "Commercial"
    crowd = "18-30"
    bestFor = "Testing"
    promoterName = "Test Promoter"
    promoterEmail = "test@test.com"
    status = "pending"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $url -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
$response.Content
```

### Test 2: Browser-Based Test (Check CORS)

Open browser console on your live site and run:

```javascript
fetch('https://script.google.com/macros/s/AKfycbzZBuNCIP-kO3llZAo0w64z-GSWIxcH7TKrcQ12gm7GAgjkan9Z-4vTEmk_SNDkWpLpbg/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Test Event",
    date: "2026-01-15",
    time: "19:00",
    location: "Test Venue",
    category: "Nightlife",
    description: "Test",
    ticketLink: "https://test.com",
    price: "£10",
    flyer: "https://test.com/flyer.jpg",
    promoterName: "Test",
    promoterEmail: "test@test.com"
  })
})
.then(r => r.json())
.then(d => console.log('✅ SUCCESS:', d))
.catch(e => console.error('❌ FAILED:', e));
```

## Expected Results

### If POST Works ✅
- PowerShell test: Returns `{"success": true, "eventId": "..."}`
- Browser test: No CORS error, submission succeeds
- **Action:** Deploy and test live submission form

### If POST Also Blocked ❌
- Browser test: Still shows CORS error
- **Action:** Need alternative solution (see below)

---

## Alternative Solutions If POST Fails

### Option 1: Server-Side Proxy (Best for Production)
Create a Cloudflare Worker that:
- Receives POST from your website
- Forwards to Google Apps Script (server-to-server, no CORS)
- Returns response to website

```javascript
// worker.js
export default {
  async fetch(request) {
    const data = await request.json();
    const response = await fetch('YOUR_APPS_SCRIPT_URL', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
```

### Option 2: Email-Based Submissions
- Form emails submission to `submit@norwicheventshub.com`
- You manually add to Google Sheets
- Simple, reliable, no API needed

### Option 3: Google Forms Integration
- Replace custom form with Google Forms
- Responses auto-save to Google Sheets
- No CORS issues, instant integration

### Option 4: Airtable/Notion API
- Use Airtable/Notion instead of Google Sheets
- Better API, no CORS issues
- Easy to integrate

---

## Next Steps

1. **Run Test 1** (PowerShell) to verify POST works server-side
2. **Run Test 2** (Browser) to check if CORS blocks POST
3. **Based on results:**
   - If works → Update form and go live
   - If blocked → Choose alternative solution

Let's test now!
