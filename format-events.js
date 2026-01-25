// Read the temp file and format it properly
const fs = require('fs');

const rawData = fs.readFileSync('temp-events.json', 'utf8');
const apiResponse = JSON.parse(rawData);

const formattedData = {
  timestamp: new Date().toISOString(),
  total_events: apiResponse.events.length,
  events: apiResponse.events
};

fs.writeFileSync('data/sample-events.json', JSON.stringify(formattedData, null, 2));

console.log(`✅ Saved ${apiResponse.events.length} events to data/sample-events.json\n`);
console.log('Events:');
apiResponse.events.forEach((event, i) => {
  console.log(`  ${i + 1}. ${event.name} - ${event.date} at ${event.location}`);
});
