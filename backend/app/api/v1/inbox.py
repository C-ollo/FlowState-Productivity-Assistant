from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.crud.item import item_crud
from app.models.connection import Platform
from app.models.item import ActionType, Category, ItemType
from app.schemas.item import ItemFilter, ItemRead, ItemUpdate

router = APIRouter()


@router.get("", response_model=list[ItemRead])
async def list_items(
    platform: Platform | None = None,
    item_type: ItemType | None = None,
    category: Category | None = None,
    action_type: ActionType | None = None,
    is_read: bool | None = None,
    is_archived: bool | None = Query(default=False),
    is_starred: bool | None = None,
    action_required: bool | None = None,
    min_priority: int | None = None,
    search: str | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list:
    """List inbox items with filters."""
    filters = ItemFilter(
        platform=platform,
        item_type=item_type,
        category=category,
        action_type=action_type,
        is_read=is_read,
        is_archived=is_archived,
        is_starred=is_starred,
        action_required=action_required,
        min_priority=min_priority,
        search=search,
        limit=limit,
        offset=offset,
    )
    items = await item_crud.get_multi(db, user_id, filters)
    return items


@router.get("/stats")
async def get_inbox_stats(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get inbox statistics."""
    unread_count = await item_crud.count_unread(db, user_id)
    action_count = await item_crud.count_action_required(db, user_id)
    return {
        "unread_count": unread_count,
        "action_required_count": action_count,
    }


@router.get("/{item_id}", response_model=ItemRead)
async def get_item(
    item_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a single inbox item."""
    item = await item_crud.get(db, item_id)
    if not item or item.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    return item


@router.patch("/{item_id}", response_model=ItemRead)
async def update_item(
    item_id: UUID,
    item_in: ItemUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update an inbox item (mark read, archive, star, snooze)."""
    item = await item_crud.get(db, item_id)
    if not item or item.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    item = await item_crud.update(db, item, item_in)
    return item


@router.post("/{item_id}/archive", response_model=ItemRead)
async def archive_item(
    item_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Archive an inbox item."""
    item = await item_crud.get(db, item_id)
    if not item or item.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    item = await item_crud.update(db, item, ItemUpdate(is_archived=True))
    return item


@router.post("/{item_id}/read", response_model=ItemRead)
async def mark_item_read(
    item_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Mark an inbox item as read."""
    item = await item_crud.get(db, item_id)
    if not item or item.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    item = await item_crud.update(db, item, ItemUpdate(is_read=True))
    return item
