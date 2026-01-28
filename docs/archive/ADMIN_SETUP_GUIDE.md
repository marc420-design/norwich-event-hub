# Admin Dashboard Setup Guide

## Overview
The admin dashboard allows you to approve/reject event submissions with one click, view all submissions, and track statistics.

---

## Step 1: Update Google Apps Script

1. **Open your Google Sheet**:
   - Go to: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit

2. **Open Script Editor**:
   - Click **Extensions > Apps Script**

3. **Replace Code**:
   - Delete all existing code
   - Copy ALL contents from `Code.js` (in your project folder)
   - Paste into the Apps Script editor

4. **Save**:
   - Click the save icon (💾) or press `Ctrl+S`

5. **Deploy Updates**:
   - Click **Deploy > Manage deployments**
   - Click the **Edit** icon (pencil) next to your existing deployment
   - Under "Version", select **New version**
   - Add description: "Added admin dashboard support"
   - Click **Deploy**
   - Copy the new **Web App URL** (it should be the same as before)

---

## Step 2: Access Admin Dashboard

1. **Open Admin Page**:
   - Navigate to: `https://norwicheventshub.com/admin.html`

2. **Dashboard Features**:
   - 📊 **Statistics**: See total, pending, approved, and rejected events
   - 🔍 **Filter Tabs**: Switch between Pending, Approved, Rejected, or All events
   - ✓ **Approve**: Click green "Approve" button to approve events
   - ✗ **Reject**: Click red "Reject" button to decline events
   - 🔄 **Auto-refresh**: Events reload automatically after actions

3. **Event Information Displayed**:
   - Event name and description
   - Category badge
   - Status badge (Pending/Approved/Rejected)
   - Date, time, and location
   - Promoter details (name, email)
   - Ticket link (if provided)
   - Submission timestamp

---

## Step 3: Enable Email Notifications

### Option A: Google Sheets Notifications (Recommended)

1. **Open your Google Sheet**
2. Click **Tools > Notification Rules**
3. Select:
   - **Notify me when**: "Any changes are made"
   - **Notify me with**: "Email - Right away"
4. Click **Save**

Now you'll receive an email whenever someone submits an event!

### Option B: Set Up a Dedicated Notification Email

Add this function to your `Code.js` and call it in `doPost()`:

```javascript
function notifyAdmin(eventData) {
  const adminEmail = 'YOUR_EMAIL@example.com'; // Change this!

  MailApp.sendEmail({
    to: adminEmail,
    subject: '🔔 New Event Submission - Norwich Event Hub',
    body: `
New event submission received!

Event: ${eventData.name}
Date: ${eventData.date}
Location: ${eventData.location}
Promoter: ${eventData.promoterName} (${eventData.promoterEmail})

Review at: https://norwicheventshub.com/admin.html
    `
  });
}
```

---

## Step 4: Bookmark Admin Dashboard

1. **Desktop**: Press `Ctrl+D` (Windows) or `Cmd+D` (Mac)
2. **Mobile**: Tap the share icon and "Add to Home Screen"

---

## Workflow Summary

1. **Someone submits an event** → Goes to Google Sheet with status "Pending"
2. **You receive notification** → Via email (if set up)
3. **Open admin dashboard** → https://norwicheventshub.com/admin.html
4. **Review pending events** → Click "Pending" tab
5. **Approve or Reject** → Click green ✓ or red ✗ button
6. **Auto-email sent** → Promoter receives approval confirmation
7. **Event goes live** → Appears on website instantly

---

## Security Notes

⚠️ **Important**: The admin dashboard has NO password protection. Anyone with the URL can access it.

### To Secure Your Dashboard:

**Option 1: Password Protect (Simple)**

Add this to the top of `admin.html` inside the `<script>` tag:

```javascript
const ADMIN_PASSWORD = 'your-secure-password-here';
const entered = prompt('Enter admin password:');
if (entered !== ADMIN_PASSWORD) {
    alert('Access denied');
    window.location.href = 'index.html';
}
```

**Option 2: Cloudflare Access Rules (Recommended)**

1. Go to Cloudflare Dashboard
2. Select your site: **norwicheventshub.com**
3. Navigate to **Security > WAF**
4. Create rule:
   - **Name**: "Admin Only"
   - **Field**: URI Path
   - **Operator**: equals
   - **Value**: `/admin.html`
   - **Action**: Block or Challenge

**Option 3: IP Whitelist**

Only allow access from your IP address via Cloudflare firewall rules.

---

## Troubleshooting

### "Sheet not found" Error
- Check that your Google Sheet ID is correct in `Code.js` line 21
- Make sure the sheet name is "Event Submissions"

### Events Not Loading
- Verify your Apps Script is deployed as a Web App
- Check that the Web App URL in `config.js` matches your deployment
- Make sure permissions are set to "Anyone" in deployment settings

### Approve/Reject Not Working
- Redeploy your Apps Script with a new version (Step 1.5)
- Clear browser cache and refresh
- Check browser console (F12) for error messages

### Email Not Sending
- Verify the promoter provided an email address
- Check Apps Script execution logs: **Extensions > Apps Script > Executions**
- Gmail may block emails if quota exceeded (100 emails/day limit)

---

## Next Steps

1. ✅ Update Code.js in Apps Script
2. ✅ Deploy new version
3. ✅ Test admin dashboard
4. ✅ Set up email notifications
5. ✅ Secure the dashboard (recommended)
6. ✅ Bookmark for quick access

---

## Support

If you encounter any issues:
1. Check browser console (F12) for errors
2. View Apps Script logs (**Executions** tab)
3. Verify all URLs match in config.js and deployment

---

**Your Admin Dashboard**: https://norwicheventshub.com/admin.html

**Google Sheet**: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
