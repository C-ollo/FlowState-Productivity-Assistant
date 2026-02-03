from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.ai_agent import AIService

router = APIRouter()
ai_service = AIService()

class ChatRequest(BaseModel):
    message: str

@router.post("/query")
async def chat_query(request: ChatRequest):
    # This is a simple pass-through to LLM for now.
    # In real implementation, this would query the DB (RAG) before sending to LLM.
    response = await ai_service.llm.ainvoke(request.message)
    return {"response": response.content}
