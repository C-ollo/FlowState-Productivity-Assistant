"""Data-gathering functions for the chat agent.

These query the user's data and return formatted strings that get passed
as context to the LLM. No LangChain tool-calling required.
"""

from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import Item, ItemType
from app.models.deadline import Deadline, DeadlineStatus
from app.models.task import Task, TaskStatus, TaskPriority


async def search_inbox(db: AsyncSession, user_id: UUID, limit: int = 15) -> str:
    """Get recent inbox items for context."""
    result = await db.execute(
        select(Item)
        .where(
            and_(
                Item.user_id == user_id,
                Item.is_archived == False,
            )
        )
        .order_by(Item.received_at.desc())
        .limit(limit)
    )
    items = result.scalars().all()

    if not items:
        return "No inbox items."

    lines = []
    for item in items:
        date_str = item.received_at.strftime("%b %d, %Y %I:%M %p") if item.received_at else "Unknown"
        sender = item.sender_name or item.sender_email or "Unknown"
        summary = item.ai_summary or item.snippet or ""
        read_marker = "" if item.is_read else " [UNREAD]"
        lines.append(
            f"- [{item.platform.value}]{read_marker} {item.subject or '(No Subject)'} "
            f"| From: {sender} | {date_str}"
            + (f" | Summary: {summary[:150]}" if summary else "")
        )
    return "\n".join(lines)


async def get_deadlines(db: AsyncSession, user_id: UUID) -> str:
    """Get all pending/overdue deadlines."""
    result = await db.execute(
        select(Deadline)
        .where(
            and_(
                Deadline.user_id == user_id,
                Deadline.status.in_([DeadlineStatus.PENDING, DeadlineStatus.OVERDUE]),
            )
        )
        .order_by(Deadline.due_at.asc())
        .limit(20)
    )
    deadlines = result.scalars().all()

    if not deadlines:
        return "No pending deadlines."

    now = datetime.utcnow()
    lines = []
    for d in deadlines:
        due_str = d.due_at.strftime("%b %d, %Y %I:%M %p") if d.due_at else "Unknown"
        overdue = " [OVERDUE]" if d.due_at and d.due_at.replace(tzinfo=None) < now else ""
        lines.append(f"- {d.title} | Due: {due_str}{overdue} | Status: {d.status.value}")
    return "\n".join(lines)


async def get_tasks(db: AsyncSession, user_id: UUID) -> str:
    """Get active tasks."""
    result = await db.execute(
        select(Task)
        .where(
            and_(
                Task.user_id == user_id,
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
            )
        )
        .order_by(Task.priority.desc(), Task.created_at.desc())
        .limit(20)
    )
    tasks = result.scalars().all()

    if not tasks:
        return "No active tasks."

    lines = []
    for t in tasks:
        due_str = f" | Due: {t.due_at.strftime('%b %d, %Y')}" if t.due_at else ""
        lines.append(
            f"- {t.title} | Status: {t.status.value} | Priority: {t.priority.value}{due_str}"
        )
    return "\n".join(lines)


async def get_calendar_events(db: AsyncSession, user_id: UUID, days_ahead: int = 14) -> str:
    """Get upcoming calendar events."""
    now = datetime.utcnow()
    cutoff = now + timedelta(days=days_ahead)

    result = await db.execute(
        select(Item)
        .where(
            and_(
                Item.user_id == user_id,
                Item.item_type.in_([ItemType.CALENDAR_EVENT, ItemType.CALENDAR_INVITE]),
                Item.event_start >= now,
                Item.event_start <= cutoff,
            )
        )
        .order_by(Item.event_start.asc())
        .limit(20)
    )
    events = result.scalars().all()

    if not events:
        return "No upcoming calendar events."

    lines = []
    for e in events:
        start = e.event_start.strftime("%b %d, %Y %I:%M %p") if e.event_start else "TBD"
        end = e.event_end.strftime("%I:%M %p") if e.event_end else ""
        location = f" | Location: {e.event_location}" if e.event_location else ""
        time_str = f"{start}" + (f" - {end}" if end else "")
        lines.append(f"- {e.subject or '(No Title)'} | {time_str}{location}")
    return "\n".join(lines)


async def get_summary_stats(db: AsyncSession, user_id: UUID) -> str:
    """Get summary statistics."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    unread_result = await db.execute(
        select(func.count(Item.id)).where(
            and_(Item.user_id == user_id, Item.is_read == False, Item.is_archived == False)
        )
    )
    unread_count = unread_result.scalar() or 0

    tasks_result = await db.execute(
        select(func.count(Task.id)).where(
            and_(
                Task.user_id == user_id,
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
            )
        )
    )
    pending_tasks = tasks_result.scalar() or 0

    deadline_cutoff = now + timedelta(days=7)
    deadlines_result = await db.execute(
        select(func.count(Deadline.id)).where(
            and_(
                Deadline.user_id == user_id,
                Deadline.status == DeadlineStatus.PENDING,
                Deadline.due_at <= deadline_cutoff,
            )
        )
    )
    upcoming_deadlines = deadlines_result.scalar() or 0

    events_result = await db.execute(
        select(func.count(Item.id)).where(
            and_(
                Item.user_id == user_id,
                Item.item_type.in_([ItemType.CALENDAR_EVENT, ItemType.CALENDAR_INVITE]),
                Item.event_start >= today_start,
                Item.event_start < today_end,
            )
        )
    )
    todays_events = events_result.scalar() or 0

    return (
        f"- Unread inbox items: {unread_count}\n"
        f"- Pending tasks: {pending_tasks}\n"
        f"- Upcoming deadlines (7 days): {upcoming_deadlines}\n"
        f"- Today's calendar events: {todays_events}"
    )


async def gather_chat_context(db: AsyncSession, user_id: UUID) -> dict[str, str]:
    """Gather all user data context for the chat agent."""
    return {
        "stats": await get_summary_stats(db, user_id),
        "inbox": await search_inbox(db, user_id),
        "deadlines": await get_deadlines(db, user_id),
        "tasks": await get_tasks(db, user_id),
        "events": await get_calendar_events(db, user_id),
    }
