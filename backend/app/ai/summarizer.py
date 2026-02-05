from langchain_core.output_parsers import StrOutputParser

from app.ai.provider import get_llm
from app.ai.prompts import SUMMARIZER_PROMPT
from app.models.item import Item


async def summarize_item(item: Item) -> str:
    """Generate a summary for an inbox item."""
    llm = get_llm()
    chain = SUMMARIZER_PROMPT | llm | StrOutputParser()

    # Determine item type string
    item_type_str = {
        "email": "email",
        "slack_message": "Slack message",
        "slack_dm": "Slack direct message",
        "calendar_event": "calendar event",
        "calendar_invite": "calendar invitation",
    }.get(item.item_type.value, "message")

    # Truncate body if too long
    body = item.body or item.snippet or ""
    if len(body) > 2000:
        body = body[:2000] + "..."

    result = await chain.ainvoke({
        "item_type": item_type_str,
        "sender": item.sender_name or item.sender_email or "Unknown",
        "subject": item.subject or "(No subject)",
        "body": body,
    })

    return result.strip()
