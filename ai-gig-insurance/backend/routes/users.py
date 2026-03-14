from fastapi import APIRouter, HTTPException
from database import get_db
from services.weather_service import get_weather
from services.ai_service import predict_risk, calculate_premium, get_risk_label

router = APIRouter(prefix="/users", tags=["Users"])


def _clean(doc):
    if doc is None:
        return doc
    if isinstance(doc, list):
        return [_clean(d) for d in doc]
    doc.pop("_id", None)
    for k, v in list(doc.items()):
        if hasattr(v, 'isoformat'):
            doc[k] = v.isoformat()
    return doc


@router.get("/dashboard/{user_id}", summary="Get worker dashboard data")
async def get_dashboard(user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(404, "User not found")

    policy = await db.policies.find_one({"user_id": user_id})
    claims = await db.claims.find({"user_id": user_id}).sort("triggered_at", -1).limit(5).to_list(5)

    # Refresh risk with current weather
    weather    = get_weather(user["city"])
    risk_score = predict_risk(weather["rainfall_mm"], weather["aqi"], 65)
    risk_label = get_risk_label(risk_score)
    prem       = calculate_premium(risk_score, user["daily_income"])

    # Update in DB
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"risk_score": risk_score, "risk_label": risk_label, "weekly_premium": prem}}
    )

    total_payout = sum(c.get("payout", 0) for c in claims if c.get("status") == "paid")

    return {
        "user_id":        user["user_id"],
        "name":           user["name"],
        "phone":          user["phone"],
        "platform":       user["platform"],
        "city":           user["city"],
        "daily_income":   user["daily_income"],
        "risk_score":     risk_score,
        "risk_label":     risk_label,
        "weekly_premium": prem,
        "policy_status":  policy["status"] if policy else "inactive",
        "total_payout":   total_payout,
        "recent_claims":  len(claims),
        "weather":        weather
    }


@router.get("/profile/{user_id}", summary="Get worker profile")
async def get_profile(user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "User not found")
    return _clean(user)
