"""
GigShield AI - Parametric Insurance Platform for Food Delivery Workers
FastAPI Backend - main entry point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from database import connect_db, close_db
from routes import auth, users, policies, claims, admin
from services.trigger_engine import run_trigger_check

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ─────────────────────────────────────────────────────────────
    await connect_db()
    scheduler.add_job(run_trigger_check, 'interval', minutes=10, id='weather_trigger')
    scheduler.start()
    print("🚀 GigShield API started. Trigger engine running every 10 minutes.")
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    scheduler.shutdown()
    await close_db()
    print("GigShield API shutdown complete.")


app = FastAPI(
    title="🛡️ GigShield — AI Parametric Insurance for Delivery Workers",
    description="""
## GigShield API

Protects Swiggy/Zomato delivery workers from income loss due to:
- 🌧️ Heavy Rain (>100mm)
- 🌫️ Air Pollution (AQI>200)
- 🌡️ Heatwave (>40°C)

### Features
- AI-powered risk prediction (Linear Regression)
- Dynamic premium calculation (Decision Tree)
- Fraud detection (Isolation Forest)
- Auto-trigger claims via weather monitoring
- Instant payout simulation
    """,
    version="1.0.0",
    lifespan=lifespan
)

# ── CORS (allow admin dashboard and Flutter web) ─────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(policies.router)
app.include_router(claims.router)
app.include_router(admin.router)


@app.get("/", tags=["UI"])
async def root():
    dashboard_path = os.path.join(os.path.dirname(__file__), "..", "admin_dashboard", "index.html")
    if os.path.exists(dashboard_path):
        return FileResponse(dashboard_path)
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["Health"])
async def health():
    from database import get_db
    db_status = "connected" if get_db() is not None else "disconnected"
    return {"status": "ok", "database": db_status}


@app.get("/weather/{city}", tags=["Weather"])
async def get_city_weather(city: str):
    """Get REAL-TIME weather + AQI data for any Indian city."""
    from services.weather_service import get_weather
    data = get_weather(city.strip().title())
    return data


@app.get("/weather", tags=["Weather"])
async def get_all_weather():
    """Get REAL-TIME weather + AQI for all major Indian delivery cities."""
    from services.weather_service import get_weather_all_cities
    return {"cities": get_weather_all_cities()}

