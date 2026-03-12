"""
AI-Powered Transit Uncertainty Prediction System - FastAPI Backend
Trains ML models on the public_transport_delays.csv dataset and exposes
prediction + analytics endpoints consumed by the React frontend.
"""

from __future__ import annotations

import os
import logging
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Transit Delay Prediction API",
    description="ML-powered backend for the Transit Uncertainty Prediction System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load & preprocess dataset
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "Dataset", "public_transport_delays.csv")

log.info("Loading dataset from %s …", CSV_PATH)
df = pd.read_csv(CSV_PATH)
log.info("Dataset loaded: %s rows, %s columns", *df.shape)

# Derived time feature
df["hour"] = pd.to_datetime(df["time"], format="%H:%M:%S").dt.hour

# Label-encode categorical columns
_encoders: dict[str, LabelEncoder] = {}
for col in ("transport_type", "weather_condition", "event_type", "season"):
    enc = LabelEncoder()
    df[f"{col}_enc"] = enc.fit_transform(df[col])
    _encoders[col] = enc

FEATURE_COLS = [
    "transport_type_enc",
    "weather_condition_enc",
    "temperature_C",
    "humidity_percent",
    "wind_speed_kmh",
    "precipitation_mm",
    "event_type_enc",
    "traffic_congestion_index",
    "peak_hour",
    "season_enc",
    "holiday",
    "weekday",
    "hour",
]

X = df[FEATURE_COLS].values
y_cls = df["delayed"].values
y_reg = df["actual_arrival_delay_min"].clip(lower=0).values

# ---------------------------------------------------------------------------
# Train models
# ---------------------------------------------------------------------------
X_tr, X_te, yc_tr, yc_te, yr_tr, yr_te = train_test_split(
    X, y_cls, y_reg, test_size=0.2, random_state=42
)

log.info("Training delay classifier (GradientBoosting) …")
clf = GradientBoostingClassifier(n_estimators=150, max_depth=5, random_state=42)
clf.fit(X_tr, yc_tr)
clf_acc = accuracy_score(yc_te, clf.predict(X_te))
log.info("Classifier accuracy: %.2f%%", clf_acc * 100)

log.info("Training delay regressor (GradientBoosting) …")
reg = GradientBoostingRegressor(n_estimators=150, max_depth=5, random_state=42)
reg.fit(X_tr, yr_tr)
reg_mae = mean_absolute_error(yr_te, reg.predict(X_te))
log.info("Regressor MAE: %.2f min", reg_mae)


# ---------------------------------------------------------------------------
# Helper – safely encode unseen labels
# ---------------------------------------------------------------------------
def _safe_encode(col: str, value: str) -> int:
    enc = _encoders[col]
    classes: list[str] = list(enc.classes_)
    return classes.index(value) if value in classes else 0


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    transport_type: str = Field("Bus", description="Bus / Tram / Metro / Train")
    weather_condition: str = Field("Clear", description="Clear / Rain / Storm / Snow / Fog / Cloudy")
    temperature_C: float = Field(20.0, ge=-20, le=50)
    humidity_percent: float = Field(60.0, ge=0, le=100)
    wind_speed_kmh: float = Field(15.0, ge=0, le=120)
    precipitation_mm: float = Field(0.0, ge=0)
    event_type: str = Field("None", description="None / Sports / Concert / Festival / Protest / Parade")
    traffic_congestion_index: int = Field(50, ge=0, le=100)
    peak_hour: int = Field(0, ge=0, le=1)
    season: str = Field("Summer", description="Winter / Spring / Summer / Autumn")
    holiday: int = Field(0, ge=0, le=1)
    weekday: int = Field(1, ge=0, le=6)
    hour: int = Field(12, ge=0, le=23)


class PredictResponse(BaseModel):
    delay_probability: float
    expected_delay_min: float
    risk_level: str
    confidence: float
    is_delayed: bool
    model_accuracy: float


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health", tags=["system"])
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "total_rows": int(len(df)),
        "classifier_accuracy_pct": round(clf_acc * 100, 2),
        "regressor_mae_min": round(reg_mae, 2),
    }


