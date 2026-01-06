// Admin Dashboard JavaScript

let allEvents = [];
let currentFilter = 'pending';

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    setupFilterTabs();
});

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update filter
            currentFilter = this.dataset.filter;
            renderEvents();
        });
    });
}

async function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '<div class="loading">Loading events</div>';

    try {
        // Fetch all events from Google Sheets (including pending)
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL + '?action=getAllEvents');
        const data = await response.json();

        if (data.success) {
            allEvents = data.events || [];
            updateStats();
            renderEvents();
        } else {
            throw new Error(data.message || 'Failed to load events');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        eventsList.innerHTML = `
            <div class="empty-state">
                <h3>Error Loading Events</h3>
                <p>${error.message}</p>
                <p>Make sure your Google Apps Script is deployed correctly.</p>
            </div>
        `;
    }
}

function updateStats() {
    const pending = allEvents.filter(e => e.status && e.status.toLowerCase() === 'pending').length;
    const approved = allEvents.filter(e => e.status && e.status.toLowerCase() === 'approved').length;
    const rejected = allEvents.filter(e => e.status && (e.status.toLowerCase() === 'rejected' || e.status.toLowerCase() === 'declined')).length;

    document.getElementById('totalEvents').textContent = allEvents.length;
    document.getElementById('pendingEvents').textContent = pending;
    document.getElementById('approvedEvents').textContent = approved;
    document.getElementById('rejectedEvents').textContent = rejected;
}

function renderEvents() {
    const eventsList = document.getElementById('eventsList');

    // Filter events based on current filter
    let filteredEvents = allEvents;
    if (currentFilter !== 'all') {
        filteredEvents = allEvents.filter(event => {
            const status = (event.status || '').toLowerCase();
            if (currentFilter === 'rejected') {
                return status === 'rejected' || status === 'declined';
            }
            return status === currentFilter;
        });
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
    });

    if (filteredEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="empty-state">
                <h3>No ${currentFilter === 'all' ? '' : currentFilter} events</h3>
                <p>There are no events matching this filter.</p>
            </div>
        `;
        return;
    }

    eventsList.innerHTML = '';
    filteredEvents.forEach(event => {
        const card = createEventCard(event);
        eventsList.appendChild(card);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'admin-event-card';

    const status = (event.status || 'pending').toLowerCase();
    const statusClass = status === 'approved' ? 'status-approved' :
                       (status === 'rejected' || status === 'declined') ? 'status-rejected' :
                       'status-pending';

    const category = event.category || 'general';
    const categoryClass = `badge-${category}`;

    card.innerHTML = `
        <div class="event-info">
            <h3>${escapeHtml(event.name || event.eventname || 'Untitled Event')}</h3>
            <div class="event-meta">
                <div class="event-meta-item">
                    <span class="category-badge ${categoryClass}">${escapeHtml(category)}</span>
                </div>
                <div class="event-meta-item">
                    <span class="status-badge ${statusClass}">${escapeHtml(status)}</span>
                </div>
                <div class="event-meta-item">
                    📅 ${formatDate(event.date || event.eventdate)}
                </div>
                <div class="event-meta-item">
                    ⏰ ${event.time || 'TBA'}
                </div>
                <div class="event-meta-item">
                    📍 ${escapeHtml(event.location || 'TBA')}
                </div>
            </div>
            <p class="event-description">${escapeHtml(event.description || 'No description provided')}</p>
            <div class="event-meta">
                ${event.promotername ? `<div class="event-meta-item">👤 ${escapeHtml(event.promotername)}</div>` : ''}
                ${event.promoteremail ? `<div class="event-meta-item">📧 ${escapeHtml(event.promoteremail)}</div>` : ''}
                ${event.ticketlink || event.ticketLink ? `<div class="event-meta-item">🎟️ <a href="${escapeHtml(event.ticketlink || event.ticketLink)}" target="_blank">Tickets</a></div>` : ''}
                ${event.timestamp ? `<div class="event-meta-item">🕐 Submitted ${formatTimestamp(event.timestamp)}</div>` : ''}
            </div>
        </div>
        <div class="event-actions" data-event-id="${escapeHtml(event.eventid || event.id || '')}">
            ${status === 'pending' ? `
                <button class="admin-btn btn-approve" onclick="approveEvent('${escapeHtml(event.eventid || event.id || '')}')">
                    ✓ Approve
                </button>
                <button class="admin-btn btn-reject" onclick="rejectEvent('${escapeHtml(event.eventid || event.id || '')}')">
                    ✗ Reject
                </button>
            ` : ''}
            ${status === 'approved' ? `
                <button class="admin-btn btn-reject" onclick="rejectEvent('${escapeHtml(event.eventid || event.id || '')}')">
                    ✗ Unapprove
                </button>
            ` : ''}
            ${status === 'rejected' || status === 'declined' ? `
                <button class="admin-btn btn-approve" onclick="approveEvent('${escapeHtml(event.eventid || event.id || '')}')">
                    ✓ Approve
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

async function approveEvent(eventId) {
    if (!confirm('Are you sure you want to approve this event?')) {
        return;
    }

    try {
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateStatus',
                eventId: eventId,
                status: 'Approved'
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Event approved successfully!', 'success');
            await loadEvents(); // Reload events
        } else {
            throw new Error(data.message || 'Failed to approve event');
        }
    } catch (error) {
        console.error('Error approving event:', error);
        showToast('Error approving event: ' + error.message, 'error');
    }
}

async function rejectEvent(eventId) {
    if (!confirm('Are you sure you want to reject this event?')) {
        return;
    }

    try {
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateStatus',
                eventId: eventId,
                status: 'Rejected'
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Event rejected', 'success');
            await loadEvents(); // Reload events
        } else {
            throw new Error(data.message || 'Failed to reject event');
        }
    } catch (error) {
        console.error('Error rejecting event:', error);
        showToast('Error rejecting event: ' + error.message, 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    if (type === 'error') {
        toast.classList.add('error');
    }

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-GB');
    }
}
