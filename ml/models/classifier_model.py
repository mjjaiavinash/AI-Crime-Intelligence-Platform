import logging
import numpy as np
from sklearn.ensemble import RandomForestClassifier

logger = logging.getLogger(__name__)


class RecidivismClassifierModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.is_fitted = False

    def _prepare_features(self, prior_crimes_count: int, threat_level: str, age_estimated: int) -> np.ndarray:
        # Simple feature encoding
        threat_mapping = {"low": 1, "medium": 2, "high": 3, "extreme": 4}
        threat_val = threat_mapping.get(threat_level.lower(), 1)
        age = age_estimated if age_estimated else 35

        return np.array([[prior_crimes_count, threat_val, age]])

    def fit_fallback(self) -> None:
        """Fit a simple classifier with synthetic/fallback data so we always have a working model."""
        # Features: [prior_crimes_count, threat_level_val, age]
        X = np.array([
            [0, 1, 20],
            [1, 2, 25],
            [3, 3, 30],
            [5, 4, 35],
            [0, 1, 40],
            [1, 2, 45],
            [10, 4, 28],
            [2, 3, 33]
        ])
        # Target: Repeat offender label (1 = yes, 0 = no)
        y = np.array([0, 0, 1, 1, 0, 0, 1, 1])

        self.model.fit(X, y)
        self.is_fitted = True
        logger.info("RecidivismClassifierModel fitted with fallback data.")

    def predict_probability(self, prior_crimes_count: int, threat_level: str, age_estimated: int) -> float:
        if not self.is_fitted:
            self.fit_fallback()
        
        features = self._prepare_features(prior_crimes_count, threat_level, age_estimated)
        # Predict probability of class 1 (repeat offender)
        prob = self.model.predict_proba(features)[0][1]
        return float(prob)
