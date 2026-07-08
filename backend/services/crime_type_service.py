from typing import Optional
import math
from sqlalchemy.orm import Session
from models.crime_type import CrimeType
from schemas.crime_type import CrimeTypeCreate, CrimeTypeUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException, ConflictException
from core.logging import get_logger

logger = get_logger(__name__)


def list_crime_types(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
) -> PaginatedResponse:
    q = db.query(CrimeType)
    if category:
        q = q.filter(CrimeType.category == category)
    total = q.count()
    items = q.order_by(CrimeType.category, CrimeType.name).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items, total=total, page=page,
        page_size=page_size, pages=math.ceil(total / page_size) if total else 0,
    )


def get_crime_type(db: Session, crime_type_id: int) -> CrimeType:
    ct = db.get(CrimeType, crime_type_id)
    if not ct:
        raise NotFoundException("CrimeType")
    return ct


def create_crime_type(db: Session, payload: CrimeTypeCreate) -> CrimeType:
    if db.query(CrimeType).filter(CrimeType.name == payload.name).first():
        raise ConflictException("Crime type name already exists.")
    ct = CrimeType(**payload.model_dump())
    db.add(ct)
    db.commit()
    db.refresh(ct)
    logger.info("CrimeType created: id=%d name=%r", ct.id, ct.name)
    return ct


def update_crime_type(db: Session, crime_type_id: int, payload: CrimeTypeUpdate) -> CrimeType:
    ct = get_crime_type(db, crime_type_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(ct, field, value)
    db.commit()
    db.refresh(ct)
    return ct


def delete_crime_type(db: Session, crime_type_id: int) -> None:
    ct = get_crime_type(db, crime_type_id)
    db.delete(ct)
    db.commit()
    logger.info("CrimeType deleted: id=%d", crime_type_id)
