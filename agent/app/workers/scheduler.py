"""
Background Scheduler
Runs ingestion jobs on schedule without requiring an external task queue.
Runs in its own thread alongside FastAPI.
"""
import asyncio
import threading
from datetime import datetime, timedelta
from sqlalchemy import select
import schedule
import time
from rich.console import Console

console = Console()


def _run_schedule():
    """Worker thread: runs the schedule loop."""
    while True:
        schedule.run_pending()
        time.sleep(30)


def start_scheduler():
    """Register all jobs and start the scheduler thread."""
    # Daily jobs at 3 AM
    schedule.every().day.at("03:00").do(_job_wrapper, "daily")
    # Weekly discovery on Monday
    schedule.every().monday.at("02:00").do(_job_wrapper, "weekly")

    t = threading.Thread(target=_run_schedule, daemon=True)
    t.start()
    console.log("Scheduler started")


def _job_wrapper(schedule_type: str):
    """Wrapper to run async jobs from the sync schedule."""
    asyncio.run(_run_scheduled_jobs(schedule_type))


async def _run_scheduled_jobs(schedule_type: str):
    from app.core.database import AsyncSessionLocal
    from app.models.source import Source
    from app.workers.ingestion_runner import run_source
    from app.workers.exporter import run_export
    from app.models.job import Job

    console.log(f"Running scheduled jobs: {schedule_type}")

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Source).where(Source.active == True, Source.schedule == schedule_type)
        )
        sources = result.scalars().all()

        for source in sources:
            job = Job(job_type="scrape", source_id=source.id, status="running", started_at=datetime.utcnow())
            db.add(job)
            await db.commit()
            try:
                stats = await run_source(source.id, db)
                job.status = "done"
                job.events_found = stats.get("found", 0)
                job.events_added = stats.get("added", 0)
            except Exception as e:
                job.status = "failed"
                job.error_message = str(e)
                console.log(f"Job failed for {source.name}: {e}")
            finally:
                job.finished_at = datetime.utcnow()
                await db.commit()

        # Export after all sources done
        await run_export(db)
        console.log(f"Scheduled run complete: {len(sources)} sources processed")
