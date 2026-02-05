from langchain_core.output_parsers import StrOutputParser

from app.ai.provider import get_llm
from app.ai.prompts import CATEGORIZER_PROMPT
from app.models.item import Category, Item


async def categorize_item(item: Item) -> Category:
    """Categorize an inbox item."""
    llm = get_llm()
    chain = CATEGORIZER_PROMPT | llm | StrOutputParser()

    # Truncate body if too long
    body = item.body or item.snippet or ""
    if len(body) > 1500:
        body = body[:1500] + "..."

    result = await chain.ainvoke({
        "sender": item.sender_name or item.sender_email or "Unknown",
        "subject": item.subject or "(No subject)",
        "body": body,
    })

    # Parse category
    category_str = result.strip().lower()

    category_map = {
        "work": Category.WORK,
        "personal": Category.PERSONAL,
        "school": Category.SCHOOL,
        "promotional": Category.PROMOTIONAL,
        "social": Category.SOCIAL,
        "finance": Category.FINANCE,
        "other": Category.OTHER,
    }

    return category_map.get(category_str, Category.OTHER)
