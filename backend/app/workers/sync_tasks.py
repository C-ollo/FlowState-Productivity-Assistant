import asyncio
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models.connection import Connection, ConnectionStatus, Platform
from app.integrations.gmail import GmailIntegration
from app.integrations.slack import SlackIntegration
from app.integrations.calendar import CalendarIntegration


def get_integration_class(platform: Platform):
    """Get the integration class for a platform."""
    mapping = {
        Platform.GMAIL: GmailIntegration,
        Platform.SLACK: SlackIntegration,
        Platform.CALENDAR: CalendarIntegration,
    }
    return mapping.get(platform)


async def _sync_connection(connection: Connection, db: AsyncSession) -> int:
    """Sync a single connection."""
    integration_class = get_integration_class(connection.platform)
    if not integration_class:
        return 0

    integration = integration_class(connection)

    # Refresh tokens if needed
    if integration.is_token_expired():
        try:
            token_data = await integration.refresh_tokens()
            connection.access_token = token_data["access_token"]
            if token_data.get("refresh_token"):
                connection.refresh_token = token_data["refresh_token"]
            if token_data.get("expires_in"):
                connection.token_expires_at = datetime.utcnow() + timedelta(
                    seconds=token_data["expires_in"]
                )
        except Exception as e:
            connection.status = ConnectionStatus.ERROR
            connection.last_error = str(e)
            return 0

    # Perform sync
    try:
        items_synced = await integration.sync(db, connection.user_id)
        connection.last_error = None
        return items_synced
    except Exception as e:
        connection.last_error = str(e)
        return 0


async def _sync_platform(platform: Platform) -> dict:
    """Sync all connections for a platform."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(Connection).where(
                    Connection.platform == platform,
                    Connection.status == ConnectionStatus.ACTIVE,
                )
            )
            connections = list(result.scalars().all())

            total_synced = 0
            synced_count = 0
            error_count = 0

            for connection in connections:
                try:
                    items = await _sync_connection(connection, db)
                    total_synced += items
                    synced_count += 1
                except Exception:
                    error_count += 1

            await db.commit()

            return {
                "platform": platform.value,
                "connections_synced": synced_count,
                "items_synced": total_synced,
                "errors": error_count,
            }
        except Exception as e:
            await db.rollback()
            return {
                "platform": platform.value,
                "error": str(e),
            }


@celery_app.task(name="app.workers.sync_tasks.sync_all_gmail")
def sync_all_gmail():
    """Sync all Gmail connections."""
    return asyncio.run(_sync_platform(Platform.GMAIL))


@celery_app.task(name="app.workers.sync_tasks.sync_all_slack")
def sync_all_slack():
    """Sync all Slack connections."""
    return asyncio.run(_sync_platform(Platform.SLACK))


@celery_app.task(name="app.workers.sync_tasks.sync_all_calendar")
def sync_all_calendar():
    """Sync all Calendar connections."""
    return asyncio.run(_sync_platform(Platform.CALENDAR))


@celery_app.task(name="app.workers.sync_tasks.sync_user_connection")
def sync_user_connection(connection_id: str):
    """Sync a specific user connection."""
    async def _sync():
        async with AsyncSessionLocal() as db:
            try:
                from uuid import UUID
                result = await db.execute(
                    select(Connection).where(Connection.id == UUID(connection_id))
                )
                connection = result.scalar_one_or_none()

                if not connection:
                    return {"error": "Connection not found"}

                items = await _sync_connection(connection, db)
                await db.commit()

                return {
                    "connection_id": connection_id,
                    "items_synced": items,
                }
            except Exception as e:
                await db.rollback()
                return {"error": str(e)}

    return asyncio.run(_sync())
