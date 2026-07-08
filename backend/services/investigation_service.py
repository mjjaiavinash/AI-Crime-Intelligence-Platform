from typing import Optional
import math
from sqlalchemy.orm import Session
from models.investigation import Investigation, InvestigationNote, InvestigationOfficer
from schemas.investigation import (
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationNoteCreate,
    InvestigationOfficerCreate,
)
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger

logger = get_logger(__name__)


def list_investigations(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    lead_officer_id: Optional[int] = None,
) -> PaginatedResponse:
    q = db.query(Investigation)
    if lead_officer_id:
        q = q.filter(Investigation.lead_officer_id == lead_officer_id)
    total = q.count()
    items = q.order_by(Investigation.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


def get_investigation(db: Session, investigation_id: int) -> Investigation:
    inv = db.get(Investigation, investigation_id)
    if not inv:
        raise NotFoundException("Investigation")
    return inv


def create_investigation(db: Session, payload: InvestigationCreate) -> Investigation:
    inv = Investigation(**payload.model_dump())
    db.add(inv)
    db.commit()
    db.refresh(inv)
    logger.info("Investigation created: id=%d fir_id=%d", inv.id, inv.fir_id)
    return inv


def update_investigation(db: Session, investigation_id: int, payload: InvestigationUpdate) -> Investigation:
    inv = get_investigation(db, investigation_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(inv, field, value)
    db.commit()
    db.refresh(inv)
    return inv


def delete_investigation(db: Session, investigation_id: int) -> None:
    inv = get_investigation(db, investigation_id)
    db.delete(inv)
    db.commit()
    logger.info("Investigation deleted: id=%d", investigation_id)


# ── Investigation Notes ───────────────────────────────────────────────────────
def add_investigation_note(db: Session, payload: InvestigationNoteCreate) -> InvestigationNote:
    note = InvestigationNote(**payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    logger.info("Investigation note added: id=%d inv_id=%d", note.id, note.investigation_id)
    return note


def list_investigation_notes(db: Session, investigation_id: int) -> list[InvestigationNote]:
    return (
        db.query(InvestigationNote)
        .filter(InvestigationNote.investigation_id == investigation_id)
        .order_by(InvestigationNote.created_at.asc())
        .all()
    )


# ── Investigation Officers ────────────────────────────────────────────────────
def assign_officer_to_investigation(
    db: Session, payload: InvestigationOfficerCreate
) -> InvestigationOfficer:
    io = InvestigationOfficer(**payload.model_dump())
    db.add(io)
    db.commit()
    db.refresh(io)
    logger.info("Officer assigned to investigation: officer_id=%d inv_id=%d", io.officer_id, io.investigation_id)
    return io
