from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.summarizer import summarize_item
from app.ai.deadline_extractor import extract_deadlines
from app.ai.action_classifier import classify_action
from app.ai.priority_scorer import score_priority
from app.ai.categorizer import categorize_item
from app.crud.deadline import deadline_crud
from app.models.item import Item


async def process_item(db: AsyncSession, item: Item) -> Item:
    """Run the full AI processing pipeline on an item.

    Pipeline steps:
    1. Summarize the item
    2. Extract deadlines
    3. Classify action required
    4. Score priority
    5. Categorize

    Returns the updated item.
    """
    # Skip if already processed
    if item.ai_processed_at:
        return item

    try:
        # Step 1: Summarize
        item.ai_summary = await summarize_item(item)

        # Step 2: Extract deadlines
        deadline_creates = await extract_deadlines(item)
        for deadline_create in deadline_creates:
            await deadline_crud.create(db, item.user_id, deadline_create)

        # Step 3: Classify action
        item.action_required, item.action_type = await classify_action(item)

        # Step 4: Score priority
        item.priority_score = await score_priority(item)

        # Step 5: Categorize
        item.category = await categorize_item(item)

        # Mark as processed
        item.ai_processed_at = datetime.utcnow()
        item.ai_confidence = 0.85  # Default confidence

    except Exception as e:
        # Log error but don't fail
        print(f"AI processing error for item {item.id}: {e}")
        item.ai_processed_at = datetime.utcnow()
        item.ai_confidence = 0.0

    await db.flush()
    return item


async def process_items_batch(
    db: AsyncSession,
    items: list[Item],
) -> list[Item]:
    """Process multiple items through the AI pipeline."""
    processed = []
    for item in items:
        processed_item = await process_item(db, item)
        processed.append(processed_item)
    return processed
