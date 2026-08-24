import logging
import os
import sys
import numpy as np
import joblib
import pandas as pd
from scipy.sparse import hstack, csr_matrix

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

logger = logging.getLogger(__name__)

_models_dir       = os.path.join(_backend_dir, "ml", "models")
MODEL_PATH        = os.path.join(_models_dir, "crime_classifier_model.pkl")
PREPROCESSOR_PATH = os.path.join(_models_dir, "classifier_preprocessor.pkl")
LE_PATH           = os.path.join(_models_dir, "classifier_label_encoder.pkl")

CATEGORICAL_COLS = ["District", "Location_Type", "Time_of_Day", "Victim_Gender", "Weapon_Used"]
NUMERICAL_COLS   = ["Victim_Age", "Incident_Month", "Incident_DayOfWeek", "Incident_Year", "Is_Weekend"]
TEXT_COL         = "Description"
DATE_COL         = "Incident_Date"

# Lazy-loaded singletons
_model        = None
_preprocessor = None
_le           = None


def _load_artifacts() -> None:
    global _model, _preprocessor, _le
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. "
                "Run: python ml/training/train_classifier.py"
            )
        _model        = joblib.load(MODEL_PATH)
        _preprocessor = joblib.load(PREPROCESSOR_PATH)
        _le           = joblib.load(LE_PATH)
        logger.info("Crime classifier artifacts loaded.")


def _extract_date_features(row: dict) -> dict:
    try:
        dt = pd.to_datetime(row.get(DATE_COL, "2023-01-01"))
        row["Incident_Month"]     = int(dt.month)
        row["Incident_DayOfWeek"] = int(dt.dayofweek)
        row["Incident_Year"]      = int(dt.year)
        row["Is_Weekend"]         = 1 if dt.dayofweek >= 5 else 0
    except Exception:
        row["Incident_Month"]     = 1
        row["Incident_DayOfWeek"] = 0
        row["Incident_Year"]      = 2023
        row["Is_Weekend"]         = 0
    return row


def predict_crime(input_data: dict) -> dict:
    """
    Predict crime type from case input data.

    Args:
        input_data: dict with keys -- Description, District, Location_Type,
                    Time_of_Day, Victim_Age, Victim_Gender, Weapon_Used, Incident_Date

    Returns:
        {
            "prediction": "Vehicle Theft",
            "confidence": 97.1,
            "top_features": ["Description", "Weapon_Used", "Location_Type"]
        }
    """
    try:
        _load_artifacts()

        row = dict(input_data)
        row["Weapon_Used"] = row.get("Weapon_Used") or "Unknown"
        row = _extract_date_features(row)

        tfidf      = _preprocessor["tfidf"]
        structured = _preprocessor["structured"]

        # Text features
        X_text   = tfidf.transform([str(row.get(TEXT_COL, ""))])

        # Structured features
        df_struct = pd.DataFrame([row])[CATEGORICAL_COLS + NUMERICAL_COLS]
        X_struct  = csr_matrix(structured.transform(df_struct))

        X_combined = hstack([X_text, X_struct])

        proba      = _model.predict_proba(X_combined)[0]
        pred_index = int(np.argmax(proba))
        prediction = _le.inverse_transform([pred_index])[0]
        confidence = round(float(proba[pred_index]) * 100, 2)

        # Top features
        try:
            importances  = _model.feature_importances_
            tfidf_names  = [f"tfidf_{t}" for t in tfidf.get_feature_names_out()]
            feature_names = tfidf_names + CATEGORICAL_COLS + NUMERICAL_COLS
            top_indices  = np.argsort(importances)[::-1][:3]
            top_features = [feature_names[i] for i in top_indices]
        except AttributeError:
            top_features = ["Description", "Weapon_Used", "Location_Type"]

        return {
            "prediction":   prediction,
            "confidence":   confidence,
            "top_features": top_features,
        }

    except FileNotFoundError as e:
        logger.error("Model artifacts missing: %s", e)
        raise
    except Exception as e:
        logger.error("Prediction failed: %s", e)
        raise


# Quick test
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
    sample = {
        "Description":   "Vehicle stolen from parking lot near market",
        "District":      "Bengaluru Urban",
        "Location_Type": "Market",
        "Time_of_Day":   "Night",
        "Victim_Age":    35,
        "Victim_Gender": "Male",
        "Weapon_Used":   "None",
        "Incident_Date": "2024-03-15",
    }
    result = predict_crime(sample)
    print(result)
