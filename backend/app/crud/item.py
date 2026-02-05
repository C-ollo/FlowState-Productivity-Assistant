from uuid import UUID

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate, ItemFilter


class ItemCRUD:
    """CRUD operations for Item model."""

    async def get(self, db: AsyncSession, item_id: UUID) -> Item | None:
        """Get item by ID."""
        result = await db.execute(select(Item).where(Item.id == item_id))
        return result.scalar_one_or_none()

    async def get_by_external_id(
        self, db: AsyncSession, user_id: UUID, external_id: str
    ) -> Item | None:
        """Get item by external platform ID."""
        result = await db.execute(
            select(Item).where(
                and_(Item.user_id == user_id, Item.external_id == external_id)
            )
        )
        return result.scalar_one_or_none()

    async def get_multi(
        self, db: AsyncSession, user_id: UUID, filters: ItemFilter
    ) -> list[Item]:
        """Get multiple items with filters."""
        query = select(Item).where(Item.user_id == user_id)

        # Apply filters
        if filters.platform:
            query = query.where(Item.platform == filters.platform)
        if filters.item_type:
            query = query.where(Item.item_type == filters.item_type)
        if filters.category:
            query = query.where(Item.category == filters.category)
        if filters.action_type:
            query = query.where(Item.action_type == filters.action_type)
        if filters.is_read is not None:
            query = query.where(Item.is_read == filters.is_read)
        if filters.is_archived is not None:
            query = query.where(Item.is_archived == filters.is_archived)
        if filters.is_starred is not None:
            query = query.where(Item.is_starred == filters.is_starred)
        if filters.action_required is not None:
            query = query.where(Item.action_required == filters.action_required)
        if filters.min_priority:
            query = query.where(Item.priority_score >= filters.min_priority)
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    Item.subject.ilike(search_term),
                    Item.body.ilike(search_term),
                    Item.ai_summary.ilike(search_term),
                )
            )

        # Order by received_at descending (newest first)
        query = query.order_by(Item.received_at.desc())

        # Pagination
        query = query.offset(filters.offset).limit(filters.limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, user_id: UUID, item_in: ItemCreate
    ) -> Item:
        """Create a new item."""
        item = Item(user_id=user_id, **item_in.model_dump())
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    async def update(
        self, db: AsyncSession, item: Item, item_in: ItemUpdate
    ) -> Item:
        """Update an item."""
        update_data = item_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        await db.flush()
        await db.refresh(item)
        return item

    async def count_unread(self, db: AsyncSession, user_id: UUID) -> int:
        """Count unread items for a user."""
        from sqlalchemy import func

        result = await db.execute(
            select(func.count(Item.id)).where(
                and_(
                    Item.user_id == user_id,
                    Item.is_read == False,
                    Item.is_archived == False,
                )
            )
        )
        return result.scalar_one()

    async def count_action_required(self, db: AsyncSession, user_id: UUID) -> int:
        """Count items requiring action."""
        from sqlalchemy import func

        result = await db.execute(
            select(func.count(Item.id)).where(
                and_(
                    Item.user_id == user_id,
                    Item.action_required == True,
                    Item.is_archived == False,
                )
            )
        )
        return result.scalar_one()


item_crud = ItemCRUD()
