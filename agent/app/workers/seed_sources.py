"""
Seed the database with all known Norwich event sources.
Run once: python -m app.workers.seed_sources
"""
import asyncio
from app.core.database import AsyncSessionLocal, init_db
from app.models.source import Source
from app.models.venue import Venue


SOURCES = [
    # Ticket Platforms
    {"name": "Skiddle - Norwich", "url": "https://www.skiddle.com/whats-on/Norwich/", "connector_type": "html", "source_type": "platform", "priority": 1, "schedule": "daily"},
    {"name": "Eventbrite - Norwich", "url": "https://www.eventbrite.co.uk/d/united-kingdom--norwich/events/", "connector_type": "html", "source_type": "platform", "priority": 1, "schedule": "daily"},
    {"name": "Ents24 - Norwich", "url": "https://www.ents24.com/uk/norwich/", "connector_type": "html", "source_type": "platform", "priority": 1, "schedule": "daily"},
    {"name": "SeeTickets - Norwich", "url": "https://www.seetickets.com/search?q=norwich", "connector_type": "html", "source_type": "platform", "priority": 2, "schedule": "daily"},
    {"name": "Ticketmaster - Norwich", "url": "https://www.ticketmaster.co.uk/browse/all-categories/music/all/?city=Norwich", "connector_type": "html", "source_type": "platform", "priority": 2, "schedule": "daily"},
    {"name": "Dice - Norwich", "url": "https://dice.fm/city/norwich", "connector_type": "html", "source_type": "platform", "priority": 2, "schedule": "daily"},
    {"name": "Resident Advisor - Norwich", "url": "https://ra.co/events/uk/norwich", "connector_type": "html", "source_type": "platform", "priority": 2, "schedule": "daily"},
    {"name": "Songkick - Norwich", "url": "https://www.songkick.com/metro-areas/24852-uk-norwich", "connector_type": "html", "source_type": "platform", "priority": 2, "schedule": "daily"},
    # Official / Council
    {"name": "Norwich City Council Events", "url": "https://www.norwich.gov.uk/events", "connector_type": "html", "source_type": "council", "priority": 1, "schedule": "daily"},
    {"name": "Visit Norwich", "url": "https://www.visitnorwich.co.uk/whats-on/", "connector_type": "html", "source_type": "aggregator", "priority": 1, "schedule": "daily"},
    # Venues
    {"name": "The Halls Norwich", "url": "https://www.thehallsnorwich.co.uk/events", "connector_type": "html", "source_type": "venue", "priority": 1, "schedule": "daily"},
    {"name": "Epic Studios Norwich", "url": "https://www.epicstudiosnorwich.co.uk/events", "connector_type": "html", "source_type": "venue", "priority": 1, "schedule": "daily"},
    {"name": "Norwich Arts Centre", "url": "https://www.norwichartscentre.co.uk/events", "connector_type": "html", "source_type": "venue", "priority": 1, "schedule": "daily"},
    {"name": "Theatre Royal Norwich", "url": "https://www.theatreroyalnorwich.co.uk/whats-on", "connector_type": "html", "source_type": "venue", "priority": 1, "schedule": "daily"},
    {"name": "Norwich Playhouse", "url": "https://www.norwichplayhouse.co.uk/whats-on", "connector_type": "html", "source_type": "venue", "priority": 1, "schedule": "daily"},
    {"name": "UEA Waterfront", "url": "https://www.uea.su/venues/waterfront", "connector_type": "html", "source_type": "venue", "priority": 1, "schedule": "daily"},
    {"name": "Norwich Cathedral Events", "url": "https://www.cathedral.org.uk/visit/events", "connector_type": "html", "source_type": "venue", "priority": 2, "schedule": "daily"},
    {"name": "Norwich Castle Museum", "url": "https://www.museums.norfolk.gov.uk/norwich-castle/events", "connector_type": "html", "source_type": "venue", "priority": 2, "schedule": "daily"},
    {"name": "Open Norwich", "url": "https://opennorwich.co.uk/events", "connector_type": "html", "source_type": "venue", "priority": 2, "schedule": "daily"},
    {"name": "Norwich Forum Events", "url": "https://www.theforumnorwich.co.uk/whats-on", "connector_type": "html", "source_type": "venue", "priority": 1, "schedule": "daily"},
    # Norfolk Showground (allowed outside boundary)
    {"name": "Norfolk Showground", "url": "https://www.norfolkshowground.co.uk/events", "connector_type": "html", "source_type": "venue", "priority": 2, "schedule": "daily"},
    # University
    {"name": "UEA Events", "url": "https://www.uea.ac.uk/about/whats-on", "connector_type": "html", "source_type": "university", "priority": 2, "schedule": "daily"},
]

VENUES = [
    {"name": "The Halls Norwich", "slug": "the-halls-norwich", "category": "gigs", "address": "St Andrew's Plain, Norwich", "postcode": "NR3 1AU", "lat": 52.6294, "lng": 1.2951},
    {"name": "Epic Studios Norwich", "slug": "epic-studios-norwich", "category": "nightlife", "address": "Lower Clarence Rd, Norwich", "postcode": "NR1 1LF", "lat": 52.6255, "lng": 1.3017},
    {"name": "Norwich Arts Centre", "slug": "norwich-arts-centre", "category": "culture", "address": "51 St Benedicts Street, Norwich", "postcode": "NR2 4PG", "lat": 52.6318, "lng": 1.2924},
    {"name": "Theatre Royal Norwich", "slug": "theatre-royal-norwich", "category": "theatre", "address": "Theatre St, Norwich", "postcode": "NR2 1RL", "lat": 52.6302, "lng": 1.2948},
    {"name": "Norwich Playhouse", "slug": "norwich-playhouse", "category": "theatre", "address": "42-58 St George's Street, Norwich", "postcode": "NR3 1AB", "lat": 52.6306, "lng": 1.2948},
    {"name": "UEA Waterfront", "slug": "uea-waterfront", "category": "gigs", "address": "University of East Anglia, Norwich", "postcode": "NR4 7TJ", "lat": 52.6231, "lng": 1.2410},
    {"name": "Norfolk Showground", "slug": "norfolk-showground", "category": "festivals", "address": "New Costessey, Norwich", "postcode": "NR5 0TT", "lat": 52.6244, "lng": 1.2177, "allowed_outside_boundary": True, "inside_norwich": False},
    {"name": "Norwich Cathedral", "slug": "norwich-cathedral", "category": "culture", "address": "The Close, Norwich", "postcode": "NR1 4DH", "lat": 52.6330, "lng": 1.3001},
    {"name": "Norwich Castle", "slug": "norwich-castle", "category": "culture", "address": "Castle Meadow, Norwich", "postcode": "NR1 3JU", "lat": 52.6281, "lng": 1.2963},
    {"name": "Norwich Forum", "slug": "norwich-forum", "category": "community", "address": "Millennium Plain, Norwich", "postcode": "NR2 1TF", "lat": 52.6289, "lng": 1.2939},
]


async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        # Seed sources
        for s in SOURCES:
            existing = await db.execute(select(Source).where(Source.url == s["url"]))
            if not existing.scalar_one_or_none():
                db.add(Source(**s))

        # Seed venues
        for v in VENUES:
            existing = await db.execute(select(Venue).where(Venue.slug == v["slug"]))
            if not existing.scalar_one_or_none():
                db.add(Venue(**v))

        await db.commit()
        print(f"Seeded {len(SOURCES)} sources and {len(VENUES)} venues")


if __name__ == "__main__":
    asyncio.run(seed())
