/**
 * Quick script to fetch events from Google Sheets API and save to sample-events.json
 * Run with: node fetch-events.js
 */

const https = require('https');
const fs = require('fs');

const API_URL = 'https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec';

console.log('Fetching events from Google Sheets API...');

https.get(API_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);

      if (result.success && result.events) {
        const eventsData = {
          timestamp: new Date().toISOString(),
          total_events: result.events.length,
          events: result.events
        };

        // Save to data/sample-events.json
        fs.writeFileSync('data/sample-events.json', JSON.stringify(eventsData, null, 2));

        console.log(`✅ Success! Saved ${result.events.length} events to data/sample-events.json`);
        console.log('\nEvents saved:');
        result.events.forEach((event, i) => {
          console.log(`  ${i + 1}. ${event.name} - ${event.date}`);
        });
      } else {
        console.error('❌ API returned unexpected format:', result);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Response:', data);
    }
  });
}).on('error', (error) => {
  console.error('❌ Error fetching events:', error.message);
});
