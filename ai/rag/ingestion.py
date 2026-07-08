import os
from typing import List, Dict, Any
import fitz  # PyMuPDF
from ai.embeddings.embedder import Embedder
from ai.rag.chroma_client import ChromaClientManager
from core.logging import get_logger

logger = get_logger(__name__)


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF (fitz)."""
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        logger.error("Failed to extract text from PDF %s: %s", pdf_path, e)
    return text


def split_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks of rough character count."""
    chunks = []
    if not text:
        return chunks
    
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - chunk_overlap
    return chunks


def ingest_document(file_path: str, metadata: Dict[str, Any] = None) -> bool:
    """Ingests a file (PDF or TXT), chunks it, embeds it, and stores it in ChromaDB."""
    if not os.path.exists(file_path):
        logger.error("File does not exist: %s", file_path)
        return False

    _, ext = os.path.splitext(file_path.lower())
    if ext == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif ext in [".txt", ".json", ".csv"]:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        except Exception as e:
            logger.error("Failed to read text file %s: %s", file_path, e)
            return False
    else:
        logger.error("Unsupported file extension: %s", ext)
        return False

    if not text.strip():
        logger.warning("No text content found in file: %s", file_path)
        return False

    chunks = split_text(text)
    if not chunks:
        return False

    # Get ChromaDB collection
    collection = ChromaClientManager.get_collection()

    filename = os.path.basename(file_path)
    base_metadata = metadata or {}
    base_metadata.update({"source": filename})

    documents = []
    metadatas = []
    ids = []

    for i, chunk in enumerate(chunks):
        documents.append(chunk)
        # Create unique ID for each chunk
        ids.append(f"{filename}_chunk_{i}")
        # Build specific metadata for this chunk
        chunk_meta = base_metadata.copy()
        chunk_meta["chunk_index"] = i
        metadatas.append(chunk_meta)

    # Compute embeddings
    logger.info("Generating embeddings for %d chunks of %s...", len(chunks), filename)
    embeddings = Embedder.embed_documents(documents)

    # Upsert to ChromaDB
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )
    logger.info("Successfully ingested %s into ChromaDB.", filename)
    return True
