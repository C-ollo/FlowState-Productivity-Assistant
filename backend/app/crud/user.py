from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.auth import get_password_hash


class UserCRUD:
    """CRUD operations for User model."""

    async def get(self, db: AsyncSession, user_id: UUID) -> User | None:
        """Get user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        """Get user by email."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, user_in: UserCreate) -> User:
        """Create a new user."""
        hashed_password = get_password_hash(user_in.password)
        user = User(
            email=user_in.email,
            name=user_in.name,
            timezone=user_in.timezone,
            hashed_password=hashed_password,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    async def update(
        self, db: AsyncSession, user: User, user_in: UserUpdate
    ) -> User:
        """Update a user."""
        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        await db.flush()
        await db.refresh(user)
        return user

    async def delete(self, db: AsyncSession, user: User) -> None:
        """Delete a user."""
        await db.delete(user)
        await db.flush()


user_crud = UserCRUD()
