import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "gig_insurance")
SECRET_KEY = os.getenv("SECRET_KEY", "hackathon-super-secret-key-2024")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
WAQI_API_TOKEN = os.getenv("WAQI_API_TOKEN", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Trigger Thresholds
RAIN_THRESHOLD_MM = 100
AQI_THRESHOLD = 200
HEAT_THRESHOLD_CELSIUS = 40

# Payout Amounts (INR)
RAIN_PAYOUT = 600
POLLUTION_PAYOUT = 400
HEATWAVE_PAYOUT = 500
BASE_COVERAGE = 1000
