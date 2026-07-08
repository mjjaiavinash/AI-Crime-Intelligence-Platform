from typing import Optional
import math
from sqlalchemy.orm import Session
from models.suspect import Suspect
from models.fir import FIR
from schemas.suspect import SuspectCreate, SuspectUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger

logger = get_logger(__name__)


def list_suspects(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    fir_id: Optional[int] = None,
    arrest_status: Optional[str] = None,
    threat_level: Optional[str] = None,
) -> PaginatedResponse:
    q = db.query(Suspect)
    if fir_id:
        q = q.filter(Suspect.fir_id == fir_id)
    if arrest_status:
        q = q.filter(Suspect.arrest_status == arrest_status)
    if threat_level:
        q = q.filter(Suspect.threat_level == threat_level)
    total = q.count()
    items = q.order_by(Suspect.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items, total=total, page=page,
        page_size=page_size, pages=math.ceil(total / page_size) if total else 0,
    )


def get_suspect(db: Session, suspect_id: int) -> Suspect:
    s = db.get(Suspect, suspect_id)
    if not s:
        raise NotFoundException("Suspect")
    return s


def create_suspect(db: Session, payload: SuspectCreate) -> Suspect:
    if not db.get(FIR, payload.fir_id):
        raise NotFoundException("FIR")
    s = Suspect(**payload.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    logger.info("Suspect created: id=%d fir_id=%d", s.id, s.fir_id)
    return s


def update_suspect(db: Session, suspect_id: int, payload: SuspectUpdate) -> Suspect:
    s = get_suspect(db, suspect_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    return s


def delete_suspect(db: Session, suspect_id: int) -> None:
    s = get_suspect(db, suspect_id)
    db.delete(s)
    db.commit()
    logger.info("Suspect deleted: id=%d", suspect_id)
