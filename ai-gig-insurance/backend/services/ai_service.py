"""
AI Service - Risk Prediction, Premium Calculation, Fraud Detection
Trains all models in-memory on startup using synthetic data.
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler

# ── Synthetic Training Data ────────────────────────────────────────────────────
RISK_DATA = {
    "rainfall":    [200,150,50,300,100,180,80,250,30,120,220,160,60,280,90,170,70,240,40,130,
                    190,140,55,270,110,165,75,245,35,125,210,155,65,290,95,175,68,235,42,135],
    "pollution":   [250,200,100,300,150,230,120,280,80,170,260,210,110,290,140,220,130,270,90,180,
                    245,195,105,295,145,225,115,275,85,175,255,205,108,288,142,218,125,268,88,178],
    "traffic":     [80,70,40,90,60,75,50,85,30,65,82,72,45,88,55,78,48,87,35,68,
                    81,71,42,89,58,76,49,86,32,66,83,73,44,89,56,79,47,86,36,67],
    "risk_score":  [0.85,0.65,0.20,0.95,0.40,0.78,0.30,0.90,0.10,0.50,0.88,0.68,0.25,0.93,0.35,
                    0.75,0.28,0.92,0.12,0.55,0.84,0.63,0.22,0.94,0.38,0.76,0.29,0.91,0.11,0.52,
                    0.86,0.66,0.24,0.94,0.36,0.77,0.27,0.91,0.13,0.54]
}

PREMIUM_DATA = {
    "risk_score":     [0.85,0.65,0.20,0.95,0.40,0.78,0.30,0.90,0.10,0.50,0.88,0.68,0.25,0.93,0.35,
                       0.75,0.28,0.92,0.12,0.55,0.82,0.60,0.22,0.96,0.42,0.70,0.32,0.89,0.15,0.58],
    "daily_income":   [1000,800,500,1200,600,900,700,1100,400,750,1050,850,550,1150,650,950,
                       600,1100,450,800,1000,750,500,1200,620,870,680,1080,420,780],
    "weekly_premium": [42,26,6,57,12,35,11,50,4,19,44,28,7,54,11,36,10,51,5,22,
                       40,23,6,58,13,32,10,48,4,20]
}

FRAUD_TRAIN = np.array([
    [1,600],[1,600],[1,600],[2,600],[1,400],[1,500],[2,400],[1,500],
    [2,600],[1,400],[1,600],[2,500],[1,400],[2,600],[1,500],
    [5,3000],[8,4800],[10,6000],[12,7200],[15,9000]
])

# ── Train Models ────────────────────────────────────────────────────────────────
_risk_df = pd.DataFrame(RISK_DATA)
risk_model = LinearRegression()
risk_model.fit(_risk_df[["rainfall","pollution","traffic"]], _risk_df["risk_score"])

_prem_df = pd.DataFrame(PREMIUM_DATA)
premium_model = DecisionTreeRegressor(max_depth=4, random_state=42)
premium_model.fit(_prem_df[["risk_score","daily_income"]], _prem_df["weekly_premium"])

fraud_model = IsolationForest(contamination=0.25, random_state=42)
fraud_model.fit(FRAUD_TRAIN)

print("✅ AI Models trained successfully.")

# ── Public Functions ────────────────────────────────────────────────────────────
def predict_risk(rainfall: float, pollution_aqi: float, traffic_score: float = 65.0) -> float:
    """Returns risk score between 0.0 and 1.0"""
    risk = risk_model.predict([[rainfall, pollution_aqi, traffic_score]])[0]
    return float(round(max(0.0, min(1.0, risk)), 3))


def calculate_premium(risk_score: float, daily_income: float) -> float:
    """Returns weekly premium in INR"""
    premium = premium_model.predict([[risk_score, daily_income]])[0]
    return float(round(max(5.0, premium), 2))


def detect_fraud(claim_count: int, payout_amount: float) -> bool:
    """Returns True if claim is fraudulent"""
    result = fraud_model.predict([[claim_count, payout_amount]])[0]
    return result == -1


def get_risk_label(risk_score: float) -> str:
    if risk_score < 0.3:
        return "LOW"
    elif risk_score < 0.6:
        return "MEDIUM"
    elif risk_score < 0.8:
        return "HIGH"
    return "CRITICAL"


def get_risk_color(risk_score: float) -> str:
    labels = {"LOW": "#22c55e", "MEDIUM": "#f59e0b", "HIGH": "#ef4444", "CRITICAL": "#7c3aed"}
    return labels.get(get_risk_label(risk_score), "#6b7280")
