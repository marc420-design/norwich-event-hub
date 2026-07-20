# Norwich Events Hub – Agent System Setup Guide

## What this builds

A full autonomous event aggregation engine that:
- Scrapes 20+ Norwich event sources automatically (daily)
- Uses Claude AI to parse and normalise events
- Deduplicates with fuzzy matching (auto-merges near-identical events)
- Provides a review queue for low-confidence events
- Exports `events.json` consumed by your website in real time
- Feeds your existing site via the `agent-bridge.js` layer

---

## Prerequisites

- Python 3.11+
- PostgreSQL 15+ (or use SQLite for quick start – see below)
- An Anthropic API key (for AI parsing)

---

## Quick Start (Windows)

### 1. Create virtual environment

```bat
cd "C:\Users\marc\Desktop\new company\agent"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Playwright browsers (for operator connector)

```bat
playwright install chromium
```

### 3. Configure environment

```bat
copy .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql+asyncpg://norwich:norwich@localhost:5432/norwich_events
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

### 4. Set up PostgreSQL

```sql
-- In psql or pgAdmin:
CREATE USER norwich WITH PASSWORD 'norwich';
CREATE DATABASE norwich_events OWNER norwich;
```

> **SQLite alternative (no Postgres needed):**
> Change DATABASE_URL to: `sqlite+aiosqlite:///./norwich_events.db`
> And install: `pip install aiosqlite`

### 5. Initialise database + seed sources

```bat
python run.py seed
```

This creates all tables and seeds 20+ Norwich event sources + venues.

### 6. Start the server

```bat
python run.py server
```

Or double-click `start.bat`.

Server runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 7. Open the Agent Admin UI

Open `agent/agent-admin.html` in your browser.

It connects to `http://localhost:8000` automatically.

---

## Running your first scrape

### Option A: Via Admin UI

1. Open `agent-admin.html`
2. Click **"Run Scrape All"** in the top bar
3. Watch the Jobs page for progress
4. Click **Review Queue** to approve events

### Option B: Via CLI

```bat
python run.py scrape          # All sources
python run.py scrape <id>     # One source by ID
python run.py export          # Generate events.json
python run.py status          # Show stats
```

---

## How events reach your website

### Mode A: Static JSON (Recommended for Cloudflare Pages)

After each scrape, run export:
```bat
python run.py export
```

This writes `agent/exports/events.json` and `agent/exports/venues.json`.

Your website picks these up via `agent-bridge.js` which is already added to:
- `index.html`
- `today.html`
- `directory.html`
- `nightlife.html`
- `culture.html`

**For Cloudflare Pages**: Copy `exports/events.json` to your repo root and commit, or use the API in Mode B.

### Mode B: Live API (for local dev or self-hosted)

`agent-bridge.js` automatically tries `http://localhost:8000/api/v1` first.

Your website loads real-time data from the agent API with no extra config needed.

---

## Architecture

```
┌─────────────────────────────────────────┐
│   Scheduler (daily @ 3 AM)              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Ingestion Runner                      │
│   For each active Source:               │
│     1. Connector.run() → raw events     │
│     2. AI normalise (Claude Haiku)      │
│     3. Deduplication check              │
│     4. Save to PostgreSQL               │
│     5. Queue low-confidence for review  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   PostgreSQL Database                   │
│   venues / sources / events /           │
│   event_observations / review_queue /   │
│   jobs                                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   FastAPI  (http://localhost:8000)      │
│   GET /api/v1/events                    │
│   GET /api/v1/exports (JSON files)      │
│   POST /api/v1/jobs/scrape-all          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Website (norwicheventshub.com)        │
│   agent-bridge.js → window.eventsData  │
│   home.js / today.js / directory.js    │
└─────────────────────────────────────────┘
```

---

## Connector types

| Type | Use case | Auto-scheduled |
|------|----------|----------------|
| `html` | Most venue/platform websites | ✅ Daily |
| `ics` | Calendar feed URLs (.ics) | ✅ Daily |
| `api` | Eventbrite, Skiddle APIs | ✅ Daily |
| `operator` | JS-heavy sites (Playwright) | Manual only |

---

