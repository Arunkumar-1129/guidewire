from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PolicyActivate(BaseModel):
    user_id: str


class PolicyResponse(BaseModel):
    policy_id: str
    user_id: str
    premium: float
    coverage: float
    status: str
    activated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
