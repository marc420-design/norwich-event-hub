// API Integration for Norwich Event Hub
// Handles communication with Google Sheets API and backend services

// Use APP_CONFIG from config.js if available, otherwise use defaults
const API_CONFIG = typeof APP_CONFIG !== 'undefined' ? {
    SUBMISSION_URL: APP_CONFIG.GOOGLE_APPS_SCRIPT_URL,
    EVENTS_URL: APP_CONFIG.GOOGLE_APPS_SCRIPT_URL,
    SHEETS_API_KEY: APP_CONFIG.GOOGLE_SHEETS_API_KEY,
    SHEET_ID: APP_CONFIG.GOOGLE_SHEET_ID,
    USE_LOCAL_STORAGE: APP_CONFIG.USE_LOCAL_STORAGE
} : {
    // Default configuration (for development)
    SUBMISSION_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
    EVENTS_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
    SHEETS_API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
    SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',
    USE_LOCAL_STORAGE: true
};

/**
 * Submit event to backend/Google Sheets
 */
async function submitEventToAPI(eventData) {
    // If using Google Apps Script Web App
    if (API_CONFIG.SUBMISSION_URL && API_CONFIG.SUBMISSION_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        try {
            const response = await fetch(API_CONFIG.SUBMISSION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API submission error:', error);
            throw error;
        }
    }
    
    // Fallback to local storage for development
    if (API_CONFIG.USE_LOCAL_STORAGE) {
        return submitEventToLocalStorage(eventData);
    }
    
    throw new Error('No API configuration available');
}

/**
 * Get events from backend/Google Sheets
 */
async function getEventsFromAPI(filters = {}) {
    // If using Google Apps Script Web App
    if (API_CONFIG.EVENTS_URL && API_CONFIG.EVENTS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        try {
            const queryParams = new URLSearchParams(filters);
            const url = `${API_CONFIG.EVENTS_URL}?${queryParams}`;
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success && result.events) {
                return result.events;
            }
            return [];
        } catch (error) {
            console.error('API fetch error:', error);
            return getEventsFromLocalStorage();
        }
    }
    
    // Fallback to local storage
    if (API_CONFIG.USE_LOCAL_STORAGE) {
        return getEventsFromLocalStorage(filters);
    }
    
    return [];
}

/**
 * Get today's events
 */
async function getTodayEvents() {
    const today = getTodayDateString();
    const events = await getEventsFromAPI();
    return events.filter(event => event.date === today);
}

/**
 * Get events by category
 */
async function getEventsByCategory(category) {
    const events = await getEventsFromAPI();
    if (category === 'all') return events;
    return events.filter(event => event.category === category);
}

/**
 * Local Storage Functions (for development/fallback)
 */
function submitEventToLocalStorage(eventData) {
    try {
        const events = getEventsFromLocalStorage();
        const newEvent = {
            id: Date.now(),
            ...eventData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        events.push(newEvent);
        localStorage.setItem('norwichEvents', JSON.stringify(events));
        return { success: true, eventId: newEvent.id };
    } catch (error) {
        console.error('Local storage error:', error);
        return { success: false, message: error.toString() };
    }
}

function getEventsFromLocalStorage(filters = {}) {
    try {
        // First check if we have events in localStorage
        const stored = localStorage.getItem('norwichEvents');
        let events = [];

        if (stored) {
            events = JSON.parse(stored);
        } else if (window.eventsData && window.eventsData.length > 0) {
            // If not in localStorage but we have loaded events from JSON, use those
            events = window.eventsData;
            // Save to localStorage for future use
            localStorage.setItem('norwichEvents', JSON.stringify(events));
        } else {
            // No data available
            return [];
        }

        // Apply filters
        if (filters.category && filters.category !== 'all') {
            events = events.filter(e => e.category === filters.category);
        }

        if (filters.status) {
            events = events.filter(e => e.status === filters.status);
        }

        if (filters.date) {
            events = events.filter(e => e.date === filters.date);
        }

        return events;
    } catch (error) {
        console.error('Local storage read error:', error);
        // Fallback to window.eventsData if available
        return window.eventsData || [];
    }
}

/**
 * Initialize API - Load events on page load
 */
async function initializeEvents() {
    try {
        const events = await getEventsFromAPI();
        if (events.length > 0) {
            // Update global eventsData array
            window.eventsData = events;
            return events;
        }
    } catch (error) {
        console.error('Failed to initialize events:', error);
    }
    return [];
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.submitEventToAPI = submitEventToAPI;
    window.getEventsFromAPI = getEventsFromAPI;
    window.getTodayEvents = getTodayEvents;
    window.getEventsByCategory = getEventsByCategory;
    window.initializeEvents = initializeEvents;
}

