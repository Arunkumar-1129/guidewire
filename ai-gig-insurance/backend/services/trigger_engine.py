"""
Trigger Engine - Auto-generates claims when weather exceeds thresholds.
Runs every 10 minutes via APScheduler. Also callable manually via API.
"""
import uuid
from datetime import datetime, timedelta
from services.weather_service import get_weather
from services.payout_service import simulate_payout
from services.ai_service import detect_fraud
from config import (RAIN_THRESHOLD_MM, AQI_THRESHOLD, HEAT_THRESHOLD_CELSIUS,
                    RAIN_PAYOUT, POLLUTION_PAYOUT, HEATWAVE_PAYOUT)


async def run_trigger_check(db=None):
    """Check weather for all active-policy cities and auto-generate claims."""
    from database import get_db
    if db is None:
        db = get_db()
    if db is None:
        return {"message": "DB not available", "triggered": 0}

    active_policies = await db.policies.find({"status": "active"}).to_list(1000)
    if not active_policies:
        return {"message": "No active policies", "triggered": 0}

    user_ids  = [p["user_id"] for p in active_policies]
    workers   = await db.users.find({"user_id": {"$in": user_ids}}).to_list(1000)
    cities    = list({w["city"] for w in workers})
    triggered = 0

    for city in cities:
        weather = get_weather(city)
        events  = []

        if weather["rainfall_mm"] >= RAIN_THRESHOLD_MM:
            events.append(("rain",      weather["rainfall_mm"],  RAIN_PAYOUT))
        if weather["aqi"] >= AQI_THRESHOLD:
            events.append(("pollution", weather["aqi"],           POLLUTION_PAYOUT))
        if weather["temperature"] >= HEAT_THRESHOLD_CELSIUS:
            events.append(("heatwave",  weather["temperature"],   HEATWAVE_PAYOUT))

        for event_type, event_value, payout in events:
            city_workers = [w for w in workers if w["city"] == city]
            today_start  = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

            for worker in city_workers:
                # One claim per event type per day
                existing = await db.claims.find_one({
                    "user_id":    worker["user_id"],
                    "event_type": event_type,
                    "triggered_at": {"$gte": today_start}
                })
                if existing:
                    continue

                claim_count = await db.claims.count_documents({"user_id": worker["user_id"]})
                is_fraud    = detect_fraud(claim_count + 1, payout)
                claim_id    = str(uuid.uuid4())

                claim_doc = {
                    "claim_id":    claim_id,
                    "user_id":     worker["user_id"],
                    "event_type":  event_type,
                    "event_value": event_value,
                    "payout":      int(payout),
                    "status":      "pending_approval",
                    "is_fraud":    is_fraud,
                    "city":        city,
                    "triggered_at": datetime.utcnow()
                }
                await db.claims.insert_one(claim_doc)

                # No longer simulate payouts here.
                # All claims go to 'pending_approval' for the Admin Dashboard.
                triggered += 1

    return {"message": f"Trigger check done for {len(cities)} cities", "triggered": triggered}
