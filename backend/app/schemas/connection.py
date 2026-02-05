from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.connection import ConnectionStatus, Platform


class ConnectionBase(BaseModel):
    """Base connection schema."""

    platform: Platform


class ConnectionCreate(ConnectionBase):
    """Schema for creating a connection (internal use)."""

    access_token: str
    refresh_token: str | None = None
    token_expires_at: datetime | None = None
    scopes: str | None = None
    external_user_id: str | None = None
    external_email: str | None = None


class ConnectionRead(ConnectionBase):
    """Schema for reading a connection (public)."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: ConnectionStatus
    external_email: str | None
    created_at: datetime
    updated_at: datetime


class OAuthCallbackData(BaseModel):
    """OAuth callback data."""

    code: str
    state: str | None = None
