/**
 * Submit REAL Norwich Events for Next 2 Months
 * Data sourced from Norwich Arts Centre, Visit Norwich, Skiddle
 * January - March 2026
 */

const https = require('https');

const API_URL = 'https://script.google.com/macros/s/AKfycbwUqbC7ZkAqO5w0POhRd_hBDBPrZDKV0I_K43lmdKbLrL0rjAAoEYwgZpc_xuzs1x0M/exec';

// REAL events from web search (Norwich Arts Centre, Visit Norwich, Skiddle)
const realEvents = [
  {
    name: "Hip Hop Night",
    date: "2026-01-16",
    time: "20:00",
    location: "Norwich Arts Centre",
    category: "nightlife",
    description: "Hip Hop night at Norwich Arts Centre featuring live performances",
    ticketLink: "https://norwichartscentre.co.uk/whats-on/",
    price: "£10.50",
    promoterName: "Norwich Arts Centre",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Country/Folk Evening",
    date: "2026-01-22",
    time: "19:30",
    location: "Norwich Arts Centre",
    category: "music",
    description: "Country and Folk music evening at Norwich Arts Centre",
    ticketLink: "https://norwichartscentre.co.uk/whats-on/",
    price: "£17.50",
    promoterName: "Norwich Arts Centre",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Rock/Pop Concert",
    date: "2026-01-27",
    time: "19:30",
    location: "Norwich Arts Centre",
    category: "music",
    description: "Rock and Pop concert at Norwich Arts Centre",
    ticketLink: "https://norwichartscentre.co.uk/whats-on/",
    price: "£21.00",
    promoterName: "Norwich Arts Centre",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Electronica/Jazz Night",
    date: "2026-01-28",
    time: "20:00",
    location: "Norwich Arts Centre",
    category: "music",
    description: "Electronica and Jazz performances at Norwich Arts Centre",
    ticketLink: "https://norwichartscentre.co.uk/whats-on/",
    price: "£12.00",
    promoterName: "Norwich Arts Centre",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Rock/Pop Show",
    date: "2026-01-29",
    time: "19:30",
    location: "Norwich Arts Centre",
    category: "music",
    description: "Rock and Pop show at Norwich Arts Centre",
    ticketLink: "https://norwichartscentre.co.uk/whats-on/",
    price: "£18.00",
    promoterName: "Norwich Arts Centre",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Norwich Science Festival - Opening Day",
    date: "2026-02-14",
    time: "10:00",
    location: "Various venues across Norwich",
    category: "community",
    description: "Norwich Science Festival half term featuring explosive family shows, science talks and hands-on activities. Runs 14-21 February 2026.",
    ticketLink: "https://www.visitnorwich.co.uk/whats-on/",
    price: "Various prices",
    promoterName: "Visit Norwich",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Synth East 2026 - Electronic Music Festival",
    date: "2026-02-20",
    time: "18:00",
    location: "Norwich Arts Centre",
    category: "music",
    description: "Electronic music festival featuring film screenings, live performances, workshops and expo. Day 1 of 2-day festival.",
    ticketLink: "https://norwichartscentre.co.uk/event/9165/",
    price: "£25-£40",
    promoterName: "Norwich Arts Centre",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Synth East 2026 - Cabaret Voltaire Headline",
    date: "2026-02-21",
    time: "19:00",
    location: "Norwich Arts Centre",
    category: "music",
    description: "Synth East Festival Day 2 with headliners Cabaret Voltaire performing. Includes expo and workshops.",
    ticketLink: "https://norwichartscentre.co.uk/event/9165/",
    price: "£30-£45",
    promoterName: "Norwich Arts Centre",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "The Specials Ltd. 'Ghost Town' 45th Anniversary",
    date: "2026-03-20",
    time: "19:30",
    location: "The Adrian Flux Waterfront (UEA)",
    category: "music",
    description: "The Specials Ltd. perform to celebrate the 45th anniversary of their iconic hit 'Ghost Town'",
    ticketLink: "https://www.skiddle.com/whats-on/Norwich/",
    price: "£25-£35",
    promoterName: "The Adrian Flux Waterfront",
    promoterEmail: "verified@norwicheventshub.com"
  },
  {
    name: "Aladdinsane - The Sound & Vision of Bowie",
    date: "2026-03-14",
    time: "19:30",
    location: "The Adrian Flux Waterfront (UEA)",
    category: "music",
    description: "Tribute concert celebrating David Bowie's music and legacy",
    ticketLink: "https://www.skiddle.com/whats-on/Norwich/",
    price: "£20-£28",
    promoterName: "The Adrian Flux Waterfront",
    promoterEmail: "verified@norwicheventshub.com"
  }
];

console.log('========================================');
console.log('SUBMITTING REAL NORWICH EVENTS');
console.log('========================================\n');
console.log(`Total events to submit: ${realEvents.length}`);
console.log('Sources: Norwich Arts Centre, Visit Norwich, Skiddle');
console.log('Date range: January 16 - March 20, 2026\n');

let successCount = 0;
let failCount = 0;

function submitEvent(event, index) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(event);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(API_URL, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            successCount++;
            console.log(`✅ [${index + 1}/${realEvents.length}] ${event.name} - ${event.date}`);
          } else {
            failCount++;
            console.log(`❌ [${index + 1}/${realEvents.length}] ${event.name} - ${result.message}`);
          }
        } catch (e) {
          failCount++;
          console.log(`❌ [${index + 1}/${realEvents.length}] ${event.name} - Parse error`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      failCount++;
      console.log(`❌ [${index + 1}/${realEvents.length}] ${event.name} - ${error.message}`);
      resolve();
    });

    req.write(postData);
    req.end();

    // Rate limit
    setTimeout(() => {}, 500);
  });
}

async function submitAll() {
  console.log('Submitting events...\n');

  for (let i = 0; i < realEvents.length; i++) {
    await submitEvent(realEvents[i], i);
    // Wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n========================================');
  console.log('SUBMISSION COMPLETE');
  console.log('========================================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\nAll events submitted as "Pending" status`);
  console.log(`Go to admin dashboard to approve: https://norwicheventshub.com/admin`);
  console.log('========================================\n');
}

submitAll();
