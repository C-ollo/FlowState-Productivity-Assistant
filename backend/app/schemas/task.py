from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.task import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    """Base task schema."""

    title: str
    description: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_at: datetime | None = None


class TaskCreate(TaskBase):
    """Schema for creating a task."""

    item_id: UUID | None = None
    deadline_id: UUID | None = None


class TaskUpdate(BaseModel):
    """Schema for updating a task."""

    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_at: datetime | None = None
    position: int | None = None


class TaskRead(TaskBase):
    """Schema for reading a task."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    item_id: UUID | None
    deadline_id: UUID | None
    status: TaskStatus
    position: int
    ai_generated: bool
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TaskFilter(BaseModel):
    """Filter parameters for listing tasks."""

    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    from_date: datetime | None = None
    to_date: datetime | None = None
    limit: int = 50
    offset: int = 0
