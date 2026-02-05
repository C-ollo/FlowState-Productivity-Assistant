from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.models.briefing import Briefing, BriefingType
from app.schemas.briefing import BriefingRead

router = APIRouter()


@router.get("/today", response_model=BriefingRead | None)
async def get_today_briefing(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get today's daily briefing."""
    today = date.today()
    result = await db.execute(
        select(Briefing).where(
            and_(
                Briefing.user_id == user_id,
                Briefing.briefing_date == today,
                Briefing.briefing_type == BriefingType.DAILY_MORNING,
            )
        )
    )
    briefing = result.scalar_one_or_none()
    return briefing


@router.get("/{briefing_date}", response_model=BriefingRead)
async def get_briefing_by_date(
    briefing_date: date,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get briefing for a specific date."""
    result = await db.execute(
        select(Briefing).where(
            and_(
                Briefing.user_id == user_id,
                Briefing.briefing_date == briefing_date,
            )
        )
    )
    briefing = result.scalar_one_or_none()
    if not briefing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Briefing not found for this date",
        )
    return briefing


@router.post("/generate", response_model=BriefingRead)
async def generate_briefing(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Generate a new on-demand briefing."""
    from app.ai.briefing_generator import generate_daily_briefing

    briefing = await generate_daily_briefing(db, user_id)
    return briefing