@app.post("/predict", response_model=PredictResponse, tags=["prediction"])
def predict(req: PredictRequest) -> PredictResponse:
    features = [
        _safe_encode("transport_type", req.transport_type),
        _safe_encode("weather_condition", req.weather_condition),
        req.temperature_C,
        req.humidity_percent,
        req.wind_speed_kmh,
        req.precipitation_mm,
        _safe_encode("event_type", req.event_type),
        req.traffic_congestion_index,
        req.peak_hour,
        _safe_encode("season", req.season),
        req.holiday,
        req.weekday,
        req.hour,
    ]
    X_in = np.array([features])
    proba = clf.predict_proba(X_in)[0]
    delay_prob = float(proba[1])
    confidence = float(np.max(proba))
    expected_delay = float(max(0.0, reg.predict(X_in)[0]))

    if delay_prob < 0.35:
        risk = "Low"
    elif delay_prob < 0.65:
        risk = "Medium"
    else:
        risk = "High"

    return PredictResponse(
        delay_probability=round(delay_prob * 100, 1),
        expected_delay_min=round(expected_delay, 1),
        risk_level=risk,
        confidence=round(confidence * 100, 1),
        is_delayed=bool(clf.predict(X_in)[0]),
        model_accuracy=round(clf_acc * 100, 1),
    )


@app.get("/stats", tags=["analytics"])
def stats() -> dict[str, Any]:
    total = len(df)
    delayed_count = int(df["delayed"].sum())
    on_time_rate = round((total - delayed_count) / total * 100, 1)

    # By transport type
    by_transport = (
        df.groupby("transport_type")
        .agg(total=("delayed", "count"), delayed=("delayed", "sum"), avg_delay=("actual_arrival_delay_min", "mean"))
        .reset_index()
    )
    by_transport["delay_rate"] = (by_transport["delayed"] / by_transport["total"] * 100).round(1)
    by_transport["avg_delay"] = by_transport["avg_delay"].round(1)

    # By weather
    by_weather = (
        df.groupby("weather_condition")
        .agg(avg_delay=("actual_arrival_delay_min", "mean"), delay_rate=("delayed", "mean"))
        .reset_index()
    )
    by_weather["delay_rate"] = (by_weather["delay_rate"] * 100).round(1)
    by_weather["avg_delay"] = by_weather["avg_delay"].round(1)

    # By hour (0-23)
    by_hour = (
        df.groupby("hour")
        .agg(avg_delay=("actual_arrival_delay_min", "mean"), delay_rate=("delayed", "mean"))
        .reset_index()
    )
    by_hour["delay_rate"] = (by_hour["delay_rate"] * 100).round(1)
    by_hour["avg_delay"] = by_hour["avg_delay"].round(1)

    # By season
    by_season = (
        df.groupby("season")
        .agg(avg_delay=("actual_arrival_delay_min", "mean"), delay_rate=("delayed", "mean"))
        .reset_index()
    )
    by_season["delay_rate"] = (by_season["delay_rate"] * 100).round(1)
    by_season["avg_delay"] = by_season["avg_delay"].round(1)

    # By route – top 10 worst
    by_route = (
        df.groupby("route_id")
        .agg(total=("delayed", "count"), delayed=("delayed", "sum"), avg_delay=("actual_arrival_delay_min", "mean"))
        .reset_index()
    )
    by_route["delay_rate"] = (by_route["delayed"] / by_route["total"] * 100).round(1)
    by_route["avg_delay"] = by_route["avg_delay"].round(1)

    return {
        "total_trips": total,
        "on_time_rate": on_time_rate,
        "delayed_rate": round(100 - on_time_rate, 1),
        "avg_delay_min": round(float(df["actual_arrival_delay_min"].mean()), 1),
        "classifier_accuracy": round(clf_acc * 100, 1),
        "by_transport": by_transport.to_dict(orient="records"),
        "by_weather": by_weather.sort_values("delay_rate", ascending=False).to_dict(orient="records"),
        "by_hour": by_hour.to_dict(orient="records"),
        "by_season": by_season.to_dict(orient="records"),
        "top_delayed_routes": by_route.sort_values("delay_rate", ascending=False).head(10).to_dict(orient="records"),
    }


@app.get("/routes", tags=["analytics"])
def routes() -> list[dict[str, Any]]:
    by_route = (
        df.groupby("route_id")
        .agg(
            total=("delayed", "count"),
            delayed=("delayed", "sum"),
            avg_delay=("actual_arrival_delay_min", "mean"),
        )
        .reset_index()
    )
    by_route["delay_rate"] = (by_route["delayed"] / by_route["total"] * 100).round(1)
    by_route["avg_delay"] = by_route["avg_delay"].round(1)
    by_route["reliability"] = (100 - by_route["delay_rate"]).round(1)
    return by_route.sort_values("delay_rate", ascending=False).to_dict(orient="records")


@app.get("/metadata", tags=["analytics"])
def metadata() -> dict[str, list[str]]:
    return {
        "transport_types": sorted(df["transport_type"].unique().tolist()),
        "weather_conditions": sorted(df["weather_condition"].unique().tolist()),
        "event_types": sorted(df["event_type"].unique().tolist()),
        "seasons": sorted(df["season"].unique().tolist()),
        "routes": sorted(df["route_id"].unique().tolist()),
        "stations": sorted(df["origin_station"].unique().tolist()),
    }
