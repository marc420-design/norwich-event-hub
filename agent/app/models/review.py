from sqlalchemy import String, Text, DateTime, func, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import uuid


class ReviewQueueItem(Base):
    __tablename__ = "review_queue"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: Mapped[str] = mapped_column(String(36), nullable=False)
    reason: Mapped[str] = mapped_column(String(100))  # low_confidence/unknown_venue/possible_duplicate/conflict
    notes: Mapped[str | None] = mapped_column(Text)
    duplicate_candidate_id: Mapped[str | None] = mapped_column(String(36))
    duplicate_score: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/resolved/dismissed
    resolved_at: Mapped[DateTime | None] = mapped_column(DateTime)
    resolved_by: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
