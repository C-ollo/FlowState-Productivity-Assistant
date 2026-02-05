from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "flowstate",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.workers.sync_tasks",
        "app.workers.process_tasks",
        "app.workers.briefing_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max per task
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# Periodic task schedule
celery_app.conf.beat_schedule = {
    # Sync Gmail every 5 minutes
    "sync-gmail-every-5-minutes": {
        "task": "app.workers.sync_tasks.sync_all_gmail",
        "schedule": 300.0,  # 5 minutes
    },
    # Sync Slack every 2 minutes
    "sync-slack-every-2-minutes": {
        "task": "app.workers.sync_tasks.sync_all_slack",
        "schedule": 120.0,  # 2 minutes
    },
    # Sync Calendar every 15 minutes
    "sync-calendar-every-15-minutes": {
        "task": "app.workers.sync_tasks.sync_all_calendar",
        "schedule": 900.0,  # 15 minutes
    },
    # Process unprocessed items every minute
    "process-items-every-minute": {
        "task": "app.workers.process_tasks.process_unprocessed_items",
        "schedule": 60.0,  # 1 minute
    },
    # Generate morning briefings at 7 AM UTC
    "generate-morning-briefings": {
        "task": "app.workers.briefing_tasks.generate_all_morning_briefings",
        "schedule": crontab(hour=7, minute=0),
    },
    # Mark overdue deadlines hourly
    "mark-overdue-deadlines": {
        "task": "app.workers.process_tasks.mark_overdue_deadlines",
        "schedule": crontab(minute=0),  # Every hour
    },
}
