/**
 * Norwich Event Hub - Google Apps Script
 * 
 * This script handles form submissions and writes to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet, or let this script create/update the Event Submissions headers automatically.
 * 2. Open Script Editor in Google Sheets (Extensions > Apps Script)
 * 3. Paste this code
 * 4. Deploy as Web App (Deploy > New Deployment > Web App)
 * 5. Set execute as: Me, Who has access: Anyone
 * 6. Copy the Web App URL and use it in submit.js
 *
 * NOTE: Google Apps Script ContentService does not support addHeader().
 * CORS is handled automatically by Google for script.google.com domains.
 */

// Configuration
const SHEET_NAME = 'Event Submissions';
const EMAIL_TO = 'submit@norwicheventshub.com';
const EMAIL_FROM = 'events@norwicheventshub.com';

// Configuration - IMPORTANT: Set your Google Sheet ID here
const SHEET_ID = '1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU';

const SUBMISSION_HEADERS = [
  'Timestamp',
  'Event Name',
  'Date',
  'End Date',
  'Time',
  'Opening Times',
  'Location',
  'Category',
  'Description',
  'Ticket Link',
  'Price',
  'Image URL',
  'Flyer Name',
  'Flyer Type',
  'Flyer Size',
  'Vibe',
  'Crowd Type',
  'Best For',
  'Promoter Name',
  'Promoter Email',
  'Promoter Phone',
  'Status',
  'Event ID',
  'Editor\'s Choice'
];

function firstValue(data, keys) {
  for (let i = 0; i < keys.length; i++) {
    const value = data[keys[i]];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return '';
}

function ensureSubmissionHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SUBMISSION_HEADERS);
  } else {
    const lastColumn = Math.max(sheet.getLastColumn(), 1);
    const existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(String);
    const missingHeaders = SUBMISSION_HEADERS.filter(header => existingHeaders.indexOf(header) === -1);

    if (missingHeaders.length > 0) {
      sheet.getRange(1, existingHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
    }
  }

  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#3AB8FF');
  headerRange.setFontColor('#FFFFFF');

  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String);
}

/**
 * Handle OPTIONS request (CORS preflight)
 * Note: Google Apps Script handles CORS automatically; this is a no-op stub.
 */
function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST request from event submission form or admin actions
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Check if this is an admin action
    if (data.action === 'updateStatus') {
      return updateEventStatus(data.eventId, data.status, data.editorsChoice);
    }

    // Check if this is a manual scraper trigger
    if (data.action === 'triggerScraper') {
      return triggerGitHubScraper(data.githubToken);
    }

    // Otherwise, treat as event submission
    // Get the spreadsheet by ID (required for web app deployments)
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    const headers = ensureSubmissionHeaders(sheet);

    // Generate unique event ID
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const lastRow = sheet.getLastRow();
    const eventId = 'EVT-' + timestamp + '-' + (lastRow + 1);

    const valuesByHeader = {
      'Timestamp': new Date(),
      'Event Name': firstValue(data, ['eventname', 'eventName', 'name']),
      'Date': firstValue(data, ['date', 'startDate']),
      'End Date': firstValue(data, ['enddate', 'endDate']),
      'Time': firstValue(data, ['time']),
      'Opening Times': firstValue(data, ['openingtimes', 'openingTimes']),
      'Location': firstValue(data, ['location']),
      'Category': firstValue(data, ['category']),
      'Description': firstValue(data, ['description']),
      'Ticket Link': firstValue(data, ['ticketlink', 'ticketLink']),
      'Price': firstValue(data, ['price', 'eventPrice']),
      'Image URL': firstValue(data, ['imageurl', 'imageUrl', 'image']),
      'Flyer Name': firstValue(data, ['flyername', 'flyerName']),
      'Flyer Type': firstValue(data, ['flyertype', 'flyerType']),
      'Flyer Size': firstValue(data, ['flyersize', 'flyerSize']),
      'Vibe': firstValue(data, ['vibe', 'eventVibe']),
      'Crowd Type': firstValue(data, ['crowdtype', 'crowdType']),
      'Best For': firstValue(data, ['bestfor', 'bestFor']),
      'Promoter Name': firstValue(data, ['promotername', 'promoterName']),
      'Promoter Email': firstValue(data, ['promoteremail', 'promoterEmail']),
      'Promoter Phone': firstValue(data, ['promoterphone', 'promoterPhone']),
      'Status': 'Pending',
      'Event ID': eventId,
      'Editor\'s Choice': false
    };

    sheet.appendRow(headers.map(header => valuesByHeader[header] !== undefined ? valuesByHeader[header] : ''));

    // Send notification email (optional)
    try {
      const subject = 'New Event Submission: ' + valuesByHeader['Event Name'];
      const body = `
New event submitted to Norwich Event Hub:

Event: ${valuesByHeader['Event Name']}
Start Date: ${valuesByHeader['Date']}
End Date: ${valuesByHeader['End Date']}
Time: ${valuesByHeader['Time']}
Opening Times: ${valuesByHeader['Opening Times']}
Location: ${valuesByHeader['Location']}
Category: ${valuesByHeader['Category']}

Description: ${valuesByHeader['Description']}

Ticket/Info Link: ${valuesByHeader['Ticket Link']}
Price: ${valuesByHeader['Price']}
Flyer: ${valuesByHeader['Flyer Name']}

Promoter: ${valuesByHeader['Promoter Name']}
Email: ${valuesByHeader['Promoter Email']}
Phone: ${valuesByHeader['Promoter Phone']}

Event ID: ${eventId}
Status: Pending Review

---
Review and approve this event at: https://norwicheventshub.com/admin
      `;

      MailApp.sendEmail(EMAIL_TO, subject, body);
    } catch (error) {
      // Email sending is optional, don't fail the whole request
      console.error('Failed to send notification email:', error);
    }

    return createJsonResponse({
      success: true,
      eventId: eventId,
      message: 'Event submitted successfully! Our team will review it shortly.'
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Error submitting event: ' + error.toString()
    });
  }
}

