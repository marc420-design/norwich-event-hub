"""
Norwich event sources for the Botasaurus scraper.
'request' = fast HTTP (no JavaScript needed)
'browser' = headless Chromium (JS-heavy pages)
"""

SOURCES = [
    # ── Official Norwich venue feeds (most reliable) ──────────────
    {
        "name": "Visit Norwich",
        "url": "https://www.visitnorwich.co.uk/whats-on/",
        "type": "request",
    },
    {
        "name": "Norwich Arts Centre",
        "url": "https://www.norwichartscentre.co.uk/events",
        "type": "request",
    },
    {
        "name": "Theatre Royal Norwich",
        "url": "https://www.theatreroyalnorwich.co.uk/whats-on",
        "type": "request",
    },
    {
        "name": "Norwich Playhouse",
        "url": "https://www.norwichplayhouse.co.uk/whats-on",
        "type": "request",
    },
    {
        "name": "The Halls Norwich",
        "url": "https://www.thehallsnorwich.co.uk/events",
        "type": "request",
    },
    {
        "name": "The Forum Norwich",
        "url": "https://www.theforumnorwich.co.uk/whats-on",
        "type": "request",
    },
    {
        "name": "UEA Waterfront",
        "url": "https://www.ueaticketbookings.co.uk/whats-on/",
        "type": "request",
    },
    {
        "name": "Norwich Cathedral",
        "url": "https://cathedral.org.uk/whats-on",
        "type": "request",
    },
    {
        "name": "Norwich Castle Museum",
        "url": "https://www.museums.norfolk.gov.uk/norwich-castle/whats-on",
        "type": "request",
    },
    {
        "name": "Epic Studios Norwich",
        "url": "https://www.epicstudios.co.uk/events",
        "type": "request",
    },
    {
        "name": "Open Norwich",
        "url": "https://opennorwich.co.uk/events",
        "type": "request",
    },
    {
        "name": "Norfolk Showground",
        "url": "https://www.norfolkshowground.co.uk/events",
        "type": "request",
    },
    {
        "name": "Norwich City Council Events",
        "url": "https://www.norwich.gov.uk/events",
        "type": "request",
    },
    {
        "name": "UEA Events",
        "url": "https://www.uea.ac.uk/about/news-and-events/events",
        "type": "request",
    },
    {
        "name": "Norwich Puppet Theatre",
        "url": "https://www.puppettheatre.co.uk/whats-on/",
        "type": "request",
    },
    {
        "name": "Norwich Science Festival",
        "url": "https://www.norwichsciencefestival.co.uk/events",
        "type": "request",
    },
    {
        "name": "Sainsbury Centre",
        "url": "https://sainsburycentre.ac.uk/whats-on/",
        "type": "request",
    },
    # ── Norwich nightlife & club venues ────────────────────────────
    {
        "name": "Gonzo's Two Room",
        "url": "https://www.gonzostworoom.com/events/",
        "type": "request",
    },
    {
        "name": "Gonzo's Fatsoma",
        "url": "https://www.fatsoma.com/p/gonzostworoom",
        "type": "browser",
    },
    {
        "name": "Kudos Norwich",
        "url": "https://www.fatsoma.com/p/kudos-norwich",
        "type": "browser",
    },
    {
        "name": "Kudos FIXR",
        "url": "https://fixr.co/venue/kudos-bar-and-nightclub-norwich-21386",
        "type": "browser",
    },
    # ── Aggregators (JS-heavy — use browser mode) ─────────────────
    {
        "name": "Skiddle Norwich",
        "url": "https://www.skiddle.com/whats-on/Norwich/",
        "type": "browser",
    },
    {
        "name": "Eventbrite Norwich",
        "url": "https://www.eventbrite.co.uk/d/united-kingdom--norwich/events/",
        "type": "browser",
    },
    {
        "name": "Ents24 Norwich",
        "url": "https://www.ents24.com/norwich-events",
        "type": "request",
    },
    {
        "name": "See Tickets Norwich",
        "url": "https://www.seetickets.com/tour/search?q=norwich",
        "type": "request",
    },
    {
        "name": "Ticketmaster Norwich",
        "url": "https://www.ticketmaster.co.uk/search?q=norwich",
        "type": "request",
    },
]
