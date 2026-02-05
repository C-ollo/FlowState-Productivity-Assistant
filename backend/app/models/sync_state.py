from datetime import datetime
from typing import TYPE_CHECKING
import uuid

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.connection import Connection


class SyncState(Base):
    """Tracks sync state for each connection."""

    __tablename__ = "sync_states"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    connection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("connections.id", ondelete="CASCADE"), index=True
    )

    # Sync cursor/token (platform-specific)
    # For Gmail: historyId
    # For Slack: latest message timestamp
    # For Calendar: syncToken
    sync_token: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Additional sync metadata (JSON)
    sync_metadata: Mapped[str | None] = mapped_column(Text, nullable=True)

    last_sync_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_sync_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    last_sync_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    items_synced: Mapped[int] = mapped_column(default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    connection: Mapped["Connection"] = relationship(
        "Connection", back_populates="sync_states"
    )
