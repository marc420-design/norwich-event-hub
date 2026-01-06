/**
 * Norwich Event Hub - Google Apps Script V2 (Enhanced)
 *
 * UPDATES IN V2:
 * - Better field mapping for frontend compatibility
 * - Support for additional event metadata (price, vibe, featured)
 * - AI-discovered event support
 * - Last updated timestamp
 * - Better error handling
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU
 * 2. Extensions > Apps Script
 * 3. Replace ALL code with this file
 * 4. Click "Deploy" > "Manage Deployments" > Edit > "New Version"
 * 5. Save - URL stays the same!
 */

// Configuration - IMPORTANT: Set your Google Sheet ID here
const SHEET_ID = '1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU';
const SHEET_NAME = 'Event Submissions';
const EMAIL_TO = 'submit@norwicheventshub.com';

/**
 * Handle POST request from event submission form
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Get the spreadsheet by ID
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Add headers with ALL fields
      sheet.appendRow([
        'Timestamp',
        'Event Name',
        'Date',
        'Time',
        'Location',
        'Category',
        'Description',
        'Ticket Link',
        'Promoter Name',
        'Promoter Email',
        'Promoter Phone',
        'Status',
        'Event ID',
        'Price',
        'Address',
        'Vibe',
        'Best For',
        'Featured',
        'Priority',
        'Image URL'
      ]);

      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 20);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#3AB8FF');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    // Generate unique event ID or use provided one
    const eventId = data.eventId || generateEventId();

    // Prepare row data with ALL fields
    const rowData = [
      new Date(), // Timestamp
      data.name || '',
      data.date || '',
      data.time || '',
      data.location || '',
      data.category || '',
      data.description || '',
      data.ticketLink || '',
      data.promoterName || '',
      data.promoterEmail || '',
      data.promoterPhone || '',
      data.status || 'Pending', // Status (can be pre-set to 'Approved')
      eventId,
      data.price || '',
      data.address || '',
      data.vibe || '',
      data.bestFor || '',
      data.featured || 'No',
      data.priority || 'medium',
      data.image || ''
    ];

    // Append row to sheet
    sheet.appendRow(rowData);

    // Auto-sort by date (newest first)
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
    dataRange.sort([{column: 3, ascending: false}]); // Sort by date column

    // Send confirmation email only if promoter email exists
    if (data.promoterEmail && !data.status) {
      sendConfirmationEmail(data, eventId);
    }

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Event submitted successfully',
      eventId: eventId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error submitting event: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request - Return all approved events
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Sheet not found - please submit an event first to create the sheet',
        events: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();

    // Check if sheet is empty (only headers)
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'No events found - sheet is empty',
        events: [],
        lastUpdated: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const events = [];

    // Convert rows to objects (skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Create event object with proper field mapping
      const event = {
        id: row[12] || `evt-${i}`, // Event ID
        name: row[1] || '', // Event Name
        date: formatDate(row[2]), // Date (convert to ISO string)
        time: row[3] || '', // Time
        location: row[4] || '', // Location
        category: row[5] || '', // Category
        description: row[6] || '', // Description
        ticketLink: row[7] || '', // Ticket Link
        price: row[13] || '', // Price
        address: row[14] || '', // Address
        vibe: row[15] || '', // Vibe
        bestFor: row[16] || '', // Best For
        featured: row[17] === 'Yes' || row[17] === true, // Featured
        priority: row[18] || 'medium', // Priority
        image: row[19] || '', // Image URL
        status: row[11] || '', // Status
        promoterName: row[8] || '', // Promoter Name (optional, for admin)
      };

      // Check if event is AI-discovered
      if (event.id && String(event.id).startsWith('AI-')) {
        event.isAiDiscovered = true;
      }

      // Only return approved events
      if (event.status && event.status.toLowerCase() === 'approved') {
        events.push(event);
      }
    }

    // Sort events by date (upcoming first)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      events: events,
      count: events.length,
      lastUpdated: new Date().toISOString(),
      message: events.length > 0 ? `Found ${events.length} approved events` : 'No approved events found'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error retrieving events: ' + error.toString(),
      events: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Format date to ISO string
 */
function formatDate(date) {
  if (!date) return '';

  try {
    // If already a Date object
    if (date instanceof Date) {
      return date.toISOString();
    }

    // If string, try to parse
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    return date.toString();
  } catch (error) {
    return date.toString();
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
 * Manual function to approve an event
 */
function approveEvent(eventId) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
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
      if (promoterEmail) {
        sendApprovalEmail(promoterEmail, data[i][1]); // Event name
      }
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
 * Bulk approve all pending events (admin function)
 */
function approveAllPendingEvents() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    Logger.log('Sheet not found');
    return;
  }

  const data = sheet.getDataRange().getValues();
  const statusColumn = 11; // Column L (0-indexed)
  let approvedCount = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i][statusColumn] === 'Pending' || !data[i][statusColumn]) {
      sheet.getRange(i + 1, statusColumn + 1).setValue('Approved');
      approvedCount++;
    }
  }

  Logger.log(`Approved ${approvedCount} events`);
  return approvedCount;
}
