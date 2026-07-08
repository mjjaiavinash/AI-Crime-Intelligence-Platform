from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from ml.inference import predict

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "/hotspots",
    summary="Get spatial-temporal crime hotspots (DBSCAN) — all roles",
)
def get_hotspots(db: Session = Depends(get_db)):
    """Runs DBSCAN clustering on historical FIR geolocations and returns high-density hotspot clusters."""
    return predict.get_crime_hotspots(db)


@router.get(
    "/risk-score/{suspect_id}",
    summary="Get recidivism risk analysis for a suspect (Random Forest) — all roles",
)
def get_suspect_risk_score(suspect_id: int, db: Session = Depends(get_db)):
    """Runs a RandomForest classifier to compute repeat offender probability and classification flags."""
    return predict.get_suspect_risk_score(db, suspect_id)


@router.get(
    "/anomalies",
    summary="Detect anomalous crime patterns (Isolation Forest) — all roles",
)
def get_anomalies(db: Session = Depends(get_db)):
    """Analyzes geolocations, incident times, and categories using an IsolationForest to flag outliers."""
    return predict.detect_crime_anomalies(db)
