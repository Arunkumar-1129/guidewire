"""
Heatwave Trigger - Standalone script to check temperature and trigger claims
Run: python triggers/heatwave_trigger.py Hyderabad
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.weather_service import get_weather
from config import HEAT_THRESHOLD_CELSIUS, HEATWAVE_PAYOUT


def check_heatwave(city: str):
    print(f"🌡️  Heatwave Trigger Check — {city}")
    weather = get_weather(city)
    temp = weather["temperature"]
    print(f"   Current Temp: {temp}°C (Threshold: {HEAT_THRESHOLD_CELSIUS}°C)")

    if temp >= HEAT_THRESHOLD_CELSIUS:
        print(f"   ⚡ TRIGGER ACTIVATED! Temperature exceeds threshold.")
        print(f"   💰 Payout: ₹{HEATWAVE_PAYOUT} per active worker in {city}")
        return True
    else:
        print(f"   ✅ No trigger. Temperature normal.")
        return False


if __name__ == "__main__":
    city = sys.argv[1] if len(sys.argv) > 1 else "Hyderabad"
    check_heatwave(city)
