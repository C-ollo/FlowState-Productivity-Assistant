import asyncio
from datetime import date
from uuid import UUID

from sqlalchemy import select

from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models.user import User
from app.ai.briefing_generator import generate_daily_briefing


@celery_app.task(name="app.workers.briefing_tasks.generate_all_morning_briefings")
def generate_all_morning_briefings():
    """Generate morning briefings for all users."""
    async def _generate():
        async with AsyncSessionLocal() as db:
            try:
                result = await db.execute(select(User))
                users = list(result.scalars().all())

                generated_count = 0
                error_count = 0

                for user in users:
                    try:
                        await generate_daily_briefing(db, user.id)
                        generated_count += 1
                    except Exception as e:
                        print(f"Error generating briefing for user {user.id}: {e}")
                        error_count += 1

                await db.commit()

                return {
                    "generated": generated_count,
                    "errors": error_count,
                }
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}

    return asyncio.run(_generate())


@celery_app.task(name="app.workers.briefing_tasks.generate_user_briefing")
def generate_user_briefing(user_id: str, briefing_date: str | None = None):
    """Generate a briefing for a specific user."""
    async def _generate():
        async with AsyncSessionLocal() as db:
            try:
                parsed_date = None
                if briefing_date:
                    parsed_date = date.fromisoformat(briefing_date)

                briefing = await generate_daily_briefing(
                    db,
                    UUID(user_id),
                    parsed_date,
                )
                await db.commit()

                return {
                    "user_id": user_id,
                    "briefing_id": str(briefing.id),
                    "briefing_date": str(briefing.briefing_date),
                }
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}

    return asyncio.run(_generate())
