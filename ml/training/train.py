import logging
import os
import sys
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

# Allow imports from project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml.preprocessing.preprocess import load_data, run_eda, clean_data, prepare_features, save_artifacts
from ml.evaluation.evaluate import (
    compute_metrics, cross_validate,
    save_confusion_matrix, save_feature_importance,
    save_roc_curve, save_shap_explainability
)

# ── Paths ──────────────────────────────────────────────────────────────────────
MODEL_PATH       = "ml/models/hotspot_model.pkl"
PREPROCESSOR_PATH = "ml/models/hotspot_preprocessor.pkl"
LE_PATH          = "ml/models/hotspot_label_encoder.pkl"
EVAL_DIR         = "ml/evaluation/hotspot"

CATEGORICAL_COLS = ["District", "Taluk", "Police_Station", "Crime_Type", "Season", "Festival_Season"]
NUMERICAL_COLS   = [
    "Year", "Month", "Latitude", "Longitude",
    "Population", "Population_Density", "Literacy_Rate",
    "Unemployment_Rate", "Crime_Count_Last30Days", "Previous_Year_Crime_Count"
]


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("ml/training_hotspot.log", mode="w"),
        ]
    )


def train() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)
    os.makedirs(EVAL_DIR, exist_ok=True)
    os.makedirs("ml/models", exist_ok=True)

    # ── 1. Load & EDA ──────────────────────────────────────────────────────────
    df = load_data()
    run_eda(df)

    # ── 2. Clean ───────────────────────────────────────────────────────────────
    df = clean_data(df)

    # ── 3. Preprocess ──────────────────────────────────────────────────────────
    X, y, preprocessor, le = prepare_features(df)
    feature_names = CATEGORICAL_COLS + NUMERICAL_COLS

    # ── 4. Split ───────────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    logger.info("Train: %d | Test: %d", len(X_train), len(X_test))

    # ── 5. Define models ───────────────────────────────────────────────────────
    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1
        ),
    }

    # ── 6. Train, evaluate, compare ────────────────────────────────────────────
    results = {}
    trained_models = {}

    for name, model in models.items():
        logger.info("Training %s ...", name)
        model.fit(X_train, y_train)
        metrics = compute_metrics(model, X_test, y_test, le, name)
        cv_f1   = cross_validate(model, X_train, y_train, name)
        metrics["cv_f1"] = cv_f1
        results[name] = metrics
        trained_models[name] = model

        save_confusion_matrix(model, X_test, y_test, le, name)
        save_feature_importance(model, feature_names, name)
        save_roc_curve(model, X_test, y_test, le, name)
        save_shap_explainability(model, X_test, feature_names, name)

    # ── 7. Select best model ───────────────────────────────────────────────────
    best_name = max(results, key=lambda k: results[k]["f1"])
    best_model = trained_models[best_name]
    logger.info("Best model: %s (F1=%.4f)", best_name, results[best_name]["f1"])

    # ── 8. Save artifacts ──────────────────────────────────────────────────────
    joblib.dump(best_model, MODEL_PATH)
    save_artifacts(preprocessor, le, PREPROCESSOR_PATH, LE_PATH)
    logger.info("Model saved -> %s", MODEL_PATH)

    # ── 9. Summary ─────────────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("FINAL COMPARISON")
    logger.info("=" * 60)
    for name, m in results.items():
        logger.info(
            "%s | Acc=%.4f | F1=%.4f | ROC=%.4f | CV_F1=%.4f",
            name, m["accuracy"], m["f1"],
            m["roc_auc"] if m["roc_auc"] else 0.0,
            m["cv_f1"]
        )
    logger.info("Training complete.")


if __name__ == "__main__":
    train()
