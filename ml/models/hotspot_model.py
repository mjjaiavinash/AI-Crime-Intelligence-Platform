import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from core.logging import get_logger

logger = get_logger(__name__)


class CrimeHotspotModel:
    def __init__(self, eps_km: float = 1.0, min_samples: int = 2):
        # eps in DBSCAN is in degrees for latitude/longitude roughly (1km ~ 0.009 degrees)
        self.eps = eps_km / 111.0
        self.min_samples = min_samples
        self.is_fitted = False
        self.hotspots = []

    def fit(self, coords: np.ndarray) -> None:
        """
        coords: numpy array of shape (N, 2) representing [[latitude, longitude], ...]
        """
        if len(coords) < self.min_samples:
            logger.warning("Not enough coordinates to train DBSCAN hotspot model.")
            self.hotspots = []
            self.is_fitted = True
            return

        db = DBSCAN(eps=self.eps, min_samples=self.min_samples).fit(coords)
        labels = db.labels_

        unique_labels = set(labels)
        self.hotspots = []

        for label in unique_labels:
            if label == -1:
                # Noise points
                continue
            
            # Find cluster center
            cluster_coords = coords[labels == label]
            center = cluster_coords.mean(axis=0)
            radius = np.max(np.linalg.norm(cluster_coords - center, axis=1))
            weight = len(cluster_coords)

            self.hotspots.append({
                "cluster_id": int(label),
                "latitude": float(center[0]),
                "longitude": float(center[1]),
                "radius_km": float(radius * 111.0),
                "intensity": int(weight),
            })

        logger.info("Hotspot DBSCAN model trained. Discovered %d crime hotspots.", len(self.hotspots))
        self.is_fitted = True

    def predict_hotspots(self) -> list:
        """Returns the list of identified hotspots with coordinates, radii, and intensities."""
        return self.hotspots
