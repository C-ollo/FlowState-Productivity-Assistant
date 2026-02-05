from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import Connection, Platform


class BaseIntegration(ABC):
    """Base class for platform integrations."""

    platform: Platform

    def __init__(self, connection: Connection):
        self.connection = connection

    @classmethod
    @abstractmethod
    def get_auth_url(cls, state: str, redirect_uri: str) -> str:
        """Generate OAuth authorization URL."""
        pass

    @classmethod
    @abstractmethod
    async def exchange_code(
        cls,
        code: str,
        redirect_uri: str,
    ) -> dict:
        """Exchange authorization code for tokens."""
        pass

    @abstractmethod
    async def refresh_tokens(self) -> dict:
        """Refresh access tokens."""
        pass

    @abstractmethod
    async def sync(self, db: AsyncSession, user_id: UUID) -> int:
        """Sync data from platform. Returns number of items synced."""
        pass

    def is_token_expired(self) -> bool:
        """Check if access token is expired."""
        if not self.connection.token_expires_at:
            return False
        return datetime.utcnow() >= self.connection.token_expires_at
