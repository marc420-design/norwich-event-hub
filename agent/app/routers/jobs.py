from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.job import Job
from app.models.source import Source

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/")
async def list_jobs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).order_by(Job.created_at.desc()).limit(limit))
    return [
        {c.name: getattr(j, c.name) for c in j.__table__.columns}
        for j in result.scalars().all()
    ]


@router.post("/scrape/{source_id}")
async def trigger_scrape(source_id: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    source = await db.get(Source, source_id)
    if not source:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Source not found")

    job = Job(job_type="scrape", source_id=source_id, status="pending")
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(_run_scrape_job, job.id, source_id)
    return {"job_id": job.id, "status": "queued"}


@router.post("/scrape-all")
async def trigger_scrape_all(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Source).where(Source.active == True))
    sources = result.scalars().all()

    job_ids = []
    for source in sources:
        job = Job(job_type="scrape", source_id=source.id, status="pending")
        db.add(job)
        await db.commit()
        await db.refresh(job)
        background_tasks.add_task(_run_scrape_job, job.id, source.id)
        job_ids.append(job.id)

    return {"queued": len(job_ids), "job_ids": job_ids}


@router.post("/export")
async def trigger_export(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    job = Job(job_type="export", status="pending")
    db.add(job)
    await db.commit()
    await db.refresh(job)
    background_tasks.add_task(_run_export_job, job.id)
    return {"job_id": job.id, "status": "queued"}


async def _run_scrape_job(job_id: str, source_id: str):
    """Background task: run the ingestion worker for one source."""
    from app.core.database import AsyncSessionLocal
    from app.workers.ingestion_runner import run_source
    from datetime import datetime

    async with AsyncSessionLocal() as db:
        job = await db.get(Job, job_id)
        job.status = "running"
        job.started_at = datetime.utcnow()
        await db.commit()

        try:
            stats = await run_source(source_id, db)
            job.status = "done"
            job.events_found = stats.get("found", 0)
            job.events_added = stats.get("added", 0)
            job.events_updated = stats.get("updated", 0)
            job.events_queued = stats.get("queued", 0)
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
        finally:
            job.finished_at = datetime.utcnow()
            await db.commit()


async def _run_export_job(job_id: str):
    from app.core.database import AsyncSessionLocal
    from app.workers.exporter import run_export
    from datetime import datetime

    async with AsyncSessionLocal() as db:
        job = await db.get(Job, job_id)
        job.status = "running"
        job.started_at = datetime.utcnow()
        await db.commit()
        try:
            await run_export(db)
            job.status = "done"
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
        finally:
            job.finished_at = datetime.utcnow()
            await db.commit()
