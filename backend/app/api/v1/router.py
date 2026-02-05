from fastapi import APIRouter

from app.api.v1 import auth, inbox, deadlines, tasks, briefings, connections

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(inbox.router, prefix="/inbox", tags=["inbox"])
api_router.include_router(deadlines.router, prefix="/deadlines", tags=["deadlines"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(briefings.router, prefix="/briefings", tags=["briefings"])
api_router.include_router(connections.router, prefix="/connections", tags=["connections"])
