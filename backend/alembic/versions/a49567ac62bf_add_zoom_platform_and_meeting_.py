"""Add zoom platform and meeting_transcript item type

Revision ID: a49567ac62bf
Revises: 001
Create Date: 2026-02-11 07:46:53.388913

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a49567ac62bf'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add 'zoom' to the platform enum
    op.execute("ALTER TYPE platform ADD VALUE IF NOT EXISTS 'zoom'")
    # Add 'meeting_transcript' to the itemtype enum
    op.execute("ALTER TYPE itemtype ADD VALUE IF NOT EXISTS 'meeting_transcript'")


def downgrade() -> None:
    # PostgreSQL does not support removing values from enums directly.
    # A full enum rebuild would be needed for a true downgrade.
    pass
