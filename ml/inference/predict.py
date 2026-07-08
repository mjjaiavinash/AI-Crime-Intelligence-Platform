import numpy as np
from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest
from models.fir import FIR
from models.suspect import Suspect
from models.crime_history import CrimeHistory
from ml.models.hotspot_model import CrimeHotspotModel
from ml.models.classifier_model import RecidivismClassifierModel
from core.logging import get_logger

logger = get_logger(__name__)

# Singletons for cached models
_hotspot_model = CrimeHotspotModel()
_classifier_model = RecidivismClassifierModel()


def get_crime_hotspots(db: Session) -> list:
    """Fetch coordinates from database, run DBSCAN, and return hotspots."""
    global _hotspot_model
    
    # Query FIRs with valid coordinates
    firs = db.query(FIR).filter(FIR.latitude.isnot(None), FIR.longitude.isnot(None)).all()
    if not firs:
        return []

    coords = np.array([[float(f.latitude), float(f.longitude)] for f in firs])
    _hotspot_model.fit(coords)
    return _hotspot_model.predict_hotspots()


def get_suspect_risk_score(db: Session, suspect_id: int) -> dict:
    """Calculate repeat offender recidivism risk probability and assign rank."""
    global _classifier_model

    suspect = db.get(Suspect, suspect_id)
    if not suspect:
        return {"probability": 0.0, "level": "low"}

    # Count prior history offenses
    prior_count = db.query(CrimeHistory).filter(CrimeHistory.suspect_id == suspect_id).count()

    prob = _classifier_model.predict_probability(
        prior_crimes_count=prior_count,
        threat_level=suspect.threat_level.value if hasattr(suspect.threat_level, "value") else str(suspect.threat_level),
        age_estimated=suspect.age_estimated
    )

    if prob < 0.3:
        level = "low"
    elif prob < 0.6:
        level = "medium"
    elif prob < 0.85:
        level = "high"
    else:
        level = "extreme"

    return {
        "suspect_id": suspect_id,
        "probability": prob,
        "level": level,
        "prior_convictions": prior_count,
    }


def detect_crime_anomalies(db: Session) -> list:
    """Use IsolationForest to detect anomalous crime incidents based on geolocation and timing."""
    firs = db.query(FIR).all()
    if len(firs) < 5:
        # Not enough data for isolation forest training
        return []

    data = []
    for f in firs:
        # Hour of incident (0-23)
        hour = f.incident_date.hour if f.incident_date else 12
        # Month of incident (1-12)
        month = f.incident_date.month if f.incident_date else 6
        # Coordinates
        lat = float(f.latitude) if f.latitude else 0.0
        lng = float(f.longitude) if f.longitude else 0.0
        data.append([hour, month, lat, lng])

    X = np.array(data)
    
    # Train Isolation Forest
    iso = IsolationForest(contamination=0.1, random_state=42)
    predictions = iso.fit_predict(X)

    anomalies = []
    for i, pred in enumerate(predictions):
        if pred == -1: # -1 indicates anomaly
            fir = firs[i]
            anomalies.append({
                "fir_id": fir.id,
                "fir_number": fir.fir_number,
                "title": fir.title,
                "latitude": float(fir.latitude) if fir.latitude else None,
                "longitude": float(fir.longitude) if fir.longitude else None,
                "incident_date": fir.incident_date,
                "score": float(-iso.score_samples(X[i:i+1])[0]) # anomaly score
            })

    return sorted(anomalies, key=lambda x: x["score"], reverse=True)
