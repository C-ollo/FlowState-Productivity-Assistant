import base64
from datetime import datetime
from urllib.parse import urlencode
from uuid import UUID

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.integrations.base import BaseIntegration
from app.models.connection import Connection, Platform
from app.models.item import Item, ItemType
from app.models.sync_state import SyncState
from app.utils.transcript_parser import parse_vtt

ZOOM_AUTH_URL = "https://zoom.us/oauth/authorize"
ZOOM_TOKEN_URL = "https://zoom.us/oauth/token"
ZOOM_API_BASE = "https://api.zoom.us/v2"
ZOOM_SCOPES = [
    "cloud_recording:read:list_user_recordings:admin",
    "user:read:email",
]


class ZoomIntegration(BaseIntegration):
    """Zoom integration handler for syncing meeting transcripts."""

    platform = Platform.ZOOM

    @classmethod
    def get_auth_url(cls, state: str, redirect_uri: str) -> str:
        """Generate Zoom OAuth authorization URL."""
        params = {
            "client_id": settings.zoom_client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "state": state,
        }
        return f"{ZOOM_AUTH_URL}?{urlencode(params)}"

    @classmethod
    async def exchange_code(cls, code: str, redirect_uri: str) -> dict:
        """Exchange authorization code for tokens."""
        # Zoom uses Basic auth with client_id:client_secret
        credentials = base64.b64encode(
            f"{settings.zoom_client_id}:{settings.zoom_client_secret}".encode()
        ).decode()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                ZOOM_TOKEN_URL,
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
            )
            response.raise_for_status()
            data = response.json()

            # Fetch user info
            user_response = await client.get(
                f"{ZOOM_API_BASE}/users/me",
                headers={"Authorization": f"Bearer {data['access_token']}"},
            )
            user_response.raise_for_status()
            user_data = user_response.json()

            return {
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in", 3600),
                "external_user_id": user_data.get("id"),
                "external_email": user_data.get("email"),
            }

    async def refresh_tokens(self) -> dict:
        """Refresh Zoom access tokens using Basic auth."""
        if not self.connection.refresh_token:
            raise ValueError("No refresh token available")

        credentials = base64.b64encode(
            f"{settings.zoom_client_id}:{settings.zoom_client_secret}".encode()
        ).decode()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                ZOOM_TOKEN_URL,
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": self.connection.refresh_token,
                },
            )
            response.raise_for_status()
            data = response.json()

            return {
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token"),
                "expires_in": data.get("expires_in", 3600),
            }

    async def sync(self, db: AsyncSession, user_id: UUID) -> int:
        """Sync cloud recording transcripts from Zoom."""
        # Get or create sync state
        result = await db.execute(
            select(SyncState).where(SyncState.connection_id == self.connection.id)
        )
        sync_state = result.scalar_one_or_none()

        if not sync_state:
            sync_state = SyncState(connection_id=self.connection.id)
            db.add(sync_state)

        headers = {"Authorization": f"Bearer {self.connection.access_token}"}

        async with httpx.AsyncClient() as client:
            # List recordings (last 30 days by default)
            params: dict = {"page_size": 30}
            if sync_state.last_sync_at:
                params["from"] = sync_state.last_sync_at.strftime("%Y-%m-%d")

            response = await client.get(
                f"{ZOOM_API_BASE}/users/me/recordings",
                headers=headers,
                params=params,
            )
            response.raise_for_status()
            data = response.json()

            items_synced = 0
            for meeting in data.get("meetings", []):
                meeting_id = str(meeting.get("id", ""))
                meeting_topic = meeting.get("topic", "Zoom Meeting")
                meeting_start = meeting.get("start_time", "")

                # Look for transcript files in recording_files
                for recording_file in meeting.get("recording_files", []):
                    file_type = recording_file.get("file_type", "")
                    if file_type != "TRANSCRIPT":
                        continue

                    external_id = f"zoom_{meeting_id}_{recording_file.get('id', '')}"

                    # Deduplicate
                    existing = await db.execute(
                        select(Item).where(
                            and_(
                                Item.user_id == user_id,
                                Item.external_id == external_id,
                            )
                        )
                    )
                    if existing.scalar_one_or_none():
                        continue

                    # Download the transcript
                    download_url = recording_file.get("download_url")
                    if not download_url:
                        continue

                    transcript_response = await client.get(
                        download_url,
                        headers=headers,
                        follow_redirects=True,
                    )
                    if transcript_response.status_code != 200:
                        continue

                    raw_text = transcript_response.text
                    parsed_text = parse_vtt(raw_text)

                    if not parsed_text.strip():
                        continue

                    # Parse meeting start time
                    received_at = datetime.utcnow()
                    if meeting_start:
                        try:
                            received_at = datetime.fromisoformat(
                                meeting_start.replace("Z", "+00:00")
                            )
                        except (ValueError, TypeError):
                            pass

                    item = Item(
                        user_id=user_id,
                        platform=Platform.ZOOM,
                        item_type=ItemType.MEETING_TRANSCRIPT,
                        external_id=external_id,
                        subject=f"Meeting Transcript: {meeting_topic}",
                        body=parsed_text[:50000],
                        snippet=parsed_text[:500],
                        sender_name=meeting_topic,
                        received_at=received_at,
                    )
                    db.add(item)
                    items_synced += 1

            # Update sync state
            sync_state.last_sync_at = datetime.utcnow()
            sync_state.last_sync_status = "success"
            sync_state.items_synced = (sync_state.items_synced or 0) + items_synced

            await db.flush()
            return items_synced
