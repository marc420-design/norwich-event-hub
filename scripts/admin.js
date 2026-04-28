let allEvents = [];
let currentFilter = 'pending';

const REVIEW_QUEUE_STATUSES = new Set(['pending', 'needs_review', 'needs_link', 'needs_flyer', 'duplicate', 'error']);
const REJECTED_STATUSES = new Set(['rejected', 'declined']);

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    setupFilterTabs();
});

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((item) => item.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderEvents();
        });
    });
}

async function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '<div class="loading">Loading events... (Connecting to database)</div>';

    try {
        const response = await fetch(`${APP_CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=getAllEvents`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'API returned failure');
        }

        allEvents = data.events || [];
        updateStats();
        renderEvents();
    } catch (error) {
        console.error('CRITICAL ERROR loading events:', error);
        eventsList.innerHTML = `
            <div class="empty-state" style="background: #fee2e2; border: 2px solid #ef4444; color: #7f1d1d;">
                <h3 style="color: #991b1b;">Connection Failed</h3>
                <p><strong>Error:</strong> ${error.message}</p>
                <button onclick="loadEvents()" class="admin-btn btn-view">Retry Connection</button>
            </div>
        `;
    }
}

function updateStats() {
    const pending = allEvents.filter((event) => REVIEW_QUEUE_STATUSES.has((event.status || '').toLowerCase())).length;
    const approved = allEvents.filter((event) => (event.status || '').toLowerCase() === 'approved').length;
    const rejected = allEvents.filter((event) => REJECTED_STATUSES.has((event.status || '').toLowerCase())).length;

    document.getElementById('totalEvents').textContent = allEvents.length;
    document.getElementById('pendingEvents').textContent = pending;
    document.getElementById('approvedEvents').textContent = approved;
    document.getElementById('rejectedEvents').textContent = rejected;
}

function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    let filteredEvents = allEvents;

    if (currentFilter !== 'all') {
        filteredEvents = allEvents.filter((event) => matchesFilter((event.status || '').toLowerCase(), currentFilter));
    }

    filteredEvents.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

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
    filteredEvents.forEach((event) => {
        eventsList.appendChild(createEventCard(event));
    });
}

function matchesFilter(status, filter) {
    if (filter === 'pending') {
        return REVIEW_QUEUE_STATUSES.has(status);
    }
    if (filter === 'rejected') {
        return REJECTED_STATUSES.has(status);
    }
    return status === filter;
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'admin-event-card';

    const status = (event.status || 'pending').toLowerCase();
    const statusClass = getStatusClass(status);
    const category = event.category || 'general';
    const categoryClass = `badge-${category}`;
    const isEditorsChoice = event.editorschoice === 'Yes' || event.editorschoice === true;
    const eventId = escapeHtml(event.eventid || event.id || '');

    card.innerHTML = `
        <div class="event-info">
            <h3>
                ${escapeHtml(event.name || event.eventname || 'Untitled Event')}
                ${isEditorsChoice ? "<span class=\"editors-choice-badge\">EDITOR'S CHOICE</span>" : ''}
            </h3>
            <div class="event-meta">
                <div class="event-meta-item">
                    <span class="category-badge ${categoryClass}">${escapeHtml(category)}</span>
                </div>
                <div class="event-meta-item">
                    <span class="status-badge ${statusClass}">${escapeHtml(status)}</span>
                </div>
                <div class="event-meta-item">${formatDate(event.date || event.eventdate)}</div>
                <div class="event-meta-item">${event.time || 'TBA'}</div>
                <div class="event-meta-item">${escapeHtml(event.location || 'TBA')}</div>
            </div>
            <p class="event-description">${escapeHtml(event.description || 'No description provided')}</p>
            <div class="event-meta">
                ${event.promotername ? `<div class="event-meta-item">${escapeHtml(event.promotername)}</div>` : ''}
                ${event.promoteremail ? `<div class="event-meta-item">${escapeHtml(event.promoteremail)}</div>` : ''}
                ${event.ticketlink || event.ticketLink ? `<div class="event-meta-item"><a href="${escapeHtml(event.ticketlink || event.ticketLink)}" target="_blank">Tickets</a></div>` : ''}
                ${event.timestamp ? `<div class="event-meta-item">Submitted ${formatTimestamp(event.timestamp)}</div>` : ''}
            </div>
        </div>
        <div class="event-actions-grid" data-event-id="${eventId}">
            ${REVIEW_QUEUE_STATUSES.has(status) ? `
                <button class="btn-reject" onclick="rejectEvent('${eventId}')">Reject</button>
                <button class="btn-approve" onclick="approveEvent('${eventId}', false)">Approve</button>
                <button class="btn-editors-choice" onclick="approveEvent('${eventId}', true)">Editor's Choice</button>
            ` : ''}
            ${status === 'approved' ? `
                <button class="btn-reject" onclick="rejectEvent('${eventId}')">Unapprove</button>
                ${!isEditorsChoice ? `<button class="btn-editors-choice" onclick="approveEvent('${eventId}', true)">Make Editor's Choice</button>` : ''}
            ` : ''}
            ${REJECTED_STATUSES.has(status) ? `
                <button class="btn-approve" onclick="approveEvent('${eventId}', false)">Approve</button>
                <button class="btn-editors-choice" onclick="approveEvent('${eventId}', true)">Editor's Choice</button>
            ` : ''}
        </div>
    `;

    return card;
}

