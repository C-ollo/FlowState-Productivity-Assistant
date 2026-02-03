import asyncio
from celery import Celery
from app.core.config import settings
from app.services.ingestion import IngestionService
from app.core.database import SessionLocal
from app.models.all_models import User
from sqlalchemy import select

celery_app = Celery(
    "worker",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

async def run_sync_logic(user_id: int):
    async with SessionLocal() as db:
        user = await db.scalar(select(User).where(User.id == user_id))
        if not user:
            return
            
        ingestion = IngestionService(db, user)
        # Mock ingestion of a sample item
        fake_item = {
            "id": "12345",
            "type": "email",
            "sender": "boss@company.com", 
            "subject": "Urgent: Project Update",
            "body": "Need the report by 5pm today.",
            "timestamp": 1234567890
        }
        await ingestion.process_item(fake_item, "gmail")

@celery_app.task
def sync_data_task(user_id: int):
    # Bridge to async code
    asyncio.run(run_sync_logic(user_id))
    return f"Synced data for user {user_id}"

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Real implementation would iterate all users or use a beat scheduler properly
    # sender.add_periodic_task(300.0, sync_data_task.s(1), name='sync every 5 min')
    pass
