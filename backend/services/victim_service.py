from typing import Optional
import math
from sqlalchemy.orm import Session
from models.victim import Victim
from models.fir import FIR
from schemas.victim import VictimCreate, VictimUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger
from ai.rag.sync import sync_victim, delete_victim as rag_delete_victim

logger = get_logger(__name__)


def list_victims(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    fir_id: Optional[int] = None,
) -> PaginatedResponse:
    q = db.query(Victim)
    if fir_id:
        q = q.filter(Victim.fir_id == fir_id)
    total = q.count()
    items = q.order_by(Victim.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items, total=total, page=page,
        page_size=page_size, pages=math.ceil(total / page_size) if total else 0,
    )


def get_victim(db: Session, victim_id: int) -> Victim:
    v = db.get(Victim, victim_id)
    if not v:
        raise NotFoundException("Victim")
    return v


def create_victim(db: Session, payload: VictimCreate) -> Victim:
    if not db.get(FIR, payload.fir_id):
        raise NotFoundException("FIR")
    v = Victim(**payload.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    logger.info("Victim created: id=%d fir_id=%d", v.id, v.fir_id)
    sync_victim(v)
    return v


def update_victim(db: Session, victim_id: int, payload: VictimUpdate) -> Victim:
    v = get_victim(db, victim_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    sync_victim(v)
    return v


def delete_victim(db: Session, victim_id: int) -> None:
    v = get_victim(db, victim_id)
    db.delete(v)
    db.commit()
    rag_delete_victim(victim_id)
    logger.info("Victim deleted: id=%d", victim_id)
