from sqlalchemy import String, Float, Boolean, Text, ARRAY, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import uuid


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    aliases: Mapped[str] = mapped_column(Text, default="[]")  # JSON list
    category: Mapped[str] = mapped_column(String(100), default="general")
    address: Mapped[str | None] = mapped_column(Text)
    postcode: Mapped[str | None] = mapped_column(String(20))
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    website: Mapped[str | None] = mapped_column(Text)
    inside_norwich: Mapped[bool] = mapped_column(Boolean, default=True)
    allowed_outside_boundary: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    events: Mapped[list["Event"]] = relationship("Event", back_populates="venue")  # noqa: F821
    venue_sources: Mapped[list["VenueSource"]] = relationship("VenueSource", back_populates="venue")  # noqa: F821


class VenueSource(Base):
    __tablename__ = "venue_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id: Mapped[str] = mapped_column(String(36), nullable=False)
    source_id: Mapped[str] = mapped_column(String(36), nullable=False)
    scrape_url: Mapped[str | None] = mapped_column(Text)
    scrape_method: Mapped[str] = mapped_column(String(50), default="html")  # html/api/ics/pdf/operator
    last_scraped: Mapped[DateTime | None] = mapped_column(DateTime)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    venue: Mapped["Venue"] = relationship("Venue", back_populates="venue_sources")
    source: Mapped["Source"] = relationship("Source", back_populates="venue_sources")  # noqa: F821
