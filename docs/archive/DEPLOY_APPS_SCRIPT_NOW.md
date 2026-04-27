# 🚀 DEPLOY GOOGLE APPS SCRIPT - COPY & PASTE GUIDE

## ⚠️ IMPORTANT: Your New Deployment is EMPTY!

The URL you created has NO CODE in it. That's why it says "Script function not found".

Follow these steps **EXACTLY**:

---

## STEP 1: Open Google Apps Script Editor

1. Go to your Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
   ```

2. Click: **Extensions** → **Apps Script**

---

## STEP 2: Copy the Code

1. In the Apps Script editor, you'll see existing code
2. **SELECT ALL** (Ctrl+A / Cmd+A)
3. **DELETE** everything
4. Open the file `Code.js` from your project folder
5. **COPY ALL 438 LINES** from Code.js
6. **PASTE** into the Apps Script editor
7. Click the **SAVE** icon (💾) or press Ctrl+S
8. Wait for "Saved" message

---

## STEP 3: Create NEW Deployment

### ⚠️ IMPORTANT: Create a NEW deployment (not update old one)

1. Click **Deploy** dropdown (top right)
2. Select **New deployment**
3. Click the gear/cog icon ⚙️ next to "Select type"
4. Choose **Web app**

### Configure Settings:

```
Description: Norwich Event Hub API v3 (with doOptions)
Execute as: Me (your-email@gmail.com)
Who has access: Anyone
```

5. Click **Deploy**

---

## STEP 4: Authorize Access

Google will show security warnings - this is NORMAL:

1. Click **Authorize access**
2. Select your Google account
3. Click **Advanced** (bottom left)
4. Click **Go to Norwich Event Hub (unsafe)** ← This is safe, it's YOUR code
5. Click **Allow**
6. **COPY THE NEW URL** that appears

Example URL:
```
https://script.google.com/macros/s/AKfycby...NEW_ID_HERE.../exec
```

---

## STEP 5: Test the URL

Open your terminal and run:

```bash
curl "https://script.google.com/macros/s/YOUR_NEW_URL_HERE/exec"
```

### ✅ GOOD Response (should see this):
```json
{
  "success": true,
  "events": [
    {
      "eventname": "Norwich City FC vs Sheffield United",
      "date": "2026-01-10",
      ...
    }
  ]
}
```

### ❌ BAD Response (if you see this, you did something wrong):
```html
<!DOCTYPE html>
<html>
  Script function not found: doGet
</html>
```

If you get the BAD response, GO BACK TO STEP 2 and make sure you SAVED the code!

---

## STEP 6: Update Your Website Config

I'll do this for you automatically. Just tell me:

**"Update config with URL: https://script.google.com/macros/s/YOUR_NEW_URL_HERE/exec"**

---

## Quick Checklist

Before saying you're done, verify:

- [ ] I opened the Google Sheet
- [ ] I opened Apps Script editor (Extensions → Apps Script)
- [ ] I deleted ALL old code
- [ ] I copied ALL 438 lines from Code.js
- [ ] I pasted into Apps Script editor
- [ ] I clicked SAVE and saw "Saved" message
- [ ] I created NEW deployment (not updated old)
- [ ] I set "Who has access: Anyone"
- [ ] I authorized access
- [ ] I copied the NEW URL
- [ ] I tested with curl and got JSON (not HTML error)

---

## Why Your Current New URL Fails

Your URL: `https://script.google.com/macros/s/AKfycbzM2DYCw5UgmuiVVHjIJP9gycB4XtLNZkuxykhSF1f4DyMmOrGKR1cQAm51ljsCuBJ6pw/exec`

Returns: "Script function not found: doGet"

**Reason:** You created the deployment BEFORE pasting the code!

Google Apps Script deployed an EMPTY project, which has no doGet() function.

---

## The Correct Order

1. ❌ WRONG: Deploy → Paste code
2. ✅ RIGHT: Paste code → Save → Deploy

---

## Need Help?

If you get stuck, copy the exact error message and send it to me.

Common issues:
- "Script function not found" = You forgot to save the code
- "Unauthorized" = You didn't authorize properly
- HTML error page = Something went wrong with deployment

---

**GO DO IT NOW! Follow steps 1-5 above, then come back with your new URL.** 🚀
