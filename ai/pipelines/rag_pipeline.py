from typing import Generator, List, Dict, Any, Optional
from ai.rag.retriever import retrieve_context
from ai.groq.client import GroqClientManager
from ai.prompts.templates import RAG_SYSTEM_PROMPT
from core.logging import get_logger

logger = get_logger(__name__)


GREETINGS = {"hi", "hii", "hello", "hey", "helo", "hai", "howdy", "sup", "yo"}


def run_rag_pipeline(
    query: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
    filters: Optional[Dict[str, Any]] = None,
) -> Generator[str, None, None]:
    # Skip RAG context for greetings/small talk
    is_greeting = query.strip().lower().rstrip('!.,') in GREETINGS

    if is_greeting:
        joined_context = "No context needed — user sent a greeting."
    else:
        retrieved_items = retrieve_context(query, n_results=4, filters=filters)
        context_blocks = []
        for item in retrieved_items:
            doc = item["document"]
            # Skip corrupted chunks (non-printable / garbled characters)
            printable_ratio = sum(c.isprintable() for c in doc) / max(len(doc), 1)
            if printable_ratio < 0.85:
                continue
            source_info = item["metadata"].get("source", "Unknown Source")
            context_blocks.append(f"[Source: {source_info}]\n{doc}")
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
