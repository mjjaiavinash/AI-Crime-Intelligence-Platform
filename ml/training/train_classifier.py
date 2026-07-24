import logging
import os
import sys
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml.preprocessing.preprocess_classifier import (
    load_data, run_eda, clean_data, engineer_features,
    prepare_features, save_artifacts
)
from ml.evaluation.evaluate_classifier import (
    compute_metrics, cross_validate,
    save_confusion_matrix, save_feature_importance, save_shap
)

MODEL_PATH        = "ml/models/crime_classifier_model.pkl"
PREPROCESSOR_PATH = "ml/models/classifier_preprocessor.pkl"
LE_PATH           = "ml/models/classifier_label_encoder.pkl"
EVAL_DIR          = "ml/evaluation/classifier"


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("ml/training_classifier.log", mode="w", encoding="utf-8"),
        ]
    )


def train() -> None:
    setup_logging()
    logger = logging.getLogger(__name__)
    os.makedirs(EVAL_DIR, exist_ok=True)
    os.makedirs("ml/models", exist_ok=True)

    # 1. Load & EDA
    df = load_data()
    run_eda(df)

    # 2. Clean
    df = clean_data(df)

    # 3. Feature engineering
    df = engineer_features(df)

    # 4. Preprocess -- returns sparse combined matrix
    X, y, tfidf, structured_preprocessor, le, feature_names = prepare_features(df)

    # 5. Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    logger.info("Train: %d | Test: %d", X_train.shape[0], X_test.shape[0])

    # 6. Define models -- use array format for sparse matrix compatibility
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

    # 7. Train, evaluate, compare
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
        save_shap(model, X_test, feature_names, name)

    # 8. Select best model
    best_name  = max(results, key=lambda k: results[k]["f1"])
    best_model = trained_models[best_name]
    logger.info("Best model: %s (F1=%.4f)", best_name, results[best_name]["f1"])

    # 9. Save
    joblib.dump(best_model, MODEL_PATH)
    save_artifacts(tfidf, structured_preprocessor, le, PREPROCESSOR_PATH, LE_PATH)
    logger.info("Model saved -> %s", MODEL_PATH)

    # 10. Final summary
    logger.info("=" * 60)
    logger.info("FINAL COMPARISON")
    logger.info("=" * 60)
    for name, m in results.items():
        logger.info(
            "%s | Acc=%.4f | Precision=%.4f | Recall=%.4f | F1=%.4f | CV_F1=%.4f",
            name, m["accuracy"], m["precision"], m["recall"], m["f1"], m["cv_f1"]
        )
    logger.info("Training complete.")


if __name__ == "__main__":
    train()
