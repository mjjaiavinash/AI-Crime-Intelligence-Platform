"""
services/ml_service.py
──────────────────────
Service layer bridging FastAPI routes and the trained ML inference modules.
All three models are lazy-loaded on first call and cached for subsequent requests.
"""

import sys
import os
from core.logging import get_logger
from core.exceptions import ServiceUnavailableException, BadRequestException

# Add project root so ml.inference modules resolve correctly
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

logger = get_logger(__name__)


# ── Hotspot Prediction ────────────────────────────────────────────────────────

def predict_hotspot(payload: dict) -> dict:
    try:
        from ml.inference.predict_hotspot import predict_hotspot as _predict
        result = _predict(payload)
        logger.info("Hotspot prediction: %s (%.1f%%)", result["prediction"], result["confidence"])
        return result
    except FileNotFoundError as e:
        logger.error("Hotspot model not found: %s", e)
        raise ServiceUnavailableException("Hotspot ML model")
    except Exception as e:
        logger.error("Hotspot prediction failed: %s", e)
        raise BadRequestException(f"Prediction failed: {str(e)}")


# ── Repeat Offender Prediction ────────────────────────────────────────────────

def predict_repeat_offender(payload: dict) -> dict:
    try:
        from ml.inference.predict_repeat import predict_repeat_offender as _predict
        result = _predict(payload)
        logger.info(
            "Repeat offender prediction: %s | risk=%s (%.1f%%)",
            result["prediction"], result["risk_level"], result["confidence"]
        )
        return result
    except FileNotFoundError as e:
        logger.error("Repeat offender model not found: %s", e)
        raise ServiceUnavailableException("Repeat Offender ML model")
    except Exception as e:
        logger.error("Repeat offender prediction failed: %s", e)
        raise BadRequestException(f"Prediction failed: {str(e)}")


# ── Crime Classification ───────────────────────────────────────────────────────

def classify_crime(payload: dict) -> dict:
    try:
        from ml.inference.predict_crime import predict_crime as _predict
        result = _predict(payload)
        logger.info("Crime classification: %s (%.1f%%)", result["prediction"], result["confidence"])
        return result
    except FileNotFoundError as e:
        logger.error("Crime classifier model not found: %s", e)
        raise ServiceUnavailableException("Crime Classifier ML model")
    except Exception as e:
        logger.error("Crime classification failed: %s", e)
        raise BadRequestException(f"Prediction failed: {str(e)}")
