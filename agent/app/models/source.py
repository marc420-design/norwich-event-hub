from sqlalchemy import String, Boolean, Text, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    connector_type: Mapped[str] = mapped_column(String(50))  # api/html/ics/pdf/operator
    source_type: Mapped[str] = mapped_column(String(50))     # venue/council/platform/aggregator
    priority: Mapped[int] = mapped_column(Integer, default=3)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    schedule: Mapped[str] = mapped_column(String(50), default="daily")  # hourly/daily/weekly
    last_run: Mapped[DateTime | None] = mapped_column(DateTime)
    last_success: Mapped[DateTime | None] = mapped_column(DateTime)
    error_streak: Mapped[int] = mapped_column(Integer, default=0)
    events_found_last_run: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    venue_sources: Mapped[list["VenueSource"]] = relationship("VenueSource", back_populates="source")  # noqa: F821
