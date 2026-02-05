import asyncio
from uuid import UUID

from sqlalchemy import select, and_

from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models.item import Item
from app.models.deadline import DeadlineStatus
from app.services.ai_pipeline import process_item
from app.crud.deadline import deadline_crud


@celery_app.task(name="app.workers.process_tasks.process_unprocessed_items")
def process_unprocessed_items():
    """Process items that haven't been through the AI pipeline."""
    async def _process():
        async with AsyncSessionLocal() as db:
            try:
                # Get unprocessed items
                result = await db.execute(
                    select(Item)
                    .where(Item.ai_processed_at.is_(None))
                    .order_by(Item.received_at.desc())
                    .limit(20)  # Process 20 at a time
                )
                items = list(result.scalars().all())

                processed_count = 0
                error_count = 0

                for item in items:
                    try:
                        await process_item(db, item)
                        processed_count += 1
                    except Exception as e:
                        print(f"Error processing item {item.id}: {e}")
                        error_count += 1

                await db.commit()

                return {
                    "processed": processed_count,
                    "errors": error_count,
                }
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}

    return asyncio.run(_process())


@celery_app.task(name="app.workers.process_tasks.process_single_item")
def process_single_item(item_id: str):
    """Process a single item through the AI pipeline."""
    async def _process():
        async with AsyncSessionLocal() as db:
            try:
                result = await db.execute(
                    select(Item).where(Item.id == UUID(item_id))
                )
                item = result.scalar_one_or_none()

                if not item:
                    return {"error": "Item not found"}

                await process_item(db, item)
                await db.commit()

                return {
                    "item_id": item_id,
                    "summary": item.ai_summary,
                    "priority": item.priority_score,
                    "category": item.category.value if item.category else None,
                    "action_type": item.action_type.value if item.action_type else None,
                }
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}

    return asyncio.run(_process())


@celery_app.task(name="app.workers.process_tasks.mark_overdue_deadlines")
def mark_overdue_deadlines():
    """Mark past-due deadlines as overdue."""
    async def _mark():
        async with AsyncSessionLocal() as db:
            try:
                # Get all users with pending deadlines
                from app.models.deadline import Deadline
                from app.models.user import User
                from datetime import datetime

                result = await db.execute(select(User.id))
                user_ids = [row[0] for row in result.all()]

                total_marked = 0
                for user_id in user_ids:
                    count = await deadline_crud.mark_overdue(db, user_id)
                    total_marked += count

                await db.commit()

                return {"marked_overdue": total_marked}
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}

    return asyncio.run(_mark())
