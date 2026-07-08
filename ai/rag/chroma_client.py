import os
import chromadb
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


class ChromaClientManager:
    _client: chromadb.PersistentClient = None

    @classmethod
    def get_client(cls) -> chromadb.PersistentClient:
        if cls._client is None:
            # Ensure database directory exists
            persist_dir = os.path.abspath(settings.CHROMA_PERSIST_DIR)
            os.makedirs(persist_dir, exist_ok=True)
            logger.info("Initializing ChromaDB PersistentClient at: %s", persist_dir)
            cls._client = chromadb.PersistentClient(path=persist_dir)
        return cls._client

    @classmethod
    def get_collection(cls, name: str = None):
        if name is None:
            name = settings.CHROMA_COLLECTION_NAME
        client = cls.get_client()
        logger.info("Accessing ChromaDB collection: %s", name)
        # Using a custom metadata specification or default distance metric (cosine)
        return client.get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"}
        )
