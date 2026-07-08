from typing import List
from sentence_transformers import SentenceTransformer
from core.logging import get_logger

logger = get_logger(__name__)


class Embedder:
    _model: SentenceTransformer = None

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        if cls._model is None:
            logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2'...")
            # We use all-MiniLM-L6-v2 for fast and high-performance embedding vectors
            cls._model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer model loaded successfully.")
        return cls._model

    @classmethod
    def embed_query(cls, text: str) -> List[float]:
        model = cls.get_model()
        embedding = model.encode(text)
        return embedding.tolist()

    @classmethod
    def embed_documents(cls, texts: List[str]) -> List[List[float]]:
        model = cls.get_model()
        embeddings = model.encode(texts)
        return embeddings.tolist()
