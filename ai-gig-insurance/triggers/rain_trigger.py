"""
Rain Trigger - Standalone script to check rain and trigger claims
Run: python triggers/rain_trigger.py Chennai
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.weather_service import get_weather
from config import RAIN_THRESHOLD_MM, RAIN_PAYOUT


def check_rain(city: str):
    print(f"🌧️  Rain Trigger Check — {city}")
    weather = get_weather(city)
    rainfall = weather["rainfall_mm"]
    print(f"   Current Rainfall: {rainfall:.1f} mm (Threshold: {RAIN_THRESHOLD_MM} mm)")

    if rainfall >= RAIN_THRESHOLD_MM:
        print(f"   ⚡ TRIGGER ACTIVATED! Rainfall exceeds threshold.")
        print(f"   💰 Payout: ₹{RAIN_PAYOUT} per active worker in {city}")
        return True
    else:
        print(f"   ✅ No trigger. Conditions normal.")
        return False


if __name__ == "__main__":
    city = sys.argv[1] if len(sys.argv) > 1 else "Chennai"
    check_rain(city)
