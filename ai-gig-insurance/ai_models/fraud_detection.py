"""
Standalone Fraud Detection Model
Run: python ai_models/fraud_detection.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import numpy as np
from sklearn.ensemble import IsolationForest

TRAINING_DATA = np.array([
    # Normal claims: [claim_count, payout_amount]
    [1, 600], [1, 400], [1, 500], [2, 600], [2, 400],
    [1, 600], [2, 500], [1, 400], [3, 600], [2, 600],
    [1, 500], [2, 400], [1, 600], [3, 500], [2, 600],
    # Fraudulent claims (high count, high payout = anomaly)
    [8, 4800], [10, 6000], [12, 7200], [15, 9000], [20, 12000]
])


def train_fraud_model():
    model = IsolationForest(contamination=0.2, random_state=42)
    model.fit(TRAINING_DATA)
    print("✅ Fraud Detection Model Trained (Isolation Forest)")
    return model


def detect_fraud(model, claim_count, payout_amount):
    result = model.predict([[claim_count, payout_amount]])[0]
    return result == -1   # -1 = anomaly (fraud), 1 = normal


if __name__ == "__main__":
    print("=" * 52)
    print("  GigShield - Fraud Detection AI Model")
    print("=" * 52)
    model = train_fraud_model()

    test_cases = [
        (1,  600,  "Normal: 1st claim, ₹600 payout"),
        (2,  400,  "Normal: 2nd claim, ₹400 payout"),
        (3,  600,  "Normal: 3rd claim, ₹600 payout"),
        (10, 6000, "FRAUD:  10 claims, ₹6000 payout"),
        (15, 9000, "FRAUD:  15 claims, ₹9000 payout"),
    ]
    print("\n🔍 Fraud Detection Results:")
    print(f"{'Scenario':<40} {'Is Fraud?'}")
    print("-" * 52)
    for count, payout, label in test_cases:
        fraud = detect_fraud(model, count, payout)
        status = "🚨 FRAUD" if fraud else "✅ LEGITIMATE"
        print(f"{label:<40} {status}")
