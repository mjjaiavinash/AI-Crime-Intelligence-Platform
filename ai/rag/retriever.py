from typing import List, Dict, Any, Optional
from ai.embeddings.embedder import Embedder
from ai.rag.chroma_client import ChromaClientManager
from core.logging import get_logger

logger = get_logger(__name__)


def retrieve_context(
    query: str,
    n_results: int = 5,
    filters: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Search ChromaDB for chunks matching the query string.
    Returns a list of dicts with 'document' (text), 'metadata', 'id', and 'distance'.
    """
    try:
        collection = ChromaClientManager.get_collection()
        query_embedding = Embedder.embed_query(query)

        # ChromaDB filters syntax: {"metadata_field": "value"} or with operators {"field": {"$eq": "val"}}
        where_filter = {}
        if filters:
            for k, v in filters.items():
                if v is not None:
                    where_filter[k] = v

        logger.info("Querying ChromaDB collection for: %r with filters=%s", query, where_filter)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_filter if where_filter else None
        )

        formatted_results = []
        if results and "documents" in results and results["documents"]:
            # ChromaDB returns nested arrays, we take the first element for our single query
            documents = results["documents"][0]
            metadatas = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else []
            ids = results["ids"][0] if "ids" in results and results["ids"] else []
            distances = results["distances"][0] if "distances" in results and results["distances"] else []

            for i in range(len(documents)):
                formatted_results.append({
                    "id": ids[i] if i < len(ids) else "",
                    "document": documents[i],
                    "metadata": metadatas[i] if i < len(metadatas) else {},
                    "distance": distances[i] if i < len(distances) else 1.0
                })

        logger.info("ChromaDB retrieved %d results.", len(formatted_results))
        return formatted_results

    except Exception as e:
        logger.error("Failed to retrieve context from ChromaDB: %s", e)
        return []
