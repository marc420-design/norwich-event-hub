#!/usr/bin/env python3
"""
Norwich Events Hub Agent – CLI Runner
Usage:
  python run.py server          # Start FastAPI server
  python run.py seed            # Seed database with sources/venues
  python run.py scrape          # Scrape all active sources now
  python run.py scrape <id>     # Scrape one source by ID
  python run.py export          # Export events.json + venues.json
  python run.py dedup           # Run deduplication pass
  python run.py status          # Show system status
"""
import asyncio
import sys
import uvicorn
from rich.console import Console
from rich.table import Table
from datetime import datetime

console = Console()


def cmd_server():
    console.print("[bold cyan]Starting Norwich Events Hub API...[/bold cyan]")
    console.print("Admin UI → [link]http://localhost:8000[/link]")
    console.print("API Docs → [link]http://localhost:8000/docs[/link]")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)


async def cmd_seed():
    from app.workers.seed_sources import seed
    console.print("[cyan]Seeding database...[/cyan]")
    await seed()
    console.print("[green]✓ Seed complete[/green]")


async def cmd_scrape(source_id: str | None = None):
    from app.core.database import AsyncSessionLocal, init_db
    from app.models.source import Source
    from app.workers.ingestion_runner import run_source
    from sqlalchemy import select

    await init_db()
    async with AsyncSessionLocal() as db:
        if source_id:
            sources = [await db.get(Source, source_id)]
            if not sources[0]:
                console.print(f"[red]Source {source_id} not found[/red]")
                return
        else:
            result = await db.execute(select(Source).where(Source.active == True))
            sources = result.scalars().all()

        console.print(f"[cyan]Scraping {len(sources)} sources...[/cyan]")
        total = {"found": 0, "added": 0, "updated": 0, "queued": 0}

        for source in sources:
            try:
                console.print(f"  → {source.name}...", end="")
                stats = await run_source(source.id, db)
                console.print(f" found={stats['found']} added={stats['added']} queued={stats['queued']}")
                for k in total:
                    total[k] += stats.get(k, 0)
            except Exception as e:
                console.print(f" [red]ERROR: {e}[/red]")

        console.print(f"\n[green]✓ Done: {total}[/green]")


async def cmd_export():
    from app.core.database import AsyncSessionLocal, init_db
    from app.workers.exporter import run_export
    await init_db()
    async with AsyncSessionLocal() as db:
        result = await run_export(db)
        console.print(f"[green]✓ Exported {result['events']} events, {result['venues']} venues[/green]")
        console.print("  → exports/events.json")
        console.print("  → exports/venues.json")


async def cmd_dedup():
    from app.core.database import AsyncSessionLocal, init_db
    from app.workers.deduplicator import run_deduplication_pass
    await init_db()
    async with AsyncSessionLocal() as db:
        result = await run_deduplication_pass(db)
        console.print(f"[green]✓ Dedup complete: {result}[/green]")


async def cmd_status():
    from app.core.database import AsyncSessionLocal, init_db
    from app.models.event import Event
    from app.models.source import Source
    from app.models.review import ReviewQueueItem
    from sqlalchemy import select, func
    await init_db()
    async with AsyncSessionLocal() as db:
        total = (await db.execute(select(func.count()).select_from(Event))).scalar()
        approved = (await db.execute(select(func.count()).select_from(Event).where(Event.status == "approved"))).scalar()
        pending = (await db.execute(select(func.count()).select_from(Event).where(Event.status == "pending"))).scalar()
        queue = (await db.execute(select(func.count()).select_from(ReviewQueueItem).where(ReviewQueueItem.status == "pending"))).scalar()
        sources = (await db.execute(select(func.count()).select_from(Source).where(Source.active == True))).scalar()

        t = Table(title="Norwich Events Hub — Status")
        t.add_column("Metric", style="cyan")
        t.add_column("Value", style="white")
        t.add_row("Total Events", str(total))
        t.add_row("Approved", str(approved))
        t.add_row("Pending", str(pending))
        t.add_row("Review Queue", str(queue))
        t.add_row("Active Sources", str(sources))
        console.print(t)


if __name__ == "__main__":
    args = sys.argv[1:]
    cmd = args[0] if args else "server"

    if cmd == "server":
        cmd_server()
    elif cmd == "seed":
        asyncio.run(cmd_seed())
    elif cmd == "scrape":
        asyncio.run(cmd_scrape(args[1] if len(args) > 1 else None))
    elif cmd == "export":
        asyncio.run(cmd_export())
    elif cmd == "dedup":
        asyncio.run(cmd_dedup())
    elif cmd == "status":
        asyncio.run(cmd_status())
    else:
        console.print(__doc__)
