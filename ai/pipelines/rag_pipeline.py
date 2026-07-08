from typing import Generator, List, Dict, Any, Optional
from ai.rag.retriever import retrieve_context
from ai.groq.client import GroqClientManager
from ai.prompts.templates import RAG_SYSTEM_PROMPT
from core.logging import get_logger

logger = get_logger(__name__)


def run_rag_pipeline(
    query: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
    filters: Optional[Dict[str, Any]] = None,
) -> Generator[str, None, None]:
    """
    RAG Pipeline:
    1. Retrieve relevant contexts from ChromaDB
    2. Format the system prompt with context
    3. Construct the message list with history
    4. Call Groq streaming chat completion and yield tokens
    """
    # 1. Retrieve context
    retrieved_items = retrieve_context(query, n_results=4, filters=filters)
    context_blocks = []
    for item in retrieved_items:
        source_info = item["metadata"].get("source", "Unknown Source")
        context_blocks.append(f"[Source: {source_info}]\n{item['document']}")

    joined_context = "\n\n".join(context_blocks) if context_blocks else "No relevant documents found in database."

    # 2. Format system prompt
    system_content = RAG_SYSTEM_PROMPT.format(context=joined_context)

    # 3. Build messages list
    messages = [{"role": "system", "content": system_content}]

    # Append history if present
    if chat_history:
        for msg in chat_history:
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Append current user query
    messages.append({"role": "user", "content": query})

    # 4. Stream response
    logger.info("Executing streaming RAG pipeline for query: %r", query)
    return GroqClientManager.generate_streaming_completion(messages)
