from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from models.crime import Crime
from schemas.crime import CrimeCreate, CrimeUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger
from ai.rag.sync import sync_crime, delete_crime as rag_delete_crime
import math

logger = get_logger(__name__)


def _base_query(db: Session):
    return db.query(Crime).options(
        joinedload(Crime.suspects),
        joinedload(Crime.evidence),
    )


def list_crimes(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    crime_type: Optional[str] = None,
    status: Optional[str] = None,
) -> PaginatedResponse:
    q = db.query(Crime)
    if crime_type:
        q = q.filter(Crime.crime_type == crime_type)
    if status:
        q = q.filter(Crime.status == status)

    total = q.count()
    items = q.order_by(Crime.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


def get_crime(db: Session, crime_id: int) -> Crime:
    crime = _base_query(db).filter(Crime.id == crime_id).first()
    if not crime:
        raise NotFoundException("Crime")
    return crime


def create_crime(db: Session, payload: CrimeCreate, reporter_id: int) -> Crime:
    crime = Crime(**payload.model_dump(), reported_by=reporter_id)
    db.add(crime)
    db.commit()
    db.refresh(crime)
    logger.info("Crime created: id=%d title=%r", crime.id, crime.title)
    sync_crime(crime)
    return crime


def update_crime(db: Session, crime_id: int, payload: CrimeUpdate) -> Crime:
    crime = get_crime(db, crime_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(crime, field, value)
    db.commit()
    db.refresh(crime)
    sync_crime(crime)
    return crime


def delete_crime(db: Session, crime_id: int) -> None:
    crime = get_crime(db, crime_id)
    db.delete(crime)
    db.commit()
    rag_delete_crime(crime_id)
    logger.info("Crime deleted: id=%d", crime_id)
