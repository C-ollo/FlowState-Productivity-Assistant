"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE platform AS ENUM ('gmail', 'slack', 'calendar')")
    op.execute("CREATE TYPE connectionstatus AS ENUM ('active', 'expired', 'revoked', 'error')")
    op.execute("CREATE TYPE itemtype AS ENUM ('email', 'slack_message', 'slack_dm', 'calendar_event', 'calendar_invite')")
    op.execute("CREATE TYPE actiontype AS ENUM ('reply_needed', 'review_needed', 'meeting_request', 'fyi_only', 'task_assigned', 'none')")
    op.execute("CREATE TYPE category AS ENUM ('work', 'personal', 'school', 'promotional', 'social', 'finance', 'other')")
    op.execute("CREATE TYPE deadlinestatus AS ENUM ('pending', 'completed', 'overdue', 'cancelled')")
    op.execute("CREATE TYPE taskstatus AS ENUM ('todo', 'in_progress', 'done', 'cancelled')")
    op.execute("CREATE TYPE taskpriority AS ENUM ('low', 'medium', 'high', 'urgent')")
    op.execute("CREATE TYPE reminderchannel AS ENUM ('in_app', 'email', 'push')")
    op.execute("CREATE TYPE briefingtype AS ENUM ('daily_morning', 'daily_evening', 'weekly', 'on_demand')")

    # Users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, index=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.Text(), nullable=True),
        sa.Column("timezone", sa.String(50), default="UTC", nullable=False),
        sa.Column("settings", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Connections table
    op.create_table(
        "connections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
        sa.Column("platform", sa.Enum("gmail", "slack", "calendar", name="platform", create_type=False), index=True, nullable=False),
        sa.Column("access_token", sa.Text(), nullable=False),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("scopes", sa.Text(), nullable=True),
        sa.Column("external_user_id", sa.String(255), nullable=True),
        sa.Column("external_email", sa.String(255), nullable=True),
        sa.Column("status", sa.Enum("active", "expired", "revoked", "error", name="connectionstatus", create_type=False), default="active", nullable=False),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Items table
    op.create_table(
        "items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
        sa.Column("platform", sa.Enum("gmail", "slack", "calendar", name="platform", create_type=False), index=True, nullable=False),
        sa.Column("item_type", sa.Enum("email", "slack_message", "slack_dm", "calendar_event", "calendar_invite", name="itemtype", create_type=False), nullable=False),
        sa.Column("external_id", sa.String(255), index=True, nullable=False),
        sa.Column("thread_id", sa.String(255), index=True, nullable=True),
        sa.Column("subject", sa.String(500), nullable=True),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("snippet", sa.String(500), nullable=True),
        sa.Column("sender_name", sa.String(255), nullable=True),
        sa.Column("sender_email", sa.String(255), nullable=True),
        sa.Column("sender_id", sa.String(255), nullable=True),
        sa.Column("recipients_to", sa.Text(), nullable=True),
        sa.Column("recipients_cc", sa.Text(), nullable=True),
        sa.Column("channel_id", sa.String(255), nullable=True),
        sa.Column("channel_name", sa.String(255), nullable=True),
        sa.Column("event_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("event_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("event_location", sa.String(500), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("action_required", sa.Boolean(), default=False, nullable=False),
        sa.Column("action_type", sa.Enum("reply_needed", "review_needed", "meeting_request", "fyi_only", "task_assigned", "none", name="actiontype", create_type=False), default="none", nullable=False),
        sa.Column("priority_score", sa.Integer(), default=50, nullable=False),
        sa.Column("category", sa.Enum("work", "personal", "school", "promotional", "social", "finance", "other", name="category", create_type=False), default="other", nullable=False),
        sa.Column("sentiment", sa.String(50), nullable=True),
        sa.Column("ai_confidence", sa.Float(), nullable=True),
        sa.Column("ai_processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_read", sa.Boolean(), default=False, index=True, nullable=False),
        sa.Column("is_archived", sa.Boolean(), default=False, index=True, nullable=False),
        sa.Column("is_starred", sa.Boolean(), default=False, nullable=False),
        sa.Column("is_snoozed", sa.Boolean(), default=False, nullable=False),
        sa.Column("snoozed_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("received_at", sa.DateTime(timezone=True), index=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Deadlines table
    op.create_table(
        "deadlines",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
        sa.Column("item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("items.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), index=True, nullable=False),
        sa.Column("source_text", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), default=1.0, nullable=False),
        sa.Column("status", sa.Enum("pending", "completed", "overdue", "cancelled", name="deadlinestatus", create_type=False), default="pending", index=True, nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Tasks table
    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
        sa.Column("item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("items.id", ondelete="SET NULL"), nullable=True),
        sa.Column("deadline_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("deadlines.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum("todo", "in_progress", "done", "cancelled", name="taskstatus", create_type=False), default="todo", index=True, nullable=False),
        sa.Column("priority", sa.Enum("low", "medium", "high", "urgent", name="taskpriority", create_type=False), default="medium", nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), index=True, nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("position", sa.Integer(), default=0, nullable=False),
        sa.Column("ai_generated", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Reminders table
    op.create_table(
        "reminders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
        sa.Column("task_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True),
        sa.Column("deadline_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("deadlines.id", ondelete="CASCADE"), nullable=True),
        sa.Column("remind_at", sa.DateTime(timezone=True), index=True, nullable=False),
        sa.Column("channel", sa.Enum("in_app", "email", "push", name="reminderchannel", create_type=False), default="in_app", nullable=False),
        sa.Column("message", sa.String(500), nullable=True),
        sa.Column("sent", sa.Boolean(), default=False, index=True, nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Briefings table
    op.create_table(
        "briefings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False),
        sa.Column("briefing_date", sa.Date(), index=True, nullable=False),
        sa.Column("briefing_type", sa.Enum("daily_morning", "daily_evening", "weekly", "on_demand", name="briefingtype", create_type=False), default="daily_morning", nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("data_snapshot", sa.Text(), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Sync states table
    op.create_table(
        "sync_states",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("connection_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("connections.id", ondelete="CASCADE"), index=True, nullable=False),
        sa.Column("sync_token", sa.String(500), nullable=True),
        sa.Column("sync_metadata", sa.Text(), nullable=True),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_sync_status", sa.String(50), nullable=True),
        sa.Column("last_sync_error", sa.Text(), nullable=True),
        sa.Column("items_synced", sa.Integer(), default=0, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("sync_states")
    op.drop_table("briefings")
    op.drop_table("reminders")
    op.drop_table("tasks")
    op.drop_table("deadlines")
    op.drop_table("items")
    op.drop_table("connections")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS briefingtype")
    op.execute("DROP TYPE IF EXISTS reminderchannel")
    op.execute("DROP TYPE IF EXISTS taskpriority")
    op.execute("DROP TYPE IF EXISTS taskstatus")
    op.execute("DROP TYPE IF EXISTS deadlinestatus")
    op.execute("DROP TYPE IF EXISTS category")
    op.execute("DROP TYPE IF EXISTS actiontype")
    op.execute("DROP TYPE IF EXISTS itemtype")
    op.execute("DROP TYPE IF EXISTS connectionstatus")
    op.execute("DROP TYPE IF EXISTS platform")
