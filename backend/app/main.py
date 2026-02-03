from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/")
    return {"message": "Welcome to Productivity OS API"}

from app.routers import auth
# from app.routers import items, chat

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
# app.include_router(items.router, prefix=f"{settings.API_V1_STR}/items", tags=["items"])
# app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
