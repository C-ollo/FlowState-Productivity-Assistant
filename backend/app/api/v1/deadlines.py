from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.crud.deadline import deadline_crud
from app.models.deadline import DeadlineStatus
from app.schemas.deadline import (
    DeadlineCreate,
    DeadlineFilter,
    DeadlineRead,
    DeadlineUpdate,
)

router = APIRouter()


@router.get("", response_model=list[DeadlineRead])
async def list_deadlines(
    status: DeadlineStatus | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list:
    """List deadlines with filters."""
    filters = DeadlineFilter(
        status=status,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset,
    )
    deadlines = await deadline_crud.get_multi(db, user_id, filters)
    return deadlines


@router.get("/upcoming", response_model=list[DeadlineRead])
async def list_upcoming_deadlines(
    days: int = Query(default=7, le=30),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list:
    """List upcoming deadlines within n days."""
    deadlines = await deadline_crud.get_upcoming(db, user_id, days)
    return deadlines


@router.get("/overdue", response_model=list[DeadlineRead])
async def list_overdue_deadlines(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list:
    """List overdue deadlines."""
    deadlines = await deadline_crud.get_overdue(db, user_id)
    return deadlines


@router.get("/{deadline_id}", response_model=DeadlineRead)
async def get_deadline(
    deadline_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a single deadline."""
    deadline = await deadline_crud.get(db, deadline_id)
    if not deadline or deadline.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deadline not found",
        )
    return deadline


@router.post("", response_model=DeadlineRead, status_code=status.HTTP_201_CREATED)
async def create_deadline(
    deadline_in: DeadlineCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new deadline."""
    deadline = await deadline_crud.create(db, user_id, deadline_in)
    return deadline


@router.patch("/{deadline_id}", response_model=DeadlineRead)
async def update_deadline(
    deadline_id: UUID,
    deadline_in: DeadlineUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update a deadline."""
    deadline = await deadline_crud.get(db, deadline_id)
    if not deadline or deadline.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deadline not found",
        )
    deadline = await deadline_crud.update(db, deadline, deadline_in)
    return deadline


@router.post("/{deadline_id}/complete", response_model=DeadlineRead)
async def complete_deadline(
    deadline_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Mark a deadline as completed."""
    deadline = await deadline_crud.get(db, deadline_id)
    if not deadline or deadline.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deadline not found",
        )
    deadline = await deadline_crud.update(
        db, deadline, DeadlineUpdate(status=DeadlineStatus.COMPLETED)
    )
    return deadline
