from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.schemas import SourceCreate, SourceOut
from app.models.source import Source

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("/", response_model=list[SourceOut])
async def list_sources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Source).order_by(Source.priority, Source.name))
    return result.scalars().all()


@router.post("/", response_model=SourceOut, status_code=201)
async def create_source(data: SourceCreate, db: AsyncSession = Depends(get_db)):
    source = Source(**data.model_dump())
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return source


@router.patch("/{source_id}")
async def update_source(source_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    source = await db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    for k, v in data.items():
        if hasattr(source, k):
            setattr(source, k, v)
    await db.commit()
    return {"success": True}


@router.delete("/{source_id}")
async def delete_source(source_id: str, db: AsyncSession = Depends(get_db)):
    source = await db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    source.active = False
    await db.commit()
    return {"success": True}
