from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import uuid

from models.user_model import UserRegister, UserLogin
from database import get_db
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from services.ai_service import predict_risk, calculate_premium, get_risk_label
from services.weather_service import get_weather
from jose import jwt

router = APIRouter(prefix="/auth", tags=["Authentication"])


def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", summary="Register a new delivery worker")
async def register(user: UserRegister):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    if await db.users.find_one({"phone": user.phone}):
        raise HTTPException(400, "Phone number already registered")

    # Get current weather for AI risk calculation
    weather     = get_weather(user.city)
    risk_score  = predict_risk(weather["rainfall_mm"], weather["aqi"], 65)
    weekly_prem = calculate_premium(risk_score, user.daily_income)
    risk_label  = get_risk_label(risk_score)
    user_id     = str(uuid.uuid4())

    user_doc = {
        "user_id":        user_id,
        "name":           user.name,
        "phone":          user.phone,
        "platform":       user.platform,
        "city":           user.city,
        "daily_income":   user.daily_income,
        "risk_score":     risk_score,
        "risk_label":     risk_label,
        "weekly_premium": weekly_prem,
        "created_at":     datetime.utcnow()
    }
    await db.users.insert_one(user_doc)

    # Create default inactive policy
    policy_doc = {
        "policy_id":    str(uuid.uuid4()),
        "user_id":      user_id,
        "premium":      weekly_prem,
        "coverage":     1000,
        "status":       "inactive",
        "activated_at": None,
        "expires_at":   None
    }
    await db.policies.insert_one(policy_doc)

    token = create_token({"sub": user_id, "phone": user.phone})
    return {
        "message":        "Registration successful",
        "user_id":        user_id,
        "token":          token,
        "risk_score":     risk_score,
        "risk_label":     risk_label,
        "weekly_premium": weekly_prem,
        "weather":        weather
    }


@router.post("/login", summary="Login with phone number")
async def login(user: UserLogin):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    user_doc = await db.users.find_one({"phone": user.phone})
    if not user_doc:
        raise HTTPException(404, "User not found. Please register first.")

    token = create_token({"sub": user_doc["user_id"], "phone": user.phone})
    return {
        "message": "Login successful",
        "user_id": user_doc["user_id"],
        "token":   token,
        "name":    user_doc["name"]
    }
