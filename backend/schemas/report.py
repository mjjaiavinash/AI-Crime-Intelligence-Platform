from typing import Optional
from datetime import datetime
from schemas.base import APIBase


class ReportRequest(APIBase):
    title: str
    query: str                      # Natural-language prompt sent to RAG + Groq
    crime_ids: list[int] = []       # Optional: scope report to specific crimes


class ReportRead(APIBase):
    id: int
    title: str
    query: str
    content: str                    # AI-generated markdown content
    generated_by: Optional[int]
    created_at: datetime
