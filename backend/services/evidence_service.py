from typing import Optional
import math
from sqlalchemy.orm import Session
from models.evidence import Evidence
from schemas.evidence import EvidenceCreate, EvidenceUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger

logger = get_logger(__name__)


def list_evidence(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    fir_id: Optional[int] = None,
) -> PaginatedResponse:
    q = db.query(Evidence)
    if fir_id:
        q = q.filter(Evidence.fir_id == fir_id)
    total = q.count()
    items = q.order_by(Evidence.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


def get_evidence(db: Session, evidence_id: int) -> Evidence:
    ev = db.get(Evidence, evidence_id)
    if not ev:
        raise NotFoundException("Evidence")
    return ev


def create_evidence(db: Session, payload: EvidenceCreate) -> Evidence:
    ev = Evidence(**payload.model_dump())
    db.add(ev)
    db.commit()
    db.refresh(ev)
    logger.info("Evidence created: id=%d title=%s", ev.id, ev.title)
    return ev


def update_evidence(db: Session, evidence_id: int, payload: EvidenceUpdate) -> Evidence:
    ev = get_evidence(db, evidence_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(ev, field, value)
    db.commit()
    db.refresh(ev)
    return ev


def delete_evidence(db: Session, evidence_id: int) -> None:
    ev = get_evidence(db, evidence_id)
    db.delete(ev)
    db.commit()
    logger.info("Evidence deleted: id=%d", evidence_id)
