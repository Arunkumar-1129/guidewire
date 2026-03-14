from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ClaimCreate(BaseModel):
    user_id: str
    event_type: str   # rain / pollution / heatwave
    event_value: float
    city: str


class ClaimResponse(BaseModel):
    claim_id: str
    user_id: str
    event_type: str
    event_value: float
    payout: float
    status: str
    is_fraud: bool
    triggered_at: Optional[datetime] = None
    city: str
