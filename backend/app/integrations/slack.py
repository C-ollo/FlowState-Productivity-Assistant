from datetime import datetime
from uuid import UUID

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.integrations.base import BaseIntegration
from app.models.connection import Connection, Platform
from app.models.item import Item, ItemType
from app.models.sync_state import SyncState

SLACK_AUTH_URL = "https://slack.com/oauth/v2/authorize"
SLACK_TOKEN_URL = "https://slack.com/api/oauth.v2.access"
SLACK_API_BASE = "https://slack.com/api"
SLACK_SCOPES = [
    "channels:history",
    "channels:read",
    "groups:history",
    "groups:read",
    "im:history",
    "im:read",
    "mpim:history",
    "mpim:read",
    "users:read",
]


class SlackIntegration(BaseIntegration):
    """Slack integration handler."""

    platform = Platform.SLACK

    @classmethod
    def get_auth_url(cls, state: str, redirect_uri: str) -> str:
        """Generate Slack OAuth authorization URL."""
        params = {
            "client_id": settings.slack_client_id,
            "redirect_uri": redirect_uri,
            "scope": ",".join(SLACK_SCOPES),
            "state": state,
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{SLACK_AUTH_URL}?{query}"

    @classmethod
    async def exchange_code(cls, code: str, redirect_uri: str) -> dict:
        """Exchange authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                SLACK_TOKEN_URL,
                data={
                    "client_id": settings.slack_client_id,
                    "client_secret": settings.slack_client_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
            )
            response.raise_for_status()
            data = response.json()

            if not data.get("ok"):
                raise ValueError(f"Slack OAuth error: {data.get('error')}")

            return {
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token"),
                "external_user_id": data.get("authed_user", {}).get("id"),
                "external_email": None,  # Need separate API call
                "team_id": data.get("team", {}).get("id"),
                "team_name": data.get("team", {}).get("name"),
            }

    async def refresh_tokens(self) -> dict:
        """Refresh Slack access tokens."""
        if not self.connection.refresh_token:
            raise ValueError("No refresh token available")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                SLACK_TOKEN_URL,
                data={
                    "client_id": settings.slack_client_id,
                    "client_secret": settings.slack_client_secret,
                    "refresh_token": self.connection.refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            response.raise_for_status()
            data = response.json()

            if not data.get("ok"):
                raise ValueError(f"Slack refresh error: {data.get('error')}")

            return {
                "access_token": data["access_token"],
                "refresh_token": data.get("refresh_token"),
            }

    async def sync(self, db: AsyncSession, user_id: UUID) -> int:
        """Sync messages from Slack."""
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

            # Get list of channels
            channels_response = await client.get(
                f"{SLACK_API_BASE}/conversations.list",
                headers=headers,
                params={"types": "public_channel,private_channel,im,mpim", "limit": 100},
            )
            channels_response.raise_for_status()
            channels_data = channels_response.json()

            if not channels_data.get("ok"):
                raise ValueError(f"Slack API error: {channels_data.get('error')}")

            # Cache user info
            users_cache: dict[str, dict] = {}

            for channel in channels_data.get("channels", []):
                channel_id = channel["id"]
                channel_name = channel.get("name", "Direct Message")
                is_dm = channel.get("is_im", False)

                # Fetch messages
                params = {"channel": channel_id, "limit": 20}
                if sync_state.sync_metadata:
                    import json
                    metadata = json.loads(sync_state.sync_metadata or "{}")
                    oldest = metadata.get(f"channel_{channel_id}_oldest")
                    if oldest:
                        params["oldest"] = oldest

                history_response = await client.get(
                    f"{SLACK_API_BASE}/conversations.history",
                    headers=headers,
                    params=params,
                )
                history_response.raise_for_status()
                history_data = history_response.json()

                if not history_data.get("ok"):
                    continue

                for message in history_data.get("messages", []):
                    if message.get("subtype"):  # Skip system messages
                        continue

                    # Check if already synced
                    external_id = f"{channel_id}_{message['ts']}"
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

                    # Get user info
                    user_slack_id = message.get("user", "")
                    sender_name = "Unknown"
                    if user_slack_id:
                        if user_slack_id not in users_cache:
                            user_response = await client.get(
                                f"{SLACK_API_BASE}/users.info",
                                headers=headers,
                                params={"user": user_slack_id},
                            )
                            if user_response.status_code == 200:
                                user_data = user_response.json()
                                if user_data.get("ok"):
                                    users_cache[user_slack_id] = user_data.get("user", {})

                        user_info = users_cache.get(user_slack_id, {})
                        sender_name = user_info.get("real_name") or user_info.get("name", "Unknown")

                    # Parse timestamp
                    ts = float(message["ts"])
                    received_at = datetime.fromtimestamp(ts)

                    item = Item(
                        user_id=user_id,
                        platform=Platform.SLACK,
                        item_type=ItemType.SLACK_DM if is_dm else ItemType.SLACK_MESSAGE,
                        external_id=external_id,
                        thread_id=message.get("thread_ts"),
                        subject=None,
                        body=message.get("text", "")[:10000],
                        snippet=message.get("text", "")[:500],
                        sender_name=sender_name[:255],
                        sender_id=user_slack_id,
                        channel_id=channel_id,
                        channel_name=channel_name[:255] if channel_name else None,
                        received_at=received_at,
                    )
                    db.add(item)
                    items_synced += 1

        # Update sync state
        sync_state.last_sync_at = datetime.utcnow()
        sync_state.last_sync_status = "success"
        sync_state.items_synced += items_synced

        await db.flush()
        return items_synced