## Adding a new source (Admin UI)

1. Open Agent Admin → Sources
2. Click **+ Add Source**
3. Enter Name, URL, Connector Type, Source Type
4. Click **Add Source**
5. Click **▶ Run** to test immediately

---

## Review Queue workflow

Events are queued for review when:
- Confidence score < 50 (AI uncertain about data)
- Possible duplicate detected (score 70–91%)
- Unknown venue outside Norwich boundary
- Operator-captured events

Admin actions:
- **✓ Approve** → goes live on website
- **✗ Reject** → hidden from website
- **⟳ Merge** → merge into canonical event

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/events/` | List approved events |
| GET | `/api/v1/events/today` | Today's events |
| PATCH | `/api/v1/events/{id}/status` | Approve/reject |
| GET | `/api/v1/venues/` | List venues |
| POST | `/api/v1/venues/` | Add venue |
| GET | `/api/v1/sources/` | List sources |
| POST | `/api/v1/sources/` | Add source |
| GET | `/api/v1/review/` | Review queue |
| POST | `/api/v1/review/{id}/action` | Approve/reject/merge |
| POST | `/api/v1/jobs/scrape-all` | Trigger full scrape |
| POST | `/api/v1/jobs/export` | Trigger JSON export |
| GET | `/api/v1/stats/` | Dashboard stats |
| GET | `/api/v1/health` | Health check |

Full interactive docs: `http://localhost:8000/docs`

---

## Deployment (production)

### On a VPS / Windows Server

1. Install PostgreSQL, Python 3.11+
2. Clone/copy the `agent/` folder
3. Create `.env` from `.env.example`
4. Run `python run.py seed`
5. Use a process manager:

```bat
:: Using NSSM (Non-Sucking Service Manager)
nssm install NorwichEventsAgent python run.py server
nssm start NorwichEventsAgent
```

### With Cloudflare Pages (static export mode)

1. Run `python run.py export` on your local machine or a cron server
2. Commit `exports/events.json` to your repo
3. `agent-bridge.js` will serve it from `/exports/events.json`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL or SQLite connection string |
| `ANTHROPIC_API_KEY` | ✅ | For AI event parsing |
| `GOOGLE_APPS_SCRIPT_URL` | Optional | Sync approved events back to Google Sheets |
| `AUTO_APPROVE_THRESHOLD` | Optional | Confidence % for auto-approval (default 80) |
| `MIN_QUALITY_SCORE` | Optional | Min confidence to skip review queue (default 50) |
| `SCRAPE_DAYS_AHEAD` | Optional | How far ahead to look (default 90 days) |
| `REQUEST_DELAY` | Optional | Seconds between requests per domain (default 2) |

---

## File Structure

```
agent/
├── app/
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   ├── config.py        # Settings from .env
│   │   ├── database.py      # SQLAlchemy async engine
│   │   └── schemas.py       # Pydantic models
│   ├── models/              # Database ORM models
│   │   ├── event.py
│   │   ├── venue.py
│   │   ├── source.py
│   │   ├── review.py
│   │   └── job.py
│   ├── routers/             # API route handlers
│   │   ├── events.py
│   │   ├── venues.py
│   │   ├── sources.py
│   │   ├── review.py
│   │   ├── jobs.py
│   │   └── stats.py
│   ├── connectors/          # Source connectors
│   │   ├── base.py          # Abstract base class
│   │   ├── html_connector.py
│   │   ├── ics_connector.py
│   │   ├── api_connector.py
│   │   └── operator_connector.py
│   └── workers/             # Processing engines
│       ├── normaliser.py    # AI-powered normalisation
│       ├── deduplicator.py  # Fuzzy deduplication
│       ├── change_detector.py
│       ├── ingestion_runner.py
│       ├── exporter.py      # JSON export
│       ├── scheduler.py     # Background scheduler
│       └── seed_sources.py  # DB seeder
├── agent-admin.html         # Standalone admin UI
├── exports/                 # Generated JSON files
├── evidence/                # Screenshots & raw captures
├── run.py                   # CLI entry point
├── start.bat                # Windows launcher
├── requirements.txt
└── .env.example
```
