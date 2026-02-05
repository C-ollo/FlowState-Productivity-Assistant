from langchain_core.output_parsers import StrOutputParser

from app.ai.provider import get_llm
from app.ai.prompts import PRIORITY_SCORER_PROMPT
from app.models.item import ActionType, Item


async def score_priority(item: Item) -> int:
    """Score the priority of an item (1-100)."""
    llm = get_llm()
    chain = PRIORITY_SCORER_PROMPT | llm | StrOutputParser()

    # Truncate body if too long
    body = item.body or item.snippet or ""
    if len(body) > 1500:
        body = body[:1500] + "..."

    result = await chain.ainvoke({
        "sender": item.sender_name or item.sender_email or "Unknown",
        "subject": item.subject or "(No subject)",
        "action_required": "Yes" if item.action_required else "No",
        "action_type": item.action_type.value if item.action_type else "none",
        "body": body,
    })

    # Parse score
    try:
        score = int(result.strip())
        return max(1, min(100, score))  # Clamp to 1-100
    except ValueError:
        # Default to medium priority if parsing fails
        return 50
