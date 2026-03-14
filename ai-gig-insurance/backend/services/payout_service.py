"""
Payout Service - Simulates UPI/Razorpay payout for insurance claims.
"""
import uuid
import random
from datetime import datetime


def simulate_payout(user_id: str, phone: str, amount: float) -> dict:
    """Simulates a payout and returns transaction details."""
    transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
    upi_ref = f"UPI-{random.randint(100000000, 999999999)}"
    return {
        "transaction_id": transaction_id,
        "upi_ref": upi_ref,
        "user_id": user_id,
        "phone": phone,
        "amount": amount,
        "currency": "INR",
        "status": "SUCCESS",
        "timestamp": datetime.utcnow().isoformat(),
        "message": f"₹{amount} successfully credited to UPI linked to {phone}"
    }
