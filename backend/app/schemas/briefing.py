from datetime import datetime, date
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.briefing import BriefingType


class BriefingRead(BaseModel):
    """Schema for reading a briefing."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    briefing_date: date
    briefing_type: BriefingType
    content: str
    generated_at: datetime


class BriefingRequest(BaseModel):
    """Schema for requesting a briefing."""

    briefing_type: BriefingType = BriefingType.ON_DEMAND
