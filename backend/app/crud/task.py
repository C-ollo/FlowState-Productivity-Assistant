from datetime import datetime
from uuid import UUID

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate, TaskFilter


class TaskCRUD:
    """CRUD operations for Task model."""

    async def get(self, db: AsyncSession, task_id: UUID) -> Task | None:
        """Get task by ID."""
        result = await db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()

    async def get_multi(
        self, db: AsyncSession, user_id: UUID, filters: TaskFilter
    ) -> list[Task]:
        """Get multiple tasks with filters."""
        query = select(Task).where(Task.user_id == user_id)

        if filters.status:
            query = query.where(Task.status == filters.status)
        if filters.priority:
            query = query.where(Task.priority == filters.priority)
        if filters.from_date:
            query = query.where(Task.due_at >= filters.from_date)
        if filters.to_date:
            query = query.where(Task.due_at <= filters.to_date)

        query = query.order_by(Task.position.asc(), Task.created_at.desc())
        query = query.offset(filters.offset).limit(filters.limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_status(
        self, db: AsyncSession, user_id: UUID, status: TaskStatus
    ) -> list[Task]:
        """Get tasks by status."""
        result = await db.execute(
            select(Task)
            .where(and_(Task.user_id == user_id, Task.status == status))
            .order_by(Task.position.asc())
        )
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, user_id: UUID, task_in: TaskCreate
    ) -> Task:
        """Create a new task."""
        # Get the max position to append at the end
        max_position = await db.execute(
            select(func.max(Task.position)).where(Task.user_id == user_id)
        )
        position = (max_position.scalar_one() or 0) + 1

        task = Task(
            user_id=user_id,
            position=position,
            **task_in.model_dump(),
        )
        db.add(task)
        await db.flush()
        await db.refresh(task)
        return task

    async def update(
        self, db: AsyncSession, task: Task, task_in: TaskUpdate
    ) -> Task:
        """Update a task."""
        update_data = task_in.model_dump(exclude_unset=True)

        # Handle status change to done
        if update_data.get("status") == TaskStatus.DONE:
            update_data["completed_at"] = datetime.utcnow()
        elif update_data.get("status") and update_data["status"] != TaskStatus.DONE:
            update_data["completed_at"] = None

        for field, value in update_data.items():
            setattr(task, field, value)

        await db.flush()
        await db.refresh(task)
        return task

    async def delete(self, db: AsyncSession, task: Task) -> None:
        """Delete a task."""
        await db.delete(task)
        await db.flush()

    async def count_by_status(
        self, db: AsyncSession, user_id: UUID
    ) -> dict[str, int]:
        """Count tasks by status."""
        result = await db.execute(
            select(Task.status, func.count(Task.id))
            .where(Task.user_id == user_id)
            .group_by(Task.status)
        )
        counts = {status.value: 0 for status in TaskStatus}
        for status, count in result.all():
            counts[status.value] = count
        return counts


task_crud = TaskCRUD()
