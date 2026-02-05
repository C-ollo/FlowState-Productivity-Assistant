from datetime import date, datetime
from uuid import UUID

from langchain_core.output_parsers import StrOutputParser
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.provider import get_llm_for_briefing
from app.ai.prompts import BRIEFING_GENERATOR_PROMPT
from app.models.briefing import Briefing, BriefingType
from app.models.deadline import Deadline, DeadlineStatus
from app.models.item import Item
from app.models.task import Task, TaskStatus


async def generate_daily_briefing(
    db: AsyncSession,
    user_id: UUID,
    briefing_date: date | None = None,
) -> Briefing:
    """Generate a daily briefing for a user."""
    if briefing_date is None:
        briefing_date = date.today()

    llm = get_llm_for_briefing()
    chain = BRIEFING_GENERATOR_PROMPT | llm | StrOutputParser()

    # Gather data for briefing
    # Unread messages
    unread_result = await db.execute(
        select(Item)
        .where(
            and_(
                Item.user_id == user_id,
                Item.is_read == False,
                Item.is_archived == False,
            )
        )
        .order_by(Item.priority_score.desc())
        .limit(10)
    )
    unread_items = list(unread_result.scalars().all())

    unread_summary = ""
    for item in unread_items:
        priority_label = "🔴" if item.priority_score >= 70 else "🟡" if item.priority_score >= 50 else "⚪"
        summary = item.ai_summary or item.snippet or item.subject or "No preview"
        unread_summary += f"- {priority_label} [{item.platform.value}] {item.sender_name or item.sender_email}: {summary[:100]}\n"

    # Upcoming deadlines
    deadline_result = await db.execute(
        select(Deadline)
        .where(
            and_(
                Deadline.user_id == user_id,
                Deadline.status == DeadlineStatus.PENDING,
            )
        )
        .order_by(Deadline.due_at.asc())
        .limit(5)
    )
    deadlines = list(deadline_result.scalars().all())

    deadlines_summary = ""
    for deadline in deadlines:
        days_until = (deadline.due_at.date() - briefing_date).days
        urgency = "🔴 TODAY" if days_until == 0 else f"🟡 {days_until}d" if days_until <= 3 else f"⚪ {days_until}d"
        deadlines_summary += f"- {urgency} {deadline.title} (due {deadline.due_at.strftime('%b %d')})\n"

    # Today's events
    events_result = await db.execute(
        select(Item)
        .where(
            and_(
                Item.user_id == user_id,
                Item.item_type.in_(["calendar_event", "calendar_invite"]),
                Item.event_start >= datetime.combine(briefing_date, datetime.min.time()),
                Item.event_start < datetime.combine(briefing_date, datetime.max.time()),
            )
        )
        .order_by(Item.event_start.asc())
    )
    events = list(events_result.scalars().all())

    events_summary = ""
    for event in events:
        time_str = event.event_start.strftime("%H:%M") if event.event_start else "All day"
        events_summary += f"- {time_str} {event.subject}\n"

    # Pending tasks
    tasks_result = await db.execute(
        select(Task)
        .where(
            and_(
                Task.user_id == user_id,
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
            )
        )
        .order_by(Task.priority.desc(), Task.due_at.asc())
        .limit(5)
    )
    tasks = list(tasks_result.scalars().all())

    tasks_summary = ""
    for task in tasks:
        status_icon = "🔄" if task.status == TaskStatus.IN_PROGRESS else "⬜"
        due_str = f" (due {task.due_at.strftime('%b %d')})" if task.due_at else ""
        tasks_summary += f"- {status_icon} {task.title}{due_str}\n"

    # Generate briefing
    content = await chain.ainvoke({
        "date": briefing_date.strftime("%A, %B %d, %Y"),
        "unread_count": len(unread_items),
        "unread_summary": unread_summary or "No unread messages",
        "deadline_count": len(deadlines),
        "deadlines_summary": deadlines_summary or "No upcoming deadlines",
        "event_count": len(events),
        "events_summary": events_summary or "No events scheduled",
        "task_count": len(tasks),
        "tasks_summary": tasks_summary or "No pending tasks",
    })

    # Create briefing record
    briefing = Briefing(
        user_id=user_id,
        briefing_date=briefing_date,
        briefing_type=BriefingType.DAILY_MORNING,
        content=content,
    )
    db.add(briefing)
    await db.flush()
    await db.refresh(briefing)

    return briefing
