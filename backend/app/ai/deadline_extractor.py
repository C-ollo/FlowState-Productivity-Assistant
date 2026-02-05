import json
from datetime import datetime
from uuid import UUID

from langchain_core.output_parsers import StrOutputParser

from app.ai.provider import get_llm
from app.ai.prompts import DEADLINE_EXTRACTOR_PROMPT
from app.models.item import Item
from app.schemas.deadline import DeadlineCreate


async def extract_deadlines(item: Item) -> list[DeadlineCreate]:
    """Extract deadlines from an inbox item."""
    llm = get_llm()
    chain = DEADLINE_EXTRACTOR_PROMPT | llm | StrOutputParser()

    # Truncate body if too long
    body = item.body or item.snippet or ""
    if len(body) > 2000:
        body = body[:2000] + "..."

    today = datetime.utcnow().strftime("%Y-%m-%d")

    result = await chain.ainvoke({
        "today": today,
        "subject": item.subject or "(No subject)",
        "body": body,
    })

    # Parse JSON response
    try:
        # Clean up response (sometimes LLMs add extra text)
        json_str = result.strip()
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0]
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0]

        data = json.loads(json_str)
        deadlines = []

        for d in data.get("deadlines", []):
            try:
                due_at = datetime.fromisoformat(d["due_at"].replace("Z", "+00:00"))
                deadlines.append(DeadlineCreate(
                    title=d["title"],
                    due_at=due_at,
                    item_id=item.id,
                    source_text=d.get("source_text"),
                    confidence=d.get("confidence", 0.8),
                ))
            except (ValueError, KeyError):
                continue

        return deadlines
    except json.JSONDecodeError:
        return []
