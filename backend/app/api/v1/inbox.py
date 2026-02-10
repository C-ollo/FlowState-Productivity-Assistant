from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.api.deps import get_db, get_current_user_id
from app.crud.item import item_crud
from app.models.connection import Platform
from app.models.item import ActionType, Category, ItemType, Item
from app.schemas.item import ItemFilter, ItemRead, ItemUpdate
from app.services.ai_pipeline import process_item

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


@router.get("/next-event", response_model=ItemRead | None)
async def get_next_event(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the next upcoming calendar event."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Item)
        .where(
            and_(
                Item.user_id == user_id,
                or_(
                    Item.item_type == ItemType.CALENDAR_EVENT,
                    Item.item_type == ItemType.CALENDAR_INVITE,
                ),
                Item.event_start > now,
            )
        )
        .order_by(Item.event_start.asc())
        .limit(1)
    )
    item = result.scalars().first()
    return item


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


@router.post("/{item_id}/process", response_model=ItemRead)
async def process_item_ai(
    item_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Process a single item through the AI pipeline."""
    item = await item_crud.get(db, item_id)
    if not item or item.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    try:
        item = await process_item(db, item)
        await db.commit()
        return item
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing failed: {str(e)}",
        )


@router.post("/process-all")
async def process_all_items(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Process all unprocessed items through the AI pipeline."""
    # Get unprocessed items
    result = await db.execute(
        select(Item).where(
            and_(
                Item.user_id == user_id,
                Item.ai_processed_at.is_(None),
            )
        ).limit(50)  # Process in batches
    )
    items = list(result.scalars().all())

    if not items:
        return {"status": "success", "processed": 0, "message": "No items to process"}

    processed_count = 0
    errors = []

    for item in items:
        try:
            await process_item(db, item)
            processed_count += 1
        except Exception as e:
            errors.append({"item_id": str(item.id), "error": str(e)})

    await db.commit()

    return {
        "status": "success",
        "processed": processed_count,
        "total": len(items),
        "errors": errors if errors else None,
    }