function getStatusClass(status) {
    if (status === 'approved') {
        return 'status-approved';
    }
    if (REJECTED_STATUSES.has(status)) {
        return 'status-rejected';
    }
    if (status === 'error') {
        return 'status-error';
    }
    if (status === 'needs_link' || status === 'needs_flyer') {
        return 'status-warning';
    }
    return 'status-pending';
}

async function approveEvent(eventId, editorsChoice = false) {
    const message = editorsChoice ? "Approve this event as Editor's Choice?" : 'Approve this event?';
    if (!confirm(message)) {
        return;
    }

    try {
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateStatus',
                eventId,
                status: 'Approved',
                editorsChoice,
            }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to approve event');
        }

        showToast(editorsChoice ? "Event approved as Editor's Choice." : 'Event approved successfully.', 'success');
        await loadEvents();
    } catch (error) {
        console.error('Error approving event:', error);
        showToast(`Error approving event: ${error.message}`, 'error');
    }
}

async function rejectEvent(eventId) {
    if (!confirm('Reject this event?')) {
        return;
    }

    try {
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateStatus',
                eventId,
                status: 'Rejected',
                editorsChoice: false,
            }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to reject event');
        }

        showToast('Event rejected.', 'info');
        await loadEvents();
    } catch (error) {
        console.error('Error rejecting event:', error);
        showToast(`Error rejecting event: ${error.message}`, 'error');
    }
}

async function triggerManualScraper() {
    const confirmRun = confirm(
        'Trigger manual scraper run?\n\nThis will scrape events from all sources and submit them into the review workflow.\n\nContinue?'
    );
    if (!confirmRun) {
        return;
    }

    const scraperBtn = document.getElementById('manual-scraper-btn');

    try {
        if (scraperBtn) {
            scraperBtn.disabled = true;
            scraperBtn.textContent = 'Running Scraper...';
        }

        showToast('Triggering scraper workflow via secure bridge...', 'info');

        const response = await fetch('/trigger-scraper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to trigger scraper');
        }

        showToast('Scraper workflow started successfully.', 'success');
        setTimeout(async () => {
            await loadEvents();
            showToast('Events reloaded. Check the review queue.', 'info');
        }, 45000);
    } catch (error) {
        console.error('Error triggering scraper:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        if (scraperBtn) {
            scraperBtn.disabled = false;
            scraperBtn.textContent = 'Run Scraper Now';
        }
    }
}

function showToast(message, type = 'success') {
    document.querySelectorAll('.toast-notification').forEach((toast) => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, type === 'info' ? 5000 : 4000);
}

function escapeHtml(text) {
    if (!text) {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) {
        return 'TBA';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return '';
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        return '';
    }

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString('en-GB');
}
