const SHEET_NAME = 'Sheet1';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
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

    for (let i = 1; i < data.length; i++) {
      const event = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '');
        event[key] = data[i][index];
      });

      if (event.status && event.status.toLowerCase() === 'approved') {
        const formattedEvent = {
          id: event.eventid || i,
          name: event.eventname || '',
          date: event.date || '',
          time: event.time || '',
          location: event.location || '',
          category: event.category || 'community',
          description: event.description || '',
          ticketLink: event.ticketlink || null,
          image: null,
          status: 'approved'
        };
        events.push(formattedEvent);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      events: events
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
