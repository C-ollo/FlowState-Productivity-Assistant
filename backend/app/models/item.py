from datetime import datetime
from typing import TYPE_CHECKING
import uuid
import enum

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.connection import Platform

if TYPE_CHECKING:
    from app.models.deadline import Deadline
    from app.models.task import Task
    from app.models.user import User


class ItemType(str, enum.Enum):
    """Type of inbox item."""

    EMAIL = "email"
    SLACK_MESSAGE = "slack_message"
    SLACK_DM = "slack_dm"
    CALENDAR_EVENT = "calendar_event"
    CALENDAR_INVITE = "calendar_invite"


class ActionType(str, enum.Enum):
    """AI-classified action type."""

    REPLY_NEEDED = "reply_needed"
    REVIEW_NEEDED = "review_needed"
    MEETING_REQUEST = "meeting_request"
    FYI_ONLY = "fyi_only"
    TASK_ASSIGNED = "task_assigned"
    NONE = "none"


class Category(str, enum.Enum):
    """AI-classified category."""

    WORK = "work"
    PERSONAL = "personal"
    SCHOOL = "school"
    PROMOTIONAL = "promotional"
    SOCIAL = "social"
    FINANCE = "finance"
    OTHER = "other"


class Item(Base):
    """Unified inbox item from any platform."""

    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    # Source information
    platform: Mapped[Platform] = mapped_column(Enum(Platform), index=True)
    item_type: Mapped[ItemType] = mapped_column(Enum(ItemType))
    external_id: Mapped[str] = mapped_column(String(255), index=True)  # Platform's ID
    thread_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    # Content
    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    snippet: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Sender info
    sender_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sender_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sender_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Recipients (for emails)
    recipients_to: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    recipients_cc: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array

    # Slack-specific
    channel_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    channel_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Calendar-specific
    event_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    event_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    event_location: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # AI-generated fields
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_required: Mapped[bool] = mapped_column(Boolean, default=False)
    action_type: Mapped[ActionType] = mapped_column(
        Enum(ActionType), default=ActionType.NONE
    )
    priority_score: Mapped[int] = mapped_column(Integer, default=50)  # 1-100
    category: Mapped[Category] = mapped_column(Enum(Category), default=Category.OTHER)
    sentiment: Mapped[str | None] = mapped_column(String(50), nullable=True)  # positive/negative/neutral
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_starred: Mapped[bool] = mapped_column(Boolean, default=False)
    is_snoozed: Mapped[bool] = mapped_column(Boolean, default=False)
    snoozed_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Timestamps
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="items")
    deadlines: Mapped[list["Deadline"]] = relationship(
        "Deadline", back_populates="source_item", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="source_item"
    )
