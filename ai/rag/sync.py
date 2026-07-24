"""
ai/rag/sync.py
Auto-sync MySQL records into the RAG vector store after create/update/delete.
"""
from ai.rag.chroma_client import ChromaClientManager
from ai.embeddings.embedder import Embedder
from core.logging import get_logger

logger = get_logger(__name__)


def _upsert(doc_id: str, text: str, metadata: dict):
    try:
        collection = ChromaClientManager.get_collection()
        embedding = Embedder.embed_documents([text])
        collection.upsert(ids=[doc_id], embeddings=embedding, documents=[text], metadatas=[metadata])
        logger.info("RAG synced: %s", doc_id)
    except Exception as e:
        logger.error("RAG sync failed for %s: %s", doc_id, e)


def _delete(doc_id: str):
    try:
        collection = ChromaClientManager.get_collection()
        store = collection._data
        if doc_id in store["ids"]:
            idx = store["ids"].index(doc_id)
            for key in ("ids", "documents", "embeddings", "metadatas"):
                store[key].pop(idx)
            collection._save()
            logger.info("RAG deleted: %s", doc_id)
    except Exception as e:
        logger.error("RAG delete failed for %s: %s", doc_id, e)


def sync_crime(crime):
    doc_id = f"crime_{crime.id}"
    text = (
        f"Crime ID: {crime.id}. Title: {crime.title}. "
        f"Type: {crime.crime_type}. Status: {crime.status}. "
        f"Location: {getattr(crime, 'location', 'N/A')}. "
        f"Description: {getattr(crime, 'description', '')}. "
        f"Date: {getattr(crime, 'crime_date', '')}."
    )
    _upsert(doc_id, text, {"source": "crime", "crime_id": crime.id})


def sync_victim(victim):
    doc_id = f"victim_{victim.id}"
    name = "Anonymous" if getattr(victim, "is_anonymous", False) else getattr(victim, "full_name", "Unknown")
    text = (
        f"Victim ID: {victim.id}. Name: {name}. "
        f"FIR ID: {getattr(victim, 'fir_id', 'N/A')}. "
        f"Age: {getattr(victim, 'age', 'N/A')}. "
        f"Gender: {getattr(victim, 'gender', 'N/A')}. "
        f"Injury: {getattr(victim, 'injury_description', 'N/A')}."
    )
    _upsert(doc_id, text, {"source": "victim", "victim_id": victim.id})


def delete_crime(crime_id: int):
    _delete(f"crime_{crime_id}")


def delete_victim(victim_id: int):
    _delete(f"victim_{victim_id}")
