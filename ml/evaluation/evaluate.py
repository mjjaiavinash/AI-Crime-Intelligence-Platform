import logging
import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
    classification_report, ConfusionMatrixDisplay
)
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import label_binarize

logger = logging.getLogger(__name__)

EVAL_DIR = "ml/evaluation/hotspot"


def compute_metrics(model, X_test, y_test, label_encoder, model_name: str) -> dict:
    y_pred = model.predict(X_test)
    classes = label_encoder.classes_

    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall    = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1        = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    # ROC AUC — multiclass OvR
    try:
        y_prob = model.predict_proba(X_test)
        y_bin  = label_binarize(y_test, classes=np.unique(y_test))
        roc_auc = roc_auc_score(y_bin, y_prob, multi_class="ovr", average="weighted")
    except Exception:
        roc_auc = None

    logger.info("--- %s ---", model_name)
    logger.info("Accuracy  : %.4f", accuracy)
    logger.info("Precision : %.4f", precision)
    logger.info("Recall    : %.4f", recall)
    logger.info("F1 Score  : %.4f", f1)
    if roc_auc:
        logger.info("ROC AUC   : %.4f", roc_auc)
    logger.info("Classification Report:\n%s", classification_report(y_test, y_pred, target_names=classes))

    return {
        "model_name": model_name,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "roc_auc": roc_auc,
    }


def cross_validate(model, X_train, y_train, model_name: str, cv: int = 5) -> float:
    scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="f1_weighted", n_jobs=-1)
    logger.info("%s CV F1 (mean=%.4f, std=%.4f)", model_name, scores.mean(), scores.std())
    return scores.mean()


def save_confusion_matrix(model, X_test, y_test, label_encoder, model_name: str) -> None:
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=label_encoder.classes_)
    fig, ax = plt.subplots(figsize=(8, 6))
    disp.plot(ax=ax, cmap="Blues", colorbar=False)
    ax.set_title(f"Confusion Matrix — {model_name}")
    path = os.path.join(EVAL_DIR, f"confusion_matrix_{model_name.lower().replace(' ', '_')}.png")
    plt.tight_layout()
    plt.savefig(path, dpi=150)
    plt.close()
    logger.info("Confusion matrix saved -> %s", path)


def save_feature_importance(model, feature_names: list, model_name: str) -> None:
    try:
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1][:20]
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.barh(
            [feature_names[i] for i in indices][::-1],
            importances[indices][::-1],
            color="steelblue"
        )
        ax.set_title(f"Top 20 Feature Importances — {model_name}")
        ax.set_xlabel("Importance")
        path = os.path.join(EVAL_DIR, f"feature_importance_{model_name.lower().replace(' ', '_')}.png")
        plt.tight_layout()
        plt.savefig(path, dpi=150)
        plt.close()
        logger.info("Feature importance saved -> %s", path)
    except Exception as e:
        logger.warning("Could not save feature importance: %s", e)


def save_roc_curve(model, X_test, y_test, label_encoder, model_name: str) -> None:
    try:
        from sklearn.metrics import roc_curve, auc
        y_prob = model.predict_proba(X_test)
        classes = label_encoder.classes_
        y_bin = label_binarize(y_test, classes=np.unique(y_test))
        fig, ax = plt.subplots(figsize=(8, 6))
        for i, cls in enumerate(classes):
            fpr, tpr, _ = roc_curve(y_bin[:, i], y_prob[:, i])
            roc_auc = auc(fpr, tpr)
            ax.plot(fpr, tpr, label=f"{cls} (AUC={roc_auc:.2f})")
        ax.plot([0, 1], [0, 1], "k--")
        ax.set_title(f"ROC Curve — {model_name}")
        ax.set_xlabel("False Positive Rate")
        ax.set_ylabel("True Positive Rate")
        ax.legend()
        path = os.path.join(EVAL_DIR, f"roc_curve_{model_name.lower().replace(' ', '_')}.png")
        plt.tight_layout()
        plt.savefig(path, dpi=150)
        plt.close()
        logger.info("ROC curve saved -> %s", path)
    except Exception as e:
        logger.warning("Could not save ROC curve: %s", e)


def save_shap_explainability(model, X_test, feature_names: list, model_name: str) -> None:
    try:
        import shap
        explainer = shap.TreeExplainer(model)
        sample = X_test[:500]
        shap_values = explainer.shap_values(sample)
        fig, ax = plt.subplots(figsize=(10, 6))
        if isinstance(shap_values, list):
            shap.summary_plot(shap_values[0], sample, feature_names=feature_names, show=False)
        else:
            shap.summary_plot(shap_values, sample, feature_names=feature_names, show=False)
        path = os.path.join(EVAL_DIR, f"shap_{model_name.lower().replace(' ', '_')}.png")
        plt.tight_layout()
        plt.savefig(path, dpi=150, bbox_inches="tight")
        plt.close()
        logger.info("SHAP plot saved -> %s", path)
    except Exception as e:
        logger.warning("Could not save SHAP plot: %s", e)
