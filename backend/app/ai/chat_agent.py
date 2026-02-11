"""Chat agent using context-stuffing approach (like briefing generator).

Gathers all user data upfront and passes it as context to the LLM
in a single call. Works with any LLM provider including Bedrock DeepSeek.
"""

from datetime import datetime
from uuid import UUID

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.provider import get_llm_for_briefing
from app.ai.tools import gather_chat_context

SYSTEM_PROMPT = """\
You are FlowState AI, a personal productivity assistant. You have access to the user's \
inbox, deadlines, tasks, and calendar data provided below.

Answer the user's questions based on this data. Be concise and helpful. \
Use clean formatting with bullet points and bold when appropriate. \
If the data doesn't contain information relevant to the question, say so honestly.

Today's date is {today}.

--- USER DATA ---

SUMMARY STATS:
{stats}

RECENT INBOX ITEMS:
{inbox}

DEADLINES:
{deadlines}

TASKS:
{tasks}

UPCOMING CALENDAR EVENTS:
{events}

--- END USER DATA ---
"""


async def process_chat_message(
    db: AsyncSession,
    user_id: UUID,
    message: str,
    chat_history: list,
) -> str:
    """Process a chat message by gathering context and calling the LLM.

    Args:
        db: Async database session.
        user_id: The authenticated user's ID.
        message: The user's chat message.
        chat_history: List of prior LangChain message objects.

    Returns:
        The assistant's response text.
    """
    llm = get_llm_for_briefing()
    context = await gather_chat_context(db, user_id)

    system_msg = SystemMessage(content=SYSTEM_PROMPT.format(
        today=datetime.utcnow().strftime("%A, %B %d, %Y"),
        **context,
    ))

    messages = [system_msg] + chat_history + [HumanMessage(content=message)]

    result = await llm.ainvoke(messages)
    return result.content
