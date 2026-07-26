import logging
import os
import sys
import numpy as np
import joblib
import pandas as pd

_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, _project_root)

logger = logging.getLogger(__name__)

_models_dir       = os.path.join(_project_root, "ml", "models")
MODEL_PATH        = os.path.join(_models_dir, "repeat_offender_model.pkl")
PREPROCESSOR_PATH = os.path.join(_models_dir, "repeat_preprocessor.pkl")
LE_PATH           = os.path.join(_models_dir, "repeat_label_encoder.pkl")

CATEGORICAL_COLS = ["Gender", "District", "Primary_Crime_Type", "Gang_Affiliation"]
NUMERICAL_COLS   = [
    "Age", "Previous_Arrests", "Previous_Convictions",
    "Years_Active", "Bail_Count", "Known_Associates"
]
ENGINEERED_COLS  = ["Criminal_Intensity", "Arrest_Conviction_Ratio", "Activity_Rate"]
FEATURE_NAMES    = CATEGORICAL_COLS + NUMERICAL_COLS + ENGINEERED_COLS

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
                "Run: python ml/training/train_repeat.py"
            )
        _model        = joblib.load(MODEL_PATH)
        _preprocessor = joblib.load(PREPROCESSOR_PATH)
        _le           = joblib.load(LE_PATH)
        logger.info("Repeat offender model artifacts loaded.")


def _engineer(row: dict) -> dict:
    pa  = row["Previous_Arrests"]
    pc  = row["Previous_Convictions"]
    ya  = row["Years_Active"]
    bc  = row["Bail_Count"]
    ka  = row["Known_Associates"]
    row["Criminal_Intensity"]      = pa * 0.3 + pc * 0.4 + bc * 0.2 + ka * 0.1
    row["Arrest_Conviction_Ratio"] = pc / (pa + 1)
    row["Activity_Rate"]           = pa / (ya + 1)
    return row


def _get_risk_level(confidence: float, prediction: str) -> str:
    if prediction == "No":
        return "Low"
    if confidence >= 90:
        return "High"
    if confidence >= 70:
        return "Medium"
    return "Low"


def predict_repeat_offender(input_data: dict) -> dict:
    """
    Predict whether a suspect is a repeat offender.

    Args:
        input_data: dict with keys matching feature columns

    Returns:
        {
            "prediction": "Yes",
            "confidence": 95.8,
            "risk_level": "High",
            "top_features": ["Previous_Arrests", "Known_Associates", "Previous_Convictions"]
        }
    """
    try:
        _load_artifacts()

        row = _engineer(dict(input_data))
        df  = pd.DataFrame([row])[FEATURE_NAMES]

        X           = _preprocessor.transform(df)
        proba       = _model.predict_proba(X)[0]
        pred_index  = int(np.argmax(proba))
        prediction  = _le.inverse_transform([pred_index])[0]
        confidence  = round(float(proba[pred_index]) * 100, 2)
        risk_level  = _get_risk_level(confidence, prediction)

        # Top features from model importances
        try:
            importances  = _model.feature_importances_
            top_indices  = np.argsort(importances)[::-1][:3]
            top_features = [FEATURE_NAMES[i] for i in top_indices]
        except AttributeError:
            top_features = ["Previous_Arrests", "Previous_Convictions", "Known_Associates"]

        return {
            "prediction":   prediction,
            "confidence":   confidence,
            "risk_level":   risk_level,
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
        "Age": 28,
        "Gender": "Male",
        "District": "Bengaluru Urban",
        "Primary_Crime_Type": "Theft",
        "Previous_Arrests": 5,
        "Previous_Convictions": 3,
        "Years_Active": 4,
        "Bail_Count": 2,
        "Known_Associates": 8,
        "Gang_Affiliation": "Yes",
    }
    result = predict_repeat_offender(sample)
    print(result)
