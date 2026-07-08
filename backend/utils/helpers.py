from typing import Optional
import math
from datetime import datetime


def paginate(query, page: int, page_size: int):
    """Apply OFFSET/LIMIT to a SQLAlchemy query and return (items, total, pages)."""
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = math.ceil(total / page_size) if total else 0
    return items, total, pages


def format_datetime(dt: Optional[datetime]) -> Optional[str]:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ") if dt else None


def is_valid_coordinate(lat: float, lng: float) -> bool:
    return -90 <= lat <= 90 and -180 <= lng <= 180
