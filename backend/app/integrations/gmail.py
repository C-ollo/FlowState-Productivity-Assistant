import base64
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from uuid import UUID
import json

import httpx
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.integrations.base import BaseIntegration
from app.models.connection import Connection, Platform
from app.models.item import Item, ItemType
from app.models.sync_state import SyncState
from app.schemas.item import ItemCreate

GMAIL_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1"
GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]


class GmailIntegration(BaseIntegration):
    """Gmail integration handler."""

    platform = Platform.GMAIL

    @classmethod
    def get_auth_url(cls, state: str, redirect_uri: str) -> str:
        """Generate Gmail OAuth authorization URL."""
        params = {
            "client_id": settings.gmail_client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": " ".join(GMAIL_SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{GMAIL_AUTH_URL}?{query}"

    @classmethod
    async def exchange_code(cls, code: str, redirect_uri: str) -> dict:
        """Exchange authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GMAIL_TOKEN_URL,
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
        """Refresh Gmail access tokens."""
        if not self.connection.refresh_token:
            raise ValueError("No refresh token available")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                GMAIL_TOKEN_URL,
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
        """Sync emails from Gmail."""
        # Get or create sync state
        result = await db.execute(
            select(SyncState).where(SyncState.connection_id == self.connection.id)
        )
        sync_state = result.scalar_one_or_none()

        if not sync_state:
            sync_state = SyncState(connection_id=self.connection.id)
            db.add(sync_state)

        # Fetch messages
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.connection.access_token}"}

            # List messages
            params = {"maxResults": 50, "labelIds": "INBOX"}
            if sync_state.sync_token:
                # Use history API for incremental sync
                params = {"startHistoryId": sync_state.sync_token, "historyTypes": "messageAdded"}
                response = await client.get(
                    f"{GMAIL_API_BASE}/users/me/history",
                    headers=headers,
                    params=params,
                )
            else:
                response = await client.get(
                    f"{GMAIL_API_BASE}/users/me/messages",
                    headers=headers,
                    params=params,
                )

            if response.status_code == 404:
                # History ID expired, do full sync
                sync_state.sync_token = None
                params = {"maxResults": 50, "labelIds": "INBOX"}
                response = await client.get(
                    f"{GMAIL_API_BASE}/users/me/messages",
                    headers=headers,
                    params=params,
                )

            response.raise_for_status()
            data = response.json()

            # Process messages
            messages = data.get("messages", [])
            if "history" in data:
                messages = []
                for history in data.get("history", []):
                    for msg in history.get("messagesAdded", []):
                        messages.append(msg.get("message"))

            items_synced = 0
            for msg in messages:
                if not msg:
                    continue

                # Check if already synced
                existing = await db.execute(
                    select(Item).where(
                        and_(
                            Item.user_id == user_id,
                            Item.external_id == msg["id"],
                        )
                    )
                )
                if existing.scalar_one_or_none():
                    continue

                # Fetch full message
                msg_response = await client.get(
                    f"{GMAIL_API_BASE}/users/me/messages/{msg['id']}",
                    headers=headers,
                    params={"format": "full"},
                )
                msg_response.raise_for_status()
                msg_data = msg_response.json()

                # Parse message
                item = await self._parse_message(msg_data, user_id)
                if item:
                    db.add(item)
                    items_synced += 1

            # Update sync state
            if "historyId" in data:
                sync_state.sync_token = data["historyId"]
            sync_state.last_sync_at = datetime.utcnow()
            sync_state.last_sync_status = "success"
            sync_state.items_synced += items_synced

            await db.flush()
            return items_synced

    async def _parse_message(self, msg_data: dict, user_id: UUID) -> Item | None:
        """Parse Gmail message into Item."""
        headers = {h["name"].lower(): h["value"] for h in msg_data.get("payload", {}).get("headers", [])}

        subject = headers.get("subject", "(No Subject)")
        sender = headers.get("from", "")
        to = headers.get("to", "")
        cc = headers.get("cc", "")
        date_str = headers.get("date", "")

        # Parse sender
        sender_name = ""
        sender_email = sender
        if "<" in sender:
            parts = sender.split("<")
            sender_name = parts[0].strip().strip('"')
            sender_email = parts[1].strip(">")

        # Parse date
        received_at = datetime.utcnow()
        if date_str:
            try:
                received_at = parsedate_to_datetime(date_str)
            except (ValueError, TypeError):
                pass

        # Extract body
        body = self._extract_body(msg_data.get("payload", {}))
        snippet = msg_data.get("snippet", "")

        return Item(
            user_id=user_id,
            platform=Platform.GMAIL,
            item_type=ItemType.EMAIL,
            external_id=msg_data["id"],
            thread_id=msg_data.get("threadId"),
            subject=subject[:500] if subject else None,
            body=body,
            snippet=snippet[:500] if snippet else None,
            sender_name=sender_name[:255] if sender_name else None,
            sender_email=sender_email[:255] if sender_email else None,
            recipients_to=to[:500] if to else None,
            recipients_cc=cc[:500] if cc else None,
            received_at=received_at,
        )

    def _extract_body(self, payload: dict) -> str:
        """Extract body text from Gmail payload."""
        body = ""

        if "body" in payload and payload["body"].get("data"):
            body = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="ignore")
        elif "parts" in payload:
            for part in payload["parts"]:
                if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
                    body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                    break
                elif part.get("mimeType") == "multipart/alternative":
                    body = self._extract_body(part)
                    if body:
                        break

        return body[:10000] if body else ""
