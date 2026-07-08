from sqlalchemy.orm import Session
from schemas.report import ReportRequest, ReportRead
from core.config import settings
from core.exceptions import ServiceUnavailableException
from core.logging import get_logger

logger = get_logger(__name__)


def _retrieve_context(query: str, crime_ids: list[int]) -> str:
    """
    ChromaDB RAG retrieval placeholder.
    Replace with real ChromaDB query once ai/rag/retriever.py is implemented.
    """
    try:
        import chromadb  # noqa: F401
        # TODO: initialise client, query collection, return joined doc chunks
        return "[RAG context placeholder — ChromaDB not yet connected]"
    except Exception as exc:
        logger.warning("ChromaDB unavailable: %s", exc)
        return ""


def _call_groq(prompt: str) -> str:
    """
    Groq LLM call placeholder.
    Replace with real groq.Client call once ai/groq/client.py is implemented.
    """
    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set — returning stub response.")
        return "[Groq response placeholder — API key not configured]"
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    except Exception as exc:
        logger.error("Groq API error: %s", exc)
        raise ServiceUnavailableException("Groq API")


def generate_report(db: Session, payload: ReportRequest, user_id: int) -> ReportRead:
    context = _retrieve_context(payload.query, payload.crime_ids)
    prompt = (
        f"You are a crime intelligence analyst.\n\n"
        f"Context:\n{context}\n\n"
        f"Task: {payload.query}\n\n"
        f"Write a structured intelligence report in markdown."
    )
    content = _call_groq(prompt)
    logger.info("Report generated for user_id=%d query=%r", user_id, payload.query[:60])

    # Persist to DB — Report model can be added later; return inline for now
    return ReportRead(
        id=0,
        title=payload.title,
        query=payload.query,
        content=content,
        generated_by=user_id,
        created_at=__import__("datetime").datetime.utcnow(),
    )
