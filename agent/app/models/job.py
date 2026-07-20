from sqlalchemy import String, Text, DateTime, func, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import uuid


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_type: Mapped[str] = mapped_column(String(50))  # scrape/deduplicate/export/discover
    source_id: Mapped[str | None] = mapped_column(String(36))
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/running/done/failed
    events_found: Mapped[int] = mapped_column(Integer, default=0)
    events_added: Mapped[int] = mapped_column(Integer, default=0)
    events_updated: Mapped[int] = mapped_column(Integer, default=0)
    events_queued: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str | None] = mapped_column(Text)
    log: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[DateTime | None] = mapped_column(DateTime)
    finished_at: Mapped[DateTime | None] = mapped_column(DateTime)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
