from datetime import datetime
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.deadline import Deadline, DeadlineStatus
from app.schemas.deadline import DeadlineCreate, DeadlineUpdate, DeadlineFilter


class DeadlineCRUD:
    """CRUD operations for Deadline model."""

    async def get(self, db: AsyncSession, deadline_id: UUID) -> Deadline | None:
        """Get deadline by ID."""
        result = await db.execute(select(Deadline).where(Deadline.id == deadline_id))
        return result.scalar_one_or_none()

    async def get_multi(
        self, db: AsyncSession, user_id: UUID, filters: DeadlineFilter
    ) -> list[Deadline]:
        """Get multiple deadlines with filters."""
        query = select(Deadline).where(Deadline.user_id == user_id)

        if filters.status:
            query = query.where(Deadline.status == filters.status)
        if filters.from_date:
            query = query.where(Deadline.due_at >= filters.from_date)
        if filters.to_date:
            query = query.where(Deadline.due_at <= filters.to_date)

        query = query.order_by(Deadline.due_at.asc())
        query = query.offset(filters.offset).limit(filters.limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_upcoming(
        self, db: AsyncSession, user_id: UUID, days: int = 7
    ) -> list[Deadline]:
        """Get upcoming deadlines within n days."""
        from datetime import timedelta

        now = datetime.utcnow()
        end_date = now + timedelta(days=days)

        result = await db.execute(
            select(Deadline)
            .where(
                and_(
                    Deadline.user_id == user_id,
                    Deadline.status == DeadlineStatus.PENDING,
                    Deadline.due_at >= now,
                    Deadline.due_at <= end_date,
                )
            )
            .order_by(Deadline.due_at.asc())
        )
        return list(result.scalars().all())

    async def get_overdue(self, db: AsyncSession, user_id: UUID) -> list[Deadline]:
        """Get overdue deadlines."""
        now = datetime.utcnow()

        result = await db.execute(
            select(Deadline)
            .where(
                and_(
                    Deadline.user_id == user_id,
                    Deadline.status == DeadlineStatus.PENDING,
                    Deadline.due_at < now,
                )
            )
            .order_by(Deadline.due_at.asc())
        )
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, user_id: UUID, deadline_in: DeadlineCreate
    ) -> Deadline:
        """Create a new deadline."""
        deadline = Deadline(user_id=user_id, **deadline_in.model_dump())
        db.add(deadline)
        await db.flush()
        await db.refresh(deadline)
        return deadline

    async def update(
        self, db: AsyncSession, deadline: Deadline, deadline_in: DeadlineUpdate
    ) -> Deadline:
        """Update a deadline."""
        update_data = deadline_in.model_dump(exclude_unset=True)

        # Handle status change to completed
        if update_data.get("status") == DeadlineStatus.COMPLETED:
            update_data["completed_at"] = datetime.utcnow()

        for field, value in update_data.items():
            setattr(deadline, field, value)

        await db.flush()
        await db.refresh(deadline)
        return deadline

    async def mark_overdue(self, db: AsyncSession, user_id: UUID) -> int:
        """Mark all past-due deadlines as overdue. Returns count updated."""
        from sqlalchemy import update

        now = datetime.utcnow()
        result = await db.execute(
            update(Deadline)
            .where(
                and_(
                    Deadline.user_id == user_id,
                    Deadline.status == DeadlineStatus.PENDING,
                    Deadline.due_at < now,
                )
            )
            .values(status=DeadlineStatus.OVERDUE)
        )
        await db.flush()
        return result.rowcount


deadline_crud = DeadlineCRUD()
