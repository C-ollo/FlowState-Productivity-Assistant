import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from langchain_core.messages import AIMessage, HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_id, get_db
from app.ai.chat_agent import process_chat_message
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

# In-memory conversation history (keyed by conversation_id)
_conversations: dict[str, list] = defaultdict(list)


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Send a message to the AI chat assistant."""
    conversation_id = request.conversation_id or str(uuid.uuid4())
    chat_history = _conversations[conversation_id]

    try:
        response_text = await process_chat_message(
            db=db,
            user_id=user_id,
            message=request.message,
            chat_history=chat_history,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

    # Update conversation history
    chat_history.append(HumanMessage(content=request.message))
    chat_history.append(AIMessage(content=response_text))

    # Cap history to last 20 messages to prevent unbounded growth
    if len(chat_history) > 20:
        _conversations[conversation_id] = chat_history[-20:]

    return ChatResponse(
        response=response_text,
        conversation_id=conversation_id,
    )
