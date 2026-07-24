from sqlalchemy.orm import Session
from schemas.report import ReportRequest, ReportRead
from core.exceptions import ServiceUnavailableException
from core.logging import get_logger

logger = get_logger(__name__)


def _retrieve_context(query: str) -> str:
    try:
        from ai.rag.retriever import retrieve_context
        items = retrieve_context(query, n_results=4)
        if not items:
            return "No relevant documents found in the knowledge base."
        blocks = [f"[Source: {item['metadata'].get('source', 'Unknown')}]\n{item['document']}" for item in items]
        return "\n\n".join(blocks)
    except Exception as exc:
        logger.warning("RAG retrieval failed: %s", exc)
        return ""


def generate_report(db: Session, payload: ReportRequest, user_id: int) -> ReportRead:
    context = _retrieve_context(payload.query)
    prompt = (
        f"You are a crime intelligence analyst.\n\n"
        f"Context:\n{context}\n\n"
        f"Task: {payload.query}\n\n"
        f"Write a structured intelligence report in markdown."
    )
    try:
        from ai.groq.client import GroqClientManager
        content = GroqClientManager.generate_completion(
            prompt,
            system_prompt="You are a senior crime intelligence analyst. Write professional, structured reports.",
        )
    except Exception as exc:
        logger.error("Groq API error: %s", exc)
        raise ServiceUnavailableException("Groq API")

    logger.info("Report generated for user_id=%d query=%r", user_id, payload.query[:60])
    return ReportRead(
        id=0,
        title=payload.title,
        query=payload.query,
        content=content,
        generated_by=user_id,
        created_at=__import__("datetime").datetime.utcnow(),
    )
