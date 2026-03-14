# 🛡️ GigShield — AI Parametric Insurance for Food Delivery Workers

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](https://flutter.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?logo=scikit-learn)](https://scikit-learn.org)

> Protects Swiggy/Zomato delivery workers from income loss due to heavy rain, pollution, and heatwaves — with **auto-triggered claims**, **AI risk assessment**, and **instant UPI payouts**.

---

## 🏗️ Architecture

```
Flutter Mobile App   Admin Dashboard (HTML)
        │                    │
        └──────────┬──────────┘
                   ▼
          FastAPI Backend (Python)
         ┌─────────┼──────────┐
         ▼         ▼          ▼
      MongoDB   AI Models  OpenWeather API
                   │
              APScheduler
           (every 10 minutes)
                   │
           Trigger Engine ──► Claim ──► Fraud Check ──► Payout
```

---

## ⚙️ Quick Start

### 1. Install Python Dependencies
```bash
cd ai-gig-insurance/backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Edit .env in the root ai-gig-insurance/ folder:
MONGODB_URI=mongodb://localhost:27017        # or your MongoDB Atlas URI
DATABASE_NAME=gig_insurance
SECRET_KEY=hackathon-secret-2024
OPENWEATHER_API_KEY=                        # Optional (uses mock data if empty)
```

### 3. Start MongoDB
**Option A — Local MongoDB:**
```bash
# Windows: Start MongoDB service from Services panel
# Or install via: https://www.mongodb.com/try/download/community
```
**Option B — MongoDB Atlas (Recommended, Free):**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Get connection string → paste in `.env` as `MONGODB_URI`

### 4. Run FastAPI Backend
```bash
cd ai-gig-insurance/backend
uvicorn main:app --reload --port 8000
```
✅ API running at: **http://localhost:8000**
✅ Swagger docs: **http://localhost:8000/docs**

### 5. Open Admin Dashboard
Open `ai-gig-insurance/admin_dashboard/index.html` in your browser.

### 6. Flutter Mobile App (Optional)
```bash
cd ai-gig-insurance/mobile_app
flutter pub get
flutter run
```

---

## 🤖 AI Models

| Model | Algorithm | Input | Output |
|-------|-----------|-------|--------|
| Risk Prediction | Linear Regression | Rainfall, AQI, Traffic | Risk Score (0–1) |
| Premium Calculator | Decision Tree | Risk Score, Income | Weekly Premium (₹) |
| Fraud Detection | Isolation Forest | Claim Count, Payout | Fraud/Legitimate |

### Test AI Models Standalone
```bash
cd ai-gig-insurance
python ai_models/risk_prediction.py
python ai_models/premium_calculator.py
python ai_models/fraud_detection.py
```

---

## ⚡ Weather Trigger System

The trigger engine runs **every 10 minutes** automatically:

| Condition | Threshold | Payout |
|-----------|-----------|--------|
| Heavy Rain | > 100 mm | ₹600 |
| Air Pollution | AQI > 200 | ₹400 |
| Heatwave | > 40°C | ₹500 |

### Test Triggers Standalone
```bash
cd ai-gig-insurance
python triggers/rain_trigger.py Chennai
python triggers/pollution_trigger.py Delhi
python triggers/heatwave_trigger.py Hyderabad
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register worker + AI risk scoring |
| `POST` | `/auth/login` | Login with phone |
| `GET`  | `/users/dashboard/{user_id}` | Worker dashboard |
| `POST` | `/policies/activate` | Activate insurance (7 days) |
| `GET`  | `/policies/{user_id}` | Get policy details |
| `GET`  | `/claims/{user_id}` | Get claims history |
| `POST` | `/claims/trigger-demo` | Manually trigger a claim (demo) |
| `POST` | `/claims/run-auto-trigger` | Run weather check + auto claims |
| `GET`  | `/admin/stats` | Platform statistics |
| `GET`  | `/admin/workers` | All workers |
| `GET`  | `/admin/claims` | All claims |
| `GET`  | `/admin/fraud-alerts` | Fraud detections |
| `GET`  | `/admin/disruption-analytics` | City/event analytics |
| `GET`  | `/health` | API health check |

---

## 🎬 Demo Scenario (for Judges)

1. Open **http://localhost:8000/docs** (Swagger UI)
2. `POST /auth/register`:
   ```json
   { "name":"Ravi Kumar", "phone":"9876543210",
     "platform":"Swiggy", "city":"Chennai", "daily_income":1000 }
   ```
3. `POST /policies/activate` with returned `user_id`
4. `POST /claims/trigger-demo`:
   ```json
   { "user_id":"<id>", "event_type":"rain",
     "event_value":150, "city":"Chennai" }
   ```
5. See **₹600 auto-payout** + fraud check in response
6. Open **admin_dashboard/index.html** → view live stats + charts

---

## 📁 Project Structure

```
ai-gig-insurance/
├── backend/              # FastAPI Python backend
│   ├── main.py           # App entry + scheduler
│   ├── config.py         # Settings
│   ├── database.py       # MongoDB connection
│   ├── routes/           # API routes
│   ├── services/         # AI, weather, trigger, payout
│   └── models/           # Pydantic models
├── ai_models/            # Standalone AI model scripts
│   ├── risk_prediction.py
│   ├── premium_calculator.py
│   ├── fraud_detection.py
│   └── dataset.csv
├── triggers/             # Standalone trigger scripts
│   ├── rain_trigger.py
│   ├── pollution_trigger.py
│   └── heatwave_trigger.py
├── mobile_app/           # Flutter mobile app
│   └── lib/
│       ├── main.dart
│       ├── screens/      # 5 screens
│       ├── services/     # API service
│       ├── models/       # Dart models
│       └── widgets/      # Reusable widgets
├── admin_dashboard/
│   └── index.html        # Admin panel (open in browser)
├── .env                  # Environment config
└── README.md
```

---

## 🏆 Hackathon Highlights

- ✅ **Real AI** — 3 ML models trained on startup
- ✅ **Auto-trigger** — APScheduler monitors weather every 10 min
- ✅ **Fraud detection** — Isolation Forest catches fake claims
- ✅ **Instant payout** — Simulated UPI with transaction IDs
- ✅ **Admin dashboard** — Live charts, fraud alerts, one-click demo trigger
- ✅ **Mobile app** — Complete Flutter app with 5 screens

---

*Built for Hackathon 2024 — GigShield AI Insurance Platform*