/**
 * Handle GET request - Return all events
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({
        success: false,
        message: 'Sheet not found',
        events: []
      });
    }

    // Get all data
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    // Convert to array of objects
    const events = rows.map(row => {
      const event = {};
      headers.forEach((header, index) => {
        // Normalize header names
        let key = header.toLowerCase().replace(/['\s]/g, '');
        if (key === 'eventname') key = 'name';
        if (key === 'ticketlink') key = 'ticketLink';
        if (key === 'imageurl') key = 'image';
        if (key === 'eventid') key = 'id';
        if (key === 'editorschoice') key = 'featured';

        event[key] = row[index];
      });
      return event;
    }).filter(event => {
      // Only return approved events with future dates
      if (event.status !== 'Approved') return false;

      // Check if event date is in the future
      try {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
      } catch (e) {
        return false;
      }
    });

    // Sort by date (earliest first)
    events.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    return createJsonResponse({
      success: true,
      events: events,
      total: events.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Error fetching events: ' + error.toString(),
      events: []
    });
  }
}

/**
 * Update event status (Approved/Pending/Rejected)
 */
function updateEventStatus(eventId, status, editorsChoice) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({
        success: false,
        message: 'Sheet not found'
      });
    }

    // Find the event by ID
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const eventIdCol = headers.indexOf('Event ID');
    const statusCol = headers.indexOf('Status');
    const editorsChoiceCol = headers.indexOf('Editor\'s Choice');

    if (eventIdCol === -1 || statusCol === -1) {
      return createJsonResponse({
        success: false,
        message: 'Required columns not found'
      });
    }

    // Find the row
    for (let i = 1; i < data.length; i++) {
      if (data[i][eventIdCol] === eventId) {
        // Update status
        sheet.getRange(i + 1, statusCol + 1).setValue(status);

        // Update Editor's Choice if column exists
        if (editorsChoiceCol !== -1 && editorsChoice !== undefined) {
          sheet.getRange(i + 1, editorsChoiceCol + 1).setValue(editorsChoice);
        }

        return createJsonResponse({
          success: true,
          message: 'Event status updated successfully'
        });
      }
    }

    return createJsonResponse({
      success: false,
      message: 'Event not found'
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Error updating event status: ' + error.toString()
    });
  }
}

/**
 * Trigger GitHub Actions scraper workflow
 */
function triggerGitHubScraper(githubToken) {
  try {
    if (!githubToken) {
      return createJsonResponse({
        success: false,
        message: 'GitHub token required'
      });
    }

    // GitHub API endpoint to trigger workflow
    const owner = 'marc420-design';
    const repo = 'norwich-event-hub';
    const workflowId = 'scrape-events.yml';
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;

    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        ref: 'master'
      }),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 204) {
      return createJsonResponse({
        success: true,
        message: 'Scraper triggered successfully! Check GitHub Actions for progress.'
      });
    } else {
      return createJsonResponse({
        success: false,
        message: `GitHub API returned status ${responseCode}: ${response.getContentText()}`
      });
    }

  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Error triggering scraper: ' + error.toString()
    });
  }
}

/**
 * Helper function to create JSON response.
 * NOTE: ContentService.TextOutput does NOT support addHeader().
 * Google Apps Script automatically sets CORS headers for script.google.com.
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
