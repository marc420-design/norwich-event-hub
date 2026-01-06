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
 * Handle POST request from event submission form or admin actions
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Check if this is an admin action
    if (data.action === 'updateStatus') {
      return updateEventStatus(data.eventId, data.status);
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
        'Event ID'
      ]);
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 18);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#3AB8FF');
      headerRange.setFontColor('#FFFFFF');
    }
    
    // Generate unique event ID
    const eventId = generateEventId();
    
    // Prepare row data
    const rowData = [
      new Date(), // Timestamp
      data.name || '',
      data.date || '',
      data.time || '',
      data.location || '',
      data.category || '',
      data.description || '',
      data.ticketLink || '',
      data.price || '',
      data.imageUrl || '', // Image URL (uploaded separately)
      data.vibe || '',
      data.crowdType || '',
      data.bestFor || '',
      data.promoterName || '',
      data.promoterEmail || '',
      data.promoterPhone || '',
      'Pending', // Status
      eventId
    ];
    
    // Append row to sheet
    sheet.appendRow(rowData);
    
    // Send confirmation email
    sendConfirmationEmail(data, eventId);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Event submitted successfully',
      eventId: eventId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error submitting event: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request (for retrieving events)
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action;

    // If action is getAllEvents, return all events including pending (for admin)
    if (action === 'getAllEvents') {
      return getAllEvents();
    }

    // Default: return only approved events (for public site)
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const events = [];

    // Convert rows to objects (skip header row)
    for (let i = 1; i < data.length; i++) {
      const event = {};
      headers.forEach((header, index) => {
        event[header.toLowerCase().replace(/\s+/g, '')] = data[i][index];
      });

      // Normalize field names for frontend compatibility
      if (event.eventname) {
        event.name = event.eventname;
      }
      if (event.ticketlink) {
        event.ticketLink = event.ticketlink;
      }
      if (event.eventdate) {
        event.date = event.eventdate;
      }
      if (event.imageurl) {
        event.image = event.imageurl;
      }

      // Check for AI-discovered events based on ID
      if (event.eventid && String(event.eventid).startsWith('AI-')) {
        event.isAiDiscovered = true;
      }

      // Only return approved events
      if (event.status && event.status.toLowerCase() === 'approved') {
        events.push(event);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      events: events
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error retrieving events: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get ALL events (including pending) - for admin dashboard
 */
function getAllEvents() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const events = [];

    // Convert rows to objects (skip header row)
    for (let i = 1; i < data.length; i++) {
      const event = {};
      headers.forEach((header, index) => {
        event[header.toLowerCase().replace(/\s+/g, '')] = data[i][index];
      });

      // Normalize field names for frontend compatibility
      if (event.eventname) {
        event.name = event.eventname;
      }
      if (event.ticketlink) {
        event.ticketLink = event.ticketlink;
      }
      if (event.eventdate) {
        event.date = event.eventdate;
      }
      if (event.imageurl) {
        event.image = event.imageurl;
      }

      // Check for AI-discovered events based on ID
      if (event.eventid && String(event.eventid).startsWith('AI-')) {
        event.isAiDiscovered = true;
      }

      // Return ALL events (don't filter by status)
      events.push(event);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      events: events
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error retrieving events: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Generate unique event ID
 */
function generateEventId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return 'NEH-' + timestamp + '-' + random;
}

/**
 * Send confirmation email to promoter
 */
function sendConfirmationEmail(data, eventId) {
  const subject = 'Event Submission Received - Norwich Event Hub';
  const body = `
Thank you for submitting your event to Norwich Event Hub!

Event Details:
- Event Name: ${data.name}
- Date: ${data.date}
- Time: ${data.time}
- Location: ${data.location}
- Category: ${data.category}

Your event has been received and is pending review. You will receive another email once your event has been approved and published.

Event ID: ${eventId}

If you have any questions, please contact us at submit@norwicheventshub.com

Best regards,
Norwich Event Hub Team
  `;
  
  try {
    MailApp.sendEmail({
      to: data.promoterEmail,
      subject: subject,
      body: body,
      name: 'Norwich Event Hub'
    });
  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
  }
}

/**
 * Manual function to approve an event (can be triggered from sheet)
 */
function approveEvent(eventId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const eventIdColumn = 12; // Column M (0-indexed)
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][eventIdColumn] === eventId) {
      const statusColumn = 11; // Column L
      sheet.getRange(i + 1, statusColumn + 1).setValue('Approved');
      
      // Send approval email
      const promoterEmail = data[i][9]; // Column J
      sendApprovalEmail(promoterEmail, data[i][1]); // Event name
      break;
    }
  }
}

/**
 * Send approval email
 */
function sendApprovalEmail(email, eventName) {
  const subject = 'Your Event Has Been Approved - Norwich Event Hub';
  const body = `
Great news! Your event "${eventName}" has been approved and is now live on Norwich Event Hub!

You can view it at: https://norwicheventshub.com/directory.html

Thank you for being part of the Norwich event community!

Best regards,
Norwich Event Hub Team
  `;

  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body,
      name: 'Norwich Event Hub'
    });
  } catch (error) {
    Logger.log('Error sending approval email: ' + error.toString());
  }
}

/**
 * Update event status (Approve/Reject) - called from admin dashboard
 */
function updateEventStatus(eventId, newStatus) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Find the column indices
    const eventIdColumn = headers.indexOf('Event ID');
    const statusColumn = headers.indexOf('Status');
    const promoterEmailColumn = headers.indexOf('Promoter Email');
    const eventNameColumn = headers.indexOf('Event Name');

    if (eventIdColumn === -1 || statusColumn === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Required columns not found in sheet'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Find the event row
    for (let i = 1; i < data.length; i++) {
      if (data[i][eventIdColumn] === eventId) {
        // Update status
        sheet.getRange(i + 1, statusColumn + 1).setValue(newStatus);

        // Send approval email if approved
        if (newStatus.toLowerCase() === 'approved' && promoterEmailColumn !== -1) {
          const promoterEmail = data[i][promoterEmailColumn];
          const eventName = data[i][eventNameColumn];
          if (promoterEmail) {
            sendApprovalEmail(promoterEmail, eventName);
          }
        }

        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Event status updated successfully'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Event not found
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Event not found'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error updating event status: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

