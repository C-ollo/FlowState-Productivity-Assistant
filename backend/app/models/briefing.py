from datetime import datetime, date
from typing import TYPE_CHECKING
import uuid
import enum

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class BriefingType(str, enum.Enum):
    """Type of briefing."""

    DAILY_MORNING = "daily_morning"
    DAILY_EVENING = "daily_evening"
    WEEKLY = "weekly"
    ON_DEMAND = "on_demand"


class Briefing(Base):
    """AI-generated briefing."""

    __tablename__ = "briefings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    briefing_date: Mapped[date] = mapped_column(Date, index=True)
    briefing_type: Mapped[BriefingType] = mapped_column(
        Enum(BriefingType), default=BriefingType.DAILY_MORNING
    )

    # AI-generated content
    content: Mapped[str] = mapped_column(Text)

    # Snapshot of data used to generate briefing (JSON)
    data_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="briefings")
