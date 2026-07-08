from typing import Optional
import math
from sqlalchemy.orm import Session
from models.crime_history import CrimeHistory
from schemas.crime_history import CrimeHistoryCreate, CrimeHistoryUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger

logger = get_logger(__name__)


def list_crime_history(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    suspect_id: Optional[int] = None,
) -> PaginatedResponse:
    q = db.query(CrimeHistory)
    if suspect_id:
        q = q.filter(CrimeHistory.suspect_id == suspect_id)
    total = q.count()
    items = q.order_by(CrimeHistory.incident_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


def get_crime_history(db: Session, history_id: int) -> CrimeHistory:
    ch = db.get(CrimeHistory, history_id)
    if not ch:
        raise NotFoundException("CrimeHistory")
    return ch


def create_crime_history(db: Session, payload: CrimeHistoryCreate) -> CrimeHistory:
    ch = CrimeHistory(**payload.model_dump())
    db.add(ch)
    db.commit()
    db.refresh(ch)
    logger.info("CrimeHistory created: id=%d suspect_id=%d", ch.id, ch.suspect_id)
    return ch


def update_crime_history(db: Session, history_id: int, payload: CrimeHistoryUpdate) -> CrimeHistory:
    ch = get_crime_history(db, history_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(ch, field, value)
    db.commit()
    db.refresh(ch)
    return ch


def delete_crime_history(db: Session, history_id: int) -> None:
    ch = get_crime_history(db, history_id)
    db.delete(ch)
    db.commit()
    logger.info("CrimeHistory deleted: id=%d", history_id)
