"""
AI-Powered Transit Uncertainty Prediction System - FastAPI Backend
Three models: XGBoost | Neural Network (MLP) | HistGradientBoosting

Accuracy improvements over v1:
  - Added 9 new features (route, station, trip duration, weather severity, etc.)
  - Stratified train/test split
  - Interaction features (traffic * precipitation risk score)
  - Better hyperparameters: more estimators, regularisation, early stopping
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
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import xgboost as xgb

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
    description="Multi-model ML backend: XGBoost, Neural Network (MLP), HistGradientBoosting",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load dataset
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "Dataset", "public_transport_delays.csv")

log.info("Loading dataset from %s ...", CSV_PATH)
df = pd.read_csv(CSV_PATH)
log.info("Dataset loaded: %s rows, %s columns", *df.shape)

# ---------------------------------------------------------------------------
# Feature engineering
# ---------------------------------------------------------------------------

# Time features
df["hour"] = pd.to_datetime(df["time"], format="%H:%M:%S").dt.hour
df["sched_dep_hour"] = pd.to_datetime(df["scheduled_departure"], format="%H:%M:%S").dt.hour

dep_dt = pd.to_datetime(df["scheduled_departure"], format="%H:%M:%S")
arr_dt = pd.to_datetime(df["scheduled_arrival"],   format="%H:%M:%S")
df["trip_duration_min"] = (arr_dt - dep_dt).dt.total_seconds().div(60).clip(lower=1)

# Weekend flag
df["is_weekend"] = (df["weekday"] >= 5).astype(int)

# Ordinal weather severity: Clear < Cloudy < Fog < Rain < Snow < Storm
_weather_sev = {"Clear": 0, "Cloudy": 1, "Fog": 2, "Rain": 3, "Snow": 4, "Storm": 5}
df["weather_severity"] = df["weather_condition"].map(_weather_sev).fillna(0).astype(int)

# Log-scaled event attendance (0 when no event)
df["event_attendance_log"] = np.log1p(df["event_attendance_est"])

# Interaction: high traffic + precipitation = compound delay risk
df["traffic_precip_risk"] = (df["traffic_congestion_index"] * df["precipitation_mm"]) / 100.0

# Label-encode categorical columns
_encoders: dict[str, LabelEncoder] = {}
for col in ("transport_type", "weather_condition", "event_type", "season",
            "route_id", "origin_station", "destination_station"):
    enc = LabelEncoder()
    df[f"{col}_enc"] = enc.fit_transform(df[col])
    _encoders[col] = enc

FEATURE_COLS = [
    # Core trip attributes
    "transport_type_enc",
    "route_id_enc",
    "origin_station_enc",
    "destination_station_enc",
    "trip_duration_min",
    # Weather
    "weather_condition_enc",
    "weather_severity",
    "temperature_C",
    "humidity_percent",
    "wind_speed_kmh",
    "precipitation_mm",
    # Events & traffic
    "event_type_enc",
    "event_attendance_log",
    "traffic_congestion_index",
    "traffic_precip_risk",
    # Time & calendar
    "peak_hour",
    "season_enc",
    "holiday",
    "weekday",
    "is_weekend",
    "hour",
    "sched_dep_hour",
]
log.info("Feature count: %d", len(FEATURE_COLS))

X = df[FEATURE_COLS].values
y_cls = df["delayed"].values
y_reg = df["actual_arrival_delay_min"].clip(lower=0).values

# Stratified split to preserve 75/25 class balance in both sets
X_tr, X_te, yc_tr, yc_te, yr_tr, yr_te = train_test_split(
    X, y_cls, y_reg, test_size=0.2, random_state=42, stratify=y_cls
)
log.info("Train size: %d  |  Test size: %d  |  Delayed in test: %.1f%%",
         len(X_tr), len(X_te), yc_te.mean() * 100)

# ---------------------------------------------------------------------------
# Model 1 - XGBoost (tuned)
# ---------------------------------------------------------------------------
log.info("Training XGBoost classifier ...")
xgb_clf = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=5,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1.0,
    eval_metric="logloss",
    early_stopping_rounds=20,
    random_state=42,
    verbosity=0,
)
xgb_clf.fit(
    X_tr, yc_tr,
    eval_set=[(X_te, yc_te)],
    verbose=False,
)
xgb_clf_acc = accuracy_score(yc_te, xgb_clf.predict(X_te))
log.info("XGBoost classifier accuracy: %.2f%%", xgb_clf_acc * 100)

xgb_reg = xgb.XGBRegressor(
    n_estimators=500,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=5,
    reg_alpha=0.1,
    reg_lambda=1.0,
    early_stopping_rounds=20,
    random_state=42,
    verbosity=0,
)
xgb_reg.fit(X_tr, yr_tr, eval_set=[(X_te, yr_te)], verbose=False)
xgb_reg_mae = mean_absolute_error(yr_te, xgb_reg.predict(X_te))
log.info("XGBoost regressor MAE: %.2f min", xgb_reg_mae)

# ---------------------------------------------------------------------------
# Model 2 - Neural Network MLP (deeper, L2 regularisation)
# ---------------------------------------------------------------------------
log.info("Scaling features for Neural Network ...")
_scaler = StandardScaler()
X_tr_sc = _scaler.fit_transform(X_tr)
X_te_sc  = _scaler.transform(X_te)

log.info("Training Neural Network (MLP) classifier ...")
mlp_clf = MLPClassifier(
    hidden_layer_sizes=(256, 128, 64, 32),
    activation="relu",
    solver="adam",
    alpha=0.001,      # L2 regularisation
    max_iter=500,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=20,
    random_state=42,
    verbose=False,
)
mlp_clf.fit(X_tr_sc, yc_tr)
mlp_clf_acc = accuracy_score(yc_te, mlp_clf.predict(X_te_sc))
log.info("Neural Network classifier accuracy: %.2f%%", mlp_clf_acc * 100)

mlp_reg = MLPRegressor(
    hidden_layer_sizes=(256, 128, 64, 32),
    activation="relu",
    solver="adam",
    alpha=0.001,
    max_iter=500,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=20,
    random_state=42,
    verbose=False,
)
mlp_reg.fit(X_tr_sc, yr_tr)
mlp_reg_mae = mean_absolute_error(yr_te, np.maximum(0, mlp_reg.predict(X_te_sc)))
log.info("Neural Network regressor MAE: %.2f min", mlp_reg_mae)

# ---------------------------------------------------------------------------
# Model 3 - HistGradientBoosting (faster & better than plain GradientBoosting)
# ---------------------------------------------------------------------------
log.info("Training HistGradientBoosting classifier ...")
sk_clf = HistGradientBoostingClassifier(
    max_iter=300,
    max_depth=6,
    learning_rate=0.05,
    min_samples_leaf=20,
    l2_regularization=0.1,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=20,
    random_state=42,
    verbose=0,
)
sk_clf.fit(X_tr, yc_tr)
sk_clf_acc = accuracy_score(yc_te, sk_clf.predict(X_te))
log.info("HistGB classifier accuracy: %.2f%%", sk_clf_acc * 100)

sk_reg = HistGradientBoostingRegressor(
    max_iter=300,
    max_depth=6,
    learning_rate=0.05,
    min_samples_leaf=20,
    l2_regularization=0.1,
    early_stopping=True,
    validation_fraction=0.1,
    n_iter_no_change=20,
    random_state=42,
    verbose=0,
)
sk_reg.fit(X_tr, yr_tr)
sk_reg_mae = mean_absolute_error(yr_te, sk_reg.predict(X_te))
log.info("HistGB regressor MAE: %.2f min", sk_reg_mae)

MODEL_META = {
    "xgboost":    {"clf_acc": xgb_clf_acc, "reg_mae": xgb_reg_mae},
    "neural_net": {"clf_acc": mlp_clf_acc, "reg_mae": mlp_reg_mae},
    "sklearn":    {"clf_acc": sk_clf_acc,  "reg_mae": sk_reg_mae},
}
log.info("All models trained:")
for name, m in MODEL_META.items():
    log.info("  %-12s  accuracy=%.1f%%  MAE=%.2f min", name, m["clf_acc"] * 100, m["reg_mae"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _safe_encode(col: str, value: str) -> int:
    enc = _encoders[col]
    classes: list[str] = list(enc.classes_)
    return classes.index(value) if value in classes else 0


def _build_features(req: "PredictRequest") -> np.ndarray:
    dep_sec = req.sched_dep_hour * 3600
    arr_sec = req.sched_arr_hour * 3600
    trip_dur = max(1.0, (arr_sec - dep_sec) / 60.0)
    weather_sev = _weather_sev.get(req.weather_condition, 0)
    event_log = float(np.log1p(req.event_attendance_est))
    traffic_precip = (req.traffic_congestion_index * req.precipitation_mm) / 100.0
    is_weekend = int(req.weekday >= 5)

    return np.array([[
        _safe_encode("transport_type", req.transport_type),
        _safe_encode("route_id", req.route_id),
        _safe_encode("origin_station", req.origin_station),
        _safe_encode("destination_station", req.destination_station),
        trip_dur,
        _safe_encode("weather_condition", req.weather_condition),
        weather_sev,
        req.temperature_C,
        req.humidity_percent,
        req.wind_speed_kmh,
        req.precipitation_mm,
        _safe_encode("event_type", req.event_type),
        event_log,
        req.traffic_congestion_index,
        traffic_precip,
        req.peak_hour,
        _safe_encode("season", req.season),
        req.holiday,
        req.weekday,
        is_weekend,
        req.hour,
        req.sched_dep_hour,
    ]])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    transport_type: str           = Field("Bus",         description="Bus / Tram / Metro / Train")
    route_id: str                 = Field("Route_1",     description="Route_1 ... Route_20")
    origin_station: str           = Field("Station_1",   description="Station_1 ... Station_50")
    destination_station: str      = Field("Station_2",   description="Station_1 ... Station_50")
    weather_condition: str        = Field("Clear",       description="Clear / Rain / Storm / Snow / Fog / Cloudy")
    temperature_C: float          = Field(20.0,          ge=-20, le=50)
    humidity_percent: float       = Field(60.0,          ge=0,   le=100)
    wind_speed_kmh: float         = Field(15.0,          ge=0,   le=120)
    precipitation_mm: float       = Field(0.0,           ge=0)
    event_type: str               = Field("None",        description="None / Sports / Concert / Festival / Protest / Parade")
    event_attendance_est: float   = Field(0.0,           ge=0)
    traffic_congestion_index: int = Field(50,            ge=0,   le=100)
    peak_hour: int                = Field(0,             ge=0,   le=1)
    season: str                   = Field("Summer",      description="Winter / Spring / Summer / Autumn")
    holiday: int                  = Field(0,             ge=0,   le=1)
    weekday: int                  = Field(1,             ge=0,   le=6)
    hour: int                     = Field(12,            ge=0,   le=23)
    sched_dep_hour: int           = Field(8,             ge=0,   le=23, description="Scheduled departure hour")
    sched_arr_hour: int           = Field(9,             ge=0,   le=23, description="Scheduled arrival hour")
    model: str                    = Field("xgboost",     description="xgboost | neural_net | sklearn")


class PredictResponse(BaseModel):
    delay_probability: float
    expected_delay_min: float
    risk_level: str
    confidence: float
    is_delayed: bool
    model_accuracy: float
    model_used: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health", tags=["system"])
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "total_rows": int(len(df)),
        "feature_count": len(FEATURE_COLS),
        "models": {
            name: {
                "classifier_accuracy_pct": round(m["clf_acc"] * 100, 2),
                "regressor_mae_min": round(m["reg_mae"], 2),
            }
            for name, m in MODEL_META.items()
        },
        "classifier_accuracy_pct": round(xgb_clf_acc * 100, 2),
        "regressor_mae_min": round(xgb_reg_mae, 2),
    }


@app.post("/predict", response_model=PredictResponse, tags=["prediction"])
def predict(req: PredictRequest) -> PredictResponse:
    model_name = req.model.lower()
    if model_name not in MODEL_META:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{model_name}'. Choose xgboost | neural_net | sklearn",
        )

    X_in = _build_features(req)

    if model_name == "xgboost":
        proba = xgb_clf.predict_proba(X_in)[0]
        delay_prob = float(proba[1])
        confidence = float(np.max(proba))
        expected_delay = float(max(0.0, xgb_reg.predict(X_in)[0]))
        acc = xgb_clf_acc

    elif model_name == "neural_net":
        X_sc = _scaler.transform(X_in)
        proba = mlp_clf.predict_proba(X_sc)[0]
        delay_prob = float(proba[1])
        confidence = float(np.max(proba))
        expected_delay = float(max(0.0, mlp_reg.predict(X_sc)[0]))
        acc = mlp_clf_acc

    else:  # sklearn (HistGradientBoosting)
        proba = sk_clf.predict_proba(X_in)[0]
        delay_prob = float(proba[1])
        confidence = float(np.max(proba))
        expected_delay = float(max(0.0, sk_reg.predict(X_in)[0]))
        acc = sk_clf_acc

    risk = "Low" if delay_prob < 0.35 else ("Medium" if delay_prob < 0.65 else "High")

    return PredictResponse(
        delay_probability=round(delay_prob * 100, 1),
        expected_delay_min=round(expected_delay, 1),
        risk_level=risk,
        confidence=round(confidence * 100, 1),
        is_delayed=delay_prob >= 0.5,
        model_accuracy=round(acc * 100, 1),
        model_used=model_name,
    )


@app.get("/models", tags=["system"])
def list_models() -> dict[str, Any]:
    return {
        name: {
            "classifier_accuracy_pct": round(m["clf_acc"] * 100, 2),
            "regressor_mae_min": round(m["reg_mae"], 2),
            "description": {
                "xgboost":    "XGBoost - gradient-boosted trees with early stopping and L2/L1 regularisation",
                "neural_net": "Neural Network (MLP) - 4-layer deep learning (256-128-64-32 neurons) with L2",
                "sklearn":    "HistGradientBoosting - histogram-based boosting, faster and more accurate",
            }[name],
        }
        for name, m in MODEL_META.items()
    }


@app.get("/stats", tags=["analytics"])
def stats() -> dict[str, Any]:
    total = len(df)
    delayed_count = int(df["delayed"].sum())
    on_time_rate = round((total - delayed_count) / total * 100, 1)

    by_transport = (
        df.groupby("transport_type")
        .agg(total=("delayed", "count"), delayed=("delayed", "sum"), avg_delay=("actual_arrival_delay_min", "mean"))
        .reset_index()
    )
    by_transport["delay_rate"] = (by_transport["delayed"] / by_transport["total"] * 100).round(1)
    by_transport["avg_delay"] = by_transport["avg_delay"].round(1)

    by_weather = (
        df.groupby("weather_condition")
        .agg(avg_delay=("actual_arrival_delay_min", "mean"), delay_rate=("delayed", "mean"))
        .reset_index()
    )
    by_weather["delay_rate"] = (by_weather["delay_rate"] * 100).round(1)
    by_weather["avg_delay"] = by_weather["avg_delay"].round(1)

    by_hour = (
        df.groupby("hour")
        .agg(avg_delay=("actual_arrival_delay_min", "mean"), delay_rate=("delayed", "mean"))
        .reset_index()
    )
    by_hour["delay_rate"] = (by_hour["delay_rate"] * 100).round(1)
    by_hour["avg_delay"] = by_hour["avg_delay"].round(1)

    by_season = (
        df.groupby("season")
        .agg(avg_delay=("actual_arrival_delay_min", "mean"), delay_rate=("delayed", "mean"))
        .reset_index()
    )
    by_season["delay_rate"] = (by_season["delay_rate"] * 100).round(1)
    by_season["avg_delay"] = by_season["avg_delay"].round(1)

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
        "classifier_accuracy": round(xgb_clf_acc * 100, 1),
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
        .agg(total=("delayed", "count"), delayed=("delayed", "sum"), avg_delay=("actual_arrival_delay_min", "mean"))
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
