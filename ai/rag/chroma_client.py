"""
ai/rag/chroma_client.py
────────────────────────
Lightweight vector store using numpy cosine similarity + JSON persistence.
Drop-in replacement for ChromaDB — no SQLite version dependency.
"""

import os
import json
import numpy as np
from core.logging import get_logger

logger = get_logger(__name__)


class VectorStore:
    """
    File-backed vector store.
    Stores documents, embeddings, and metadata in a JSON file.
    Uses cosine similarity for retrieval.
    """

    def __init__(self, persist_path: str, collection_name: str):
        self.persist_path = persist_path
        self.collection_name = collection_name
        self._store_file = os.path.join(persist_path, f"{collection_name}.json")
        os.makedirs(persist_path, exist_ok=True)
        self._data = self._load()
        logger.info("VectorStore loaded: %s (%d docs)", collection_name, len(self._data["ids"]))

    def _load(self) -> dict:
        if os.path.exists(self._store_file):
            try:
                with open(self._store_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning("Could not load vector store, starting fresh: %s", e)
        return {"ids": [], "documents": [], "embeddings": [], "metadatas": []}

    def _save(self) -> None:
        with open(self._store_file, "w", encoding="utf-8") as f:
            json.dump(self._data, f, ensure_ascii=False)

    @property
    def name(self) -> str:
        return self.collection_name

    def count(self) -> int:
        return len(self._data["ids"])

    def upsert(self, ids: list, embeddings: list, documents: list, metadatas: list) -> None:
        for i, doc_id in enumerate(ids):
            if doc_id in self._data["ids"]:
                idx = self._data["ids"].index(doc_id)
                self._data["documents"][idx]  = documents[i]
                self._data["embeddings"][idx] = embeddings[i]
                self._data["metadatas"][idx]  = metadatas[i]
            else:
                self._data["ids"].append(doc_id)
                self._data["documents"].append(documents[i])
                self._data["embeddings"].append(embeddings[i])
                self._data["metadatas"].append(metadatas[i])
        self._save()
        logger.info("Upserted %d documents into VectorStore.", len(ids))

    def query(self, query_embeddings: list, n_results: int = 5, where: dict = None) -> dict:
        if not self._data["ids"]:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        q_vec = np.array(query_embeddings[0], dtype=np.float32)
        q_norm = q_vec / (np.linalg.norm(q_vec) + 1e-10)

        scores = []
        for i, emb in enumerate(self._data["embeddings"]):
            # Apply metadata filter if provided
            if where:
                meta = self._data["metadatas"][i]
                if not all(meta.get(k) == v for k, v in where.items()):
                    continue
            d_vec  = np.array(emb, dtype=np.float32)
            d_norm = d_vec / (np.linalg.norm(d_vec) + 1e-10)
            # Cosine distance = 1 - cosine similarity
            distance = float(1.0 - np.dot(q_norm, d_norm))
            scores.append((i, distance))

        scores.sort(key=lambda x: x[1])
        top = scores[:n_results]

        return {
            "ids":       [[self._data["ids"][i]       for i, _ in top]],
            "documents": [[self._data["documents"][i] for i, _ in top]],
            "metadatas": [[self._data["metadatas"][i] for i, _ in top]],
            "distances": [[d                          for _, d  in top]],
        }


class ChromaClientManager:
    _collections: dict = {}

    @classmethod
    def get_collection(cls, name: str = None):
        from core.config import settings
        if name is None:
            name = settings.CHROMA_COLLECTION_NAME
        if name not in cls._collections:
            persist_dir = settings.CHROMA_PERSIST_PATH
            cls._collections[name] = VectorStore(persist_dir, name)
        return cls._collections[name]
