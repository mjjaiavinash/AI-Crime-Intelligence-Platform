from typing import Optional
import math
from sqlalchemy.orm import Session
from models.mobile_number import MobileNumber
from schemas.mobile_number import MobileNumberCreate, MobileNumberUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger

logger = get_logger(__name__)


def list_mobile_numbers(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    fir_id: Optional[int] = None,
    suspect_id: Optional[int] = None,
) -> PaginatedResponse:
    q = db.query(MobileNumber)
    if fir_id:
        q = q.filter(MobileNumber.fir_id == fir_id)
    if suspect_id:
        q = q.filter(MobileNumber.suspect_id == suspect_id)
    total = q.count()
    items = q.order_by(MobileNumber.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


def get_mobile_number(db: Session, number_id: int) -> MobileNumber:
    mn = db.get(MobileNumber, number_id)
    if not mn:
        raise NotFoundException("MobileNumber")
    return mn


def create_mobile_number(db: Session, payload: MobileNumberCreate) -> MobileNumber:
    mn = MobileNumber(**payload.model_dump())
    db.add(mn)
    db.commit()
    db.refresh(mn)
    logger.info("MobileNumber created: id=%d num=%s", mn.id, mn.mobile_number)
    return mn


def update_mobile_number(db: Session, number_id: int, payload: MobileNumberUpdate) -> MobileNumber:
    mn = get_mobile_number(db, number_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(mn, field, value)
    db.commit()
    db.refresh(mn)
    return mn


def delete_mobile_number(db: Session, number_id: int) -> None:
    mn = get_mobile_number(db, number_id)
    db.delete(mn)
    db.commit()
    logger.info("MobileNumber deleted: id=%d", number_id)
