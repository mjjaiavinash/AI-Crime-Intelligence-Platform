"""
api/v1/routes/ml.py
────────────────────
ML prediction endpoints — all require authentication.
Delegates to ml_service which lazy-loads trained .pkl artifacts.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from core.logging import get_logger
from schemas.ml_schemas import (
    HotspotPredictRequest, HotspotPredictResponse,
    RepeatOffenderRequest, RepeatOffenderResponse,
    CrimeClassifyRequest, CrimeClassifyResponse,
)
from services import ml_service
from ml.inference import predict as legacy_predict

logger = get_logger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])


# ── New trained-model endpoints ───────────────────────────────────────────────

@router.post(
    "/predict-hotspot",
    response_model=HotspotPredictResponse,
    summary="Predict crime hotspot intensity (XGBoost — 98.5% F1)",
)
def predict_hotspot(body: HotspotPredictRequest):
    """
    Predicts whether a location is a **High / Medium / Low** crime hotspot
    using the trained XGBoost model (100K Karnataka crime records).
    """
    return ml_service.predict_hotspot(body.model_dump())


@router.post(
    "/predict-repeat-offender",
    response_model=RepeatOffenderResponse,
    summary="Predict repeat offender risk (Random Forest — 100% F1)",
)
def predict_repeat_offender(body: RepeatOffenderRequest):
    """
    Predicts whether a suspect is likely to re-offend and returns
    a **risk level** (High / Medium / Low) with confidence score.
    """
    return ml_service.predict_repeat_offender(body.model_dump())


@router.post(
    "/classify-crime",
    response_model=CrimeClassifyResponse,
    summary="Classify crime type from case description (Random Forest — 100% F1)",
)
def classify_crime(body: CrimeClassifyRequest):
    """
    Classifies a crime into one of 9 categories using TF-IDF on the
    case description combined with structured features.
    """
    return ml_service.classify_crime(body.model_dump())


# ── Legacy endpoints (kept for backward compatibility) ────────────────────────

@router.get(
    "/hotspots",
    summary="Spatial hotspots via DBSCAN on live FIR data — all roles",
)
def get_hotspots(db: Session = Depends(get_db)):
    """DBSCAN clustering on historical FIR geolocations."""
    return legacy_predict.get_crime_hotspots(db)


@router.get(
    "/risk-score/{suspect_id}",
    summary="Recidivism risk score for a suspect — all roles",
)
def get_suspect_risk_score(suspect_id: int, db: Session = Depends(get_db)):
    """RandomForest recidivism probability from suspect DB record."""
    return legacy_predict.get_suspect_risk_score(db, suspect_id)


@router.get(
    "/anomalies",
    summary="Anomalous crime pattern detection (Isolation Forest) — all roles",
)
def get_anomalies(db: Session = Depends(get_db)):
    """IsolationForest anomaly detection on FIR geolocation and timing."""
    return legacy_predict.detect_crime_anomalies(db)
