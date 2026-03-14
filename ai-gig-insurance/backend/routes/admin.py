from fastapi import APIRouter, HTTPException
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])


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


@router.get("/stats", summary="Get overall platform statistics")
async def get_stats():
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    total_workers   = await db.users.count_documents({})
    active_policies = await db.policies.count_documents({"status": "active"})
    total_claims    = await db.claims.count_documents({})
    claims_today    = await db.claims.count_documents({"triggered_at": {"$gte": today}})
    fraud_alerts    = await db.claims.count_documents({"is_fraud": True})
    paid_claims     = await db.claims.count_documents({"status": "paid"})

    paid_docs    = await db.claims.find({"status": "paid"}, {"payout": 1, "_id": 0}).to_list(1000)
    total_payout = sum(c.get("payout", 0) for c in paid_docs)

    return {
        "total_workers":   total_workers,
        "active_policies": active_policies,
        "total_claims":    total_claims,
        "claims_today":    claims_today,
        "fraud_alerts":    fraud_alerts,
        "paid_claims":     paid_claims,
        "total_payout":    total_payout
    }


@router.get("/workers", summary="Get all workers")
async def get_workers():
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")
    raw     = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    workers = [_clean(w) for w in raw]
    return {"total": len(workers), "workers": workers}


@router.get("/claims", summary="Get all claims")
async def get_all_claims():
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")
    raw    = await db.claims.find({}, {"_id": 0}).sort("triggered_at", -1).to_list(500)
    claims = [_clean(c) for c in raw]
    return {"total": len(claims), "claims": claims}


@router.get("/fraud-alerts", summary="Get flagged fraud claims")
async def get_fraud_alerts():
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")
    raw    = await db.claims.find({"is_fraud": True}, {"_id": 0}).to_list(200)
    frauds = [_clean(f) for f in raw]
    return {"total_fraud": len(frauds), "alerts": frauds}


@router.get("/disruption-analytics", summary="Get disruption analytics by city and event type")
async def get_analytics():
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database not available")

    pipeline = [
        {"$group": {
            "_id":          {"city": "$city", "event": "$event_type"},
            "count":        {"$sum": 1},
            "total_payout": {"$sum": "$payout"}
        }},
        {"$sort": {"count": -1}}
    ]
    results   = await db.claims.aggregate(pipeline).to_list(100)
    analytics = [
        {"city": r["_id"]["city"], "event": r["_id"]["event"],
         "count": r["count"], "total_payout": r["total_payout"]}
        for r in results
    ]
    return {"analytics": analytics}
