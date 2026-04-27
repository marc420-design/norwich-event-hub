/**
 * Norwich Event Hub - Google Apps Script
 * 
 * This script handles form submissions and writes to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with columns: Timestamp, Event Name, Date, Time, Location, Category, Description, Ticket Link, Promoter Name, Promoter Email, Promoter Phone, Status
 * 2. Open Script Editor in Google Sheets (Extensions > Apps Script)
 * 3. Paste this code
 * 4. Deploy as Web App (Deploy > New Deployment > Web App)
 * 5. Set execute as: Me, Who has access: Anyone
 * 6. Copy the Web App URL and use it in submit.js
 */

// Configuration
const SHEET_NAME = 'Event Submissions';
const EMAIL_TO = 'submit@norwicheventshub.com';
const EMAIL_FROM = 'events@norwicheventshub.com';

// Configuration - IMPORTANT: Set your Google Sheet ID here
const SHEET_ID = '1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU';

/**
 * Handle OPTIONS request (CORS preflight)
 */
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);

  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, Pragma',
    'Access-Control-Max-Age': '86400'
  };

  // Set headers
  Object.keys(headers).forEach(key => {
    output.addHeader(key, headers[key]);
  });

  return output;
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
      // Add headers
      sheet.appendRow([
        'Timestamp',
        'Event Name',
        'Date',
        'Time',
        'Location',
        'Category',
        'Description',
        'Ticket Link',
        'Price',
        'Image URL',
        'Vibe',
        'Crowd Type',
        'Best For',
        'Promoter Name',
        'Promoter Email',
        'Promoter Phone',
        'Status',
        'Event ID',
        'Editor\'s Choice'
      ]);
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 19);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#3AB8FF');
      headerRange.setFontColor('#FFFFFF');
    }

    // Generate unique event ID
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const lastRow = sheet.getLastRow();
    const eventId = 'EVT-' + timestamp + '-' + (lastRow + 1);

    // Append data to sheet
    sheet.appendRow([
      new Date(),
      data.eventname || data.name || '',
      data.date || '',
      data.time || '',
      data.location || '',
      data.category || '',
      data.description || '',
      data.ticketlink || data.ticketLink || '',
      data.price || '',
      data.imageurl || data.image || '',
      data.vibe || '',
      data.crowdtype || '',
      data.bestfor || '',
      data.promotername || '',
      data.promoteremail || '',
      data.promoterphone || '',
      'Pending',  // Default status
      eventId,
      false  // Editor's Choice default
    ]);

    // Send notification email (optional)
    try {
      const subject = 'New Event Submission: ' + (data.eventname || data.name);
      const body = `
New event submitted to Norwich Event Hub:

Event: ${data.eventname || data.name}
Date: ${data.date}
Time: ${data.time}
Location: ${data.location}
Category: ${data.category}

Description: ${data.description}

Ticket Link: ${data.ticketlink || data.ticketLink}
Price: ${data.price}

Promoter: ${data.promotername}
Email: ${data.promoteremail}
Phone: ${data.promoterphone}

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

    // Return success response
    const output = ContentService.createTextOutput(JSON.stringify({
      success: true,
      eventId: eventId,
      message: 'Event submitted successfully! Our team will review it shortly.'
    }));
    output.setMimeType(ContentService.MimeType.JSON);

    // Add CORS headers
    output.addHeader('Access-Control-Allow-Origin', '*');
    output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.addHeader('Access-Control-Allow-Headers', 'Content-Type');

    return output;

  } catch (error) {
    // Return error response
    const output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error submitting event: ' + error.toString()
    }));
    output.setMimeType(ContentService.MimeType.JSON);

    // Add CORS headers even for errors
    output.addHeader('Access-Control-Allow-Origin', '*');
    output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.addHeader('Access-Control-Allow-Headers', 'Content-Type');

    return output;
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
 * Helper function to create JSON response with CORS headers
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // Add CORS headers
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');

  return output;
}
