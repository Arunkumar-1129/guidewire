from fastapi import APIRouter, HTTPException
from database import get_db
from models.claim_model import ClaimCreate
from services.trigger_engine import run_trigger_check
from services.payout_service import simulate_payout
from services.ai_service import detect_fraud
import uuid
from datetime import datetime

router = APIRouter(prefix="/claims", tags=["Claims"])


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


@router.get("/{user_id}", summary="Get all claims for a worker")
async def get_claims(user_id: str):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    raw = await db.claims.find({"user_id": user_id}, {"_id": 0}).sort("triggered_at", -1).to_list(100)
    claims = [_clean(c) for c in raw]
    return {"user_id": user_id, "total_claims": len(claims), "claims": claims}


@router.post("/trigger-demo", summary="Manually trigger a disruption claim (demo)")
async def trigger_demo(body: ClaimCreate):
    try:
        db = get_db()
        if db is None:
            raise HTTPException(503, "Database not available")

        policy = await db.policies.find_one({"user_id": body.user_id})
        if not policy or policy.get("status") != "active":
            # Hackathon auto-activation for seamless demo testing
            from datetime import timedelta
            now = datetime.utcnow()
            expires = now + timedelta(days=7)
            await db.policies.update_one(
                {"user_id": body.user_id},
                {"$set": {"status": "active", "activated_at": now, "expires_at": expires}},
                upsert=True
            )

        user = await db.users.find_one({"user_id": body.user_id})
        if not user:
            raise HTTPException(404, "User not found")

        PAYOUT_MAP = {"rain": 600, "pollution": 400, "heatwave": 500}
        payout = PAYOUT_MAP.get(body.event_type, 500)

        claim_count = await db.claims.count_documents({"user_id": body.user_id})
        is_fraud    = detect_fraud(claim_count + 1, payout)
        claim_id    = str(uuid.uuid4())
        now         = datetime.utcnow()

        claim_doc = {
            "claim_id":     claim_id,
            "user_id":      body.user_id,
            "event_type":   body.event_type,
            "event_value":  body.event_value,
            "payout":       int(payout),
            "status":       "pending_approval",
            "is_fraud":     bool(is_fraud),
            "city":         body.city,
            "triggered_at": now
        }
        await db.claims.insert_one(claim_doc)

        return {
            "message":       "Claim triggered and sent to Confirmations queue",
            "claim_id":      claim_id,
            "is_fraud":      bool(is_fraud),
            "payout":        int(payout),
            "status":        claim_doc["status"],
            "triggered_at":  now.isoformat()
        }
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        raise HTTPException(500, f"Trigger failed: {str(e)} -> {err_msg}")


@router.post("/approve/{claim_id}", summary="Admin manually confirm and payout a claim")
async def approve_claim(claim_id: str):
    db = get_db()
    claim = await db.claims.find_one({"claim_id": claim_id, "status": "pending_approval"})
    if not claim:
        raise HTTPException(404, "Claim not found or not pending approval")
    
    user = await db.users.find_one({"user_id": claim["user_id"]})
    payout_result = simulate_payout(claim["user_id"], user.get("phone", ""), claim["payout"])
    
    await db.claims.update_one(
        {"claim_id": claim_id},
        {"$set": {"status": "paid", "payout_ref": payout_result["transaction_id"]}}
    )
    return {"message": "Claim approved and paid successfully!"}


@router.post("/reject/{claim_id}", summary="Admin manually reject a claim")
async def reject_claim(claim_id: str):
    db = get_db()
    claim = await db.claims.find_one({"claim_id": claim_id, "status": "pending_approval"})
    if not claim:
        raise HTTPException(404, "Claim not found or not pending approval")
        
    await db.claims.update_one(
        {"claim_id": claim_id},
        {"$set": {"status": "rejected"}}
    )
    return {"message": "Claim has been rejected."}


@router.post("/run-auto-trigger", summary="Run auto weather trigger check for all cities")
async def run_auto_trigger():
    result = await run_trigger_check()
    return result
