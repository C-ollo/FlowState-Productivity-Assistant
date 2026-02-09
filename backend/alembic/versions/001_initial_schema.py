"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

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
    op.execute("""
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            hashed_password TEXT,
            timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
            settings TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_users_email ON users(email)")

    # Connections table
    op.execute("""
        CREATE TABLE connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            platform platform NOT NULL,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            token_expires_at TIMESTAMPTZ,
            scopes TEXT,
            external_user_id VARCHAR(255),
            external_email VARCHAR(255),
            status connectionstatus NOT NULL DEFAULT 'active',
            last_error TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_connections_user_id ON connections(user_id)")
    op.execute("CREATE INDEX ix_connections_platform ON connections(platform)")

    # Items table
    op.execute("""
        CREATE TABLE items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            platform platform NOT NULL,
            item_type itemtype NOT NULL,
            external_id VARCHAR(255) NOT NULL,
            thread_id VARCHAR(255),
            subject VARCHAR(500),
            body TEXT,
            snippet VARCHAR(500),
            sender_name VARCHAR(255),
            sender_email VARCHAR(255),
            sender_id VARCHAR(255),
            recipients_to TEXT,
            recipients_cc TEXT,
            channel_id VARCHAR(255),
            channel_name VARCHAR(255),
            event_start TIMESTAMPTZ,
            event_end TIMESTAMPTZ,
            event_location VARCHAR(500),
            ai_summary TEXT,
            action_required BOOLEAN NOT NULL DEFAULT FALSE,
            action_type actiontype NOT NULL DEFAULT 'none',
            priority_score INTEGER NOT NULL DEFAULT 50,
            category category NOT NULL DEFAULT 'other',
            sentiment VARCHAR(50),
            ai_confidence FLOAT,
            ai_processed_at TIMESTAMPTZ,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            is_archived BOOLEAN NOT NULL DEFAULT FALSE,
            is_starred BOOLEAN NOT NULL DEFAULT FALSE,
            is_snoozed BOOLEAN NOT NULL DEFAULT FALSE,
            snoozed_until TIMESTAMPTZ,
            received_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_items_user_id ON items(user_id)")
    op.execute("CREATE INDEX ix_items_platform ON items(platform)")
    op.execute("CREATE INDEX ix_items_external_id ON items(external_id)")
    op.execute("CREATE INDEX ix_items_thread_id ON items(thread_id)")
    op.execute("CREATE INDEX ix_items_is_read ON items(is_read)")
    op.execute("CREATE INDEX ix_items_is_archived ON items(is_archived)")
    op.execute("CREATE INDEX ix_items_received_at ON items(received_at)")

    # Deadlines table
    op.execute("""
        CREATE TABLE deadlines (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            item_id UUID REFERENCES items(id) ON DELETE SET NULL,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            due_at TIMESTAMPTZ NOT NULL,
            source_text TEXT,
            confidence FLOAT NOT NULL DEFAULT 1.0,
            status deadlinestatus NOT NULL DEFAULT 'pending',
            completed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_deadlines_user_id ON deadlines(user_id)")
    op.execute("CREATE INDEX ix_deadlines_due_at ON deadlines(due_at)")
    op.execute("CREATE INDEX ix_deadlines_status ON deadlines(status)")

    # Tasks table
    op.execute("""
        CREATE TABLE tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            item_id UUID REFERENCES items(id) ON DELETE SET NULL,
            deadline_id UUID REFERENCES deadlines(id) ON DELETE SET NULL,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            status taskstatus NOT NULL DEFAULT 'todo',
            priority taskpriority NOT NULL DEFAULT 'medium',
            due_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            position INTEGER NOT NULL DEFAULT 0,
            ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_tasks_user_id ON tasks(user_id)")
    op.execute("CREATE INDEX ix_tasks_status ON tasks(status)")
    op.execute("CREATE INDEX ix_tasks_due_at ON tasks(due_at)")

    # Reminders table
    op.execute("""
        CREATE TABLE reminders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
            deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,
            remind_at TIMESTAMPTZ NOT NULL,
            channel reminderchannel NOT NULL DEFAULT 'in_app',
            message VARCHAR(500),
            sent BOOLEAN NOT NULL DEFAULT FALSE,
            sent_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_reminders_user_id ON reminders(user_id)")
    op.execute("CREATE INDEX ix_reminders_remind_at ON reminders(remind_at)")
    op.execute("CREATE INDEX ix_reminders_sent ON reminders(sent)")

    # Briefings table
    op.execute("""
        CREATE TABLE briefings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            briefing_date DATE NOT NULL,
            briefing_type briefingtype NOT NULL DEFAULT 'daily_morning',
            content TEXT NOT NULL,
            data_snapshot TEXT,
            generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_briefings_user_id ON briefings(user_id)")
    op.execute("CREATE INDEX ix_briefings_briefing_date ON briefings(briefing_date)")

    # Sync states table
    op.execute("""
        CREATE TABLE sync_states (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
            sync_token VARCHAR(500),
            sync_metadata TEXT,
            last_sync_at TIMESTAMPTZ,
            last_sync_status VARCHAR(50),
            last_sync_error TEXT,
            items_synced INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX ix_sync_states_connection_id ON sync_states(connection_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS sync_states CASCADE")
    op.execute("DROP TABLE IF EXISTS briefings CASCADE")
    op.execute("DROP TABLE IF EXISTS reminders CASCADE")
    op.execute("DROP TABLE IF EXISTS tasks CASCADE")
    op.execute("DROP TABLE IF EXISTS deadlines CASCADE")
    op.execute("DROP TABLE IF EXISTS items CASCADE")
    op.execute("DROP TABLE IF EXISTS connections CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")

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
