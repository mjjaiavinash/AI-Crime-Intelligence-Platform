import logging
import os
import sys
import numpy as np
import joblib
import pandas as pd

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

logger = logging.getLogger(__name__)

_models_dir       = os.path.join(_backend_dir, "ml", "models")
MODEL_PATH        = os.path.join(_models_dir, "hotspot_model.pkl")
PREPROCESSOR_PATH = os.path.join(_models_dir, "hotspot_preprocessor.pkl")
LE_PATH           = os.path.join(_models_dir, "hotspot_label_encoder.pkl")

CATEGORICAL_COLS = ["District", "Taluk", "Police_Station", "Crime_Type", "Season", "Festival_Season"]
NUMERICAL_COLS   = [
    "Year", "Month", "Latitude", "Longitude",
    "Population", "Population_Density", "Literacy_Rate",
    "Unemployment_Rate", "Crime_Count_Last30Days", "Previous_Year_Crime_Count"
]
FEATURE_NAMES = CATEGORICAL_COLS + NUMERICAL_COLS

# ── Lazy-loaded singletons ─────────────────────────────────────────────────────
_model        = None
_preprocessor = None
_le           = None


def _load_artifacts() -> None:
    global _model, _preprocessor, _le
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run training first: "
                "python ml/training/train.py"
            )
        _model        = joblib.load(MODEL_PATH)
        _preprocessor = joblib.load(PREPROCESSOR_PATH)
        _le           = joblib.load(LE_PATH)
        logger.info("Hotspot model artifacts loaded.")


def predict_hotspot(input_data: dict) -> dict:
    """
    Predict crime hotspot label for a given input.

    Args:
        input_data: dict with keys matching FEATURE_NAMES

    Returns:
        {
            "prediction": "High",
            "confidence": 96.4,
            "top_features": ["Crime_Count_Last30Days", "Population_Density", "District"]
        }
    """
    try:
        _load_artifacts()

        # Build dataframe in correct column order
        df = pd.DataFrame([input_data])[FEATURE_NAMES]

        # Preprocess
        X = _preprocessor.transform(df)

        # Predict
        proba       = _model.predict_proba(X)[0]
        pred_index  = int(np.argmax(proba))
        prediction  = _le.inverse_transform([pred_index])[0]
        confidence  = round(float(proba[pred_index]) * 100, 2)

        # Top features from model importances
        importances  = _model.feature_importances_
        top_indices  = np.argsort(importances)[::-1][:3]
        top_features = [FEATURE_NAMES[i] for i in top_indices]

        return {
            "prediction": prediction,
            "confidence": confidence,
            "top_features": top_features,
        }

    except FileNotFoundError as e:
        logger.error("Model artifacts missing: %s", e)
        raise
    except Exception as e:
        logger.error("Prediction failed: %s", e)
        raise


# ── Quick test ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
    sample = {
        "District": "Bengaluru Urban",
        "Taluk": "Bengaluru North",
        "Police_Station": "Hebbal",
        "Crime_Type": "Theft",
        "Year": 2023,
        "Month": 6,
        "Season": "Summer",
        "Latitude": 13.0358,
        "Longitude": 77.5970,
        "Population": 500000,
        "Population_Density": 12000,
        "Literacy_Rate": 88.5,
        "Unemployment_Rate": 4.2,
        "Festival_Season": "No",
        "Crime_Count_Last30Days": 45,
        "Previous_Year_Crime_Count": 520,
    }
    result = predict_hotspot(sample)
    print(result)
