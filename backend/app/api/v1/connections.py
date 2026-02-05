from datetime import datetime, timedelta
from uuid import UUID
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.config import settings
from app.models.connection import Connection, ConnectionStatus, Platform
from app.schemas.connection import ConnectionRead
from app.integrations.gmail import GmailIntegration
from app.integrations.slack import SlackIntegration
from app.integrations.calendar import CalendarIntegration

router = APIRouter()

# In-memory state storage (use Redis in production)
_oauth_states: dict[str, dict] = {}


def get_integration_class(platform: Platform):
    """Get the integration class for a platform."""
    mapping = {
        Platform.GMAIL: GmailIntegration,
        Platform.SLACK: SlackIntegration,
        Platform.CALENDAR: CalendarIntegration,
    }
    return mapping.get(platform)


@router.get("", response_model=list[ConnectionRead])
async def list_connections(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> list:
    """List all connected platforms."""
    result = await db.execute(
        select(Connection).where(Connection.user_id == user_id)
    )
    return list(result.scalars().all())


@router.get("/{platform}", response_model=ConnectionRead)
async def get_connection(
    platform: Platform,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get connection status for a platform."""
    result = await db.execute(
        select(Connection).where(
            and_(
                Connection.user_id == user_id,
                Connection.platform == platform,
            )
        )
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No connection found for {platform.value}",
        )
    return connection


@router.delete("/{platform}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_platform(
    platform: Platform,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect a platform."""
    result = await db.execute(
        select(Connection).where(
            and_(
                Connection.user_id == user_id,
                Connection.platform == platform,
            )
        )
    )
    connection = result.scalar_one_or_none()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No connection found for {platform.value}",
        )
    await db.delete(connection)


@router.get("/oauth/{platform}/authorize")
async def get_oauth_url(
    platform: Platform,
    user_id: UUID = Depends(get_current_user_id),
):
    """Get OAuth authorization URL for a platform."""
    integration_class = get_integration_class(platform)
    if not integration_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown platform: {platform.value}",
        )

    # Generate state token
    state = secrets.token_urlsafe(32)
    _oauth_states[state] = {
        "user_id": str(user_id),
        "platform": platform.value,
        "created_at": datetime.utcnow(),
    }

    redirect_uri = f"{settings.backend_url}/api/v1/connections/oauth/{platform.value}/callback"
    auth_url = integration_class.get_auth_url(state, redirect_uri)

    return {"auth_url": auth_url, "state": state}


@router.get("/oauth/{platform}/callback")
async def oauth_callback(
    platform: Platform,
    code: str,
    state: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """OAuth callback handler."""
    # Validate state
    if not state or state not in _oauth_states:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state token",
        )

    state_data = _oauth_states.pop(state)

    # Check state age (10 minutes max)
    if datetime.utcnow() - state_data["created_at"] > timedelta(minutes=10):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="State token expired",
        )

    if state_data["platform"] != platform.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Platform mismatch",
        )

    user_id = UUID(state_data["user_id"])

    integration_class = get_integration_class(platform)
    if not integration_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown platform: {platform.value}",
        )

    redirect_uri = f"{settings.backend_url}/api/v1/connections/oauth/{platform.value}/callback"

    # Exchange code for tokens
    try:
        token_data = await integration_class.exchange_code(code, redirect_uri)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to exchange code: {str(e)}",
        )

    # Check for existing connection
    result = await db.execute(
        select(Connection).where(
            and_(
                Connection.user_id == user_id,
                Connection.platform == platform,
            )
        )
    )
    connection = result.scalar_one_or_none()

    expires_at = None
    if token_data.get("expires_in"):
        expires_at = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])

    if connection:
        # Update existing connection
        connection.access_token = token_data["access_token"]
        if token_data.get("refresh_token"):
            connection.refresh_token = token_data["refresh_token"]
        connection.token_expires_at = expires_at
        connection.external_user_id = token_data.get("external_user_id")
        connection.external_email = token_data.get("external_email")
        connection.status = ConnectionStatus.ACTIVE
        connection.last_error = None
    else:
        # Create new connection
        connection = Connection(
            user_id=user_id,
            platform=platform,
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            token_expires_at=expires_at,
            external_user_id=token_data.get("external_user_id"),
            external_email=token_data.get("external_email"),
            status=ConnectionStatus.ACTIVE,
        )
        db.add(connection)

    await db.flush()

    # Redirect to frontend
    return RedirectResponse(
        url=f"{settings.frontend_url}/settings/connections?connected={platform.value}",
        status_code=status.HTTP_302_FOUND,
    )


@router.post("/{platform}/sync")
async def trigger_sync(
    platform: Platform,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger a sync for a platform."""
    result = await db.execute(
        select(Connection).where(
            and_(
                Connection.user_id == user_id,
                Connection.platform == platform,
            )
        )
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No connection found for {platform.value}",
        )

    if connection.status != ConnectionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Connection is not active: {connection.status.value}",
        )

    integration_class = get_integration_class(platform)
    if not integration_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown platform: {platform.value}",
        )

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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to refresh tokens: {str(e)}",
            )

    # Perform sync
    try:
        items_synced = await integration.sync(db, user_id)
        return {"status": "success", "items_synced": items_synced}
    except Exception as e:
        connection.last_error = str(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}",
        )
