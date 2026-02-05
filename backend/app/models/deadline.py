from datetime import datetime
from typing import TYPE_CHECKING
import uuid
import enum

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.item import Item
    from app.models.reminder import Reminder
    from app.models.task import Task
    from app.models.user import User


class DeadlineStatus(str, enum.Enum):
    """Deadline status."""

    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class Deadline(Base):
    """Deadline extracted from items by AI."""

    __tablename__ = "deadlines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    item_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("items.id", ondelete="SET NULL"), nullable=True
    )

    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

    # AI extraction metadata
    source_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # Original text with date
    confidence: Mapped[float] = mapped_column(Float, default=1.0)  # 0.0-1.0

    status: Mapped[DeadlineStatus] = mapped_column(
        Enum(DeadlineStatus), default=DeadlineStatus.PENDING, index=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="deadlines")
    source_item: Mapped["Item | None"] = relationship(
        "Item", back_populates="deadlines"
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="deadline"
    )
    reminders: Mapped[list["Reminder"]] = relationship(
        "Reminder", back_populates="deadline", cascade="all, delete-orphan"
    )
