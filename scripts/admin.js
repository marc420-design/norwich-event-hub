// Admin Dashboard JavaScript

let allEvents = [];
let currentFilter = 'pending';

// GitHub Personal Access Token for manual scraper trigger
// Create at: https://github.com/settings/tokens (scope: workflow)
// IMPORTANT: Replace with your actual token
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';

document.addEventListener('DOMContentLoaded', function () {
    loadEvents();
    setupFilterTabs();
});

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
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
    eventsList.innerHTML = '<div class="loading">Loading events... (Connecting to database)</div>';

    try {
        console.log('Fetching events from:', APP_CONFIG.GOOGLE_APPS_SCRIPT_URL);

        // Fetch all events from Google Sheets
        // Use 'no-cors' mode is NOT an option for JSON, but we expect CORS headers from Google
        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL + '?action=getAllEvents');

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('Events loaded successfully:', data.events.length);
            allEvents = data.events || [];
            updateStats();
            renderEvents();
        } else {
            throw new Error(data.message || 'API returned failure');
        }
    } catch (error) {
        console.error('CRITICAL ERROR loading events:', error);

        // Detailed error for user
        eventsList.innerHTML = `
            <div class="empty-state" style="background: #fee2e2; border: 2px solid #ef4444; color: #7f1d1d;">
                <h3 style="color: #991b1b;">⚠️ Connection Failed</h3>
                <p><strong>Error:</strong> ${error.message}</p>
                <div style="text-align: left; margin: 1rem auto; max-width: 500px; background: white; padding: 1rem; border-radius: 4px;">
                    <p><strong>Troubleshooting:</strong></p>
                    <ol>
                        <li><strong>Hard Refresh:</strong> Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac).</li>
                        <li><strong>Ad Blockers:</strong> Disable ad blockers or extensions for this site.</li>
                        <li><strong>Backend Script:</strong> You may need to <a href="clasp_deployment_guide.md" target="_blank">Redeploy the App Script</a>.</li>
                    </ol>
                </div>
                <button onclick="loadEvents()" class="admin-btn btn-view">🔄 Retry Connection</button>
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

    const isEditorsChoice = event.editorschoice === 'Yes' || event.editorschoice === true;

    card.innerHTML = `
        <div class="event-info">
            <h3>
                ${escapeHtml(event.name || event.eventname || 'Untitled Event')}
                ${isEditorsChoice ? '<span class="editors-choice-badge">⭐ EDITOR\'S CHOICE</span>' : ''}
            </h3>
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
        <div class="event-actions-grid" data-event-id="${escapeHtml(event.eventid || event.id || '')}">
            ${status === 'pending' ? `
                <button class="btn-reject" onclick="rejectEvent('${escapeHtml(event.eventid || event.id || '')}')">
                    ❌ Reject
                </button>
                <button class="btn-approve" onclick="approveEvent('${escapeHtml(event.eventid || event.id || '')}', false)">
                    ✅ Approve
                </button>
                <button class="btn-editors-choice" onclick="approveEvent('${escapeHtml(event.eventid || event.id || '')}', true)">
                    ⭐ Editor's Choice
                </button>
            ` : ''}
            ${status === 'approved' ? `
                <button class="btn-reject" onclick="rejectEvent('${escapeHtml(event.eventid || event.id || '')}')">
                    ❌ Unapprove
                </button>
                ${!isEditorsChoice ? `
                <button class="btn-editors-choice" onclick="approveEvent('${escapeHtml(event.eventid || event.id || '')}', true)">
                    ⭐ Make Editor's Choice
                </button>
                ` : ''}
            ` : ''}
            ${status === 'rejected' || status === 'declined' ? `
                <button class="btn-approve" onclick="approveEvent('${escapeHtml(event.eventid || event.id || '')}', false)">
                    ✅ Approve
                </button>
                <button class="btn-editors-choice" onclick="approveEvent('${escapeHtml(event.eventid || event.id || '')}', true)">
                    ⭐ Editor's Choice
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

/**
 * Approve event and optionally mark as Editor's Choice
 * @param {string} eventId - Event ID
 * @param {boolean} editorsChoice - Whether to mark as Editor's Choice
 */
async function approveEvent(eventId, editorsChoice = false) {
    const message = editorsChoice
        ? '⭐ Approve this event as Editor\'s Choice?'
        : '✅ Approve this event?';

    if (!confirm(message)) {
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
                status: 'Approved',
                editorsChoice: editorsChoice
            })
        });

        const data = await response.json();

        if (data.success) {
            const successMessage = editorsChoice
                ? '⭐ Event approved as Editor\'s Choice!'
                : '✅ Event approved successfully!';
            showToast(successMessage, 'success');
            await loadEvents(); // Reload events
        } else {
            throw new Error(data.message || 'Failed to approve event');
        }
    } catch (error) {
        console.error('Error approving event:', error);
        showToast('Error approving event: ' + error.message, 'error');
    }
}

/**
 * Reject event
 * @param {string} eventId - Event ID
 */
async function rejectEvent(eventId) {
    if (!confirm('❌ Reject this event?')) {
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
                status: 'Rejected',
                editorsChoice: false
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Event rejected', 'info');
            await loadEvents(); // Reload events
        } else {
            throw new Error(data.message || 'Failed to reject event');
        }
    } catch (error) {
        console.error('Error rejecting event:', error);
        showToast('Error rejecting event: ' + error.message, 'error');
    }
}

/**
 * Trigger manual scraper run via GitHub Actions
 */
async function triggerManualScraper() {
    if (!GITHUB_TOKEN || GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
        showToast('❌ GitHub token not configured. See admin.js line 8', 'error');
        return;
    }

    const confirmRun = confirm(
        '🤖 Trigger manual scraper run?\n\n' +
        'This will:\n' +
        '• Scrape events from all sources\n' +
        '• Process with OpenAI AI\n' +
        '• Add to Google Sheets (Pending status)\n' +
        '• Cost ~$0.02-0.05 in API fees\n\n' +
        'Continue?'
    );

    if (!confirmRun) return;

    try {
        // Show loading state
        const scraperBtn = document.getElementById('manual-scraper-btn');
        if (scraperBtn) {
            scraperBtn.disabled = true;
            scraperBtn.innerHTML = '<span class="spinner"></span> Running Scraper...';
        }

        showToast('⏳ Triggering scraper workflow...', 'info');

        const response = await fetch(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'triggerScraper',
                githubToken: GITHUB_TOKEN
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('✅ Scraper workflow started! Opening GitHub Actions...', 'success');

            // Open GitHub Actions in new tab
            setTimeout(() => {
                window.open('https://github.com/marc420-design/norwich-event-hub/actions', '_blank');
            }, 1500);

            // Reload events after 45 seconds (workflow takes ~2-3 min total)
            showToast('📊 Events will reload in 45 seconds...', 'info');
            setTimeout(async () => {
                await loadEvents();
                showToast('🔄 Events reloaded - check Pending tab', 'info');
            }, 45000);
        } else {
            throw new Error(data.message || 'Failed to trigger scraper');
        }
    } catch (error) {
        console.error('Error triggering scraper:', error);
        showToast('❌ Error: ' + error.message, 'error');
    } finally {
        // Reset button state
        const scraperBtn = document.getElementById('manual-scraper-btn');
        if (scraperBtn) {
            scraperBtn.disabled = false;
            scraperBtn.innerHTML = '🤖 Run Scraper Now';
        }
    }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(t => t.remove());

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, type === 'info' ? 5000 : 4000);
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
