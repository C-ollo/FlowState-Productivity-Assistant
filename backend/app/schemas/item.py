from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.connection import Platform
from app.models.item import ActionType, Category, ItemType


class ItemBase(BaseModel):
    """Base item schema."""

    subject: str | None = None
    body: str | None = None


class ItemCreate(ItemBase):
    """Schema for creating an item (internal use)."""

    platform: Platform
    item_type: ItemType
    external_id: str
    thread_id: str | None = None
    snippet: str | None = None
    sender_name: str | None = None
    sender_email: str | None = None
    sender_id: str | None = None
    recipients_to: str | None = None
    recipients_cc: str | None = None
    channel_id: str | None = None
    channel_name: str | None = None
    event_start: datetime | None = None
    event_end: datetime | None = None
    event_location: str | None = None
    received_at: datetime


class ItemUpdate(BaseModel):
    """Schema for updating an item."""

    is_read: bool | None = None
    is_archived: bool | None = None
    is_starred: bool | None = None
    is_snoozed: bool | None = None
    snoozed_until: datetime | None = None


class ItemRead(ItemBase):
    """Schema for reading an item."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    platform: Platform
    item_type: ItemType
    external_id: str
    thread_id: str | None
    snippet: str | None

    sender_name: str | None
    sender_email: str | None
    sender_id: str | None

    recipients_to: str | None
    recipients_cc: str | None

    channel_id: str | None
    channel_name: str | None

    event_start: datetime | None
    event_end: datetime | None
    event_location: str | None

    # AI fields
    ai_summary: str | None
    action_required: bool
    action_type: ActionType
    priority_score: int
    category: Category
    sentiment: str | None
    ai_confidence: float | None
    ai_processed_at: datetime | None

    # Status
    is_read: bool
    is_archived: bool
    is_starred: bool
    is_snoozed: bool
    snoozed_until: datetime | None

    received_at: datetime
    created_at: datetime
    updated_at: datetime


class ItemFilter(BaseModel):
    """Filter parameters for listing items."""

    platform: Platform | None = None
    item_type: ItemType | None = None
    category: Category | None = None
    action_type: ActionType | None = None
    is_read: bool | None = None
    is_archived: bool | None = None
    is_starred: bool | None = None
    action_required: bool | None = None
    min_priority: int | None = None
    search: str | None = None
    limit: int = 50
    offset: int = 0
