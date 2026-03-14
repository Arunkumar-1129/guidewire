"""
Standalone Risk Prediction Model
Run: python ai_models/risk_prediction.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

DATASET = os.path.join(os.path.dirname(__file__), "dataset.csv")


def train_risk_model():
    df = pd.read_csv(DATASET)
    X = df[["rainfall", "pollution_aqi", "traffic_score"]]
    y = df["risk_score"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(f"✅ Risk Model Trained | R²: {r2_score(y_test, y_pred):.4f} | MSE: {mean_squared_error(y_test, y_pred):.4f}")
    return model


def predict_risk(model, rainfall, pollution_aqi, traffic_score=65):
    risk = model.predict([[rainfall, pollution_aqi, traffic_score]])[0]
    return round(float(max(0.0, min(1.0, risk))), 3)


if __name__ == "__main__":
    print("=" * 50)
    print("  GigShield - Risk Prediction AI Model")
    print("=" * 50)
    model = train_risk_model()

    test_cases = [
        (150, 200, 70, "Moderate Rain, Chennai"),
        (300, 350, 90, "Heavy Rain + High Pollution, Mumbai"),
        (20,   80, 30, "Clear Day, Bangalore"),
        (250, 300, 85, "Flood conditions, Delhi"),
    ]
    print("\n📊 Demo Predictions:")
    print(f"{'Scenario':<40} {'Risk Score':<12} {'Level'}")
    print("-" * 65)
    for rain, aqi, traffic, label in test_cases:
        risk  = predict_risk(model, rain, aqi, traffic)
        level = "CRITICAL" if risk > 0.8 else "HIGH" if risk > 0.6 else "MEDIUM" if risk > 0.3 else "LOW"
        print(f"{label:<40} {risk:<12} {level}")
