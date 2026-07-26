import os
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from core.config import settings
from core.security import get_current_user
from schemas.chat import ChatRequest
from ai.pipelines.rag_pipeline import run_rag_pipeline
from ai.rag.ingestion import ingest_document
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post(
    "",
    summary="Interactive RAG Chat Stream — all roles",
)
async def chat_stream(payload: ChatRequest):
    """
    Sends a query to the conversational assistant.
    Returns a stream of text tokens (chunk-encoded SSE-like stream) retrieved using ChromaDB RAG and Groq.
    """
    try:
        generator = run_rag_pipeline(
            query=payload.query,
            chat_history=payload.chat_history,
            filters=payload.filters,
        )
        return StreamingResponse(generator, media_type="text/plain; charset=utf-8")
    except Exception as e:
        logger.error("Chat streaming failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/ingest",
    summary="Ingest intelligence document into RAG database — admin | supervisor | crime_analyst",
)
async def upload_and_ingest_document(
    file: UploadFile = File(...),
    fir_id: Optional[int] = Form(None),
):
    """
    Uploads and indexes a PDF or TXT crime document, case file, or law reference into ChromaDB.
    Attach an optional `fir_id` to restrict searching / filters to a specific case.
    """
    try:
        # Ensure uploads folder exists
        upload_dir = settings.UPLOAD_DIR
        if not os.path.isabs(upload_dir):
            import pathlib
            upload_dir = str(pathlib.Path(__file__).resolve().parent.parent.parent.parent / upload_dir.lstrip("../"))
        os.makedirs(upload_dir, exist_ok=True)
        dest_path = os.path.join(upload_dir, file.filename)

        with open(dest_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        logger.info("Saved upload file to %s", dest_path)

        metadata = {}
        if fir_id is not None:
            metadata["fir_id"] = fir_id

        success = ingest_document(dest_path, metadata=metadata)
        if not success:
            raise HTTPException(status_code=400, detail="Document ingestion failed. Verify text contents.")

        return {
            "status": "success",
            "message": f"Successfully ingested {file.filename} into ChromaDB vector database.",
            "filename": file.filename,
        }

    except Exception as e:
        logger.error("Document upload/ingestion failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
