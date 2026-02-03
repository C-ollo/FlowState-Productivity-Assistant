from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.all_models import Item, User
from app.core import security

router = APIRouter()

# Mock dependency for user since we don't have full auth flow yet
async def get_current_user(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    # In real app, decode token and get user
    # For now, just return first user or mock
    result = await db.execute(select(User).limit(1))
    return result.scalars().first()

@router.get("/", response_model=List[dict])
async def read_items(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    query = select(Item).order_by(desc(Item.received_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    # Simple serialization helper
    return [
        {
            "id": item.id,
            "subject": item.subject,
            "summary": item.summary,
            "platform": item.platform,
            "received_at": item.received_at,
            "priority_score": item.priority_score,
            "action_required": item.action_required
        } 
        for item in items
    ]
