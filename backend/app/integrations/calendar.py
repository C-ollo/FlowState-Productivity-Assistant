from datetime import datetime, timedelta
from uuid import UUID

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.integrations.base import BaseIntegration
from app.models.connection import Connection, Platform
from app.models.item import Item, ItemType
from app.models.sync_state import SyncState

CALENDAR_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
CALENDAR_TOKEN_URL = "https://oauth2.googleapis.com/token"
CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"
CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]


class CalendarIntegration(BaseIntegration):
    """Google Calendar integration handler."""

    platform = Platform.CALENDAR

    @classmethod
    def get_auth_url(cls, state: str, redirect_uri: str) -> str:
        """Generate Google Calendar OAuth authorization URL."""
        params = {
            "client_id": settings.gmail_client_id,  # Uses same Google credentials
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": " ".join(CALENDAR_SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{CALENDAR_AUTH_URL}?{query}"

    @classmethod
    async def exchange_code(cls, code: str, redirect_uri: str) -> dict:
        """Exchange authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                CALENDAR_TOKEN_URL,
                data={
                    "client_id": settings.gmail_client_id,
                    "client_secret": settings.gmail_client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri,
                },
            )
            response.raise_for_status()
            data = response.json()

            # Get user info
            user_info = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {data['access_token']}"},
            )
            user_info.raise_for_status()
            user_data = user_info.json()

            return {
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in", 3600),
                "external_user_id": user_data.get("id"),
                "external_email": user_data.get("email"),
            }

    async def refresh_tokens(self) -> dict:
        """Refresh Google Calendar access tokens."""
        if not self.connection.refresh_token:
            raise ValueError("No refresh token available")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                CALENDAR_TOKEN_URL,
                data={
                    "client_id": settings.gmail_client_id,
                    "client_secret": settings.gmail_client_secret,
                    "refresh_token": self.connection.refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            response.raise_for_status()
            data = response.json()

            return {
                "access_token": data["access_token"],
                "expires_in": data.get("expires_in", 3600),
            }

    async def sync(self, db: AsyncSession, user_id: UUID) -> int:
        """Sync events from Google Calendar."""
        # Get or create sync state
        result = await db.execute(
            select(SyncState).where(SyncState.connection_id == self.connection.id)
        )
        sync_state = result.scalar_one_or_none()

        if not sync_state:
            sync_state = SyncState(connection_id=self.connection.id)
            db.add(sync_state)

        items_synced = 0

        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.connection.access_token}"}

            # Get events from primary calendar
            now = datetime.utcnow()
            time_min = now.isoformat() + "Z"
            time_max = (now + timedelta(days=30)).isoformat() + "Z"

            params = {
                "timeMin": time_min,
                "timeMax": time_max,
                "singleEvents": "true",
                "orderBy": "startTime",
                "maxResults": 100,
            }

            if sync_state.sync_token:
                # Use sync token for incremental sync
                params = {"syncToken": sync_state.sync_token}

            response = await client.get(
                f"{CALENDAR_API_BASE}/calendars/primary/events",
                headers=headers,
                params=params,
            )

            if response.status_code == 410:
                # Sync token expired, do full sync
                sync_state.sync_token = None
                params = {
                    "timeMin": time_min,
                    "timeMax": time_max,
                    "singleEvents": "true",
                    "orderBy": "startTime",
                    "maxResults": 100,
                }
                response = await client.get(
                    f"{CALENDAR_API_BASE}/calendars/primary/events",
                    headers=headers,
                    params=params,
                )

            response.raise_for_status()
            data = response.json()

            for event in data.get("items", []):
                if event.get("status") == "cancelled":
                    continue

                # Check if already synced
                existing = await db.execute(
                    select(Item).where(
                        and_(
                            Item.user_id == user_id,
                            Item.external_id == event["id"],
                        )
                    )
                )
                if existing.scalar_one_or_none():
                    continue

                # Parse event
                item = self._parse_event(event, user_id)
                if item:
                    db.add(item)
                    items_synced += 1

            # Store next sync token
            if "nextSyncToken" in data:
                sync_state.sync_token = data["nextSyncToken"]

            sync_state.last_sync_at = datetime.utcnow()
            sync_state.last_sync_status = "success"
            sync_state.items_synced += items_synced

            await db.flush()
            return items_synced

    def _parse_event(self, event: dict, user_id: UUID) -> Item | None:
        """Parse Google Calendar event into Item."""
        # Determine item type
        attendees = event.get("attendees", [])
        is_invite = any(
            a.get("self") and a.get("responseStatus") == "needsAction"
            for a in attendees
        )
        item_type = ItemType.CALENDAR_INVITE if is_invite else ItemType.CALENDAR_EVENT

        # Parse times
        start = event.get("start", {})
        end = event.get("end", {})

        event_start = None
        event_end = None

        if "dateTime" in start:
            event_start = datetime.fromisoformat(start["dateTime"].replace("Z", "+00:00"))
        elif "date" in start:
            event_start = datetime.fromisoformat(start["date"])

        if "dateTime" in end:
            event_end = datetime.fromisoformat(end["dateTime"].replace("Z", "+00:00"))
        elif "date" in end:
            event_end = datetime.fromisoformat(end["date"])

        # Parse organizer
        organizer = event.get("organizer", {})
        sender_name = organizer.get("displayName", "")
        sender_email = organizer.get("email", "")

        return Item(
            user_id=user_id,
            platform=Platform.CALENDAR,
            item_type=item_type,
            external_id=event["id"],
            subject=event.get("summary", "(No Title)")[:500],
            body=event.get("description", "")[:10000] if event.get("description") else None,
            snippet=event.get("summary", "")[:500],
            sender_name=sender_name[:255] if sender_name else None,
            sender_email=sender_email[:255] if sender_email else None,
            event_start=event_start,
            event_end=event_end,
            event_location=event.get("location", "")[:500] if event.get("location") else None,
            received_at=datetime.utcnow(),
        )
