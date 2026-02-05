from datetime import datetime
from typing import TYPE_CHECKING
import uuid
import enum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.deadline import Deadline
    from app.models.task import Task
    from app.models.user import User


class ReminderChannel(str, enum.Enum):
    """Reminder delivery channel."""

    IN_APP = "in_app"
    EMAIL = "email"
    PUSH = "push"


class Reminder(Base):
    """Scheduled reminder for tasks or deadlines."""

    __tablename__ = "reminders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    # Link to either task or deadline
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True
    )
    deadline_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("deadlines.id", ondelete="CASCADE"), nullable=True
    )

    remind_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    channel: Mapped[ReminderChannel] = mapped_column(
        Enum(ReminderChannel), default=ReminderChannel.IN_APP
    )

    message: Mapped[str | None] = mapped_column(String(500), nullable=True)

    sent: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reminders")
    task: Mapped["Task | None"] = relationship("Task", back_populates="reminders")
    deadline: Mapped["Deadline | None"] = relationship(
        "Deadline", back_populates="reminders"
    )
