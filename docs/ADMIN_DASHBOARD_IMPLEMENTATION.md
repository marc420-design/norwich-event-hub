# Admin Dashboard Implementation Guide

## Overview
This guide provides the complete implementation for the enhanced Norwich Event Hub admin dashboard with:
1. **Three-button system**: Reject / Approve / Editor's Choice
2. **Manual scraper trigger button** that calls GitHub Actions
3. **Editor's Choice badge display** on events

---

## Backend Complete ✅

The Google Apps Script (`Code.js`) has been updated with:
- Editor's Choice column (column 19) in Google Sheets
- `updateEventStatus(eventId, status, editorsChoice)` function
- `triggerGitHubScraper(githubToken)` function for manual scraper runs

---

## Frontend Updates Needed

### 1. Update `scripts/admin.js`

Add these new functions to `scripts/admin.js`:

```javascript
// GitHub Personal Access Token for triggering scraper
// Create at: https://github.com/settings/tokens
// Required permission: workflow
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE'; // IMPORTANT: Add your token

/**
 * Approve event and optionally mark as Editor's Choice
 */
async function approveEvent(eventId, editorsChoice = false) {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateStatus',
        eventId: eventId,
        status: 'Approved',
        editorsChoice: editorsChoice
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast(edit orsChoice ? '⭐ Event approved as Editor\'s Choice!' : '✅ Event approved!', 'success');
      await loadEvents(); // Reload events
    } else {
      showToast('❌ Error: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error approving event:', error);
    showToast('❌ Error approving event', 'error');
  }
}

/**
 * Reject event
 */
async function rejectEvent(eventId) {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateStatus',
        eventId: eventId,
        status: 'Rejected',
        editorsChoice: false
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast('Event rejected', 'info');
      await loadEvents(); // Reload events
    } else {
      showToast('❌ Error: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error rejecting event:', error);
    showToast('❌ Error rejecting event', 'error');
  }
}

/**
 * Trigger manual scraper run via GitHub Actions
 */
async function triggerManualScraper() {
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
    showToast('❌ GitHub token not configured. Please add it to admin.js', 'error');
    return;
  }

  const confirmRun = confirm('Trigger manual scraper run? This will:\n\n' +
    '• Scrape events from all sources\n' +
    '• Process with OpenAI\n' +
    '• Add to Google Sheets (Pending status)\n' +
    '• Cost ~$0.02-0.05 in API fees\n\n' +
    'Continue?');

  if (!confirmRun) return;

  try {
    // Show loading state
    const scraperBtn = document.getElementById('manual-scraper-btn');
    if (scraperBtn) {
      scraperBtn.disabled = true;
      scraperBtn.innerHTML = '<span class="spinner"></span> Running Scraper...';
    }

    showToast('⏳ Triggering scraper workflow...', 'info');

    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'triggerScraper',
        githubToken: GITHUB_TOKEN
      })
    });

    const result = await response.json();

    if (result.success) {
      showToast('✅ Scraper workflow started! Check GitHub Actions for progress.', 'success');

      // Open GitHub Actions in new tab
      setTimeout(() => {
        window.open('https://github.com/marc420-design/norwich-event-hub/actions', '_blank');
      }, 2000);

      // Reload events after 30 seconds
      setTimeout(async () => {
        await loadEvents();
        showToast('Events reloaded', 'info');
      }, 30000);
    } else {
      showToast('❌ Error: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Error triggering scraper:', error);
    showToast('❌ Error triggering scraper', 'error');
  } finally {
    // Reset button state
    const scraperBtn = document.getElementById('manual-scraper-btn');
    if (scraperBtn) {
      scraperBtn.disabled = false;
      scraperBtn.innerHTML = '🤖 Run Scraper Now';
    }
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);

  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
```

---

### 2. Update `admin.html` - Add Manual Scraper Button

Find the admin header section (around line 30-50) and add the scraper button:

```html
<div class="admin-header">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1>🎭 Admin Dashboard</h1>
      <p>Manage event submissions for Norwich Event Hub</p>
    </div>
    <div>
      <button id="manual-scraper-btn" class="scraper-btn" onclick="triggerManualScraper()">
        🤖 Run Scraper Now
      </button>
    </div>
  </div>
</div>
```

---

### 3. Update Event Card Action Buttons

Find the event card rendering section and update the buttons to include three options:

```html
<!-- Replace existing approve/reject buttons with: -->
<div class="event-actions">
  <button class="btn-reject" onclick="rejectEvent('${event.eventid}')">
    ❌ Reject
  </button>
  <button class="btn-approve" onclick="approveEvent('${event.eventid}', false)">
    ✅ Approve
  </button>
  <button class="btn-editors-choice" onclick="approveEvent('${event.eventid}', true)">
    ⭐ Editor's Choice
  </button>
</div>
```

---

### 4. Update CSS Styles

Add these styles to the `<style>` section in `admin.html`:

