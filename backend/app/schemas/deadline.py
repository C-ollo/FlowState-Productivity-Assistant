from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.deadline import DeadlineStatus


class DeadlineBase(BaseModel):
    """Base deadline schema."""

    title: str
    description: str | None = None
    due_at: datetime


class DeadlineCreate(DeadlineBase):
    """Schema for creating a deadline."""

    item_id: UUID | None = None
    source_text: str | None = None
    confidence: float = 1.0


class DeadlineUpdate(BaseModel):
    """Schema for updating a deadline."""

    title: str | None = None
    description: str | None = None
    due_at: datetime | None = None
    status: DeadlineStatus | None = None


class DeadlineRead(DeadlineBase):
    """Schema for reading a deadline."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    item_id: UUID | None
    source_text: str | None
    confidence: float
    status: DeadlineStatus
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class DeadlineFilter(BaseModel):
    """Filter parameters for listing deadlines."""

    status: DeadlineStatus | None = None
    from_date: datetime | None = None
    to_date: datetime | None = None
    limit: int = 50
    offset: int = 0
