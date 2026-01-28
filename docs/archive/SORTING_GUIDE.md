# Google Sheets Sorting Guide

## Method 1: Using Apps Script (Recommended - Easiest)

I've added 3 sorting functions to your `Code.js`. Here's how to use them:

### Step 1: Open Apps Script Editor

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
2. Click **Extensions** → **Apps Script**
3. You'll see your `Code.js` file

### Step 2: Copy Updated Code

1. Select all code in this file: `C:\Users\marc\Desktop\new company\Code.js`
2. Copy it
3. Paste it into the Apps Script editor (replace existing code)
4. Click **Save** (💾 icon)

### Step 3: Run Sorting Functions

Click on any function in the dropdown and press the ▶️ Run button:

#### **sortEventsByDate**
- Sorts events with newest dates first
- Within same date, earliest time first
- **Best for:** Viewing upcoming events chronologically

#### **sortEventsByStatus**
- Approved events first, then Pending
- Within each status, newest dates first
- **Best for:** Reviewing pending events quickly

#### **sortEventsByCategory**
- Groups by category (alphabetical)
- Within each category, newest dates first
- **Best for:** Managing events by type

### Quick Access

After running once, you can create a custom menu:

Add this at the end of `Code.js`:

```javascript
/**
 * Add custom menu when sheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Sort Events')
    .addItem('Sort by Date', 'sortEventsByDate')
    .addItem('Sort by Status', 'sortEventsByStatus')
    .addItem('Sort by Category', 'sortEventsByCategory')
    .addSeparator()
    .addItem('Setup Headers', 'setupHeaders')
    .addToUi();
}
```

Then you'll see "📊 Sort Events" menu in your Google Sheet toolbar!

---

## Method 2: Using CLI Tools (Advanced)

If you prefer command-line tools:

### Install Watermint Toolbox

**Windows:**
```powershell
# Download from https://github.com/watermint/toolbox/releases
# Extract to C:\watermint\
$env:PATH += ";C:\watermint\"
```

**macOS/Linux:**
```bash
# Download from https://github.com/watermint/toolbox/releases
chmod +x tbx
sudo mv tbx /usr/local/bin/
```

### Authenticate

```bash
tbx services google sheets auth
# Follow browser prompts to authenticate
```

### Sort Commands

**Export, sort locally, re-upload:**

```bash
# Export to CSV
tbx services google sheets sheet export \
  --sheet-id "1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU" \
  --sheet-name "Event Submissions" \
  --output events.csv

# Sort with command line (requires csvkit)
pip install csvkit
csvsort -c "Date" events.csv > events_sorted.csv

# Clear and re-upload
tbx services google sheets sheet clear \
  --sheet-id "1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU" \
  --sheet-name "Event Submissions"

tbx services google sheets sheet append \
  --sheet-id "1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU" \
  --sheet-name "Event Submissions" \
  --file events_sorted.csv
```

---

## Method 3: Using gspread (Python)

If you're comfortable with Python:

```python
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Authenticate
scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
client = gspread.authorize(creds)

# Open sheet
sheet = client.open_by_key('1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU')
worksheet = sheet.worksheet('Event Submissions')

# Sort by column (3 = Date column)
worksheet.sort((3, 'des'))  # Descending order
print("✅ Sorted by date!")
```

---

## My Recommendation

**Use Method 1 (Apps Script)** because:
- ✅ Already set up and deployed
- ✅ No installation needed
- ✅ One-click sorting from Google Sheets UI
- ✅ Can create custom menu for easy access
- ✅ No authentication setup required

The CLI tools are great for automation, but for quick manual sorting, the Apps Script functions are much faster!

---

## Common Sorting Scenarios

### "I want to see events I need to approve"
→ Run `sortEventsByStatus()` - Pending events at top

### "I want to see what's coming up next"
→ Run `sortEventsByDate()` - Soonest events at top

### "I want to review all nightlife events"
→ Run `sortEventsByCategory()` - Grouped by type

### "I want to auto-sort whenever new events are added"
→ Add this trigger in Apps Script:
1. Click ⏰ Triggers icon (left sidebar)
2. Add Trigger
3. Function: `sortEventsByDate`
4. Event: On change
5. Save

Now the sheet auto-sorts whenever data is added!

---

## Quick Reference

| What to Sort | Function | Result |
|-------------|----------|--------|
| By date | `sortEventsByDate()` | Newest → Oldest |
| By status | `sortEventsByStatus()` | Approved → Pending |
| By category | `sortEventsByCategory()` | A-Z categories |

All functions preserve your data and only rearrange rows!
