from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    name: str
    phone: str
    platform: str   # Swiggy / Zomato / Dunzo / Blinkit
    city: str
    daily_income: float


class UserLogin(BaseModel):
    phone: str


class UserResponse(BaseModel):
    user_id: str
    name: str
    phone: str
    platform: str
    city: str
    daily_income: float
    risk_score: Optional[float] = 0.0
    risk_label: Optional[str] = "LOW"
    weekly_premium: Optional[float] = 0.0
    created_at: Optional[datetime] = None