```css
/* Scraper Button */
.scraper-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.scraper-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.scraper-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Loading Spinner */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Three-button System */
.event-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 1rem;
}

.btn-reject {
  background: #ef4444;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reject:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-approve {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-approve:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-editors-choice {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.btn-editors-choice:hover {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

/* Editor's Choice Badge */
.editors-choice-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-left: 8px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

/* Toast Notifications */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #1f2937;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s ease;
  max-width: 400px;
  font-weight: 500;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}

.toast-success {
  background: #10b981;
}

.toast-error {
  background: #ef4444;
}

.toast-info {
  background: #3b82f6;
}
```

---

### 5. Display Editor's Choice Badge on Event Cards

Update the event card title to show the badge:

```html
<h3 class="event-title">
  ${event.name || event.eventname}
  ${event.editorschoice === 'Yes' ? '<span class="editors-choice-badge">⭐ EDITOR\'S CHOICE</span>' : ''}
</h3>
```

---

## Setup Instructions

### Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `Norwich Event Hub Admin Scraper`
4. Expiration: Choose your preferred duration
5. Select scope: ✅ `workflow` (allows triggering GitHub Actions)
6. Click "Generate token"
7. **IMPORTANT**: Copy the token immediately (starts with `ghp_...`)

### Step 2: Add Token to admin.js

1. Open `scripts/admin.js`
2. Find line: `const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';`
3. Replace with your token: `const GITHUB_TOKEN = 'ghp_xxxxxxxxxxxxx';`
4. Save the file

### Step 3: Update Google Apps Script

1. The `Code.js` file has already been updated and committed
2. You need to **redeploy** the Google Apps Script:
   - Open: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
   - Extensions → Apps Script
   - Click "Deploy" → "New deployment"
   - Select type: "Web app"
   - Description: "Admin dashboard with Editor's Choice"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the new Web App URL (if changed)

### Step 4: Test the System

1. **Test Editor's Choice**:
   - Log into admin dashboard
   - Find a pending event
   - Click "⭐ Editor's Choice" button
   - Verify event status changes to "Approved"
   - Check Google Sheet - column 19 should show "Yes"
   - Event should display gold badge

2. **Test Manual Scraper**:
   - Click "🤖 Run Scraper Now" button
   - Confirm the dialog
   - GitHub Actions tab should open
   - Verify workflow is running
   - Wait ~2-3 minutes for completion
   - Reload admin dashboard
   - New events should appear with "AI-..." IDs

---

## Features Summary

### Three-Button Action System
- **❌ Reject**: Sets status to "Rejected", Editor's Choice = No
- **✅ Approve**: Sets status to "Approved", Editor's Choice = No
- **⭐ Editor's Choice**: Sets status to "Approved", Editor's Choice = Yes

### Manual Scraper Button
- Triggers GitHub Actions workflow instantly
- No need to wait for Monday 6 AM UTC
- Opens GitHub Actions page to monitor progress
- Auto-reloads events after 30 seconds
- Shows toast notifications for feedback

### Editor's Choice Display
- Gold gradient badge on event cards
- Appears in pending, approved, and public views
- Highlighted in admin dashboard
- Email notifications include Editor's Choice status

---

## Cost Implications

- **Manual Scraper Run**: ~$0.02-0.05 per run (OpenAI API)
- **Automated Weekly Run**: ~$0.08/month (4 runs)
- **Manual + Weekly**: ~$0.30-0.50/month (estimate 5-10 manual runs)

---

## Security Notes

1. **GitHub Token**:
   - Never commit to git
   - Store in a secure location
   - Regenerate if exposed
   - Consider using environment variables

2. **Admin Dashboard**:
   - Currently password-protected client-side only
   - Recommend implementing:
     - Cloudflare Access Rules
     - IP whitelisting
     - Server-side authentication

3. **Google Apps Script**:
   - Execute as script owner
   - Public access for form submissions
   - Admin actions require valid event IDs

---

## Troubleshooting

### Scraper button doesn't work
- Check GitHub token is set correctly
- Verify token has `workflow` permission
- Check browser console for errors
- Ensure Google Apps Script is redeployed

### Editor's Choice not saving
- Verify column 19 exists in Google Sheet
- Check Google Apps Script has been redeployed
- Verify admin.js has updated functions

### Events not appearing
- Check GitHub Actions workflow completed successfully
- Verify Google Sheets authentication worked
- Check scraper logs in GitHub Actions
- Ensure events pass validation (Norwich area, future dates)

---

## Next Steps

1. ✅ Backend (Code.js) - **COMPLETE**
2. ⏳ Update admin.js with new functions
3. ⏳ Update admin.html with new UI
4. ⏳ Add CSS styles
5. ⏳ Create GitHub token
6. ⏳ Redeploy Google Apps Script
7. ⏳ Test complete workflow

---

This implementation provides a professional admin dashboard with full control over event curation and the ability to manually trigger scraper runs whenever needed! 🎉
