"""
Standalone Premium Calculator Model
Run: python ai_models/premium_calculator.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

DATASET = os.path.join(os.path.dirname(__file__), "dataset.csv")


def train_premium_model():
    df = pd.read_csv(DATASET)
    X = df[["risk_score", "daily_income"]]
    y = df["weekly_premium"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = DecisionTreeRegressor(max_depth=4, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(f"✅ Premium Model Trained | MAE: ₹{mean_absolute_error(y_test, y_pred):.2f}")
    return model


def calculate_premium(model, risk_score, daily_income):
    premium = model.predict([[risk_score, daily_income]])[0]
    return round(float(max(5.0, premium)), 2)


if __name__ == "__main__":
    print("=" * 55)
    print("  GigShield - Premium Calculation AI Model")
    print("=" * 55)
    model = train_premium_model()

    scenarios = [
        (0.85, 1000, "High risk, ₹1000/day"),
        (0.40, 700,  "Medium risk, ₹700/day"),
        (0.15, 500,  "Low risk, ₹500/day"),
        (0.95, 1200, "Critical risk, ₹1200/day"),
    ]
    print("\n📊 Premium Calculations:")
    print(f"{'Scenario':<30} {'Risk':<8} {'Income':<12} {'Weekly Premium'}")
    print("-" * 65)
    for risk, income, label in scenarios:
        prem = calculate_premium(model, risk, income)
        print(f"{label:<30} {risk:<8} ₹{income:<10} ₹{prem}")
