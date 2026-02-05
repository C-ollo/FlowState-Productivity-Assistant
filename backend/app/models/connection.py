from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.sync_state import SyncState
    from app.models.user import User

import enum


class Platform(str, enum.Enum):
    """Supported integration platforms."""

    GMAIL = "gmail"
    SLACK = "slack"
    CALENDAR = "calendar"


class ConnectionStatus(str, enum.Enum):
    """Connection status."""

    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    ERROR = "error"


class Connection(Base):
    """OAuth connection to external platforms."""

    __tablename__ = "connections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    platform: Mapped[Platform] = mapped_column(Enum(Platform), index=True)

    # OAuth tokens (encrypted in production)
    access_token: Mapped[str] = mapped_column(Text)
    refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    token_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    scopes: Mapped[str | None] = mapped_column(Text, nullable=True)  # Comma-separated

    # Platform-specific data
    external_user_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    external_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    status: Mapped[ConnectionStatus] = mapped_column(
        Enum(ConnectionStatus), default=ConnectionStatus.ACTIVE
    )
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="connections")
    sync_states: Mapped[list["SyncState"]] = relationship(
        "SyncState", back_populates="connection", cascade="all, delete-orphan"
    )
