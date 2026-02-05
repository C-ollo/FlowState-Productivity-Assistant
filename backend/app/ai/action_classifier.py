from langchain_core.output_parsers import StrOutputParser

from app.ai.provider import get_llm
from app.ai.prompts import ACTION_CLASSIFIER_PROMPT
from app.models.item import ActionType, Item


async def classify_action(item: Item) -> tuple[bool, ActionType]:
    """Classify the action type required for an item.

    Returns:
        Tuple of (action_required: bool, action_type: ActionType)
    """
    llm = get_llm()
    chain = ACTION_CLASSIFIER_PROMPT | llm | StrOutputParser()

    # Truncate body if too long
    body = item.body or item.snippet or ""
    if len(body) > 2000:
        body = body[:2000] + "..."

    result = await chain.ainvoke({
        "sender": item.sender_name or item.sender_email or "Unknown",
        "subject": item.subject or "(No subject)",
        "body": body,
    })

    # Parse response
    action_str = result.strip().lower().replace(" ", "_")

    # Map to ActionType
    action_map = {
        "reply_needed": ActionType.REPLY_NEEDED,
        "review_needed": ActionType.REVIEW_NEEDED,
        "meeting_request": ActionType.MEETING_REQUEST,
        "task_assigned": ActionType.TASK_ASSIGNED,
        "fyi_only": ActionType.FYI_ONLY,
        "none": ActionType.NONE,
    }

    action_type = action_map.get(action_str, ActionType.NONE)
    action_required = action_type not in (ActionType.FYI_ONLY, ActionType.NONE)

    return action_required, action_type
