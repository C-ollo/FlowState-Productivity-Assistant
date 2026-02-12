import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.models.connection import Platform
from app.models.item import Item, ItemType
from app.schemas.item import ItemRead
from app.services.ai_pipeline import process_item
from app.utils.transcript_parser import parse_transcript

router = APIRouter()

ALLOWED_EXTENSIONS = {".vtt", ".srt", ".txt"}


@router.post("/upload", response_model=ItemRead)
async def upload_transcript(
    file: UploadFile = File(...),
    title: str = Form(default=""),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Upload a meeting transcript file (.vtt, .srt, .txt) for AI processing."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided",
        )

    # Validate extension
    ext = ""
    dot_idx = file.filename.rfind(".")
    if dot_idx >= 0:
        ext = file.filename[dot_idx:].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and parse content
    raw_bytes = await file.read()
    content = raw_bytes.decode("utf-8", errors="ignore")
    parsed_text = parse_transcript(content, file.filename)

    if not parsed_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript file is empty after parsing",
        )

    # Determine title
    subject = title.strip() if title.strip() else f"Transcript: {file.filename}"

    # Create item
    item = Item(
        user_id=user_id,
        platform=Platform.ZOOM,
        item_type=ItemType.MEETING_TRANSCRIPT,
        external_id=f"upload_{uuid.uuid4().hex}",
        subject=subject,
        body=parsed_text[:50000],
        snippet=parsed_text[:500],
        sender_name="Uploaded Transcript",
        received_at=datetime.utcnow(),
    )
    db.add(item)
    await db.flush()

    # Run AI pipeline
    item = await process_item(db, item)
    await db.flush()

    return item
