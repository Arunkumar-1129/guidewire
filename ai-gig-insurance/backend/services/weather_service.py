"""
Weather Service - Fetches REAL-TIME weather + AQI data.
  - OpenWeatherMap API  → Temperature, Rainfall, Humidity, Description
  - WAQI (aqicn.org) API → Real Air Quality Index (AQI)
Falls back to mock data if API keys are missing or requests fail.
"""
import requests
from config import OPENWEATHER_API_KEY, WAQI_API_TOKEN

WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
WAQI_URL = "https://api.waqi.info/feed"

# Indian city coordinates for fallback
CITY_COORDS = {
    "Chennai":   {"lat": 13.0827, "lon": 80.2707},
    "Mumbai":    {"lat": 19.0760, "lon": 72.8777},
    "Delhi":     {"lat": 28.6139, "lon": 77.2090},
    "Bangalore": {"lat": 12.9716, "lon": 77.5946},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
    "Kolkata":   {"lat": 22.5726, "lon": 88.3639},
    "Pune":      {"lat": 18.5204, "lon": 73.8567},
    "Ahmedabad": {"lat": 23.0225, "lon": 72.5714},
    "Jaipur":    {"lat": 26.9124, "lon": 75.7873},
    "Lucknow":   {"lat": 26.8467, "lon": 80.9462},
}


def _mock_weather(city: str) -> dict:
    """Fallback mock data if APIs fail."""
    import random
    return {
        "city": city,
        "rainfall_mm": random.uniform(0, 20),
        "temperature": round(random.uniform(28, 38), 1),
        "humidity": random.randint(50, 85),
        "wind_speed": round(random.uniform(2, 15), 1),
        "description": "partly cloudy (mock)",
        "aqi": random.randint(80, 200),
        "aqi_category": "Moderate",
        "is_mock": True,
        "source": "mock"
    }


def _get_real_weather(city: str) -> dict:
    """Fetch real weather from OpenWeatherMap API."""
    url = f"{WEATHER_URL}?q={city},IN&appid={OPENWEATHER_API_KEY}&units=metric"
    resp = requests.get(url, timeout=8)
    data = resp.json()

    if resp.status_code != 200:
        raise Exception(f"OpenWeather error: {data.get('message', 'Unknown')}")

    # Extract rainfall (mm in last 1h or 3h, extrapolate to daily estimate)
    rainfall = 0.0
    if "rain" in data:
        rainfall = data["rain"].get("1h", data["rain"].get("3h", 0))
        # Extrapolate 1h rain to approximate daily total
        if "1h" in data["rain"]:
            rainfall = rainfall * 24  # rough daily projection
        elif "3h" in data["rain"]:
            rainfall = rainfall * 8

    return {
        "temperature": round(data["main"]["temp"], 1),
        "feels_like": round(data["main"]["feels_like"], 1),
        "humidity": data["main"]["humidity"],
        "wind_speed": round(data.get("wind", {}).get("speed", 0) * 3.6, 1),  # m/s → km/h
        "rainfall_mm": round(rainfall, 1),
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
    }


def _get_real_aqi(city: str) -> dict:
    """Fetch real Air Quality Index from WAQI (aqicn.org) API."""
    # Try city name first
    url = f"{WAQI_URL}/{city}/?token={WAQI_API_TOKEN}"
    resp = requests.get(url, timeout=8)
    data = resp.json()

    if data.get("status") == "ok" and data.get("data"):
        aqi_value = data["data"].get("aqi", 0)
        if isinstance(aqi_value, str) and aqi_value == "-":
            aqi_value = 0
        aqi_value = int(aqi_value)

        # Extract individual pollutant values if available
        iaqi = data["data"].get("iaqi", {})
        pollutants = {}
        for key in ["pm25", "pm10", "o3", "no2", "so2", "co"]:
            if key in iaqi:
                pollutants[key] = iaqi[key].get("v", 0)

        return {
            "aqi": aqi_value,
            "aqi_category": _aqi_category(aqi_value),
            "dominant_pollutant": data["data"].get("dominentpol", "pm25"),
            "pollutants": pollutants,
            "station": data["data"].get("city", {}).get("name", city),
        }

    # Fallback: try with geo coordinates
    coords = CITY_COORDS.get(city)
    if coords:
        geo_url = f"{WAQI_URL}/geo:{coords['lat']};{coords['lon']}/?token={WAQI_API_TOKEN}"
        resp2 = requests.get(geo_url, timeout=8)
        data2 = resp2.json()
        if data2.get("status") == "ok" and data2.get("data"):
            aqi_value = int(data2["data"].get("aqi", 0))
            return {
                "aqi": aqi_value,
                "aqi_category": _aqi_category(aqi_value),
                "dominant_pollutant": data2["data"].get("dominentpol", "pm25"),
                "pollutants": {},
                "station": data2["data"].get("city", {}).get("name", city),
            }

    raise Exception(f"WAQI: No AQI data found for {city}")


def _aqi_category(aqi: int) -> str:
    """Convert US EPA AQI number to human-readable category."""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"


def get_weather(city: str) -> dict:
    """
    Return REAL-TIME weather + AQI data for the given Indian city.
    Returns combined dict with all data from both APIs.
    Falls back to mock if any API fails.
    """
    if not OPENWEATHER_API_KEY or not WAQI_API_TOKEN:
        print(f"⚠️  API keys missing, using mock data for {city}")
        return _mock_weather(city)

    result = {"city": city, "is_mock": False, "source": "real-time"}

    # 1) Real Weather
    try:
        weather = _get_real_weather(city)
        result.update(weather)
    except Exception as e:
        print(f"⚠️  OpenWeather API error for {city}: {e}")
        return _mock_weather(city)

    # 2) Real AQI
    try:
        aqi_data = _get_real_aqi(city)
        result["aqi"] = aqi_data["aqi"]
        result["aqi_category"] = aqi_data["aqi_category"]
        result["dominant_pollutant"] = aqi_data.get("dominant_pollutant", "pm25")
        result["pollutants"] = aqi_data.get("pollutants", {})
        result["aqi_station"] = aqi_data.get("station", city)
    except Exception as e:
        print(f"⚠️  WAQI API error for {city}: {e}")
        result["aqi"] = 100  # conservative fallback
        result["aqi_category"] = "Moderate"
        result["dominant_pollutant"] = "unknown"

    return result


def get_weather_all_cities() -> list:
    """Fetch real-time weather + AQI for all Indian delivery cities."""
    cities = list(CITY_COORDS.keys())
    results = []
    for city in cities:
        data = get_weather(city)
        results.append(data)
    return results
