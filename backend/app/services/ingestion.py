from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.all_models import Item, User
from app.services.ai_agent import AIService

class IngestionService:
    def __init__(self, db: AsyncSession, user: User):
        self.db = db
        self.user = user
        self.ai = AIService()

    async def process_item(self, raw_item: Dict[str, Any], platform: str):
        # 1. Normalize
        # 2. AI Enrichment (Summarize, Extract Deadlines)
        # 3. Store
        
        content = raw_item.get("body") or raw_item.get("text", "")
        
        # AI Processing
        # In a real background job, these would be separate steps or queued
        summary = await self.ai.summarize_email(content[:1000]) # Truncate for now
        
        item = Item(
            user_id=self.user.id,
            source_id=raw_item.get("id"),
            platform=platform,
            type=raw_item.get("type", "message"),
            sender=raw_item.get("sender"),
            subject=raw_item.get("subject"),
            content=content,
            summary=summary,
            received_at=raw_item.get("timestamp")
        )
        
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        
        return item
