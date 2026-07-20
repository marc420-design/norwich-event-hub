from sqlalchemy import String, Boolean, Text, Integer, Float, DateTime, func, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    start_datetime: Mapped[DateTime | None] = mapped_column(DateTime)
    end_datetime: Mapped[DateTime | None] = mapped_column(DateTime)
    all_day: Mapped[bool] = mapped_column(Boolean, default=False)
    venue_id: Mapped[str | None] = mapped_column(String(36))
    venue_name: Mapped[str | None] = mapped_column(String(255))  # raw, before linking
    organiser_id: Mapped[str | None] = mapped_column(String(36))
    ticket_url: Mapped[str | None] = mapped_column(Text)
    price_min: Mapped[float | None] = mapped_column(Numeric(10, 2))
    price_max: Mapped[float | None] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), default="GBP")
    is_free: Mapped[bool] = mapped_column(Boolean, default=False)
    age_restriction: Mapped[str | None] = mapped_column(String(20))
    tags: Mapped[str] = mapped_column(Text, default="[]")        # JSON
    images: Mapped[str] = mapped_column(Text, default="[]")      # JSON
    category: Mapped[str] = mapped_column(String(100), default="general")
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/approved/rejected/cancelled
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    editors_choice: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence_score: Mapped[int] = mapped_column(Integer, default=0)
    source_id: Mapped[str | None] = mapped_column(String(36))
    source_url: Mapped[str | None] = mapped_column(Text)
    source_name: Mapped[str | None] = mapped_column(String(255))
    canonical: Mapped[bool] = mapped_column(Boolean, default=True)
    duplicate_of: Mapped[str | None] = mapped_column(String(36))
    content_hash: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    venue: Mapped["Venue | None"] = relationship("Venue", back_populates="events")  # noqa: F821
    observations: Mapped[list["EventObservation"]] = relationship("EventObservation", back_populates="event")


class EventObservation(Base):
    """Evidence record for each time an event was seen at a source."""
    __tablename__ = "event_observations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: Mapped[str] = mapped_column(String(36), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(36))
    source_url: Mapped[str] = mapped_column(Text)
    observed_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    raw_data: Mapped[str | None] = mapped_column(Text)       # raw JSON/HTML snippet
    screenshot_path: Mapped[str | None] = mapped_column(Text)
    extracted_json: Mapped[str | None] = mapped_column(Text)
    content_hash: Mapped[str | None] = mapped_column(String(64))

    event: Mapped["Event"] = relationship("Event", back_populates="observations")
