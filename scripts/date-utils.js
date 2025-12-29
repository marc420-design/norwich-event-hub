/**
 * Date Utility Functions
 * Centralized date handling to prevent parsing errors
 */

/**
 * Parse event date string to Date object
 * Handles multiple formats: ISO, YYYY-MM-DD, etc.
 */
function parseEventDate(dateString) {
    if (!dateString) return null;

    try {
        // Handle ISO timestamp (2024-12-31T00:00:00.000Z)
        if (dateString.includes('T')) {
            return new Date(dateString);
        }
        // Handle simple date (2024-12-31)
        return new Date(dateString + 'T00:00:00');
    } catch (error) {
        console.error('Failed to parse date:', dateString, error);
        return null;
    }
}

/**
 * Get date string in YYYY-MM-DD format
 */
function getDateString(date) {
    if (!date) return '';
    if (typeof date === 'string') date = parseEventDate(date);
    if (!date || !(date instanceof Date) || isNaN(date)) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString() {
    const today = new Date();
    return getDateString(today);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = parseEventDate(dateString);
    if (!date) return 'Date TBA';

    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format time for display
 */
function formatTime(timeString) {
    if (!timeString) return '';

    try {
        // Handle full ISO timestamp
        if (timeString.includes('T')) {
            const date = new Date(timeString);
            const hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        }

        // Handle HH:MM format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
        console.error('Failed to parse time:', timeString, error);
        return timeString;
    }
}

/**
 * Check if event is today
 */
function isToday(dateString) {
    const eventDate = getDateString(dateString);
    const today = getTodayDateString();
    return eventDate === today;
}

/**
 * Check if event is in the future
 */
function isFutureEvent(dateString) {
    const eventDate = getDateString(dateString);
    const today = getTodayDateString();
    return eventDate >= today;
}

/**
 * Get month number from date (1-12)
 */
function getMonthNumber(dateString) {
    const date = parseEventDate(dateString);
    if (!date) return null;
    return String(date.getMonth() + 1).padStart(2, '0');
}

/**
 * Get year from date
 */
function getYear(dateString) {
    const date = parseEventDate(dateString);
    if (!date) return null;
    return date.getFullYear();
}

// Export functions
if (typeof window !== 'undefined') {
    window.parseEventDate = parseEventDate;
    window.getDateString = getDateString;
    window.getTodayDateString = getTodayDateString;
    window.formatDate = formatDate;
    window.formatTime = formatTime;
    window.isToday = isToday;
    window.isFutureEvent = isFutureEvent;
    window.getMonthNumber = getMonthNumber;
    window.getYear = getYear;
}
