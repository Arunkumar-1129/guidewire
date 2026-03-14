from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from database import get_db
from models.policy_model import PolicyActivate

router = APIRouter(prefix="/policies", tags=["Policies"])


def _clean(doc: dict) -> dict:
    """Remove ObjectId and convert datetime to ISO string."""
    doc.pop("_id", None)
    for k, v in doc.items():
        if hasattr(v, 'isoformat'):
            doc[k] = v.isoformat()
    return doc


@router.post("/activate", summary="Activate insurance policy for a worker")
async def activate_policy(body: PolicyActivate):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    user = await db.users.find_one({"user_id": body.user_id})
    if not user:
        raise HTTPException(404, "User not found")

    policy = await db.policies.find_one({"user_id": body.user_id})
    if not policy:
        raise HTTPException(404, "Policy not found. Please register first.")

    if policy["status"] == "active":
        return {"message": "Policy already active", "policy": _clean(policy)}

    now     = datetime.utcnow()
    expires = now + timedelta(days=7)

    await db.policies.update_one(
        {"user_id": body.user_id},
        {"$set": {"status": "active", "activated_at": now, "expires_at": expires}}
    )
    updated = await db.policies.find_one({"user_id": body.user_id}, {"_id": 0})
    return {"message": "Policy activated successfully (7 days)", "policy": _clean(updated)}


@router.get("/{user_id}", summary="Get policy details for a worker")
async def get_policy(user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    policy = await db.policies.find_one({"user_id": user_id}, {"_id": 0})
    if not policy:
        raise HTTPException(404, "Policy not found")

    if (policy["status"] == "active" and policy.get("expires_at") and
            policy["expires_at"] < datetime.utcnow()):
        await db.policies.update_one({"user_id": user_id}, {"$set": {"status": "expired"}})
        policy["status"] = "expired"

    return _clean(policy)
