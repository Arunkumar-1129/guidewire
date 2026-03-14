"""
Pollution Trigger - Standalone script to check AQI and trigger claims
Run: python triggers/pollution_trigger.py Delhi
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.weather_service import get_weather
from config import AQI_THRESHOLD, POLLUTION_PAYOUT


def check_pollution(city: str):
    print(f"🌫️  Pollution Trigger Check — {city}")
    weather = get_weather(city)
    aqi = weather["aqi"]
    print(f"   Current AQI: {aqi} (Threshold: {AQI_THRESHOLD})")

    if aqi >= AQI_THRESHOLD:
        print(f"   ⚡ TRIGGER ACTIVATED! AQI exceeds threshold.")
        print(f"   💰 Payout: ₹{POLLUTION_PAYOUT} per active worker in {city}")
        return True
    else:
        print(f"   ✅ No trigger. Air quality acceptable.")
        return False


if __name__ == "__main__":
    city = sys.argv[1] if len(sys.argv) > 1 else "Delhi"
    check_pollution(city)
