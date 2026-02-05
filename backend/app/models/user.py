from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.briefing import Briefing
    from app.models.connection import Connection
    from app.models.deadline import Deadline
    from app.models.item import Item
    from app.models.reminder import Reminder
    from app.models.task import Task


class User(Base):
    """User model for authentication and profile data."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str | None] = mapped_column(Text, nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    settings: Mapped[dict | None] = mapped_column(Text, nullable=True)  # JSON stored as text

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    connections: Mapped[list["Connection"]] = relationship(
        "Connection", back_populates="user", cascade="all, delete-orphan"
    )
    items: Mapped[list["Item"]] = relationship(
        "Item", back_populates="user", cascade="all, delete-orphan"
    )
    deadlines: Mapped[list["Deadline"]] = relationship(
        "Deadline", back_populates="user", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="user", cascade="all, delete-orphan"
    )
    reminders: Mapped[list["Reminder"]] = relationship(
        "Reminder", back_populates="user", cascade="all, delete-orphan"
    )
    briefings: Mapped[list["Briefing"]] = relationship(
        "Briefing", back_populates="user", cascade="all, delete-orphan"
    )
