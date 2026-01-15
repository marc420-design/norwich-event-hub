/**
 * Date parsing utilities for event scraper
 * Converts various date formats to YYYY-MM-DD
 */

/**
 * Parse various date formats to YYYY-MM-DD
 * @param {string} dateStr - Date string to parse
 * @returns {string} - Formatted date YYYY-MM-DD
 */
export function parseDate(dateStr) {
  if (!dateStr) return getNextWeekDate();

  dateStr = dateStr.toLowerCase().trim();
  const now = new Date();

  // Handle relative dates
  if (dateStr.includes('today')) {
    return formatDate(now);
  }

  if (dateStr.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }

  if (dateStr.includes('next week')) {
    return getNextWeekDate();
  }

  // Try to parse "20 Jan 2026" or "20th January 2026" format
  const match = dateStr.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i);
  if (match) {
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const day = parseInt(match[1]);
    const month = months[match[2].substring(0, 3)];
    const year = parseInt(match[3]);
    return formatDate(new Date(year, month, day));
  }

  // Try to parse "Saturday 25 January" (assume current/next year)
  const dayMonthMatch = dateStr.match(/(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i);
  if (dayMonthMatch) {
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const day = parseInt(dayMonthMatch[1]);
    const month = months[dayMonthMatch[2].substring(0, 3)];
    const year = now.getFullYear();
    const date = new Date(year, month, day);

    // If date is in the past, use next year
    if (date < now) {
      date.setFullYear(year + 1);
    }

    return formatDate(date);
  }

  // Try to parse YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Default to next week
  return getNextWeekDate();
}

/**
 * Format Date object to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} - Formatted date
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date one week from now
 * @returns {string} - Date in YYYY-MM-DD format
 */
function getNextWeekDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return formatDate(date);
}

/**
 * Parse time string to HH:MM format
 * @param {string} timeStr - Time string to parse
 * @returns {string} - Formatted time HH:MM
 */
export function parseTime(timeStr) {
  if (!timeStr) return '19:00'; // Default evening time

  // Extract time in various formats
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (match) {
    let hour = parseInt(match[1]);
    const minute = match[2] || '00';
    const meridiem = match[3] ? match[3].toLowerCase() : null;

    // Convert to 24-hour format
    if (meridiem === 'pm' && hour < 12) {
      hour += 12;
    } else if (meridiem === 'am' && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, '0')}:${minute}`;
  }

  return '19:00'; // Default
}
