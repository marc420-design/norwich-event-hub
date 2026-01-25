/**
 * Update Events - Fetch from Google Sheets and save to sample-events.json
 * This script properly handles redirects and formats the data
 */

const https = require('https');
const fs = require('fs');

const API_URL = 'https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec';

console.log('========================================');
console.log('Norwich Event Hub - Update Events');
console.log('========================================\n');

console.log('[1/2] Fetching events from Google Sheets API...');

function fetchWithRedirect(url, callback) {
  https.get(url, (res) => {
    // Handle redirects
    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
      console.log('Following redirect...');
      fetchWithRedirect(res.headers.location, callback);
      return;
    }

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      callback(null, data);
    });
  }).on('error', (error) => {
    callback(error);
  });
}

fetchWithRedirect(API_URL, (error, data) => {
  if (error) {
    console.error('❌ Error fetching events:', error.message);
    process.exit(1);
  }

  try {
    console.log('[2/2] Formatting and saving to data/sample-events.json...');

    const result = JSON.parse(data);

    if (!result.success || !result.events) {
      console.error('❌ API returned unexpected format');
      console.log('Response:', data.substring(0, 200));
      process.exit(1);
    }

    const formattedData = {
      timestamp: new Date().toISOString(),
      total_events: result.events.length,
      events: result.events
    };

    fs.writeFileSync('data/sample-events.json', JSON.stringify(formattedData, null, 2));

    console.log(`\n✅ SUCCESS! Saved ${result.events.length} events to data/sample-events.json\n`);
    console.log('Events:');
    result.events.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.name} - ${event.date} at ${event.location}`);
    });

    console.log('\n========================================');
    console.log('Next steps:');
    console.log('1. Review events in data/sample-events.json');
    console.log('2. Deploy to Cloudflare Pages (git push)');
    console.log('3. Or test locally with: npm run dev');
    console.log('========================================\n');

  } catch (parseError) {
    console.error('❌ Error parsing response:', parseError.message);
    console.log('Response preview:', data.substring(0, 200));
    process.exit(1);
  }
});
