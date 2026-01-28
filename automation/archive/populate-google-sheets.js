/**
 * Norwich Event Hub - Google Sheets Data Populator
 *
 * This script uploads sample events to your Google Sheet
 * Run this ONCE after deploying your Google Apps Script
 *
 * USAGE:
 * 1. Open your browser console on norwicheventshub.com
 * 2. Paste this entire script
 * 3. Run: await populateGoogleSheets()
 * 4. Check your Google Sheet - events should appear!
 */

async function populateGoogleSheets() {
    console.log('🚀 Starting Google Sheets population...');

    // Your Google Apps Script Web App URL
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwz2jUvP7FL6mwQdGm9infs9g31iaOFwqrXlgqDX5lKR8LSHatkkWMTV5z2sbhTKzA/exec';

    // Load sample events
    const response = await fetch('data/sample-events.json');
    const data = await response.json();

    console.log(`📊 Found ${data.events.length} events to upload`);

    let successCount = 0;
    let errorCount = 0;

    // Upload each event
    for (let i = 0; i < data.events.length; i++) {
        const event = data.events[i];

        try {
            console.log(`⏳ Uploading ${i + 1}/${data.events.length}: ${event.name}...`);

            // Transform event data to match submission form format
            const submissionData = {
                name: event.name,
                date: event.date.split('T')[0], // Convert to YYYY-MM-DD
                time: event.time,
                location: event.location,
                category: event.category,
                description: event.description,
                ticketLink: event.ticketLink || '',
                promoterName: 'Norwich Event Hub',
                promoterEmail: 'events@norwicheventshub.com',
                promoterPhone: '',
                // Add custom fields
                price: event.price,
                address: event.address,
                vibe: event.vibe || '',
                bestFor: event.bestFor || '',
                featured: event.featured ? 'Yes' : 'No',
                status: 'Approved' // Pre-approve sample events
            };

            // Submit to Google Sheets
            const result = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            successCount++;
            console.log(`✅ ${event.name} uploaded successfully`);

            // Wait 500ms between uploads to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            errorCount++;
            console.error(`❌ Failed to upload ${event.name}:`, error);
        }
    }

    console.log(`\n✨ Upload complete!`);
    console.log(`✅ Success: ${successCount} events`);
    console.log(`❌ Errors: ${errorCount} events`);
    console.log(`\n🔍 Check your Google Sheet to verify the data`);
    console.log(`📱 Refresh the page to see events!`);
}

// Alternative: Upload via direct Google Sheets API (requires API key)
async function populateViaDirectAPI() {
    console.log('⚠️ This method requires Google Sheets API setup');
    console.log('📖 See: https://developers.google.com/sheets/api/quickstart/js');

    // Load sample events
    const response = await fetch('data/sample-events.json');
    const data = await response.json();

    const SHEET_ID = '1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU';
    const RANGE = 'Event Submissions!A2:N'; // Starting from row 2 (after headers)

    // Transform events to rows
    const rows = data.events.map(event => [
        new Date().toISOString(), // Timestamp
        event.name,
        event.date.split('T')[0],
        event.time,
        event.location,
        event.category,
        event.description,
        event.ticketLink || '',
        'Norwich Event Hub', // Promoter Name
        'events@norwicheventshub.com', // Promoter Email
        '', // Promoter Phone
        'Approved', // Status
        event.id, // Event ID
        event.price || '', // Price
        event.address || '', // Address
        event.vibe || '', // Vibe
        event.bestFor || '', // Best For
        event.featured ? 'Yes' : 'No' // Featured
    ]);

    console.log(`📊 Prepared ${rows.length} rows for upload`);
    console.log('⚠️ You need to implement Google Sheets API authentication');

    return rows;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { populateGoogleSheets, populateViaDirectAPI };
}

console.log('✅ Google Sheets Populator loaded!');
console.log('📖 Run: await populateGoogleSheets()');
