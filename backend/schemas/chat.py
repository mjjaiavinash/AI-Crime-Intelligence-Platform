from typing import Optional, List, Dict, Any
from schemas.base import APIBase


class ChatRequest(APIBase):
    query: str
    chat_history: Optional[List[Dict[str, str]]] = None
    filters: Optional[Dict[str, Any]] = None
